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
  const [status, setStatus] = useState<string>(
    "Scraper ready with ScrapeGraphAI & Security Protocols. Enter a URL above and click Start Crawling.",
  );
  const [loading, setLoading] = useState(false);

  const setScrapeStatus = (data: unknown) => {
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
    } catch (err) {
      setScrapeStatus({
        error: "Failed to start scraper",
        detail: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const checkScrapeStatus = async () => {
    try {
      const res = await fetch("/scrape/status");
      setScrapeStatus(await res.json());
    } catch (err) {
      setScrapeStatus({
        error: "Failed to fetch status",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const rebuildIndex = async () => {
    setScrapeStatus("Rebuilding TF-IDF vector index...");

    try {
      const res = await fetch("/reindex", { method: "POST" });
      setScrapeStatus(await res.json());
    } catch (err) {
      setScrapeStatus({
        error: "Failed to rebuild index",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const stopScrape = async () => {
    try {
      const res = await fetch("/scrape/stop", { method: "POST" });
      setScrapeStatus(await res.json());
    } catch (err) {
      setScrapeStatus({
        error: "Stop endpoint not available",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-['Plus_Jakarta_Sans',sans-serif]">
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
              <IconWorldWww size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                ScrapeGraphAI Web Crawler
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                Scrape websites, enforce robots.txt compliance, and
                automatically build your vector knowledge base.
              </p>
            </div>
          </div>
        </div>

        {/* Security Alert Card */}
        <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-start gap-3">
          <IconShieldCheck
            size={20}
            className="text-emerald-500 flex-shrink-0 mt-0.5"
          />
          <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1">
            <p className="font-bold text-neutral-900 dark:text-white">
              Built-in Security & Legal Protection
            </p>
            <p>
              ScrapeGraphAI automatically checks{" "}
              <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">
                robots.txt
              </code>
              , restricts localhost/internal IP crawling, and redacts sensitive
              PII data before indexing.
            </p>
          </div>
        </div>

        {/* Form Controls */}
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 shadow-sm mb-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
              Target Website URL
            </label>
            <input
              type="text"
              value={startUrl}
              onChange={(e) => setStartUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                Max Pages Limit
              </label>
              <input
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block mb-1.5">
                Crawl Delay (Seconds)
              </label>
              <input
                type="number"
                step="0.1"
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl px-4 py-3 text-xs text-neutral-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={startScrape}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
            >
              <IconPlayerPlay size={15} />
              {loading ? "Crawling..." : "Start Crawling"}
            </button>

            <button
              onClick={stopScrape}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-all"
            >
              <IconPlayerStop size={15} /> Stop
            </button>

            <button
              onClick={checkScrapeStatus}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-all"
            >
              <IconActivity size={15} /> Status
            </button>

            <button
              onClick={rebuildIndex}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-all"
            >
              <IconRefresh size={15} /> Rebuild Index
            </button>
          </div>
        </div>

        {/* Live Terminal Output Console */}
        <div className="rounded-3xl bg-neutral-900 border border-neutral-800 p-5 font-mono shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800 text-xs text-neutral-400">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Scraper Execution Log
            </span>
            <IconLock size={14} className="text-neutral-500" />
          </div>
          <pre className="text-xs text-emerald-400 whitespace-pre-wrap overflow-x-auto max-h-80 leading-relaxed">
            {status}
          </pre>
        </div>
      </main>
    </div>
  );
};
