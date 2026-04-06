import { useState, useRef, useEffect, useCallback } from "react";
import { Container } from "@/components/Container";
import { useUser, useAuth } from "@clerk/react";
import {
  IconUpload, IconFileTypePdf, IconX, IconSearch,
  IconFilter, IconDownload, IconUser, IconCalendar,
  IconBook, IconSchool, IconChevronDown, IconCheck,
  IconLoader2, IconSparkles,
  IconAlertTriangle, IconChevronLeft, IconChevronRight,
} from "@tabler/icons-react";

// ─── Config ───────────────────────────────────────────────────────────────────
const FLASK_BASE = import.meta.env.VITE_FLASK_URL ?? "http://localhost:5000";
const IS_DEV = import.meta.env.DEV;

type GetToken = () => Promise<string | null>;

// Dev mode  → Flask reads X-Clerk-User-Id (DEV_MODE=true in Flask .env)
// Production → Flask verifies Authorization: Bearer <jwt>
async function authHeaders(
  getToken: () => Promise<string | null>,
  clerkUserId: string,
): Promise<Record<string, string>> {
  if (IS_DEV) return { "X-Clerk-User-Id": clerkUserId };
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}


// ─── Toast system ─────────────────────────────────────────────────────────────
type Toast = { id: number; type: "success" | "error" | "info"; message: string };

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div key={t.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
            ${t.type === "success" ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
            : t.type === "error"   ? "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            : "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"}`}>
          <div className="flex-shrink-0 mt-0.5">
            {t.type === "success" ? <IconCheck size={15} />
              : t.type === "error" ? <IconAlertTriangle size={15} />
              : <IconFilter size={15} />}
          </div>
          <p className="flex-1 leading-snug">{t.message}</p>
          <button onClick={() => onDismiss(t.id)} className="flex-shrink-0 opacity-60 hover:opacity-100"><IconX size={13} /></button>
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
      acc.push(p); return acc;
    }, []);
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPage(page - 1)} disabled={!prev}
        className={`p-2 rounded-xl border transition-colors ${prev ? "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900" : "border-neutral-100 dark:border-neutral-800/50 text-neutral-300 dark:text-neutral-700 cursor-not-allowed"}`}>
        <IconChevronLeft size={16} />
      </button>
      {pageNums.map((p, i) =>
        p === "…"
          ? <span key={`e${i}`} className="text-xs text-neutral-400 px-1">…</span>
          : <button key={p} onClick={() => onPage(p as number)}
              className={`w-8 h-8 rounded-xl text-xs font-medium border transition-colors ${p === page ? "bg-violet-600 border-violet-600 text-white" : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"}`}>
              {p}
            </button>
      )}
      <button onClick={() => onPage(page + 1)} disabled={!next}
        className={`p-2 rounded-xl border transition-colors ${next ? "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900" : "border-neutral-100 dark:border-neutral-800/50 text-neutral-300 dark:text-neutral-700 cursor-not-allowed"}`}>
        <IconChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type FileType = "notes" | "pyq";


type UploadedFile = {
  id:            string;
  name:          string;
  fileType:      FileType;
  semester:      string;
  year:          string;
  subjectName:   string;
  subjectCode:   string;
  branch:        string;
  uploadedAt:    string;
  uploaderName:  string;
  uploaderEmail: string;
  size:          string;
  url?:          string;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
const YEARS     = ["2020", "2021", "2022", "2023", "2024", "2025"];
const BRANCHES  = [
  "Computer Science", "Electronics", "Mechanical", "Civil",
  "Electrical", "IT", "Chemical", "Biotech",
];



// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024)           return `${bytes} B`;
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m    = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Select ───────────────────────────────────────────────────────────────────
function Select({
  label, value, onChange, options, placeholder,
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: string[]; placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-neutral-50 dark:bg-neutral-900 border border-neutral-200
            dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white
            outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all pr-8"
        >
          <option value="">{placeholder ?? `Select ${label}`}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <IconChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── UploadForm ───────────────────────────────────────────────────────────────
function UploadForm({
  getToken, clerkUserId, uploaderName, uploaderEmail, onUploadSuccess,
}: {
  getToken:         GetToken;
  clerkUserId:      string;
  uploaderName:     string;
  uploaderEmail:    string;
  onUploadSuccess:  (file: UploadedFile) => void;
}) {
  const fileInputRef                = useRef<HTMLInputElement>(null);
  const [dragging, setDragging]     = useState(false);
  const [selectedFile, setFile]     = useState<File | null>(null);
  const [fileType, setFileType]     = useState<FileType>("notes");
  const [semester, setSemester]     = useState("");
  const [year, setYear]             = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [branch, setBranch]         = useState("");
  const [uploading, setUploading]   = useState(false);
  const [status, setStatus]         = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg]     = useState("");

  const canSubmit =
    selectedFile && semester && subjectName && subjectCode && branch &&
    (fileType === "notes" || year);

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
    formData.append("file",          selectedFile);
    formData.append("fileType",      fileType);
    formData.append("semester",      semester);
    formData.append("year",          year);
    formData.append("subjectName",   subjectName);
    formData.append("subjectCode",   subjectCode);
    formData.append("branch",        branch);
    formData.append("uploaderName",  uploaderName);
    formData.append("uploaderEmail", uploaderEmail);

    try {
      // Build auth headers — Bearer token in prod, user-id header in dev
      const headers = await authHeaders(getToken, clerkUserId);

      const res  = await fetch(`${FLASK_BASE}/dashboard/upload`, {
        method:  "POST",
        // Do NOT set Content-Type — browser sets the multipart boundary
        headers: headers,
        body:    formData,
      });
      const data = await res.json();

      if (res.ok && data.file) {
        setStatus("success");
        onUploadSuccess(data.file);
        setFile(null);
        setSemester(""); setYear(""); setSubjectName(""); setSubjectCode(""); setBranch("");
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
    <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-800/60 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <IconUpload size={16} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Upload Resource</h2>
          <p className="text-xs text-neutral-500">PDF only · visible to all students</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* File type toggle */}
        <div>
          <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
            Resource type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["notes", "pyq"] as FileType[]).map((t) => (
              <button
                key={t}
                onClick={() => setFileType(t)}
                className={`py-2.5 rounded-xl text-sm font-medium transition-all border
                  ${fileType === t
                    ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/20"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-violet-400"
                  }`}
              >
                {t === "notes" ? "📚 Notes" : "📝 Previous Year Q"}
              </button>
            ))}
          </div>
        </div>

        {/* Dropzone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-6 text-center
            ${dragging
              ? "border-violet-500 bg-violet-50 dark:bg-violet-900/10"
              : selectedFile
                ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10"
                : "border-neutral-200 dark:border-neutral-800 hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-violet-900/5"
            }`}
        >
          <input
            type="file" accept=".pdf" ref={fileInputRef} className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {selectedFile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <IconFileTypePdf size={20} className="text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white truncate max-w-[180px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-neutral-500">{formatBytes(selectedFile.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); setStatus("idle"); }}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500 transition-colors"
              >
                <IconX size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-3">
                <IconUpload size={22} className="text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Drop PDF here or <span className="text-violet-600">browse</span>
              </p>
              <p className="text-xs text-neutral-400 mt-1">Maximum file size: 20 MB</p>
            </>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3">
          <Select label="Semester" value={semester} onChange={setSemester} options={SEMESTERS} />
          {fileType === "pyq"
            ? <Select label="Exam Year" value={year} onChange={setYear} options={YEARS} />
            : <div />
          }
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
            Subject Name
          </label>
          <input
            type="text" value={subjectName} onChange={(e) => setSubjectName(e.target.value)}
            placeholder="e.g. Data Structures & Algorithms"
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800
              rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white outline-none
              focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-neutral-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
              Subject Code
            </label>
            <input
              type="text" value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
              placeholder="e.g. CS3001"
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800
                rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 dark:text-white outline-none font-mono
                focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-neutral-400"
            />
          </div>
          <Select label="Branch" value={branch} onChange={setBranch} options={BRANCHES} />
        </div>

        {/* Status */}
        {status === "error" && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
            <IconX size={14} className="flex-shrink-0" />
            {errorMsg}
          </div>
        )}
        {status === "success" && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
            <IconCheck size={14} className="flex-shrink-0" />
            Uploaded successfully! Visible to all students.
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || uploading}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
            ${canSubmit && !uploading
              ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900/30 hover:scale-[1.01]"
              : "bg-neutral-100 dark:bg-neutral-900 text-neutral-400 cursor-not-allowed"
            }`}
        >
          {uploading
            ? <><IconLoader2 size={16} className="animate-spin" /> Uploading…</>
            : <><IconUpload size={16} /> Upload Resource</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── FileCard ─────────────────────────────────────────────────────────────────
function FileCard({ file }: { file: UploadedFile }) {
  const isPYQ    = file.fileType === "pyq";
  const initials = file.uploaderName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="group bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800
      rounded-2xl p-5 hover:border-violet-300 dark:hover:border-violet-800 hover:shadow-md
      hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20 transition-all duration-200">

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
            <IconFileTypePdf size={20} className="text-red-500" />
          </div>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border
            ${isPYQ
              ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
              : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
            }`}>
            {isPYQ ? "PYQ" : "Notes"}
          </span>
        </div>
        {file.url && (
          <a
            href={file.url} target="_blank" rel="noreferrer"
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-400
              hover:text-violet-600 hover:border-violet-300 dark:hover:border-violet-700
              opacity-0 group-hover:opacity-100 transition-all duration-200"
            title="Download"
          >
            <IconDownload size={15} />
          </a>
        )}
      </div>

      <h3 className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug mb-1 line-clamp-2">
        {file.name}
      </h3>

      <div className="flex items-center gap-1.5 mb-3">
        <span className="font-mono text-xs text-violet-600 dark:text-violet-400 bg-violet-50
          dark:bg-violet-900/20 px-2 py-0.5 rounded-md border border-violet-100 dark:border-violet-900">
          {file.subjectCode}
        </span>
        <span className="text-xs text-neutral-500 truncate">{file.subjectName}</span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400
          bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 rounded-full">
          <IconBook size={10} /> Sem {file.semester}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400
          bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 rounded-full">
          <IconSchool size={10} /> {file.branch}
        </span>
        {file.year && (
          <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400
            bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 rounded-full">
            <IconCalendar size={10} /> {file.year}
          </span>
        )}
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500 px-1 py-0.5">
          {file.size}
        </span>
      </div>

      <div className="border-t border-neutral-100 dark:border-neutral-800/60 pt-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600
            flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
            {initials || <IconUser size={10} />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
              {file.uploaderName}
            </p>
            <p className="text-[10px] text-neutral-400 truncate">{file.uploaderEmail}</p>
          </div>
          <span className="ml-auto text-[10px] text-neutral-400 flex-shrink-0">
            {timeAgo(file.uploadedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
function FilterBar({
  search, setSearch,
  filterSemester, setFilterSemester,
  filterBranch, setFilterBranch,
  filterType, setFilterType,
}: {
  search: string;           setSearch: (v: string) => void;
  filterSemester: string;   setFilterSemester: (v: string) => void;
  filterBranch: string;     setFilterBranch: (v: string) => void;
  filterType: string;       setFilterType: (v: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <IconSearch size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subject, code, branch…"
          className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800
            rounded-xl pl-9 pr-4 py-2.5 text-sm text-neutral-900 dark:text-white outline-none
            focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition-all placeholder:text-neutral-400"
        />
      </div>

      {[
        { value: filterType,     onChange: setFilterType,     opts: [["", "All types"], ["notes", "Notes"], ["pyq", "PYQ"]] },
        { value: filterSemester, onChange: setFilterSemester, opts: [["", "All semesters"], ...SEMESTERS.map((s) => [s, `Sem ${s}`])] },
        { value: filterBranch,   onChange: setFilterBranch,   opts: [["", "All branches"], ...BRANCHES.map((b) => [b, b])] },
      ].map(({ value, onChange, opts }, i) => (
        <div key={i} className="relative">
          <select
            value={value as string}
            onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
            className="appearance-none bg-white dark:bg-neutral-950 border border-neutral-200
              dark:border-neutral-800 rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-neutral-700
              dark:text-neutral-300 outline-none focus:border-violet-500 transition-all"
          >
            {(opts as [string, string][]).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <IconChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
      ))}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4">
        {hasFilters
          ? <IconFilter size={28} className="text-neutral-400" />
          : <IconSparkles size={28} className="text-neutral-400" />
        }
      </div>
      <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
        {hasFilters ? "No results match your filters" : "No resources uploaded yet"}
      </h3>
      <p className="text-sm text-neutral-400 max-w-xs">
        {hasFilters
          ? "Try adjusting your search or filters"
          : "Be the first to upload notes or PYQs for your batch"
        }
      </p>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export const Dashboard = () => {
  const { user }     = useUser();
  const { getToken } = useAuth();
  const { toasts, toast, dismiss } = useToast();

  const firstName     = user?.firstName ?? "Student";
  const clerkUserId   = user?.id ?? "";
  const uploaderName  = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Anonymous";
  const uploaderEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  // ── Server-side pagination + filtering state ────────────────────────────
  const [files,          setFiles]          = useState<UploadedFile[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [page,           setPage]           = useState(1);
  const [totalPages,     setTotalPages]     = useState(1);
  const [total,          setTotal]          = useState(0);
  const [search,         setSearch]         = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterBranch,   setFilterBranch]   = useState("");
  const [filterType,     setFilterType]     = useState("");

  const PAGE_SIZE = 12;

  // Fetch a page from the server — all filtering is server-side
  const fetchFiles = useCallback(async (p: number) => {
    setLoading(true);
    const params = new URLSearchParams({
      page:  String(p),
      limit: String(PAGE_SIZE),
      ...(search       && { search }),
      ...(filterSemester && { semester: filterSemester }),
      ...(filterBranch   && { branch:   filterBranch }),
      ...(filterType     && { type:     filterType }),
    });
    try {
      const res  = await fetch(`${FLASK_BASE}/dashboard/files?${params}`);
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
  }, [search, filterSemester, filterBranch, filterType, toast]);

  // Re-fetch whenever filters change (reset to page 1)
  useEffect(() => {
    fetchFiles(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterSemester, filterBranch, filterType]);

  const handleUploadSuccess = useCallback((file: UploadedFile) => {
    toast("success", `"${file.name}" uploaded successfully`);
    // Refresh page 1 to show the new file at the top
    fetchFiles(1);
  }, [fetchFiles, toast]);

  const hasFilters = !!(search || filterSemester || filterBranch || filterType);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black/99">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <Container>

        {/* Header */}
        <div className="pt-8 pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-2">
                Astra Dashboard
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                Welcome back, {firstName}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
                Share and discover study resources with your batch
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              {[
                { label: "Total", value: total,  color: "text-neutral-900 dark:text-white" },
              ].map((s) => (
                <div key={s.label} className="text-center px-4 py-2.5 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-neutral-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left: sticky upload form */}
          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <div className="lg:sticky lg:top-6">
              <UploadForm
                getToken={getToken}
                clerkUserId={clerkUserId}
                uploaderName={uploaderName}
                uploaderEmail={uploaderEmail}
                onUploadSuccess={handleUploadSuccess}
              />
            </div>
          </div>

          {/* Right: file grid */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <FilterBar
                search={search}                 setSearch={setSearch}
                filterSemester={filterSemester} setFilterSemester={setFilterSemester}
                filterBranch={filterBranch}     setFilterBranch={setFilterBranch}
                filterType={filterType}         setFilterType={setFilterType}
              />
              {total > 0 && (
                <p className="text-xs text-neutral-400 mt-2.5">
                  Showing {files.length} of {total} resource{total !== 1 ? "s" : ""}
                  {totalPages > 1 && ` — page ${page} of ${totalPages}`}
                </p>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <IconLoader2 size={28} className="animate-spin text-violet-500" />
              </div>
            ) : files.length === 0 ? (
              <EmptyState hasFilters={hasFilters} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2  gap-4">
                  {files.map((file) => (
                    <FileCard key={file.id} file={file} />
                  ))}
                </div>
                <Pagination page={page} pages={totalPages} onPage={(p) => fetchFiles(p)} />
              </>
            )}
          </div>
        </div>

      </Container>
    </div>
  );
};
