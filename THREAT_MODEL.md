# Threat Model: NENAPIYUMA AI USB

| Threat Category | Potential Attack Vector | Mitigation in NENAPIYUMA AI USB |
| :--- | :--- | :--- |
| **Malicious USB Insertion** | Autorun worms, hidden LNK shortcuts executing PowerShell | USB Guard disables automatic execution; heuristics flag suspicious autorun and shortcut targets. |
| **Tampered Model Weights** | Malicious GGUF injection or bitflip attack | SHA-256 integrity verification, GGUF magic header check, and file size boundary checks. |
| **Prompt Injection / Jailbreak** | Crafting prompts to trigger harmful local actions | Gemma 2 2B inference engine is completely isolated from system shell; cannot execute shell commands. |
| **Accidental Threat Execution** | Quarantined malware clicked by user inside Explorer | Quarantined files are given `.vir` extension and the PE executable header is scrambled with an XOR mask. |
| **Memory Exhaustion (DoS)** | Model loading crashes PC due to 6 GB RAM limit | Strict 2048 token context capping, mmap model loading, and RAM availability validation prior to allocation. |
| **Data Leakage / Eavesdropping** | Conversations monitored over LAN/WAN | Engine binds to no external network ports; database stored strictly locally in SQLite file. |
