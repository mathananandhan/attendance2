import requests
import json

def test_quiz_generation():
    url = "http://localhost:5001/generate_quiz"
    payload = {"topic": "Photosynthesis"}
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        if response.status_code == 200:
            print("Success! Quiz generated:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    test_quiz_generation()
