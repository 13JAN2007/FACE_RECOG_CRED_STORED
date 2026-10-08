export interface PersonCredential {
  id: string;
  image: string; // url or data url
  name: string;
  role: string;
  department: string;
  access_level: string;
  clearance: string;
  badge_id: string;
  status: 'AUTHORIZED' | 'RESTRICTED' | 'SUSPENDED';
  issued_date: string;
  biometricVector?: number[]; // 256-D normalized feature descriptor
}

export interface DetectedFace {
  x: number;
  y: number;
  width: number;
  height: number;
  matchedPerson?: PersonCredential | null;
  confidence: number;
  isRecognized: boolean;
  boxId: string;
}

export type HudTheme = 'tactical' | 'cyber' | 'corporate' | 'minimal';
