#!/usr/bin/env python3
"""
Biometric Face Recognition & Credential HUD System
--------------------------------------------------
Accesses webcam in real-time, identifies registered individuals
using stored photos, and overlays their verified security credentials
directly onto the recognized bounding box in the camera feed.

Strict biometric verification: Rejects unverified or unknown faces
with [ACCESS DENIED // UNKNOWN] and only verifies faces with distance < threshold.

Requirements:
    pip install -r requirements.txt
Run:
    python main.py
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
    print("\n[!] 'face_recognition' library is not installed.")
    print("    Install it via: pip install face-recognition")
    print("    Or run the zero-dependency fallback: python recognizer_lightweight.py\n")
    sys.exit(1)


# Path configurations
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
        # Support multiple encodings per person for robust angle/lighting recognition
        self.known_face_encodings: List[np.ndarray] = []
        self.known_face_ids: List[str] = []
        # Strict security threshold (0.48 eliminates false positives)
        self.recognition_threshold = 0.48
        self.compact_hud = False
        self.load_database()

    def load_database(self) -> None:
        """Loads credentials.json and extracts face encodings from stored photos."""
        print("[*] Loading credential database...")
        if not os.path.exists(self.credentials_path):
            print(f"[!] Warning: {self.credentials_path} not found.")
            return

        with open(self.credentials_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.recognition_threshold = float(data.get("recognition_threshold", 0.48))
        personnel_list = data.get("personnel", [])

        self.known_face_encodings.clear()
        self.known_face_ids.clear()
        self.credentials_db.clear()

        valid_enrollees = 0
        for person in personnel_list:
            person_id = person.get("id")
            img_rel_path = person.get("image")
            name = person.get("name", "Unknown")
            if not person_id or not img_rel_path:
                continue

            img_full_path = os.path.join(BASE_DIR, img_rel_path)
            self.credentials_db[person_id] = person

            if not os.path.exists(img_full_path):
                print(f"  [-] Photo not found: {img_rel_path} for {name}")
                continue

            try:
                # Load image and compute face encoding
                loaded_img = face_recognition.load_image_file(img_full_path)
                encodings = face_recognition.face_encodings(loaded_img)
                if encodings and len(encodings) > 0:
                    for enc in encodings:
                        self.known_face_encodings.append(enc)
                        self.known_face_ids.append(person_id)
                    valid_enrollees += 1
                    print(f"  [+] Enrolled {name} ({person_id}) with {len(encodings)} valid face vector(s)")
                else:
                    print(f"  [!] WARNING: NO FACE DETECTED in reference photo for {name} ({img_rel_path})!")
                    print(f"      Please replace {img_rel_path} with a clear frontal photo using enroll_person.py")
            except Exception as e:
                print(f"  [-] Error processing {img_rel_path}: {e}")

        print(f"[*] Biometric Index Ready: {valid_enrollees} enrollees with {len(self.known_face_encodings)} vectors.")
        print(f"[*] Strict Verification Threshold: {self.recognition_threshold:.2f} (Distances above this are rejected)\n")

    def draw_tech_corners(self, img: np.ndarray, x1: int, y1: int, x2: int, y2: int, color: Tuple[int, int, int], length: int = 18, thickness: int = 2):
        """Draws high-tech sci-fi corner brackets around the face box."""
        cv2.line(img, (x1, y1), (x1 + length, y1), color, thickness)
        cv2.line(img, (x1, y1), (x1, y1 + length), color, thickness)
        cv2.line(img, (x2, y1), (x2 - length, y1), color, thickness)
        cv2.line(img, (x2, y1), (x2, y1 + length), color, thickness)
        cv2.line(img, (x1, y2), (x1 + length, y2), color, thickness)
        cv2.line(img, (x1, y2), (x1, y2 - length), color, thickness)
        cv2.line(img, (x2, y2), (x2 - length, y2), color, thickness)
        cv2.line(img, (x2, y2), (x2, y2 - length), color, thickness)

    def draw_credential_card(
        self,
        frame: np.ndarray,
        top: int,
        right: int,
        bottom: int,
        left: int,
        creds: Optional[dict],
        confidence: float,
        best_distance: float
    ) -> None:
        """Overlays credential HUD box anchored directly to the face bounding box."""
        h_frame, w_frame, _ = frame.shape

        is_authorized = creds and creds.get("status") == "AUTHORIZED"
        is_restricted = creds and creds.get("status") == "RESTRICTED"
        is_known = creds is not None

        if is_authorized:
            theme_color = (0, 220, 100)      # Emerald Green
            status_text = "ACCESS GRANTED // AUTHORIZED"
            header_bg = (10, 60, 25)
        elif is_restricted:
            theme_color = (0, 180, 255)      # Amber / Orange
            status_text = "RESTRICTED ACCESS // FLAG"
            header_bg = (15, 45, 70)
        else:
            theme_color = (60, 60, 240)      # Crimson Red
            status_text = "UNKNOWN SUBJECT // UNREGISTERED"
            header_bg = (20, 20, 70)

        # 1. Bounding box & corner brackets
        cv2.rectangle(frame, (left, top), (right, bottom), theme_color, 1)
        self.draw_tech_corners(frame, left, top, right, bottom, theme_color, length=20, thickness=3)

        # Reticle center
        cx, cy = (left + right) // 2, (top + bottom) // 2
        cv2.circle(frame, (cx, cy), 4, theme_color, -1)
        cv2.line(frame, (cx - 10, cy), (cx + 10, cy), theme_color, 1)
        cv2.line(frame, (cx, cy - 10), (cx, cy + 10), theme_color, 1)

        # 2. Build Lines
        if is_known:
            name = creds.get("name", "Unknown")
            role = creds.get("role", "N/A")
            dept = creds.get("department", "N/A")
            badge = creds.get("badge_id", creds.get("id", "N/A"))
            access_lvl = creds.get("access_level", "Standard")
            clearance = creds.get("clearance", "UNCLASSIFIED")

            lines = [
                ("NAME", name, (255, 255, 255), 0.55, 2),
                ("ID / BADGE", f"{creds.get('id', '')} | {badge}", (200, 220, 255), 0.45, 1),
                ("ROLE", role, (210, 210, 210), 0.45, 1),
                ("DEPT", dept, (190, 190, 190), 0.42, 1),
                ("ACCESS", access_lvl, theme_color, 0.45, 1),
                ("CLEARANCE", clearance, (255, 215, 0), 0.45, 1),
                ("MATCH", f"{confidence:.1f}% (Dist: {best_distance:.2f})", (180, 255, 180), 0.42, 1),
            ]
        else:
            lines = [
                ("IDENTITY", "NO MATCH IN DATABASE", (200, 200, 255), 0.50, 1),
                ("DISTANCE", f"{best_distance:.2f} (Required < {self.recognition_threshold:.2f})", (120, 140, 255), 0.42, 1),
                ("ACTION", "SUBJECT NOT ENROLLED", (80, 100, 255), 0.45, 1),
                ("CLEARANCE", "NONE (GUEST ESCORT REQUIRED)", (100, 100, 255), 0.45, 1),
            ]

        # 3. Position Credential Box
        card_w = 300
        line_height = 22
        card_h = 36 + len(lines) * line_height + 12

        card_x1 = right + 15
        card_y1 = top

        if card_x1 + card_w > w_frame - 10:
            card_x1 = left - card_w - 15
        if card_x1 < 10:
            card_x1 = max(10, min(left, w_frame - card_w - 10))
            card_y1 = bottom + 12

        if card_y1 + card_h > h_frame - 10:
            card_y1 = max(10, h_frame - card_h - 10)
        if card_y1 < 10:
            card_y1 = 10

        card_x2 = card_x1 + card_w
        card_y2 = card_y1 + card_h

        # Connector line
        conn_start = (right, (top + bottom) // 2) if card_x1 > right else (left, (top + bottom) // 2)
        conn_end = (card_x1 if card_x1 > right else card_x2, min(card_y2, max(card_y1, (top + bottom) // 2)))
        cv2.line(frame, conn_start, conn_end, theme_color, 1)

        # Transparent overlay
        overlay = frame.copy()
        cv2.rectangle(overlay, (card_x1, card_y1), (card_x2, card_y2), (15, 18, 24), -1)
        cv2.rectangle(overlay, (card_x1, card_y1), (card_x2, card_y1 + 28), header_bg, -1)
        cv2.addWeighted(overlay, 0.85, frame, 0.15, 0, frame)

        cv2.rectangle(frame, (card_x1, card_y1), (card_x2, card_y2), theme_color, 1)
        cv2.line(frame, (card_x1, card_y1 + 28), (card_x2, card_y1 + 28), theme_color, 1)

        cv2.putText(
            frame,
            status_text,
            (card_x1 + 8, card_y1 + 19),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.40,
            theme_color,
            1,
            cv2.LINE_AA,
        )

        cur_y = card_y1 + 48
        for label, val, text_color, scale, thick in lines:
            cv2.putText(frame, f"{label}:", (card_x1 + 10, cur_y), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (140, 160, 180), 1, cv2.LINE_AA)
            cv2.putText(frame, val, (card_x1 + 85, cur_y), cv2.FONT_HERSHEY_SIMPLEX, scale, text_color, thick, cv2.LINE_AA)
            cur_y += line_height

    def run(self, camera_index: int = 0) -> None:
        """Starts real-time webcam video stream and recognition loop."""
        print(f"[*] Initializing webcam stream on device index {camera_index}...")
        video_capture = cv2.VideoCapture(camera_index)

        if not video_capture.isOpened():
            print(f"[!] Error: Unable to open webcam at index {camera_index}.")
            return

        video_capture.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        video_capture.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

        window_title = "Biometric Face Recognition & Credential HUD"
        cv2.namedWindow(window_title, cv2.WINDOW_NORMAL)

        process_this_frame = True
        face_locations = []
        face_matches = []

        fps_start_time = time.time()
        fps_frame_count = 0
        current_fps = 0.0

        print("\n" + "=" * 60)
        print(" BIOMETRIC CAMERA STREAM ACTIVE")
        print(f" Enrolled Face Vectors: {len(self.known_face_encodings)}")
        print(f" Rejection Threshold: {self.recognition_threshold}")
        print(" Controls:")
        print("   [q] : Quit")
        print("   [s] : Save snapshot")
        print("   [r] : Reload database from credentials.json")
        print("=" * 60 + "\n")

        while True:
            ret, frame = video_capture.read()
            if not ret or frame is None:
                time.sleep(0.05)
                continue

            fps_frame_count += 1
            if time.time() - fps_start_time >= 1.0:
                current_fps = fps_frame_count / (time.time() - fps_start_time)
                fps_frame_count = 0
                fps_start_time = time.time()

            if process_this_frame:
                small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
                rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

                face_locations = face_recognition.face_locations(rgb_small_frame, model="hog")
                face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

                face_matches = []
                for face_encoding in face_encodings:
                    matched_creds = None
                    confidence = 0.0
                    best_distance = 1.0

                    if len(self.known_face_encodings) > 0:
                        distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                        best_match_index = int(np.argmin(distances))
                        best_distance = float(distances[best_match_index])

                        # STRICT THRESHOLD VERIFICATION
                        if best_distance <= self.recognition_threshold:
                            person_id = self.known_face_ids[best_match_index]
                            matched_creds = self.credentials_db.get(person_id)
                            # Convert Euclidean distance (0.0 to 0.48) to confidence %
                            confidence = max(0.0, min(99.9, (1.0 - best_distance) * 100))
                        else:
                            # Distance is too high -> STRICT REJECTION as UNKNOWN
                            matched_creds = None
                            confidence = max(0.0, min(100.0, (1.0 - best_distance) * 100))

                    face_matches.append((matched_creds, confidence, best_distance))

            process_this_frame = not process_this_frame

            for (top, right, bottom, left), (creds, conf, dist) in zip(face_locations, face_matches):
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4
                self.draw_credential_card(frame, top, right, bottom, left, creds, conf, dist)

            # Top HUD bar
            h, w, _ = frame.shape
            top_hud_overlay = frame.copy()
            cv2.rectangle(top_hud_overlay, (0, 0), (w, 36), (10, 12, 16), -1)
            cv2.addWeighted(top_hud_overlay, 0.75, frame, 0.25, 0, frame)

            cv2.putText(frame, "BIOMETRIC SENTINEL v2.4 | ACTIVE", (16, 23), cv2.FONT_HERSHEY_SIMPLEX, 0.50, (0, 240, 180), 1, cv2.LINE_AA)
            stats = f"ENROLLEES: {len(self.known_face_ids)} | FPS: {current_fps:.1f} | THRESHOLD: {self.recognition_threshold:.2f}"
            cv2.putText(frame, stats, (w - 360, 23), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (180, 200, 220), 1, cv2.LINE_AA)

            cv2.imshow(window_title, frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord("q"):
                break
            elif key == ord("s"):
                snap_path = os.path.join(SNAPSHOTS_DIR, f"snapshot_{int(time.time())}.jpg")
                cv2.imwrite(snap_path, frame)
                print(f"[+] Snapshot saved: {snap_path}")
            elif key == ord("r"):
                print("[*] Hot reloading credentials...")
                self.load_database()

        video_capture.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    app = BiometricHUDApp()
    app.run()
