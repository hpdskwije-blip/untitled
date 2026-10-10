# Offline Air-Gapped Deployment Guide

This document describes how to deploy and operate **NENAPIYUMA AI USB** in strict, air-gapped, zero-connectivity environments (schools, rural libraries, field offices, and high-security air-gapped workstations).

---

## 1. Zero Network Guarantee

Once the release archive (`NENAPIYUMA-AI-USB-*-Windows-x64.zip`) is transferred to the offline PC:
- **No Inbound or Outbound Requests**: The application never binds to external interfaces or initiates socket connections to the internet.
- **Local SQLite Database**: All conversations and scan audits stay inside `.nenapiyuma/nenapiyuma.db` on the USB drive.
- **No Background Telemetry**: No crash analytics, analytics beacons, or remote pings exist in the codebase.

---

## 2. Dynamic Drive Letter Handling

When a USB flash drive is moved between Windows PCs, Windows assigns unpredictable drive letters (`D:`, `E:`, `F:`, `G:`).
- `NENAPIYUMA.exe` determines its runtime root dynamically using `sys.executable` / `BASE_DIR`.
- All model paths, databases, and quarantine directories are resolved relative to the executable location.
- Spaces in directory paths (e.g. `E:\My USB Drive\NENAPIYUMA\`) are properly quoted and handled.

---

## 3. Storage Allocation Strategy on 6 GB USB

To ensure continuous operation without storage exhaustion:
1. `Gemma 2 2B Q4 GGUF`: 1.62 GB (static, read-only).
2. `ClamAV & Signatures`: ~280 MB (static).
3. `Executable & Python Libs`: ~85 MB (static).
4. `User Space (Chat Logs & Quarantine)`: Capped with warning threshold if free space drops below 500 MB.
5. Remaining Free Space: >3.5 GB for user documents and presentations.
