export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  tokens?: number;
}

export interface DriveInfo {
  letter: string;
  name: string;
  totalGb: number;
  freeGb: number;
  type: 'removable' | 'fixed';
}

export interface ScanFinding {
  id: string;
  filePath: string;
  threatName: string;
  severity: 'CRITICAL' | 'HIGH' | 'TEST';
  type: 'clamav' | 'heuristic' | 'signature';
  details: string;
  quarantined: boolean;
}

export interface QuarantineRecord {
  id: string;
  originalPath: string;
  vaultPath: string;
  threatName: string;
  sha256: string;
  fileSizeBytes: number;
  quarantinedAt: string;
  isRestored: boolean;
}

export interface IntegrityRecord {
  file: string;
  expectedHash: string;
  actualHash: string;
  status: 'VERIFIED' | 'TAMPERED' | 'MISSING';
}

export interface ProjectFile {
  path: string;
  category: 'core' | 'ai' | 'security' | 'config' | 'scripts' | 'workflow' | 'docs' | 'tests';
  description: string;
  content: string;
}
