# api/auth.py
import os
import jwt
from dotenv import load_dotenv
from fastapi import Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

load_dotenv()


SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

security_optional = HTTPBearer(auto_error=False)
def get_current_user_email(credentials: HTTPAuthorizationCredentials = Security(security_optional)):
    if not credentials:
        return None 
     
    token = credentials.credentials
    try:  # Verification 
        decoded_token = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})       
        return decoded_token.get("email")
    except Exception:        
        return None  # return None on expired/invalid tokens for the chat
