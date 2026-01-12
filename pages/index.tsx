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
  creator_email: string
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
  const [search, setSearch] = useState('')

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

    const enriched = await Promise.all(
      vids.map(async v => {
        const { data: user } = await supabase
          .from('auth.users')
          .select('email')
          .eq('id', v.user_id)
          .single()

        return {
          ...v,
          creator_email: user?.email || 'Unknown',
          likes: likeCount[v.id] || 0,
        }
      })
    )

    setVideos(enriched)

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

  // Auth
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

  // Like
  const toggleLike = async (videoId: string) => {
    if (!session) return

    if (liked[videoId]) {
      await supabase.from('video_likes')
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

  const filtered = videos.filter(v =>
    `${v.title} ${v.description} ${v.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div style={app}>
      <header style={header}>
        <h1 style={logo}>🕌 UMMAHTUBE</h1>
        <p style={tagline}>Islamic knowledge • Da‘awah • Unity</p>

        <input
          style={searchBox}
          placeholder="🔍 Search Qur’an, Hadith, Da‘awah..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </header>

      <main style={{ padding: 30 }}>
        {!session && (
          <div style={card}>
            <input style={input} placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input style={input} type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
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

        <div style={grid}>
          {filtered.map(v => (
            <div key={v.id} style={videoCard}>
              <span style={badge}>{v.category}</span>
              <h3>{v.title}</h3>
              <p style={creator}>
  👤{' '}
  <a
    href={`/creator/${v.user_id}`}
    style={{ color: '#38bdf8', textDecoration: 'none' }}
  >
    {v.creator_email}
  </a>
</p>
              <video controls style={{ width: '100%', borderRadius: 12 }}>
                <source src={v.video_url} />
              </video>
              <p>{v.description}</p>
              <button style={likeBtn} onClick={() => toggleLike(v.id)}>
                ❤️ {v.likes}
              </button>
            </div>
          ))}
        </div>
      </main>

      <footer style={footer}>
        © UmmahTube • Built by Suleiman Maumo
      </footer>
    </div>
  )
}

/* 🎨 THEME */
const app = {
  background: 'linear-gradient(180deg, #020617, #064e3b)',
  minHeight: '100vh',
  color: '#ecfeff',
}

const header = {
  textAlign: 'center' as const,
  padding: 40,
}

const logo = {
  fontSize: 52,
  letterSpacing: 3,
  color: '#22c55e',
}

const tagline = {
  fontSize: 18,
  opacity: 0.9,
}

const searchBox = {
  marginTop: 20,
  padding: 14,
  width: '80%',
  maxWidth: 500,
  borderRadius: 999,
  border: 'none',
  fontSize: 16,
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: 24,
}

const card = {
  background: '#022c22',
  padding: 24,
  borderRadius: 20,
  marginBottom: 30,
}

const videoCard = {
  background: '#022c22',
  padding: 20,
  borderRadius: 20,
}

const badge = {
  background: '#facc15',
  color: '#000',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
}

const creator = {
  fontSize: 13,
  opacity: 0.8,
}

const input = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  borderRadius: 10,
  border: 'none',
}

const btn = {
  background: '#22c55e',
  color: '#022c22',
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
  marginRight: 8,
}

const btnAlt = {
  background: '#38bdf8',
  color: '#022c22',
  padding: '10px 18px',
  borderRadius: 10,
  border: 'none',
  cursor: 'pointer',
}

const likeBtn = {
  background: '#f43f5e',
  color: 'white',
  border: 'none',
  borderRadius: 999,
  padding: '8px 14px',
  marginTop: 10,
  cursor: 'pointer',
}

const footer = {
  textAlign: 'center' as const,
  padding: 20,
  opacity: 0.7,
}

