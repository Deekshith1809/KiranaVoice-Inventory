import os
import datetime
from typing import List, Dict, Any, Optional

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from passlib.context import CryptContext


# -------------------------------------------------------------------
# Environment Configuration
# -------------------------------------------------------------------

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. "
        "Please add DATABASE_URL to backend/.env"
    )


# -------------------------------------------------------------------
# Password Configuration
# -------------------------------------------------------------------

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# -------------------------------------------------------------------
# Database Connection
# -------------------------------------------------------------------

def get_db_connection():
    """
    Create a PostgreSQL database connection.

    RealDictCursor allows query results to be accessed like dictionaries:
        row["id"]
        row["email"]
        row["shop_id"]
    """

    return psycopg2.connect(
        DATABASE_URL,
        cursor_factory=RealDictCursor
    )