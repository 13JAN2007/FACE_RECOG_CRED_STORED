#!/usr/bin/env python3
"""
Lightweight Face Recognition & Credential HUD (Pure OpenCV - No dlib required)
------------------------------------------------------------------------------
Runs with just standard OpenCV (`pip install opencv-python numpy`).
Strict threshold: Rejects any face that does not match stored biometric templates.

Run:
    python recognizer_lightweight.py
"""

import os
import json
import time
from typing import Dict, List, Tuple, Optional
import cv2
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_FILE = os.path.join(BASE_DIR, "credentials.json")
KNOWN_FACES_DIR = os.path.join(BASE_DIR, "known_faces")
SNAPSHOTS_DIR = os.path.join(BASE_DIR, "snapshots")

os.makedirs(KNOWN_FACES_DIR, exist_ok=True)
os.makedirs(SNAPSHOTS_DIR, exist_ok=True)


class LightweightBiometricHUD:
    def __init__(self, credentials_path: str = CREDENTIALS_FILE):
        self.credentials_path = credentials_path
        self.credentials_db: Dict[str, dict] = {}
        self.known_templates: List[Tuple[str, np.ndarray]] = []

        # Strict template matching threshold (0.72)
        # Prevents false positive matching of arbitrary strangers
        self.match_threshold = 0.72

        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        self.load_database()

    def extract_features(self, gray_roi: np.ndarray) -> np.ndarray:
        """Pre-processes face ROI to normalized 120x120 histogram-equalized template."""
        resized = cv2.resize(gray_roi, (120, 120))
        # Histogram equalization normalizes lighting
        eq = cv2.equalizeHist(resized)
        return eq

    def load_database(self) -> None:
        """Loads credentials and pre-computes normalized templates."""
        print("[*] Loading database for lightweight recognition...")
        if not os.path.exists(self.credentials_path):
            print(f"[!] Warning: {self.credentials_path} not found.")
            return

        with open(self.credentials_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.known_templates.clear()
        self.credentials_db.clear()

        for person in data.get("personnel", []):
            person_id = person.get("id")
            img_rel_path = person.get("image")
            if not person_id or not img_rel_path:
                continue

            img_full_path = os.path.join(BASE_DIR, img_rel_path)
            self.credentials_db[person_id] = person

            if not os.path.exists(img_full_path):
                continue

            img = cv2.imread(img_full_path)
            if img is None:
                continue

            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))

            if len(faces) > 0:
                x, y, w, h = faces[0]
                face_norm = self.extract_features(gray[y:y+h, x:x+w])
                self.known_templates.append((person_id, face_norm))
                print(f"  [+] Enrolled: {person.get('name')} ({person_id})")
            else:
                face_norm = self.extract_features(gray)
                self.known_templates.append((person_id, face_norm))
                print(f"  [+] Enrolled (Frame): {person.get('name')} ({person_id})")

        print(f"[*] Lightweight engine ready with {len(self.known_templates)} templates.")
        print(f"[*] Strict threshold: {self.match_threshold} (Rejects false positives)\n")

    def match_face(self, face_gray: np.ndarray) -> Tuple[Optional[dict], float, float]:
        """Matches a detected face ROI against stored templates with strict correlation threshold."""
        if not self.known_templates:
            return None, 0.0, 0.0

        target = self.extract_features(face_gray)
        best_score = -1.0
        best_id = None

        for person_id, template in self.known_templates:
            # Normalized cross-correlation
            res = cv2.matchTemplate(target, template, cv2.TM_CCOEFF_NORMED)
            score = float(res[0][0])
            if score > best_score:
                best_score = score
                best_id = person_id

        # STRICT THRESHOLD VERIFICATION:
        # Only accept match if correlation exceeds strict threshold!
        if best_score >= self.match_threshold and best_id:
            confidence = min(99.0, max(70.0, best_score * 100))
            return self.credentials_db.get(best_id), confidence, best_score

        # Unmatched / below threshold -> Strictly None!
        return None, max(0.0, best_score * 100), best_score

    def draw_hud(self, frame: np.ndarray, x: int, y: int, w: int, h: int, creds: Optional[dict], conf: float, score: float) -> None:
        """Draws credential box overlay."""
        f_h, f_w, _ = frame.shape
        is_auth = creds and creds.get("status") == "AUTHORIZED"
        is_known = creds is not None

        color = (0, 220, 100) if is_auth else (60, 60, 240) if not is_known else (0, 180, 255)
        status_txt = "AUTHORIZED" if is_auth else "UNKNOWN SUBJECT" if not is_known else "RESTRICTED"

        # Bounding box & tech corners
        cv2.rectangle(frame, (x, y), (x + w, y + h), color, 1)
        l = 18
        cv2.line(frame, (x, y), (x + l, y), color, 2)
        cv2.line(frame, (x, y), (x, y + l), color, 2)
        cv2.line(frame, (x + w, y), (x + w - l, y), color, 2)
        cv2.line(frame, (x + w, y), (x + w, y + l), color, 2)
        cv2.line(frame, (x, y + h), (x + l, y + h), color, 2)
        cv2.line(frame, (x, y + h), (x, y + h - l), color, 2)
        cv2.line(frame, (x + w, y + h), (x + w - l, y + h), color, 2)
        cv2.line(frame, (x + w, y + h), (x + w, y + h - l), color, 2)

        # Credentials card
        cw, ch = 280, 160
        cx = x + w + 15
        cy = y
        if cx + cw > f_w - 10:
            cx = x - cw - 15
        if cx < 10:
            cx = max(10, x)
            cy = min(f_h - ch - 10, y + h + 15)
        cy = max(10, min(f_h - ch - 10, cy))

        overlay = frame.copy()
        cv2.rectangle(overlay, (cx, cy), (cx + cw, cy + ch), (15, 18, 24), -1)
        cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)
        cv2.rectangle(frame, (cx, cy), (cx + cw, cy + ch), color, 1)

        cv2.putText(frame, f"STATUS: {status_txt}", (cx + 8, cy + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.42, color, 1, cv2.LINE_AA)

        if creds:
            cv2.putText(frame, f"NAME: {creds.get('name')}", (cx + 8, cy + 48), cv2.FONT_HERSHEY_SIMPLEX, 0.50, (255, 255, 255), 1, cv2.LINE_AA)
            cv2.putText(frame, f"ROLE: {creds.get('role')}", (cx + 8, cy + 72), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (200, 200, 200), 1, cv2.LINE_AA)
            cv2.putText(frame, f"ID: {creds.get('id')} | {creds.get('badge_id')}", (cx + 8, cy + 94), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (180, 210, 255), 1, cv2.LINE_AA)
            cv2.putText(frame, f"CLEARANCE: {creds.get('clearance')}", (cx + 8, cy + 116), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (255, 215, 0), 1, cv2.LINE_AA)
            cv2.putText(frame, f"MATCH: {conf:.1f}% (Score: {score:.2f})", (cx + 8, cy + 138), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (180, 255, 180), 1, cv2.LINE_AA)
        else:
            cv2.putText(frame, "NAME: UNVERIFIED STRANGER", (cx + 8, cy + 52), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 220), 1, cv2.LINE_AA)
            cv2.putText(frame, f"SCORE: {score:.2f} (Required > {self.match_threshold:.2f})", (cx + 8, cy + 78), cv2.FONT_HERSHEY_SIMPLEX, 0.40, (120, 140, 255), 1, cv2.LINE_AA)
            cv2.putText(frame, "ACCESS: ACCESS DENIED", (cx + 8, cy + 104), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (100, 120, 255), 1, cv2.LINE_AA)
            cv2.putText(frame, "CLEARANCE: NONE (GUEST PROTOCOL)", (cx + 8, cy + 130), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (140, 140, 180), 1, cv2.LINE_AA)

    def run(self, camera_index: int = 0):
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            print(f"[!] Cannot open camera {camera_index}")
            return

        print("[*] Lightweight Biometric HUD Active. Press 'q' to quit.")
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.15, minNeighbors=5, minSize=(70, 70))

            for (x, y, w, h) in faces:
                face_roi = gray[y:y+h, x:x+w]
                creds, conf, score = self.match_face(face_roi)
                self.draw_hud(frame, x, y, w, h, creds, conf, score)

            cv2.imshow("Lightweight Biometric HUD (OpenCV)", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        cap.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    app = LightweightBiometricHUD()
    app.run()
