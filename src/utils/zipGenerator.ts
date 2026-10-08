import JSZip from 'jszip';
import { PersonCredential } from '../types';
import { PYTHON_FILES } from '../data/defaultPersonnel';

// Converts base64 or DataURL to binary Uint8Array
function dataUriToUint8Array(dataURI: string): Uint8Array {
  const base64Index = dataURI.indexOf(';base64,');
  if (base64Index !== -1) {
    const raw = atob(dataURI.substring(base64Index + 8));
    const array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }
  return new TextEncoder().encode(dataURI);
}

export async function generateProjectZip(personnel: PersonCredential[]): Promise<Blob> {
  const zip = new JSZip();
  const root = zip.folder("python_face_recognition_system") || zip;

  // 1. Add all python files
  for (const file of PYTHON_FILES) {
    if (file.name === "credentials.json") {
      // Build dynamic credentials.json from current state
      const credentialsObj = {
        system_title: "Biometric Facial Recognition & Access Control System",
        version: "2.4.0",
        recognition_threshold: 0.55,
        personnel: personnel.map(p => ({
          id: p.id,
          image: p.image.startsWith('data:') ? `known_faces/${p.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg` : p.image.replace(/^\//, 'known_faces/'),
          name: p.name,
          role: p.role,
          department: p.department,
          access_level: p.access_level,
          clearance: p.clearance,
          badge_id: p.badge_id,
          status: p.status,
          issued_date: p.issued_date || "2024-01-01"
        }))
      };
      root.file("credentials.json", JSON.stringify(credentialsObj, null, 2));
    } else {
      root.file(file.name, file.content);
    }
  }

  // 2. Add run scripts
  root.file("run.sh", `#!/bin/bash
echo "=== Starting Biometric Face Recognition & Credential HUD ==="
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi
python3 main.py
`);

  root.file("run.bat", `@echo off
echo === Starting Biometric Face Recognition & Credential HUD ===
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
    call venv\\Scripts\\activate.bat
    echo Installing dependencies...
    pip install -r requirements.txt
) else (
    call venv\\Scripts\\activate.bat
)
python main.py
pause
`);

  // 3. Add known_faces images folder
  const facesFolder = root.folder("known_faces");
  if (facesFolder) {
    for (const p of personnel) {
      const fileName = `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`;
      if (p.image.startsWith('data:image/')) {
        const bytes = dataUriToUint8Array(p.image);
        facesFolder.file(fileName, bytes);
      } else {
        // Try fetching local sample image
        try {
          const resp = await fetch(p.image);
          if (resp.ok) {
            const blob = await resp.blob();
            facesFolder.file(fileName, blob);
          }
        } catch {
          // Fallback dummy image if network fails
        }
      }
    }
  }

  // Generate ZIP blob
  return await zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
