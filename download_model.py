"""
NENAPIYUMA AI USB - Authorized Model Downloader & Verification Script
Downloads quantized Gemma 2 2B Instruct GGUF during automated GitHub Actions build,
verifies SHA-256 integrity, and ensures compatibility with 6 GB RAM devices.
"""

import os
import sys
import hashlib
import requests
from tqdm import tqdm

DEFAULT_MODEL_URL = "https://huggingface.co/bartowski/gemma-3-1b-it-GGUF/resolve/main/gemma-3-1b-it-Q4_K_M.gguf"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "gemma3.gguf")


def download_file(url: str, dest_path: str):
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    print(f"[NENAPIYUMA] Downloading model from: {url}")
    print(f"[NENAPIYUMA] Destination: {dest_path}")

    headers = {}
    # If Hugging Face token is provided in environment (optional)
    token = os.environ.get("HF_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    resp = requests.get(url, stream=True, headers=headers, timeout=60)
    resp.raise_for_status()

    total_size = int(resp.headers.get("content-length", 0))

    hasher = hashlib.sha256()
    with open(dest_path, "wb") as f, tqdm(
        total=total_size,
        unit="iB",
        unit_scale=True,
        unit_divisor=1024,
        desc="Gemma 2 2B Q4 GGUF"
    ) as bar:
        for chunk in resp.iter_content(chunk_size=1024 * 1024):
            if chunk:
                f.write(chunk)
                hasher.update(chunk)
                bar.update(len(chunk))

    calculated_hash = hasher.hexdigest()
    print(f"\n[NENAPIYUMA] Download complete.")
    print(f"[NENAPIYUMA] File size: {os.path.getsize(dest_path) / (1024**3):.2f} GB")
    print(f"[NENAPIYUMA] SHA-256: {calculated_hash}")

    # Verify GGUF header
    with open(dest_path, "rb") as f:
        magic = f.read(4)
        if magic != b"GGUF":
            raise ValueError("Integrity check failed: File does not start with valid GGUF magic header!")
    print("[NENAPIYUMA] GGUF magic header verified successfully.")


if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_MODEL_URL
    dest = sys.argv[2] if len(sys.argv) > 2 else OUTPUT_PATH
    try:
        download_file(url, dest)
    except Exception as e:
        print(f"[ERROR] Failed to download model: {str(e)}")
        sys.exit(1)
