import { useState, useRef, useEffect, useCallback } from "react";
import { Container } from "@/components/Container";
import { useUser, useAuth } from "@clerk/react";
import {
  IconUpload,
  IconFileTypePdf,
  IconX,
  IconSearch,
  IconFilter,
  IconDownload,
  IconUser,
  IconCalendar,
  IconBook,
  IconSchool,
  IconChevronDown,
  IconCheck,
  IconLoader2,
  IconSparkles,
  IconAlertTriangle,
  IconChevronLeft,
  IconChevronRight,
  IconFileText,
  IconClock,
  IconRefresh,
  IconFolderOpen,
  IconLayersIntersect,
  IconFileCode,
  IconInfoCircle,
} from "@tabler/icons-react";

// ─── Config ───────────────────────────────────────────────────────────────────
const FLASK_BASE = import.meta.env.VITE_FLASK_URL ?? "http://localhost:5000";
const IS_DEV = import.meta.env.DEV;

type GetToken = () => Promise<string | null>;

async function authHeaders(
  getToken: () => Promise<string | null>,
  clerkUserId: string,
): Promise<Record<string, string>> {
  if (IS_DEV) return { "X-Clerk-User-Id": clerkUserId };
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Toast System ─────────────────────────────────────────────────────────────
type Toast = { id: number; type: "success" | "error" | "info"; message: string };

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 w-84 max-w-[calc(100vw-2.5rem)] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-xl backdrop-blur-md border text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2
            ${
              t.type === "success"
                ? "bg-emerald-950/80 border-emerald-800/80 text-emerald-200 shadow-emerald-950/40"
                : t.type === "error"
                ? "bg-red-950/80 border-red-800/80 text-red-200 shadow-red-950/40"
                : "bg-neutral-900/90 border-neutral-800 text-neutral-200 shadow-neutral-950/40"
            }`}
        >
          <div className="flex-shrink-0 mt-0.5 p-1 rounded-lg bg-white/10">
            {t.type === "success" ? (
              <IconCheck size={14} className="text-emerald-400" />
            ) : t.type === "error" ? (
              <IconAlertTriangle size={14} className="text-red-400" />
            ) : (
              <IconInfoCircle size={14} className="text-emerald-400" />
            )}
          </div>
          <p className="flex-1 text-xs leading-relaxed font-normal">{t.message}</p>
          <button
            onClick={() => onDismiss(t.id)}
            className="flex-shrink-0 p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
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

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  const prev = page > 1;
  const next = page < pages;
  const pageNums = Array.from({ length: pages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
    .reduce<(number | string)[]>((acc, p, i, arr) => {
      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        onClick={() => onPage(page - 1)}
        disabled={!prev}
        className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
          prev
            ? "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-emerald-500/50 hover:bg-emerald-500/5"
            : "border-neutral-200/50 dark:border-neutral-800/40 text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
        }`}
      >
        <IconChevronLeft size={14} />
        Previous
      </button>

      <div className="flex items-center gap-1 px-2">
        {pageNums.map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="text-xs text-neutral-400 px-1.5">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p as number)}
              className={`w-8.5 h-8.5 rounded-xl text-xs font-semibold border transition-all ${
                p === page
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-emerald-500/40 hover:bg-emerald-500/5"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPage(page + 1)}
        disabled={!next}
        className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
          next
            ? "border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-emerald-500/50 hover:bg-emerald-500/5"
            : "border-neutral-200/50 dark:border-neutral-800/40 text-neutral-300 dark:text-neutral-700 cursor-not-allowed"
        }`}
      >
        Next
        <IconChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type FileType = "notes" | "pyq";

type UploadedFile = {
  id: string;
  name: string;
  fileType: FileType;
  semester: string;
  year: string;
  subjectName: string;
  subjectCode: string;
  branch: string;
  uploadedAt: string;
  uploaderName: string;
  uploaderEmail: string;
  size: string;
  url?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const YEARS = ["2020", "2021", "2022", "2023", "2024", "2025"];
const BRANCHES = [
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "IT",
  "Chemical",
  "Biotech",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Select ───────────────────────────────────────────────────────────────────
function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon: IconComponent,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  icon?: any;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1">
        {IconComponent && <IconComponent size={12} className="text-emerald-500" />}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200
            dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white font-medium
            outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all pr-8 cursor-pointer"
        >
          <option value="" className="text-neutral-400 dark:bg-neutral-900">
            {placeholder ?? `Select ${label}`}
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="dark:bg-neutral-900">
              {o}
            </option>
          ))}
        </select>
        <IconChevronDown
          size={14}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

// ─── UploadForm Component (Vertical Above Layout) ──────────────────────────────
function UploadForm({
  getToken,
  clerkUserId,
  uploaderName,
  uploaderEmail,
  onUploadSuccess,
}: {
  getToken: GetToken;
  clerkUserId: string;
  uploaderName: string;
  uploaderEmail: string;
  onUploadSuccess: (file: UploadedFile) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType>("notes");
  const [semester, setSemester] = useState("");
  const [year, setYear] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [branch, setBranch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit =
    selectedFile && semester && subjectName && subjectCode && branch && (fileType === "notes" || year);

  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setErrorMsg("Only PDF files are accepted.");
      setStatus("error");
      return;
    }
    setFile(f);
    setStatus("idle");
    setErrorMsg("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !selectedFile) return;
    setUploading(true);
    setStatus("idle");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fileType", fileType);
    formData.append("semester", semester);
    formData.append("year", year);
    formData.append("subjectName", subjectName);
    formData.append("subjectCode", subjectCode);
    formData.append("branch", branch);
    formData.append("uploaderName", uploaderName);
    formData.append("uploaderEmail", uploaderEmail);

    try {
      const headers = await authHeaders(getToken, clerkUserId);

      const res = await fetch(`${FLASK_BASE}/dashboard/upload`, {
        method: "POST",
        headers: headers,
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.file) {
        setStatus("success");
        onUploadSuccess(data.file);
        setFile(null);
        setSemester("");
        setYear("");
        setSubjectName("");
        setSubjectCode("");
        setBranch("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setStatus("error");
        setErrorMsg(data.message ?? "Upload failed.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error — is Flask running?");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-xl shadow-neutral-200/40 dark:shadow-none overflow-hidden transition-all mb-10">
      {/* Form Header */}
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <IconUpload size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white tracking-tight">Upload Resource</h2>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Upload PDF first, then fill out resource details below
            </p>
          </div>
        </div>

        {/* Resource Type Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
          <button
            type="button"
            onClick={() => setFileType("notes")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              fileType === "notes"
                ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-neutral-200/80 dark:border-neutral-700/80"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
            }`}
          >
            <IconBook size={14} />
            Lecture Notes
          </button>
          <button
            type="button"
            onClick={() => setFileType("pyq")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              fileType === "pyq"
                ? "bg-white dark:bg-neutral-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-neutral-200/80 dark:border-neutral-700/80"
                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
            }`}
          >
            <IconFileCode size={14} />
            Previous Year Q
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 1. TOP SECTION: UPLOAD DROPZONE AREA */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <IconFileTypePdf size={13} className="text-emerald-500" />
              PDF File Upload Area
            </span>
            {selectedFile && (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <IconCheck size={13} />
                File Attached
              </span>
            )}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-6 text-center group ${
              dragging
                ? "border-emerald-500 bg-emerald-500/10"
                : selectedFile
                ? "border-emerald-500/60 bg-emerald-500/5 dark:bg-emerald-500/10"
                : "border-neutral-200 dark:border-neutral-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/5"
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {selectedFile ? (
              <div className="flex items-center justify-between gap-4 text-left">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                    <IconFileTypePdf size={22} className="text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-neutral-500 font-mono mt-0.5">{formatBytes(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setStatus("idle");
                  }}
                  className="p-2 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <IconX size={16} />
                </button>
              </div>
            ) : (
              <div className="py-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <IconUpload size={24} />
                </div>
                <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                  Click to select file or <span className="text-emerald-600 dark:text-emerald-400">drag PDF document here</span>
                </p>
                <p className="text-xs text-neutral-400 mt-1">Accepts PDF documents up to 20 MB</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. BOTTOM SECTION: UPLOAD DETAILS & INFO METADATA FORM */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
              <IconFileText size={13} className="text-emerald-500" />
              Resource Details & Academic Information
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Subject Name */}
            <div className="md:col-span-2">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                Subject Name
              </label>
              <input
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="e.g. Data Structures & Algorithms"
                className="w-full bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800
                  rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none font-medium
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-neutral-400"
              />
            </div>

            {/* Subject Code */}
            <div>
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
                Subject Code
              </label>
              <input
                type="text"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                placeholder="e.g. CS3001"
                className="w-full bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800
                  rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none font-mono uppercase font-semibold
                  focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-neutral-400 placeholder:font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Semester" value={semester} onChange={setSemester} options={SEMESTERS} icon={IconBook} />
            <Select label="Branch" value={branch} onChange={setBranch} options={BRANCHES} icon={IconSchool} />
            {fileType === "pyq" ? (
              <Select label="Exam Year" value={year} onChange={setYear} options={YEARS} icon={IconCalendar} />
            ) : (
              <div>
                <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
                  Resource Quality
                </label>
                <div className="bg-neutral-100/70 dark:bg-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/60 rounded-xl px-3.5 py-2.5 text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5 font-medium">
                  <IconCheck size={14} className="text-emerald-500" />
                  Verified Study Notes
                </div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {status === "error" && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/80 rounded-xl p-3">
              <IconAlertTriangle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {status === "success" && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 rounded-xl p-3">
              <IconCheck size={15} className="flex-shrink-0" />
              <span>Resource successfully published to the batch repository!</span>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || uploading}
              className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                canSubmit && !uploading
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 active:scale-[0.99]"
                  : "bg-neutral-100 dark:bg-neutral-900 text-neutral-400 border border-neutral-200/60 dark:border-neutral-800/60 cursor-not-allowed"
              }`}
            >
              {uploading ? (
                <>
                  <IconLoader2 size={16} className="animate-spin" />
                  <span>Uploading & Publishing Resource...</span>
                </>
              ) : (
                <>
                  <IconUpload size={16} />
                  <span>Publish Resource</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FileCard Component ───────────────────────────────────────────────────────
function FileCard({ file }: { file: UploadedFile }) {
  const isPYQ = file.fileType === "pyq";
  const initials = file.uploaderName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
              <IconFileTypePdf size={20} className="text-red-500" />
            </div>
            <div>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md border ${
                  isPYQ
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                }`}
              >
                {isPYQ ? <IconFileCode size={11} /> : <IconBook size={11} />}
                {isPYQ ? "PYQ" : "Notes"}
              </span>
            </div>
          </div>

          {file.url && (
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 transition-all duration-200 flex-shrink-0"
              title="Download PDF"
            >
              <IconDownload size={15} />
            </a>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {file.name}
        </h3>

        {/* Subject Code & Name */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            {file.subjectCode}
          </span>
          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium truncate max-w-[220px]">
            {file.subjectName}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 px-2 py-1 rounded-lg">
            <IconBook size={11} className="text-emerald-500" />
            Sem {file.semester}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 px-2 py-1 rounded-lg">
            <IconSchool size={11} className="text-emerald-500" />
            {file.branch}
          </span>
          {file.year && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 px-2 py-1 rounded-lg">
              <IconCalendar size={11} className="text-emerald-500" />
              {file.year}
            </span>
          )}
          <span className="inline-flex items-center text-[10px] font-mono text-neutral-400 dark:text-neutral-500 px-1 py-1">
            {file.size}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-neutral-100 dark:border-neutral-900 pt-3.5 mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow-sm">
            {initials || <IconUser size={10} />}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate">
              {file.uploaderName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] font-medium text-neutral-400 flex-shrink-0">
          <IconClock size={11} />
          {timeAgo(file.uploadedAt)}
        </div>
      </div>
    </div>
  );
}

// ─── FilterBar Component ──────────────────────────────────────────────────────
function FilterBar({
  search,
  setSearch,
  filterSemester,
  setFilterSemester,
  filterBranch,
  setFilterBranch,
  filterType,
  setFilterType,
  onReset,
}: {
  search: string;
  setSearch: (v: string) => void;
  filterSemester: string;
  setFilterSemester: (v: string) => void;
  filterBranch: string;
  setFilterBranch: (v: string) => void;
  filterType: string;
  setFilterType: (v: string) => void;
  onReset: () => void;
}) {
  const hasActiveFilters = search || filterSemester || filterBranch || filterType;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <IconSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject name, code, branch..."
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/80
              rounded-xl pl-9.5 pr-8 py-2.5 text-xs text-neutral-900 dark:text-white font-medium outline-none
              focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-neutral-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <IconX size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white dark:bg-neutral-950 border border-neutral-200/80
                dark:border-neutral-800/80 rounded-xl pl-3 pr-7 py-2.5 text-xs text-neutral-700
                dark:text-neutral-300 font-medium outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="notes">Notes</option>
              <option value="pyq">PYQ</option>
            </select>
            <IconChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white dark:bg-neutral-950 border border-neutral-200/80
                dark:border-neutral-800/80 rounded-xl pl-3 pr-7 py-2.5 text-xs text-neutral-700
                dark:text-neutral-300 font-medium outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map((s) => (
                <option key={s} value={s}>
                  Sem {s}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-white dark:bg-neutral-950 border border-neutral-200/80
                dark:border-neutral-800/80 rounded-xl pl-3 pr-7 py-2.5 text-xs text-neutral-700
                dark:text-neutral-300 font-medium outline-none focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">All Branches</option>
              {BRANCHES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <IconChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <IconFilter size={13} className="text-emerald-500" />
            <span>Active search filters applied</span>
          </div>
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <IconRefresh size={12} />
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}

// ─── EmptyState Component ─────────────────────────────────────────────────────
function EmptyState({ hasFilters, onReset }: { hasFilters: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3.5 text-emerald-600 dark:text-emerald-400">
        {hasFilters ? <IconFolderOpen size={26} /> : <IconLayersIntersect size={26} />}
      </div>
      <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-1">
        {hasFilters ? "No matching resources" : "No resources uploaded yet"}
      </h3>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed mb-4">
        {hasFilters
          ? "We couldn't find any study materials matching your search criteria."
          : "Be the first to share notes or previous exam papers with your peer group."}
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <IconRefresh size={14} />
          Clear search filters
        </button>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const Dashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const firstName = user?.firstName ?? "Student";
  const clerkUserId = user?.id ?? "";
  const uploaderName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Anonymous";
  const uploaderEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [filterType, setFilterType] = useState("");

  const PAGE_SIZE = 12;

  const fetchFiles = useCallback(
    async (p: number) => {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(p),
        limit: String(PAGE_SIZE),
        ...(search && { search }),
        ...(filterSemester && { semester: filterSemester }),
        ...(filterBranch && { branch: filterBranch }),
        ...(filterType && { type: filterType }),
      });
      try {
        const res = await fetch(`${FLASK_BASE}/dashboard/files?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setFiles(data.files ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.pages ?? 1);
        setPage(data.page ?? p);
      } catch (err) {
        toast("error", `Failed to load resources: ${err instanceof Error ? err.message : "Network error"}`);
      } finally {
        setLoading(false);
      }
    },
    [search, filterSemester, filterBranch, filterType, toast]
  );

  useEffect(() => {
    fetchFiles(1);
  }, [fetchFiles]);

  const handleUploadSuccess = useCallback(
    (file: UploadedFile) => {
      toast("success", `"${file.name}" uploaded successfully`);
      fetchFiles(1);
    },
    [fetchFiles, toast]
  );

  const resetFilters = () => {
    setSearch("");
    setFilterSemester("");
    setFilterBranch("");
    setFilterType("");
  };

  const hasFilters = !!(search || filterSemester || filterBranch || filterType);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black/99 text-neutral-900 dark:text-neutral-100">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <Container>
        {/* Banner / Header */}
        <div className="pt-6 pb-6 border-b border-neutral-200/80 dark:border-neutral-800/80 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
                <IconSparkles size={13} />
                <span>Astra Learning Repository</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                Welcome back, {firstName}
              </h1>
              <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                Access and contribute academic notes, study guides, and past examination papers.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <IconBook size={18} />
                </div>
                <div>
                  <p className="text-lg font-bold leading-none text-neutral-900 dark:text-white">{total}</p>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">
                    Resources
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VERTICAL PAGE LAYOUT */}

        {/* 1. TOP VERTICAL SECTION: UPLOAD SECTION */}
        <div className="w-full">
          <UploadForm
            getToken={getToken}
            clerkUserId={clerkUserId}
            uploaderName={uploaderName}
            uploaderEmail={uploaderEmail}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        {/* 2. BOTTOM VERTICAL SECTION: UPLOAD DETAILS, REPOSITORY SEARCH & RESOURCE FILES */}
        <div className="w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-neutral-200/60 dark:border-neutral-800/60">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
                <IconLayersIntersect size={18} className="text-emerald-500" />
                Community Resource Repository
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Browse and filter shared notes and previous exam papers
              </p>
            </div>

            {total > 0 && (
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-3 py-1.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60">
                {total} Total Document{total !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <FilterBar
            search={search}
            setSearch={setSearch}
            filterSemester={filterSemester}
            setFilterSemester={setFilterSemester}
            filterBranch={filterBranch}
            setFilterBranch={setFilterBranch}
            filterType={filterType}
            setFilterType={setFilterType}
            onReset={resetFilters}
          />

          {/* Content Files Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl">
              <IconLoader2 size={30} className="animate-spin text-emerald-500 mb-2" />
              <p className="text-xs text-neutral-400 font-medium">Loading learning repository...</p>
            </div>
          ) : files.length === 0 ? (
            <EmptyState hasFilters={hasFilters} onReset={resetFilters} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4.5">
                {files.map((file) => (
                  <FileCard key={file.id} file={file} />
                ))}
              </div>
              <Pagination page={page} pages={totalPages} onPage={(p) => fetchFiles(p)} />
            </>
          )}
        </div>
      </Container>
    </div>
  );
};
