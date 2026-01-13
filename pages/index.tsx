declare global {
  interface Window {
    cloudinary: any
  }
}

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [videos, setVideos] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [cloudinaryReady, setCloudinaryReady] = useState(false)

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  /* ---------------- LOAD VIDEOS ---------------- */
  const loadVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setVideos(data)
  }

  useEffect(() => {
    loadVideos()
  }, [])

  /* ---------------- CLOUDINARY ---------------- */
  useEffect(() => {
    if (window.cloudinary) {
      setCloudinaryReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
    script.async = true
    script.onload = () => setCloudinaryReady(true)
    document.body.appendChild(script)
  }, [])

  const openUploadWidget = () => {
    if (!cloudinaryReady) {
      alert('Uploader still loading, please wait…')
      return
    }

    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dzcha20pc',
        uploadPreset: 'unsigned_videos',
        resourceType: 'video',
        sources: ['local'],
      },
      async (_err: any, result: any) => {
        if (result?.event === 'success') {
          const title = prompt('Video title?') || ''
          const description = prompt('Description?') || ''
          const category =
            prompt('Category: Qur’an / Hadith / Daawah') || 'Daawah'

          await supabase.from('videos').insert({
            user_id: session.user.id,
            title,
            description,
            category,
            video_url: result.info.secure_url,
          })

          loadVideos()
          alert('Video uploaded')
        }
      }
    )
  }

  /* ---------------- AUTH ACTIONS ---------------- */
  const signIn = async () =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = async () => supabase.auth.signUp({ email, password })

  const signOut = async () => supabase.auth.signOut()

  /* ---------------- UI ---------------- */
  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 40,
        textAlign: 'center',
        background:
          'radial-gradient(circle at top, #fef9c3, #ecfeff), repeating-linear-gradient(45deg, rgba(168,85,247,.15) 0 2px, transparent 2px 28px)',
        animation: 'bg 20s linear infinite',
      }}
    >
      <style jsx global>{`
        @keyframes bg {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 400px 400px;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>

      {/* TOP BAR */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 30,
        }}
      >
        <h1 style={{ fontSize: 80, color: '#7c3aed' }}>UmmahTube</h1>

        {!session ? (
          <div>
            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={signIn}>Login</button>
            <button onClick={signUp}>Signup</button>
          </div>
        ) : (
          <button onClick={signOut}>Logout</button>
        )}
      </div>

      {/* UPLOAD */}
      {session && (
        <button
          onClick={openUploadWidget}
          disabled={!cloudinaryReady}
          style={{
            padding: '12px 20px',
            background: '#22c55e',
            color: 'white',
            borderRadius: 10,
            border: 'none',
            marginBottom: 30,
            cursor: 'pointer',
          }}
        >
          Upload Video
        </button>
      )}

      {/* SEARCH */}
      <input
        placeholder="Search videos…"
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '60%',
          padding: 12,
          borderRadius: 12,
          border: '2px solid #a855f7',
          marginBottom: 30,
        }}
      />

      {/* VIDEOS */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          overflowX: 'auto',
          justifyContent: 'center',
        }}
      >
        {videos
          .filter((v) =>
            v.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((v) => (
            <div
              key={v.id}
              style={{
                width: 300,
                background: '#ffffffcc',
                padding: 16,
                borderRadius: 16,
                animation: 'float 6s ease-in-out infinite',
              }}
            >
              <video src={v.video_url} controls width="100%" />
              <h3>{v.title}</h3>
              <p>{v.category}</p>
              <Link href={`/creator/${v.user_id}`}>View Creator</Link>
            </div>
          ))}
      </div>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 80,
          color: '#6b21a8',
          animation: 'float 4s ease-in-out infinite',
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

