import datetime
import os
import uuid
from typing import Optional

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field, EmailStr

from database import get_db_connection


# -------------------------------------------------------------------
# Environment
# -------------------------------------------------------------------

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET")

if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET is not configured. "
        "Please add JWT_SECRET to backend/.env"
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


# -------------------------------------------------------------------
# Router
# -------------------------------------------------------------------

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)


# -------------------------------------------------------------------
# Swagger / Bearer Authentication
# -------------------------------------------------------------------

security = HTTPBearer()


# -------------------------------------------------------------------
# Pydantic Schemas
# -------------------------------------------------------------------

class UserRegister(BaseModel):
    fullName: str = Field(..., min_length=2)
    shopName: str = Field(..., min_length=2)
    email: EmailStr
    phone: str = Field(..., min_length=10)
    password: str = Field(..., min_length=6)
    confirmPassword: str = Field(..., min_length=6)
    preferredLanguage: Optional[str] = "en"


class UserLogin(BaseModel):
    usernameOrEmail: str
    password: str
    rememberMe: Optional[bool] = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    newPassword: str = Field(..., min_length=6)
    confirmPassword: str = Field(..., min_length=6)


class UpdateProfileRequest(BaseModel):
    fullName: Optional[str] = None
    shopName: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    preferredLanguage: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    currentPassword: str
    newPassword: str = Field(..., min_length=6)
    confirmPassword: str = Field(..., min_length=6)


# -------------------------------------------------------------------
# Password Helpers
# -------------------------------------------------------------------

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(
        password.encode("utf-8"),
        salt
    ).decode("utf-8")


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


# -------------------------------------------------------------------
# JWT Helper
# -------------------------------------------------------------------

def create_access_token(
    data: dict,
    expires_delta: Optional[datetime.timedelta] = None
) -> str:

    to_encode = data.copy()

    now = datetime.datetime.now(datetime.timezone.utc)

    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + datetime.timedelta(
            days=ACCESS_TOKEN_EXPIRE_DAYS
        )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# -------------------------------------------------------------------
# Get Current Authenticated User
# -------------------------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")
        shop_id = payload.get("shop_id")

        if not user_id or not shop_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={
                    "WWW-Authenticate": "Bearer"
                }
            )

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    conn = get_db_connection()

    try:
        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT *
            FROM users
            WHERE id = %s
              AND shop_id = %s
              AND is_active = 1
            """,
            (user_id, shop_id)
        )

        user_row = cursor.fetchone()

    finally:
        conn.close()

    if not user_row:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or disabled.",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    user = dict(user_row)

    # Never expose password hash
    user.pop("password_hash", None)

    return user


# ===================================================================
# REGISTER
# ===================================================================

@router.post(
    "/register",
    status_code=201
)
def register_user(req: UserRegister):

    if req.password != req.confirmPassword:

        raise HTTPException(
            status_code=400,
            detail="Password and confirm password do not match"
        )

    conn = get_db_connection()

    try:

        cursor = conn.cursor()

        # -----------------------------------------------------------
        # Check Email
        # -----------------------------------------------------------

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE LOWER(email) = LOWER(%s)
            """,
            (req.email,)
        )

        if cursor.fetchone():

            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists"
            )

        # -----------------------------------------------------------
        # Check Phone
        # -----------------------------------------------------------

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE phone = %s
            """,
            (req.phone,)
        )

        if cursor.fetchone():

            raise HTTPException(
                status_code=400,
                detail="An account with this phone number already exists"
            )

        # -----------------------------------------------------------
        # Generate IDs
        # -----------------------------------------------------------

        user_id = f"user-{uuid.uuid4().hex[:8]}"
        shop_id = f"shop-{uuid.uuid4().hex[:8]}"

        now = datetime.datetime.now(
            datetime.timezone.utc
        ).isoformat()

        hashed_password = get_password_hash(
            req.password
        )

        # -----------------------------------------------------------
        # Create User
        # -----------------------------------------------------------

        cursor.execute(
            """
            INSERT INTO users (
                id,
                full_name,
                shop_name,
                shop_id,
                email,
                phone,
                password_hash,
                preferred_language,
                role,
                is_active,
                onboarding_completed,
                created_at,
                updated_at,
                last_login_at
            )
            VALUES (
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                %s,
                'SHOP_OWNER',
                1,
                0,
                %s,
                %s,
                %s
            )
            """,
            (
                user_id,
                req.fullName,
                req.shopName,
                shop_id,
                req.email,
                req.phone,
                hashed_password,
                req.preferredLanguage or "en",
                now,
                now,
                now
            )
        )

        # -----------------------------------------------------------
        # Create User Settings
        # -----------------------------------------------------------

        cursor.execute(
            """
            INSERT INTO user_settings (
                shop_id,
                preferred_language,
                theme,
                updated_at
            )
            VALUES (
                %s,
                %s,
                'dark',
                %s
            )
            ON CONFLICT (shop_id)
            DO NOTHING
            """,
            (
                shop_id,
                req.preferredLanguage or "en",
                now
            )
        )

        conn.commit()

    except Exception:

        conn.rollback()
        raise

    finally:

        conn.close()

    # ---------------------------------------------------------------
    # JWT
    # ---------------------------------------------------------------

    token = create_access_token(
        {
            "sub": req.email,
            "user_id": user_id,
            "shop_id": shop_id,
            "role": "SHOP_OWNER"
        }
    )

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "fullName": req.fullName,
            "shopName": req.shopName,
            "shopId": shop_id,
            "email": req.email,
            "phone": req.phone,
            "preferredLanguage": req.preferredLanguage or "en",
            "role": "SHOP_OWNER",
            "onboardingCompleted": False
        },
        "message": "Account created successfully!"
    }


# ===================================================================
# LOGIN
# ===================================================================

@router.post("/login")
def login_user(req: UserLogin):

    conn = get_db_connection()

    try:

        cursor = conn.cursor()

        identifier = req.usernameOrEmail.strip()

        cursor.execute(
            """
            SELECT *
            FROM users
            WHERE (
                LOWER(email) = LOWER(%s)
                OR phone = %s
            )
            AND is_active = 1
            """,
            (
                identifier,
                identifier
            )
        )

        user_row = cursor.fetchone()

        if not user_row:

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )

        user = dict(user_row)

        if not verify_password(
            req.password,
            user["password_hash"]
        ):

            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )

        now = datetime.datetime.now(
            datetime.timezone.utc
        ).isoformat()

        cursor.execute(
            """
            UPDATE users
            SET last_login_at = %s
            WHERE id = %s
            """,
            (
                now,
                user["id"]
            )
        )

        conn.commit()

    except Exception:

        conn.rollback()
        raise

    finally:

        conn.close()

    token = create_access_token(
        {
            "sub": user["email"],
            "user_id": user["id"],
            "shop_id": user["shop_id"],
            "role": user["role"]
        }
    )

    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "fullName": user["full_name"],
            "shopName": user["shop_name"],
            "shopId": user["shop_id"],
            "email": user["email"],
            "phone": user["phone"],
            "preferredLanguage": user["preferred_language"],
            "role": user["role"],
            "onboardingCompleted": bool(
                user["onboarding_completed"]
            )
        }
    }


# ===================================================================
# GET CURRENT USER
# ===================================================================

@router.get("/me")
def get_me(
    current_user: dict = Depends(get_current_user)
):

    return {
        "id": current_user["id"],
        "fullName": current_user["full_name"],
        "shopName": current_user["shop_name"],
        "shopId": current_user["shop_id"],
        "email": current_user["email"],
        "phone": current_user["phone"],
        "preferredLanguage": current_user["preferred_language"],
        "role": current_user["role"],
        "onboardingCompleted": bool(
            current_user["onboarding_completed"]
        )
    }


# ===================================================================
# FORGOT PASSWORD
# ===================================================================

@router.post("/forgot-password")
def forgot_password(
    req: ForgotPasswordRequest
):

    conn = get_db_connection()

    try:

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE LOWER(email) = LOWER(%s)
            """,
            (req.email,)
        )

        user = cursor.fetchone()

        reset_token = None

        if user:

            reset_token = (
                f"rst-{uuid.uuid4().hex}"
            )

            now = datetime.datetime.now(
                datetime.timezone.utc
            )

            expires_at = (
                now + datetime.timedelta(hours=1)
            ).isoformat()

            reset_id = (
                f"pr-{uuid.uuid4().hex[:8]}"
            )

            cursor.execute(
                """
                INSERT INTO password_resets (
                    id,
                    user_id,
                    email,
                    token,
                    expires_at,
                    used
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    %s,
                    %s,
                    0
                )
                """,
                (
                    reset_id,
                    user["id"],
                    req.email,
                    reset_token,
                    expires_at
                )
            )

            conn.commit()

    except Exception:

        conn.rollback()
        raise

    finally:

        conn.close()

    response = {
        "success": True,
        "message": (
            "If an account exists for this email, "
            "password reset instructions have been sent."
        )
    }

    # Development only
    if reset_token:
        response["resetTokenDev"] = reset_token

    return response


# ===================================================================
# RESET PASSWORD
# ===================================================================

@router.post("/reset-password")
def reset_password(
    req: ResetPasswordRequest
):

    if req.newPassword != req.confirmPassword:

        raise HTTPException(
            status_code=400,
            detail="New password and confirm password do not match"
        )

    conn = get_db_connection()

    try:

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT *
            FROM password_resets
            WHERE token = %s
              AND used = 0
            """,
            (req.token,)
        )

        reset_row = cursor.fetchone()

        if not reset_row:

            raise HTTPException(
                status_code=400,
                detail="Invalid or expired password reset token"
            )

        reset_info = dict(reset_row)

        expires_at = reset_info["expires_at"]

        if isinstance(
            expires_at,
            str
        ):
            expires_at = datetime.datetime.fromisoformat(
                expires_at
            )

        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(
                tzinfo=datetime.timezone.utc
            )

        now = datetime.datetime.now(
            datetime.timezone.utc
        )

        if expires_at < now:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Password reset token has expired. "
                    "Please request a new link."
                )
            )

        now_str = now.isoformat()

        new_hash = get_password_hash(
            req.newPassword
        )

        cursor.execute(
            """
            UPDATE users
            SET password_hash = %s,
                updated_at = %s
            WHERE id = %s
            """,
            (
                new_hash,
                now_str,
                reset_info["user_id"]
            )
        )

        cursor.execute(
            """
            UPDATE password_resets
            SET used = 1
            WHERE id = %s
            """,
            (reset_info["id"],)
        )

        conn.commit()

    except Exception:

        conn.rollback()
        raise

    finally:

        conn.close()

    return {
        "success": True,
        "message": (
            "Password updated successfully. "
            "You can now log in with your new password."
        )
    }


# ===================================================================
# UPDATE PROFILE
# ===================================================================

@router.put("/profile")
def update_profile(
    req: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):

    conn = get_db_connection()

    try:

        cursor = conn.cursor()

        now = datetime.datetime.now(
            datetime.timezone.utc
        ).isoformat()

        new_name = (
            req.fullName
            if req.fullName is not None
            else current_user["full_name"]
        )

        new_shop = (
            req.shopName
            if req.shopName is not None
            else current_user["shop_name"]
        )

        new_phone = (
            req.phone
            if req.phone is not None
            else current_user["phone"]
        )

        new_email = (
            req.email
            if req.email is not None
            else current_user["email"]
        )

        new_lang = (
            req.preferredLanguage
            if req.preferredLanguage is not None
            else current_user["preferred_language"]
        )

        # -----------------------------------------------------------
        # Check duplicate email
        # -----------------------------------------------------------

        if new_email != current_user["email"]:

            cursor.execute(
                """
                SELECT id
                FROM users
                WHERE LOWER(email) = LOWER(%s)
                  AND id != %s
                """,
                (
                    new_email,
                    current_user["id"]
                )
            )

            if cursor.fetchone():

                raise HTTPException(
                    status_code=400,
                    detail="Email is already in use."
                )

        # -----------------------------------------------------------
        # Check duplicate phone
        # -----------------------------------------------------------

        if new_phone != current_user["phone"]:

            cursor.execute(
                """
                SELECT id
                FROM users
                WHERE phone = %s
                  AND id != %s
                """,
                (
                    new_phone,
                    current_user["id"]
                )
            )

            if cursor.fetchone():

                raise HTTPException(
                    status_code=400,
                    detail="Phone number is already in use."
                )

        # -----------------------------------------------------------
        # Update User
        # -----------------------------------------------------------

        cursor.execute(
            """
            UPDATE users
            SET full_name = %s,
                shop_name = %s,
                phone = %s,
                email = %s,
                preferred_language = %s,
                updated_at = %s
            WHERE id = %s
            """,
            (
                new_name,
                new_shop,
                new_phone,
                new_email,
                new_lang,
                now,
                current_user["id"]
            )
        )

        # -----------------------------------------------------------
        # Update Settings
        # -----------------------------------------------------------

        cursor.execute(
            """
            UPDATE user_settings
            SET preferred_language = %s,
                updated_at = %s
            WHERE shop_id = %s
            """,
            (
                new_lang,
                now,
                current_user["shop_id"]
            )
        )

        conn.commit()

    except Exception:

        conn.rollback()
        raise

    finally:

        conn.close()

    return {
        "success": True,
        "user": {
            "id": current_user["id"],
            "fullName": new_name,
            "shopName": new_shop,
            "shopId": current_user["shop_id"],
            "email": new_email,
            "phone": new_phone,
            "preferredLanguage": new_lang,
            "role": current_user["role"],
            "onboardingCompleted": bool(
                current_user["onboarding_completed"]
            )
        }
    }


# ===================================================================
# CHANGE PASSWORD
# ===================================================================

@router.post("/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user)
):

    if req.newPassword != req.confirmPassword:

        raise HTTPException(
            status_code=400,
            detail="New password and confirm password do not match"
        )

    conn = get_db_connection()

    try:

        cursor = conn.cursor()

        cursor.execute(
            """
            SELECT password_hash
            FROM users
            WHERE id = %s
            """,
            (current_user["id"],)
        )

        row = cursor.fetchone()

        if not row:

            raise HTTPException(
                status_code=404,
                detail="User account not found."
            )

        if not verify_password(
            req.currentPassword,
            row["password_hash"]
        ):

            raise HTTPException(
                status_code=400,
                detail="Current password entered is incorrect."
            )

        now = datetime.datetime.now(
            datetime.timezone.utc
        ).isoformat()

        new_hash = get_password_hash(
            req.newPassword
        )

        cursor.execute(
            """
            UPDATE users
            SET password_hash = %s,
                updated_at = %s
            WHERE id = %s
            """,
            (
                new_hash,
                now,
                current_user["id"]
            )
        )

        conn.commit()

    except Exception:

        conn.rollback()
        raise

    finally:

        conn.close()

    return {
        "success": True,
        "message": "Password changed successfully."
    }