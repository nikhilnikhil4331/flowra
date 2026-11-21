import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, SendHorizontal, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { computeCycle, todayKey } from '../lib/cycle';
import { aiReply, AI_SUGGESTIONS } from '../lib/ai';
import { MascotAvatar } from '../components/ui';

function RichText({ text }: { text: string }) {
  return (
    <div className="space-y-1">
      {text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const bold = line.replace(/\*\*(.+?)\*\*/g, '$1');
        return (
          <p key={i} className={bold.startsWith('•') ? 'pl-1' : ''}>
            {bold}
          </p>
        );
      })}
    </div>
  );
}

export function AiScreen() {
  const chat = useStore((s) => s.chat);
  const pushChat = useStore((s) => s.pushChat);
  const periods = useStore((s) => s.periods);
  const dayLogs = useStore((s) => s.dayLogs);
  const user = useStore((s) => s.user);
  const back = useStore((s) => s.back);
  const cycle = useMemo(() => computeCycle(periods), [periods]);

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [chat.length, typing]);

  const ask = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    pushChat('user', text);
    setInput('');
    setTyping(true);
    const reply = aiReply(text, cycle, dayLogs[todayKey()], user.name);
    setTimeout(() => {
      pushChat('ai', reply);
      setTyping(false);
    }, 950 + Math.random() * 500);
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0">
      {/* header */}
      <header className="flex items-center gap-2.5 px-4 pt-1 pb-2.5 shrink-0 border-b border-blush-line/60 bg-white/40">
        <button onClick={back} aria-label="Go back" className="tap w-9 h-9 rounded-full bg-white shadow-card flex items-center justify-center shrink-0">
          <ChevronLeft size={19} strokeWidth={2.6} />
        </button>
        <MascotAvatar size={38} />
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-black leading-tight flex items-center gap-1.5">
            Myflo AI <Sparkles size={14} className="text-primary" />
          </h1>
          <p className="text-[10.5px] font-bold text-ink-mute leading-tight">Your personal health companion</p>
        </div>
        <span className="text-[9.5px] font-extrabold text-minty bg-minty/15 rounded-full px-2 py-1">● Online</span>
      </header>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar myflo-scroll px-4 py-3 space-y-3 min-h-0">
        {chat.map((m) =>
          m.role === 'ai' ? (
            <div key={m.id} className="flex items-end gap-2 animate-fade-up">
              <MascotAvatar size={28} ring={false} />
              <div className="max-w-[78%] bg-white shadow-card border border-blush-line/60 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-[12.5px] font-semibold text-ink-soft leading-relaxed">
                <RichText text={m.text} />
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end animate-fade-up">
              <div className="max-w-[78%] bg-grad-pink shadow-btn text-white rounded-2xl rounded-br-md px-3.5 py-2.5 text-[12.5px] font-semibold leading-relaxed">
                <RichText text={m.text} />
              </div>
            </div>
          ),
        )}

        {typing && (
          <div className="flex items-end gap-2 animate-fade-in">
            <MascotAvatar size={28} ring={false} />
            <div className="bg-white shadow-card border border-blush-line/60 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5" aria-label="Myflo AI is typing">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-2 h-2 rounded-full bg-primary-light animate-typing-dot" style={{ animationDelay: `${i * 160}ms` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* suggestions */}
      <div className="px-4 pb-2 shrink-0">
        <div className="flex gap-2 overflow-x-auto no-scrollbar myflo-scroll-x pb-1">
          {AI_SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)} className="tap shrink-0 text-[11px] font-extrabold text-primary bg-white border border-primary-soft rounded-full px-3 py-1.5 shadow-card">
              {s}
            </button>
          ))}
        </div>

        {/* input */}
        <form
          onSubmit={(e) => { e.preventDefault(); ask(input); }}
          className="flex items-center gap-2 pb-1"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            aria-label="Message Myflo AI"
            className="flex-1 h-[46px] rounded-full bg-white border border-blush-line px-4 text-[13px] font-semibold placeholder:text-ink-faint outline-none focus:border-primary-light shadow-card"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            aria-label="Send message"
            className="tap w-[46px] h-[46px] rounded-full bg-grad-pink shadow-btn text-white flex items-center justify-center disabled:opacity-50 shrink-0"
          >
            <SendHorizontal size={19} strokeWidth={2.4} />
          </button>
        </form>
        <p className="text-[9.5px] font-semibold text-ink-faint text-center pb-1">
          Myflo AI gives general wellness info, not medical advice.
        </p>
      </div>
    </div>
  );
}
