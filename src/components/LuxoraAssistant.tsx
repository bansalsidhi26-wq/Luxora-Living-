import { FormEvent, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2, MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { submitEnquiry } from '../hooks/useStudioData';
import type { ProjectItem, ServiceItem } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface LuxoraAssistantProps {
  services: ServiceItem[];
  projects: ProjectItem[];
  onNavigateConsultation: () => void;
}

const WELCOME_MESSAGE =
  'Welcome to Luxora Living! How can I help you design your dream space?';

const QUICK_PROMPTS = [
  'Suggest a design style for a sunlit living room',
  'What interior design services do you offer?',
  'How does your 5-phase design process work?',
  'How do I book a private consultation?',
];

export function LuxoraAssistant({
  services,
  projects,
  onNavigateConsultation,
}: LuxoraAssistantProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'enquiry'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Quick enquiry state inside assistant
  const [enqName, setEnqName] = useState('');
  const [enqEmail, setEnqEmail] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqMessage, setEnqMessage] = useState('');
  const [enqSubmitting, setEnqSubmitting] = useState(false);
  const [enqDone, setEnqDone] = useState(false);
  const [enqError, setEnqError] = useState('');

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, view, open]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || typing) return;

    setErrorMsg('');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setTyping(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextHistory
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role, content: m.content })),
          studioContext: {
            services: services.map((s) => s.title),
            projects: projects.map((p) => `${p.title} (${p.location})`),
          },
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        demoMode?: boolean;
        error?: string;
      };

      if (!response.ok || data.error) {
        setErrorMsg(data.error || 'Unable to reach LUXORA AI right now.');
        return;
      }

      if (data.demoMode) {
        setDemoMode(true);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.reply || 'Thank you for contacting LUXORA LIVING.',
        },
      ]);
    } catch {
      setErrorMsg('Network error contacting LUXORA AI. Please try again.');
    } finally {
      setTyping(false);
    }
  };

  const handleChatSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleEnquirySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEnqError('');

    if (enqName.trim().length < 2) {
      setEnqError('Please provide your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enqEmail.trim())) {
      setEnqError('Please enter a valid email address.');
      return;
    }
    if (enqMessage.trim().length < 5) {
      setEnqError('Please describe your space or enquiry.');
      return;
    }

    setEnqSubmitting(true);
    try {
      await submitEnquiry({
        name: enqName,
        email: enqEmail,
        phone: enqPhone,
        subject: 'LUXORA AI Concierge Consultation Enquiry',
        message: enqMessage,
        source: 'ai_assistant',
      });
      setEnqDone(true);
      setEnqName('');
      setEnqEmail('');
      setEnqPhone('');
      setEnqMessage('');
    } catch {
      setEnqError('Unable to send enquiry right now. Please try the main form below.');
    } finally {
      setEnqSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating LUXORA AI Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close LUXORA AI assistant' : 'Open LUXORA AI assistant'}
        aria-expanded={open}
        className="fixed bottom-6 right-5 sm:right-7 z-40 inline-flex items-center gap-2.5 h-12 px-4 sm:px-5 rounded-full bg-[#252522] dark:bg-[#C6A15B] text-[#F5F1EA] dark:text-[#141412] border border-[#C6A15B]/70 shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C6A15B]"
      >
        {open ? (
          <X className="w-4 h-4 text-[#C6A15B] dark:text-[#141412]" />
        ) : (
          <Sparkles className="w-4 h-4 text-[#C6A15B] dark:text-[#141412]" />
        )}
        <span className="text-xs font-medium tracking-[0.14em] uppercase whitespace-nowrap">
          LUXORA AI
        </span>
      </button>

      {/* Floating Chat Drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            aria-label="LUXORA AI Personal Design Assistant"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-22 right-4 sm:right-7 z-50 w-[calc(100vw-2rem)] sm:w-[390px] max-h-[min(560px,calc(100vh-7.5rem))] flex flex-col rounded-2xl overflow-hidden bg-[#F5F1EA] dark:bg-[#1E1E1B] text-[#252522] dark:text-[#F5F1EA] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 shadow-2xl"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-[#252522] text-[#F5F1EA] flex items-center justify-between gap-3 border-b border-[#C6A15B]/25">
              <div>
                <div className="font-serif text-lg tracking-wide">LUXORA AI</div>
                <p className="text-[11px] text-[#D8C7B0]">
                  Personal Architectural &amp; Design Concierge
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setView(view === 'chat' ? 'enquiry' : 'chat');
                    setEnqDone(false);
                  }}
                  className="px-2.5 py-1 rounded-full text-[11px] border border-[#C6A15B]/50 text-[#C6A15B] hover:bg-[#C6A15B] hover:text-[#141412] transition-colors whitespace-nowrap"
                >
                  {view === 'chat' ? 'Enquire' : 'Back to Chat'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close assistant"
                  className="p-1.5 rounded-full text-[#D8C7B0] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {demoMode && (
              <div className="px-4 py-2 text-[11px] bg-[#D8C7B0]/40 dark:bg-[#252522] text-[#5A5851] dark:text-[#D8C7B0] border-b border-[#D8C7B0]/50 dark:border-[#F5F1EA]/10">
                Demo Preview Interface — Live AI responds automatically when server credentials are configured.
              </div>
            )}

            {view === 'chat' ? (
              <>
                {/* Messages */}
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 text-sm"
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed text-[13px] ${
                          msg.role === 'user'
                            ? 'bg-[#252522] text-[#F5F1EA] dark:bg-[#C6A15B] dark:text-[#141412] rounded-br-sm'
                            : 'bg-white dark:bg-[#252522] text-[#252522] dark:text-[#F5F1EA] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {typing && (
                    <div className="flex justify-start">
                      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white dark:bg-[#252522] border border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C6A15B] animate-bounce" />
                      </div>
                    </div>
                  )}

                  {errorMsg && (
                    <p className="text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-lg px-3 py-2">
                      {errorMsg}
                    </p>
                  )}

                  {messages.length <= 2 && !typing && (
                    <div className="pt-2 space-y-1.5">
                      <p className="text-[11px] text-[#5A5851] dark:text-[#B8B2A6]">
                        Suggested topics
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_PROMPTS.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => sendMessage(q)}
                            className="text-left text-[11px] px-3 py-1.5 rounded-lg bg-white/80 dark:bg-[#252522] border border-[#D8C7B0]/70 dark:border-[#F5F1EA]/12 hover:border-[#C6A15B] transition-colors"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Action Bar + Input */}
                <div className="border-t border-[#D8C7B0]/60 dark:border-[#F5F1EA]/10 bg-white/75 dark:bg-[#141412]/70 p-3 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] px-1">
                    <button
                      type="button"
                      onClick={() => {
                        setView('enquiry');
                        setEnqDone(false);
                      }}
                      className="inline-flex items-center gap-1 text-[#A8843F] dark:text-[#C6A15B] hover:underline font-medium"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Submit direct enquiry</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onNavigateConsultation();
                      }}
                      className="inline-flex items-center gap-1 text-[#5A5851] dark:text-[#B8B2A6] hover:text-[#252522] dark:hover:text-[#F5F1EA]"
                    >
                      <span>Full booking form</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask about styles, services, or projects..."
                      aria-label="Ask LUXORA AI"
                      className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl text-xs bg-[#F5F1EA] dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 focus:outline-none focus:border-[#C6A15B]"
                    />
                    <button
                      type="submit"
                      disabled={typing || !input.trim()}
                      aria-label="Send message"
                      className="w-10 h-10 shrink-0 rounded-xl bg-[#C6A15B] text-[#141412] flex items-center justify-center disabled:opacity-45 hover:bg-[#b5904b] transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-5">
                {enqDone ? (
                  <div className="py-10 text-center space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-[#C6A15B] mx-auto" strokeWidth={1.5} />
                    <h4 className="font-serif text-2xl">Enquiry Received</h4>
                    <p className="text-xs text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                      Our senior design concierge has received your note and will respond within one business day.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEnqDone(false);
                        setView('chat');
                      }}
                      className="mt-2 px-4 py-2 rounded-full text-xs font-medium bg-[#252522] text-[#F5F1EA] dark:bg-[#C6A15B] dark:text-[#141412]"
                    >
                      Return to Conversation
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEnquirySubmit} className="space-y-3 text-xs">
                    <p className="text-[#5A5851] dark:text-[#B8B2A6] leading-relaxed">
                      Share your project preferences and our studio principals will prepare tailored style and consultation options.
                    </p>
                    <input
                      type="text"
                      required
                      value={enqName}
                      onChange={(e) => setEnqName(e.target.value)}
                      placeholder="Full Name *"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 focus:outline-none focus:border-[#C6A15B]"
                    />
                    <input
                      type="email"
                      required
                      value={enqEmail}
                      onChange={(e) => setEnqEmail(e.target.value)}
                      placeholder="Email Address *"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 focus:outline-none focus:border-[#C6A15B]"
                    />
                    <input
                      type="tel"
                      value={enqPhone}
                      onChange={(e) => setEnqPhone(e.target.value)}
                      placeholder="Phone / WhatsApp (Optional)"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 focus:outline-none focus:border-[#C6A15B]"
                    />
                    <textarea
                      required
                      rows={4}
                      value={enqMessage}
                      onChange={(e) => setEnqMessage(e.target.value)}
                      placeholder="Tell us about your property, preferred style, and timeline *"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white dark:bg-[#252522] border border-[#D8C7B0] dark:border-[#F5F1EA]/15 focus:outline-none focus:border-[#C6A15B] resize-none"
                    />
                    {enqError && (
                      <p className="text-xs text-red-700 dark:text-red-400">{enqError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={enqSubmitting}
                      className="w-full py-2.5 rounded-full bg-[#C6A15B] text-[#141412] font-medium hover:bg-[#b5904b] transition-colors disabled:opacity-50"
                    >
                      {enqSubmitting ? 'Sending...' : 'Send Consultation Enquiry'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
