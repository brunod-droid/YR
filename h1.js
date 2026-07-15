import { useState } from "react";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const password = String(e.currentTarget.password.value || "").trim();

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Wrong password");
      }

      localStorage.setItem("yr_auth", "true");
      window.location.href = "/";
    } catch (loginError) {
      setError(loginError.message || "Unable to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f5f5",
      padding: 20
    }}>
      <form onSubmit={handleLogin} style={{
        background: "#fff",
        padding: 40,
        borderRadius: 20,
        width: 340,
        boxShadow: "0 12px 35px rgba(0,0,0,0.08)"
      }}>
        <h1 style={{ margin: 0, color: "#0b4b3b" }}>Yves Rocher Hub</h1>

        <input
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
          style={{
            width: "100%",
            padding: 12,
            marginTop: 20,
            border: "1px solid #d9e5df",
            borderRadius: 10
          }}
        />

        {error ? (
          <p style={{ color: "#b42318", fontSize: 13, margin: "12px 0 0" }}>
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 20,
            padding: 12,
            border: 0,
            borderRadius: 10,
            background: "#0b4b3b",
            color: "#fff",
            fontWeight: 700,
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
