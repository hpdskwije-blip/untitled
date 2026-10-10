# 🇱🇰 NENAPIYUMA - පළමු වතාවට GitHub සැකසුමක් 

> **ඔබ GitHub භාවිතා කරන්න අමතක කළ අයට සඳහා සම්පූර්ණ පියවරගත ගයිඩ්**

---

## **Phase 1: Git Download කරන්න** (5 මිනිත්තු)

### Windows PC එකේ Git install කරන්න:

1. **Download**: https://git-scm.com/download/win
2. **Install** කරන්න (Next → Next → Finish)
3. **Command Prompt හෝ PowerShell** open කරන්න

```bash
# Git installed ඇති かහ බලන්න:
git --version
# Output: git version 2.43.0 (or similar) ✅
```

---

## **Phase 2: Python Download කරන්න** (5 මිනිත්තු)

### Windows PC එකේ Python install කරන්න:

1. **Download**: https://www.python.org/downloads/
2. **Python 3.11** select කරන්න
3. **⚠️ IMPORTANT: "Add Python to PATH" checkbox එක ඉස්සර කරන්න** 
4. **Install Now** click කරන්න

```bash
# PowerShell/Command Prompt එකේ verify කරන්න:
python --version
# Output: Python 3.11.x ✅

pip --version
# Output: pip 24.x.x ✅
```

---

## **Phase 3: Repository Clone කරන්න** (2 මිනිත්තු)

### Desktop එකේ NENAPIYUMA project එක download කරන්න:

```bash
# Desktop එකට navigate කරන්න
cd Desktop

# Repository clone කරන්න
git clone https://github.com/hpdskwije-blip/untitled.git

# Project එකට ඉන්ගන්න
cd untitled
```

**Output:**
```
Cloning into 'untitled'...
remote: Enumerating objects: 456, done.
remote: Counting objects: 100% (456/456), done.
remote: Compressing objects: 100% (234/234), done.
remote: Receiving objects: 100% (456/456), 125 MB
...done.
```

✅ **Desktop\untitled** ෆෝල්ඩරයේ සිටින්න

---

## **Phase 4: Virtual Environment හැදුවීම** (3 මිනිත්තු)

### Python "sandbox" එක හාදුවයි (තිබෙන dependencies අන්තරාය නොවේ):

```bash
# PowerShell එකේ untitled folder එකේ සිටින්න:
cd C:\Users\YourName\Desktop\untitled

# Virtual Environment හැදුවීම
python -m venv venv

# Activate කරන්න (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Command Prompt එක use කරන්නම්නම්:
venv\Scripts\activate.bat
```

✅ **Expected:** PowerShell එකෙ එපසු `(venv)` prefix පෙනෙයි:
```
(venv) C:\Users\YourName\Desktop\untitled>
```

---

## **Phase 5: Dependencies Install කරන්න** (10 මිනිත්තු)

```bash
# pip upgrade කරන්න
python -m pip install --upgrade pip

# NENAPIYUMA requirements install කරන්න
pip install -r requirements.txt
```

**Dependencies:**
- `PySide6` - GUI (Window එක)
- `llama-cpp-python` - AI Engine
- `pyinstaller` - .exe builder
- `pytest` - Testing

---

## **Phase 6: Model (AI Mind) Download කරන්න** (3 මිනිත්තු)

### Gemma 3 AI Model එක (~850 MB) download කරන්න:

```bash
# Model download script run කරන්න
python download_model.py

# Progress බලන්න...
# Downloading gemma3.gguf [████████████████████] 100%
```

✅ **File location**: `models/gemma3.gguf` (Desktop\untitled\models)

---

## **Phase 7: Application Test කරන්න** (2 මිනිත්තු)

### AI Assistant එක start කරන්න:

```bash
# Main application run කරන්න
python main.py
```

✅ **Window එක open වයි**:
- Sinhala/English chat interface
- USB Security Scanner tab
- Model status

---

## **Phase 8: Windows Executable (.exe) හැදුවීම** (15 මිනිත්තු)

### Double-click run කරන Portable .exe හැදුවීම:

```bash
# Build script run කරන්න
build_windows.bat
```

✅ **Output location**: `dist\NENAPIYUMA\NENAPIYUMA.exe`

---

## **Phase 9: USB Flash Drive එකට දමන්න** (2 මිනිත්තු)

### Portable නිසා ඕනෑම USB එකෙන් run කරන්න:

```bash
# dist folder copy කරන්න
xcopy dist\NENAPIYUMA D:\  /E /I

# USB එකෙන් run කරන්න
D:\NENAPIYUMA\NENAPIYUMA.exe ✅
```

---

## **ගැටුම් සෙවීම** 🔧

| ගැටුම | විසඳුම |
|-------|--------|
| `python: command not found` | Python PATH එකට එක් කරන්න - reinstall කරන්න |
| `(venv) prefix නැත` | `.\venv\Scripts\Activate.ps1` හෝ `venv\Scripts\activate.bat` run කරන්න |
| `pip install error` | `pip install --upgrade pip` run කරන්න |
| `gemma3.gguf download error` | Manual download: https://huggingface.co/google/gemma-2b-it-gguf |
| `PyInstaller error` | `pip install pyinstaller --upgrade` run කරන්න |

---

## **පිටින් ඉතින්** 📝

```bash
# Virtual environment deactivate කරන්න (අවසලට):
deactivate

# GitHub එකට changes push කරන්න (ඉතින්):
git add .
git commit -m "My first NENAPIYUMA build"
git push origin main
```

---

## **ඉල්ලෙන්න උදව්** ❓

- PowerShell/Command Prompt දෝෂ?
- dependency install ගැටුම?
- .exe run නොවනවා?

**GitHub Issues එකට post කරන්න:**
```
https://github.com/hpdskwije-blip/untitled/issues
```

---

**✅ ඉතින් ඔබ දැන් GitHub expert ඉවර!** 🎉
