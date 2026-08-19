import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  IconBrain,
  IconCpu,
  IconShieldLock,
  IconWorldWww,
  IconCheck,
  IconArrowRight,
  IconSparkles,
  IconChevronDown,
  IconChevronUp,
  IconRocket,
  IconChartBar,
} from "@tabler/icons-react";

export const Home = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: (
        <IconBrain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
      ),
      title: "Semantic Vector RAG Search",
      description:
        "High-density chunking and PostgreSQL pgvector semantic retrieval ensure exact context grounding for all your documents.",
    },
    {
      icon: <IconCpu className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
      title: "Dual Engine Support (Groq & Ollama)",
      description:
        "Switch seamlessly between lightning-fast Groq Cloud LLaMA 3.3 70B & DeepSeek R1 models or run 100% private local Ollama models.",
    },
    {
      icon: (
        <IconShieldLock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
      ),
      title: "Automated Data Privacy & Redaction",
      description:
        "Strict PII and secret redaction engines scrub passwords, credit cards, and API keys before vector embedding.",
    },
    {
      icon: (
        <IconWorldWww className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
      ),
      title: "ScrapeGraphAI Web Knowledge Extraction",
      description:
        "Autonomous web scraping with legal robots.txt enforcement and structured JSON data extraction for real-time web intelligence.",
    },
  ];

  const pricingTiers = [
    {
      name: "Developer Starter",
      price: "$0",
      period: "forever free",
      description:
        "Perfect for exploring semantic search & local Ollama models.",
      features: [
        "Groq LLaMA 3.3 & 3.1 models",
        "Local Ollama streaming",
        "Up to 10 active PDF documents",
        "SQLite vector storage",
        "Community support",
      ],
      cta: "Get Started Free",
      highlighted: false,
    },
    {
      name: "Pro Researcher",
      price: "$19",
      period: "per month",
      description: "For professionals requiring unlimited PDFs & web scraping.",
      features: [
        "Everything in Developer",
        "Unlimited PDF vector indexing",
        "ScrapeGraphAI web extraction",
        "pgvector PostgreSQL storage",
        "Export chat history & Markdown QA",
        "Priority SSE streaming latency",
      ],
      cta: "Start 14-Day Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise Dedicated",
      price: "Custom",
      period: "billed annually",
      description:
        "Isolated vector databases & dedicated infrastructure for teams.",
      features: [
        "Dedicated pgvector cluster",
        "Custom LLM fine-tuning & RAG pipelines",
        "SOC2 compliant data isolation",
        "Custom API rate limits",
        "99.9% Uptime SLA & 24/7 support",
      ],
      cta: "Contact Enterprise Sales",
      highlighted: false,
    },
  ];

  const faqs = [
    {
      q: "How does Astra AI secure my document data?",
      a: "All uploaded PDFs are processed locally with strict PII data redaction (Scrubbing SSNs, Credit Cards, and API keys). Vector embeddings are stored safely in isolated PostgreSQL pgvector or local SQLite tables.",
    },
    {
      q: "Can I run models 100% offline on my own hardware?",
      a: "Yes! Astra AI features native integration with Ollama. Simply run `ollama serve` on your computer and select Ollama from the model selector in the chat bar.",
    },
    {
      q: "What API keys do I need for Groq Cloud?",
      a: "You can use your own free Groq Cloud API key from console.groq.com. The chat interface features a dynamic model fetcher that lists all available LLaMA 3.3, 3.1, Gemma 2, and DeepSeek R1 models instantly.",
    },
    {
      q: "How does ScrapeGraphAI web scraping work?",
      a: "Our web scraper validates target URLs against robots.txt rules, blocks sensitive endpoints, extracts clean web content, and feeds structured Markdown directly into your knowledge base.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500/30 selection:text-emerald-600 dark:selection:text-emerald-300 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-16 pb-20 overflow-hidden border-b border-neutral-200/80 dark:border-neutral-900">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-8 shadow-inner"
          >
            <IconSparkles
              size={14}
              className="animate-spin text-emerald-600 dark:text-emerald-400"
            />
            <span>Next-Gen Enterprise Knowledge Engine & RAG Platform</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.1] max-w-4xl mx-auto"
          >
            Turn Unstructured Data Into{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent">
              Actionable Intelligence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Upload PDFs, scrape web knowledge bases, and chat with pgvector
            semantic AI in real-time — powered by high-speed Groq Cloud LLaMA
            3.3 & private local Ollama engines.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <IconRocket size={18} /> Launch RAG Workspace{" "}
              <IconArrowRight size={16} />
            </Link>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-sm transition-all shadow-sm"
            >
              <IconChartBar size={18} /> View Knowledge Analytics
            </Link>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-neutral-200/80 dark:border-neutral-900 max-w-3xl mx-auto text-center"
          >
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white font-mono">
                &lt; 50ms
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-semibold">
                Streaming Latency
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                99.8%
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-semibold">
                Retrieval Precision
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400 font-mono">
                pgvector
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-semibold">
                Semantic Embeddings
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                100% Private
              </p>
              <p className="text-xs text-neutral-500 mt-1 font-semibold">
                Local Ollama Option
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 border-b border-neutral-200/80 dark:border-neutral-900 bg-white/50 dark:bg-neutral-950/60">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
              Enterprise Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Built for Accuracy, Speed, and Compliance
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3 font-medium">
              Comprehensive vector RAG tooling engineered for high-performance
              AI document synthesis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="p-8 rounded-3xl bg-white dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800/80 hover:border-emerald-500/40 transition-all shadow-sm backdrop-blur-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-neutral-800/80 flex items-center justify-center mb-5 border border-emerald-500/20 dark:border-neutral-700/50">
                  {f.icon}
                </div>
                <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
                  {f.title}
                </h4>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed font-medium">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 border-b border-neutral-200/80 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
              Transparent Pricing
            </h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Simple Plans for Developers & Enterprise Teams
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3 font-medium">
              Start free with your own API key or local models, then scale as
              your vector knowledge base grows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className={`relative p-8 rounded-3xl flex flex-col justify-between transition-all ${
                  tier.highlighted
                    ? "bg-white dark:bg-gradient-to-b dark:from-neutral-900 dark:via-neutral-900/90 dark:to-neutral-950 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10"
                    : "bg-white dark:bg-neutral-900/40 border border-neutral-200/80 dark:border-neutral-800/80 shadow-sm"
                }`}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                    Most Popular
                  </span>
                )}

                <div>
                  <h4 className="text-lg font-bold text-neutral-900 dark:text-white">
                    {tier.name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 min-h-[32px] font-medium">
                    {tier.description}
                  </p>

                  <div className="my-6 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white font-mono">
                      {tier.price}
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      /{tier.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat, fIdx) => (
                      <li
                        key={fIdx}
                        className="flex items-center gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 font-medium"
                      >
                        <IconCheck
                          size={14}
                          className="text-emerald-600 dark:text-emerald-400 flex-shrink-0"
                        />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/chat"
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-center transition-all ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white"
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-b border-neutral-200/80 dark:border-neutral-900 bg-white/50 dark:bg-neutral-950/60">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
              Frequently Asked Questions
            </h2>
            <h3 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Everything You Need to Know
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-neutral-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <IconChevronUp
                      size={16}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  ) : (
                    <IconChevronDown
                      size={16}
                      className="text-neutral-400 dark:text-neutral-500"
                    />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-200/60 dark:border-neutral-800/40 pt-3 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="p-12 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-white to-teal-500/10 dark:from-emerald-950/40 dark:via-neutral-900 dark:to-teal-950/40 border border-emerald-500/30 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white tracking-tight">
              Ready to Accelerate Your Document Intelligence?
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-3 max-w-xl mx-auto font-medium">
              Start chatting with your PDFs and scraped web documents in
              seconds. No complex setup required.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/chat"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-500/25 hover:scale-105 transition-all"
              >
                <IconRocket size={18} /> Open Astra RAG Chat Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
