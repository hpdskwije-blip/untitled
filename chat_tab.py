"""
NENAPIYUMA AI USB - Sinhala/English Chat Tab (PySide6)
Full-featured conversational desktop interface with streaming tokens,
conversation history, copy/clear actions, and offline model telemetry.
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QTextEdit, QLineEdit,
    QPushButton, QLabel, QScrollArea, QFrame, QMessageBox,
    QProgressBar, QSplitter
)
from PySide6.QtCore import Qt, QThread, Signal
from PySide6.QtGui import QFont, QColor, QTextCursor
import time
import uuid


class GenerationWorker(QThread):
    token_received = Signal(str)
    finished = Signal()
    error = Signal(str)

    def __init__(self, engine, messages, max_tokens, temperature):
        super().__init__()
        self.engine = engine
        self.messages = messages
        self.max_tokens = max_tokens
        self.temperature = temperature

    def run(self):
        try:
            for token in self.engine.generate_response(
                self.messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature
            ):
                self.token_received.emit(token)
            self.finished.emit()
        except Exception as e:
            self.error.emit(str(e))


class ChatTab(QWidget):
    def __init__(self, db_manager, inference_engine, parent=None):
        super().__init__(parent)
        self.db = db_manager
        self.engine = inference_engine
        self.current_session_id = str(uuid.uuid4())
        self.messages_history = []
        self.worker = None

        self._init_ui()
        self._load_or_create_session()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(12)

        # Header Status Bar
        header_bar = QHBoxLayout()
        self.status_label = QLabel("● ආකෘතිය සූදානම් (Gemma 3 Offline - gemma3.gguf)")
        self.status_label.setStyleSheet("color: #10B981; font-weight: bold; font-size: 13px;")
        header_bar.addWidget(self.status_label)

        header_bar.addStretch()

        self.btn_new_chat = QPushButton("නව සංවාදයක් (New Chat)")
        self.btn_new_chat.setStyleSheet("""
            QPushButton { background-color: #1E293B; color: #E2E8F0; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; }
            QPushButton:hover { background-color: #334155; }
        """)
        self.btn_new_chat.clicked.connect(self._on_new_chat)
        header_bar.addWidget(self.btn_new_chat)

        self.btn_clear_chat = QPushButton("මකන්න (Clear)")
        self.btn_clear_chat.setStyleSheet("""
            QPushButton { background-color: #1E293B; color: #94A3B8; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; }
            QPushButton:hover { background-color: #7F1D1D; color: #FCA5A5; }
        """)
        self.btn_clear_chat.clicked.connect(self._on_clear_chat)
        header_bar.addWidget(self.btn_clear_chat)

        layout.addLayout(header_bar)

        # Chat Transcript Area
        self.chat_display = QTextEdit()
        self.chat_display.setReadOnly(True)
        self.chat_display.setFont(QFont("Noto Sans Sinhala", 11))
        self.chat_display.setStyleSheet("""
            QTextEdit {
                background-color: #0B0F19;
                color: #F8FAFC;
                border: 1px solid #1E293B;
                border-radius: 8px;
                padding: 12px;
                line-height: 1.5;
            }
        """)
        layout.addWidget(self.chat_display, stretch=1)

        # Quick Preset Buttons
        presets_bar = QHBoxLayout()
        presets_label = QLabel("ඉක්මන් ප්‍රශ්න:")
        presets_label.setStyleSheet("color: #64748B; font-size: 11px;")
        presets_bar.addWidget(presets_label)

        presets = [
            ("ලිපියක් සකස් කරන්න", "රාජකාරි ලිපියක් නිවැරදි සිංහල ආකෘතියෙන් ලියන ආකාරය පැහැදිලි කරන්න."),
            ("පරිගණක ආරක්ෂාව", "USB ධාවකයකින් පරිගණකයට වෛරස් ඇතුළු වීම වළක්වා ගන්නේ කෙසේද?"),
            ("Sinhala & English Translation", "පහත වාක්‍යය ඉංග්‍රීසියට පරිවර්තනය කරන්න: 'නැනපියුම නොබැඳි AI සහායකයා සාර්ථකව ක්‍රියාත්මක වේ.'"),
        ]

        for title, text in presets:
            btn = QPushButton(title)
            btn.setStyleSheet("""
                QPushButton { background-color: #131C2E; color: #93C5FD; border: 1px solid #1E293B; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
                QPushButton:hover { background-color: #1E293B; color: #BFDBFE; }
            """)
            btn.clicked.connect(lambda _, t=text: self.input_box.setText(t))
            presets_bar.addWidget(btn)

        presets_bar.addStretch()
        layout.addLayout(presets_bar)

        # Input & Control Controls
        input_bar = QHBoxLayout()
        self.input_box = QLineEdit()
        self.input_box.setFont(QFont("Noto Sans Sinhala", 11))
        self.input_box.setPlaceholderText("ඔබට අවශ්‍ය ඕනෑම දෙයක් සිංහලෙන් හෝ ඉංග්‍රීසියෙන් මෙහි ටයිප් කරන්න...")
        self.input_box.setStyleSheet("""
            QLineEdit {
                background-color: #131C2E;
                color: #FFFFFF;
                border: 1px solid #334155;
                border-radius: 8px;
                padding: 10px 14px;
                font-size: 13px;
            }
            QLineEdit:focus {
                border: 1px solid #F59E0B;
            }
        """)
        self.input_box.returnPressed.connect(self._on_send)
        input_bar.addWidget(self.input_box, stretch=1)

        self.btn_send = QPushButton("යවන්න (Send)")
        self.btn_send.setFont(QFont("Noto Sans Sinhala", 10, QFont.Bold))
        self.btn_send.setStyleSheet("""
            QPushButton {
                background-color: #F59E0B;
                color: #0F172A;
                border: none;
                padding: 10px 18px;
                border-radius: 8px;
                font-weight: bold;
            }
            QPushButton:hover { background-color: #D97706; }
            QPushButton:disabled { background-color: #475569; color: #94A3B8; }
        """)
        self.btn_send.clicked.connect(self._on_send)
        input_bar.addWidget(self.btn_send)

        self.btn_stop = QPushButton("නවත්වන්න (Stop)")
        self.btn_stop.setEnabled(False)
        self.btn_stop.setStyleSheet("""
            QPushButton {
                background-color: #EF4444;
                color: #FFFFFF;
                border: none;
                padding: 10px 14px;
                border-radius: 8px;
            }
            QPushButton:hover { background-color: #DC2626; }
            QPushButton:disabled { background-color: #334155; color: #64748B; }
        """)
        self.btn_stop.clicked.connect(self._on_stop)
        input_bar.addWidget(self.btn_stop)

        layout.addLayout(input_bar)

    def _load_or_create_session(self):
        self.db.create_session(self.current_session_id, "ප්‍රධාන සංවාදය (Main Session)")
        self._append_system_bubble("ආයුබෝවන්! මම නැනපියුම (NENAPIYUMA) නොබැඳි AI සහායකයායි. මම සම්පූර්ණයෙන්ම ඔබගේ USB ධාවකයෙන් නොබැඳිව (offline) ක්‍රියාත්මක වේ. ඔබට උපකාර කළ හැක්කේ කුමකින්ද?")

    def _append_system_bubble(self, text: str):
        self.chat_display.append(f"<div style='color: #F59E0B; font-weight: bold;'>නැනපියුම (NENAPIYUMA AI):</div>")
        self.chat_display.append(f"<div style='color: #E2E8F0; margin-bottom: 12px;'>{text}</div><hr style='border: none; border-top: 1px solid #1E293B;'>")

    def _on_send(self):
        prompt = self.input_box.text().strip()
        if not prompt:
            return

        self.input_box.clear()
        self.btn_send.setEnabled(False)
        self.btn_stop.setEnabled(True)

        # Show user message
        self.chat_display.append(f"<div style='color: #38BDF8; font-weight: bold;'>ඔබ (You):</div>")
        self.chat_display.append(f"<div style='color: #F8FAFC; margin-bottom: 12px;'>{prompt}</div>")

        self.messages_history.append({"role": "user", "content": prompt})
        self.db.add_message(self.current_session_id, "user", prompt)

        # Prepare model reply slot
        self.chat_display.append(f"<div style='color: #F59E0B; font-weight: bold;'>නැනපියුම (NENAPIYUMA AI):</div>")
        self.current_reply_text = ""

        # Run inference in separate thread
        self.worker = GenerationWorker(self.engine, self.messages_history, max_tokens=1024, temperature=0.7)
        self.worker.token_received.connect(self._on_token_received)
        self.worker.finished.connect(self._on_generation_finished)
        self.worker.error.connect(self._on_generation_error)
        self.worker.start()

    def _on_token_received(self, token: str):
        self.current_reply_text += token
        self.chat_display.insertPlainText(token)
        self.chat_display.moveCursor(QTextCursor.End)

    def _on_generation_finished(self):
        self.chat_display.append("<br><hr style='border: none; border-top: 1px solid #1E293B;'>")
        self.messages_history.append({"role": "model", "content": self.current_reply_text})
        self.db.add_message(self.current_session_id, "model", self.current_reply_text)
        self.btn_send.setEnabled(True)
        self.btn_stop.setEnabled(False)

    def _on_generation_error(self, err_msg: str):
        self.chat_display.append(f"<div style='color: #EF4444;'>[දෝෂයකි: {err_msg}]</div>")
        self.btn_send.setEnabled(True)
        self.btn_stop.setEnabled(False)

    def _on_stop(self):
        if self.engine:
            self.engine.stop_generation()

    def _on_new_chat(self):
        self.current_session_id = str(uuid.uuid4())
        self.messages_history = []
        self.chat_display.clear()
        self._load_or_create_session()

    def _on_clear_chat(self):
        reply = QMessageBox.question(
            self,
            "සංවාදය මකන්න",
            "වත්මන් සංවාදයේ සියලු පණිවිඩ මැකීමට ඔබට විශ්වාසද?",
            QMessageBox.Yes | QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            self.chat_display.clear()
            self.messages_history = []
            self.db.clear_session_messages(self.current_session_id)
            self._load_or_create_session()
