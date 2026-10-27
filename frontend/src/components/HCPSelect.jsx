import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search } from "lucide-react";
import { fetchHcps } from "../features/interactions/interactionsSlice";

export default function HCPSelect({ value, onChange }) {
  const dispatch = useDispatch();
  const hcps = useSelector((state) => state.interactions.hcps);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchHcps());
  }, [dispatch]);

  const selected = hcps.find((h) => h.id === value);
  const filtered = hcps.filter((h) => h.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <Search size={15} style={{ position: "absolute", left: 10, top: 12, color: "var(--ink-faint)" }} />
        <input
          className="input"
          style={{ paddingLeft: 32 }}
          placeholder="Search or select HCP..."
          value={open ? query : selected?.name || ""}
          onFocus={() => setOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
      </div>
      {open && (
        <div
          className="card"
          style={{
            position: "absolute",
            zIndex: 20,
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            maxHeight: 220,
            overflowY: "auto",
            padding: 4,
          }}
        >
          {filtered.length === 0 && (
            <div style={{ padding: 10, fontSize: 13, color: "var(--ink-faint)" }}>No HCPs found.</div>
          )}
          {filtered.map((h) => (
            <div
              key={h.id}
              onMouseDown={() => {
                onChange(h.id);
                setQuery("");
                setOpen(false);
              }}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 14,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--primary-soft)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ fontWeight: 600 }}>{h.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                {h.specialty} · {h.institution}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
