"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function signUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    setMessage(error ? error.message : "Signup successful!");
  }

  async function signIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    setMessage(error ? error.message : "Signed in!");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">
          UmmahTube Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={signIn}
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-2 rounded mb-2"
        >
          Sign In
        </button>

        <button
          onClick={signUp}
          disabled={loading}
          className="w-full border py-2 rounded"
        >
          Sign Up
        </button>

        {message && (
          <p className="text-sm text-center mt-3">{message}</p>
        )}
      </div>
    </main>
  );
}
