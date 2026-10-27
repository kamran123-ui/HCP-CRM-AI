import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, Wrench } from "lucide-react";
import { pushUserMessage, sendChatMessage } from "../features/chat/chatSlice";
import PulseLine from "./PulseLine";

export default function ChatPanel({ hcpId }) {
  const dispatch = useDispatch();
  const { messages, status, conversationId } = useSelector((state) => state.chat);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    dispatch(pushUserMessage(text));
    dispatch(sendChatMessage({ message: text, hcpId, history, conversationId }));
    setDraft("");
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
        <Bot size={18} color="var(--primary)" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>AI Assistant</div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>Log interactions via chat</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <PulseLine active={status === "loading"} width={48} height={16} />
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 13, color: "var(--ink-faint)", lineHeight: 1.6 }}>
            Log interaction details here (e.g. "Met Dr. Sharma, discussed Product X efficacy, positive
            sentiment, shared brochure") or ask for help.
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "88%",
              }}
            >
              <div
                style={{
                  padding: "10px 13px",
                  borderRadius: 14,
                  fontSize: 14,
                  lineHeight: 1.5,
                  background: m.role === "user" ? "var(--primary)" : "var(--primary-soft)",
                  color: m.role === "user" ? "#fff" : "var(--ink)",
                  borderBottomRightRadius: m.role === "user" ? 4 : 14,
                  borderBottomLeftRadius: m.role === "user" ? 14 : 4,
                }}
              >
                {m.content}
              </div>
              {m.toolCalls?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {m.toolCalls.map((tc, i) => (
                    <span
                      key={i}
                      className="badge badge-neutral"
                      style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
                      title={tc.output}
                    >
                      <Wrench size={11} /> {tc.tool}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {status === "loading" && (
          <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>Assistant is thinking...</div>
        )}
      </div>

      <form onSubmit={handleSend} style={{ display: "flex", gap: 8, padding: 14, borderTop: "1px solid var(--border)" }}>
        <input
          className="input"
          placeholder="Describe interaction..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="btn btn-primary" type="submit" disabled={status === "loading" || !draft.trim()}>
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
