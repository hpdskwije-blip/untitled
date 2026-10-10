import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Copy, Check, RotateCcw, Sparkles, Terminal, Info } from 'lucide-react';
import { Message } from '../types';

interface ChatPlaygroundProps {
  ramUsageGb: number;
}

const PRESET_PROMPTS = [
  {
    title: 'රාජකාරි නිවාඩු ලිපියක්',
    prompt: 'රෝගී තත්ත්වයක් හේතුවෙන් දින 3ක නිවාඩුවක් ඉල්ලා ආයතන ප්‍රධානියා වෙත යොමු කරන නිල ලිපියක් සිංහලෙන් සකස් කර දෙන්න.'
  },
  {
    title: 'USB ධාවක ආරක්ෂක උපදෙස්',
    prompt: 'USB ධාවකයක් පරිගණකයකට සම්බන්ධ කිරීමේදී Autorun හා Shortcut වෛරස් වලින් ආරක්ෂා වන්නේ කෙසේද?'
  },
  {
    title: '6 GB RAM හි Gemma 2 ධාවනය',
    prompt: 'මගේ පරිගණකයේ ඇත්තේ 6 GB RAM පමණි. Gemma 2 2B Instruct ආකෘතිය මන්දගාමී නොවී ධාවනය කරන්නේ කෙසේද?'
  },
  {
    title: 'ඉංග්‍රීසි-සිංහල පරිවර්තනය',
    prompt: 'පහත වාක්‍යය නිවැරදි සිංහලට පරිවර්තනය කරන්න: "NENAPIYUMA AI USB runs entirely offline without requiring any cloud server or API key."'
  }
];

const SINHALA_KNOWLEDGE_BASE: Record<string, string> = {
  default: `ආයුබෝවන්! මම නැනපියුම (NENAPIYUMA) නොබැඳි AI සහායකයා වේ. 

මම Google Gemma 3 (gemma3.gguf) ආකෘතිය මඟින් සවිබල ගැන්වී ඇති අතර, ඔබගේ USB ධාවකයෙන් සම්පූර්ණයෙන්ම නොබැඳිව (offline) ක්‍රියාත්මක වේ. 

ඔබට අවශ්‍ය ඕනෑම ලිපියක් ලිවීමට, ගැටළු නිරාකරණයට හෝ පරිගණක ආරක්ෂාව පිළිබඳ උපදෙස් ලබා ගැනීමට මගෙන් විමසන්න.`,
  leave_letter: `දිනය: 2026 ඔක්තෝබර් 10
ආයතන ප්‍රධානී මැතිතුමා / මැතිනිය වෙත,
[ආයතනයේ නම]
[ලිපිනය]

ගෞරවනීය සර් / මැඩම්,

**විෂය: අසනීප තත්ත්වය හේතුවෙන් දින 3 ක සනීපාරක්ෂක නිවාඩු ඉල්ලුම් කිරීම**

මම [ඔබගේ නම], ඔබ ආයතනයේ [ඔබගේ තනතුර] ලෙස සේවය කරමි.

හදිසියේ ඇති වූ උණ සහ රෝගී තත්ත්වයක් හේතුවෙන්, වෛද්‍ය උපදෙස් මත විවේක ගැනීමට අවශ්‍යව ඇති බැවින්, 2026 ඔක්තෝබර් 11 වන දින සිට 2026 ඔක්තෝබර් 13 වන දින දක්වා දින තුනක (03) නිවාඩුවක් අනුමත කර දෙන මෙන් කාරුණිකව ඉල්ලා සිටිමි.

මාගේ නොපැමිණීම හේතුවෙන් ආයතනයේ හදිසි කාර්යයන් අඩාල නොවීමට අදාළ වගකීම් [සගයෙකුගේ නම] වෙත පවරා ඇති බවත්, නැවත රාජකාරියට වාර්තා කරන දින වෛද්‍ය වාර්තාව ඉදිරිපත් කිරීමට කටයුතු කරන බවත් ගෞරවයෙන් දන්වමි.

ස්තූතියි,
මෙයට විශ්වාසී,
[අත්සන]
[ඔබගේ නම]
[දුරකථන අංකය]`,
  security_usb: `USB ධාවක ආරක්ෂා කර ගැනීමේ ප්‍රධාන උපදෙස්:

1. **AutoRun අක්‍රිය කරන්න (Disable AutoRun)**:
   - වෛරස් පැතිරෙන ප්‍රධාන ක්‍රමය වන්නේ USB එක දැමූ විගස ක්‍රියාත්මක වන \`autorun.inf\` ගොනුවයි. Windows Settings මඟින් AutoPlay අක්‍රිය කර තබන්න.

2. **ද්විත්ව විස්තාරණ (Double Extensions) පරීක්ෂා කරන්න**:
   - \`Photo.jpg.exe\` හෝ \`Invoice.pdf.exe\` ලෙස පෙනෙන ගොනු විවෘත නොකරන්න.

3. **Shortcut (.lnk) වෛරස් හඳුනාගැනීම**:
   - ඔබගේ ගොනු hidden වී ඒ වෙනුවට shortcut icon පමණක් දිස්වේ නම්, ඒවා මත click නොකර USB Guard මඟින් scan කරන්න.

4. **NENAPIYUMA USB Guard භාවිතය**:
   - ඕනෑම නොදන්නා USB ධාවකයක් පරිගණකයට දැමූ වහාම NENAPIYUMA හි USB Guard වෙත ගොස් Quick Scan ක්‍රියාත්මක කර තර්ජන Quarantine කරන්න.`,
  ram_performance: `6 GB RAM පරිගණකයක Gemma 2 2B ප්‍රශස්තව ධාවනය කිරීමේ උපක්‍රම:

1. **Q4_K_M Quantization**:
   - NENAPIYUMA විසින් Gemma 2 2B ආකෘතිය 4-bit (Q4) quantized GGUF ආකාරයෙන් ඇතුළත් කර ඇති බැවින්, එය මතකයේ ගන්නේ 1.6 GB RAM පමණි.

2. **සන්දර්භය 2048 ට සීමා කිරීම (Context Window 2048)**:
   - Context window එක 2048 tokens ලෙස සකසා ඇති බැවින් RAM එක 4.5 GB ඉක්මවා යාම සහ PC එක slow වීම වැළකේ.

3. **CPU Threads ගණන (Threads: 4)**:
   - ප්‍රොසෙසරයේ cores 4 ක් පමණක් භාවිතයට ගන්නා අතර අනෙකුත් cores Windows මෙහෙයුම් පද්ධතියේ සුමට ක්‍රියාකාරිත්වයට ඉතිරි කෙරේ.`
};

export const ChatPlayground: React.FC<ChatPlaygroundProps> = ({ ramUsageGb }) => {
  const [modelMode, setModelMode] = useState<'sinhala-pure' | 'gemma3-bilingual'>('sinhala-pure');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `ආයුබෝවන්! මම නැනපියුම (NENAPIYUMA) පිරිසිදු සිංහල AI ආකෘතිය වේ (models/nenapiyuma-sinhala.gguf).

මම දන්නේ සහ භාවිත කරන්නේ සිංහල භාෂාව පමණි. ඔබ කුමන භාෂාවකින් විමසුවද, මගේ සියලුම පිළිතුරු අනිවාර්යයෙන්ම පිරිසිදු, පැහැදිලි සිංහලෙන් පමණක් සැපයේ.

ඔබට අවශ්‍ය ඕනෑම ලිපියක් ලිවීමට, උපදෙස් ලබා ගැනීමට හෝ පරිගණක ආරක්ෂාව පිළිබඳව සිංහලෙන් විමසන්න.`,
      timestamp: 'දැන් (Now)',
      tokens: 92
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tokensPerSec, setTokensPerSec] = useState(32.4);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (userText: string = input) => {
    const text = userText.trim();
    if (!text || isGenerating) return;

    const userMessage: Message = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tokens: Math.ceil(text.length / 3)
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);
    abortRef.current = false;

    // Determine appropriate response based on modelMode
    let fullResponse = '';
    const lower = text.toLowerCase();

    // Check if input is non-Sinhala and in sinhala-pure mode
    const isPureSinhalaMode = modelMode === 'sinhala-pure';
    const isEnglishOnlyPrompt = /^[A-Za-z0-9\s.,?!'"-:;()]+$/.test(text);

    if (isPureSinhalaMode && isEnglishOnlyPrompt) {
      fullResponse = `[නැනපියුම පිරිසිදු සිංහල ආකෘතිය (nenapiyuma-sinhala.gguf)]:

ඔබ විමසූ කරුණ: "${text}"

මම දන්නේ සිංහල භාෂාව පමණි. ඔබගේ ඉංග්‍රීසි විමසීමට අදාළ සිංහල පිළිතුර මෙසේය:

මෙම ආකෘතිය සම්පූර්ණයෙන්ම සිංහල භාෂා දත්ත මඟින් පුහුණු කර ඇති අතර, ශ්‍රී ලාංකික පරිශීලකයින්ට පිරිසිදු සිංහල ව්‍යාකරණ භාවිතයෙන් තාක්ෂණික, අධ්‍යාපනික සහ දෛනික කටයුතු පහසුවෙන් කර ගැනීමට උපකාර කරයි. ඔබගේ ප්‍රශ්නය තවදුරටත් සිංහලෙන් විමසන්නේ නම් වඩාත් ගැඹුරු පැහැදිලි කිරීමක් ලබා දිය හැක.`;
    } else if (lower.includes('නිවාඩු') || lower.includes('ලිපිය') || lower.includes('letter')) {
      fullResponse = SINHALA_KNOWLEDGE_BASE.leave_letter;
    } else if (lower.includes('autorun') || lower.includes('වෛරස්') || lower.includes('ආරක්ෂා') || lower.includes('usb')) {
      fullResponse = SINHALA_KNOWLEDGE_BASE.security_usb;
    } else if (lower.includes('ram') || lower.includes('6 gb') || lower.includes('මන්දගාමී') || lower.includes('gemma')) {
      fullResponse = SINHALA_KNOWLEDGE_BASE.ram_performance;
    } else if (lower.includes('පරිවර්තනය') || lower.includes('translate')) {
      fullResponse = `"නැනපියුම AI USB මෘදුකාංගය කිසිදු ක්ලවුඩ් සර්වරයක් හෝ API Key එකක් අවශ්‍ය නොවී සම්පූර්ණයෙන්ම නොබැඳිව ක්‍රියාත්මක වන පිරිසිදු සිංහල AI පද්ධතියකි."

(මෙම පිළිතුර නැනපියුම සිංහල-පමණක් ආකෘතිය මඟින් සකස් කරන ලදී)`;
    } else {
      fullResponse = `ඔබගේ විමසීම: "${text}"

${isPureSinhalaMode ? 'නැනපියුම පිරිසිදු සිංහල ආකෘතිය (nenapiyuma-sinhala.gguf)' : 'Gemma 3 Instruct (gemma3.gguf)'} මඟින් සකසන ලද පිළිතුර:

ශ්‍රී ලංකාවේ තාක්ෂණික සහ අධ්‍යාපනික කටයුතු සඳහා නැනපියුම AI සහායකයා ඔබට නිරවුල්ව තොරතුරු සපයයි. ඔබගේ ප්‍රශ්නයට අදාළ කරුණු පහත පරිදි වේ:

• මෙම ආකෘතිය පිරිසිදු සිංහල භාෂා නීතිරීති සහ ශබ්දකෝෂ අනුගමනය කරමින් පිළිතුරු නිර්මාණය කරයි.
• නොබැඳි ක්‍රියාකාරිත්වය හේතුවෙන් දත්ත ගාස්තු හෝ අන්තර්ජාලය අවශ්‍ය නොවේ.
• 6 GB RAM සහිත සාමාන්‍ය ලැප්ටොප් පරිගණකයක වුවද තත්පරයකට ටෝකන 30 කට අධික වේගයකින් ප්‍රතිචාර ජනනය වේ.
• සියලු දත්ත ඔබගේ USB ධාවකයේ සුරක්ෂිතව පවතී.`;
    }

    // Stream tokens
    const modelMessageId = String(Date.now() + 1);
    const initialModelMessage: Message = {
      id: modelMessageId,
      role: 'model',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tokens: 0
    };

    setMessages((prev) => [...prev, initialModelMessage]);

    const words = fullResponse.split(' ');
    let currentContent = '';

    for (let i = 0; i < words.length; i++) {
      if (abortRef.current) break;
      currentContent += (i > 0 ? ' ' : '') + words[i];
      const count = i + 1;
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === modelMessageId
            ? { ...msg, content: currentContent, tokens: count }
            : msg
        )
      );

      // Simulation delay matching ~25 tokens/sec
      await new Promise((r) => setTimeout(r, 38));
    }

    setIsGenerating(false);
  };

  const handleStop = () => {
    abortRef.current = true;
    setIsGenerating(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    if (confirm('වත්මන් සංවාදය සම්පූර්ණයෙන්ම මැකීමට ඔබට විශ්වාසද?')) {
      setMessages([
        {
          id: 'welcome',
          role: 'model',
          content: SINHALA_KNOWLEDGE_BASE.default,
          timestamp: 'දැන් (Now)',
          tokens: 78
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] max-w-6xl mx-auto p-4 md:p-6 gap-4">
      {/* Top Telemetry & Model Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setModelMode('sinhala-pure')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                modelMode === 'sinhala-pure'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🇱🇰 නැනපියුම Sinhala-Pure (සිංහල පමණක්)
            </button>
            <button
              onClick={() => setModelMode('gemma3-bilingual')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                modelMode === 'gemma3-bilingual'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gemma 3 (ද්විභාෂා)
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-2" />
            <span className="text-slate-300 font-mono-code text-[11px]">
              {modelMode === 'sinhala-pure' ? 'models/nenapiyuma-sinhala.gguf' : 'models/gemma3.gguf'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-code text-slate-400">
          <div>
            <span className="text-slate-400">වේගය (Speed): </span>
            <span className="text-amber-400">32.4 t/s</span>
          </div>
          <div>
            <span className="text-slate-400">RAM: </span>
            <span className="text-sky-400">{ramUsageGb.toFixed(1)} GB / 6.0 GB</span>
          </div>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors ml-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>මකන්න (Clear)</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-2 mb-1 text-xs text-slate-400 font-sinhala">
              <span className={msg.role === 'user' ? 'text-sky-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {msg.role === 'user' ? 'ඔබ (You)' : 'නැනපියුම (NENAPIYUMA)'}
              </span>
              <span>·</span>
              <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
              {msg.tokens ? <span className="font-mono-code text-[11px] text-slate-400">({msg.tokens} tokens)</span> : null}
            </div>

            <div
              className={`max-w-[88%] md:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap font-sinhala ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none shadow-md'
              }`}
            >
              {msg.content}
            </div>

            {msg.role === 'model' && (
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                >
                  {copiedId === msg.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">පිටපත් විය (Copied)</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="text-[11px]">පිටපත් කරන්න (Copy)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Preset Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ඉක්මන් විමසුම්:
        </span>
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            disabled={isGenerating}
            onClick={() => handleSend(p.prompt)}
            className="text-xs font-sinhala px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition-all disabled:opacity-50"
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Input Box & Send / Stop Button */}
      <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-2 focus-within:border-amber-500/60 transition-colors">
        <textarea
          rows={1}
          value={input}
          disabled={isGenerating}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="ඔබට අවශ්‍ය ඕනෑම දෙයක් සිංහලෙන් හෝ ඉංග්‍රීසියෙන් මෙහි ටයිප් කරන්න (Enter ඔබන්න)..."
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-400 px-3 py-2 outline-none resize-none font-sinhala"
        />

        {isGenerating ? (
          <button
            onClick={handleStop}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors shrink-0"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>නවත්වන්න (Stop)</span>
          </button>
        ) : (
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-400 text-slate-950 font-semibold text-xs transition-all shrink-0 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>යවන්න (Send)</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>නැනපියුම AI USB · සම්පූර්ණයෙන්ම ඔබගේ පරිගණකයේ RAM සහ CPU මත ධාවනය වේ. කිසිදු Cloud API හෝ දත්ත සම්ප්‍රේෂණයක් නැත.</span>
        <span className="font-mono-code text-slate-400">Context: 2048 Max</span>
      </div>
    </div>
  );
};
