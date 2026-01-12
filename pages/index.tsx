declare global {
  interface Window {
    cloudinary: any
  }
}

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

type Video = {
  id: number
  title: string
  description: string
  video_url: string
  category: string
  user_id: string
  likes: number
}

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [search, setSearch] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Qur’an')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // AUTH
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data } = supabase.auth.onAuthStateChange((_e, s) =>
      setSession(s)
    )

    return () => data.subscription.unsubscribe()
  }, [])

  // CLOUDINARY
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
    s.async = true
    document.body.appendChild(s)
  }, [])

  // LOAD VIDEOS
  const loadVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('id', { ascending: false })

    if (data) setVideos(data)
  }

  useEffect(() => {
    loadVideos()
  }, [])

  // UPLOAD
  const openUpload = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dzcha20pc',
        uploadPreset: 'unsigned_videos',
        resourceType: 'video',
      },
      async (_: any, result: any) => {
        if (result?.event === 'success') {
          await supabase.from('videos').insert({
            title,
            description,
            category,
            video_url: result.info.secure_url,
            user_id: session.user.id,
            likes: 0,
          })

          setTitle('')
          setDescription('')
          loadVideos()
        }
      }
    )
  }

  const likeVideo = async (id: number, likes: number) => {
    await supabase.from('videos').update({ likes: likes + 1 }).eq('id', id)
    loadVideos()
  }

  const filtered = videos.filter((v) =>
    v.title.toLowerCase().includes(search.toLowerCase())
  )

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
      {/* TOP RIGHT AUTH */}
      <div style={{ position: 'relative', height: 60 }}>
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: 10 }}>
          {!session ? (
            <>
              <input
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: 6, borderRadius: 6 }}
              />
              <input
                placeholder="Password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                style={{ padding: 6, borderRadius: 6 }}
              />
              <button onClick={() => supabase.auth.signInWithPassword({ email, password })}>
                Login
              </button>
              <button onClick={() => supabase.auth.signUp({ email, password })}>
                Sign Up
              </button>
            </>
          ) : (
            <button onClick={() => supabase.auth.signOut()}>Logout</button>
          )}
        </div>
      </div>

      {/* TITLE */}
      <h1
        style={{
          fontSize: 80,
          textAlign: 'center',
          color: '#22d3ee',
          marginBottom: 10,
        }}
      >
        UmmahTube
      </h1>

      <p style={{ textAlign: 'center', marginBottom: 30 }}>
        A halal home for Islamic videos
      </p>

      {/* SEARCH */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <input
          placeholder="Search videos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: 12,
            width: 300,
            borderRadius: 20,
            border: 'none',
          }}
        />
      </div>

      {/* UPLOAD */}
      {session && (
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          /><br />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          /><br />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Qur’an</option>
            <option>Hadith</option>
            <option>Da’wah</option>
          </select><br />
          <button onClick={openUpload}>Upload Video</button>
        </div>
      )}

      {/* VIDEOS */}
      <div style={{ display: 'flex', gap: 20, overflowX: 'auto' }}>
        {filtered.map((v) => (
          <div
            key={v.id}
            style={{
              minWidth: 280,
              background: '#020617',
              borderRadius: 14,
              padding: 12,
            }}
          >
            <video src={v.video_url} controls style={{ width: '100%', borderRadius: 10 }} />
            <h3>{v.title}</h3>
            <p>{v.description}</p>
            <p style={{ color: '#22d3ee' }}>{v.category}</p>

            <Link href={`/creator/${v.user_id}`}>
              <span style={{ cursor: 'pointer', color: '#38bdf8' }}>
                View Creator
              </span>
            </Link>

            <br />
            <button onClick={() => likeVideo(v.id, v.likes)}>❤️ {v.likes}</button>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 80,
          textAlign: 'center',
          animation: 'pulse 3s infinite alternate',
        }}
      >
        <p>
          Supported by <span style={{ color: '#22d3ee' }}>Suleiman Maumo</span>
        </p>
        <p>© {new Date().getFullYear()} UmmahTube</p>

        <style>{`
          @keyframes pulse {
            from { opacity: .6 }
            to { opacity: 1 }
          }
        `}</style>
      </footer>
    </main>
  )
}
