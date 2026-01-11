import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/router";

export default function Upload() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return <p style={{ padding: "2rem" }}>Checking login…</p>;
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Upload Video</h1>
      <p>You must be logged in to upload.</p>
    </main>
  );
}
