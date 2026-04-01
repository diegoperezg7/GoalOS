import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PageTransition } from "@/components/common/page-transition";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildChatSystemPrompt } from "@/services/ai/ai-prompts";
import { aiOrchestrator } from "@/services/ai/ai-orchestrator";
import type { ChatMessage } from "@/services/ai/ai-types";
import { useAppStore } from "@/store/use-app-store";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-2 w-2 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  const formattedContent = message.content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "• $1")
    .replace(/\n/g, "<br/>");

  return (
    <motion.div
      className={["flex", isUser ? "justify-end" : "justify-start"].join(" ")}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className={[
          "max-w-[80%] rounded-[20px] px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "rounded-br-md bg-primary/20 text-foreground"
            : "rounded-bl-md border border-white/10 bg-white/[0.06] text-foreground/90",
        ].join(" ")}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    </motion.div>
  );
}

export function ChatPage() {
  const user = useAppStore((state) => state.user);
  const goals = useAppStore((state) => state.goals);
  const milestones = useAppStore((state) => state.milestones);
  const tasks = useAppStore((state) => state.tasks);
  const habits = useAppStore((state) => state.habits);
  const achievements = useAppStore((state) => state.achievements);
  const wins = useAppStore((state) => state.wins);
  const lifeEvents = useAppStore((state) => state.lifeEvents);
  const progressEntries = useAppStore((state) => state.progressEntries);
  const aiInsights = useAppStore((state) => state.aiInsights);

  const snapshot = useMemo(
    () => ({ user, goals, milestones, tasks, habits, achievements, wins, lifeEvents, progressEntries, aiInsights }),
    [user, goals, milestones, tasks, habits, achievements, wins, lifeEvents, progressEntries, aiInsights],
  );

  const systemPrompt = useMemo(() => buildChatSystemPrompt(snapshot), [snapshot]);

  const activeGoalCount = goals.filter((g) => g.status === "active").length;
  const welcomeMessage: ChatMessage = {
    role: "assistant",
    content: `Hola ${user.name}. Tengo acceso a todos tus datos de GoalOS: ${activeGoalCount} goals activos, ${wins.length} wins y ${achievements.length} logros registrados.\n\n¿En qué puedo ayudarte hoy?`,
  };

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Skip the static welcome message (index 0) — it's UI sugar, not conversation history
      const conversationHistory = updatedMessages.slice(1);
      const response = await aiOrchestrator.chat(conversationHistory, systemPrompt);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  function resetConversation() {
    setMessages([welcomeMessage]);
    setInput("");
    setError(null);
  }

  return (
    <PageTransition>
      <Card className="flex flex-col overflow-hidden p-0" style={{ height: "calc(100dvh - 11rem)" }}>
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/6 p-2">
                <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary/80">Asistente IA</p>
                <p className="text-sm font-medium">Chat con contexto completo</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={resetConversation} className="gap-2 text-muted-foreground">
              <RefreshCw className="h-3.5 w-3.5" />
              Nueva conversación
            </Button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <MessageBubble key={index} message={message} />
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="rounded-[20px] rounded-bl-md border border-white/10 bg-white/[0.06]">
                  <TypingIndicator />
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                className="rounded-[16px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {error.includes("Ollama") ? (
                  <>
                    Ollama no está disponible. Asegúrate de que está corriendo en local con el modelo{" "}
                    <code className="font-mono text-rose-200">qwen3.5:4b</code>.
                  </>
                ) : (
                  error
                )}
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta... (Enter para enviar, Shift+Enter para nueva línea)"
                className="min-h-[44px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-0"
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={() => void sendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-11 w-11 shrink-0 rounded-2xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground/40">
              El historial no se guarda entre sesiones · Solo disponible con Ollama local
            </p>
          </div>
      </Card>
    </PageTransition>
  );
}
