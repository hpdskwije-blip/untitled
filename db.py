"""
NENAPIYUMA AI USB - Local Storage Engine (SQLite)
Zero-cloud, zero-telemetry local database for session histories, scan logs, and quarantine records.
"""

import sqlite3
import json
import os
from datetime import datetime
from typing import List, Dict, Any, Optional


class DatabaseManager:
    def __init__(self, db_path: str):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self._init_schema()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_schema(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Chat Sessions
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS sessions (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Chat Messages
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    tokens INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE
                )
            """)

            # Scan Audits
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS scan_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    target_path TEXT NOT NULL,
                    scanned_files INTEGER NOT NULL,
                    threats_found INTEGER NOT NULL,
                    duration_seconds REAL NOT NULL,
                    engine_version TEXT,
                    scan_summary TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Quarantine Vault Records
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS quarantine_vault (
                    id TEXT PRIMARY KEY,
                    original_path TEXT NOT NULL,
                    stored_file_path TEXT NOT NULL,
                    threat_name TEXT NOT NULL,
                    file_sha256 TEXT NOT NULL,
                    file_size_bytes INTEGER NOT NULL,
                    quarantined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    restored INTEGER DEFAULT 0
                )
            """)

            # Key-Value Settings Cache
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS app_kv (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                )
            """)
            conn.commit()

    # Session / Chat Methods
    def create_session(self, session_id: str, title: str) -> None:
        with self._get_connection() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO sessions (id, title, updated_at) VALUES (?, ?, ?)",
                (session_id, title, datetime.utcnow().isoformat())
            )
            conn.commit()

    def add_message(self, session_id: str, role: str, content: str, tokens: int = 0) -> None:
        with self._get_connection() as conn:
            conn.execute(
                "INSERT INTO messages (session_id, role, content, tokens) VALUES (?, ?, ?, ?)",
                (session_id, role, content, tokens)
            )
            conn.execute(
                "UPDATE sessions SET updated_at = ? WHERE id = ?",
                (datetime.utcnow().isoformat(), session_id)
            )
            conn.commit()

    def get_messages(self, session_id: str) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, role, content, tokens, created_at FROM messages WHERE session_id = ? ORDER BY id ASC",
                (session_id,)
            )
            return [dict(row) for row in cursor.fetchall()]

    def list_sessions(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, title, created_at, updated_at FROM sessions ORDER BY updated_at DESC")
            return [dict(row) for row in cursor.fetchall()]

    def clear_session_messages(self, session_id: str) -> None:
        with self._get_connection() as conn:
            conn.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
            conn.commit()

    # Security Log Methods
    def record_scan(self, target_path: str, scanned_files: int, threats_found: int, duration: float, engine_version: str, summary: str) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO scan_logs (target_path, scanned_files, threats_found, duration_seconds, engine_version, scan_summary)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (target_path, scanned_files, threats_found, duration, engine_version, summary))
            conn.commit()
            return cursor.lastrowid

    def list_recent_scans(self, limit: int = 20) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM scan_logs ORDER BY id DESC LIMIT ?", (limit,))
            return [dict(row) for row in cursor.fetchall()]

    # Quarantine Vault Methods
    def add_quarantine_entry(self, entry_id: str, orig_path: str, stored_path: str, threat: str, sha256: str, size: int) -> None:
        with self._get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO quarantine_vault (id, original_path, stored_file_path, threat_name, file_sha256, file_size_bytes)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (entry_id, orig_path, stored_path, threat, sha256, size))
            conn.commit()

    def list_quarantine_entries(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM quarantine_vault WHERE restored = 0 ORDER BY quarantined_at DESC")
            return [dict(row) for row in cursor.fetchall()]

    def mark_quarantine_restored(self, entry_id: str) -> None:
        with self._get_connection() as conn:
            conn.execute("UPDATE quarantine_vault SET restored = 1 WHERE id = ?", (entry_id,))
            conn.commit()

    def delete_quarantine_entry(self, entry_id: str) -> None:
        with self._get_connection() as conn:
            conn.execute("DELETE FROM quarantine_vault WHERE id = ?", (entry_id,))
            conn.commit()
