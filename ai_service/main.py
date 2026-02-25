from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mediapipe as mp
import numpy as np
import base64
import os
import re
import json
import google.generativeai as genai
from dotenv import load_dotenv
from ultralytics import YOLO

def extract_json_from_response(text):
    text = text.strip()
    match = re.search(r'(\{.*\}|\[.*\])', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except:
            pass
    cleaned = text.replace('```json', '').replace('```', '').strip()
    try:
        return json.loads(cleaned)
    except:
        return None

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
    max_num_hands=1
)

# Initialize YOLOv8 for Object Detection
try:
    yolo_model = YOLO('yolov8n.pt')
except Exception as e:
    print(f"Failed to load YOLO model: {e}")
    yolo_model = None

# Configure Gemini
GOOGLE_API_KEY = os.getenv('GEMINI_API_KEY')
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    print("Warning: GEMINI_API_KEY not found in environment variables.")
    model = None

@app.route('/', methods=['GET'])
def health_check():
    return jsonify({"status": "AI Service Running", "version": "1.0.0"})

@app.route('/generate_quiz', methods=['POST'])
def generate_quiz():
    """
    Generates a 2-question quiz based on the provided topic using Gemini.
    Expected Input: JSON { "topic": "Photosynthesis" }
    Output: JSON { "questions": [...] }
    """
    try:
        data = request.json
        topic = data.get('topic')
        
        if not topic:
            return jsonify({"error": "No topic provided"}), 400

        if not model:
            return jsonify({"error": "AI model not configured"}), 503

        prompt = f"""
        Generate a short quiz with exactly 2 multiple-choice questions about '{topic}'.
        Return the result as a Valid JSON array of objects.
        Each object should have:
        - "id": a unique number (1 or 2)
        - "question": the question text
        - "options": an array of 4 string options
        - "correctAnswer": the exact string of the correct option
        
        Do not include any markdown formatting or code blocks (like ```json). Just the raw JSON string.
        """
        
        response = model.generate_content(prompt)
        
        parsed_json = extract_json_from_response(response.text)
        if parsed_json is not None:
            return jsonify(parsed_json)
        else:
            return jsonify({"error": "Failed to parse AI response as JSON", "raw": response.text}), 500

    except Exception as e:
        print(f"Error generating quiz: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate_assignment', methods=['POST'])
def generate_assignment():
    """
    Generates an assignment title and description based on a topic using Gemini.
    Expected Input: JSON { "topic": "Algebra" }
    Output: JSON { "title": "Homework xyz", "description": "Solve these..." }
    """
    try:
        data = request.json
        topic = data.get('topic')
        
        if not topic:
            return jsonify({"error": "No topic provided"}), 400

        if not model:
            return jsonify({"error": "AI model not configured"}), 503

        prompt = f"""
        You are an expert teacher. Generate a creative, college-level homework assignment strictly about '{topic}'.
        Return the result as a single Valid JSON object with exactly two keys:
        - "title": A catchy, concise title for the assignment.
        - "description": A paragraph describing the problem statement and what the student needs to submit.
        
        Do not include any markdown formatting or code blocks. Just the raw JSON string.
        """
        
        response = model.generate_content(prompt)
        parsed_json = extract_json_from_response(response.text)
        if parsed_json is not None:
            return jsonify(parsed_json)
        else:
            return jsonify({"error": "Failed to parse AI response as JSON", "raw": response.text}), 500

    except Exception as e:
        print(f"Error generating assignment: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate_exam', methods=['POST'])
def generate_exam():
    """
    Generates a full exam (e.g., 5-10 questions) based on a topic using Gemini.
    Expected Input: JSON { "topic": "Data Structures", "questionCount": 5 }
    Output: JSON { "title": "...", "questions": [...] }
    """
    try:
        data = request.json
        topic = data.get('topic')
        count = data.get('questionCount', 5)
        
        if not topic:
            return jsonify({"error": "No topic provided"}), 400

        if not model:
            return jsonify({"error": "AI model not configured"}), 503

        # Ensure reasonable count
        count = max(1, min(int(count), 20))

        prompt = f"""
        You are a college professor creating a formal term exam.
        Generate a comprehensive multiple-choice exam about '{topic}' with exactly {count} questions.
        Return the result as a Valid JSON object with the following structure:
        {{
            "title": "A formal title for the exam",
            "questions": [
                {{
                    "questionText": "The question string",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctOption": 1
                }}
            ]
        }}
        Note: "correctOption" must be a 0-based integer index pointing to the correct string in the "options" array (0, 1, 2, or 3).
        
        Do not include any markdown formatting or code blocks. Just the raw JSON string.
        """
        
        response = model.generate_content(prompt)
        parsed_json = extract_json_from_response(response.text)
        if parsed_json is not None:
            return jsonify(parsed_json)
        else:
            return jsonify({"error": "Failed to parse AI response as JSON", "raw": response.text}), 500

    except Exception as e:
        print(f"Error generating exam: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate_notes', methods=['POST'])
def generate_notes():
    """
    Generates structured notes from a raw transcript chunk.
    Expected Input: JSON { "text": "raw speech text", "language": "en-US" }
    Output: JSON { "notes": "html/markdown string" }
    """
    try:
        data = request.json
        text = data.get('text')
        language = data.get('language', 'en-US')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400

        if not model:
            return jsonify({"error": "AI model not configured"}), 503

        prompt = f"""
        You are an expert student note-taker. 
        The following text is a raw transcript from a live class (Language: {language}).
        
        Transcript: "{text}"
        
        Please summarize this into concise, high-quality bullet points for study notes.
        - Extract key concepts, definitions, and important facts.
        - Ignore filler words or conversational fluff.
        - If the text is too short or meaningless to summarize, return an empty string.
        - Format the output as simple Markdown (just bullet points).
        """
        
        response = model.generate_content(prompt)
        
        return jsonify({"notes": response.text})

    except Exception as e:
        print(f"Error generating notes: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_attention', methods=['POST'])
def analyze_attention():
    """
    Analyzes a webcam frame for student attention using head pose estimation.
    Expected Input: JSON { "image": "base64_encoded_image" }
    Output: JSON { "score": 85, "flags": ["looking_left"] }
    """
    try:
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        # Decode base64 image
        try:
            image_bytes = base64.b64decode(image_data.split(',')[1])
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
             return jsonify({"error": f"Invalid image data: {str(e)}"}), 400

        if frame is None:
            return jsonify({"error": "Failed to decode image"}), 400

        # Phone Detection with YOLO
        if yolo_model is not None:
            # YOLO expects RGB or BGR, we can pass the frame directly
            yolo_results = yolo_model(frame, verbose=False)
            for r in yolo_results:
                for box in r.boxes:
                    class_id = int(box.cls[0])
                    # In COCO dataset, 67 is 'cell phone'
                    if class_id == 67:
                        flags.append("phone_detected")
                        attention_score -= 80 # Heavy penalty

        # Process with MediaPipe for Gaze Tracking
        results = face_mesh.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        attention_score = 100
        flags = []

        if not results.multi_face_landmarks:
            attention_score = 0
            flags.append("no_face_detected")
        else:
            for face_landmarks in results.multi_face_landmarks:
                face_3d = []
                face_2d = []
                h, w, c = frame.shape

                lm_indices = [1, 152, 33, 263, 61, 291]

                for idx, lm in enumerate(face_landmarks.landmark):
                    if idx in lm_indices:
                        x, y = int(lm.x * w), int(lm.y * h)
                        face_2d.append([x, y])
                        face_3d.append([x, y, lm.z])

                face_2d = np.array(face_2d, dtype=np.float64)
                face_3d = np.array(face_3d, dtype=np.float64)

                focal_length = 1 * w
                cam_matrix = np.array([[focal_length, 0, w / 2],
                                       [0, focal_length, h / 2],
                                       [0, 0, 1]])

                dist_matrix = np.zeros((4, 1), dtype=np.float64)
                success, rot_vec, trans_vec = cv2.solvePnP(face_3d, face_2d, cam_matrix, dist_matrix)
                rmat, jac = cv2.Rodrigues(rot_vec)
                angles, mtxR, mtxQ, Q, Qx, Qy, Qz = cv2.RQDecomp3x3(rmat)

                x = angles[0] * 360
                y = angles[1] * 360

                # Strict Gaze Thresholds
                if y < -6:
                    flags.append("looking_left_strict")
                    attention_score -= 25
                elif y > 6:
                    flags.append("looking_right_strict")
                    attention_score -= 25
                elif x < -5:
                    flags.append("looking_down_strict")
                    attention_score -= 50 # High penalty for looking down (possible phone on lap)
                elif x > 10:
                    flags.append("looking_up")
                    attention_score -= 20
        
        attention_score = max(0, min(100, attention_score))

        return jsonify({
            "score": attention_score,
            "flags": flags
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_audio', methods=['POST'])
def analyze_audio():
    """
    Analyzes an audio chunk for significant noise or speech using RMS energy.
    Expected Input: JSON { "audio": "base64_encoded_wav_or_pcm" }
    Output: JSON { "flags": ["noise_detected"] }
    """
    try:
        data = request.json
        audio_data = data.get('audio')
        
        if not audio_data:
            return jsonify({"error": "No audio provided"}), 400

        # Decode base64 audio
        try:
            audio_bytes = base64.b64decode(audio_data.split(',')[1] if ',' in audio_data else audio_data)
            # Simple RMS energy calculation on raw 16-bit PCM (approximate)
            nparr = np.frombuffer(audio_bytes, dtype=np.int16)
        except Exception as e:
            return jsonify({"error": f"Invalid audio data: {str(e)}"}), 400

        flags = []
        if nparr.size > 0:
            rms = np.sqrt(np.mean(nparr.astype(np.float64)**2))
            # Define a threshold for "whispering" or "talking" 
            # (Threshold varies wildly based on mic gain, this is a proxy for the demo)
            if rms > 1500: 
                flags.append("noise_detected")

        return jsonify({
            "flags": flags,
            "rms": rms if nparr.size > 0 else 0
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict_risk', methods=['POST'])
def predict_risk():
    """
    Predicts student risk based on attendance and attention data.
    Expected Input: JSON { "students": [{ "name": "...", "attendanceRate": 75, "avgAttention": 60, "avgGrade": 55 }] }
    Output: JSON { "predictions": [...] }
    """
    try:
        data = request.json
        students = data.get('students', [])
        
        if not students:
            return jsonify({"error": "No student data provided"}), 400
        
        if not model:
            return jsonify({"error": "AI model not configured"}), 503

        prompt = f"""
        You are an educational analytics AI. Analyze the following student performance data and identify at-risk students.
        
        Student Data: {str(students)}
        
        For each student, provide:
        - "name": student name
        - "riskLevel": "high", "medium", or "low"
        - "riskScore": a number 0-100 (100 = highest risk)
        - "factors": array of contributing factors (e.g., "low attendance", "declining attention")
        - "recommendations": array of actionable recommendations
        
        Return ONLY a valid JSON array. No markdown, no code blocks.
        """
        
        response = model.generate_content(prompt)
        parsed_json = extract_json_from_response(response.text)
        if parsed_json is not None:
            return jsonify(parsed_json)
        else:
            return jsonify({"error": "Failed to parse AI response as JSON", "raw": response.text}), 500
    
    except Exception as e:
        print(f"Error predicting risk: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate_flashcards', methods=['POST'])
def generate_flashcards():
    """
    Generates flashcards from a topic.
    Expected Input: JSON { "topic": "Photosynthesis", "count": 5 }
    Output: JSON { "flashcards": [{ "front": "...", "back": "..." }] }
    """
    try:
        data = request.json
        topic = data.get('topic')
        count = data.get('count', 5)
        
        if not topic:
            return jsonify({"error": "No topic provided"}), 400
        
        if not model:
            return jsonify({"error": "AI model not configured"}), 503

        prompt = f"""
        Generate exactly {count} flashcards about '{topic}' for a college student.
        
        Return a valid JSON object with a "flashcards" key containing an array.
        Each flashcard should have:
        - "id": number starting from 1
        - "front": the question or term (concise)
        - "back": the answer or definition (clear, 1-2 sentences)
        
        Do not include any markdown formatting or code blocks. Just the raw JSON.
        """
        
        response = model.generate_content(prompt)
        parsed_json = extract_json_from_response(response.text)
        if parsed_json is not None:
            return jsonify(parsed_json)
        else:
            return jsonify({"error": "Failed to parse AI response as JSON", "raw": response.text}), 500
    
    except Exception as e:
        print(f"Error generating flashcards: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/personalized_path', methods=['POST'])
def personalized_path():
    """
    Generates personalized study recommendations.
    Expected Input: JSON { "weakTopics": [...], "strongTopics": [...], "subject": "Physics" }
    Output: JSON { "recommendations": [...] }
    """
    try:
        data = request.json
        weak_topics = data.get('weakTopics', [])
        strong_topics = data.get('strongTopics', [])
        subject = data.get('subject', 'General')
        
        if not model:
            return jsonify({"error": "AI model not configured"}), 503

        prompt = f"""
        You are a personalized learning advisor for a college student studying {subject}.
        
        Weak areas: {str(weak_topics)}
        Strong areas: {str(strong_topics)}
        
        Create a personalized study plan. Return a valid JSON object with:
        - "studyPlan": array of objects, each with:
          - "topic": the topic to study
          - "priority": "high", "medium", or "low"
          - "estimatedTime": time in minutes
          - "resources": array of suggested resource types (e.g., "video lecture", "practice problems")
          - "tip": a specific study tip for this topic
        - "overallAdvice": a brief motivational message with general study strategy
        
        Do not include any markdown formatting or code blocks. Just the raw JSON.
        """
        
        response = model.generate_content(prompt)
        parsed_json = extract_json_from_response(response.text)
        if parsed_json is not None:
            return jsonify(parsed_json)
        else:
            return jsonify({"error": "Failed to parse AI response as JSON", "raw": response.text}), 500
    
    except Exception as e:
        print(f"Error generating path: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/analyze_gestures', methods=['POST'])
def analyze_gestures():
    """
    Analyzes a webcam frame for gestures (Raise Hand, Thumbs Up).
    Expected Input: JSON { "image": "base64_encoded_image" }
    Output: JSON { "gesture": "raise_hand" | "thumbs_up" | "none", "confidence": 0.9 }
    """
    try:
        data = request.json
        image_data = data.get('image')
        
        if not image_data:
            return jsonify({"error": "No image provided"}), 400

        # Decode base64
        try:
            image_bytes = base64.b64decode(image_data.split(',')[1])
            nparr = np.frombuffer(image_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception:
            return jsonify({"error": "Invalid image data"}), 400

        if frame is None:
            return jsonify({"error": "Failed to decode"}), 400

        # Process with MediaPipe Hands
        # Convert to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)
        
        gesture = "none"
        confidence = 0.0

        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                # Get key landmarks
                # Thumb: 4 (Tip), 3 (IP), 2 (MCP)
                # Index: 8 (Tip), 6 (PIP)
                # Middle: 12 (Tip), 10 (PIP)
                # Ring: 16 (Tip), 14 (PIP)
                # Pinky: 20 (Tip), 18 (PIP)
                # Wrist: 0
                
                landmarks = hand_landmarks.landmark
                
                # Helper to get y coordinate (y increases downwards)
                def get_y(idx): return landmarks[idx].y
                def get_x(idx): return landmarks[idx].x

                wrist_y = get_y(0)
                
                # Check Thumbs Up
                # Thumb tip is above IP (y is smaller)
                # Other fingers are curled (Tip y > PIP y)
                thumb_up = get_y(4) < get_y(3)
                index_curled = get_y(8) > get_y(6)
                middle_curled = get_y(12) > get_y(10)
                ring_curled = get_y(16) > get_y(14)
                pinky_curled = get_y(20) > get_y(18)

                if thumb_up and index_curled and middle_curled and ring_curled and pinky_curled:
                    gesture = "thumbs_up"
                    confidence = 0.9
                    break # Found a gesture

                # Check Raise Hand (Open Palm)
                # All fingers extended (Tip y < PIP y)
                # Wrist is generally low (optional check, but "Raise Hand" usually means hand is up)
                # For robustness, we check if all fingers are extended
                fingers_extended = (
                    get_y(8) < get_y(6) and
                    get_y(12) < get_y(10) and
                    get_y(16) < get_y(14) and
                    get_y(20) < get_y(18)
                )
                
                # "Raise Hand" usually implies the hand is physically high in the frame or just open palm showing
                # We'll stick to 'Open Palm' logic for 'Raise Hand' intent
                if fingers_extended:
                    gesture = "raise_hand"
                    confidence = 0.95
                    break

        return jsonify({
            "gesture": gesture,
            "confidence": confidence
        })

    except Exception as e:
        print(f"Error analyzing gestures: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

