import { useState } from "react";
import {
  IconWorldWww,
  IconPlayerPlay,
  IconPlayerStop,
  IconRefresh,
  IconShieldCheck,
  IconActivity,
  IconLock,
} from "@tabler/icons-react";

export const Scraper = () => {
  const [startUrl, setStartUrl] = useState("https://docs.python.org");
  const [maxPages, setMaxPages] = useState(150);
  const [delay, setDelay] = useState(0.8);
  const [status, setStatus] = useState<any>("Scraper ready with ScrapeGraphAI & Security Protocols. Enter a URL above and click Start Crawling.");
  const [loading, setLoading] = useState(false);

  const setScrapeStatus = (data: any) => {
    setStatus(typeof data === "string" ? data : JSON.stringify(data, null, 2));
  };

  const startScrape = async () => {
    if (!startUrl.trim()) {
      setScrapeStatus({ error: "Please enter a valid website URL" });
      return;
    }
    setLoading(true);
    setScrapeStatus("Verifying security protocols & starting ScrapeGraphAI...");

    try {
      const res = await fetch("/scrape/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_url: startUrl.trim(),
          max_pages: maxPages,
          delay,
        }),
      });

      setScrapeStatus(await res.json());
    } catch (err: any) {
      setScrapeStatus({
        error: "Failed to start scraper",
        detail: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const checkScrapeStatus = async () => {
    try {
      const res = await fetch("/scrape/status");
      setScrapeStatus(await res.json());
    } catch (err: any) {
      setScrapeStatus({
        error: "Failed to fetch status",
        detail: String(err),
      });
    }
  };

  const rebuildIndex = async () => {
    setScrapeStatus("Rebuilding TF-IDF vector index...");

    try {
      const res = await fetch("/reindex", { method: "POST" });
      setScrapeStatus(await res.json());
    } catch (err: any) {
      setScrapeStatus({
        error: "Failed to rebuild index",
        detail: String(err),
      });
    }
  };

  const stopScrape = async () => {
    try {
      const res = await fetch("/scrape/stop", { method: "POST" });
      setScrapeStatus(await res.json());
    } catch (err: any) {
      setScrapeStatus({
        error: "Stop endpoint not available",
        detail: String(err),
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-black/99 text-neutral-900 dark:text-neutral-100">
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <IconWorldWww size={14} />
              <span>ScrapeGraphAI Engine</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <IconShieldCheck size={14} />
              <span>robots.txt Enforced</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold">
              <IconLock size={14} />
              <span>PII & Secrets Redaction</span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Universal Web Scraper (ScrapeGraphAI)
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            Enter any public website URL. Crawls obey robots.txt, reject sensitive auth paths, and automatically redact PII before indexing for AI RAG search.
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-950 border border-neutral-200/80 dark:border-neutral-800/80 rounded-2xl p-6 shadow-xl shadow-neutral-200/40 dark:shadow-none space-y-6">
          {/* Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <IconWorldWww size={13} className="text-emerald-500" />
                Target Website URL
              </label>
              <input
                type="text"
                value={startUrl}
                onChange={(e) => setStartUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
                Max Pages
              </label>
              <input
                type="number"
                min={1}
                max={2000}
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5 block">
                Crawl Delay (sec)
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-900">
            <button
              onClick={startScrape}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
            >
              <IconPlayerPlay size={15} />
              Start Crawling
            </button>

            <button
              onClick={checkScrapeStatus}
              className="flex items-center gap-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 px-4 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-all"
            >
              <IconActivity size={15} className="text-emerald-500" />
              Check Status
            </button>

            <button
              onClick={rebuildIndex}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-600/20 transition-all"
            >
              <IconRefresh size={15} />
              Rebuild TF-IDF Index
            </button>

            <button
              onClick={stopScrape}
              className="flex items-center gap-1.5 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2.5 text-xs font-bold text-white transition-all ml-auto"
            >
              <IconPlayerStop size={15} />
              Stop Task
            </button>
          </div>

          {/* Status Display Log */}
          <div>
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">
              Crawler Task Output & Compliance Log
            </span>
            <pre className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-emerald-400 p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-80">
              {status}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};
