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
        norm_text = extracted_text.lower()
        print(f"DEBUG: OCR Extracted Text:\n{norm_text}\n{'='*30}")
        
        # 1. Detect 'Accepted' keyword (Fuzzy Match >= 80% to handle OCR noise)
        accepted_match_score = fuzz.partial_ratio("accepted", norm_text)
        print(f"DEBUG: 'Accepted' OCR match score: {accepted_match_score}")
        if accepted_match_score < 80:
            print(f"DEBUG: 'Accepted' status detection failed (Score: {accepted_match_score})")
            return False
            
        # 2. Fuzzy match problem title >= 70% to handle OCR noise and extra text
        title_lines = [line.strip().lower() for line in extracted_text.split('\n') if line.strip()]
        best_score = 0
        for line in title_lines:
            score = fuzz.ratio(problem_title.lower(), line)
            if score > best_score:
                best_score = score
                
        print(f"DEBUG: Problem title best match score: {best_score}")
        if best_score < 70:
            print(f"DEBUG: Problem title detection failed (Best Score: {best_score})")
            return False
            
        return True
    except Exception as e:
        print(f"DEBUG: Error during screenshot verification: {str(e)}")
        return False
