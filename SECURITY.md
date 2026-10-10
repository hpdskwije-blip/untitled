# Security Policy & USB Guard Architecture

## Scope & Philosophy

NENAPIYUMA AI USB operates on the principle of **Least Privilege** and **Transparent Defense**:
1. **Supplementary Protection**: USB Guard is designed to detect removable-drive threats (such as worm propagators, shortcut viruses, and autorun payloads). It does *not* replace the host computer's full system antivirus (Windows Defender).
2. **Never Disables Security**: The software never attempts to disable Windows SmartScreen, Defender, or Firewall.
3. **No Automatic Command Execution**: The AI assistant (Gemma) has zero ability to execute shell commands, batch scripts, or PowerShell code automatically on the user's host PC.

---

## Quarantine Isolation Vault

When a threat is detected:
- The file is moved to `.nenapiyuma/quarantine/<uuid>.vir`.
- The first 4,096 bytes are XOR-scrambled with key `0x5A` so Windows Explorer cannot parse the PE header or launch it via double-click.
- Original path, hash, and threat metadata are stored in sidecar JSON.
- Restoration requires explicit user action and verifies the restored SHA-256 hash before returning it to the filesystem.
