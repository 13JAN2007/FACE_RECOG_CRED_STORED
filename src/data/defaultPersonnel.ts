import { PersonCredential } from '../types';

// Crisp inline SVG biometric avatar Data URIs (zero network dependencies, zero 404, zero CORS taint)
const ALEX_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c192c"/>
      <stop offset="100%" stop-color="#050b14"/>
    </linearGradient>
    <linearGradient id="skin1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fcd34d"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg1)"/>
  <!-- Cyber grid -->
  <path d="M0 50 H200 M0 100 H200 M0 150 H200 M50 0 V200 M100 0 V200 M150 0 V200" stroke="#1e293b" stroke-width="1"/>
  <!-- Torso & Lab Coat -->
  <path d="M40 200 C40 150 70 140 100 140 C130 140 160 150 160 200 Z" fill="#1e293b"/>
  <path d="M80 145 L100 180 L120 145" fill="#0284c7"/>
  <!-- Head & Neck -->
  <rect x="90" y="120" width="20" height="25" fill="#d97706"/>
  <ellipse cx="100" cy="85" rx="42" ry="48" fill="#fcd34d"/>
  <!-- Hair -->
  <path d="M58 80 C58 50 75 40 100 40 C125 40 142 50 142 80 C135 60 115 52 100 52 C85 52 65 60 58 80 Z" fill="#451a03"/>
  <!-- Eyes & Eyebrows -->
  <rect x="75" y="72" width="16" height="4" rx="2" fill="#451a03"/>
  <rect x="109" y="72" width="16" height="4" rx="2" fill="#451a03"/>
  <circle cx="83" cy="84" r="5" fill="#0f172a"/>
  <circle cx="117" cy="84" r="5" fill="#0f172a"/>
  <!-- Cyber Glasses / Visor -->
  <rect x="70" y="78" width="26" height="14" rx="4" fill="none" stroke="#06b6d4" stroke-width="2"/>
  <rect x="104" y="78" width="26" height="14" rx="4" fill="none" stroke="#06b6d4" stroke-width="2"/>
  <line x1="96" y1="85" x2="104" y2="85" stroke="#06b6d4" stroke-width="2"/>
  <!-- Nose & Mouth -->
  <path d="M100 88 L97 98 L103 98" stroke="#d97706" stroke-width="2" fill="none"/>
  <line x1="88" y1="110" x2="112" y2="110" stroke="#b45309" stroke-width="2"/>
  <!-- Tech Reticle Corners -->
  <path d="M15 35 V15 H35 M165 15 H185 V35 M185 165 V185 H165 M35 185 H15 V165" stroke="#0284c7" stroke-width="2" fill="none"/>
</svg>
`)}`;

const ELENA_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#062419"/>
      <stop offset="100%" stop-color="#04120d"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg2)"/>
  <path d="M0 50 H200 M0 100 H200 M0 150 H200 M50 0 V200 M100 0 V200 M150 0 V200" stroke="#0f3d2e" stroke-width="1"/>
  <!-- Lab Coat -->
  <path d="M40 200 C40 150 70 140 100 140 C130 140 160 150 160 200 Z" fill="#0f766e"/>
  <path d="M85 145 L100 175 L115 145" fill="#f8fafc"/>
  <!-- Head & Hair -->
  <ellipse cx="100" cy="85" rx="40" ry="46" fill="#fde68a"/>
  <!-- Dark Hair -->
  <path d="M56 85 C56 45 75 36 100 36 C125 36 144 45 144 85 C146 115 140 135 132 145 C122 100 120 70 100 70 C80 70 78 100 68 145 C60 135 54 115 56 85 Z" fill="#1e1b4b"/>
  <!-- Eyes -->
  <circle cx="82" cy="84" r="4.5" fill="#1e1b4b"/>
  <circle cx="118" cy="84" r="4.5" fill="#1e1b4b"/>
  <path d="M74 74 Q82 71 90 74" stroke="#1e1b4b" stroke-width="2" fill="none"/>
  <path d="M110 74 Q118 71 126 74" stroke="#1e1b4b" stroke-width="2" fill="none"/>
  <!-- Nose & Smile -->
  <path d="M100 86 L98 96 L102 96" stroke="#d97706" stroke-width="1.5" fill="none"/>
  <path d="M88 108 Q100 116 112 108" stroke="#be123c" stroke-width="2" fill="none"/>
  <!-- Medical Cross Badge -->
  <circle cx="155" cy="45" r="14" fill="#047857"/>
  <path d="M151 45 H159 M155 41 V49" stroke="#ffffff" stroke-width="2.5"/>
</svg>
`)}`;

const MARCUS_AVATAR = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2a1608"/>
      <stop offset="100%" stop-color="#120902"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" fill="url(#bg3)"/>
  <path d="M0 50 H200 M0 100 H200 M0 150 H200 M50 0 V200 M100 0 V200 M150 0 V200" stroke="#451a03" stroke-width="1"/>
  <!-- Heavy Security Vest -->
  <path d="M40 200 C40 150 70 140 100 140 C130 140 160 150 160 200 Z" fill="#292524"/>
  <rect x="75" y="150" width="50" height="30" rx="3" fill="#78350f"/>
  <!-- Head & Neck -->
  <ellipse cx="100" cy="85" rx="42" ry="46" fill="#fed7aa"/>
  <!-- Buzz Cut Hair -->
  <path d="M60 75 C60 48 78 40 100 40 C122 40 140 48 140 75 Z" fill="#27272a"/>
  <!-- Eyes & Serious Brow -->
  <path d="M72 73 L88 77" stroke="#27272a" stroke-width="2.5"/>
  <path d="M112 77 L128 73" stroke="#27272a" stroke-width="2.5"/>
  <circle cx="82" cy="84" r="4" fill="#27272a"/>
  <circle cx="118" cy="84" r="4" fill="#27272a"/>
  <!-- Beard Stubble -->
  <path d="M75 98 C75 125 100 132 100 132 C100 132 125 125 125 98 C115 102 100 102 75 98 Z" fill="#44403c" opacity="0.6"/>
  <!-- Mouth -->
  <line x1="88" y1="112" x2="112" y2="112" stroke="#292524" stroke-width="2"/>
  <!-- Amber Warning Badge -->
  <polygon points="155,32 170,58 140,58" fill="#d97706"/>
  <text x="153" y="54" font-family="monospace" font-size="14" font-weight="bold" fill="#000">!</text>
</svg>
`)}`;

export const INITIAL_PERSONNEL: PersonCredential[] = [
  {
    id: "USR-1042",
    image: ALEX_AVATAR,
    name: "Alex Mercer",
    role: "Lead Robotics Engineer",
    department: "Autonomous Systems Lab",
    access_level: "Level 4 - Top Secret",
    clearance: "ALPHA-01",
    badge_id: "8920-ENG",
    status: "AUTHORIZED",
    issued_date: "2024-03-15"
  },
  {
    id: "USR-2091",
    image: ELENA_AVATAR,
    name: "Dr. Elena Rostova",
    role: "Chief Medical Officer",
    department: "Bio-Research & Genetics",
    access_level: "Level 5 - Maximum Alpha",
    clearance: "BIO-OMEGA",
    badge_id: "4102-MED",
    status: "AUTHORIZED",
    issued_date: "2023-11-01"
  },
  {
    id: "USR-3054",
    image: MARCUS_AVATAR,
    name: "Marcus Vance",
    role: "Infrastructure Architect",
    department: "Core Data Centers",
    access_level: "Level 3 - Operational",
    clearance: "SEC-BETA",
    badge_id: "6731-OPS",
    status: "RESTRICTED",
    issued_date: "2024-08-20"
  }
];

export const PYTHON_FILES: { name: string; description: string; language: string; content: string }[] = [
  {
    name: "main.py",
    description: "Primary Deep Learning Recognition Script (OpenCV + face_recognition)",
    language: "python",
    content: `#!/usr/bin/env python3
"""
Biometric Face Recognition & Credential HUD System
Accesses webcam in real-time, identifies registered individuals
using stored photos, and overlays their verified security credentials
directly onto the recognized bounding box in the camera feed.
"""

import os
import sys
import json
import time
from typing import Dict, List, Tuple, Optional
import cv2
import numpy as np

try:
    import face_recognition
except ImportError:
    print("\\n[!] 'face_recognition' library is not installed.")
    print("    Install it via: pip install face-recognition")
    print("    Or run the zero-dependency fallback: python recognizer_lightweight.py\\n")
    sys.exit(1)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_FILE = os.path.join(BASE_DIR, "credentials.json")
KNOWN_FACES_DIR = os.path.join(BASE_DIR, "known_faces")
SNAPSHOTS_DIR = os.path.join(BASE_DIR, "snapshots")

os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
os.makedirs(SNAPSHOTS_DIR, exist_ok=True)

class BiometricHUDApp:
    def __init__(self, credentials_path: str = CREDENTIALS_FILE):
        self.credentials_path = credentials_path
        self.credentials_db: Dict[str, dict] = {}
        self.known_face_encodings: List[np.ndarray] = []
        self.known_face_ids: List[str] = []
        self.recognition_threshold = 0.48
        self.compact_hud = False
        self.load_database()

    def load_database(self) -> None:
        print("[*] Loading credential database...")
        if not os.path.exists(self.credentials_path):
            return

        with open(self.credentials_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.recognition_threshold = float(data.get("recognition_threshold", 0.48))
        self.known_face_encodings.clear()
        self.known_face_ids.clear()
        self.credentials_db.clear()

        for person in data.get("personnel", []):
            person_id = person.get("id")
            img_rel_path = person.get("image")
            if not person_id or not img_rel_path:
                continue

            img_full_path = os.path.join(BASE_DIR, img_rel_path)
            self.credentials_db[person_id] = person

            if not os.path.exists(img_full_path):
                print(f"  [-] Photo not found: {img_rel_path}")
                continue

            try:
                loaded_img = face_recognition.load_image_file(img_full_path)
                encodings = face_recognition.face_encodings(loaded_img)
                if encodings:
                    for enc in encodings:
                        self.known_face_encodings.append(enc)
                        self.known_face_ids.append(person_id)
                    print(f"  [+] Enrolled: {person.get('name')} ({person_id})")
            except Exception as e:
                print(f"  [-] Error processing {img_rel_path}: {e}")

    def draw_tech_corners(self, img: np.ndarray, x1: int, y1: int, x2: int, y2: int, color: Tuple[int, int, int], length: int = 18, thickness: int = 2):
        cv2.line(img, (x1, y1), (x1 + length, y1), color, thickness)
        cv2.line(img, (x1, y1), (x1, y1 + length), color, thickness)
        cv2.line(img, (x2, y1), (x2 - length, y1), color, thickness)
        cv2.line(img, (x2, y1), (x2, y1 + length), color, thickness)
        cv2.line(img, (x1, y2), (x1 + length, y2), color, thickness)
        cv2.line(img, (x1, y2), (x1, y2 - length), color, thickness)
        cv2.line(img, (x2, y2), (x2 - length, y2), color, thickness)
        cv2.line(img, (x2, y2), (x2 - length, y2), color, thickness)

    def draw_credential_card(self, frame: np.ndarray, top: int, right: int, bottom: int, left: int, creds: Optional[dict], confidence: float, dist: float):
        h_frame, w_frame, _ = frame.shape
        is_authorized = creds and creds.get("status") == "AUTHORIZED"
        is_restricted = creds and creds.get("status") == "RESTRICTED"

        if is_authorized:
            theme_color = (0, 220, 100)      # Emerald Green
            status_text = "ACCESS GRANTED // AUTHORIZED"
            header_bg = (10, 60, 25)
        elif is_restricted:
            theme_color = (0, 180, 255)      # Amber Orange
            status_text = "RESTRICTED ACCESS // FLAG"
            header_bg = (15, 45, 70)
        else:
            theme_color = (60, 60, 240)      # Crimson Red
            status_text = "UNKNOWN SUBJECT // UNREGISTERED"
            header_bg = (20, 20, 70)

        # Draw tech face box
        cv2.rectangle(frame, (left, top), (right, bottom), theme_color, 1)
        self.draw_tech_corners(frame, left, top, right, bottom, theme_color, length=20, thickness=3)

        # Center reticle
        cx, cy = (left + right) // 2, (top + bottom) // 2
        cv2.circle(frame, (cx, cy), 4, theme_color, -1)

        # Build lines
        if creds:
            lines = [
                ("NAME", creds.get("name", "Unknown"), (255, 255, 255), 0.55, 2),
                ("ID / BADGE", f"{creds.get('id', '')} | {creds.get('badge_id', 'N/A')}", (200, 220, 255), 0.45, 1),
                ("ROLE", creds.get("role", "N/A"), (210, 210, 210), 0.45, 1),
                ("DEPT", creds.get("department", "N/A"), (190, 190, 190), 0.42, 1),
                ("ACCESS", creds.get("access_level", "Standard"), theme_color, 0.45, 1),
                ("CLEARANCE", creds.get("clearance", "UNCLASSIFIED"), (255, 215, 0), 0.45, 1),
                ("MATCH", f"{confidence:.1f}% (Dist: {dist:.2f})", (180, 255, 180), 0.42, 1),
            ]
        else:
            lines = [
                ("IDENTITY", "No Biometric Match Found", (200, 200, 255), 0.50, 1),
                ("DISTANCE", f"{dist:.2f} (Required < {self.recognition_threshold:.2f})", (120, 140, 255), 0.42, 1),
                ("ACTION", "Request Security Registration", (80, 100, 255), 0.45, 1),
                ("CLEARANCE", "NONE (GUEST PROTOCOL)", (100, 100, 255), 0.45, 1),
            ]

        card_w = 290
        line_height = 22
        card_h = 36 + len(lines) * line_height + 12
        card_x1 = right + 15
        card_y1 = top

        if card_x1 + card_w > w_frame - 10:
            card_x1 = left - card_w - 15
        if card_x1 < 10:
            card_x1 = max(10, min(left, w_frame - card_w - 10))
            card_y1 = bottom + 12

        card_y1 = max(10, min(h_frame - card_h - 10, card_y1))
        card_x2 = card_x1 + card_w
        card_y2 = card_y1 + card_h

        # Connector line
        conn_start = (right, (top + bottom) // 2) if card_x1 > right else (left, (top + bottom) // 2)
        conn_end = (card_x1 if card_x1 > right else card_x2, min(card_y2, max(card_y1, (top + bottom) // 2)))
        cv2.line(frame, conn_start, conn_end, theme_color, 1)

        # Transparent card background
        overlay = frame.copy()
        cv2.rectangle(overlay, (card_x1, card_y1), (card_x2, card_y2), (15, 18, 24), -1)
        cv2.rectangle(overlay, (card_x1, card_y1), (card_x2, card_y1 + 28), header_bg, -1)
        cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)

        cv2.rectangle(frame, (card_x1, card_y1), (card_x2, card_y2), theme_color, 1)
        cv2.putText(frame, status_text, (card_x1 + 8, card_y1 + 19), cv2.FONT_HERSHEY_SIMPLEX, 0.40, theme_color, 1, cv2.LINE_AA)

        cur_y = card_y1 + 48
        for label, val, text_color, scale, thick in lines:
            cv2.putText(frame, f"{label}:", (card_x1 + 10, cur_y), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (140, 160, 180), 1, cv2.LINE_AA)
            cv2.putText(frame, val, (card_x1 + 85, cur_y), cv2.FONT_HERSHEY_SIMPLEX, scale, text_color, thick, cv2.LINE_AA)
            cur_y += line_height

    def run(self, camera_index: int = 0):
        video_capture = cv2.VideoCapture(camera_index)
        if not video_capture.isOpened():
            print("[!] Unable to open webcam.")
            return

        process_this_frame = True
        face_locations, face_matches = [], []

        while True:
            ret, frame = video_capture.read()
            if not ret:
                continue

            if process_this_frame:
                small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
                rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
                face_locations = face_recognition.face_locations(rgb_small_frame)
                face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

                face_matches = []
                for face_encoding in face_encodings:
                    matched_creds = None
                    confidence = 0.0
                    best_dist = 1.0
                    if self.known_face_encodings:
                        distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                        best_idx = int(np.argmin(distances))
                        best_dist = float(distances[best_idx])
                        if best_dist <= self.recognition_threshold:
                            matched_creds = self.credentials_db.get(self.known_face_ids[best_idx])
                            confidence = round(max(0.0, min(99.9, (1.0 - best_dist) * 100)), 1)
                        else:
                            matched_creds = None
                            confidence = round(max(0.0, (1.0 - best_dist) * 100), 1)
                    face_matches.append((matched_creds, confidence, best_dist))

            process_this_frame = not process_this_frame

            for (top, right, bottom, left), (creds, confidence, dist) in zip(face_locations, face_matches):
                self.draw_credential_card(frame, top * 4, right * 4, bottom * 4, left * 4, creds, confidence, dist)

            cv2.imshow("Biometric Face Recognition HUD", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break

        video_capture.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    BiometricHUDApp().run()
`
  },
  {
    name: "recognizer_lightweight.py",
    description: "Lightweight Pure-OpenCV Version (Zero C++ / cmake compiler required)",
    language: "python",
    content: `#!/usr/bin/env python3
"""
Lightweight Face Recognition & Credential HUD (Pure OpenCV - No dlib required)
Runs with standard 'pip install opencv-python numpy'.
"""

import os
import json
import cv2
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_FILE = os.path.join(BASE_DIR, "credentials.json")

class LightweightBiometricHUD:
    def __init__(self):
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        self.known_templates = []
        self.credentials_db = {}
        self.match_threshold = 0.72
        self.load_database()

    def load_database(self):
        if not os.path.exists(CREDENTIALS_FILE):
            return
        with open(CREDENTIALS_FILE, "r") as f:
            data = json.load(f)
        for person in data.get("personnel", []):
            pid = person.get("id")
            path = os.path.join(BASE_DIR, person.get("image", ""))
            self.credentials_db[pid] = person
            if os.path.exists(path):
                img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
                if img is not None:
                    norm = cv2.equalizeHist(cv2.resize(img, (120, 120)))
                    self.known_templates.append((pid, norm))

    def run(self):
        cap = cv2.VideoCapture(0)
        while True:
            ret, frame = cap.read()
            if not ret: break
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.2, 5, minSize=(60, 60))
            for (x, y, w, h) in faces:
                target = cv2.equalizeHist(cv2.resize(gray[y:y+h, x:x+w], (120, 120)))
                best_s, best_p = -1, None
                for pid, tmpl in self.known_templates:
                    score = float(cv2.matchTemplate(target, tmpl, cv2.TM_CCOEFF_NORMED)[0][0])
                    if score > best_s:
                        best_s, best_p = score, pid
                
                creds = self.credentials_db.get(best_p) if best_s >= self.match_threshold else None
                col = (0, 220, 100) if creds else (60, 60, 240)
                cv2.rectangle(frame, (x, y), (x+w, y+h), col, 2)
                name = creds.get("name") if creds else "UNKNOWN SUBJECT"
                role = creds.get("role", "N/A") if creds else f"ACCESS DENIED (Score: {best_s:.2f})"
                cv2.putText(frame, f"ID: {name}", (x, y - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.5, col, 2)
                cv2.putText(frame, f"ROLE: {role}", (x, y - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (200, 220, 255), 1)

            cv2.imshow("Lightweight Biometric HUD", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'): break
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    LightweightBiometricHUD().run()
`
  },
  {
    name: "enroll_person.py",
    description: "Interactive Personnel Enrollment Wizard (Webcam Capture & Metadata)",
    language: "python",
    content: `#!/usr/bin/env python3
"""
Personnel Enrollment Utility
Takes webcam photo or imports image, validates human face, and updates database.
"""

import os
import json
import time
import cv2

try:
    import face_recognition
    HAS_FACE_REC = True
except ImportError:
    HAS_FACE_REC = False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_FILE = os.path.join(BASE_DIR, "credentials.json")
KNOWN_FACES_DIR = os.path.join(BASE_DIR, "known_faces")

def enroll():
    print("=== BIOMETRIC PERSONNEL ENROLLMENT WIZARD ===")
    name = input("Enter Full Name: ").strip()
    if not name: return

    person_id = f"USR-{int(time.time()) % 10000:04d}"
    role = input("Role / Title [e.g. Systems Engineer]: ").strip() or "Engineer"
    dept = input("Department [e.g. Operations]: ").strip() or "Operations"
    access_lvl = input("Access Level [e.g. Level 4]: ").strip() or "Level 2"
    badge_id = input("Badge ID: ").strip() or f"{person_id}-B"

    filename = f"{name.lower().replace(' ', '_')}.jpg"
    dest = os.path.join(KNOWN_FACES_DIR, filename)

    print("\\nOpening webcam... Center face and press [SPACEBAR] to take snapshot, [q] to cancel.")
    cap = cv2.VideoCapture(0)
    saved = False
    while True:
        ret, frame = cap.read()
        if not ret: continue
        cv2.imshow("Enrollment Snapshot", frame)
        k = cv2.waitKey(1) & 0xFF
        if k == 32: # Space
            if HAS_FACE_REC:
                rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                faces = face_recognition.face_locations(rgb)
                if len(faces) == 0:
                    print("[!] No face detected. Please try again.")
                    continue
            cv2.imwrite(dest, frame)
            saved = True
            break
        elif k == ord('q'): break
    cap.release()
    cv2.destroyAllWindows()

    if not saved: return

    data = {"recognition_threshold": 0.48, "personnel": []}
    if os.path.exists(CREDENTIALS_FILE):
        with open(CREDENTIALS_FILE, "r") as f:
            data = json.load(f)

    data["personnel"].append({
        "id": person_id,
        "image": f"known_faces/{filename}",
        "name": name,
        "role": role,
        "department": dept,
        "access_level": access_lvl,
        "clearance": "SEC-STANDARD",
        "badge_id": badge_id,
        "status": "AUTHORIZED",
        "issued_date": time.strftime("%Y-%m-%d")
    })

    with open(CREDENTIALS_FILE, "w") as f:
        json.dump(data, f, indent=2)

    print(f"\\n[+] Successfully enrolled {name} ({person_id})!")

if __name__ == "__main__":
    enroll()
`
  },
  {
    name: "credentials.json",
    description: "Structured Personnel Credential & Security Database",
    language: "json",
    content: `{
  "system_title": "Biometric Facial Recognition & Access Control System",
  "version": "2.4.0",
  "recognition_threshold": 0.48,
  "personnel": [
    {
      "id": "USR-1042",
      "image": "known_faces/alex_mercer.jpg",
      "name": "Alex Mercer",
      "role": "Lead Robotics Engineer",
      "department": "Autonomous Systems Lab",
      "access_level": "Level 4 - Top Secret",
      "clearance": "ALPHA-01",
      "badge_id": "8920-ENG",
      "status": "AUTHORIZED",
      "issued_date": "2024-03-15"
    },
    {
      "id": "USR-2091",
      "image": "known_faces/elena_rostova.jpg",
      "name": "Dr. Elena Rostova",
      "role": "Chief Medical Officer",
      "department": "Bio-Research & Genetics",
      "access_level": "Level 5 - Maximum Alpha",
      "clearance": "BIO-OMEGA",
      "badge_id": "4102-MED",
      "status": "AUTHORIZED",
      "issued_date": "2023-11-01"
    },
    {
      "id": "USR-3054",
      "image": "known_faces/marcus_vance.jpg",
      "name": "Marcus Vance",
      "role": "Infrastructure Architect",
      "department": "Core Data Centers",
      "access_level": "Level 3 - Operational",
      "clearance": "SEC-BETA",
      "badge_id": "6731-OPS",
      "status": "RESTRICTED",
      "issued_date": "2024-08-20"
    }
  ]
}`
  },
  {
    name: "requirements.txt",
    description: "Python Dependencies for Virtual Environment",
    language: "text",
    content: `opencv-python>=4.8.0.76
face-recognition>=1.3.0
numpy>=1.24.3
Pillow>=10.0.0`
  },
  {
    name: "README.md",
    description: "Complete Setup & Execution Documentation",
    language: "markdown",
    content: `# Biometric Facial Recognition & Credential HUD System

A real-time Python computer-vision application that accesses your webcam, identifies people using registered reference photos and credentials, and overlays a tactical biometric bounding box with their full verified security credentials directly in the live video stream.

## Setup Instructions

1. Install requirements:
   pip install -r requirements.txt

2. Run real-time recognition:
   python main.py

3. Add new person:
   python enroll_person.py

4. Lightweight mode (zero compilation):
   python recognizer_lightweight.py
`
  }
];
