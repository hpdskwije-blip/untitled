"""
NENAPIYUMA AI USB - Local Inference Engine
Direct llama.cpp / llama-cpp-python binding optimized for CPU execution on 6 GB RAM.
Zero network access. Zero external server dependencies.
"""

import os
import sys
import threading
import time
from typing import Generator, Optional, Dict, Any, List, Tuple

try:
    from llama_cpp import Llama
    HAS_LLAMA_CPP = True
except ImportError:
    HAS_LLAMA_CPP = False


class InferenceEngine:
    def __init__(self, model_path: str, context_size: int = 2048, n_threads: int = 4):
        self.model_path = model_path
        self.context_size = min(context_size, 4096)
        self.n_threads = max(1, n_threads)
        self.llm: Optional[Any] = None
        self.is_loaded = False
        self.is_generating = False
        self._stop_event = threading.Event()
        self.last_load_duration = 0.0

    def load_model(self) -> Tuple[bool, str]:
        """Loads the GGUF model into host memory with conservative CPU settings."""
        if not os.path.isfile(self.model_path):
            return False, f"Model file not found at: {self.model_path}"

        start_t = time.time()
        try:
            if HAS_LLAMA_CPP:
                # Direct C++ binding via llama_cpp
                self.llm = Llama(
                    model_path=self.model_path,
                    n_ctx=self.context_size,
                    n_threads=self.n_threads,
                    n_batch=512,
                    use_mmap=True,
                    use_mlock=False,
                    verbose=False
                )
                self.is_loaded = True
                self.last_load_duration = round(time.time() - start_t, 2)
                return True, f"Loaded in {self.last_load_duration}s"
            else:
                return False, "llama-cpp-python runtime is not installed. Please install requirements.txt or use bundled binary."
        except Exception as e:
            self.is_loaded = False
            return False, f"Inference engine initialization error: {str(e)}"

    def stop_generation(self) -> None:
        """Signals current token generation to halt immediately."""
        self._stop_event.set()

    def generate_response(
        self,
        messages: List[Dict[str, str]],
        max_tokens: int = 1024,
        temperature: float = 0.7,
        top_p: float = 0.9,
    ) -> Generator[str, None, None]:
        """
        Streams response tokens using Gemma 2 Chat format:
        <start_of_turn>user
        {prompt}<end_of_turn>
        <start_of_turn>model
        """
        if not self.is_loaded or self.llm is None:
            yield "දෝෂයකි: Gemma ආකෘතිය ආරම්භ වී නොමැත. කරුණාකර පළමුව ආකෘතිය පූරණය කරන්න."
            return

        self._stop_event.clear()
        self.is_generating = True

        # Build prompt using Gemma 2 / Gemma 3 Chat template
        formatted_prompt = ""
        for msg in messages:
            role = "user" if msg["role"] == "user" else "model"
            formatted_prompt += f"<start_of_turn>{role}\n{msg['content']}<end_of_turn>\n"
        formatted_prompt += "<start_of_turn>model\n"

        try:
            stream = self.llm(
                prompt=formatted_prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                stream=True,
                stop=["<end_of_turn>", "<start_of_turn>", "<eos>"]
            )

            for output in stream:
                if self._stop_event.is_set():
                    yield "\n\n[ජනනය කිරීම පරිශීලකයා විසින් නවත්වන ලදී]"
                    break
                text_chunk = output["choices"][0]["text"]
                yield text_chunk

        except Exception as e:
            yield f"\n[දෝෂයකි: {str(e)}]"
        finally:
            self.is_generating = False
            self._stop_event.clear()

    def unload(self):
        """Releases model from RAM."""
        if self.llm is not None:
            del self.llm
            self.llm = None
        self.is_loaded = False
