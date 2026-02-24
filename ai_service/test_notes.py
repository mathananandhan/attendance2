import requests
import json

def test_notes_generation():
    url = "http://localhost:5001/generate_notes"
    payload = {
        "text": "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar. It occurs in the chloroplasts.",
        "language": "en-US"
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        if response.status_code == 200:
            print("Success! Notes generated:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    test_notes_generation()
