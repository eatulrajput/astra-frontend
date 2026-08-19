import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconPaperclip, IconSend, IconX, IconSettings,
  IconRobot, IconUser, IconLoader2, IconCheck,
  IconAlertCircle, IconChevronDown, IconLink,
  IconFileTypePdf, IconTrash, IconEye, IconEyeOff,
  IconSparkles, IconAlertTriangle, IconRefresh, IconCopy,
  IconMessageCode, IconBulb, IconBook, IconBrain,
} from "@tabler/icons-react";
import { Container } from "../components/Container";
import { useUser, useAuth } from "@clerk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ─── Config ───────────────────────────────────────────────────────────────────
const FLASK_BASE = import.meta.env.VITE_FLASK_URL ?? "http://localhost:5000";

// ─── Types ────────────────────────────────────────────────────────────────────
type LLMProvider = "groq" | "ollama";
type Source = { title: string; url: string };

type PdfDoc = {
  id: number;
  filename: string;
  originalFilename: string;
  active: boolean;
  uploadedAt: string;
  chunkCount: number;
};

type ChatMessage = {
  id: number;
  sender: "user" | "bot" | "system";
  text: string;
  sources?: Source[];
  chunksUsed?: number;
  isStreaming?: boolean;
  error?: boolean;
};

type UploadState = "idle" | "uploading" | "success" | "error";

type Toast = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

type ModelOption = {
  value: string;
  label: string;
};

// ─── Model lists ──────────────────────────────────────────────────────────────
const DEFAULT_GROQ_MODELS: ModelOption[] = [
  { value: "llama-3.3-70b-versatile", label: "LLaMA 3.3 70B (Versatile)" },
  { value: "llama-3.1-8b-instant", label: "LLaMA 3.1 8B (Fast)" },
  { value: "deepseek-r1-distill-llama-70b", label: "DeepSeek R1 Distill 70B" },
  { value: "llama3-70b-8192", label: "LLaMA 3 70B" },
  { value: "llama3-8b-8192", label: "LLaMA 3 8B" },
  { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
  { value: "gemma2-9b-it", label: "Gemma 2 9B" },
];

const OLLAMA_MODELS: ModelOption[] = [
  { value: "llama3", label: "LLaMA 3" },
  { value: "mistral", label: "Mistral" },
  { value: "phi3", label: "Phi-3" },
  { value: "gemma2", label: "Gemma 2" },
  { value: "qwen2", label: "Qwen 2" },
];

// ─── Auth helper ──────────────────────────────────────────────────────────────
async function buildHeaders(
  getToken: () => Promise<string | null>,
  clerkUserId: string,
  json = false,
): Promise<Record<string, string>> {
  const headers: Record<string, string> = json ? { "Content-Type": "application/json" } : {};
  if (clerkUserId) {
    headers["X-Clerk-User-Id"] = clerkUserId;
  }
  try {
    const token = await getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch (e) {
    // Ignore token fetch error
  }
  return headers;
}

// ─── Toast system ─────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-xl ${
              t.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                : t.type === "error"
                ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
                : "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.type === "success" ? (
                <IconCheck size={15} />
              ) : t.type === "error" ? (
                <IconAlertTriangle size={15} />
              ) : (
                <IconAlertCircle size={15} />
              )}
            </div>
            <p className="flex-1 leading-snug">{t.message}</p>
            <button onClick={() => onDismiss(t.id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
              <IconX size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
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
    <span className="inline-flex gap-1 items-center px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
          className="w-1.5 h-1.5 rounded-full bg-emerald-500"
        />
      ))}
    </span>
  );
}

// ─── SourceChips ──────────────────────────────────────────────────────────────
function SourceChips({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {sources.map((s, i) => (
        <motion.a
          key={i}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-medium"
        >
          <IconLink size={11} />
          {s.title || s.url}
        </motion.a>
      ))}
    </div>
  );
}

// ─── CodeBlock Component ──────────────────────────────────────────────────────
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-3.5 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-950 text-neutral-100 overflow-hidden font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-900/90 border-b border-neutral-800 text-[11px] text-neutral-400">
        <span className="font-semibold text-emerald-400 uppercase tracking-wider">{language || "code"}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="hover:text-white transition-colors flex items-center gap-1.5 font-medium px-2 py-0.5 rounded-md bg-neutral-800/60"
        >
          {copied ? (
            <>
              <IconCheck size={12} className="text-emerald-400" /> <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            "Copy code"
          )}
        </motion.button>
      </div>
      <pre className="p-4 overflow-x-auto whitespace-pre leading-relaxed text-emerald-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── MessageBubble ────────────────────────────────────────────────────────────
function MessageBubble({
  msg,
  userQueryText,
  userName = "User",
}: {
  msg: ChatMessage;
  userQueryText?: string;
  userName?: string;
}) {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const isUser = msg.sender === "user";
  const isSystem = msg.sender === "system";

  const handleCopyMarkdown = () => {
    const formattedContent = userQueryText
      ? `### ${userName}'s Query\n${userQueryText}\n\n### Astra Response\n${msg.text}`
      : `### Astra Response\n${msg.text}`;

    navigator.clipboard.writeText(formattedContent);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-4"
      >
        <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">
          {msg.text}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex gap-4 ${isUser ? "flex-row-reverse mb-6 mt-8" : "flex-row mb-6"}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-md mt-0.5 transition-transform ${
          isUser
            ? "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 shadow-emerald-500/20"
            : "bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-teal-500/20"
        }`}
      >
        {isUser ? <IconUser size={18} /> : <IconRobot size={18} />}
      </div>

      {/* Bubble Content */}
      <div
        className={`max-w-[85%] rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-lg ${
          isUser
            ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-tr-md shadow-emerald-600/10"
            : msg.error
            ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 rounded-tl-md"
            : "bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl text-neutral-800 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-800/80 rounded-tl-md shadow-neutral-200/50 dark:shadow-none"
        }`}
      >
        {msg.isStreaming && !msg.text ? (
          <TypingDots />
        ) : isUser ? (
          <p className="whitespace-pre-wrap font-medium leading-relaxed">{msg.text}</p>
        ) : (
          <>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-sm sm:text-[14.5px] leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p({ children }: any) {
                    return <p className="mb-3.5 last:mb-0 leading-7 text-neutral-800 dark:text-neutral-200 tracking-wide">{children}</p>;
                  },
                  h1({ children }: any) {
                    return <h1 className="text-lg font-bold text-neutral-900 dark:text-white mt-5 mb-2.5 pb-1.5 border-b border-neutral-200 dark:border-neutral-800">{children}</h1>;
                  },
                  h2({ children }: any) {
                    return <h2 className="text-base font-bold text-neutral-900 dark:text-white mt-4 mb-2">{children}</h2>;
                  },
                  h3({ children }: any) {
                    return <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-4 mb-1.5 uppercase tracking-wider">{children}</h3>;
                  },
                  ul({ children }: any) {
                    return <ul className="my-3.5 pl-5 space-y-2 list-disc text-neutral-800 dark:text-neutral-200">{children}</ul>;
                  },
                  ol({ children }: any) {
                    return <ol className="my-3.5 pl-5 space-y-2 list-decimal text-neutral-800 dark:text-neutral-200">{children}</ol>;
                  },
                  li({ children }: any) {
                    return <li className="leading-6">{children}</li>;
                  },
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");
                    return !inline ? (
                      <CodeBlock language={match ? match[1] : ""} code={codeString} />
                    ) : (
                      <code className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md font-mono text-[13px] font-semibold" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }: any) {
                    return (
                      <div className="my-4 overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                        <table className="w-full text-left text-xs border-collapse">{children}</table>
                      </div>
                    );
                  },
                  thead({ children }: any) {
                    return <thead className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-900 dark:text-white font-semibold border-b border-neutral-200 dark:border-neutral-800">{children}</thead>;
                  },
                  th({ children }: any) {
                    return <th className="p-3 font-semibold">{children}</th>;
                  },
                  td({ children }: any) {
                    return <td className="p-3 border-t border-neutral-100 dark:border-neutral-800/40 leading-relaxed">{children}</td>;
                  },
                  blockquote({ children }: any) {
                    return <blockquote className="my-3 border-l-4 border-emerald-500 bg-emerald-500/10 px-4 py-2.5 rounded-r-xl italic text-neutral-700 dark:text-neutral-300 leading-relaxed">{children}</blockquote>;
                  },
                  hr() {
                    return <hr className="my-4 border-neutral-200 dark:border-neutral-800" />;
                  },
                }}
              >
                {msg.text || " "}
              </ReactMarkdown>
              {msg.isStreaming && <TypingDots />}
            </div>
            {msg.sources && <SourceChips sources={msg.sources} />}

            {!isUser && !msg.isStreaming && msg.text && (
              <div className="mt-4 pt-3 border-t border-neutral-200/60 dark:border-neutral-800/60 flex items-center justify-between gap-2 text-xs">
                {msg.chunksUsed !== undefined && msg.chunksUsed > 0 ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <IconSparkles size={11} />
                    {msg.chunksUsed} PDF chunk{msg.chunksUsed !== 1 ? "s" : ""} indexed
                  </span>
                ) : (
                  <span />
                )}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleCopyMarkdown}
                  title="Copy Question & Response in Markdown format"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-all font-semibold text-xs border border-neutral-200/50 dark:border-neutral-700/50 shadow-sm"
                >
                  {copiedMarkdown ? (
                    <>
                      <IconCheck size={13} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied QA Markdown</span>
                    </>
                  ) : (
                    <>
                      <IconCopy size={13} className="text-emerald-500" />
                      <span>Copy QA Markdown</span>
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── PDF Library Panel ────────────────────────────────────────────────────────
function PdfLibrary({
  pdfs,
  loading,
  onToggle,
  onDelete,
}: {
  pdfs: PdfDoc[];
  loading: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  if (loading)
    return (
      <div className="flex items-center gap-2 text-xs text-neutral-400 px-1 py-2">
        <IconLoader2 size={13} className="animate-spin text-emerald-500" /> Loading PDF Knowledge Base…
      </div>
    );
  if (!pdfs.length)
    return (
      <p className="text-xs text-neutral-400 px-1 py-2">
        No PDF documents active yet — click the paperclip button in the chat box to upload study notes.
      </p>
    );

  const activeCount = pdfs.filter((p) => p.active).length;
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-1 mb-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        {activeCount} of {pdfs.length} PDF{pdfs.length !== 1 ? "s" : ""} active for RAG Vector Search
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {pdfs.map((pdf) => (
          <motion.div
            key={pdf.id}
            whileHover={{ scale: 1.01 }}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all ${
              pdf.active
                ? "bg-emerald-500/10 border-emerald-500/30 text-neutral-900 dark:text-neutral-100"
                : "bg-neutral-100/80 dark:bg-neutral-900/80 border-neutral-200/80 dark:border-neutral-800/80 opacity-60"
            }`}
          >
            <IconFileTypePdf size={18} className={pdf.active ? "text-emerald-500" : "text-neutral-400"} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{pdf.originalFilename}</p>
              <p className="text-[10px] text-neutral-400">{pdf.chunkCount} vector chunks</p>
            </div>
            <button
              onClick={() => onToggle(pdf.id)}
              title={pdf.active ? "Deactivate" : "Activate"}
              className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-neutral-400 hover:text-emerald-500 transition-colors"
            >
              {pdf.active ? <IconEye size={14} /> : <IconEyeOff size={14} />}
            </button>
            <button
              onClick={() => onDelete(pdf.id)}
              title="Delete PDF"
              className="p-1.5 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-500 transition-colors"
            >
              <IconTrash size={14} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Modern Model Selector Pill ───────────────────────────────────────────────
function ModelSelectorPill({
  provider,
  setProvider,
  groqKey,
  groqModel,
  setGroqModel,
  ollamaModel,
  setOllamaModel,
  groqModelsList,
  setGroqModelsList,
  onToast,
  onOpenSettings,
}: {
  provider: LLMProvider;
  setProvider: (p: LLMProvider) => void;
  groqKey: string;
  groqModel: string;
  setGroqModel: (m: string) => void;
  ollamaModel: string;
  setOllamaModel: (m: string) => void;
  groqModelsList: ModelOption[];
  setGroqModelsList: (list: ModelOption[]) => void;
  onToast: (type: "success" | "error" | "info", msg: string) => void;
  onOpenSettings: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchApiModels = async () => {
    const cleanKey = groqKey.trim();
    if (!cleanKey) {
      onToast("info", "Please configure your Groq API Key first");
      onOpenSettings();
      return;
    }
    setIsFetchingApi(true);
    try {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${cleanKey}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const activeList: ModelOption[] = (data.data || [])
        .filter((item: any) => item.active !== false && item.id)
        .map((item: any) => ({ value: item.id, label: `${item.id}` }))
        .sort((a: ModelOption, b: ModelOption) => a.value.localeCompare(b.value));

      if (activeList.length) {
        setGroqModelsList(activeList);
        onToast("success", `Fetched ${activeList.length} Groq API models!`);
      }
    } catch (err) {
      onToast("error", `Failed to fetch API models: ${err instanceof Error ? err.message : "Error"}`);
    } finally {
      setIsFetchingApi(false);
    }
  };

  const activeModelValue = provider === "groq" ? groqModel : ollamaModel;
  const currentList = provider === "groq" ? (groqModelsList.length ? groqModelsList : DEFAULT_GROQ_MODELS) : OLLAMA_MODELS;
  const activeOption = currentList.find((m) => m.value === activeModelValue);
  const activeLabel = activeOption ? activeOption.label.split("(")[0].trim() : activeModelValue;

  return (
    <div className="relative flex-shrink-0" ref={dropdownRef}>
      {/* Resized compact pill for input bar */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpen((v) => !v)}
        type="button"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-100/90 dark:bg-neutral-800/90 hover:bg-neutral-200 dark:hover:bg-neutral-700/80 border border-neutral-200/80 dark:border-neutral-700/80 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all shadow-sm"
      >
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="truncate max-w-[85px] sm:max-w-[125px] font-mono text-[11px]">{activeLabel}</span>
        <IconChevronDown size={12} className={`text-neutral-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      {/* Floating Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            onWheel={(e) => e.stopPropagation()}
            className="absolute bottom-full mb-2.5 right-0 w-64 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl shadow-2xl p-2.5 z-50 pointer-events-auto"
          >
            {/* Header / Engine Switcher */}
            <div className="p-1 bg-neutral-100/80 dark:bg-neutral-800/80 rounded-2xl flex gap-1 mb-2">
              <button
                type="button"
                onClick={() => {
                  setProvider("groq");
                  localStorage.setItem("rag_provider", "groq");
                  onToast("info", "Switched to Groq Cloud");
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  provider === "groq"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                ☁️ Groq
              </button>
              <button
                type="button"
                onClick={() => {
                  setProvider("ollama");
                  localStorage.setItem("rag_provider", "ollama");
                  onToast("info", "Switched to Ollama Local");
                }}
                className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                  provider === "ollama"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                🖥️ Ollama
              </button>
            </div>

            {/* Fetch API models action row */}
            {provider === "groq" && (
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-neutral-200/60 dark:border-neutral-800/60">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Groq API Models ({currentList.length})
                </span>
                <button
                  type="button"
                  onClick={fetchApiModels}
                  disabled={isFetchingApi}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                  title="Fetch live models via Groq API"
                >
                  <IconRefresh size={11} className={isFetchingApi ? "animate-spin" : ""} />
                  Fetch API
                </button>
              </div>
            )}

            {/* Models List - Smooth Scrollable Container */}
            <div
              className="max-h-56 overflow-y-auto space-y-0.5 pr-1 pointer-events-auto overscroll-contain touch-auto"
              onWheel={(e) => e.stopPropagation()}
            >
              {currentList.map((m) => {
                const isSelected = m.value === activeModelValue;
                return (
                  <motion.button
                    key={m.value}
                    type="button"
                    whileHover={{ x: 2 }}
                    onClick={() => {
                      if (provider === "groq") {
                        setGroqModel(m.value);
                        localStorage.setItem("rag_groq_model", m.value);
                      } else {
                        setOllamaModel(m.value);
                        localStorage.setItem("rag_ollama_model", m.value);
                      }
                      onToast("success", `Active Model: ${m.label}`);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-mono transition-all ${
                      isSelected
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold"
                        : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    <span className="truncate pr-2">{m.label}</span>
                    {isSelected && <IconCheck size={14} className="text-emerald-500 flex-shrink-0" />}
                  </motion.button>
                );
              })}
            </div>

            <div className="pt-2 mt-1 border-t border-neutral-200/60 dark:border-neutral-800/60 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="text-[11px] font-semibold text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <IconSettings size={12} /> Configure API Keys & Endpoints
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Settings Panel ───────────────────────────────────────────────────────────
function SettingsPanel({
  provider, setProvider, groqKey, setGroqKey, groqModel, setGroqModel,
  groqModelsList, setGroqModelsList,
  ollamaUrl, setOllamaUrl, ollamaModel, setOllamaModel, onClose, onSave,
}: {
  provider: LLMProvider; setProvider: (p: LLMProvider) => void;
  groqKey: string; setGroqKey: (k: string) => void;
  groqModel: string; setGroqModel: (m: string) => void;
  groqModelsList: ModelOption[]; setGroqModelsList: (list: ModelOption[]) => void;
  ollamaUrl: string; setOllamaUrl: (u: string) => void;
  ollamaModel: string; setOllamaModel: (m: string) => void;
  onClose: () => void; onSave: () => void;
}) {
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<string | null>(null);

  const fetchLiveModels = useCallback(
    async (key: string) => {
      const cleanKey = key.trim();
      if (!cleanKey) {
        setFetchStatus("Please enter your Groq API Key");
        return;
      }

      setFetchingModels(true);
      setFetchStatus("Fetching active models from Groq API...");

      try {
        const res = await fetch("https://api.groq.com/openai/v1/models", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${cleanKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error(`Groq API returned HTTP ${res.status}`);

        const data = await res.json();
        const rawList = data.data || [];

        const activeList: ModelOption[] = rawList
          .filter((item: any) => item.active !== false && item.id)
          .map((item: any) => ({
            value: item.id,
            label: `${item.id} (${item.owned_by || "groq"})`,
          }))
          .sort((a: ModelOption, b: ModelOption) => a.value.localeCompare(b.value));

        if (activeList.length > 0) {
          setGroqModelsList(activeList);
          setFetchStatus(`Loaded ${activeList.length} active models!`);
          if (!activeList.some((m) => m.value === groqModel)) {
            setGroqModel(activeList[0].value);
          }
        }
      } catch (err: any) {
        setFetchStatus(`Note: ${err.message || "Using active model catalog"}`);
      } finally {
        setFetchingModels(false);
      }
    },
    [groqModel, setGroqModel],
  );

  useEffect(() => {
    if (provider === "groq" && groqKey.trim().startsWith("gsk_")) {
      fetchLiveModels(groqKey);
    }
  }, [provider, groqKey, fetchLiveModels]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 15 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/50">
          <div className="flex items-center gap-2">
            <IconSettings size={18} className="text-emerald-500" />
            <h2 className="font-bold text-neutral-900 dark:text-white">LLM Configuration</h2>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
          >
            <IconX size={18} />
          </motion.button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2.5 block">
              Execution Engine
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {(["groq", "ollama"] as LLMProvider[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`py-3 rounded-2xl text-xs font-bold transition-all duration-200 border shadow-sm ${
                    provider === p
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-emerald-400"
                  }`}
                >
                  {p === "groq" ? "☁️ Groq Cloud" : "🖥️ Ollama (Local)"}
                </button>
              ))}
            </div>
          </div>

          {provider === "groq" && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                    Groq API Key
                  </label>
                  <button
                    onClick={() => fetchLiveModels(groqKey)}
                    disabled={fetchingModels || !groqKey.trim()}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <IconRefresh size={12} className={fetchingModels ? "animate-spin" : ""} />
                    Fetch Models
                  </button>
                </div>
                <input
                  type="password"
                  value={groqKey}
                  onChange={(e) => setGroqKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                />
                <p className="text-xs text-neutral-400 mt-1">
                  Get your key at{" "}
                  <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-emerald-500 hover:underline font-semibold">
                    console.groq.com
                  </a>
                </p>
                {fetchStatus && (
                  <p className={`text-xs mt-1 font-semibold ${fetchStatus.includes("Error") ? "text-red-500" : "text-emerald-500"}`}>
                    {fetchStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {provider === "ollama" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                  📋 Ensure Ollama is running locally: <code className="bg-emerald-500/20 px-1.5 py-0.5 rounded font-mono">ollama serve</code>
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
                  Ollama Base Endpoint
                </label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="http://localhost:11434"
                  className="w-full bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/50 flex gap-2.5 justify-end">
          <button onClick={onClose} className="px-4 py-2.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-colors">
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onSave}
            className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            Save Engine Configuration
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── SaaS Hero / Empty State ──────────────────────────────────────────────────
function SaasHeroGate({
  firstName,
  isConfigured,
  onConfigure,
  onPromptClick,
}: {
  firstName: string;
  isConfigured: boolean;
  onConfigure: () => void;
  onPromptClick: (prompt: string) => void;
}) {
  const suggestions = [
    { icon: <IconBook size={18} className="text-emerald-500" />, title: "Summarize PDF Notes", desc: "Extract core topics & concepts" },
    { icon: <IconBrain size={18} className="text-teal-500" />, title: "Key Exam Concepts", desc: "List high-yield revision points" },
    { icon: <IconBulb size={18} className="text-amber-500" />, title: "Explain Step-by-Step", desc: "Break down complex formulas" },
    { icon: <IconMessageCode size={18} className="text-cyan-500" />, title: "Code & Architecture", desc: "Generate modular python/ts code" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-12 text-center gap-6 max-w-2xl mx-auto px-4"
    >
      <div className="relative">
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-30 blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 flex items-center justify-center shadow-xl text-white">
          <IconRobot size={32} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Welcome back, <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 bg-clip-text text-transparent">{firstName}</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed max-w-md mx-auto">
          Universal RAG Assistant powered by pgvector semantic retrieval and high-speed LLM inference.
        </p>
      </div>

      {!isConfigured ? (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onConfigure}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold text-xs rounded-2xl shadow-xl shadow-emerald-500/25 transition-all"
        >
          <IconSettings size={18} /> Configure LLM Engine
        </motion.button>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4">
          {suggestions.map((s, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onPromptClick(s.title)}
              className="flex items-start gap-3 p-4 rounded-2xl bg-white/80 dark:bg-neutral-900/80 border border-neutral-200/80 dark:border-neutral-800/80 shadow-md text-left transition-all hover:border-emerald-500/50"
            >
              <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">{s.icon}</div>
              <div>
                <p className="text-xs font-bold text-neutral-900 dark:text-white">{s.title}</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">{s.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Chat Component ──────────────────────────────────────────────────────
export const Chat = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const firstName = user?.firstName ?? "there";
  const clerkUserId = user?.id ?? "";

  const { toasts, toast, dismiss } = useToast();

  // ── LLM config ───────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<LLMProvider>(
    () => (localStorage.getItem("rag_provider") as LLMProvider) ?? "groq"
  );
  const [groqKey, setGroqKey] = useState(() => localStorage.getItem("rag_groq_key") ?? "");
  const [groqModel, setGroqModel] = useState(() => localStorage.getItem("rag_groq_model") ?? DEFAULT_GROQ_MODELS[0].value);
  const [groqModelsList, setGroqModelsList] = useState<ModelOption[]>(DEFAULT_GROQ_MODELS);
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem("rag_ollama_url") ?? "http://localhost:11434");
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem("rag_ollama_model") ?? OLLAMA_MODELS[0].value);
  const isConfigured = provider === "ollama" || !!groqKey;

  // ── Chat state ────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // ── Input ─────────────────────────────────────────────────────────────────
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── PDF library ───────────────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pdfs, setPdfs] = useState<PdfDoc[]>([]);
  const [pdfsLoading, setPdfsLoading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [showPdfPanel, setShowPdfPanel] = useState(false);

  // ── Scroll / resize ───────────────────────────────────────────────────────
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "nearest",
      });
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(true);
    }
  }, [messages.length, scrollToBottom]);

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

  useEffect(() => {
    fetchPdfs();
  }, [fetchPdfs]);

  // ── Save settings ─────────────────────────────────────────────────────────
  const handleSaveSettings = () => {
    localStorage.setItem("rag_provider", provider);
    localStorage.setItem("rag_groq_key", groqKey);
    localStorage.setItem("rag_groq_model", groqModel);
    localStorage.setItem("rag_ollama_url", ollamaUrl);
    localStorage.setItem("rag_ollama_model", ollamaModel);
    setShowSettings(false);
    const modelLabel = provider === "groq" ? groqModel : ollamaModel;
    toast("success", `Connected to ${provider === "groq" ? "Groq" : "Ollama"} using ${modelLabel}`);
    setMessages([
      {
        id: Date.now(),
        sender: "bot",
        text:
          provider === "groq"
            ? `✅ Connected to **Groq Cloud** using **${modelLabel}**.\n\nYou can:\n- 💬 **Ask me anything** — I'll answer from general knowledge\n- 📎 **Upload a PDF** — I'll search it semantically for precise answers\n\nWhat would you like to know?`
            : `✅ Connected to **Ollama** using **${modelLabel}**.\n\n🔒 Running locally — your data stays on your machine.`,
      },
    ]);
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
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            sender: "system",
            text: `📄 "${data.pdf.originalFilename}" indexed — ${data.pdf.chunks} vector chunks ready for semantic RAG search`,
          },
        ]);
      } else {
        setUploadState("error");
        toast("error", data.message ?? "Upload failed");
      }
    } catch {
      setUploadState("error");
      toast("error", "Upload failed — is backend running on port 5000?");
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
      setPdfs((prev) => prev.map((p) => (p.id === pdfId ? { ...p, active: data.active } : p)));
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
  const sendMessage = useCallback(
    async (textOverride?: string) => {
      const message = (textOverride || inputValue).trim();
      if (!message || isLoading || !clerkUserId) return;

      setInputValue("");
      setIsLoading(true);

      const userMsg: ChatMessage = { id: Date.now(), sender: "user", text: message };
      const botId = Date.now() + 1;
      const placeholder: ChatMessage = { id: botId, sender: "bot", text: "", isStreaming: true };
      setMessages((prev) => [...prev, userMsg, placeholder]);

      const history = messages
        .filter((m) => m.sender !== "system" && !m.isStreaming)
        .slice(-10)
        .map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));

      const activePdfIds = pdfs.filter((p) => p.active).map((p) => p.id);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const headers = await buildHeaders(getToken, clerkUserId, true);
        const res = await fetch(`${FLASK_BASE}/api/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message,
            provider,
            groqApiKey: groqKey,
            groqModel,
            ollamaUrl,
            ollamaModel,
            pdfIds: activePdfIds,
            history,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const errMsg = data.message ?? `HTTP ${res.status}`;
          toast("error", errMsg);
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, text: `⚠️ ${errMsg}`, isStreaming: false, error: true } : m)),
          );
          return;
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let sources: Source[] = [];
        let chunksUsed = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("event: ")) continue;
            if (!line.startsWith("data: ")) continue;

            const payload = line.slice(6).trim();
            if (!payload) continue;

            try {
              const evt = JSON.parse(payload);

              if ("chunksUsed" in evt) {
                sources = evt.sources ?? [];
                chunksUsed = evt.chunksUsed ?? 0;
                setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, sources, chunksUsed } : m)));
              } else if ("text" in evt) {
                setMessages((prev) => prev.map((m) => (m.id === botId ? { ...m, text: m.text + evt.text } : m)));
              } else if ("reply" in evt) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === botId ? { ...m, isStreaming: false, sources, chunksUsed } : m)),
                );
              } else if ("message" in evt) {
                toast("error", evt.message);
                setMessages((prev) =>
                  prev.map((m) => (m.id === botId ? { ...m, text: `⚠️ ${evt.message}`, isStreaming: false, error: true } : m)),
                );
              }
            } catch {
              // skip
            }
          }
        }

        setMessages((prev) => prev.map((m) => (m.id === botId && m.isStreaming ? { ...m, isStreaming: false } : m)));
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const errMsg = "Network error — is backend running on port 5000?";
        toast("error", errMsg);
        setMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, text: `⚠️ ${errMsg}`, isStreaming: false, error: true } : m)),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [inputValue, isLoading, clerkUserId, messages, pdfs, provider, groqKey, groqModel, ollamaUrl, ollamaModel, getToken, toast],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const providerLabel = provider === "groq" ? `Groq · ${groqModel}` : `Ollama · ${ollamaModel}`;
  const activePdfs = pdfs.filter((p) => p.active);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col relative overflow-hidden">
      {/* Radiant Glow Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            provider={provider}
            setProvider={setProvider}
            groqKey={groqKey}
            setGroqKey={setGroqKey}
            groqModel={groqModel}
            setGroqModel={setGroqModel}
            groqModelsList={groqModelsList}
            setGroqModelsList={setGroqModelsList}
            ollamaUrl={ollamaUrl}
            setOllamaUrl={setOllamaUrl}
            ollamaModel={ollamaModel}
            setOllamaModel={setOllamaModel}
            onClose={() => setShowSettings(false)}
            onSave={handleSaveSettings}
          />
        )}
      </AnimatePresence>

      <Container>


        {/* PDF Panel */}
        <AnimatePresence>
          {showPdfPanel && isConfigured && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800/80 rounded-3xl p-5 shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <IconFileTypePdf size={16} className="text-emerald-500" /> PDF Resource Library
                </h3>
                <button onClick={() => setShowPdfPanel(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                  <IconX size={15} />
                </button>
              </div>
              <PdfLibrary pdfs={pdfs} loading={pdfsLoading} onToggle={handleTogglePdf} onDelete={handleDeletePdf} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 pb-40 pt-6">
          {messages.length === 0 ? (
            <SaasHeroGate
              firstName={firstName}
              isConfigured={isConfigured}
              onConfigure={() => setShowSettings(true)}
              onPromptClick={(prompt) => sendMessage(prompt)}
            />
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => {
                const prevMsg = index > 0 ? messages[index - 1] : null;
                const userQueryText = msg.sender === "bot" && prevMsg?.sender === "user" ? prevMsg.text : undefined;
                return (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    userQueryText={userQueryText}
                    userName={user?.fullName || firstName}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        {isConfigured && (
          <div className="fixed bottom-0 left-0 right-0 z-40 pb-5 pt-3 bg-gradient-to-t from-neutral-50 via-neutral-50/95 to-transparent dark:from-neutral-950 dark:via-neutral-950/95">
            <div className="mx-auto max-w-4xl px-4">
              <div className="flex items-end gap-2.5 rounded-3xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl shadow-2xl dark:shadow-neutral-950/80 p-3.5 transition-all focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/10">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    activePdfs.length > 0
                      ? `Ask about ${activePdfs.length} active PDF${activePdfs.length !== 1 ? "s" : ""}… (Shift+Enter for new line)`
                      : "Ask Astra AI anything… or attach a PDF for vector search (Shift+Enter for new line)"
                  }
                  rows={1}
                  disabled={isLoading}
                  className="flex-1 resize-none bg-transparent px-2 text-sm text-neutral-900 dark:text-white outline-none placeholder:text-neutral-400 min-h-[38px] max-h-40 leading-relaxed font-medium"
                />
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Modern Resized SaaS Model Selector Pill */}
                  <ModelSelectorPill
                    provider={provider}
                    setProvider={setProvider}
                    groqKey={groqKey}
                    groqModel={groqModel}
                    setGroqModel={setGroqModel}
                    ollamaModel={ollamaModel}
                    setOllamaModel={setOllamaModel}
                    groqModelsList={groqModelsList}
                    setGroqModelsList={setGroqModelsList}
                    onToast={toast}
                    onOpenSettings={() => setShowSettings(true)}
                  />

                  <input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadPDF(f);
                      e.target.value = "";
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadState === "uploading"}
                    title="Upload PDF Document"
                    className={`p-2.5 rounded-2xl border transition-all ${
                      uploadState === "uploading"
                        ? "border-neutral-200 dark:border-neutral-800 text-neutral-300 cursor-not-allowed"
                        : uploadState === "success"
                        ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10"
                        : uploadState === "error"
                        ? "border-red-500/30 text-red-500 bg-red-500/10"
                        : "border-neutral-200/80 dark:border-neutral-800/80 text-neutral-400 hover:text-emerald-500 hover:border-emerald-500/40 bg-neutral-100/80 dark:bg-neutral-800/80"
                    }`}
                  >
                    {uploadState === "uploading" ? (
                      <IconLoader2 size={18} className="animate-spin" />
                    ) : uploadState === "success" ? (
                      <IconCheck size={18} />
                    ) : uploadState === "error" ? (
                      <IconAlertCircle size={18} />
                    ) : (
                      <IconPaperclip size={18} />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => sendMessage()}
                    disabled={!inputValue.trim() || isLoading}
                    className={`p-2.5 rounded-2xl font-bold transition-all flex items-center justify-center ${
                      inputValue.trim() && !isLoading
                        ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? <IconLoader2 size={18} className="animate-spin" /> : <IconSend size={18} />}
                  </motion.button>
                </div>
              </div>
              <p className="text-center text-[11px] font-semibold text-neutral-400 mt-2 tracking-wide">
                {provider === "ollama"
                  ? "🔒 Running locally — your data stays private"
                  : activePdfs.length > 0
                  ? `Groq · Semantic RAG Vector Search across ${activePdfs.length} PDF${activePdfs.length !== 1 ? "s" : ""}`
                  : "Groq · Universal Assistant · Upload PDF for RAG Search"}
              </p>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};
