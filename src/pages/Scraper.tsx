import { useState } from "react";

export const Scraper = () => {
  const [startUrl, setStartUrl] = useState("https://kiit.ac.in");
  const [maxPages, setMaxPages] = useState(150);
  const [delay, setDelay] = useState(0.8);
  const [status, setStatus] = useState<any>("Status will appear here…");
  const [loading, setLoading] = useState(false);

  const setScrapeStatus = (data: any) => {
    setStatus(typeof data === "string" ? data : JSON.stringify(data, null, 2));
  };

  const startScrape = async () => {
    setLoading(true);
    setScrapeStatus("Starting scraper...");

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
    setScrapeStatus("Rebuilding TF-IDF index...");

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
    <div className="min-h-screen bg-gray-900 text-white">
      
      <main className="mx-auto max-w-4xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-semibold">🕷️ KIIT Website Scraper</h1>

        <div className="space-y-3 rounded-lg bg-gray-800 p-4 shadow-lg">
          {/* Inputs */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="text-sm text-gray-300">Start URL</label>
              <input
                value={startUrl}
                onChange={(e) => setStartUrl(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Max Pages</label>
              <input
                type="number"
                min={1}
                max={2000}
                value={maxPages}
                onChange={(e) => setMaxPages(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Delay (seconds)</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={startScrape}
              disabled={loading}
              className="rounded-lg bg-blue-500 px-4 py-2 hover:bg-blue-600 disabled:opacity-60"
            >
              Start Async
            </button>

            <button
              onClick={checkScrapeStatus}
              className="rounded-lg bg-gray-600 px-4 py-2 hover:bg-gray-500"
            >
              Check Status
            </button>

            <button
              onClick={rebuildIndex}
              className="rounded-lg bg-purple-600 px-4 py-2 hover:bg-purple-700"
            >
              Rebuild TF-IDF Index
            </button>

            <button
              onClick={stopScrape}
              className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
            >
              Stop
            </button>
          </div>

          {/* Status */}
          <pre className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm whitespace-pre-wrap">
            {status}
          </pre>
        </div>
      </main>
    </div>
  );
};
