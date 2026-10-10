"""
NENAPIYUMA AI USB - Security Scanner & ClamAV Engine
Supports portable ClamAV binary execution with offline database definitions,
plus built-in offline heuristics for USB-borne threats (autorun, shortcut worms, suspicious binaries).
"""

import os
import subprocess
import threading
import time
import hashlib
from typing import Dict, Any, List, Optional, Callable, Tuple


class SecurityScanner:
    def __init__(self, clamav_path: str, clamav_db: str):
        self.clamav_path = clamav_path
        self.clamav_db = clamav_db
        self._is_cancelled = False
        self._is_running = False

    def is_engine_available(self) -> Tuple[bool, str]:
        """Verifies if ClamAV executable exists and has offline database signatures."""
        if not os.path.isfile(self.clamav_path):
            return False, f"ClamAV portable executable not found at: {self.clamav_path}"
        
        if not os.path.isdir(self.clamav_db):
            return False, f"ClamAV database directory missing at: {self.clamav_db}"

        # Check for signature files (.cvd, .cld, .cud)
        db_files = [f for f in os.listdir(self.clamav_db) if f.endswith(('.cvd', '.cld', '.cud', '.cdb'))]
        if not db_files:
            return False, f"No signature database files found in {self.clamav_db}"

        return True, f"ClamAV ready with {len(db_files)} offline database files."

    def cancel_scan(self):
        self._is_cancelled = True

    def scan_path(
        self,
        target_path: str,
        progress_callback: Optional[Callable[[int, str, List[Dict[str, Any]]], None]] = None
    ) -> Dict[str, Any]:
        """
        Scans target directory or file.
        Uses ClamAV if available; supplements with USB-specific heuristic analysis.
        """
        self._is_running = True
        start_time = time.time()

        findings: List[Dict[str, Any]] = []
        files_scanned = 0

        engine_ready, engine_msg = self.is_engine_available()

        if not os.path.exists(target_path):
            return {
                "success": False,
                "error": f"Target path does not exist: {target_path}",
                "findings": [],
                "files_scanned": 0,
                "duration": 0
            }

        # Gather target files
        all_files = []
        if os.path.isfile(target_path):
            all_files.append(target_path)
        else:
            for root, _, files in os.walk(target_path):
                for f in files:
                    all_files.append(os.path.join(root, f))
                    if self._is_cancelled:
                        break

        total_count = len(all_files)

        for idx, file_path in enumerate(all_files):
            if self._is_cancelled:
                break

            files_scanned += 1
            threat = self._inspect_file(file_path, engine_ready)
            if threat:
                findings.append(threat)

            if progress_callback and (idx % 10 == 0 or idx == total_count - 1):
                progress_callback(files_scanned, file_path, findings)

        duration = round(time.time() - start_time, 2)
        self._is_running = False

        return {
            "success": True,
            "cancelled": self._is_cancelled,
            "engine_status": engine_msg,
            "files_scanned": files_scanned,
            "threats_found": len(findings),
            "duration": duration,
            "findings": findings
        }

    def _inspect_file(self, file_path: str, use_clamav: bool) -> Optional[Dict[str, Any]]:
        """Inspects an individual file using heuristics, known signatures, and ClamAV."""
        try:
            filename = os.path.basename(file_path).lower()
            file_size = os.path.getsize(file_path)

            # Heuristic 1: Autorun.inf containing suspicious executable references
            if filename == "autorun.inf":
                try:
                    with open(file_path, "r", errors="ignore") as f:
                        content = f.read().lower()
                        if "open=" in content or "shellexecute=" in content:
                            return {
                                "file_path": file_path,
                                "threat_name": "USB.Autorun.SuspiciousExecutor",
                                "severity": "HIGH",
                                "type": "heuristic",
                                "details": "autorun.inf instructs automatic execution of removable drive software"
                            }
                except Exception:
                    pass

            # Heuristic 2: Dangerous double extensions (.doc.exe, .pdf.scr, .jpg.vbs)
            double_exts = [".pdf.exe", ".doc.exe", ".docx.exe", ".xls.exe", ".jpg.scr", ".png.exe"]
            for de in double_exts:
                if filename.endswith(de):
                    return {
                        "file_path": file_path,
                        "threat_name": "USB.Heuristic.DoubleExtension",
                        "severity": "CRITICAL",
                        "type": "heuristic",
                        "details": f"File disguises executable payload as document: {filename}"
                    }

            # Heuristic 3: Windows shortcut (.lnk) targeting powershell or cmd
            if filename.endswith(".lnk"):
                try:
                    with open(file_path, "rb") as f:
                        raw = f.read(4096)
                        if b"powershell" in raw.lower() or b"cmd.exe" in raw.lower() or b"cscript" in raw.lower():
                            return {
                                "file_path": file_path,
                                "threat_name": "USB.ShortcutWorm.Launcher",
                                "severity": "CRITICAL",
                                "type": "heuristic",
                                "details": "LNK shortcut invokes PowerShell or command processor"
                            }
                except Exception:
                    pass

            # EICAR Standard Antivirus Test File detection
            if file_size < 500:
                with open(file_path, "rb") as f:
                    sample = f.read()
                    if b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*" in sample:
                        return {
                            "file_path": file_path,
                            "threat_name": "EICAR-Test-Signature",
                            "severity": "TEST",
                            "type": "signature",
                            "details": "Standard anti-malware test signature"
                        }

            # ClamAV scan invocation for executables and scripts if binary exists
            if use_clamav and (filename.endswith(('.exe', '.dll', '.scr', '.bat', '.cmd', '.vbs', '.ps1', '.zip', '.rar'))):
                clam_res = self._run_clamav_single(file_path)
                if clam_res:
                    return clam_res

        except Exception as e:
            pass
        return None

    def _run_clamav_single(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Runs clamscan.exe against a specific file."""
        try:
            cmd = [
                self.clamav_path,
                f"--database={self.clamav_db}",
                "--no-summary",
                file_path
            ]
            res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15)
            if res.returncode == 1:
                # Virus found
                line = res.stdout.strip()
                threat_name = line.split(":")[-1].replace("FOUND", "").strip() if "FOUND" in line else "ClamAV.DetectedThreat"
                return {
                    "file_path": file_path,
                    "threat_name": threat_name,
                    "severity": "CRITICAL",
                    "type": "clamav",
                    "details": "Confirmed detection by ClamAV offline database"
                }
        except Exception:
            pass
        return None
