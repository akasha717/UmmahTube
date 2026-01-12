declare global {
  interface Window {
    cloudinary: any
  }
}

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [videos, setVideos] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  // AUTH
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_e, s) => setSession(s)
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  // LOAD VIDEOS
  useEffect(() => {
    loadVideos()
  }, [category])

  const loadVideos = async () => {
    let query = supabase
      .from('videos')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })

    if (category !== 'All') query = query.eq('category', category)

    const { data } = await query
    setVideos(data || [])
  }

  // CLOUDINARY
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
    document.body.appendChild(script)
  }, [])

  const uploadVideo = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dzcha20pc',
        uploadPreset: 'unsigned_videos',
        resourceType: 'video',
      },
      async (_: any, result: any) => {
        if (result.event === 'success') {
          const title = prompt('Video title') || ''
          const description = prompt('Description') || ''
          const category = prompt('Category: Quran / Hadith / Daawah') || 'Daawah'

          await supabase.from('videos').insert({
            title,
            description,
            category,
            video_url: result.info.secure_url,
            user_id: session.user.id,
          })

          loadVideos()
        }
      }
    )
  }

  return (
    <main style={styles.main}>
      <h1 style={styles.logo}>🟢 UmmahTube</h1>

      {!session && (
        <div style={styles.authBox}>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input
            type="password"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={() => supabase.auth.signInWithPassword({ email, password })}>
            Login
          </button>
          <button onClick={() => supabase.auth.signUp({ email, password })}>
            Sign up
          </button>
        </div>
      )}

      {session && (
        <>
          <button onClick={() => supabase.auth.signOut()}>Logout</button>
          <button onClick={uploadVideo} style={styles.upload}>
            Upload Video
          </button>
        </>
      )}

      <input
        placeholder="Search videos..."
        onChange={e => setSearch(e.target.value)}
        style={styles.search}
      />

      <div style={styles.categories}>
        {['All', "Qur'an", 'Hadith', 'Daawah'].map(c => (
          <button key={c} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div style={styles.row}>
        {videos
          .filter(v => v.title.toLowerCase().includes(search.toLowerCase()))
          .map(v => (
            <div key={v.id} style={styles.card}>
              <video src={v.video_url} controls width="260" />
              <h3>{v.title}</h3>
              <p>{v.category}</p>
              <Link href={`/creator/${v.user_id}`}>
                @{v.profiles?.username}
              </Link>
            </div>
          ))}
      </div>

      <footer style={styles.footer}>
        Supported by Suleiman Maumo
      </footer>
    </main>
  )
}

const styles: any = {
  main: {
    background: 'linear-gradient(135deg,#064e3b,#0f766e)',
    minHeight: '100vh',
    color: '#fff',
    padding: 30,
  },
  logo: { fontSize: 48, marginBottom: 20 },
  authBox: { maxWidth: 300 },
  upload: { margin: 10, padding: 10, background: '#22c55e' },
  search: { margin: '20px 0', padding: 10, width: '100%' },
  categories: { display: 'flex', gap: 10 },
  row: { display: 'flex', gap: 20, overflowX: 'auto' },
  card: { minWidth: 280 },
  footer: { marginTop: 50, opacity: 0.6 },
}
