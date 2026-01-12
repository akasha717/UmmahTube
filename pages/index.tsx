declare global {
  interface Window {
    cloudinary: any
  }
}

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  category: string
  likes: number
}

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Quran')

  const [videos, setVideos] = useState<Video[]>([])
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_e, session) => {
        setSession(session)
      })

    return () => subscription.unsubscribe()
  }, [])

  // Cloudinary
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
    s.async = true
    document.body.appendChild(s)
  }, [])

  // Load videos + likes
  const loadVideos = async () => {
    const { data: vids } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (!vids) return

    const { data: likes } = await supabase
      .from('video_likes')
      .select('video_id')

    const likeCount: Record<string, number> = {}
    likes?.forEach(l => {
      likeCount[l.video_id] = (likeCount[l.video_id] || 0) + 1
    })

    setVideos(
      vids.map(v => ({
        ...v,
        likes: likeCount[v.id] || 0,
      }))
    )

    if (session) {
      const { data: myLikes } = await supabase
        .from('video_likes')
        .select('video_id')
        .eq('user_id', session.user.id)

      const likedMap: any = {}
      myLikes?.forEach(l => (likedMap[l.video_id] = true))
      setLiked(likedMap)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [session])

  // Auth actions
  const signIn = async () => {
    await supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async () => {
    await supabase.auth.signUp({ email, password })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Upload
  const openUploadWidget = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dzcha20pc',
        uploadPreset: 'unsigned_videos',
        resourceType: 'video',
      },
      async (_e: any, result: any) => {
        if (result?.event === 'success') {
          await supabase.from('videos').insert({
            user_id: session.user.id,
            title,
            description,
            category,
            video_url: result.info.secure_url,
          })
          setTitle('')
          setDescription('')
          loadVideos()
        }
      }
    )
  }

  // Like / Unlike
  const toggleLike = async (videoId: string) => {
    if (!session) return

    if (liked[videoId]) {
      await supabase
        .from('video_likes')
        .delete()
        .eq('video_id', videoId)
        .eq('user_id', session.user.id)
    } else {
      await supabase.from('video_likes').insert({
        video_id: videoId,
        user_id: session.user.id,
      })
    }
    loadVideos()
  }

  return (
    <div style={{ background: '#f0fdf4', minHeight: '100vh' }}>
      <header style={header}>
        <h1>🕌 UmmahTube</h1>
        <p>Halal videos for the Ummah</p>
      </header>

      <main style={{ padding: 20 }}>
        {!session && (
          <div style={card}>
            <input style={input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input style={input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button style={btn} onClick={signIn}>Login</button>
            <button style={btnAlt} onClick={signUp}>Sign up</button>
          </div>
        )}

        {session && (
          <div style={card}>
            <h3>Upload Video</h3>
            <input style={input} placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea style={input} placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <select style={input} value={category} onChange={e => setCategory(e.target.value)}>
              <option>Quran</option>
              <option>Hadith</option>
              <option>Daawah</option>
            </select>
            <button style={btn} onClick={openUploadWidget}>Upload</button>
            <button style={btnAlt} onClick={signOut}>Logout</button>
          </div>
        )}

        <h2 style={{ margin: '30px 0' }}>📺 Videos</h2>

        <div style={grid}>
          {videos.map(v => (
            <div key={v.id} style={videoCard}>
              <span style={badge}>{v.category}</span>
              <h4>{v.title}</h4>
              <video controls style={{ width: '100%', borderRadius: 12 }}>
                <source src={v.video_url} />
              </video>
              <p style={{ fontSize: 14 }}>{v.description}</p>

              <button style={likeBtn} onClick={() => toggleLike(v.id)}>
                ❤️ {v.likes}
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer style={footer}>
        Supported by Suleiman Maumo
      </footer>
    </div>
  )
}

/* 🎨 STYLES */
const header = {
  background: 'linear-gradient(90deg, #16a34a, #22c55e)',
  color: 'white',
  padding: 30,
  textAlign: 'center' as const,
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: 20,
}

const card = {
  background: 'white',
  padding: 20,
  borderRadius: 16,
  boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
  marginBottom: 30,
}

const videoCard = {
  ...card,
}

const badge = {
  background: '#fde68a',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  display: 'inline-block',
  marginBottom: 6,
}

const input = {
  width: '100%',
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: '1px solid #ccc',
}

const btn = {
  background: '#16a34a',
  color: 'white',
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  marginRight: 8,
}

const btnAlt = {
  background: '#e0f2fe',
  color: '#0369a1',
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
}

const likeBtn = {
  background: '#fee2e2',
  color: '#991b1b',
  border: 'none',
  borderRadius: 999,
  padding: '6px 12px',
  cursor: 'pointer',
  marginTop: 8,
}

const footer = {
  textAlign: 'center' as const,
  padding: 20,
  opacity: 0.7,
}
