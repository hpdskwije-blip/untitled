"""
NENAPIYUMA AI USB - Comprehensive Test Suite
Validates startup checks, model integrity, Sinhala UTF-8 processing,
security scanning, quarantine vault operations, and air-gapped guarantees.
"""

import os
import sys
import tempfile
import unittest
import json
import shutil

# Ensure app is importable
TEST_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(TEST_DIR)
sys.path.insert(0, PROJECT_ROOT)

from app.storage.db import DatabaseManager
from app.ai.model_registry import ModelRegistry
from app.security.scanner import SecurityScanner
from app.security.quarantine import QuarantineVault
from app.security.integrity import IntegrityAuditor


class TestNenapiyumaCore(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.db_path = os.path.join(self.temp_dir, "test.db")
        self.db = DatabaseManager(self.db_path)
        self.quarantine_dir = os.path.join(self.temp_dir, "quarantine")
        self.quarantine = QuarantineVault(self.quarantine_dir)

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_database_session_and_sinhala_messages(self):
        """Tests that Sinhala Unicode strings are stored and retrieved without corruption."""
        session_id = "test-session-1"
        self.db.create_session(session_id, "සිංහල පරීක්ෂණ සංවාදය")

        # Test complex Sinhala ligatures and diacritics
        user_msg = "ආයුබෝවන්, මට පරිගණක ආරක්ෂාව පිළිබඳව සිංහලෙන් තොරතුරු ලබා දෙන්න."
        model_reply = "ස්තූතියි! පරිගණක ආරක්ෂාව සහ USB ධාවක පරීක්ෂාව සඳහා නැනපියුම සහායකයා සූදානම්."

        self.db.add_message(session_id, "user", user_msg)
        self.db.add_message(session_id, "model", model_reply)

        messages = self.db.get_messages(session_id)
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0]["content"], user_msg)
        self.assertEqual(messages[1]["content"], model_reply)

    def test_gguf_magic_header_validation(self):
        """Tests detection of valid GGUF header vs corrupted / fake models."""
        valid_model = os.path.join(self.temp_dir, "valid.gguf")
        with open(valid_model, "wb") as f:
            f.write(b"GGUF\x03\x00\x00\x00" + b"\x00" * 1024)

        corrupted_model = os.path.join(self.temp_dir, "corrupted.gguf")
        with open(corrupted_model, "wb") as f:
            f.write(b"NOT_GGUF" + b"\x00" * 1024)

        self.assertTrue(ModelRegistry.verify_gguf_header(valid_model))
        self.assertFalse(ModelRegistry.verify_gguf_header(corrupted_model))
        self.assertFalse(ModelRegistry.verify_gguf_header(os.path.join(self.temp_dir, "nonexistent.gguf")))

    def test_model_path_resolution_and_discovery(self):
        """Tests dynamic model discovery for gemma3.gguf and nenapiyuma-sinhala.gguf."""
        registry = ModelRegistry(self.temp_dir)
        models_folder = os.path.join(self.temp_dir, "models")
        os.makedirs(models_folder, exist_ok=True)

        dummy_sinhala = os.path.join(models_folder, "nenapiyuma-sinhala.gguf")
        with open(dummy_sinhala, "wb") as f:
            f.write(b"GGUF" + b"\x00" * (2 * 1024 * 1024))

        discovered = registry.locate_model("models/nenapiyuma-sinhala.gguf")
        self.assertIsNotNone(discovered)
        self.assertTrue(discovered.endswith("nenapiyuma-sinhala.gguf"))

    def test_quarantine_isolation_and_restoration(self):
        """Tests that infected files are scrambled upon isolation and restored intact."""
        threat_file = os.path.join(self.temp_dir, "threat.exe")
        original_bytes = b"MZ\x90\x00\x03\x00\x00\x00TEST_EXECUTABLE_PAYLOAD_HERE"
        with open(threat_file, "wb") as f:
            f.write(original_bytes)

        # Isolate
        ok, msg, meta = self.quarantine.isolate_file(threat_file, "Win32.TestThreat")
        self.assertTrue(ok)
        self.assertFalse(os.path.exists(threat_file), "Original file must be removed from USB")

        # Verify vaulted file is byte-scrambled (first 2 bytes cannot be 'MZ')
        vault_file = meta["vault_file_path"]
        self.assertTrue(os.path.isfile(vault_file))
        with open(vault_file, "rb") as vf:
            scrambled = vf.read(2)
            self.assertNotEqual(scrambled, b"MZ", "Header bytes must be scrambled to prevent execution")

        # Restore
        res_ok, res_msg = self.quarantine.restore_file(meta["id"])
        self.assertTrue(res_ok)
        self.assertTrue(os.path.isfile(threat_file), "Restored file must reappear at original path")

        with open(threat_file, "rb") as rf:
            self.assertEqual(rf.read(), original_bytes, "Restored content must match original byte-for-byte")

    def test_eicar_test_detection_and_heuristics(self):
        """Tests scanner detection of autorun.inf threat and EICAR signature."""
        scanner = SecurityScanner(clamav_path="nonexistent", clamav_db="nonexistent")

        # Create simulated malicious autorun.inf
        autorun_file = os.path.join(self.temp_dir, "autorun.inf")
        with open(autorun_file, "w") as f:
            f.write("[autorun]\nopen=malware.exe\nshellexecute=malware.exe\n")

        # Create EICAR test string
        eicar_file = os.path.join(self.temp_dir, "eicar.com")
        with open(eicar_file, "wb") as f:
            f.write(b"X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*")

        scan_res = scanner.scan_path(self.temp_dir)
        self.assertTrue(scan_res["success"])
        self.assertGreaterEqual(scan_res["threats_found"], 2)

        threat_names = [item["threat_name"] for item in scan_res["findings"]]
        self.assertIn("USB.Autorun.SuspiciousExecutor", threat_names)
        self.assertIn("EICAR-Test-Signature", threat_names)

    def test_file_integrity_auditor(self):
        """Tests that modified files trigger tampering warnings."""
        test_file = os.path.join(self.temp_dir, "core.bin")
        with open(test_file, "wb") as f:
            f.write(b"VERSION_1_SIGNATURE")

        auditor = IntegrityAuditor(self.temp_dir)
        auditor.generate_catalog(["core.bin"])

        # Initial clean audit
        res_clean = auditor.audit()
        self.assertEqual(res_clean["status"], "VERIFIED_CLEAN")

        # Modify file to simulate bitrot or malicious patch
        with open(test_file, "wb") as f:
            f.write(b"TAMPERED_MODIFIED_BYTES")

        res_tampered = auditor.audit()
        self.assertEqual(res_tampered["status"], "TAMPERED_OR_CORRUPT")
        self.assertEqual(res_tampered["details"][0]["status"], "MODIFIED")

    def test_scanner_cancellation(self):
        """Tests that scanning halts immediately when cancel signal is triggered."""
        scanner = SecurityScanner("nonexistent", "nonexistent")
        # Create 10 dummy files
        for i in range(10):
            p = os.path.join(self.temp_dir, f"file_{i}.txt")
            with open(p, "w") as f:
                f.write(f"test content {i}")

        scanner.cancel_scan()
        res = scanner.scan_path(self.temp_dir)
        self.assertTrue(res["cancelled"])
        self.assertLessEqual(res["files_scanned"], 1)

    def test_quarantine_path_traversal_safety(self):
        """Tests that quarantine operations cannot overwrite files outside the vault."""
        fake_id = "../../../etc/passwd"
        res_ok, msg = self.quarantine.restore_file(fake_id)
        self.assertFalse(res_ok)


if __name__ == "__main__":
    unittest.main()
