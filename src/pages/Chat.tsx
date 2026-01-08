import { useRef, useState } from "react";
import { IconPaperclip, IconSend } from "@tabler/icons-react";
import { Container } from "../components/Container";

type ChatMessage = {
  id: number;
  sender: "user" | "bot" | "system";
  text: string;
};

export const Chat = () => {
  const [_, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      sender: "system",
      text: "Upload a PDF or type your message…",
    },
  ]);

  const [uploadStatus, setUploadStatus] = useState("");
  const messageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- PDF Upload ---
  const uploadPDF = async () => {
    if (!fileInputRef.current?.files?.length) {
      alert("Please select a PDF file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInputRef.current.files[0]);

    try {
      const res = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadStatus(
        res.ok
          ? "✅ PDF Uploaded Successfully!"
          : `❌ ${data.message || "Upload failed"}`,
      );
    } catch {
      setUploadStatus("❌ Upload failed (network).");
    }
  };

  // --- Chat ---
  const sendMessage = async () => {
    const message = messageInputRef.current?.value.trim();
    if (!message) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (messageInputRef.current) messageInputRef.current.value = "";

    const typingId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: typingId, sender: "bot", text: "typing…" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== typingId)
          .concat({
            id: Date.now() + 2,
            sender: "bot",
            text: data.reply || "No response.",
          }),
      );
    } catch {
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== typingId)
          .concat({
            id: Date.now() + 2,
            sender: "bot",
            text: "Network error.",
          }),
      );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black/99">
      <Container>
        <div className="">
          <h1 className="text-4xl font-medium text-neutral-950 dark:text-white">Hello there!</h1>
          <h1 className="text-neutral-950 dark:text-white text-2xl">How can I help you today?</h1>
        </div>

        {/* This is the input box for chat */}
        <div className="fixed right-0 bottom-0 left-0 mx-auto w-full max-w-4xl px-4 py-6">
          <div className="mt-4 flex w-full items-center rounded-full border dark:border-gray-900 border-gray-300/50 bg-white dark:bg-black/40 p-3">
            <input
              ref={messageInputRef}
              type="text"
              placeholder="Type your message…"
              className="grow bg-transparent px-4 text-lg text-neutral-950 dark:text-white outline-none"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <div className="flex w-fit flex-row items-center justify-evenly">
              <div className="">
                <input
                  type="file"
                  accept=".pdf"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={uploadPDF}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-full border border-neutral-300 dark:border-gray-900 bg-neutral-100 dark:bg-neutral-950 px-2 py-2 transition duration-300 ease-in-out hover:cursor-pointer hover:bg-white mx-1"
                >
                  <IconPaperclip width={24} className="dark:text-neutral-500 text-neutral-950" />
                </button>
                <p className="text-sm dark:text-gray-400 text-neutral-950">{uploadStatus}</p>
              </div>

              <button
                onClick={sendMessage}
                className="rounded-full border border-neutral-300 dark:border-gray-900 bg-neutral-100 dark:bg-neutral-950 px-2 py-2 transition duration-300 ease-in-out hover:cursor-pointer hover:bg-white mx-1"
              >
                <IconSend width={24} className="dark:text-neutral-500 text-neutral-950" />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};
