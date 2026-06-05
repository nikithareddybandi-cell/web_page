from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Query, Header, Depends
from dotenv import load_dotenv
from pathlib import Path
import os

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import requests
import secrets
from bson import ObjectId

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configuration
JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY')
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "taxfile"
storage_key = None

# Password hashing utilities
def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

# JWT token utilities
def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# Storage utilities
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# Auth helper
async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user.pop("_id", None)
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str

class DocumentResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    original_filename: str
    storage_path: str
    content_type: str
    size: int
    filing_status: str
    uploaded_at: str
    is_deleted: bool

class StatusUpdate(BaseModel):
    status: str

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

# Create FastAPI app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Auth endpoints
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserRegister, response: Response):
    email = user_data.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    password_hash = hash_password(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": email,
        "password_hash": password_hash,
        "name": user_data.name,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    access_token = create_access_token(user_id, email, "user")
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(
        key="access_token", value=access_token, httponly=True,
        secure=False, samesite="lax", max_age=900, path="/"
    )
    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True,
        secure=False, samesite="lax", max_age=604800, path="/"
    )
    
    return UserResponse(**{k: v for k, v in user_doc.items() if k != "password_hash"})

@api_router.post("/auth/login", response_model=UserResponse)
async def login(credentials: UserLogin, request: Request, response: Response):
    email = credentials.email.lower()
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check brute force lockout
    client_ip = request.client.host
    identifier = f"{client_ip}:{email}"
    attempt_record = await db.login_attempts.find_one({"identifier": identifier})
    
    if attempt_record and attempt_record.get("locked_until"):
        locked_until = datetime.fromisoformat(attempt_record["locked_until"])
        if datetime.now(timezone.utc) < locked_until:
            remaining = int((locked_until - datetime.now(timezone.utc)).total_seconds() / 60)
            raise HTTPException(status_code=429, detail=f"Account locked. Try again in {remaining} minutes")
    
    if not verify_password(credentials.password, user["password_hash"]):
        # Increment failed attempts
        failed_count = attempt_record.get("failed_count", 0) + 1 if attempt_record else 1
        
        if failed_count >= 5:
            locked_until = datetime.now(timezone.utc) + timedelta(minutes=15)
            await db.login_attempts.update_one(
                {"identifier": identifier},
                {"$set": {"failed_count": failed_count, "locked_until": locked_until.isoformat()}},
                upsert=True
            )
            raise HTTPException(status_code=429, detail="Too many failed attempts. Account locked for 15 minutes")
        else:
            await db.login_attempts.update_one(
                {"identifier": identifier},
                {"$set": {"failed_count": failed_count}},
                upsert=True
            )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Clear failed attempts on successful login
    await db.login_attempts.delete_one({"identifier": identifier})
    
    access_token = create_access_token(user["id"], email, user["role"])
    refresh_token = create_refresh_token(user["id"])
    
    response.set_cookie(
        key="access_token", value=access_token, httponly=True,
        secure=False, samesite="lax", max_age=900, path="/"
    )
    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True,
        secure=False, samesite="lax", max_age=604800, path="/"
    )
    
    user.pop("_id", None)
    user.pop("password_hash", None)
    return UserResponse(**user)

@api_router.post("/auth/logout")
async def logout(response: Response, user: dict = Depends(get_current_user)):
    response.delete_cookie(key="access_token", path="/")
    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(**user)

@api_router.post("/auth/refresh")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token not found")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        access_token = create_access_token(user["id"], user["email"], user["role"])
        response.set_cookie(
            key="access_token", value=access_token, httponly=True,
            secure=False, samesite="lax", max_age=900, path="/"
        )
        return {"message": "Token refreshed"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPassword):
    email = data.email.lower()
    user = await db.users.find_one({"email": email})
    if not user:
        return {"message": "If the email exists, a reset link will be sent"}
    
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_reset_tokens.insert_one({
        "token": reset_token,
        "user_id": user["id"],
        "expires_at": expires_at,
        "used": False
    })
    
    reset_link = f"{os.environ.get('FRONTEND_URL')}/reset-password?token={reset_token}"
    logging.info(f"Password reset link: {reset_link}")
    
    return {"message": "If the email exists, a reset link will be sent"}

@api_router.post("/auth/reset-password")
async def reset_password(data: ResetPassword):
    token_doc = await db.password_reset_tokens.find_one({"token": data.token})
    
    if not token_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    if token_doc.get("used"):
        raise HTTPException(status_code=400, detail="Reset token already used")
    
    expires_at = token_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Reset token expired")
    
    new_hash = hash_password(data.new_password)
    await db.users.update_one(
        {"id": token_doc["user_id"]},
        {"$set": {"password_hash": new_hash}}
    )
    
    await db.password_reset_tokens.update_one(
        {"token": data.token},
        {"$set": {"used": True}}
    )
    
    return {"message": "Password reset successfully"}

# Document endpoints
@api_router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    allowed_extensions = ["pdf", "jpg", "jpeg", "png", "xlsx", "xls", "docx", "doc", "csv"]
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not allowed")
    
    doc_id = str(uuid.uuid4())
    storage_path = f"{APP_NAME}/uploads/{user['id']}/{doc_id}.{ext}"
    
    data = await file.read()
    result = put_object(storage_path, data, file.content_type or "application/octet-stream")
    
    doc_record = {
        "id": doc_id,
        "user_id": user["id"],
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type or "application/octet-stream",
        "size": result["size"],
        "filing_status": "pending",
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "is_deleted": False
    }
    
    await db.documents.insert_one(doc_record)
    doc_record.pop("_id", None)
    
    return DocumentResponse(**doc_record)

@api_router.get("/documents", response_model=List[DocumentResponse])
async def get_documents(user: dict = Depends(get_current_user)):
    query = {"is_deleted": False}
    if user["role"] != "admin":
        query["user_id"] = user["id"]
    
    docs = await db.documents.find(query, {"_id": 0}).sort("uploaded_at", -1).to_list(1000)
    return [DocumentResponse(**doc) for doc in docs]

@api_router.get("/documents/{doc_id}/download")
async def download_document(
    doc_id: str,
    request: Request,
    authorization: str = Header(None),
    auth: str = Query(None)
):
    # Support both header and query param auth
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]
    elif auth:
        token = auth
    else:
        token = request.cookies.get("access_token")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    doc = await db.documents.find_one({"id": doc_id, "is_deleted": False})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if user["role"] != "admin" and doc["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    data, content_type = get_object(doc["storage_path"])
    return Response(content=data, media_type=doc.get("content_type", content_type))

@api_router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, user: dict = Depends(get_current_user)):
    doc = await db.documents.find_one({"id": doc_id, "is_deleted": False})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if user["role"] != "admin" and doc["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    await db.documents.update_one(
        {"id": doc_id},
        {"$set": {"is_deleted": True}}
    )
    
    return {"message": "Document deleted successfully"}

# Admin endpoints
@api_router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(admin: dict = Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [UserResponse(**user) for user in users]

@api_router.patch("/admin/documents/{doc_id}/status")
async def update_document_status(doc_id: str, status_data: StatusUpdate, admin: dict = Depends(get_admin_user)):
    doc = await db.documents.find_one({"id": doc_id, "is_deleted": False})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    await db.documents.update_one(
        {"id": doc_id},
        {"$set": {"filing_status": status_data.status}}
    )
    
    return {"message": "Status updated successfully"}

@api_router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    total_users = await db.users.count_documents({"role": "user"})
    total_documents = await db.documents.count_documents({"is_deleted": False})
    pending_documents = await db.documents.count_documents({"filing_status": "pending", "is_deleted": False})
    completed_documents = await db.documents.count_documents({"filing_status": "completed", "is_deleted": False})
    
    return {
        "total_users": total_users,
        "total_documents": total_documents,
        "pending_documents": pending_documents,
        "completed_documents": completed_documents
    }

# Contact endpoint
@api_router.post("/contact")
async def submit_contact(message: ContactMessage):
    contact_doc = {
        "id": str(uuid.uuid4()),
        "name": message.name,
        "email": message.email,
        "phone": message.phone,
        "message": message.message,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.contact_messages.insert_one(contact_doc)
    logging.info(f"Contact message received from {message.email}")
    
    return {"message": "Thank you for contacting us. We'll get back to you soon."}

# Admin seeding and startup
async def seed_admin():
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@taxfile.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")
    
    existing = await db.users.find_one({"email": admin_email})
    
    if existing is None:
        admin_id = str(uuid.uuid4())
        hashed = hash_password(admin_password)
        await db.users.insert_one({
            "id": admin_id,
            "email": admin_email,
            "password_hash": hashed,
            "name": "Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        logging.info(f"Admin user created: {admin_email}")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}}
        )
        logging.info(f"Admin password updated: {admin_email}")
    
    # Write test credentials
    with open("/app/memory/test_credentials.md", "w") as f:
        f.write("# Test Credentials\n\n")
        f.write("## Admin Account\n")
        f.write(f"- Email: {admin_email}\n")
        f.write(f"- Password: {admin_password}\n")
        f.write(f"- Role: admin\n\n")
        f.write("## Auth Endpoints\n")
        f.write("- POST /api/auth/register\n")
        f.write("- POST /api/auth/login\n")
        f.write("- GET /api/auth/me\n")
        f.write("- POST /api/auth/logout\n")

@app.on_event("startup")
async def startup():
    try:
        # Initialize storage
        init_storage()
        logging.info("Storage initialized")
        
        # Create indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("id", unique=True)
        await db.documents.create_index("id", unique=True)
        await db.documents.create_index("user_id")
        await db.login_attempts.create_index("identifier")
        await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
        logging.info("Database indexes created")
        
        # Seed admin
        await seed_admin()
    except Exception as e:
        logging.error(f"Startup error: {e}")

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get('FRONTEND_URL', 'http://localhost:3000')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()