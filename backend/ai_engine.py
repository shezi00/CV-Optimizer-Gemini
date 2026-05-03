import json
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

# 1. Load the key from your environment
load_dotenv()
MY_API_KEY = os.getenv("GEMINI_API_KEY") or "your key here"

def analyze_cv_with_ai(cv_text, job_desc, api_key=None):
    # Use the passed key, otherwise fall back to the global one
    active_key = api_key or MY_API_KEY
    
    # 2. Initialize the Gemini 3.0 Model via LangChain
    llm = ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview", 
        google_api_key=active_key,
        temperature=1.0  # Gemini 3.0 works best with higher temp for 'thinking'
    )
    
    prompt = f"""
    You are an expert ATS (Applicant Tracking System).
    Compare the following CV with the Job Description.
    
    JOB DESCRIPTION:
    {job_desc}
    
    CV TEXT:
    {cv_text}
    
    Return ONLY a valid JSON object with:
    {{
      "ats_score": (Integer 0-100),
      "keyword_gaps": [],
      "suggestions": "",
      "improved_bullets": []
    }}
    """
    
    try:
        response = llm.invoke(prompt)
        
        # 1. Handle Gemini 3.0 returning a list or a string
        if isinstance(response.content, list):
            # Extract text from the first part of the list
            content = response.content[0].get("text", "") if isinstance(response.content[0], dict) else str(response.content[0])
        else:
            content = str(response.content)

        # 2. Clean the markdown and strip whitespace
        content = content.strip()
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
            
        return json.loads(content)
        
    except Exception as e:
        # This will print the exact error if it fails again
        print(f"DEBUG: Content was: {response.content}")
        return {"error": f"Gemini 3.0 Error: {str(e)}"}