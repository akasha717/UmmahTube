import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Logged in successfully");
    }

    setLoading(false);
  };

  const handleSignup = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Account created successfully");
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h1>UmmahTube Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "100%" }}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "1rem", width: "100%" }}
      />

      <button onClick={handleLogin} disabled={loading}>
        Login
      </button>

      <button onClick={handleSignup} disabled={loading} style={{ marginLeft: "1rem" }}>
        Sign Up
      </button>

      {message && <p>{message}</p>}
    </main>
  );
}
