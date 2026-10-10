# Building NENAPIYUMA AI USB on Windows x64

This guide covers building the portable `NENAPIYUMA.exe` distribution from source on Windows 10/11 x64.

---

## Prerequisites

1. **Windows 10/11 (64-bit)**
2. **Python 3.10 or 3.11** (Ensure "Add Python to PATH" is checked during installation)
3. **Microsoft C++ Build Tools** (Required only if compiling llama-cpp-python from source; prebuilt wheels are recommended)
4. **Git for Windows** (Optional)

---

## Step-by-Step Build Instructions

### 1. Clone or Extract Source
```bash
git clone https://github.com/YourUsername/NENAPIYUMA-AI-USB.git
cd NENAPIYUMA-AI-USB
```

### 2. Set Up Virtual Environment
```cmd
python -m venv venv
call venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Acquire Model Weights
Download the quantized Gemma 2 2B Instruct GGUF into the `models/` directory:
```cmd
python scripts\download_model.py
```
*Expected file location*: `models\gemma-2-2b-it-Q4_K_M.gguf` (~1.62 GB)

### 4. Setup Portable ClamAV
Place the ClamAV Windows x64 binaries into `tools\clamav\`:
- `tools\clamav\clamscan.exe`
- `tools\clamav\database\main.cvd`
- `tools\clamav\database\daily.cvd`

### 5. Run Automated Tests
```cmd
python -m unittest tests\test_all.py
```

### 6. Compile Portable Executable
Run the automated build script:
```cmd
scripts\build_windows.bat
```
The compiled output will be generated inside `dist\NENAPIYUMA\`:
- `dist\NENAPIYUMA\NENAPIYUMA.exe`
- `dist\NENAPIYUMA\models\`
- `dist\NENAPIYUMA\tools\clamav\`
- `dist\NENAPIYUMA\config\settings.json`

Copy `dist\NENAPIYUMA\` directly to your target USB drive!
