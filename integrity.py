"""
NENAPIYUMA AI USB - File Integrity Checker
Verifies hashes of core application files and model weights against stored signatures.
"""

import os
import json
import hashlib
from typing import Dict, Any, List


class IntegrityAuditor:
    def __init__(self, base_dir: str):
        self.base_dir = os.path.abspath(base_dir)
        self.catalog_path = os.path.join(self.base_dir, "config", "integrity_catalog.json")

    def generate_catalog(self, target_relative_files: List[str]) -> Dict[str, str]:
        """Calculates SHA-256 for list of files and writes catalog."""
        catalog = {}
        for rel_p in target_relative_files:
            full_p = os.path.join(self.base_dir, rel_p)
            if os.path.isfile(full_p):
                catalog[rel_p] = self._hash_file(full_p)
        
        os.makedirs(os.path.dirname(self.catalog_path), exist_ok=True)
        with open(self.catalog_path, "w", encoding="utf-8") as f:
            json.dump(catalog, f, indent=2)
        return catalog

    def audit(self) -> Dict[str, Any]:
        """Audits current files against stored catalog."""
        if not os.path.isfile(self.catalog_path):
            return {
                "status": "NO_CATALOG",
                "message": "Integrity catalog has not been generated yet.",
                "details": []
            }

        try:
            with open(self.catalog_path, "r", encoding="utf-8") as f:
                catalog = json.load(f)
        except Exception as e:
            return {
                "status": "ERROR",
                "message": f"Failed to parse catalog: {str(e)}",
                "details": []
            }

        results = []
        has_mismatch = False

        for rel_p, expected_hash in catalog.items():
            full_p = os.path.join(self.base_dir, rel_p)
            if not os.path.exists(full_p):
                results.append({
                    "file": rel_p,
                    "status": "MISSING",
                    "details": "Critical file missing from disk."
                })
                has_mismatch = True
            else:
                curr_hash = self._hash_file(full_p)
                if curr_hash == expected_hash:
                    results.append({
                        "file": rel_p,
                        "status": "VERIFIED",
                        "details": "SHA-256 matches verified build signature."
                    })
                else:
                    results.append({
                        "file": rel_p,
                        "status": "MODIFIED",
                        "details": "Hash mismatch! File modified or corrupted."
                    })
                    has_mismatch = True

        return {
            "status": "TAMPERED_OR_CORRUPT" if has_mismatch else "VERIFIED_CLEAN",
            "message": "All core files and model weights verified intact." if not has_mismatch else "Integrity discrepancies detected!",
            "details": results
        }

    def _hash_file(self, full_p: str) -> str:
        h = hashlib.sha256()
        with open(full_p, "rb") as f:
            while chunk := f.read(2 * 1024 * 1024):
                h.update(chunk)
        return h.hexdigest()
