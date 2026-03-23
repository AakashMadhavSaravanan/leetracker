from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_similarity(student_code: str, reference_code: str) -> float:
    try:
        if not student_code or not reference_code:
            return 0.0
            
        # Basic preprocessing
        def preprocess(code):
            # remove extra whitespace matching structure somewhat
            import re
            code = re.sub(r'\s+', ' ', code.strip())
            return code
            
        corpus = [preprocess(student_code), preprocess(reference_code)]
        
        vectorizer = TfidfVectorizer(token_pattern=r'(?u)\b\w+\b|\S')
        tfidf_matrix = vectorizer.fit_transform(corpus)
        
        # Compute cosine similarity between student and reference
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        
        return float(similarity)
    except Exception as e:
        print(f"Similarity Calculation Error: {str(e)}")
        return 0.0
