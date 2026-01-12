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

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })

    if (data) setVideos(data)
  }

  const openUploadWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dzcha20pc',
        uploadPreset: 'unsigned_videos',
        resourceType: 'video',
      },
      async (_err: any, result: any) => {
        if (result.event === 'success') {
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
        }
      }
    )
  }

  const signIn = async () =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = async () => supabase.auth.signUp({ email, password })

  const signOut = async () => supabase.auth.signOut()

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 40,
        background:
          'radial-gradient(circle at top, #020617, #000), repeating-linear-gradient(45deg, rgba(34,211,238,.05) 0 2px, transparent 2px 24px)',
        color: '#e5e7eb',
      }}
    >
      {/* TOP BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 72, color: '#22d3ee' }}>UmmahTube</h1>

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

      {session && (
        <button onClick={openUploadWidget} style={{ marginBottom: 20 }}>
          Upload Video
        </button>
      )}

      <input
        placeholder="Search videos…"
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', marginBottom: 20 }}
      />

      {/* VIDEOS ROW */}
      <div style={{ display: 'flex', gap: 20, overflowX: 'auto' }}>
        {videos
          .filter((v) =>
            v.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((v) => (
            <div key={v.id} style={{ width: 320 }}>
              <video src={v.video_url} controls width="100%" />
              <h3>{v.title}</h3>
              <p>{v.description}</p>
              <span>{v.category}</span>
              <br />
              <Link href={`/creator/${v.user_id}`}>View Creator</Link>
            </div>
          ))}
      </div>

      <footer
        style={{
          marginTop: 80,
          textAlign: 'center',
          animation: 'pulse 3s infinite',
        }}
      >
        Supported by <strong>Suleiman Maumo</strong>
        <br />© {new Date().getFullYear()} UmmahTube
      </footer>
    </main>
  )
}
