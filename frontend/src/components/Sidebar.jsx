import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, MessageSquarePlus, LogOut, Activity } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import PulseLine from "./PulseLine";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/log-interaction", label: "Log Interaction", icon: MessageSquarePlus, end: false },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <aside
      style={{
        width: 250,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--surface)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        gap: 32,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px" }}>
        <Activity size={22} color="var(--primary)" />
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, lineHeight: 1 }}>Vitals CRM</div>
          <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>HCP Interaction Console</div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              color: isActive ? "var(--primary)" : "var(--ink-muted)",
              background: isActive ? "var(--primary-soft)" : "transparent",
              transition: "background 150ms ease, color 150ms ease",
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <PulseLine width={90} height={20} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.full_name || "Field Rep"}
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-faint)" }}>{user?.role?.replace("_", " ") || ""}</div>
          </div>
          <button
            className="btn btn-ghost"
            style={{ padding: 8 }}
            title="Log out"
            onClick={() => dispatch(logout())}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
