import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/Container";
import { AnimatedTooltip, LampContainer } from "@/components/ui";
import { toast } from "sonner";
import { TeamData } from "@/data/TeamData";



type FormState = {
  name: string;
  email: string;
  message: string;
};

export const Contact = () => {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.warning("Missing information", {
        description: "Please fill in all fields before submitting.",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Message sent successfully!", {
        description: "We’ll get back to you shortly.",
      });

      setFormData({ name: "", email: "", message: "" });
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
{/* Contact Heading */}
      <LampContainer>
        <motion.h1
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="mt-8 bg-linear-to-br from-slate-700 to-slate-500 bg-clip-text py-4 text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl dark:from-slate-300 dark:to-slate-500"
        >
          Contact our friendly team <br />
          <p className="text-4xl">Let us know how we can help.</p>
        </motion.h1>
      </LampContainer>

      {/* Contact Form */}
      <Container className="relative min-h-full overflow-hidden bg-cover bg-center dark:bg-slate-950">
        {/* background for contact */}
        <div className="from emerald-300 absolute inset-0 scale-105 bg-linear-to-b via-teal-300/10 to-emerald-50 bg-cover bg-center blur-sm dark:to-slate-950"></div>

        {/* Contact Section Box */}
        <div className="z-100 mx-auto w-full max-w-lg rounded-2xl border border-neutral-100 bg-neutral-200/5 p-8 backdrop-blur-3xl dark:border-white/10 dark:bg-white/5 dark:backdrop-blur-md">
          <h2 className="mb-2 text-2xl font-semibold text-black dark:text-white">
            Contact Us
          </h2>
          <p className="mb-6 text-lg text-neutral-950 dark:text-neutral-300">
            Have a question or feedback? Send us a message.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              className="w-full rounded-md border border-white/10 bg-white px-3 py-2 text-neutral-950 placeholder-neutral-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:bg-black/40 dark:text-white"
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full rounded-md border border-white/10 bg-white px-3 py-2 text-neutral-950 placeholder-neutral-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:bg-black/40 dark:text-white"
            />

            {/* Message */}
            <textarea
              name="message"
              rows={5}
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message..."
              className="row-10 w-full resize-none rounded-md border border-white/10 bg-white px-3 py-2 text-neutral-950 placeholder-neutral-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none dark:bg-black/40 dark:text-white"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-emerald-400 px-4 py-2 font-medium text-black transition hover:cursor-pointer hover:bg-emerald-300 focus:ring-emerald-400 focus:outline-none disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

        </div>

        <div className="min-h-screen">
          <motion.h1
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mx-auto mt-20 flex min-h-[50vh] items-center justify-center bg-linear-to-br from-slate-700 to-slate-500 bg-clip-text py-4 text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl dark:from-slate-300 dark:to-slate-500"
          >
            <p className="text-4xl">Meet our Team</p>
          </motion.h1>
          <div className="mb-10 flex w-full flex-row items-center justify-center hover:cursor-pointer">
            <AnimatedTooltip items={TeamData} />
          </div>
        </div>
      </Container>
    </div>
  );
};
