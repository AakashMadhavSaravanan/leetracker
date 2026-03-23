import io
import base64
import re
from PIL import Image
import pytesseract
from fuzzywuzzy import fuzz

def verify_screenshot(base64_img: str, username: str, problem_title: str, token: str) -> bool:
    try:
        # Handle data URL prefix if present
        if ',' in base64_img:
            base64_img = base64_img.split(',', 1)[1]
            
        img_bytes = base64.b64decode(base64_img)
        img = Image.open(io.BytesIO(img_bytes))
        
        # Extract text via OCR
        extracted_text = pytesseract.image_to_string(img)
        
        # Normalization for matching
        norm_text = extracted_text.lower()
        
        # 1. Detect Username
        if username.lower() not in norm_text:
            return False
            
        # 2. Detect "Accepted" keyword
        if "accepted" not in norm_text:
            return False
            
        # 3. Detect token
        if token.lower() not in norm_text:
            return False
            
        # 4. Fuzzy match problem title >= 80%
        # Clean title spaces and lowercase
        title_lines = [line.strip().lower() for line in extracted_text.split('\n') if line.strip()]
        
        best_score = 0
        for line in title_lines:
            score = fuzz.partial_ratio(problem_title.lower(), line)
            if score > best_score:
                best_score = score
                
        if best_score < 80:
            return False
            
        return True
    except Exception as e:
        print(f"OCR Error: {str(e)}")
        # Any error in OCR layer fails the OCR check
        return False
