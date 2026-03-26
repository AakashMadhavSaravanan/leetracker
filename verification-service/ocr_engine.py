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
        print(f"DEBUG: OCR Extracted Text:\n{norm_text}\n{'='*30}")
        
        # 1. Detect Username (Fuzzy Match >= 80% to handle OCR noise)
        user_match_score = fuzz.partial_ratio(username.lower(), norm_text)
        print(f"DEBUG: Username '{username}' OCR match score: {user_match_score}")
        if user_match_score < 80:
            print(f"DEBUG: Username detection failed (Score: {user_match_score})")
            return False
            
        # 2. Detect 'Accepted' keyword (Fuzzy Match >= 80%)
        accepted_match_score = fuzz.partial_ratio("accepted", norm_text)
        print(f"DEBUG: 'Accepted' OCR match score: {accepted_match_score}")
        if accepted_match_score < 80:
            print(f"DEBUG: 'Accepted' status detection failed (Score: {accepted_match_score})")
            return False
            
        # 3. Detect token (Strictish)
        if token.lower() not in norm_text:
            print(f"DEBUG: Token '{token}' not found in OCR text.")
            return False
            
        # 4. Fuzzy match problem title >= 80%
        # Clean title spaces and lowercase
        title_lines = [line.strip().lower() for line in extracted_text.split('\n') if line.strip()]
        
        best_score = 0
        for line in title_lines:
            score = fuzz.partial_ratio(problem_title.lower(), line)
            if score > best_score:
                best_score = score
                
        print(f"DEBUG: Problem title best match score: {best_score}")
        if best_score < 70: # Lowered from 80 for better robustness
            print(f"DEBUG: Problem title detection failed (Best Score: {best_score})")
            return False
            
        return True
    except Exception as e:
        print(f"OCR Error: {str(e)}")
        # Any error in OCR layer fails the OCR check
        return False
