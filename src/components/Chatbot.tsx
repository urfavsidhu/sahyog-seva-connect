import { useState } from "react";
import { Bot, Languages, Send, Sparkles, X } from "lucide-react";
import { Button } from "./kit";
import { useApp } from "@/lib/app-store";
import { cn } from "@/lib/utils";

const seed = {
  en: [
    { from: "bot", text: "Hi! I'm Sahyog, your booking assistant. Ask me about services, prices or your bookings." },
  ],
  hi: [
    { from: "bot", text: "नमस्ते! मैं सहयोग हूँ, आपका बुकिंग सहायक। सेवाओं, कीमतों या अपनी बुकिंग के बारे में पूछें।" },
  ],
};

const replies = {
  en: [
    "A verified plumber near Baner is available today from 3 PM at ₹320/hour. Shall I book it?",
    "Your booking BK-2481 is in progress. Ramesh is at your address now — share OTP 4821 when the job is done.",
    "Cooperative workers keep 85% of every payment; 15% funds insurance and training for the collective.",
  ],
  hi: [
    "बाणेर के पास एक सत्यापित प्लंबर आज 3 बजे से ₹320/घंटा पर उपलब्ध है। बुक करूँ?",
    "आपकी बुकिंग BK-2481 चल रही है। रमेश आपके पते पर हैं — काम पूरा होने पर OTP 4821 बताएं।",
    "सहकारी कर्मचारी हर भुगतान का 85% रखते हैं; 15% बीमा और प्रशिक्षण में जाता है।",
  ],
};

export function Chatbot() {
  const { lang, toggleLang } = useApp();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<{ from: string; text: string }[]>(seed.en);
  const [typing, setTyping] = useState(false);

  const send = () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    setMsgs((m) => [...m, { from: "me", text }]);
    setTyping(true);
    setTimeout(() => {
      const pool = replies[lang];
      setMsgs((m) => {
        const reply = pool[m.length % pool.length] ?? "How can I help with your booking?";
        return [...m, { from: "bot", text: reply }];
      });
      setTyping(false);
    }, 900);
  };

  return (
    <>
      <button
        onClick={() => {
          setOpen((o) => !o);
          setMsgs(seed[lang]);
        }}
        aria-label="Open assistant"
        className="tap tap-active fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-pop hover:bg-primary/90 md:bottom-6 md:right-6"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div className="surface fixed bottom-36 right-4 z-40 flex h-[26rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden p-0 md:bottom-24 md:right-6">
          <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {lang === "en" ? "Sahyog Assistant" : "सहयोग सहायक"}
              </span>
            </div>
            <button
              onClick={toggleLang}
              className="tap flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-xs font-semibold hover:bg-white/25"
            >
              <Languages className="h-3.5 w-3.5" />
              {lang === "en" ? "हिंदी" : "EN"}
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.from === "me"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="w-16 rounded-2xl bg-secondary px-3 py-2 text-sm text-muted-foreground">
                •••
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={lang === "en" ? "Type a message…" : "संदेश लिखें…"}
              className="h-10 flex-1 rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <Button size="sm" onClick={send} aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
