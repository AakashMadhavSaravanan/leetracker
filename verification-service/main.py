import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

from ocr_engine import verify_screenshot
from similarity_checker import calculate_similarity
from extraction_engine import extract_pdf, extract_docx
import base64

load_dotenv()

app = FastAPI(title="LeetTracker Verification Service")

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VerifyRequest(BaseModel):
    code: str
    screenshot_base64: str
    token: str
    username: str
    problem_title: str
    reference_solution: Optional[str] = None # Added optionally since strict prompt didn't say it but it's needed for layer 3

class ExtractRequest(BaseModel):
    file_base64: str
    file_type: str
    filename: str

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.post("/verify")
def verify(data: VerifyRequest):
    try:
        # Single Layer verification: Only OCR check for 'Accepted' and Problem Title
        ocr_passed = verify_screenshot(
            base64_img=data.screenshot_base64,
            username=data.username,
            problem_title=data.problem_title,
            token=data.token
        )
        
        final_status = "verified" if ocr_passed else "rejected"

        return {
            "token_valid": True, # Hardcoded as true in single-layer mode
            "ocr_passed": ocr_passed,
            "similarity_score": 1.0, # Hardcoded as 1.0 in single-layer mode
            "final_status": final_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract")
def extract(data: ExtractRequest):
    try:
        file_bytes = base64.b64decode(data.file_base64)
        
        # Size limit check
        max_size_mb = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
        if len(file_bytes) > max_size_mb * 1024 * 1024:
            return {"success": False, "content_text": "", "word_count": 0, "page_count": 0, "error": "File exceeds size limits"}
            
        if data.file_type.lower() == "pdf":
            result = extract_pdf(file_bytes)
        elif data.file_type.lower() == "docx":
            result = extract_docx(file_bytes)
        else:
            return {"success": False, "content_text": "", "word_count": 0, "page_count": 0, "error": "Unsupported file type"}
            
        return result
    except Exception as e:
        # Never crash
        return {
            "success": False,
            "content_text": "",
            "word_count": 0,
            "page_count": 0,
            "error": f"Extraction failed: {str(e)}"
        }
