import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { login } from "../features/auth/authSlice";
import PulseLine from "../components/PulseLine";

export default function LoginPage() {
  const dispatch = useDispatch();
  const { status, error, token } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "rep@demo.io", password: "Demo@1234" });

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div style={authPageStyle}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="card"
        style={{ width: 400, padding: 36 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Activity size={26} color="var(--primary)" />
          <h1 style={{ fontSize: 22 }}>Vitals CRM</h1>
        </div>
        <p style={{ color: "var(--ink-muted)", fontSize: 14, marginBottom: 24 }}>
          Sign in to log and review HCP interactions.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="field-label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Password</label>
            <input
              className="input"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && (
            <div style={{ color: "var(--danger)", fontSize: 13, background: "var(--danger-soft)", padding: 10, borderRadius: 8 }}>
              {typeof error === "string" ? error : "Login failed. Please check your details."}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={status === "loading"} style={{ marginTop: 4 }}>
            {status === "loading" ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--ink-muted)" }}>
          New here? <Link to="/signup" style={{ color: "var(--primary)", fontWeight: 600 }}>Create an account</Link>
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
          <PulseLine width={80} height={20} />
        </div>
      </motion.div>
    </div>
  );
}

const authPageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "radial-gradient(circle at 20% 20%, var(--primary-soft), transparent 45%), radial-gradient(circle at 80% 80%, var(--accent-soft), transparent 45%), var(--bg)",
};
