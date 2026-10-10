"""
NENAPIYUMA AI USB - Quarantine Isolation Vault
Safely isolates detected threats by moving them to .nenapiyuma/quarantine,
scrambling execution bytes to prevent accidental execution, and recording metadata.
"""

import os
import uuid
import json
import hashlib
from datetime import datetime
from typing import Dict, Any, Optional, Tuple

# Simple XOR mask used to scramble quarantined file headers
XOR_KEY = 0x5A


class QuarantineVault:
    def __init__(self, quarantine_dir: str):
        self.quarantine_dir = os.path.abspath(quarantine_dir)
        os.makedirs(self.quarantine_dir, exist_ok=True)

    def isolate_file(self, target_path: str, threat_name: str) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Moves file to quarantine vault, scrambles first 4096 bytes so it cannot execute,
        and saves sidecar metadata.
        """
        if not os.path.isfile(target_path):
            return False, f"File does not exist: {target_path}", None

        try:
            # Calculate SHA-256 before quarantine
            sha256 = self._compute_sha256(target_path)
            file_size = os.path.getsize(target_path)
            entry_id = str(uuid.uuid4())
            vault_filename = f"{entry_id}.vir"
            vault_meta_name = f"{entry_id}.meta.json"
            vault_file_path = os.path.join(self.quarantine_dir, vault_filename)
            vault_meta_path = os.path.join(self.quarantine_dir, vault_meta_name)

            # Read and scramble
            with open(target_path, "rb") as src, open(vault_file_path, "wb") as dst:
                header = src.read(4096)
                # XOR invert header bytes
                scrambled_header = bytes([b ^ XOR_KEY for b in header])
                dst.write(scrambled_header)
                # Copy remainder of file as-is
                while chunk := src.read(65536):
                    dst.write(chunk)

            # Remove original file from USB
            os.remove(target_path)

            meta = {
                "id": entry_id,
                "original_path": os.path.abspath(target_path),
                "vault_file_path": vault_file_path,
                "threat_name": threat_name,
                "sha256": sha256,
                "file_size": file_size,
                "quarantined_at": datetime.utcnow().isoformat(),
                "restored": False
            }

            with open(vault_meta_path, "w", encoding="utf-8") as f:
                json.dump(meta, f, indent=2)

            return True, f"File safely quarantined to vault ({entry_id[:8]})", meta

        except Exception as e:
            return False, f"Quarantine operation failed: {str(e)}", None

    def restore_file(self, entry_id: str) -> Tuple[bool, str]:
        """Restores quarantined file back to original location after unscrambling."""
        vault_file = os.path.join(self.quarantine_dir, f"{entry_id}.vir")
        vault_meta = os.path.join(self.quarantine_dir, f"{entry_id}.meta.json")

        if not os.path.isfile(vault_meta) or not os.path.isfile(vault_file):
            return False, "Quarantine record not found."

        try:
            with open(vault_meta, "r", encoding="utf-8") as f:
                meta = json.load(f)

            dest_path = meta["original_path"]
            dest_dir = os.path.dirname(dest_path)
            os.makedirs(dest_dir, exist_ok=True)

            # Unscramble and write back
            with open(vault_file, "rb") as src, open(dest_path, "wb") as dst:
                header = src.read(4096)
                unscrambled = bytes([b ^ XOR_KEY for b in header])
                dst.write(unscrambled)
                while chunk := src.read(65536):
                    dst.write(chunk)

            # Verify restored file hash matches original SHA-256
            restored_sha = self._compute_sha256(dest_path)
            if restored_sha != meta["sha256"]:
                # Abort restore
                os.remove(dest_path)
                return False, "Integrity check mismatch during restoration!"

            meta["restored"] = True
            with open(vault_meta, "w", encoding="utf-8") as f:
                json.dump(meta, f, indent=2)

            # Remove vault scrambled copy
            os.remove(vault_file)
            return True, f"File successfully restored to: {dest_path}"

        except Exception as e:
            return False, f"Restoration failed: {str(e)}"

    def delete_quarantined_permanently(self, entry_id: str) -> Tuple[bool, str]:
        """Permanently purges quarantined threat file and metadata."""
        vault_file = os.path.join(self.quarantine_dir, f"{entry_id}.vir")
        vault_meta = os.path.join(self.quarantine_dir, f"{entry_id}.meta.json")

        deleted = False
        if os.path.isfile(vault_file):
            os.remove(vault_file)
            deleted = True
        if os.path.isfile(vault_meta):
            os.remove(vault_meta)
            deleted = True

        if deleted:
            return True, "Quarantined threat permanently purged."
        return False, "Quarantine record not found."

    def _compute_sha256(self, path: str) -> str:
        h = hashlib.sha256()
        with open(path, "rb") as f:
            while chunk := f.read(65536):
                h.update(chunk)
        return h.hexdigest()
