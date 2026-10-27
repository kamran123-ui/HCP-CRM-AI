import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { signup } from "../features/auth/authSlice";

export default function SignupPage() {
  const dispatch = useDispatch();
  const { status, error, token } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "field_rep" });

  if (token) return <Navigate to="/" replace />;

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signup(form));
  };

  return (
    <div style={authPageStyle}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="card"
        style={{ width: 420, padding: 36 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <Activity size={26} color="var(--primary)" />
          <h1 style={{ fontSize: 22 }}>Create your account</h1>
        </div>
        <p style={{ color: "var(--ink-muted)", fontSize: 14, marginBottom: 24 }}>
          Set up access for a field representative or manager.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="field-label">Full name</label>
            <input
              className="input"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
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
              minLength={8}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="field_rep">Field Representative</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && (
            <div style={{ color: "var(--danger)", fontSize: 13, background: "var(--danger-soft)", padding: 10, borderRadius: 8 }}>
              {typeof error === "string" ? error : "Sign up failed."}
            </div>
          )}

          <button className="btn btn-primary" type="submit" disabled={status === "loading"} style={{ marginTop: 4 }}>
            {status === "loading" ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--ink-muted)" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>Sign in</Link>
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
