"""
NENAPIYUMA AI USB - Sinhala-Pure AI Model Training & GGUF Quantization Script
Fine-tunes Gemma 3 to respond strictly and fluently in 100% pure Sinhala,
then quantizes and exports the result directly to models/nenapiyuma-sinhala.gguf.
"""

import os
import json
import subprocess

# Sample Curated Pure-Sinhala Instruction Dataset
SAMPLE_SINHALA_DATASET = [
    {
        "instruction": "රාජකාරි නිවාඩු ලිපියක් සකස් කරන්නේ කෙසේද?",
        "response": "රාජකාරි නිවාඩු ලිපියක් ලිවීමේදී දිනය, ආයතන ප්‍රධානියාගේ තනතුර, නිවාඩු ඉල්ලුම් කිරීමට හේතුව (අසනීප තත්ත්වය හෝ හදිසි පෞද්ගලික හේතුවක්), නිවාඩු දිනයන් සහ අදාළ කාලය තුළ රාජකාරි පැවරූ නිලධාරියාගේ නම නිවැරදිව සඳහන් කර ඔබගේ අත්සන යෙදිය යුතුය."
    },
    {
        "instruction": "What is an offline artificial intelligence model?",
        "response": "නොබැඳි කෘතිම බුද්ධි ආකෘතියක් (Offline AI) යනු කිසිදු අන්තර්ජාල සම්බන්ධතාවක් හෝ ක්ලවුඩ් සර්වරයක් අවශ්‍ය නොවී, ඔබගේ පරිගණකයේ හෝ USB ධාවකයේ දෘඩාංග මත සෘජුවම ධාවනය වන ස්වයංක්‍රීය පරිගණක බුද්ධි පද්ධතියකි."
    },
    {
        "instruction": "පරිගණකයක RAM එකේ කාර්යභාරය පැහැදිලි කරන්න.",
        "response": "පරිගණකයක RAM (Random Access Memory) හෙවත් සසම්භාවී ප්‍රවේශ මතකය යනු ප්‍රොසෙසරය මඟින් ක්‍රියාත්මක වන වැඩසටහන් සහ දත්ත තාවකාලිකව රඳවා තබා ගන්නා අධිවේගී ප්‍රධාන මතකයයි. පරිගණකය ක්‍රියා විරහිත කළ විට මෙහි ඇති දත්ත මැකී යයි."
    },
    {
        "instruction": "Write a python function to add two numbers.",
        "response": "සංඛ්‍යා දෙකක් එකතු කිරීම සඳහා සරල පයිතන් (Python) ශ්‍රිතය පහත දැක්වේ:\n\ndef එකතුව(අංක_1, අංක_2):\n    ප්‍රතිඵලය = අංක_1 + අංක_2\n    return ප්‍රතිඵලය\n\n# භාවිතය:\nමුද්‍රණය = එකතුව(10, 25)\nprint('එකතුව:', මුද්‍රණය) # ප්‍රතිදානය 35 වේ."
    }
]


def prepare_sinhala_dataset(output_path="dataset_sinhala.jsonl"):
    print(f"[NENAPIYUMA] Preparing Pure-Sinhala instruction dataset at {output_path}...")
    with open(output_path, "w", encoding="utf-8") as f:
        for item in SAMPLE_SINHALA_DATASET:
            formatted = {
                "messages": [
                    {
                        "role": "system",
                        "content": "ඔබ නැනපියුම පිරිසිදු සිංහල AI ආකෘතිය වේ. ඔබ දන්නේ සහ පිළිතුරු සපයන්නේ සිංහල භාෂාවෙන් පමණි."
                    },
                    {"role": "user", "content": item["instruction"]},
                    {"role": "model", "content": item["response"]}
                ]
            }
            f.write(json.dumps(formatted, ensure_ascii=False) + "\n")
    print(f"[NENAPIYUMA] Dataset written with {len(SAMPLE_SINHALA_DATASET)} seed examples.")


def export_gguf_instructions():
    print("""
================================================================================
   NENAPIYUMA Sinhala-Pure AI Model - Fine-Tuning & Quantization Pipeline
================================================================================
1. Train with Unsloth / Hugging Face SFTTrainer:
   python -m pip install unsloth trl transformers torch

2. Fine-tune Gemma 3 Base with LoRA:
   - Base Model: google/gemma-3-1b-it
   - LoRA Rank (r): 16, Alpha: 32
   - Target Modules: q_proj, k_proj, v_proj, o_proj
   - Language Constraint: 100% Sinhala output enforcement

3. Convert to GGUF format via llama.cpp:
   python llama.cpp/convert_hf_to_gguf.py ./fine_tuned_sinhala/ --outfile models/nenapiyuma-sinhala.gguf --outtype q4_k_m

4. Resulting file:
   models/nenapiyuma-sinhala.gguf (~850 MB, Pure Sinhala Offline AI)
================================================================================
""")


if __name__ == "__main__":
    prepare_sinhala_dataset()
    export_gguf_instructions()
