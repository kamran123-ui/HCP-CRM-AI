import React, { useState } from "react";
import InteractionForm from "../components/InteractionForm";
import ChatPanel from "../components/ChatPanel";

export default function LogInteractionPage() {
  const [selectedHcpId, setSelectedHcpId] = useState(null);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24 }}>Log HCP Interaction</h1>
        <p style={{ color: "var(--ink-muted)", fontSize: 14, marginTop: 4 }}>
          Use the structured form, or describe what happened to the AI Assistant on the right.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "start" }}>
        <InteractionForm />
        <div style={{ height: "calc(100vh - 200px)" }}>
          <ChatPanel hcpId={selectedHcpId} />
        </div>
      </div>
    </div>
  );
}
