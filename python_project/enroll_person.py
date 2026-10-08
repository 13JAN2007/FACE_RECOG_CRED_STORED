#!/usr/bin/env python3
"""
Personnel Enrollment Utility
----------------------------
Capture reference photo(s) from webcam or import an existing image,
validates that a clear human face is detected using face_recognition,
and saves validated credentials to credentials.json and known_faces/.

Run:
    python enroll_person.py
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

os.makedirs(KNOWN_FACES_DIR, exist_ok=True)


def enroll():
    print("=" * 60)
    print(" BIOMETRIC PERSONNEL ENROLLMENT WIZARD")
    print("=" * 60)

    name = input("\nEnter Full Name: ").strip()
    if not name:
        print("[!] Error: Name cannot be empty.")
        return

    safe_name = name.lower().replace(" ", "_").replace(".", "")
    person_id = f"USR-{int(time.time()) % 10000:04d}"
    print(f"Generated System ID: {person_id}")

    role = input("Enter Role / Title [e.g. Systems Engineer]: ").strip() or "Security Specialist"
    dept = input("Enter Department [e.g. Operations]: ").strip() or "Information Security"
    access_lvl = input("Enter Access Level [e.g. Level 4 - Top Secret]: ").strip() or "Level 3 - Operational"
    clearance = input("Enter Security Clearance Code [e.g. SEC-01]: ").strip() or "ALPHA-01"
    badge_id = input("Enter Badge ID [e.g. 5012-SEC]: ").strip() or f"{person_id}-B"
    status = input("Status (1: AUTHORIZED, 2: RESTRICTED) [default 1]: ").strip()
    status_str = "RESTRICTED" if status == "2" else "AUTHORIZED"

    photo_filename = f"{safe_name}.jpg"
    photo_rel_path = f"known_faces/{photo_filename}"
    photo_full_path = os.path.join(BASE_DIR, photo_rel_path)

    print("\nHow would you like to provide the reference photo?")
    print("  [1] Capture live from webcam (recommended)")
    print("  [2] Provide path to an existing image file")
    choice = input("Select option (1 or 2): ").strip()

    captured_frame = None

    if choice == "2":
        src_path = input("Enter image path: ").strip().strip("\"'")
        if not os.path.exists(src_path):
            print(f"[!] File not found: {src_path}")
            return
        img = cv2.imread(src_path)
        if img is None:
            print("[!] Unable to read image file.")
            return

        if HAS_FACE_REC:
            rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            faces = face_recognition.face_locations(rgb)
            if len(faces) == 0:
                print("[!] ERROR: No human face detected in this image!")
                print("    Please provide a clear frontal portrait with good lighting.")
                return
            print(f"[+] Verified: Detected {len(faces)} face(s) in image.")

        cv2.imwrite(photo_full_path, img)
        print(f"[+] Photo copied to {photo_full_path}")

    else:
        print("\nOpening webcam... Center your face in the camera.")
        print("Controls: Press [SPACEBAR] to take photo, [q] to cancel.")
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("[!] Could not open webcam device 0.")
            return

        while True:
            ret, frame = cap.read()
            if not ret:
                continue

            preview = frame.copy()
            h, w, _ = preview.shape
            box_s = 250
            x1, y1 = (w - box_s) // 2, (h - box_s) // 2
            x2, y2 = x1 + box_s, y1 + box_s

            cv2.rectangle(preview, (x1, y1), (x2, y2), (0, 255, 120), 2)
            cv2.putText(preview, "ALIGN FACE HERE - PRESS [SPACE] TO SNAP", (30, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 120), 2)

            cv2.imshow("Enrollment Photo Capture", preview)
            k = cv2.waitKey(1) & 0xFF
            if k == 32:  # Spacebar
                # Verify face presence before accepting!
                if HAS_FACE_REC:
                    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    faces = face_recognition.face_locations(rgb)
                    if len(faces) == 0:
                        print("\n[!] No face detected in captured frame. Please face the camera and try again.")
                        continue
                    print(f"\n[+] Biometric face verified ({len(faces)} detected face)!")
                captured_frame = frame
                break
            elif k == ord('q'):
                print("Enrollment cancelled.")
                cap.release()
                cv2.destroyAllWindows()
                return

        cap.release()
        cv2.destroyAllWindows()

        if captured_frame is not None:
            cv2.imwrite(photo_full_path, captured_frame)
            print(f"[+] Photo saved to: {photo_full_path}")

    # Update credentials.json
    data = {"system_title": "Biometric System", "recognition_threshold": 0.48, "personnel": []}
    if os.path.exists(CREDENTIALS_FILE):
        try:
            with open(CREDENTIALS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            pass

    new_person = {
        "id": person_id,
        "image": photo_rel_path,
        "name": name,
        "role": role,
        "department": dept,
        "access_level": access_lvl,
        "clearance": clearance,
        "badge_id": badge_id,
        "status": status_str,
        "issued_date": time.strftime("%Y-%m-%d")
    }

    # Replace existing with same ID or name
    data["personnel"] = [p for p in data.get("personnel", []) if p.get("id") != person_id and p.get("name") != name]
    data["personnel"].append(new_person)
    data["recognition_threshold"] = 0.48

    with open(CREDENTIALS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

    print("\n" + "=" * 60)
    print(f" SUCCESS: {name} enrolled into biometric database!")
    print(f" System ID: {person_id} | Status: {status_str}")
    print(" You can now run 'python main.py' to test webcam detection.")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    enroll()
