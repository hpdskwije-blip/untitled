# NENAPIYUMA AI USB 🚀

> **Portable Offline AI Assistant + Gemma 3 (gemma3.gguf) + Windows EXE + USB Guard + Zero-Cloud Privacy**  
> Designed for Sri Lankan users, students, and professionals on Windows 10/11 x64 systems with 6 GB RAM and 6 GB USB flash drives.

---

## 🇱🇰 විශේෂාංග (Key Highlights)

- **100% Offline (නොබැඳි ක්‍රියාකාරිත්වය)**: Zero internet required for inference or chat once downloaded. No subscriptions, API keys, or cloud telemetry.
- **Natural Sinhala & English Support**: Converse fluently in Sinhala Unicode script with high accuracy and low latency.
- **Gemma 3 (gemma3.gguf)**: Ultra-compact, fast Google Gemma 3 quantized model (~850 MB GGUF) optimized for low-memory 6 GB RAM computers and instant USB portability.
- **USB Guard Security Suite**: Integrated portable ClamAV malware scanning engine, offline signature database, USB autorun worm heuristics, and quarantine vault.
- **Zero Python Installation**: Portable double-click executable (`NENAPIYUMA.exe`).

---

## 📊 Storage & Hardware Budget (6 GB RAM / 6 GB USB Target)

| Component | Disk Size (USB) | RAM Footprint | Notes |
| :--- | :--- | :--- | :--- |
| **NENAPIYUMA.exe & Runtime** | ~85 MB | ~90 MB | Self-contained PySide6 + llama.cpp |
| **Gemma 3 GGUF (gemma3.gguf)** | ~850 MB | ~980 MB | 2048 Context window, CPU AVX2 |
| **ClamAV Engine & Signatures** | ~280 MB | ~45 MB (during scan) | Portable offline daily definitions |
| **Quarantine & Database** | ~200 MB (reserved) | ~15 MB | SQLite local vault |
| **Operating System & Overhead** | — | ~2,500 MB | Baseline Windows 10/11 |
| **Total Estimated Footprint** | **~1.42 GB** (of 6 GB USB) | **~3.62 GB** (of 6 GB RAM) | **Outstanding 2.38 GB RAM safety cushion** |

---

## ⚡ Quick Start for End Users

1. Open the **GitHub Releases** page of `NENAPIYUMA-AI-USB`.
2. Download `NENAPIYUMA-AI-USB-v1.0.0-Windows-x64.zip`.
3. Extract the ZIP archive.
4. Copy the application folder directly to your **USB Flash Drive**.
5. Double-click `NENAPIYUMA.exe`.
6. Start chatting with Gemma in Sinhala immediately!

For detailed Sinhala instructions, see [`README_SI.md`](README_SI.md).

---

## 🛡️ Security & USB Guard Architecture

USB Guard supplements Windows Defender without disabling host security:
- **Heuristic Engine**: Detects dangerous `autorun.inf` directives, disguised double-extensions (`.pdf.exe`), and malicious PowerShell shortcut files (`.lnk`).
- **ClamAV Offline Engine**: Performs deep signature-based inspections using bundled local signature definition files.
- **Quarantine Vault**: Isolates threats by moving them to `.nenapiyuma/quarantine` and XOR-scrambling execution bytes to prevent accidental execution.

---

## 📜 Repository Structure

```
NENAPIYUMA-AI-USB/
├── app/
│   ├── main.py                  # Portable executable entry point
│   ├── ui/
│   │   ├── main_window.py       # High-DPI PySide6 dark interface
│   │   ├── chat_tab.py          # Sinhala streaming chat UI
│   │   └── usb_guard_tab.py     # USB malware scanner & quarantine
│   ├── ai/
│   │   ├── engine.py            # Local llama.cpp inference engine
│   │   └── model_registry.py    # GGUF validation & memory feasibility
│   ├── security/
│   │   ├── scanner.py           # ClamAV and heuristic scanner
│   │   ├── quarantine.py        # Safe byte-scrambled isolation vault
│   │   └── integrity.py         # SHA-256 core file tampering auditor
│   └── storage/
│       └── db.py                # Local SQLite chat & scan history
├── config/
│   └── settings.json            # Portable path configuration
├── scripts/
│   ├── build_windows.bat        # PyInstaller build pipeline
│   └── download_model.py        # Automated model acquisition
├── tests/
│   └── test_all.py              # Automated test suite
├── .github/workflows/
│   └── build_release.yml        # CI/CD release workflow
├── requirements.txt             # Pinned dependencies
├── README_SI.md                 # Sinhala user manual
├── BUILD_WINDOWS.md             # Developer build guide
├── OFFLINE_SETUP.md             # Air-gap deployment guide
└── LICENSE                      # Apache 2.0 License
```
