import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
    const [user, setUser] = useState<any>(null);

  useEffect(() => {
  // Get current user on load
  supabase.auth.getUser().then(({ data }) => {
    setUser(data.user);
  });

  // Listen for login/logout changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);


  return (
    <main style={{ padding: "2rem" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1>UmmahTube</h1>
        {user ? (
  <button
    onClick={async () => {
      await supabase.auth.signOut();
      location.reload();
    }}
  >
    Logout
  </button>
) : (
  <Link href="/login">Login</Link>
)}
{session && (
  <button
    style={{
      padding: '10px 16px',
      marginTop: '12px',
      backgroundColor: '#0f766e',
      color: 'white',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer'
    }}
  >
    Upload Video
  </button>
)}

      </header>

      <p>Halal video platform for the Ummah</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        <div>Video 1</div>
        <div>Video 2</div>
        <div>Video 3</div>
      </div>

      <footer style={{ marginTop: "4rem" }}>
        Supported by Suleiman Maumo
      </footer>
    </main>
  );
}





