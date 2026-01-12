import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'

type Video = {
  id: number
  title: string
  description: string
  video_url: string
  category: string
}

type Profile = {
  id: string
  username: string | null
  email: string | null
}

export default function CreatorProfile() {
  const router = useRouter()
  const { id } = router.query

  const [profile, setProfile] = useState<Profile | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  // LOAD CREATOR PROFILE
  useEffect(() => {
    if (!id) return

    const loadProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, email')
        .eq('id', id)
        .single()

      if (data) setProfile(data)
    }

    const loadVideos = async () => {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', id)
        .order('id', { ascending: false })

      if (data) setVideos(data)
      setLoading(false)
    }

    loadProfile()
    loadVideos()
  }, [id])

  if (loading) {
    return (
      <main style={{ color: 'white', padding: 40 }}>
        Loading creator profile…
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 40,
        color: '#e5e7eb',
        fontFamily: 'system-ui',
        background:
          'radial-gradient(circle at top, #020617, #000), repeating-linear-gradient(45deg, rgba(34,211,238,.05) 0 2px, transparent 2px 24px)',
      }}
    >
      {/* BACK */}
      <Link href="/">
        <span style={{ color: '#38bdf8', cursor: 'pointer' }}>
          ← Back to UmmahTube
        </span>
      </Link>

      {/* CREATOR INFO */}
      <div
        style={{
          marginTop: 30,
          marginBottom: 50,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 56,
            color: '#22d3ee',
            marginBottom: 10,
          }}
        >
          {profile?.username || 'Creator'}
        </h1>

        {profile?.email && (
          <p style={{ opacity: 0.7 }}>{profile.email}</p>
        )}

        <p style={{ marginTop: 10, color: '#94a3b8' }}>
          {videos.length} video{videos.length !== 1 && 's'}
        </p>
      </div>

      {/* VIDEOS */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        {videos.map((v) => (
          <div
            key={v.id}
            style={{
              width: 300,
              background: '#020617',
              borderRadius: 16,
              padding: 14,
              boxShadow: '0 0 20px rgba(34,211,238,0.08)',
            }}
          >
            <video
              src={v.video_url}
              controls
              style={{ width: '100%', borderRadius: 10 }}
            />

            <h3 style={{ marginTop: 10 }}>{v.title}</h3>
            <p style={{ fontSize: 14, opacity: 0.8 }}>
              {v.description}
            </p>

            <span
              style={{
                display: 'inline-block',
                marginTop: 6,
                color: '#22d3ee',
                fontSize: 13,
              }}
            >
              {v.category}
            </span>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 80,
          textAlign: 'center',
          animation: 'fade 3s infinite alternate',
        }}
      >
        <p>
          Supported by{' '}
          <span style={{ color: '#22d3ee' }}>Suleiman Maumo</span>
        </p>
        <p style={{ fontSize: 14 }}>
          © {new Date().getFullYear()} UmmahTube
        </p>

        <style>{`
          @keyframes fade {
            from { opacity: .5 }
            to { opacity: 1 }
          }
        `}</style>
      </footer>
    </main>
  )
}
