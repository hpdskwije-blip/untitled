"""
NENAPIYUMA AI USB - Main Window (PySide6)
Utilitarian, high-contrast dark theme desktop interface with tabbed routing,
live RAM/storage telemetry, and graceful thread shutdown.
"""

from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QTabWidget, QProgressBar, QMessageBox, QFrame
)
from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QFont, QIcon
import psutil

from app.ui.chat_tab import ChatTab
from app.ui.usb_guard_tab import USBGuardTab


class MainWindow(QMainWindow):
    def __init__(self, db_manager, inference_engine, model_registry, scanner, quarantine, auditor):
        super().__init__()
        self.db = db_manager
        self.engine = inference_engine
        self.registry = model_registry
        self.scanner = scanner
        self.quarantine = quarantine
        self.auditor = auditor

        self.setWindowTitle("NENAPIYUMA AI USB - නොබැඳි බුද්ධිමය සහායක & USB Guard")
        self.resize(1100, 750)
        self.setMinimumSize(850, 600)

        self._setup_ui()
        self._start_telemetry_timer()

    def _setup_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Top Header Bar
        header = QFrame()
        header.setStyleSheet("background-color: #0F172A; border-bottom: 1px solid #1E293B; padding: 10px 16px;")
        header_layout = QHBoxLayout(header)

        # Wordmark
        title_label = QLabel("නැනපියුම NENAPIYUMA AI USB")
        title_label.setFont(QFont("Plus Jakarta Sans", 14, QFont.Bold))
        title_label.setStyleSheet("color: #F59E0B; letter-spacing: 0.5px;")
        header_layout.addWidget(title_label)

        sep = QLabel("·")
        sep.setStyleSheet("color: #475569; font-size: 16px; margin: 0 4px;")
        header_layout.addWidget(sep)

        version_label = QLabel("v1.0.0 Portable")
        version_label.setStyleSheet("color: #64748B; font-size: 12px;")
        header_layout.addWidget(version_label)

        header_layout.addStretch()

        # Offline Status Badge
        offline_badge = QLabel("● සම්පූර්ණයෙන්ම නොබැඳි (Air-Gapped Offline)")
        offline_badge.setStyleSheet("color: #10B981; font-size: 12px; font-weight: bold; margin-right: 16px;")
        header_layout.addWidget(offline_badge)

        # Memory Telemetry
        self.mem_lbl = QLabel("RAM: -- / 6.0 GB")
        self.mem_lbl.setStyleSheet("color: #94A3B8; font-size: 12px; font-family: monospace;")
        header_layout.addWidget(self.mem_lbl)

        main_layout.addWidget(header)

        # Main Tab Widget
        self.tabs = QTabWidget()
        self.tabs.setStyleSheet("""
            QTabWidget::pane { border: none; background: #0B0F19; }
            QTabBar::tab {
                background: #0F172A;
                color: #94A3B8;
                padding: 12px 24px;
                font-weight: 600;
                border-bottom: 2px solid transparent;
            }
            QTabBar::tab:selected {
                background: #131C2E;
                color: #F59E0B;
                border-bottom: 2px solid #F59E0B;
            }
            QTabBar::tab:hover {
                color: #F8FAFC;
            }
        """)

        # Tab 1: Chat Tab
        self.chat_tab = ChatTab(self.db, self.engine)
        self.tabs.addTab(self.chat_tab, "💬 නැනපියුම AI සහායක (Chat)")

        # Tab 2: USB Guard Tab
        self.usb_guard_tab = USBGuardTab(self.db, self.scanner, self.quarantine, self.auditor)
        self.tabs.addTab(self.usb_guard_tab, "🛡️ USB Guard ආරක්ෂාව (Antivirus)")

        # Tab 3: System & Hardware Tab
        sys_tab = self._create_system_tab()
        self.tabs.addTab(sys_tab, "⚙️ පද්ධති තොරතුරු (Hardware & Budget)")

        main_layout.addWidget(self.tabs, stretch=1)

    def _create_system_tab(self) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(16)

        title = QLabel("පද්ධති තත්ත්වය & මතක අයවැය (Hardware Limits & Budget)")
        title.setFont(QFont("Plus Jakarta Sans", 13, QFont.Bold))
        title.setStyleSheet("color: #F8FAFC;")
        layout.addWidget(title)

        info_box = QFrame()
        info_box.setStyleSheet("background-color: #131C2E; border: 1px solid #1E293B; border-radius: 8px; padding: 16px;")
        info_layout = QVBoxLayout(info_box)

        # Memory Budget Display
        mem = psutil.virtual_memory()
        total_gb = round(mem.total / (1024**3), 2)
        avail_gb = round(mem.available / (1024**3), 2)

        lbl_ram = QLabel(f"• පද්ධති RAM: {total_gb} GB (පවතින ප්‍රමාණය: {avail_gb} GB) — ඉලක්කය: 6.0 GB RAM")
        lbl_ram.setStyleSheet("color: #E2E8F0; font-size: 13px;")
        info_layout.addWidget(lbl_ram)

        lbl_model = QLabel("• ක්‍රියාකාරී ආකෘතිය: Gemma 3 Instruct (models/gemma3.gguf ~850 MB Q4)")
        lbl_model.setStyleSheet("color: #38BDF8; font-size: 13px;")
        info_layout.addWidget(lbl_model)

        lbl_ctx = QLabel(f"• සන්දර්භ දිග (Context Window): 2048 Tokens (RAM ආරක්ෂාව සඳහා සීමා කර ඇත)")
        lbl_ctx.setStyleSheet("color: #94A3B8; font-size: 13px;")
        info_layout.addWidget(lbl_ctx)

        lbl_clam = QLabel(f"• ClamAV ආරක්ෂක එන්ජිම: නොබැඳි දෛනික දත්ත ගබඩාව (Offline Daily Database) ක්‍රියාත්මකයි")
        lbl_clam.setStyleSheet("color: #10B981; font-size: 13px;")
        info_layout.addWidget(lbl_clam)

        layout.addWidget(info_box)

        guide_box = QFrame()
        guide_box.setStyleSheet("background-color: #131C2E; border: 1px solid #1E293B; border-radius: 8px; padding: 16px;")
        guide_layout = QVBoxLayout(guide_box)

        g_title = QLabel("සරල භාවිත උපදෙස් (Sinhala Quick Guide):")
        g_title.setStyleSheet("color: #F59E0B; font-weight: bold; font-size: 13px;")
        guide_layout.addWidget(g_title)

        steps = [
            "1. මෙම ෆෝල්ඩරය ඕනෑම 6 GB හෝ ඊට වැඩි USB ධාවකයකට පිටපත් කරන්න (Copy).",
            "2. NENAPIYUMA.exe මත double-click කර විවෘත කරන්න.",
            "3. Gemma 2 ආකෘතිය ස්වයංක්‍රීයව පූරණය වන තෙක් තත්පර කිහිපයක් රැඳී සිටින්න.",
            "4. අන්තර්ජාල සම්බන්ධතාවයකින් තොරව සෘජුවම සිංහලෙන් හෝ ඉංග්‍රීසියෙන් සංවාද ආරම්භ කරන්න.",
            "5. USB Guard මඟින් ඔබේ USB ධාවකය සහ පරිගණකය වෛරස් තර්ජන වලින් පරීක්ෂා කර ආරක්ෂා කරගන්න."
        ]
        for s in steps:
            l = QLabel(s)
            l.setStyleSheet("color: #CBD5E1; font-size: 12px; margin-top: 4px;")
            guide_layout.addWidget(l)

        layout.addWidget(guide_box)
        layout.addStretch()
        return widget

    def _start_telemetry_timer(self):
        self.timer = QTimer(self)
        self.timer.timeout.connect(self._update_telemetry)
        self.timer.start(2500)
        self._update_telemetry()

    def _update_telemetry(self):
        try:
            mem = psutil.virtual_memory()
            used_gb = round((mem.total - mem.available) / (1024**3), 2)
            total_gb = round(mem.total / (1024**3), 2)
            self.mem_lbl.setText(f"RAM: {used_gb} / {total_gb} GB")
        except Exception:
            pass

    def closeEvent(self, event):
        """Ensure local model and threads are cleanly shut down."""
        if self.engine:
            self.engine.stop_generation()
            self.engine.unload()
        event.accept()
