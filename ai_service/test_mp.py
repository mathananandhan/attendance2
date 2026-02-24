import sys
import os
print(f"Python Version: {sys.version}")
print(f"Executable: {sys.executable}")

try:
    import mediapipe as mp
    print(f"MediaPipe Version: {mp.__version__}")
    print(f"MediaPipe File: {mp.__file__}")
    print(f"Dir MediaPipe: {dir(mp)}")
    if hasattr(mp, 'solutions'):
        print("mp.solutions found!")
    else:
        print("mp.solutions NOT found!")
except Exception as e:
    print(f"Error importing mediapipe: {e}")

try:
    import cv2
    print(f"OpenCV Version: {cv2.__version__}")
except Exception as e:
    print(f"Error importing cv2: {e}")
