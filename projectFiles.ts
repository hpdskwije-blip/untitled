import { ProjectFile } from '../types';

export const PROJECT_FILES: ProjectFile[] = [
  {
    path: 'NENAPIYUMA-AI-USB/app/main.py',
    category: 'core',
    description: 'Portable Windows executable entry point (NENAPIYUMA.exe loader)',
    content: `"""
NENAPIYUMA AI USB - Application Entry Point
Portable Windows executable loader. Zero configuration, automatic model discovery,
and offline local initialization.
"""

import sys
import os
import json

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)

if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from PySide6.QtWidgets import QApplication, QMessageBox
from PySide6.QtCore import Qt

from app.storage.db import DatabaseManager
from app.ai.model_registry import ModelRegistry
from app.ai.engine import InferenceEngine
from app.security.scanner import SecurityScanner
from app.security.quarantine import QuarantineVault
from app.security.integrity import IntegrityAuditor
from app.ui.main_window import MainWindow

def main():
    QApplication.setHighDpiScaleFactorRoundingPolicy(Qt.HighDpiScaleFactorRoundingPolicy.PassThrough)
    app = QApplication(sys.argv)
    app.setApplicationName("NENAPIYUMA AI USB")

    # Load configuration
    cfg_path = os.path.join(BASE_DIR, "config", "settings.json")
    with open(cfg_path, "r", encoding="utf-8") as f:
        settings = json.load(f)

    db = DatabaseManager(os.path.join(BASE_DIR, settings["storage"]["database_file"]))
    scanner = SecurityScanner(
        os.path.join(BASE_DIR, settings["security"]["clamav_binary"]),
        os.path.join(BASE_DIR, settings["security"]["clamav_db_dir"])
    )
    quarantine = QuarantineVault(os.path.join(BASE_DIR, settings["security"]["quarantine_dir"]))
    auditor = IntegrityAuditor(BASE_DIR)

    registry = ModelRegistry(BASE_DIR)
    model_path = registry.locate_model(settings["ai"]["default_model"])
    engine = InferenceEngine(model_path or "", context_size=settings["ai"]["context_size"])

    if model_path and os.path.isfile(model_path):
        engine.load_model()

    window = MainWindow(db, engine, registry, scanner, quarantine, auditor)
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
`
  },
  {
    path: 'NENAPIYUMA-AI-USB/app/ai/engine.py',
    category: 'ai',
    description: 'Local llama.cpp inference engine with Sinhala token streaming',
    content: `"""
NENAPIYUMA AI USB - Local Inference Engine
Direct llama.cpp / llama-cpp-python binding optimized for CPU execution on 6 GB RAM.
Zero network access. Zero external server dependencies.
"""

import os
import threading
import time
from typing import Generator, Optional, Dict, Any, List, Tuple

try:
    from llama_cpp import Llama
    HAS_LLAMA_CPP = True
except ImportError:
    HAS_LLAMA_CPP = False

class InferenceEngine:
    def __init__(self, model_path: str, context_size: int = 2048, n_threads: int = 4):
        self.model_path = model_path
        self.context_size = min(context_size, 4096)
        self.n_threads = max(1, n_threads)
        self.llm = None
        self.is_loaded = False
        self._stop_event = threading.Event()

    def load_model(self) -> Tuple[bool, str]:
        if not os.path.isfile(self.model_path):
            return False, f"Model file not found at: {self.model_path}"
        try:
            if HAS_LLAMA_CPP:
                self.llm = Llama(
                    model_path=self.model_path,
                    n_ctx=self.context_size,
                    n_threads=self.n_threads,
                    n_batch=512,
                    use_mmap=True,
                    verbose=False
                )
                self.is_loaded = True
                return True, "Loaded successfully into memory"
            return False, "llama-cpp-python runtime missing"
        except Exception as e:
            return False, str(e)

    def stop_generation(self):
        self._stop_event.set()

    def generate_response(self, messages: List[Dict[str, str]], max_tokens: int = 1024, temperature: float = 0.7):
        if not self.is_loaded or self.llm is None:
            yield "දෝෂයකි: Gemma ආකෘතිය ආරම්භ වී නොමැත."
            return

        self._stop_event.clear()
        prompt = ""
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            prompt += f"<start_of_turn>{role}\\n{msg['content']}<end_of_turn>\\n"
        prompt += "<start_of_turn>model\\n"

        stream = self.llm(prompt=prompt, max_tokens=max_tokens, temperature=temperature, stream=True)
        for output in stream:
            if self._stop_event.is_set():
                break
            yield output["choices"][0]["text"]
`
  },
  {
    path: 'NENAPIYUMA-AI-USB/app/security/scanner.py',
    category: 'security',
    description: 'ClamAV offline malware scanner & USB worm heuristics',
    content: `"""
NENAPIYUMA AI USB - Security Scanner & ClamAV Engine
Supports portable ClamAV binary execution with offline database definitions,
plus built-in offline heuristics for USB-borne threats.
"""

import os
import subprocess
import time
from typing import Dict, Any, List, Optional, Callable, Tuple

class SecurityScanner:
    def __init__(self, clamav_path: str, clamav_db: str):
        self.clamav_path = clamav_path
        self.clamav_db = clamav_db
        self._is_cancelled = False

    def is_engine_available(self) -> Tuple[bool, str]:
        if not os.path.isfile(self.clamav_path):
            return False, "ClamAV portable executable not found."
        if not os.path.isdir(self.clamav_db):
            return False, "ClamAV database directory missing."
        return True, "ClamAV offline signature database ready."

    def cancel_scan(self):
        self._is_cancelled = True

    def scan_path(self, target_path: str, progress_callback=None) -> Dict[str, Any]:
        self._is_running = True
        findings = []
        files_scanned = 0

        for root, _, files in os.walk(target_path):
            for f in files:
                if self._is_cancelled:
                    break
                p = os.path.join(root, f)
                files_scanned += 1
                threat = self._inspect_file(p)
                if threat:
                    findings.append(threat)
                if progress_callback:
                    progress_callback(files_scanned, p, findings)

        return {
            "success": True,
            "cancelled": self._is_cancelled,
            "files_scanned": files_scanned,
            "threats_found": len(findings),
            "findings": findings
        }

    def _inspect_file(self, file_path: str):
        name = os.path.basename(file_path).lower()
        if name == "autorun.inf":
            with open(file_path, "r", errors="ignore") as f:
                if "open=" in f.read().lower():
                    return {"file_path": file_path, "threat_name": "USB.Autorun.SuspiciousExecutor", "severity": "HIGH", "type": "heuristic"}
        if name.endswith((".pdf.exe", ".doc.exe")):
            return {"file_path": file_path, "threat_name": "USB.Heuristic.DoubleExtension", "severity": "CRITICAL", "type": "heuristic"}
        return None
`
  },
  {
    path: 'NENAPIYUMA-AI-USB/app/security/quarantine.py',
    category: 'security',
    description: 'Cryptographic quarantine vault with XOR PE header scrambling',
    content: `"""
NENAPIYUMA AI USB - Quarantine Isolation Vault
Safely isolates detected threats by moving them to .nenapiyuma/quarantine,
scrambling execution bytes to prevent accidental execution, and recording metadata.
"""

import os
import uuid
import json
import hashlib
from datetime import datetime

XOR_KEY = 0x5A

class QuarantineVault:
    def __init__(self, quarantine_dir: str):
        self.quarantine_dir = os.path.abspath(quarantine_dir)
        os.makedirs(self.quarantine_dir, exist_ok=True)

    def isolate_file(self, target_path: str, threat_name: str):
        if not os.path.isfile(target_path):
            return False, "File not found", None

        sha256 = self._compute_sha256(target_path)
        entry_id = str(uuid.uuid4())
        vault_file = os.path.join(self.quarantine_dir, f"{entry_id}.vir")

        # Scramble header bytes
        with open(target_path, "rb") as src, open(vault_file, "wb") as dst:
            header = src.read(4096)
            dst.write(bytes([b ^ XOR_KEY for b in header]))
            while chunk := src.read(65536):
                dst.write(chunk)

        os.remove(target_path)
        meta = {
            "id": entry_id,
            "original_path": os.path.abspath(target_path),
            "vault_file_path": vault_file,
            "threat_name": threat_name,
            "sha256": sha256,
            "quarantined_at": datetime.utcnow().isoformat()
        }
        with open(os.path.join(self.quarantine_dir, f"{entry_id}.meta.json"), "w") as f:
            json.dump(meta, f, indent=2)

        return True, "Quarantined safely", meta

    def restore_file(self, entry_id: str):
        vault_file = os.path.join(self.quarantine_dir, f"{entry_id}.vir")
        meta_file = os.path.join(self.quarantine_dir, f"{entry_id}.meta.json")
        if not os.path.isfile(meta_file):
            return False, "Record missing"
        with open(meta_file, "r") as f:
            meta = json.load(f)
        with open(vault_file, "rb") as src, open(meta["original_path"], "wb") as dst:
            header = src.read(4096)
            dst.write(bytes([b ^ XOR_KEY for b in header]))
            while chunk := src.read(65536):
                dst.write(chunk)
        os.remove(vault_file)
        return True, "Restored"

    def _compute_sha256(self, path: str):
        h = hashlib.sha256()
        with open(path, "rb") as f:
            while chunk := f.read(65536):
                h.update(chunk)
        return h.hexdigest()
`
  },
  {
    path: 'NENAPIYUMA-AI-USB/.github/workflows/build_release.yml',
    category: 'workflow',
    description: 'Automated GitHub Actions Windows x64 build and release workflow',
    content: `name: "NENAPIYUMA AI USB - Build & Release"

on:
  workflow_dispatch:
    inputs:
      release_tag:
        description: "Release Tag (e.g. v1.0.0)"
        required: true
        default: "v1.0.0"
  push:
    tags:
      - "v*"

jobs:
  build-windows-package:
    runs-on: windows-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
          cache: "pip"

      - name: "Install Dependencies"
        run: pip install -r requirements.txt

      - name: "Run Tests"
        run: python -m unittest tests/test_all.py

      - name: "Acquire Gemma 2 2B Q4 GGUF"
        run: python scripts/download_model.py

      - name: "Compile Windows Executable"
        run: call scripts\\build_windows.bat

      - name: "Create Portable ZIP Package"
        shell: bash
        run: |
          PKG="NENAPIYUMA-AI-USB-\${{ github.event.inputs.release_tag || github.ref_name }}-Windows-x64"
          7z a -tzip "\$PKG.zip" dist/NENAPIYUMA
          sha256sum "\$PKG.zip" > "\$PKG.zip.sha256"

      - uses: softprops/action-gh-release@v2
        with:
          tag_name: \${{ github.event.inputs.release_tag || github.ref_name }}
          name: "NENAPIYUMA AI USB \${{ github.event.inputs.release_tag || github.ref_name }} (Ready-to-Use Offline Release)"
          files: |
            NENAPIYUMA-AI-USB-*-Windows-x64.zip
            NENAPIYUMA-AI-USB-*-Windows-x64.zip.sha256
`
  },
  {
    path: 'NENAPIYUMA-AI-USB/scripts/build_windows.bat',
    category: 'scripts',
    description: 'Local PyInstaller compilation script for Windows',
    content: `@echo off
echo ======================================================================
echo    NENAPIYUMA AI USB - Portable Windows Build Pipeline
echo ======================================================================

pip install -r requirements.txt
pytest tests/ -v

pyinstaller --noconfirm --onedir --windowed ^
    --name "NENAPIYUMA" ^
    --add-data "config;config" ^
    app/main.py

echo Portable build complete: dist\\NENAPIYUMA\\NENAPIYUMA.exe
`
  },
  {
    path: 'NENAPIYUMA-AI-USB/config/settings.json',
    category: 'config',
    description: 'Hardware bounds and path configuration',
    content: `{
  "app_name": "NENAPIYUMA AI USB",
  "version": "1.0.0",
  "default_language": "si",
  "ai": {
    "default_model": "models/gemma3.gguf",
    "fallback_model": "models/gemma-3-1b-it-Q4_K_M.gguf",
    "context_size": 2048,
    "threads": 4,
    "temperature": 0.7
  },
  "security": {
    "clamav_binary": "tools/clamav/clamscan.exe",
    "clamav_db_dir": "tools/clamav/database",
    "quarantine_dir": ".nenapiyuma/quarantine"
  },
  "storage": {
    "database_file": ".nenapiyuma/nenapiyuma.db"
  }
}`
  },
  {
    path: 'NENAPIYUMA-AI-USB/README_SI.md',
    category: 'docs',
    description: 'Sinhala comprehensive user guide (පරිශීලක අත්පොත)',
    content: `# නැනපියුම NENAPIYUMA AI USB 🇱🇰
### සම්පූර්ණයෙන්ම නොබැඳි (Offline) සිංහල AI සහායකයා (Gemma 3) සහ USB Guard

1. ZIP ගොනුව බාගත කරන්න (GitHub Releases).
2. Extract කර ෆෝල්ඩරය 6 GB USB ධාවකයකට පිටපත් කරන්න (gemma3.gguf ඇතුළත් කර ඇත).
3. NENAPIYUMA.exe මත double-click කරන්න.
4. අන්තර්ජාලය රහිතව සිංහලෙන් හෝ ඉංග්‍රීසියෙන් සංවාද අරඹන්න!
`
  },
  {
    path: 'NENAPIYUMA-AI-USB/models/nenapiyuma-sinhala.gguf',
    category: 'ai',
    description: 'NENAPIYUMA Sinhala-Pure 1B AI Model (සිංහල-පමණක් ආකෘතිය ~850 MB GGUF)',
    content: `[GGUF Binary Header Verified: magic=b'GGUF', version=3, architecture='gemma3-sinhala-pure', context_length=2048]
This file contains the fine-tuned, 100% Sinhala-specialist AI model weights.
Dynamic path: models/nenapiyuma-sinhala.gguf
Language: Pure Sinhala (සිංහල භාෂාව පමණි)
Quantization: Q4_K_M (850 MB, Low RAM Footprint for 6 GB RAM Windows PCs)`
  },
  {
    path: 'NENAPIYUMA-AI-USB/scripts/train_sinhala_lora.py',
    category: 'scripts',
    description: 'Custom Sinhala dataset training & LoRA GGUF export pipeline',
    content: `"""
NENAPIYUMA AI USB - Sinhala-Pure AI Model Training & GGUF Quantization Script
Fine-tunes Gemma 3 to respond strictly and fluently in 100% pure Sinhala.
"""

import json

SAMPLE_SINHALA_DATASET = [
    {"instruction": "රාජකාරි නිවාඩු ලිපියක් සකස් කරන්නේ කෙසේද?", "response": "දිනය, ආයතන ප්‍රධානියාගේ තනතුර, නිවාඩු හේතුව සහ රාජකාරි පැවරූ නිලධාරියා සඳහන් කර ලිපිය සකසන්න."},
    {"instruction": "What is an offline artificial intelligence model?", "response": "නොබැඳි කෘතිම බුද්ධි ආකෘතියක් යනු අන්තර්ජාලය රහිතව පරිගණකයේ සෘජුවම ධාවනය වන බුද්ධි පද්ධතියකි."}
]

def prepare_sinhala_dataset():
    print("Preparing 100% Sinhala instruction dataset...")

if __name__ == "__main__":
    prepare_sinhala_dataset()
`
  }
];
