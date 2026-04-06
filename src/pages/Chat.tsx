import { useRef, useState, useEffect, useCallback } from "react";
import {
  IconPaperclip, IconSend, IconX, IconSettings,
  IconRobot, IconUser, IconLoader2, IconCheck,
  IconAlertCircle, IconChevronDown, IconLink,
  IconFileTypePdf, IconTrash, IconEye, IconEyeOff,
  IconSparkles, IconAlertTriangle,
} from "@tabler/icons-react";
import { Container } from "../components/Container";
import { useUser, useAuth } from "@clerk/react";
import ReactMarkdown from "react-markdown";

// ─── Config ───────────────────────────────────────────────────────────────────
const FLASK_BASE = import.meta.env.VITE_FLASK_URL ?? "http://localhost:5000";
const IS_DEV     = import.meta.env.DEV;

// ─── Types ────────────────────────────────────────────────────────────────────
type LLMProvider = "groq" | "ollama";
type Source       = { title: string; url: string };

type PdfDoc = {
  id:               number;
  filename:         string;
  originalFilename: string;
  active:           boolean;
  uploadedAt:       string;
  chunkCount:       number;
};

type ChatMessage = {
  id:          number;
  sender:      "user" | "bot" | "system";
  text:        string;
  sources?:    Source[];
  chunksUsed?: number;
  isStreaming?: boolean;
  error?:       boolean;
};

type UploadState = "idle" | "uploading" | "success" | "error";

type Toast = {
  id:      number;
  type:    "success" | "error" | "info";
  message: string;
};

// ─── Model lists ──────────────────────────────────────────────────────────────
const GROQ_MODELS = [
  { value: "llama-3.3-70b-versatile",                    label: "LLaMA 3.3 70B" },
  { value: "llama-3.1-8b-instant",                       label: "LLaMA 3.1 8B (Fast)" },
  { value: "meta-llama/llama-4-scout-17b-16e-instruct",  label: "LLaMA 4 Scout 17B" },
  { value: "mixtral-8x7b-32768",                         label: "Mixtral 8x7B" },
  { value: "gemma2-9b-it",                               label: "Gemma 2 9B" },
];
const OLLAMA_MODELS = [
  { value: "llama3",   label: "LLaMA 3"  },
  { value: "mistral",  label: "Mistral"  },
  { value: "phi3",     label: "Phi-3"    },
  { value: "gemma2",   label: "Gemma 2"  },
  { value: "qwen2",    label: "Qwen 2"   },
];

// ─── Auth helper ──────────────────────────────────────────────────────────────
async function buildHeaders(
  getToken: () => Promise<string | null>,
  clerkUserId: string,
  json = false,
): Promise<Record<string, string>> {
  const base: Record<string, string> = json ? { "Content-Type": "application/json" } : {};
  if (IS_DEV) return { ...base, "X-Clerk-User-Id": clerkUserId };
  const token = await getToken();
  return token ? { ...base, Authorization: `Bearer ${token}` } : base;
}

// ─── Toast system ─────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
            animate-in slide-in-from-right duration-300
            ${t.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
            : t.type === "error"   ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            : "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"}`}>
          <div className="flex-shrink-0 mt-0.5">
            {t.type === "success" ? <IconCheck size={15} />
              : t.type === "error" ? <IconAlertTriangle size={15} />
              : <IconAlertCircle size={15} />}
          </div>
          <p className="flex-1 leading-snug">{t.message}</p>
          <button onClick={() => onDismiss(t.id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
            <IconX size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((type: Toast["type"], message: string, duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    if (duration > 0) setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);
  const dismiss = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  return { toasts, toast: add, dismiss };
}

// ─── TypingDots ───────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}

// ─── SourceChips ──────────────────────────────────────────────────────────────
function SourceChips({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {sources.map((s, i) => (
        <a key={i} href={s.url} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full
            bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400
            border border-violet-200 dark:border-violet-800 hover:bg-violet-100 transition-colors">
          <IconLink size={10} />{s.title || s.url}
        </a>
      ))}
    </div>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────
function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser   = msg.sender === "user";
  const isSystem = msg.sender === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <span className="text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-900 px-3 py-1 rounded-full">
          {msg.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm
        ${isUser ? "bg-gradient-to-br from-violet-500 to-indigo-600" : "bg-gradient-to-br from-emerald-500 to-teal-600"}`}>
        {isUser ? <IconUser size={16} /> : <IconRobot size={16} />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
        ${isUser
          ? "bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-tr-sm"
          : msg.error
            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-tl-sm"
            : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-neutral-800 rounded-tl-sm"
        }`}>
        {msg.isStreaming && !msg.text
          ? <TypingDots />
          : isUser
            ? <p className="whitespace-pre-wrap">{msg.text}</p>
            : (
              <>
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-li:my-0.5 prose-headings:mb-2 prose-code:text-violet-600 dark:prose-code:text-violet-400">
                  <ReactMarkdown>{msg.text || " "}</ReactMarkdown>
                  {msg.isStreaming && <TypingDots />}
                </div>
                {msg.sources && <SourceChips sources={msg.sources} />}
                {msg.chunksUsed !== undefined && msg.chunksUsed > 0 && (
                  <p className="mt-1.5 text-[11px] text-neutral-400 dark:text-neutral-500">
                    <IconSparkles size={10} className="inline mr-1" />
                    {msg.chunksUsed} document chunk{msg.chunksUsed !== 1 ? "s" : ""} used
                  </p>
                )}
              </>
            )
        }
      </div>
    </div>
  );
}

// ─── PDF Library Panel ────────────────────────────────────────────────────────
function PdfLibrary({ pdfs, loading, onToggle, onDelete }: {
  pdfs: PdfDoc[]; loading: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  if (loading) return (
    <div className="flex items-center gap-2 text-xs text-neutral-400 px-1">
      <IconLoader2 size={12} className="animate-spin" /> Loading PDFs…
    </div>
  );
  if (!pdfs.length) return (
    <p className="text-xs text-neutral-400 px-1">No PDFs yet — use the paperclip to upload one.</p>
  );
  const active = pdfs.filter((p) => p.active).length;
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 px-1 mb-2">
        {active} of {pdfs.length} PDF{pdfs.length !== 1 ? "s" : ""} active for RAG
      </p>
      {pdfs.map((pdf) => (
        <div key={pdf.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all
            ${pdf.active
              ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800"
              : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 opacity-60"}`}>
          <IconFileTypePdf size={14} className={pdf.active ? "text-violet-500" : "text-neutral-400"} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate">{pdf.originalFilename}</p>
            <p className="text-[10px] text-neutral-400">{pdf.chunkCount} chunks</p>
          </div>
          <button onClick={() => onToggle(pdf.id)} title={pdf.active ? "Deactivate" : "Activate"}
            className="p-1 rounded-lg text-neutral-400 hover:text-violet-600 transition-colors">
            {pdf.active ? <IconEye size={13} /> : <IconEyeOff size={13} />}
          </button>
          <button onClick={() => onDelete(pdf.id)} title="Delete PDF"
            className="p-1 rounded-lg text-neutral-400 hover:text-red-500 transition-colors">
            <IconTrash size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({
  provider, setProvider, groqKey, setGroqKey, groqModel, setGroqModel,
  ollamaUrl, setOllamaUrl, ollamaModel, setOllamaModel, onClose, onSave,
}: {
  provider: LLMProvider;   setProvider: (p: LLMProvider) => void;
  groqKey: string;         setGroqKey: (k: string) => void;
  groqModel: string;       setGroqModel: (m: string) => void;
  ollamaUrl: string;       setOllamaUrl: (u: string) => void;
  ollamaModel: string;     setOllamaModel: (m: string) => void;
  onClose: () => void; onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <IconSettings size={18} className="text-violet-500" />
            <h2 className="font-semibold text-neutral-900 dark:text-white">LLM Configuration</h2>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"><IconX size={18} /></button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Provider</label>
            <div className="grid grid-cols-2 gap-2">
              {(["groq", "ollama"] as LLMProvider[]).map((p) => (
                <button key={p} onClick={() => setProvider(p)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border
                    ${provider === p ? "bg-violet-600 border-violet-600 text-white" : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-violet-400"}`}>
                  {p === "groq" ? "☁️ Groq Cloud" : "🖥️ Ollama (Local)"}
                </button>
              ))}
            </div>
          </div>
          {provider === "groq" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">Groq API Key</label>
                <input type="password" value={groqKey} onChange={(e) => setGroqKey(e.target.value)} placeholder="gsk_..."
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white outline-none focus:border-violet-500 placeholder:text-neutral-400" />
                <p className="text-xs text-neutral-400 mt-1">Get your key at <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-violet-500 hover:underline">console.groq.com</a></p>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">Model</label>
                <div className="relative">
                  <select value={groqModel} onChange={(e) => setGroqModel(e.target.value)}
                    className="w-full appearance-none bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white outline-none focus:border-violet-500 pr-8">
                    {GROQ_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
          {provider === "ollama" && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  📋 Run <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">ollama serve</code> then <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">ollama pull llama3</code>
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">Ollama Base URL</label>
                <input type="text" value={ollamaUrl} onChange={(e) => setOllamaUrl(e.target.value)} placeholder="http://localhost:11434"
                  className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white outline-none focus:border-violet-500 placeholder:text-neutral-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">Model</label>
                <div className="relative">
                  <select value={ollamaModel} onChange={(e) => setOllamaModel(e.target.value)}
                    className="w-full appearance-none bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-900 dark:text-white outline-none focus:border-violet-500 pr-8">
                    {OLLAMA_MODELS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                  <IconChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="px-5 py-4 border-t border-neutral-200 dark:border-neutral-800 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">Cancel</button>
          <button onClick={onSave} className="px-5 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-colors">Save & Connect</button>
        </div>
      </div>
    </div>
  );
}

// ─── API Key Gate ─────────────────────────────────────────────────────────────
function ApiKeyGate({ firstName, onConfigure }: { firstName: string; onConfigure: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 text-center px-4 py-16">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl">
        <IconRobot size={32} className="text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Hey {firstName}! 👋 Welcome to RAG Chat</h2>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
          Connect to Groq Cloud or Ollama, then upload PDFs to chat with your documents using semantic search.
        </p>
      </div>
      <button onClick={onConfigure}
        className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-all hover:scale-105">
        <IconSettings size={18} />Configure LLM Provider
      </button>
    </div>
  );
}

// ─── Main Chat Component ──────────────────────────────────────────────────────
export const Chat = () => {
  const { user }     = useUser();
  const { getToken } = useAuth();
  const firstName    = user?.firstName ?? "there";
  const clerkUserId  = user?.id ?? "";

  const { toasts, toast, dismiss } = useToast();

  // ── LLM config ───────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [provider,     setProvider]     = useState<LLMProvider>(
    () => (localStorage.getItem("rag_provider") as LLMProvider) ?? "groq"
  );
  const [groqKey,     setGroqKey]     = useState(() => localStorage.getItem("rag_groq_key")     ?? "");
  const [groqModel,   setGroqModel]   = useState(() => localStorage.getItem("rag_groq_model")   ?? GROQ_MODELS[0].value);
  const [ollamaUrl,   setOllamaUrl]   = useState(() => localStorage.getItem("rag_ollama_url")   ?? "http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem("rag_ollama_model") ?? OLLAMA_MODELS[0].value);
  const isConfigured = provider === "ollama" || !!groqKey;

  // ── Chat state ────────────────────────────────────────────────────────────
  const [messages,  setMessages]  = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Keep ref to current abort controller so we can cancel mid-stream
  const abortRef = useRef<AbortController | null>(null);

  // ── Input ─────────────────────────────────────────────────────────────────
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── PDF library ───────────────────────────────────────────────────────────
  const fileInputRef   = useRef<HTMLInputElement>(null);
  const [pdfs,         setPdfs]         = useState<PdfDoc[]>([]);
  const [pdfsLoading,  setPdfsLoading]  = useState(false);
  const [uploadState,  setUploadState]  = useState<UploadState>("idle");
  const [showPdfPanel, setShowPdfPanel] = useState(false);

  // ── Scroll / resize ───────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputValue]);

  // ── Fetch PDF list ────────────────────────────────────────────────────────
  const fetchPdfs = useCallback(async () => {
    if (!clerkUserId || !isConfigured) return;
    setPdfsLoading(true);
    try {
      const headers = await buildHeaders(getToken, clerkUserId);
      const res = await fetch(`${FLASK_BASE}/pdfs`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.pdfs) setPdfs(data.pdfs);
    } catch (err) {
      toast("error", `Failed to load PDFs: ${err instanceof Error ? err.message : "Network error"}`);
    } finally {
      setPdfsLoading(false);
    }
  }, [clerkUserId, isConfigured, getToken, toast]);

  useEffect(() => { fetchPdfs(); }, [fetchPdfs]);

  // ── Save settings ─────────────────────────────────────────────────────────
  const handleSaveSettings = () => {
    localStorage.setItem("rag_provider",     provider);
    localStorage.setItem("rag_groq_key",     groqKey);
    localStorage.setItem("rag_groq_model",   groqModel);
    localStorage.setItem("rag_ollama_url",   ollamaUrl);
    localStorage.setItem("rag_ollama_model", ollamaModel);
    setShowSettings(false);
    const modelLabel = provider === "groq"
      ? GROQ_MODELS.find((m) => m.value === groqModel)?.label ?? groqModel
      : ollamaModel;
    toast("success", `Connected to ${provider === "groq" ? "Groq" : "Ollama"} using ${modelLabel}`);
    setMessages([{
      id: Date.now(), sender: "bot",
      text: provider === "groq"
        ? `✅ Connected to **Groq** using **${modelLabel}**.\n\nYou can:\n- 💬 **Ask me anything** — I'll answer from general knowledge\n- 📎 **Upload a PDF** — I'll search it semantically for precise answers\n\nWhat would you like to know?`
        : `✅ Connected to **Ollama** using **${modelLabel}**.\n\n🔒 Running locally — your data stays on your machine.\n\nYou can:\n- 💬 **Ask me anything** — I'll answer from general knowledge\n- 📎 **Upload a PDF** — I'll search it semantically for precise answers`,
    }]);
    fetchPdfs();
  };

  // ── PDF upload ────────────────────────────────────────────────────────────
  const uploadPDF = async (file: File) => {
    if (!clerkUserId) return;
    setUploadState("uploading");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const headers = await buildHeaders(getToken, clerkUserId);
      const res = await fetch(`${FLASK_BASE}/upload`, { method: "POST", headers, body: formData });
      const data = await res.json();
      if (res.ok && data.pdf) {
        setUploadState("success");
        setPdfs((prev) => [data.pdf, ...prev]);
        setShowPdfPanel(true);
        toast("success", `"${data.pdf.originalFilename}" indexed — ${data.pdf.chunks} chunks ready`);
        setMessages((prev) => [...prev, {
          id: Date.now(), sender: "system",
          text: `📄 "${data.pdf.originalFilename}" indexed — ${data.pdf.chunks} chunks ready for semantic search`,
        }]);
      } else {
        setUploadState("error");
        toast("error", data.message ?? "Upload failed");
      }
    } catch {
      setUploadState("error");
      toast("error", "Upload failed — is Flask running on port 5000?");
    }
    setTimeout(() => setUploadState("idle"), 3000);
  };

  // ── Toggle PDF ────────────────────────────────────────────────────────────
  const handleTogglePdf = async (pdfId: number) => {
    try {
      const headers = await buildHeaders(getToken, clerkUserId, true);
      const res = await fetch(`${FLASK_BASE}/pdfs/${pdfId}/toggle`, { method: "PATCH", headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPdfs((prev) => prev.map((p) => p.id === pdfId ? { ...p, active: data.active } : p));
      toast("info", data.active ? "PDF activated for RAG" : "PDF deactivated");
    } catch (err) {
      toast("error", `Toggle failed: ${err instanceof Error ? err.message : "Network error"}`);
    }
  };

  // ── Delete PDF ────────────────────────────────────────────────────────────
  const handleDeletePdf = async (pdfId: number) => {
    const pdf = pdfs.find((p) => p.id === pdfId);
    try {
      const headers = await buildHeaders(getToken, clerkUserId);
      const res = await fetch(`${FLASK_BASE}/pdfs/${pdfId}`, { method: "DELETE", headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPdfs((prev) => prev.filter((p) => p.id !== pdfId));
      toast("success", `"${pdf?.originalFilename ?? "PDF"}" deleted`);
    } catch (err) {
      toast("error", `Delete failed: ${err instanceof Error ? err.message : "Network error"}`);
    }
  };

  // ── Send message via SSE stream ───────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const message = inputValue.trim();
    if (!message || isLoading || !clerkUserId) return;

    setInputValue("");
    setIsLoading(true);

    const userMsg: ChatMessage     = { id: Date.now(), sender: "user", text: message };
    const botId                    = Date.now() + 1;
    const placeholder: ChatMessage = { id: botId, sender: "bot", text: "", isStreaming: true };
    setMessages((prev) => [...prev, userMsg, placeholder]);

    const history = messages
      .filter((m) => m.sender !== "system" && !m.isStreaming)
      .slice(-10)
      .map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));

    const activePdfIds = pdfs.filter((p) => p.active).map((p) => p.id);

    // Cancel any previous in-flight stream
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const headers = await buildHeaders(getToken, clerkUserId, true);
      const res = await fetch(`${FLASK_BASE}/api/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          message, provider,
          groqApiKey: groqKey, groqModel,
          ollamaUrl, ollamaModel,
          pdfIds: activePdfIds,
          history,
        }),
        signal: controller.signal,
      });

      // Non-streaming error (e.g. 429, 401)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const errMsg = data.message ?? `HTTP ${res.status}`;
        toast("error", errMsg);
        setMessages((prev) => prev.map((m) =>
          m.id === botId ? { ...m, text: `⚠️ ${errMsg}`, isStreaming: false, error: true } : m
        ));
        return;
      }

      // Read SSE stream
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";
      let   sources: Source[] = [];
      let   chunksUsed = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";  // keep incomplete last line

        for (const line of lines) {
          if (line.startsWith("event: ")) continue;  // event name line
          if (!line.startsWith("data: "))  continue;  // skip non-data lines

          const payload = line.slice(6).trim();
          if (!payload) continue;

          try {
            const evt = JSON.parse(payload);

            if ("chunksUsed" in evt) {
              // meta event
              sources    = evt.sources   ?? [];
              chunksUsed = evt.chunksUsed ?? 0;
              // Inject sources early so user sees them while streaming
              setMessages((prev) => prev.map((m) =>
                m.id === botId ? { ...m, sources, chunksUsed } : m
              ));
            } else if ("text" in evt) {
              // token event — append to bubble
              setMessages((prev) => prev.map((m) =>
                m.id === botId ? { ...m, text: m.text + evt.text } : m
              ));
            } else if ("reply" in evt) {
              // done event — mark complete
              setMessages((prev) => prev.map((m) =>
                m.id === botId ? { ...m, isStreaming: false, sources, chunksUsed } : m
              ));
            } else if ("message" in evt) {
              // error event
              toast("error", evt.message);
              setMessages((prev) => prev.map((m) =>
                m.id === botId ? { ...m, text: `⚠️ ${evt.message}`, isStreaming: false, error: true } : m
              ));
            }
          } catch {
            // malformed JSON — skip
          }
        }
      }

      // Ensure streaming flag cleared if done event was missed
      setMessages((prev) => prev.map((m) =>
        m.id === botId && m.isStreaming ? { ...m, isStreaming: false } : m
      ));

    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const errMsg = "Network error — is Flask running on port 5000?";
      toast("error", errMsg);
      setMessages((prev) => prev.map((m) =>
        m.id === botId ? { ...m, text: `⚠️ ${errMsg}`, isStreaming: false, error: true } : m
      ));
    } finally {
      setIsLoading(false);
    }
  }, [
    inputValue, isLoading, clerkUserId, messages, pdfs,
    provider, groqKey, groqModel, ollamaUrl, ollamaModel,
    getToken, toast,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const providerLabel = provider === "groq"
    ? `Groq · ${GROQ_MODELS.find((m) => m.value === groqModel)?.label ?? groqModel}`
    : `Ollama · ${ollamaModel}`;

  const activePdfs = pdfs.filter((p) => p.active);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-black/99">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {showSettings && (
        <SettingsPanel
          provider={provider}       setProvider={setProvider}
          groqKey={groqKey}         setGroqKey={setGroqKey}
          groqModel={groqModel}     setGroqModel={setGroqModel}
          ollamaUrl={ollamaUrl}     setOllamaUrl={setOllamaUrl}
          ollamaModel={ollamaModel} setOllamaModel={setOllamaModel}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveSettings}
        />
      )}

      <Container>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-50/80 dark:bg-black/80 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-800/50 -mx-4 px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-white">
              Hi, {firstName}! <span className="text-violet-500">RAG Chat</span>
            </h1>
            {isConfigured && (
              <p className="text-xs text-neutral-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {providerLabel}
                {activePdfs.length > 0 && (
                  <span className="ml-1 text-violet-500">
                    · {activePdfs.length} PDF{activePdfs.length !== 1 ? "s" : ""} active
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isConfigured && pdfs.length > 0 && (
              <button onClick={() => setShowPdfPanel((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border rounded-xl transition-colors
                  ${showPdfPanel
                    ? "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400"
                    : "text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900"}`}>
                <IconFileTypePdf size={14} />{pdfs.length} PDF{pdfs.length !== 1 ? "s" : ""}
              </button>
            )}
            <button onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
              <IconSettings size={14} />Settings
            </button>
          </div>
        </div>

        {/* PDF panel */}
        {showPdfPanel && isConfigured && (
          <div className="mt-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <IconFileTypePdf size={15} className="text-violet-500" />PDF Library
              </h3>
              <button onClick={() => setShowPdfPanel(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                <IconX size={14} />
              </button>
            </div>
            <PdfLibrary pdfs={pdfs} loading={pdfsLoading} onToggle={handleTogglePdf} onDelete={handleDeletePdf} />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 pb-36 pt-4">
          {!isConfigured ? (
            <ApiKeyGate firstName={firstName} onConfigure={() => setShowSettings(true)} />
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-3 px-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                <IconSparkles size={24} className="text-violet-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Ask me anything</p>
                <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                  I work as a general assistant by default. Upload a PDF with the 📎 button for precise, source-grounded answers.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        {isConfigured && (
          <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-4xl px-4 py-4">
            <div className="flex items-end gap-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl dark:shadow-neutral-900/50 p-3">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={activePdfs.length > 0
                  ? `Ask about ${activePdfs.length} active PDF${activePdfs.length !== 1 ? "s" : ""}… (Shift+Enter for new line)`
                  : "Ask me anything… or upload a PDF for document search (Shift+Enter for new line)"}
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none bg-transparent px-2 text-sm text-neutral-900 dark:text-white outline-none placeholder:text-neutral-400 min-h-[36px] max-h-40 leading-relaxed"
              />
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <input type="file" accept=".pdf" ref={fileInputRef} className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPDF(f); e.target.value = ""; }} />
                <button onClick={() => fileInputRef.current?.click()} disabled={uploadState === "uploading"} title="Upload PDF"
                  className={`p-2 rounded-xl border transition-all duration-200
                    ${uploadState === "uploading" ? "border-neutral-200 dark:border-neutral-800 text-neutral-300 cursor-not-allowed"
                      : uploadState === "success"  ? "border-emerald-300 dark:border-emerald-700 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : uploadState === "error"    ? "border-red-300 text-red-500"
                      : "border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-violet-600 hover:border-violet-300 dark:hover:border-violet-700"}`}>
                  {uploadState === "uploading" ? <IconLoader2 size={18} className="animate-spin" />
                    : uploadState === "success"  ? <IconCheck size={18} />
                    : uploadState === "error"    ? <IconAlertCircle size={18} />
                    : <IconPaperclip size={18} />}
                </button>
                <button onClick={sendMessage} disabled={!inputValue.trim() || isLoading}
                  className={`p-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center
                    ${inputValue.trim() && !isLoading
                      ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/40 hover:scale-105"
                      : "bg-neutral-100 dark:bg-neutral-900 text-neutral-300 dark:text-neutral-600 cursor-not-allowed"}`}>
                  {isLoading ? <IconLoader2 size={18} className="animate-spin" /> : <IconSend size={18} />}
                </button>
              </div>
            </div>
            <p className="text-center text-xs text-neutral-400 mt-2">
              {provider === "ollama"
                ? "🔒 Running locally — data stays on your machine"
                : activePdfs.length > 0
                  ? `Groq · Semantic RAG across ${activePdfs.length} PDF${activePdfs.length !== 1 ? "s" : ""}`
                  : "Groq · General assistant · Upload a PDF for document search"}
            </p>
          </div>
        )}
      </Container>
    </div>
  );
};
