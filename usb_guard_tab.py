"""
NENAPIYUMA AI USB - USB Guard Security Tab (PySide6)
Full removable-drive malware scanning, ClamAV status, heuristic detection,
quarantine isolation vault management, and core file integrity checks.
"""

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton,
    QComboBox, QProgressBar, QTableWidget, QTableWidgetItem,
    QHeaderView, QMessageBox, QTabWidget, QFileDialog, QFrame
)
from PySide6.QtCore import Qt, QThread, Signal
import os
import psutil


class ScanWorker(QThread):
    progress = Signal(int, str)
    finished = Signal(dict)

    def __init__(self, scanner, target_path):
        super().__init__()
        self.scanner = scanner
        self.target_path = target_path

    def run(self):
        def cb(count, cur_file, findings):
            self.progress.emit(count, cur_file)

        result = self.scanner.scan_path(self.target_path, progress_callback=cb)
        self.finished.emit(result)


class USBGuardTab(QWidget):
    def __init__(self, db_manager, scanner, quarantine_vault, integrity_auditor, parent=None):
        super().__init__(parent)
        self.db = db_manager
        self.scanner = scanner
        self.quarantine = quarantine_vault
        self.auditor = integrity_auditor
        self.worker = None

        self._init_ui()
        self._refresh_drives()
        self._refresh_quarantine_table()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(14)

        # Top Drive Selector & Engine Banner
        top_box = QFrame()
        top_box.setStyleSheet("background-color: #131C2E; border: 1px solid #1E293B; border-radius: 8px; padding: 12px;")
        top_layout = QVBoxLayout(top_box)

        drive_row = QHBoxLayout()
        drive_lbl = QLabel("සම්බන්ධිත USB ධාවකය (Target Drive):")
        drive_lbl.setStyleSheet("color: #E2E8F0; font-weight: bold;")
        drive_row.addWidget(drive_lbl)

        self.drive_combo = QComboBox()
        self.drive_combo.setStyleSheet("""
            QComboBox { background-color: #1E293B; color: #FFFFFF; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; }
            QComboBox::drop-down { border: none; }
        """)
        drive_row.addWidget(self.drive_combo, stretch=1)

        self.btn_refresh_drives = QPushButton("යාවත්කාලීන කරන්න (Refresh)")
        self.btn_refresh_drives.setStyleSheet("""
            QPushButton { background-color: #1E293B; color: #94A3B8; border: 1px solid #334155; padding: 6px 12px; border-radius: 6px; }
            QPushButton:hover { background-color: #334155; color: #FFFFFF; }
        """)
        self.btn_refresh_drives.clicked.connect(self._refresh_drives)
        drive_row.addWidget(self.btn_refresh_drives)

        top_layout.addLayout(drive_row)

        # Engine Status
        avail, status_msg = self.scanner.is_engine_available()
        self.engine_status_lbl = QLabel(f"🛡️ ආරක්ෂක එන්ජිම: {status_msg}")
        self.engine_status_lbl.setStyleSheet(f"color: {'#10B981' if avail else '#F59E0B'}; font-size: 12px;")
        top_layout.addWidget(self.engine_status_lbl)

        layout.addWidget(top_box)

        # Action Buttons
        act_row = QHBoxLayout()
        self.btn_quick_scan = QPushButton("ඉක්මන් ස්කෑන් (Quick Scan)")
        self.btn_quick_scan.setStyleSheet("""
            QPushButton { background-color: #0284C7; color: #FFFFFF; font-weight: bold; padding: 10px 16px; border-radius: 6px; border: none; }
            QPushButton:hover { background-color: #0369A1; }
        """)
        self.btn_quick_scan.clicked.connect(self._on_quick_scan)
        act_row.addWidget(self.btn_quick_scan)

        self.btn_custom_scan = QPushButton("ෆෝල්ඩරයක් තෝරන්න (Select Folder)")
        self.btn_custom_scan.setStyleSheet("""
            QPushButton { background-color: #1E293B; color: #E2E8F0; padding: 10px 16px; border-radius: 6px; border: 1px solid #334155; }
            QPushButton:hover { background-color: #334155; }
        """)
        self.btn_custom_scan.clicked.connect(self._on_custom_scan)
        act_row.addWidget(self.btn_custom_scan)

        self.btn_integrity = QPushButton("ගොනු අඛණ්ඩතාව පරීක්ෂාව (Audit App Files)")
        self.btn_integrity.setStyleSheet("""
            QPushButton { background-color: #1E293B; color: #F59E0B; padding: 10px 16px; border-radius: 6px; border: 1px solid #F59E0B; }
            QPushButton:hover { background-color: #78350F; }
        """)
        self.btn_integrity.clicked.connect(self._on_integrity_audit)
        act_row.addWidget(self.btn_integrity)

        act_row.addStretch()

        self.btn_cancel_scan = QPushButton("නවත්වන්න (Cancel)")
        self.btn_cancel_scan.setEnabled(False)
        self.btn_cancel_scan.setStyleSheet("""
            QPushButton { background-color: #EF4444; color: #FFFFFF; padding: 10px 16px; border-radius: 6px; border: none; }
            QPushButton:hover { background-color: #DC2626; }
            QPushButton:disabled { background-color: #334155; color: #64748B; }
        """)
        self.btn_cancel_scan.clicked.connect(self._on_cancel_scan)
        act_row.addWidget(self.btn_cancel_scan)

        layout.addLayout(act_row)

        # Scan Telemetry Bar
        self.scan_progress = QProgressBar()
        self.scan_progress.setRange(0, 0)
        self.scan_progress.setVisible(False)
        self.scan_progress.setStyleSheet("""
            QProgressBar { background-color: #0B0F19; border: 1px solid #1E293B; height: 10px; border-radius: 5px; }
            QProgressBar::chunk { background-color: #10B981; border-radius: 5px; }
        """)
        layout.addWidget(self.scan_progress)

        self.scan_cur_file_lbl = QLabel("")
        self.scan_cur_file_lbl.setStyleSheet("color: #94A3B8; font-size: 11px;")
        layout.addWidget(self.scan_cur_file_lbl)

        # Tab view: Findings vs Quarantine Vault
        self.sub_tabs = QTabWidget()
        self.sub_tabs.setStyleSheet("""
            QTabWidget::pane { border: 1px solid #1E293B; background: #0B0F19; border-radius: 8px; }
            QTabBar::tab { background: #131C2E; color: #94A3B8; padding: 8px 16px; border-top-left-radius: 6px; border-top-right-radius: 6px; margin-right: 4px; }
            QTabBar::tab:selected { background: #1E293B; color: #F8FAFC; font-weight: bold; border-bottom: 2px solid #F59E0B; }
        """)

        # Subtab 1: Current Scan Findings
        findings_widget = QWidget()
        findings_layout = QVBoxLayout(findings_widget)
        self.findings_table = QTableWidget(0, 5)
        self.findings_table.setHorizontalHeaderLabels(["ගොනුව (File)", "තර්ජනය (Threat)", "තීව්‍රතාව (Severity)", "වර්ගය (Type)", "ක්‍රියාමාර්ග (Action)"])
        self.findings_table.horizontalHeader().setSectionResizeMode(0, QHeaderView.Stretch)
        self.findings_table.setStyleSheet("background-color: #0B0F19; color: #E2E8F0; gridline-color: #1E293B;")
        findings_layout.addWidget(self.findings_table)
        self.sub_tabs.addTab(findings_widget, "හඳුනාගත් තර්ජන (Detected Findings)")

        # Subtab 2: Quarantine Vault
        quarantine_widget = QWidget()
        quarantine_layout = QVBoxLayout(quarantine_widget)
        self.quarantine_table = QTableWidget(0, 5)
        self.quarantine_table.setHorizontalHeaderLabels(["ID", "මුල් මාර්ගය (Original Path)", "තර්ජනය (Threat)", "දිනය (Date)", "ක්‍රියා (Action)"])
        self.quarantine_table.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
        self.quarantine_table.setStyleSheet("background-color: #0B0F19; color: #E2E8F0; gridline-color: #1E293B;")
        quarantine_layout.addWidget(self.quarantine_table)
        self.sub_tabs.addTab(quarantine_widget, "නිරෝධායන සුරක්ෂිතාගාරය (Quarantine Vault)")

        layout.addWidget(self.sub_tabs, stretch=1)

    def _refresh_drives(self):
        self.drive_combo.clear()
        partitions = psutil.disk_partitions(all=False)
        for p in partitions:
            try:
                usage = psutil.disk_usage(p.mountpoint)
                free_gb = round(usage.free / (1024**3), 2)
                total_gb = round(usage.total / (1024**3), 2)
                label = f"{p.device} ({p.mountpoint}) - {free_gb} GB free / {total_gb} GB [{'Removable/USB' if 'removable' in p.opts.lower() or 'cdrom' not in p.opts.lower() else 'Fixed'}]"
                self.drive_combo.addItem(label, p.mountpoint)
            except Exception:
                self.drive_combo.addItem(f"{p.device} ({p.mountpoint})", p.mountpoint)

    def _on_quick_scan(self):
        target = self.drive_combo.currentData()
        if not target or not os.path.exists(target):
            QMessageBox.warning(self, "ස්කෑන් දෝෂයකි", "කරුණාකර වලංගු ධාවකයක් තෝරන්න.")
            return
        self._start_scan(target)

    def _on_custom_scan(self):
        folder = QFileDialog.getExistingDirectory(self, "ස්කෑන් කිරීමට ෆෝල්ඩරයක් තෝරන්න")
        if folder:
            self._start_scan(folder)

    def _start_scan(self, path):
        self.findings_table.setRowCount(0)
        self.scan_progress.setVisible(True)
        self.btn_quick_scan.setEnabled(False)
        self.btn_custom_scan.setEnabled(False)
        self.btn_cancel_scan.setEnabled(True)

        self.worker = ScanWorker(self.scanner, path)
        self.worker.progress.connect(self._on_scan_progress)
        self.worker.finished.connect(self._on_scan_finished)
        self.worker.start()

    def _on_scan_progress(self, count, cur_file):
        self.scan_cur_file_lbl.setText(f"ස්කෑන් කරමින්: {os.path.basename(cur_file)} ({count} ගොනු සම්පූර්ණයි)")

    def _on_scan_finished(self, result):
        self.scan_progress.setVisible(False)
        self.scan_cur_file_lbl.setText(f"ස්කෑන් කිරීම අවසන්. ගොනු {result['files_scanned']} ක් පරීක්ෂා කරන ලදී. තර්ජන {result['threats_found']} ක් හමුවිය ({result['duration']}s).")
        self.btn_quick_scan.setEnabled(True)
        self.btn_custom_scan.setEnabled(True)
        self.btn_cancel_scan.setEnabled(False)

        # Log into database
        target = self.drive_combo.currentData() or "Custom"
        self.db.record_scan(
            target,
            result['files_scanned'],
            result['threats_found'],
            result['duration'],
            result.get('engine_status', 'Unknown'),
            f"Findings: {len(result['findings'])}"
        )

        # Populate findings table
        self.findings_table.setRowCount(len(result['findings']))
        for row, f in enumerate(result['findings']):
            self.findings_table.setItem(row, 0, QTableWidgetItem(f['file_path']))
            self.findings_table.setItem(row, 1, QTableWidgetItem(f['threat_name']))
            
            sev_item = QTableWidgetItem(f['severity'])
            sev_item.setForeground(Qt.red if f['severity'] == "CRITICAL" else Qt.yellow)
            self.findings_table.setItem(row, 2, sev_item)
            
            self.findings_table.setItem(row, 3, QTableWidgetItem(f['type']))

            btn_quar = QPushButton("නිරෝධායනය (Quarantine)")
            btn_quar.setStyleSheet("background-color: #EF4444; color: white; padding: 4px; border-radius: 4px;")
            btn_quar.clicked.connect(lambda _, fp=f['file_path'], tn=f['threat_name']: self._quarantine_item(fp, tn))
            self.findings_table.setCellWidget(row, 4, btn_quar)

    def _quarantine_item(self, file_path, threat_name):
        ok, msg, meta = self.quarantine.isolate_file(file_path, threat_name)
        if ok and meta:
            self.db.add_quarantine_entry(
                meta["id"], meta["original_path"], meta["vault_file_path"],
                meta["threat_name"], meta["sha256"], meta["file_size"]
            )
            QMessageBox.information(self, "නිරෝධායනය සාර්ථකයි", f"{msg}\nතර්ජනය සුරක්ෂිතව විසන්ධි කරන ලදී.")
            self._refresh_quarantine_table()
        else:
            QMessageBox.critical(self, "නිරෝධායන දෝෂයකි", msg)

    def _refresh_quarantine_table(self):
        entries = self.db.list_quarantine_entries()
        self.quarantine_table.setRowCount(len(entries))
        for row, e in enumerate(entries):
            self.quarantine_table.setItem(row, 0, QTableWidgetItem(e['id'][:8]))
            self.quarantine_table.setItem(row, 1, QTableWidgetItem(e['original_path']))
            self.quarantine_table.setItem(row, 2, QTableWidgetItem(e['threat_name']))
            self.quarantine_table.setItem(row, 3, QTableWidgetItem(e['quarantined_at'][:19]))

            action_widget = QWidget()
            act_layout = QHBoxLayout(action_widget)
            act_layout.setContentsMargins(0, 0, 0, 0)
            
            btn_restore = QPushButton("නැවත පිහිටුවන්න (Restore)")
            btn_restore.setStyleSheet("background-color: #10B981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;")
            btn_restore.clicked.connect(lambda _, eid=e['id']: self._restore_quarantine(eid))
            act_layout.addWidget(btn_restore)

            btn_delete = QPushButton("මකන්න (Delete)")
            btn_delete.setStyleSheet("background-color: #7F1D1D; color: #FCA5A5; padding: 2px 6px; border-radius: 4px; font-size: 11px;")
            btn_delete.clicked.connect(lambda _, eid=e['id']: self._delete_quarantine(eid))
            act_layout.addWidget(btn_delete)

            self.quarantine_table.setCellWidget(row, 4, action_widget)

    def _restore_quarantine(self, entry_id):
        ok, msg = self.quarantine.restore_file(entry_id)
        if ok:
            self.db.mark_quarantine_restored(entry_id)
            QMessageBox.information(self, "නැවත පිහිටුවීම සාර්ථකයි", msg)
            self._refresh_quarantine_table()
        else:
            QMessageBox.critical(self, "දෝෂයකි", msg)

    def _delete_quarantine(self, entry_id):
        reply = QMessageBox.question(
            self, "ස්ථිරවම මකන්න",
            "මෙම තර්ජනාත්මක ගොනුව ස්ථිරවම මකා දැමීමට ඔබට විශ්වාසද?",
            QMessageBox.Yes | QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            self.quarantine.delete_quarantined_permanently(entry_id)
            self.db.delete_quarantine_entry(entry_id)
            self._refresh_quarantine_table()

    def _on_integrity_audit(self):
        res = self.auditor.audit()
        msg = f"තත්ත්වය: {res['status']}\n{res['message']}\n\n"
        for d in res['details']:
            msg += f"• {d['file']}: [{d['status']}] {d['details']}\n"
        QMessageBox.information(self, "ගොනු අඛණ්ඩතාව පරීක්ෂාව", msg)

    def _on_cancel_scan(self):
        if self.scanner:
            self.scanner.cancel_scan()
