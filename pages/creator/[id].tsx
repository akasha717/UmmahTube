import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function CreatorPage() {
  const router = useRouter()
  const { id } = router.query

  const [profile, setProfile] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)
  const [bio, setBio] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  useEffect(() => {
    if (id) {
      loadProfile()
      loadVideos()
    }
  }, [id])

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setProfile(data)
      setBio(data.bio || '')
    }
  }

  const loadVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })

    if (data) setVideos(data)
  }

  const updateProfile = async () => {
    await supabase
      .from('profiles')
      .update({ bio })
      .eq('id', session.user.id)

    alert('Profile updated')
  }

  if (!profile) return null

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 40,
        textAlign: 'center',
        background:
          'radial-gradient(circle at top, #fefce8, #ecfeff), repeating-linear-gradient(45deg, rgba(168,85,247,.12) 0 2px, transparent 2px 26px)',
        animation: 'bgMove 20s linear infinite',
      }}
    >
      <style jsx global>{`
        @keyframes bgMove {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 400px 400px;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>

      {/* CREATOR CARD */}
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          background: '#ffffffcc',
          padding: 32,
          borderRadius: 20,
          boxShadow: '0 20px 40px rgba(0,0,0,.12)',
          animation: 'float 6s ease-in-out infinite',
        }}
      >
        <h1 style={{ fontSize: 48, color: '#7c3aed' }}>
          @{profile.username}
        </h1>

        <p style={{ marginTop: 10, color: '#14532d' }}>
          {profile.bio || 'No bio yet'}
        </p>

        {/* EDIT PROFILE */}
        {session?.user?.id === id && (
          <div style={{ marginTop: 20 }}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Edit your bio"
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 10,
                border: '2px solid #a855f7',
              }}
            />
            <br />
            <button
              onClick={updateProfile}
              style={{
                marginTop: 10,
                padding: '10px 18px',
                background: '#22c55e',
                color: 'white',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Save Profile
            </button>
          </div>
        )}
      </div>

      {/* VIDEOS */}
      <h2 style={{ marginTop: 60, color: '#ca8a04' }}>
        Videos by Creator
      </h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 24,
          flexWrap: 'wrap',
          marginTop: 30,
        }}
      >
        {videos.map((v) => (
          <div
            key={v.id}
            style={{
              width: 300,
              background: '#f0fdf4',
              padding: 16,
              borderRadius: 16,
            }}
          >
            <video src={v.video_url} controls width="100%" />
            <h3 style={{ color: '#166534' }}>{v.title}</h3>
            <p style={{ fontSize: 14 }}>{v.category}</p>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 80,
          paddingTop: 30,
          textAlign: 'center',
          animation: 'float 4s ease-in-out infinite',
          color: '#6b21a8',
        }}
      >
        <p>
          Supported by <strong>Suleiman Maumo</strong>
        </p>
        <p>© {new Date().getFullYear()} UmmahTube</p>
      </footer>
    </main>
  )
}
