# Biometric Facial Recognition & Credential HUD System

A real-time Python computer-vision application that accesses your webcam, identifies people using registered reference photos and credentials, and overlays a tactical biometric bounding box with their full verified security credentials directly in the live video stream.

---

## 🚀 Features

- **Live Webcam Biometric Tracking:** Tracks faces at 30+ FPS with sub-frame downsampling.
- **Dynamic Credential HUD:** Projects an anchored, semi-transparent identification badge beside/above each detected face with:
  - Full Name
  - Role & Department
  - Employee ID & Badge Number
  - Security Clearance & Access Level
  - Match Confidence Score (%)
  - Authorization Status (`AUTHORIZED`, `RESTRICTED`, `UNKNOWN`)
- **Dual Recognition Engines:**
  - `main.py`: State-of-the-art 128-D deep neural network face embedding via `face_recognition` (dlib).
  - `recognizer_lightweight.py`: Zero-compilation fallback using pure OpenCV (`haarcascade` + template correlation). Works out-of-the-box on any OS without CMake or C++ build tools!
- **Interactive Enrollment Tool (`enroll_person.py`):** Add new individuals instantly via webcam snapshot or image file import with full credential metadata.
- **Snapshot Capture (`s` key):** Automatically saves high-res security surveillance snapshots with credential overlays to `/snapshots/`.

---

## 📋 Prerequisites & Installation

### Option 1: Standard Deep-Learning Setup (`main.py`)

1. **Clone or Extract the Project:**
   ```bash
   cd python_project
   ```

2. **Create and Activate a Virtual Environment:**
   - **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   - **Windows:**
     ```cmd
     python -m venv venv
     venv\Scripts\activate
     ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

   > **Note for Windows users regarding `dlib`:**
   > If `pip install face-recognition` asks for CMake or Visual Studio C++ build tools, either:
   > 1. Install CMake (`pip install cmake`), OR
   > 2. Run the instant fallback script: `python recognizer_lightweight.py` (requires only `pip install opencv-python numpy`!).

---

### Option 2: Lightweight Setup (Zero C++ Build Tools Required)

If you just want to run with pure OpenCV:
```bash
pip install opencv-python numpy
python recognizer_lightweight.py
```

---

## 🎮 Running the System

Start the live webcam biometric recognition stream:

```bash
python main.py
```

### Keyboard Controls:
| Key | Action |
|-----|--------|
| `q` | Quit application |
| `s` | Capture and save surveillance snapshot with HUD |
| `h` | Toggle between Detailed and Compact credential HUD |
| `r` | Hot-reload database from `credentials.json` |

---

## 👤 Enrolling New People & Custom Credentials

### Method 1: Using the Interactive Enrollment CLI
```bash
python enroll_person.py
```
1. Enter the person's name, role, department, access level, and badge number.
2. Select **[1]** to snap a photo with your webcam (press `Spacebar` to snap).
3. The person is instantly saved into `known_faces/` and `credentials.json`.

### Method 2: Manual Registration
1. Put a portrait photo into `known_faces/`, e.g., `known_faces/john_doe.jpg`.
2. Add an entry to `credentials.json`:
```json
{
  "id": "USR-4019",
  "image": "known_faces/john_doe.jpg",
  "name": "John Doe",
  "role": "Cyber Defense Analyst",
  "department": "SOC Operations",
  "access_level": "Level 4 - Top Secret",
  "clearance": "DEF-SIGMA",
  "badge_id": "9021-SOC",
  "status": "AUTHORIZED"
}
```
3. Press `r` in the running webcam window to reload without restarting!

---

## 📁 Directory Structure
```
python_project/
├── main.py                    # Primary deep learning face recognition & HUD
├── recognizer_lightweight.py  # Pure OpenCV fallback (no dlib needed)
├── enroll_person.py           # Wizard to enroll personnel via webcam
├── credentials.json           # Personnel credentials database
├── requirements.txt           # Python package dependencies
├── known_faces/               # Stored photos of enrolled individuals
├── snapshots/                 # Captured surveillance snapshots
├── run.sh                     # Linux/Mac launch helper
└── run.bat                    # Windows launch helper
```
