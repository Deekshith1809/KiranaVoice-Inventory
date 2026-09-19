// Multilingual NLP Parser for Voice Inventory, Khata & Support Commands
// Supports English, Telugu, Hindi, and mixed code-switched dialects

export const SUPPORTED_UNITS = [
  'Pieces',
  'Kg',
  'Grams',
  'Litres',
  'Bags',
  'Cartons',
  'Boxes',
  'Dozens',
  'Quintals'
];

export const UNIT_ALIASES = {
  bags: 'Bags',
  bag: 'Bags',
  'బ్యాగులు': 'Bags',
  'బ్యాగ్': 'Bags',
  'बोरी': 'Bags',
  'बोरे': 'Bags',

  kg: 'Kg',
  kilo: 'Kg',
  kilograms: 'Kg',
  kilogram: 'Kg',
  'కేజీ': 'Kg',
  'కిలో': 'Kg',
  'किलो': 'Kg',

  grams: 'Grams',
  g: 'Grams',
  gram: 'Grams',
  'గ్రామ్స్': 'Grams',
  'ग्राम': 'Grams',

  litres: 'Litres',
  l: 'Litres',
  liter: 'Litres',
  litre: 'Litres',
  'లీటర్లు': 'Litres',
  'लीटर': 'Litres',

  cartons: 'Cartons',
  carton: 'Cartons',
  'కార్టన్లు': 'Cartons',
  'कार्टन': 'Cartons',

  boxes: 'Boxes',
  box: 'Boxes',
  'బాక్సులు': 'Boxes',
  'बॉक्स': 'Boxes',

  dozens: 'Dozens',
  doz: 'Dozens',
  dozen: 'Dozens',
  'డజన్లు': 'Dozens',
  'दर्जन': 'Dozens',

  quintals: 'Quintals',
  qtl: 'Quintals',
  quintal: 'Quintals',
  'క్వింటాళ్ళు': 'Quintals',
  'क्विंटल': 'Quintals',

  pieces: 'Pieces',
  pcs: 'Pieces',
  piece: 'Pieces',
  'పీసులు': 'Pieces',
  'పీస్': 'Pieces',
  'पीस': 'Pieces'
};

export const PRODUCT_ALIASES = {
  rice: 'Rice',
  'రైస్': 'Rice',
  'బియ్యం': 'Rice',
  'చావల్': 'Rice',
  'चावल': 'Rice',
  chawal: 'Rice',
  rais: 'Rice',

  sugar: 'Sugar',
  'చక్కెర': 'Sugar',
  'షుగర్': 'Sugar',
  'चीनी': 'Sugar',
  cheeni: 'Sugar',
  shugar: 'Sugar',

  biscuits: 'Biscuits',
  biscuit: 'Biscuits',
  'బిస్కెట్లు': 'Biscuits',
  'बिस्कुट': 'Biscuits',
  biskut: 'Biscuits',

  milk: 'Milk',
  'పాలు': 'Milk',
  'మిల్క్': 'Milk',
  'दूध': 'Milk',
  doodh: 'Milk',

  oil: 'Oil',
  'నూనె': 'Oil',
  'ఆయిల్': 'Oil',
  'तेल': 'Oil',
  tel: 'Oil'
};

export const PRESET_VOICE_COMMANDS = [
  {
    category: 'INVENTORY',
    lang: 'English',
    text: 'Add 20 bags of rice',
    badge: 'EN',
    description: 'Add inward stock in English'
  },
  {
    category: 'INVENTORY',
    lang: 'English',
    text: 'Remove 5 cartons of biscuits',
    badge: 'EN',
    description: 'Remove outward stock in English'
  },
  {
    category: 'INVENTORY',
    lang: 'Telugu',
    text: 'రైస్ 20 బ్యాగులు వచ్చాయి',
    badge: 'TE',
    description: 'Telugu script inward stock command'
  },
  {
    category: 'INVENTORY',
    lang: 'Mixed Telugish',
    text: 'Rice 20 bags vachayi',
    badge: 'TE-EN',
    description: 'Code-switched Telugu-English command'
  },
  {
    category: 'INVENTORY',
    lang: 'Hindi',
    text: '20 kilo chawal add karo',
    badge: 'HI',
    description: 'Hindi script / Hinglish inward stock'
  },
  {
    category: 'QUERY',
    lang: 'English',
    text: 'How much rice is available?',
    badge: 'QUERY',
    description: 'Stock availability question'
  },
  {
    category: 'QUERY',
    lang: 'Telugu/Mixed',
    text: 'Rice stock entha undi?',
    badge: 'TE-QUERY',
    description: 'Telugu stock check query'
  },
  {
    category: 'QUERY',
    lang: 'Hindi/Mixed',
    text: 'Which products are running low?',
    badge: 'ALERT-QUERY',
    description: 'Low stock items question'
  }
];

export function parseVoiceTranscript(
  transcript,
  catalog = [],
  customers = []
) {
  if (
    !transcript ||
    typeof transcript !== 'string'
  ) {
    return {
      intent: 'UNKNOWN',
      category: 'UNKNOWN',
      confidence: 0
    };
  }

  const cleanText =
    transcript.trim().toLowerCase();

  // =========================================================
  // SUPPORT
  // =========================================================

  if (
    cleanText.includes('need help') ||
    cleanText.includes('support chahiye') ||
    cleanText.includes('help me') ||
    cleanText.includes('సహాయం') ||
    cleanText.includes('మదద')
  ) {

    let issueCategory = 'Other';

    if (
      cleanText.includes('khata')
    ) {
      issueCategory =
        'Khata Problem';
    }

    if (
      cleanText.includes('inventory') ||
      cleanText.includes('stock')
    ) {
      issueCategory =
        'Inventory Problem';
    }

    if (
      cleanText.includes('voice') ||
      cleanText.includes('mic')
    ) {
      issueCategory =
        'Voice Recognition Problem';
    }

    return {
      rawTranscript: transcript,
      category: 'SUPPORT',
      intent: 'REQUEST_SUPPORT',
      issueCategory,
      requiresConfirmation: true,
      confidence: 0.96
    };
  }

  // =========================================================
  // INVENTORY QUESTIONS
  // =========================================================

  if (
    cleanText.includes('how much') ||
    cleanText.includes('how many') ||
    cleanText.includes('kitna') ||
    cleanText.includes('entha') ||
    cleanText.includes('count') ||
    cleanText.includes('available') ||
    cleanText.includes('ఎంత ఉంది') ||
    cleanText.includes('స్టాక్ ఉంది') ||
    cleanText.includes('స్టాక్ ఎంత') ||
    cleanText.includes('ఎంత స్టాక్')
  ) {

    const matchedProd =
      findMatchingProduct(
        cleanText,
        catalog
      );

    return {
      rawTranscript: transcript,
      category: 'INVENTORY_QUERY',
      intent: 'CHECK_STOCK',
      product:
        matchedProd
          ? matchedProd.name
          : 'Unknown Item',
      productId:
        matchedProd
          ? matchedProd.id
          : null,
      confidence: 0.95
    };
  }

  if (
    cleanText.includes('running low') ||
    cleanText.includes('low stock') ||
    cleanText.includes('thakkuva') ||
    cleanText.includes('reorder') ||
    cleanText.includes('తక్కువ') ||
    cleanText.includes('తక్కువ స్టాక్') ||
    cleanText.includes('low')
  ) {

    return {
      rawTranscript: transcript,
      category: 'INVENTORY_QUERY',
      intent: 'LOW_STOCK',
      confidence: 0.95
    };
  }

  if (
    cleanText.includes('show my inventory') ||
    cleanText.includes('what stock do i have') ||
    cleanText.includes('all stock')
  ) {

    return {
      rawTranscript: transcript,
      category: 'INVENTORY_QUERY',
      intent: 'CHECK_ALL_INVENTORY',
      confidence: 0.95
    };
  }

  // =========================================================
  // INVENTORY MUTATION
  // =========================================================

  let intent = 'UNKNOWN';

  // ADD STOCK

  if (
    cleanText.includes('add') ||
    cleanText.includes('came') ||
    cleanText.includes('received') ||
    cleanText.includes('receive') ||
    cleanText.includes('vachayi') ||
    cleanText.includes('vachindi') ||
    cleanText.includes('vachindhi') ||
    cleanText.includes('aaya') ||
    cleanText.includes('aayi') ||
    cleanText.includes('aa gaya') ||
    cleanText.includes('plus') ||
    cleanText.includes('వచ్చాయి') ||
    cleanText.includes('వచ్చింది') ||
    cleanText.includes('చేరింది') ||
    cleanText.includes('చేరాయి') ||
    cleanText.includes('లభించాయి') ||
    cleanText.includes('లభించింది')
  ) {

    intent = 'ADD_STOCK';

  }

  // REMOVE STOCK

  else if (
    cleanText.includes('remove') ||
    cleanText.includes('deduct') ||
    cleanText.includes('sell') ||
    cleanText.includes('sold') ||
    cleanText.includes('poyayi') ||
    cleanText.includes('poyindi') ||
    cleanText.includes('gaya') ||
    cleanText.includes('gayi') ||
    cleanText.includes('bika') ||
    cleanText.includes('nikal') ||
    cleanText.includes('అమ్మాము') ||
    cleanText.includes('అమ్మాను') ||
    cleanText.includes('తొలగించు') ||
    cleanText.includes('తీసివేయి') ||
    cleanText.includes('తగ్గించు') ||
    cleanText.includes('పోయింది')
  ) {

    intent = 'REMOVE_STOCK';
  }

  // =========================================================
  // QUANTITY
  // =========================================================

  const qtyMatch =
    cleanText.match(
      /\d+(?:\.\d+)?/
    );

  let quantity =
    qtyMatch
      ? parseFloat(qtyMatch[0])
      : null;

  if (!quantity) {

    const wordNums = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      ten: 10,
      twenty: 20,
      fifty: 50
    };

    for (
      const [word, value]
      of Object.entries(wordNums)
    ) {

      if (
        cleanText.includes(word)
      ) {
        quantity = value;
        break;
      }
    }
  }

  // =========================================================
  // UNIT
  // =========================================================

  let unit = null;

  const words =
    cleanText.split(/\s+/);

  for (
    const word of words
  ) {

    const cleanWord =
      word.replace(
        /[^a-zA-Z0-9\u0C00-\u0C7F\u0900-\u097F]/g,
        ''
      );

    if (
      UNIT_ALIASES[cleanWord]
    ) {
      unit =
        UNIT_ALIASES[cleanWord];

      break;
    }
  }

  // =========================================================
  // PRICE
  // =========================================================

  const priceMatch =
    cleanText.match(
      /at\s+(\d+(?:\.\d+)?)\s*(rupees|rs|₹)?/
    );

  const extractedPrice =
    priceMatch
      ? parseFloat(priceMatch[1])
      : null;

  // =========================================================
  // PRODUCT
  // =========================================================

  const matchedProd =
    findMatchingProduct(
      cleanText,
      catalog
    );

  let ambiguousMatches = [];

  if (
    !matchedProd &&
    catalog &&
    catalog.length > 0
  ) {

    ambiguousMatches =
      catalog
        .filter(
          p =>
            p.name
              .toLowerCase()
              .includes(
                cleanText.slice(0, 3)
              )
        )
        .map(
          p => p.name
        );
  }

  const finalUnit =
    unit ||
    (
      matchedProd
        ? matchedProd.unit
        : 'Pieces'
    );

  const finalProduct =
    matchedProd
      ? matchedProd.name
      : 'Unknown Item';

  return {
    rawTranscript: transcript,

    category: 'INVENTORY',

    intent,

    product: finalProduct,

    productId:
      matchedProd
        ? matchedProd.id
        : null,

    quantity:
      quantity ||
      (
        intent !== 'UNKNOWN'
          ? 1
          : null
      ),

    unit: finalUnit,

    price:
      extractedPrice ||
      (
        matchedProd
          ? matchedProd.price
          : null
      ),

    confidence:
      matchedProd &&
      intent !== 'UNKNOWN'
        ? 0.95
        : 0.45,

    requiresDisambiguation:
      !matchedProd &&
      ambiguousMatches.length > 0,

    ambiguousMatches,

    requiresConfirmation:
      intent === 'ADD_STOCK' ||
      intent === 'REMOVE_STOCK'
  };
}

function findMatchingProduct(
  cleanText,
  catalog = []
) {

  // Direct alias

  for (
    const [alias, stdName]
    of Object.entries(
      PRODUCT_ALIASES
    )
  ) {

    if (
      cleanText.includes(alias)
    ) {

      const match =
        catalog.find(
          p =>
            p.name
              .toLowerCase() ===
            stdName.toLowerCase()
        );

      if (match) {
        return match;
      }

      return {
        id: null,
        name: stdName,
        unit: 'Pieces',
        price: 0
      };
    }
  }

  // Catalog name

  for (
    const prod of catalog
  ) {

    if (
      cleanText.includes(
        prod.name.toLowerCase()
      )
    ) {
      return prod;
    }
  }

  return null;
}

function capitalize(str) {

  if (!str) {
    return '';
  }

  return (
    str.charAt(0).toUpperCase() +
    str.slice(1)
  );
}