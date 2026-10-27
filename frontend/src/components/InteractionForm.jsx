import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { createInteraction } from "../features/interactions/interactionsSlice";
import HCPSelect from "./HCPSelect";

const emptyForm = {
  hcp_id: "",
  interaction_type: "Meeting",
  interaction_datetime: new Date().toISOString().slice(0, 16),
  attendees: "",
  topics_discussed: "",
  materials_shared: "",
  samples_distributed: "",
  sentiment: "Neutral",
  outcomes: "",
  follow_up_actions: "",
};

const toList = (s) => s.split(",").map((v) => v.trim()).filter(Boolean);

export default function InteractionForm() {
  const dispatch = useDispatch();
  const saveStatus = useSelector((state) => state.interactions.saveStatus);
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.hcp_id) return;
    const payload = {
      ...form,
      interaction_datetime: new Date(form.interaction_datetime).toISOString(),
      attendees: toList(form.attendees),
      materials_shared: toList(form.materials_shared),
      samples_distributed: toList(form.samples_distributed),
      follow_up_actions: toList(form.follow_up_actions),
    };
    const result = await dispatch(createInteraction(payload));
    if (createInteraction.fulfilled.match(result)) {
      setSaved(true);
      setForm({ ...emptyForm, hcp_id: form.hcp_id });
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
      <h3 style={{ fontSize: 16 }}>Interaction Details</h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label className="field-label">HCP Name</label>
          <HCPSelect value={form.hcp_id} onChange={(id) => setForm({ ...form, hcp_id: id })} />
        </div>
        <div>
          <label className="field-label">Interaction Type</label>
          <select className="input" value={form.interaction_type} onChange={update("interaction_type")}>
            {["Meeting", "Call", "Email", "Conference", "Sample Drop"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Date &amp; Time</label>
          <input
            className="input"
            type="datetime-local"
            value={form.interaction_datetime}
            onChange={update("interaction_datetime")}
          />
        </div>
        <div>
          <label className="field-label">Attendees</label>
          <input className="input" placeholder="Comma separated names" value={form.attendees} onChange={update("attendees")} />
        </div>
      </div>

      <div>
        <label className="field-label">Topics Discussed</label>
        <textarea className="input" rows={3} value={form.topics_discussed} onChange={update("topics_discussed")} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label className="field-label">Materials Shared</label>
          <input className="input" placeholder="Comma separated" value={form.materials_shared} onChange={update("materials_shared")} />
        </div>
        <div>
          <label className="field-label">Samples Distributed</label>
          <input className="input" placeholder="Comma separated" value={form.samples_distributed} onChange={update("samples_distributed")} />
        </div>
      </div>

      <div>
        <label className="field-label">Observed / Inferred HCP Sentiment</label>
        <div style={{ display: "flex", gap: 10 }}>
          {["Positive", "Neutral", "Negative"].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setForm({ ...form, sentiment: s })}
              className={`badge badge-${s.toLowerCase()}`}
              style={{
                cursor: "pointer",
                border: form.sentiment === s ? "2px solid var(--primary)" : "2px solid transparent",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="field-label">Outcomes</label>
        <textarea className="input" rows={2} value={form.outcomes} onChange={update("outcomes")} />
      </div>

      <div>
        <label className="field-label">Follow-up Actions</label>
        <textarea
          className="input"
          rows={2}
          placeholder="Comma separated next steps"
          value={form.follow_up_actions}
          onChange={update("follow_up_actions")}
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        type="submit"
        className="btn btn-primary"
        disabled={saveStatus === "loading" || !form.hcp_id}
      >
        {saveStatus === "loading" ? "Saving..." : saved ? "Saved ✓" : "Save Interaction"}
      </motion.button>
    </form>
  );
}
