import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv('GEMINI_API_KEY')
print(f"Key loaded: {GOOGLE_API_KEY[:10]}...")

try:
    genai.configure(api_key=GOOGLE_API_KEY)
    
    # Try getting list of models
    print("Available models:")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
            
    # Try making a request to standard flash model        
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Say hello world")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
