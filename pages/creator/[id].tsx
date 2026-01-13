import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

export default function CreatorPage() {
  const router = useRouter()
  const { id } = router.query

  const [profile, setProfile] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  /* ---------- LOAD CREATOR ---------- */
  useEffect(() => {
    if (!id) return

    const loadCreator = async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      const { data: videoData } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })

      setProfile(profileData)
      setVideos(videoData || [])
      setLoading(false)
    }

    loadCreator()
  }, [id])

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: 80 }}>Loading…</p>
  }

  if (!profile) {
    return <p style={{ textAlign: 'center', marginTop: 80 }}>Creator not found</p>
  }

  return (
    <main className="page">
      <style jsx global>{`
        .page {
          min-height: 100vh;
          padding: 40px;
          background: linear-gradient(
            -45deg,
            #fef9c3,
            #dcfce7,
            #ede9fe,
            #f0fdfa
          );
          background-size: 400% 400%;
          animation: gradient 18s ease infinite;
          text-align: center;
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .card {
          max-width: 720px;
          margin: 0 auto 40px;
          padding: 30px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(14px);
          border-radius: 24px;
          box-shadow: 0 30px 60px rgba(124, 58, 237, 0.25);
        }

        .videos {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          justify-content: center;
          padding-bottom: 20px;
        }

        .video {
          width: 300px;
          padding: 16px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.65);
          box-shadow: 0 20px 40px rgba(34, 197, 94, 0.35);
        }

        footer {
          margin-top: 80px;
          color: #6b21a8;
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>

      {/* CREATOR CARD */}
      <div className="card">
        <h1 style={{ fontSize: 56, color: '#7c3aed' }}>
          {profile.username || 'Creator'}
        </h1>

        {profile.bio && (
          <p style={{ marginTop: 10, fontSize: 18 }}>{profile.bio}</p>
        )}

        <Link href="/" style={{ color: '#22c55e', fontWeight: 600 }}>
          ← Back to UmmahTube
        </Link>
      </div>

      {/* VIDEOS */}
      <div className="videos">
        {videos.length === 0 && <p>No videos yet</p>}

        {videos.map((v) => (
          <div key={v.id} className="video">
            <video src={v.video_url} controls width="100%" />
            <h3>{v.title}</h3>
            <p>{v.category}</p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer>
        <p>
          Supported by <strong>Suleiman Maumo</strong>
        </p>
        <p>© {new Date().getFullYear()} UmmahTube</p>
      </footer>
    </main>
  )
}
