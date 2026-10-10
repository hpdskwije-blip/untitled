# NENAPIYUMA AI USB: Offline AI Assistant & USB Guard Suite

NENAPIYUMA AI USB is a complete, self-contained, offline-first portable Windows application that pairs a local Sinhala/English conversational AI (powered by a compact Gemma 2 2B Instruct Q4 model via llama.cpp) with an offline USB Guard security and ClamAV scanning engine, designed specifically to operate within 6 GB RAM and a 6 GB USB flash drive. This solution delivers both the full production-ready Windows repository with automated GitHub Actions packaging scripts and an interactive companion web studio with a Sinhala AI chat playground, live USB Guard sandbox, and one-click project exporter.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were aligned during the initial consultation:

- **Confirmed Decision 1: Model Choice & Budget**: Gemma 2 2B Instruct Q4 GGUF (~1.6 GB) was selected as the default primary model. It strikes the optimal balance between high-quality Sinhala language comprehension and conservative memory consumption, easily fitting within the 6 GB USB storage and 6 GB system RAM targets with a 2048-token context window.
- **Confirmed Decision 2: Primary AI Studio Companion Role**: A dual-purpose workspace featuring an interactive Sinhala AI chat playground with a live USB Guard sandbox simulator, accompanied by a complete repository file tree explorer, Windows PyInstaller build manifests, GitHub Actions workflow scripts, and a one-click ZIP packaging export.
- **Confirmed Decision 3: Security & Antivirus Architecture**: A bundled portable ClamAV Windows scanner (`clamscan.exe` runtime with offline signature databases `main.cvd`/`daily.cvd`), combined with SHA-256 cryptographic file integrity verification and an isolated quarantine vault (`.nenapiyuma/quarantine`) that neutralizes suspicious removable drive files without breaking the host PC.

---

## 1. Overview & Core Concept

- **What It Does**: Provides users in resource-constrained or air-gapped environments with an instant, double-click offline AI assistant (`NENAPIYUMA.exe`) on a USB drive. Users can converse naturally in Sinhala or English, ask questions, draft documents, and inspect connected removable drives for malware without internet access, API keys, or Python installations.
- **Target Audience & Persona**: Students, professionals, and field workers in Sri Lanka who require accessible local AI in Sinhala, running on modest Windows laptops (6 GB RAM) from portable storage without recurrent cloud expenses or complex software installation steps.
- **Key Value**: True zero-configuration portability: Download a single verified GitHub Release ZIP, extract to a USB drive, double-click `NENAPIYUMA.exe`, and start chatting immediately in Sinhala with built-in removable drive protection.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Startup & Hardware Readiness**: The application inspects available physical memory, local drive space, model integrity, and ClamAV binary existence. It displays an unobtrusive status banner confirming offline readiness.
2. **Sinhala & English Conversational Chat**: Users chat with Gemma in pure Sinhala (Unicode compliant), with instant stop-generation, response copying, conversation resets, and real-time inference speed indicators.
3. **USB Guard Removable Drive Security**: When a USB flash drive or external SSD is selected, users can run quick scans, deep scans, or integrity audits. Any detected threats or unauthorized file modifications are quarantined with clear explanations in Sinhala and English.
4. **Repository & Packaging Studio**: In the companion web studio, users can test sample Sinhala prompts, inspect all repository files, review the GitHub Actions workflow, and export the complete project structure.

### Visual Identity & Theme
- **Aesthetic Direction**: Sleek, industrial dark workstation theme (`#0F172A` Slate / `#1E293B` Slate Navy) inspired by utilitarian security tools and high-performance desktop applications.
- **Color Palette**:
  - Dominant Background: Deep slate (`#0B0F19`) and container slate (`#131C2E`).
  - Brand Accent: Sinhala saffron gold (`#F59E0B` / `#D97706`) paired with cyber cyan (`#06B6D4`).
  - Semantic State Colors: Emerald (`#10B981`) for offline nominal security; Crimson (`#EF4444`) for quarantined threats; Amber (`#F59E0B`) for memory/storage warnings.
- **Typography & Hierarchy**:
  - Latin & System: Clean sans-serif (`Inter`, `Plus Jakarta Sans`) with monospace tabular numbers (`JetBrains Mono`, `tabular-nums`) for scan telemetry, memory metrics, and byte counters.
  - Sinhala Type: High-legibility Sinhala Unicode typography with proper vowel modifier rendering and line-height spacing.
- **Component Styling & Layout**: Strict adherence to zero-pill discipline (unboxed metadata with subtle dot separators `·`), single-elevation cards, high-density telemetry displays, and single-line responsive button controls.

---

## 3. Key Product Decisions & Trade-Offs

- **Desktop Framework (Python + PySide6 / Qt6)**:
  - *Chosen Approach*: PySide6 with PyInstaller single-folder portable bundling.
  - *Why*: Provides native Windows 10/11 widgets, smooth high-DPI scaling, genuine hardware integration (removable drive change notifications via `WM_DEVICECHANGE`), and clean asynchronous Qt threading for llama.cpp subprocess streaming.
  - *Alternatives Considered*: Electron (rejected due to excessive base memory footprint of ~250 MB RAM, leaving less headroom for Gemma on 6 GB systems).
- **Inference Runtime (llama.cpp / llama-cpp-python)**:
  - *Chosen Approach*: Portable `llama.cpp` Windows x64 binary execution or embedded `llama-cpp-python` wheels with CPU AVX2 optimizations.
  - *Why*: Highly optimized for CPU-only inference on 6 GB RAM, zero external DLL dependencies, and native support for GGUF quantization.
  - *Alternatives Considered*: Ollama (rejected because it requires a system service install with administrator rights, breaking the portable USB mandate).
- **Storage & Memory Budget Allocation**:
  - USB Drive (6 GB capacity target):
    - App & Python Runtime: ~85 MB
    - Gemma 2 2B Q4 GGUF: ~1.62 GB
    - Portable ClamAV & offline daily database: ~280 MB
    - User Chat History & Quarantine Reserve: ~200 MB
    - **Total Package Footprint**: ~2.2 GB (comfortably leaving >3.5 GB of free operating space on a 6 GB USB drive).
  - RAM Budget (6 GB total target):
    - Operating System baseline: ~2.5 GB
    - PySide6 Application: ~90 MB
    - Gemma 2 2B Q4 GGUF loaded in RAM: ~1.85 GB
    - **Total RAM Usage**: ~4.45 GB (leaves >1.5 GB safety cushion to prevent paging).

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NENAPIYUMA AI USB ROOT                          │
├──────────────────────────┬─────────────────────────────────────────────┤
│   Desktop Application    │      Interactive Companion Web Studio       │
│   (Windows x64 Portable) │      (React + Vite + Express + Tailwind)    │
└────────────┬─────────────┴──────────────────────┬──────────────────────┘
             │                                    │
             ▼                                    ▼
┌─────────────────────────┐              ┌───────────────────────────────┐
│     PySide6 GUI Core    │              │   Multi-Panel Web Interface   │
│  - Sinhala/English Chat │              │  - Sinhala AI Playground      │
│  - USB Guard Security   │              │  - Live USB Guard Sandbox     │
│  - System Telemetry     │              │  - Project Repository Browser │
└────────────┬────────────┘              │  - 1-Click Code/ZIP Exporter  │
             │                           └───────────────┬───────────────┘
     ┌───────┴────────┐                                  │
     ▼                ▼                                  ▼
┌──────────────┐ ┌──────────────┐                ┌───────────────────────┐
│  llama.cpp   │ │   ClamAV     │                │   Project Generator   │
│ Local Engine │ │ Portable Scn │                │  - Complete Codebase  │
│ Gemma 2 2B Q4│ │ .cvd / Quarn │                │  - Windows Build Bat  │
└──────────────┘ └──────────────┘                │  - GitHub Actions CI  │
                                                 └───────────────────────┘
```

### Complete Codebase & Repository File Structure
The project delivers the complete portable Windows codebase under `NENAPIYUMA-AI-USB/`:
- `app/main.py`: PySide6 entry point, hardware & path detection, startup health checks.
- `app/ui/main_window.py`: Native Windows dark interface with Sinhala typography and tab routing.
- `app/ui/chat_tab.py`: Sinhala conversational interface with real-time token streaming and prompt presets.
- `app/ui/usb_guard_tab.py`: Removable drive selector, scan progress bar, threat table, and quarantine manager.
- `app/ai/engine.py`: llama.cpp process manager, model auto-discovery, context limiter, and safe execution bounds.
- `app/ai/model_registry.py`: GGUF validation, SHA-256 verification, and memory safety checks.
- `app/security/scanner.py`: ClamAV wrapper, offline database updater, and directory recursive walker.
- `app/security/quarantine.py`: Cryptographic quarantine vault with secure header scrambling.
- `app/security/integrity.py`: Hash catalog checking for application files against tampering.
- `app/storage/db.py`: SQLite local storage for chat history, settings, and scan audit logs.
- `config/settings.json`: Default configuration with path resolution for changing drive letters.
- `tests/test_all.py`: Complete test suite covering model loading, Sinhala encoding, scanner errors, and quarantine.
- `scripts/build_windows.bat`: Local PyInstaller build script for creating `NENAPIYUMA.exe`.
- `.github/workflows/build_release.yml`: Automated GitHub Actions pipeline that fetches the model, builds the EXE, runs tests, and publishes the release ZIP.
- `README.md`, `README_SI.md`, `BUILD_WINDOWS.md`, `OFFLINE_SETUP.md`, `SECURITY.md`, `LICENSE`.

---

## 5. Next Steps
Upon approval, implementation will proceed across the desktop application codebase, automated GitHub Actions workflow, test suite, documentation, and the interactive AI Studio companion console.
