
import requests
import base64
import cv2
import numpy as np
import json
import time

# Helper to create a dummy image (black screen)
# In a real test, we might want to load a real hand image, but for now we just test that the endpoint runs without crashing
# and returns "none" for a black image.
def create_dummy_image():
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    _, buffer = cv2.imencode('.jpg', img)
    img_str = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{img_str}"

def test_gesture_endpoint():
    url = "http://localhost:5001/analyze_gestures"
    
    print(f"Testing {url}...")
    
    try:
        # 1. Test with no image
        res = requests.post(url, json={})
        print(f"Test 1 (No Data): Status {res.status_code} - {res.json()}")
        
        # 2. Test with dummy image (should be 'none')
        img_data = create_dummy_image()
        res = requests.post(url, json={"image": img_data})
        print(f"Test 2 (Black Image): Status {res.status_code}")
        print(f"Response: {json.dumps(res.json(), indent=2)}")
        
        if res.status_code == 200:
             print("SUCCESS: Endpoint is reachable and processing images.")
        else:
             print("FAILURE: Endpoint returned error.")

    except Exception as e:
        print(f"CRITICAL ERROR: Is the server running? {e}")

if __name__ == "__main__":
    # Wait a bit for server to start if we just launched it
    time.sleep(2)
    test_gesture_endpoint()
