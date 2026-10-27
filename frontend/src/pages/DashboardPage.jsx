import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, MessageSquareText, TrendingUp, Plus } from "lucide-react";
import { fetchHcps, fetchInteractions } from "../features/interactions/interactionsSlice";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card"
      style={{ padding: 20, display: "flex", alignItems: "center", gap: 14 }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: accent,
        }}
      >
        <Icon size={20} color="var(--primary)" />
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{label}</div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { hcps, items } = useSelector((state) => state.interactions);

  useEffect(() => {
    dispatch(fetchHcps());
    dispatch(fetchInteractions());
  }, [dispatch]);

  const positiveCount = items.filter((i) => i.sentiment === "Positive").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24 }}>Dashboard</h1>
          <p style={{ color: "var(--ink-muted)", fontSize: 14, marginTop: 4 }}>
            A snapshot of your HCP engagement activity.
          </p>
        </div>
        <Link to="/log-interaction" className="btn btn-primary">
          <Plus size={16} /> Log Interaction
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard icon={Users} label="Tracked HCPs" value={hcps.length} accent="var(--primary-soft)" />
        <StatCard icon={MessageSquareText} label="Logged Interactions" value={items.length} accent="var(--accent-soft)" />
        <StatCard icon={TrendingUp} label="Positive Sentiment" value={positiveCount} accent="var(--accent-soft)" />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", fontWeight: 700 }}>
          Recent Interactions
        </div>
        <div>
          {items.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "var(--ink-faint)" }}>
              No interactions logged yet. Start by logging your first HCP visit.
            </div>
          )}
          {items.slice(0, 8).map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{item.interaction_type}</div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--ink-muted)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 480,
                  }}
                >
                  {item.topics_discussed || "No summary available."}
                </div>
              </div>
              <span
                className={`badge badge-${item.sentiment?.toLowerCase()}`}
              >
                {item.sentiment}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
