import datetime
import uuid
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from rapidfuzz import process, fuzz

from database import get_db_connection
from auth import router as auth_router, get_current_user

app = FastAPI(title="Voice Inventory Management API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}

# Optional helper to resolve shop_id from authenticated token or default fallback
def resolve_shop_id(current_user: Optional[dict] = None, shop_id_param: Optional[str] = None) -> str:
    if current_user and "shop_id" in current_user:
        return current_user["shop_id"]
    return shop_id_param or "shop-001"

# -------------------------------------------------------------------
# Pydantic Schemas
# -------------------------------------------------------------------

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1)
    category: str = "General"
    quantity: float = Field(0, ge=0)
    unit: str = "Pieces"
    price: float = Field(0, ge=0)
    reorderLevel: float = Field(5, ge=0)
    shop_id: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    price: Optional[float] = None
    reorderLevel: Optional[float] = None
    shop_id: Optional[str] = None

class StockAdjustment(BaseModel):
    productId: str
    quantity: float = Field(..., gt=0)
    unit: Optional[str] = None
    source: Optional[str] = "MANUAL"
    shop_id: Optional[str] = None

class VoiceProcessRequest(BaseModel):
    transcript: str
    language: Optional[str] = "en"
    shop_id: Optional[str] = None

class VoiceQueryRequest(BaseModel):
    query: str
    language: Optional[str] = "en"
    shop_id: Optional[str] = None

class LanguageUpdate(BaseModel):
    language: str
    shop_id: Optional[str] = None

# Unit Normalization Map
UNIT_MAP = {
    'bags': 'Bags', 'bag': 'Bags', 'బ్యాగులు': 'Bags', 'బ్యాగ్': 'Bags', 'बोरी': 'Bags', 'बोरे': 'Bags',
    'kg': 'Kg', 'kilo': 'Kg', 'kilograms': 'Kg', 'kilogram': 'Kg', 'కేజీ': 'Kg', 'కిలో': 'Kg', 'किलो': 'Kg',
    'grams': 'Grams', 'g': 'Grams', 'గ్రామ్స్': 'Grams', 'ग्राम': 'Grams',
    'litres': 'Litres', 'l': 'Litres', 'liter': 'Litres', 'litre': 'Litres', 'లీటర్లు': 'Litres', 'लीटर': 'Litres',
    'cartons': 'Cartons', 'carton': 'Cartons', 'కార్టన్లు': 'Cartons', 'कार्टन': 'Cartons',
    'boxes': 'Boxes', 'box': 'Boxes', 'బాక్సులు': 'Boxes', 'बॉक्स': 'Boxes',
    'dozens': 'Dozens', 'doz': 'Dozens', 'dozen': 'Dozens', 'డజన్లు': 'Dozens', 'दर्जन': 'Dozens',
    'quintals': 'Quintals', 'qtl': 'Quintals', 'quintal': 'Quintals', 'క్వింటాళ్ళు': 'Quintals', 'क्विंटल': 'Quintals',
    'pieces': 'Pieces', 'pcs': 'Pieces', 'piece': 'Pieces', 'పీసులు': 'Pieces', 'पीस': 'Pieces'
}

PRODUCT_ALIASES = {
    'rice': 'Rice', 'రైస్': 'Rice', 'బియ్యం': 'Rice', 'చావల్': 'Rice', 'चावल': 'Rice', 'chawal': 'Rice', 'rais': 'Rice',
    'sugar': 'Sugar', 'చక్కెర': 'Sugar', 'షుగర్': 'Sugar', 'चीनी': 'Sugar', 'cheeni': 'Sugar', 'shugar': 'Sugar',
    'biscuits': 'Biscuits', 'biscuit': 'Biscuits', 'బిస్కెట్లు': 'Biscuits', 'बिस्कुट': 'Biscuits', 'biskut': 'Biscuits',
    'milk': 'Milk', 'పాలు': 'Milk', 'మిల్క్': 'Milk', 'दूध': 'Milk', 'doodh': 'Milk',
    'oil': 'Oil', 'నూనె': 'Oil', 'ఆయిల్': 'Oil', 'तेल': 'Oil', 'tel': 'Oil'
}

# -------------------------------------------------------------------
# Product Endpoints (Shop Isolated)
# -------------------------------------------------------------------

@app.get("/api/products")
def get_products(shop_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM products WHERE shop_id = %s AND is_deleted = 0 ORDER BY created_at DESC",
        (target_shop,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    products = []
    for r in rows:
        p = dict(r)
        p["reorderLevel"] = p.pop("reorder_level")
        p["stockValue"] = p["quantity"] * p["price"]
        products.append(p)
    return products

@app.get("/api/products/{product_id}")
def get_product(product_id: str, shop_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM products WHERE id = %s AND shop_id = %s AND is_deleted = 0",
        (product_id, target_shop)
    )
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    p = dict(row)
    p["reorderLevel"] = p.pop("reorder_level")
    p["stockValue"] = p["quantity"] * p["price"]
    return p

@app.post("/api/products", status_code=201)
@app.post("/api/products/create")
def create_product(prod: ProductCreate, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    
    prod_id = f"prod-{uuid.uuid4().hex[:8]}"
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    cursor.execute("""
    INSERT INTO products (id, shop_id, name, category, quantity, unit, price, reorder_level, created_at, updated_at, is_deleted)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 0)
    """, (prod_id, target_shop, prod.name, prod.category, prod.quantity, prod.unit, prod.price, prod.reorderLevel, now, now))
    
    if prod.quantity > 0:
        tx_id = f"tx-{uuid.uuid4().hex[:8]}"
        cursor.execute("""
        INSERT INTO inventory_transactions (id, shop_id, product_id, product_name, type, quantity, unit, price, source, created_at)
        VALUES (%s, %s, %s, %s, 'IN', %s, %s, %s, 'MANUAL', %s)
        """, (tx_id, target_shop, prod_id, prod.name, prod.quantity, prod.unit, prod.price, now))
        
    conn.commit()
    conn.close()
    
    return {
        "id": prod_id,
        "shop_id": target_shop,
        "name": prod.name,
        "category": prod.category,
        "quantity": prod.quantity,
        "unit": prod.unit,
        "price": prod.price,
        "reorderLevel": prod.reorderLevel,
        "stockValue": prod.quantity * prod.price,
        "createdAt": now,
        "updatedAt": now
    }

@app.put("/api/products/{product_id}")
def update_product(product_id: str, prod: ProductUpdate, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM products WHERE id = %s AND shop_id = %s AND is_deleted = 0", (product_id, target_shop))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")
    
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    new_name = prod.name if prod.name is not None else existing["name"]
    new_cat = prod.category if prod.category is not None else existing["category"]
    new_unit = prod.unit if prod.unit is not None else existing["unit"]
    new_price = prod.price if prod.price is not None else existing["price"]
    new_reorder = prod.reorderLevel if prod.reorderLevel is not None else existing["reorder_level"]
    
    cursor.execute("""
    UPDATE products
    SET name = %s, category = %s, unit = %s, price = %s, reorder_level = %s, updated_at = %s
    WHERE id = %s AND shop_id = %s
    """, (new_name, new_cat, new_unit, new_price, new_reorder, now, product_id, target_shop))
    
    conn.commit()
    conn.close()
    
    return {
        "id": product_id,
        "name": new_name,
        "category": new_cat,
        "unit": new_unit,
        "price": new_price,
        "reorderLevel": new_reorder,
        "updatedAt": now
    }

@app.delete("/api/products/{product_id}")
def delete_product(product_id: str, shop_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM products WHERE id = %s AND shop_id = %s AND is_deleted = 0", (product_id, target_shop))
    existing = cursor.fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found")
        
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    cursor.execute("UPDATE products SET is_deleted = 1, updated_at = %s WHERE id = %s", (now, product_id))
    conn.commit()
    conn.close()
    return {"success": True, "message": f"Product '{existing['name']}' deleted successfully"}

# -------------------------------------------------------------------
# Stock Operations & Transactions (Shop Isolated)
# -------------------------------------------------------------------

@app.post("/api/inventory/add")
def add_stock(adj: StockAdjustment, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT * FROM products 
    WHERE (id = %s OR LOWER(name) = LOWER(%s)) AND shop_id = %s AND is_deleted = 0
    """, (adj.productId, adj.productId, target_shop))
    product = cursor.fetchone()
    
    if not product:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found in catalog")
        
    current_qty = product["quantity"]
    new_qty = current_qty + adj.quantity
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    cursor.execute("UPDATE products SET quantity = %s, updated_at = %s WHERE id = %s", (new_qty, now, product["id"]))
    
    tx_id = f"tx-{uuid.uuid4().hex[:8]}"
    unit = adj.unit or product["unit"]
    cursor.execute("""
    INSERT INTO inventory_transactions (id, shop_id, product_id, product_name, type, quantity, unit, price, source, created_at)
    VALUES (%s, %s, %s, %s, 'IN', %s, %s, %s, %s, %s)
    """, (tx_id, target_shop, product["id"], product["name"], adj.quantity, unit, product["price"], adj.source, now))
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "productId": product["id"],
        "productName": product["name"],
        "previousQuantity": current_qty,
        "addedQuantity": adj.quantity,
        "newQuantity": new_qty,
        "unit": unit,
        "message": f"Added {adj.quantity} {unit} of {product['name']}. New stock: {new_qty} {unit}."
    }

@app.post("/api/inventory/remove")
def remove_stock(adj: StockAdjustment, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
    SELECT * FROM products 
    WHERE (id = %s OR LOWER(name) = LOWER(%s)) AND shop_id = %s AND is_deleted = 0
    """, (adj.productId, adj.productId, target_shop))
    product = cursor.fetchone()
    
    if not product:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found in catalog")
        
    current_qty = product["quantity"]
    if current_qty < adj.quantity:
        conn.close()
        unit = product["unit"]
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient stock. Available: {current_qty} {unit}, Requested: {adj.quantity} {unit}."
        )
        
    new_qty = current_qty - adj.quantity
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    cursor.execute("UPDATE products SET quantity = %s, updated_at = %s WHERE id = %s", (new_qty, now, product["id"]))
    
    tx_id = f"tx-{uuid.uuid4().hex[:8]}"
    unit = adj.unit or product["unit"]
    cursor.execute("""
    INSERT INTO inventory_transactions (id, shop_id, product_id, product_name, type, quantity, unit, price, source, created_at)
    VALUES (%s, %s, %s, %s, 'OUT', %s, %s, %s, %s, %s)
    """, (tx_id, target_shop, product["id"], product["name"], adj.quantity, unit, product["price"], adj.source, now))
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "productId": product["id"],
        "productName": product["name"],
        "previousQuantity": current_qty,
        "removedQuantity": adj.quantity,
        "newQuantity": new_qty,
        "unit": unit,
        "message": f"Removed {adj.quantity} {unit} of {product['name']}. New stock: {new_qty} {unit}."
    }

@app.get("/api/inventory/transactions")
def get_transactions(shop_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM inventory_transactions WHERE shop_id = %s ORDER BY created_at DESC",
        (target_shop,)
    )
    rows = cursor.fetchall()
    conn.close()
    
    txs = []
    for r in rows:
        t = dict(r)
        t["productId"] = t.pop("product_id")
        t["productName"] = t.pop("product_name")
        t["createdAt"] = t.pop("created_at")
        txs.append(t)
    return txs

@app.get("/api/inventory/low-stock")
def get_low_stock(shop_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM products 
    WHERE shop_id = %s AND is_deleted = 0 AND quantity > 0 AND quantity <= reorder_level
    """, (target_shop,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/inventory/out-of-stock")
def get_out_of_stock(shop_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM products 
    WHERE shop_id = %s AND is_deleted = 0 AND quantity = 0
    """, (target_shop,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@app.get("/api/inventory/reorder")
def get_reorder_suggestions(shop_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT * FROM products 
    WHERE shop_id = %s AND is_deleted = 0 AND quantity <= reorder_level
    """, (target_shop,))
    rows = cursor.fetchall()
    conn.close()
    
    reorders = []
    for r in rows:
        p = dict(r)
        target_stock = max(p["reorder_level"] * 2, 20.0)
        suggested = target_stock - p["quantity"]
        reorders.append({
            "productId": p["id"],
            "productName": p["name"],
            "currentQuantity": p["quantity"],
            "unit": p["unit"],
            "reorderLevel": p["reorder_level"],
            "targetStock": target_stock,
            "suggestedReorder": suggested
        })
    return reorders

# -------------------------------------------------------------------
# Voice & NLP Processing Endpoints (Shop Isolated)
# -------------------------------------------------------------------

@app.post("/api/voice/process")
def process_voice_command(req: VoiceProcessRequest, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    transcript = req.transcript.strip()
    clean_text = transcript.lower()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, unit, price FROM products WHERE shop_id = %s AND is_deleted = 0", (target_shop,))
    catalog_rows = cursor.fetchall()
    conn.close()
    
    catalog_names = [r["name"] for r in catalog_rows]
    
    # Intent detection for English, Telugu, Hindi, and common mixed-language commands.
    intent = "UNKNOWN"

    add_keywords = [
        # English
        "add", "added", "receive", "received", "incoming", "in stock",
        "plus", "increase", "restock",
        # Telugu / transliterated Telugu
        "vachayi", "vachindi", "vachindhi", "vacchayi", "vacchindi",
        "vachina", "cherindi", "cherayi", "పెంచు", "పెంచండి",
        "వచ్చాయి", "వచ్చింది", "వచ్చాయి", "వచ్చిన", "చేరింది", "చేరాయి",
        "లభించాయి", "లభించింది", "స్టాక్ వచ్చింది",
        # Hindi / transliterated Hindi
        "aaya", "aayi", "aaye", "aaya hai", "aayi hai", "mil gaya",
        "mil gaye", "jod", "jodna", "badhao", "बढ़ाओ", "बढ़ाएं",
        "आया", "आई", "आए", "मिल गया", "मिल गए", "जोड़ो"
    ]

    remove_keywords = [
        # English
        "remove", "deduct", "sell", "sold", "out", "decrease",
        "subtract", "dispatch", "issued",
        # Telugu / transliterated Telugu
        "poyayi", "poyindi", "poyindhi", "vellayi", "ammamu",
        "అమ్మాము", "అమ్మాం", "తీసివేయి", "తీసివేయండి",
        "తగ్గించు", "తగ్గించండి", "పోయాయి", "పోయింది", "వెళ్లాయి",
        # Hindi / transliterated Hindi
        "gaya", "gayi", "gaye", "bika", "bik gaya", "nikal gaya",
        "ghatao", "ghata", "हटा", "हटाओ", "बेचा", "बेच दिया",
        "गया", "गई", "गए"
    ]

    check_stock_keywords = [
        # English
        "how much", "how many", "available", "availability",
        "in stock", "stock", "quantity", "how much stock",
        # Telugu / transliterated Telugu
        "kitna", "entha", "ఎంత ఉంది", "ఎంత స్టాక్", "స్టాక్ ఎంత",
        "ఎన్ని ఉన్నాయి", "ఉన్నాయా", "ఎంత",
        # Hindi
        "कितना", "कितने", "कितनी", "स्टॉक कितना", "कितना स्टॉक"
    ]

    low_stock_keywords = [
        "low stock", "running low", "thakkuva", "తక్కువ",
        "తక్కువ స్టాక్", "स्टॉक कम", "कम स्टॉक"
    ]

    reorder_keywords = [
        "reorder", "re-order", "order", "purchase",
        "కొనుగోలు", "మళ్లీ కొనాలి", "మళ్ళీ కొనాలి",
        "फिर से खरीद", "दोबारा खरीद"
    ]

    if any(k in clean_text for k in add_keywords):
        intent = "ADD_STOCK"
    elif any(k in clean_text for k in remove_keywords):
        intent = "REMOVE_STOCK"
    elif any(k in clean_text for k in check_stock_keywords):
        intent = "CHECK_STOCK"
    elif any(k in clean_text for k in low_stock_keywords):
        intent = "LOW_STOCK"
    elif any(k in clean_text for k in reorder_keywords):
        intent = "REORDER"

    import re

    # Extract numeric quantity, preferably when it appears with a known unit.
    quantity = None

    quantity_unit_pattern = (
        r'\b(\d+(?:\.\d+)?)\s*'
        r'(kg|kgs|kilo|kilos|kilogram|kilograms|g|gram|grams|'
        r'l|liter|liters|litre|litres|ml|'
        r'bag|bags|box|boxes|carton|cartons|'
        r'dozen|dozens|piece|pieces|pcs|'
        r'quintal|quintals|qtl|'
        r'बोरी|बोरे|किलो|ग्राम|लीटर|कार्टन|बॉक्स|दर्जन|पीस|'
        r'బ్యాగ్|బ్యాగులు|కేజీ|కిలో|గ్రామ్స్|లీటర్లు|కార్టన్|బాక్సులు|డజన్లు|పీసులు)'
        r'\b'
    )

    qty_match = re.search(quantity_unit_pattern, clean_text)
    if qty_match:
        quantity = float(qty_match.group(1))
    else:
        # Fallback: use the first standalone number in the command.
        qty_match = re.search(r'\b(\d+(?:\.\d+)?)\b', clean_text)
        if qty_match:
            quantity = float(qty_match.group(1))

    word_nums = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'ten': 10, 'twenty': 20, 'fifty': 50}
    if not quantity:
        for w, val in word_nums.items():
            if w in clean_text:
                quantity = float(val)
                break

    extracted_unit = None
    for token in clean_text.split():
        token_clean = re.sub(r'[^a-zA-Z0-9\u0C00-\u0C7F\u0900-\u097F]', '', token)
        if token_clean in UNIT_MAP:
            extracted_unit = UNIT_MAP[token_clean]
            break

    matched_product_name = None
    matched_product_id = None
    confidence = 0.0
    ambiguous_matches = []

    for alias, std_name in PRODUCT_ALIASES.items():
        if alias in clean_text:
            matched_product_name = std_name
            confidence = 0.95
            break
            
    if not matched_product_name and catalog_names:
        best_match = process.extractOne(clean_text, catalog_names, scorer=fuzz.partial_ratio)
        if best_match:
            match_name, score, _ = best_match
            if score >= 70:
                matched_product_name = match_name
                confidence = round(score / 100.0, 2)
            elif score >= 50:
                matches = process.extract(clean_text, catalog_names, limit=3, scorer=fuzz.partial_ratio)
                ambiguous_matches = [m[0] for m in matches if m[1] >= 40]

    product_rec = None
    if matched_product_name:
        for r in catalog_rows:
            if r["name"].lower() == matched_product_name.lower():
                product_rec = r
                matched_product_id = r["id"]
                if not extracted_unit:
                    extracted_unit = r["unit"]
                break

    price_match = re.search(
        r'\bat\s+(\d+(?:\.\d+)?)\s*(rupees|rs|₹)\b',
        clean_text
    )
    extracted_price = float(price_match.group(1)) if price_match else None

    return {
        "rawTranscript": transcript,
        "intent": intent,
        "product": matched_product_name or "Unknown Item",
        "productId": matched_product_id,
        "quantity": quantity or (1.0 if intent in ["ADD_STOCK", "REMOVE_STOCK"] else None),
        "unit": extracted_unit or (product_rec["unit"] if product_rec else "Pieces"),
        "price": extracted_price or (product_rec["price"] if product_rec else None),
        "confidence": confidence,
        "requiresDisambiguation": len(ambiguous_matches) > 0 and not matched_product_name,
        "ambiguousMatches": ambiguous_matches,
        "requiresConfirmation": intent in ["ADD_STOCK", "REMOVE_STOCK"]
    }

@app.post("/api/voice/query")
def query_voice_inventory(req: VoiceQueryRequest, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    clean_text = req.query.strip().lower()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if "low" in clean_text or "thakkuva" in clean_text:
        cursor.execute("SELECT name, quantity, unit FROM products WHERE shop_id = %s AND is_deleted = 0 AND quantity <= reorder_level", (target_shop,))
        rows = cursor.fetchall()
        conn.close()
        items = [f"{r['name']} ({r['quantity']} {r['unit']})" for r in rows]
        msg = f"Low stock items: {', '.join(items)}." if items else "All inventory items have healthy stock levels."
        return {"query": req.query, "type": "LOW_STOCK", "response": msg}
        
    cursor.execute("SELECT name, quantity, unit FROM products WHERE shop_id = %s AND is_deleted = 0", (target_shop,))
    rows = cursor.fetchall()
    conn.close()
    
    found_item = None
    for r in rows:
        if r["name"].lower() in clean_text:
            found_item = r
            break
            
    if found_item:
        msg = f"{found_item['name']} has {found_item['quantity']} {found_item['unit']} in stock."
        return {"query": req.query, "type": "CHECK_STOCK", "product": found_item["name"], "quantity": found_item["quantity"], "unit": found_item["unit"], "response": msg}
        
    summary_items = [f"{r['name']}: {r['quantity']} {r['unit']}" for r in rows[:5]]
    msg = f"Current Stock Summary: {', '.join(summary_items)}."
    return {"query": req.query, "type": "INVENTORY_SUMMARY", "response": msg}

# -------------------------------------------------------------------
# Settings Endpoints (Shop Isolated)
# -------------------------------------------------------------------

@app.get("/api/settings/language")
def get_language(shop_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT preferred_language FROM user_settings WHERE shop_id = %s", (target_shop,))
    row = cursor.fetchone()
    conn.close()
    return {"language": row["preferred_language"] if row else "en"}

@app.put("/api/settings/language")
def update_language(lang_data: LanguageUpdate, current_user: dict = Depends(get_current_user)):
    target_shop = current_user["shop_id"]

    conn = get_db_connection()
    cursor = conn.cursor()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    cursor.execute("""
    INSERT INTO user_settings (shop_id, preferred_language, theme, updated_at)
    VALUES (%s, %s, 'dark', %s)
    ON CONFLICT(shop_id) DO UPDATE SET preferred_language = excluded.preferred_language, updated_at = excluded.updated_at
    """, (target_shop, lang_data.language, now))
    
    conn.commit()
    conn.close()
    return {"success": True, "language": lang_data.language}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)