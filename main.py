"""
NENAPIYUMA AI USB - Application Entry Point
Portable Windows executable loader. Zero configuration, automatic model discovery,
and offline local initialization.
"""

import sys
import os
import json

# Ensure parent directory is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if getattr(sys, 'frozen', False):
    # PyInstaller executable base path
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


def load_settings(base_dir: str) -> dict:
    cfg_path = os.path.join(base_dir, "config", "settings.json")
    if os.path.isfile(cfg_path):
        try:
            with open(cfg_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "app_name": "NENAPIYUMA AI USB",
        "ai": {
            "default_model": "models/gemma3.gguf",
            "context_size": 2048,
            "threads": 4
        },
        "security": {
            "clamav_binary": "tools/clamav/clamscan.exe",
            "clamav_db_dir": "tools/clamav/database",
            "quarantine_dir": ".nenapiyuma/quarantine"
        },
        "storage": {
            "database_file": ".nenapiyuma/nenapiyuma.db"
        }
    }


def main():
    # High DPI Scaling for modern Windows monitors
    QApplication.setHighDpiScaleFactorRoundingPolicy(Qt.HighDpiScaleFactorRoundingPolicy.PassThrough)
    app = QApplication(sys.argv)
    app.setApplicationName("NENAPIYUMA AI USB")

    settings = load_settings(BASE_DIR)

    # 1. Initialize SQLite Database
    db_rel = settings.get("storage", {}).get("database_file", ".nenapiyuma/nenapiyuma.db")
    db_path = os.path.join(BASE_DIR, db_rel) if not os.path.isabs(db_rel) else db_rel
    db = DatabaseManager(db_path)

    # 2. Initialize Security & Quarantine
    sec_cfg = settings.get("security", {})
    clam_bin = os.path.join(BASE_DIR, sec_cfg.get("clamav_binary", "tools/clamav/clamscan.exe"))
    clam_db = os.path.join(BASE_DIR, sec_cfg.get("clamav_db_dir", "tools/clamav/database"))
    quar_dir = os.path.join(BASE_DIR, sec_cfg.get("quarantine_dir", ".nenapiyuma/quarantine"))

    scanner = SecurityScanner(clam_bin, clam_db)
    quarantine = QuarantineVault(quar_dir)
    auditor = IntegrityAuditor(BASE_DIR)

    # 3. Model Discovery & Hardware Check
    registry = ModelRegistry(BASE_DIR)
    pref_model = settings.get("ai", {}).get("default_model", "models/gemma-2-2b-it-Q4_K_M.gguf")
    model_path = registry.locate_model(pref_model)

    ctx_size = settings.get("ai", {}).get("context_size", 2048)
    n_threads = settings.get("ai", {}).get("threads", 4)
    engine = InferenceEngine(model_path or "", context_size=ctx_size, n_threads=n_threads)

    # Automatic Model Loading if model is present
    if model_path and os.path.isfile(model_path):
        hw = registry.check_hardware_feasibility(model_path)
        if not hw["header_valid"]:
            QMessageBox.warning(
                None, "ආකෘති දෝෂයකි",
                f"හමු වූ Gemma ආකෘතියේ GGUF ශීර්ෂය (Header) වලංගු නොවේ: {os.path.basename(model_path)}"
            )
        else:
            engine.load_model()
    else:
        # Informative notice if started without pre-downloaded model
        print(f"[NENAPIYUMA] Model file not yet found at {pref_model}. Chat will be ready once GGUF is in /models.")

    # 4. Display Window
    window = MainWindow(db, engine, registry, scanner, quarantine, auditor)
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
