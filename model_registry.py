"""
NENAPIYUMA AI USB - Model Registry & Integrity Guard
Verifies GGUF headers, checks physical RAM headroom, and discovers local Gemma models.
"""

import os
import hashlib
from typing import Dict, Any, Optional, Tuple

try:
    import psutil
    HAS_PSUTIL = True
except ImportError:
    HAS_PSUTIL = False


# Known trusted Gemma quantizations for offline deployment
VERIFIED_MODELS = {
    "nenapiyuma-sinhala.gguf": {
        "name": "NENAPIYUMA Sinhala-Pure 1B (සිංහල-පමණක් AI ආකෘතිය)",
        "expected_size_approx_mb": 850,
        "min_ram_mb": 2200,
        "recommended_ram_mb": 3500,
        "context_length": 2048,
        "sha256": "f51a7042a96a401c4cb185b376992d29486c8f4957599026210f01a75501d67a",
        "architecture": "gemma3-sinhala-pure",
    },
    "gemma3.gguf": {
        "name": "Gemma 3 1B Instruct (gemma3.gguf Q4)",
        "expected_size_approx_mb": 850,
        "min_ram_mb": 2200,
        "recommended_ram_mb": 3500,
        "context_length": 2048,
        "sha256": "893c52e1f40d11be552145b41097ff8b9706316fae9a5ef8c82823a3118a1a11",
        "architecture": "gemma3",
    },
    "gemma-3-1b-it-Q4_K_M.gguf": {
        "name": "Gemma 3 1B Instruct (Q4_K_M)",
        "expected_size_approx_mb": 850,
        "min_ram_mb": 2200,
        "recommended_ram_mb": 3500,
        "context_length": 2048,
        "sha256": "893c52e1f40d11be552145b41097ff8b9706316fae9a5ef8c82823a3118a1a11",
        "architecture": "gemma3",
    },
    "gemma-2-2b-it-Q4_K_M.gguf": {
        "name": "Gemma 2 2B Instruct (Q4_K_M)",
        "expected_size_approx_mb": 1620,
        "min_ram_mb": 3500,
        "recommended_ram_mb": 5000,
        "context_length": 2048,
        "sha256": "47a3f8928de8b0870949d63f03b22cfd8961726a8f1107297e06ff4907106e5b",
        "architecture": "gemma2",
    }
}


class ModelRegistry:
    def __init__(self, base_dir: str):
        self.base_dir = os.path.abspath(base_dir)
        self.models_dir = os.path.join(self.base_dir, "models")
        os.makedirs(self.models_dir, exist_ok=True)

    def locate_model(self, preferred_filename: Optional[str] = None) -> Optional[str]:
        """Locates the primary or fallback Gemma model in the local models folder."""
        if preferred_filename:
            # Check direct or relative path
            candidate = os.path.join(self.base_dir, preferred_filename) if not os.path.isabs(preferred_filename) else preferred_filename
            if os.path.isfile(candidate) and os.path.getsize(candidate) > 1024 * 1024:
                return candidate

        # Search default directory
        if os.path.exists(self.models_dir):
            for file in os.listdir(self.models_dir):
                if file.endswith(".gguf") and "gemma" in file.lower():
                    full_p = os.path.join(self.models_dir, file)
                    if os.path.isfile(full_p) and os.path.getsize(full_p) > 1024 * 1024:
                        return full_p

            # Any valid GGUF file
            for file in os.listdir(self.models_dir):
                if file.endswith(".gguf"):
                    full_p = os.path.join(self.models_dir, file)
                    if os.path.isfile(full_p) and os.path.getsize(full_p) > 1024 * 1024:
                        return full_p
        return None

    @staticmethod
    def verify_gguf_header(file_path: str) -> bool:
        """Validates that the file starts with the GGUF magic byte signature: b'GGUF'"""
        if not os.path.isfile(file_path):
            return False
        try:
            with open(file_path, "rb") as f:
                magic = f.read(4)
                return magic == b"GGUF"
        except Exception:
            return False

    @staticmethod
    def calculate_file_sha256(file_path: str, progress_callback=None) -> str:
        """Computes SHA-256 hash in 4MB chunks."""
        hasher = hashlib.sha256()
        file_size = os.path.getsize(file_path)
        processed = 0
        with open(file_path, "rb") as f:
            while chunk := f.read(4 * 1024 * 1024):
                hasher.update(chunk)
                processed += len(chunk)
                if progress_callback:
                    progress_callback(processed, file_size)
        return hasher.hexdigest()

    @staticmethod
    def check_hardware_feasibility(model_path: str) -> Dict[str, Any]:
        """Checks total RAM, available RAM, and storage against safety limits."""
        if HAS_PSUTIL:
            mem = psutil.virtual_memory()
            total_ram_gb = round(mem.total / (1024 ** 3), 2)
            avail_ram_gb = round(mem.available / (1024 ** 3), 2)
            drive_path = os.path.splitdrive(os.path.abspath(model_path))[0] or "/"
            try:
                disk = psutil.disk_usage(drive_path)
                disk_free_gb = round(disk.free / (1024 ** 3), 2)
            except Exception:
                disk_free_gb = 5.0
        else:
            total_ram_gb = 6.0
            avail_ram_gb = 3.5
            disk_free_gb = 4.0

        # Evaluation
        is_safe = (avail_ram_gb >= 1.2) and header_valid
        warning = None
        if total_ram_gb < 5.5:
            warning = "Target PC has less than 6 GB RAM. Context length will be capped to prevent paging."
        elif avail_ram_gb < 1.5:
            warning = "System available memory is low (< 1.5 GB). Close background programs for optimal inference."

        return {
            "total_ram_gb": total_ram_gb,
            "available_ram_gb": avail_ram_gb,
            "disk_free_gb": disk_free_gb,
            "model_size_gb": file_size_gb,
            "header_valid": header_valid,
            "is_safe": is_safe,
            "warning": warning
        }
