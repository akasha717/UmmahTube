declare global {
  interface Window {
    cloudinary: any
  }
}

import { useEffect, useState } from 'react'
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

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // Load Cloudinary
  useEffect(() => {
    const s = document.createElement('script')
    s.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
    s.async = true
    document.body.appendChild(s)
  }, [])

  // Load videos
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

  // Upload
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

  const likeVideo = async (id: number, current: number) => {
    await supabase
      .from('videos')
      .update({ likes: current + 1 })
      .eq('id', id)

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
        fontFamily: 'system-ui',
        background:
          'radial-gradient(circle at top, #0f172a, #020617), repeating-linear-gradient(45deg, rgba(34,211,238,0.05) 0 2px, transparent 2px 20px)',
        color: '#e5e7eb',
      }}
    >
      {/* TITLE */}
      <h1
        style={{
          fontSize: 72,
          textAlign: 'center',
          color: '#22d3ee',
          letterSpacing: 2,
        }}
      >
        UmmahTube
      </h1>

      <p style={{ textAlign: 'center', marginBottom: 30 }}>
        A halal home for Islamic videos
      </p>

      {/* SEARCH */}
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
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
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <input
            placeholder="Video title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <br />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <br />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Qur’an</option>
            <option>Hadith</option>
            <option>Da’wah</option>
          </select>
          <br />
          <button onClick={openUpload}>Upload Video</button>
        </div>
      )}

      {/* VIDEOS */}
      <div
        style={{
          display: 'flex',
          gap: 20,
          overflowX: 'auto',
          paddingBottom: 20,
        }}
      >
        {filtered.map((v) => (
          <div
            key={v.id}
            style={{
              minWidth: 280,
              background: '#020617',
              borderRadius: 12,
              padding: 12,
            }}
          >
            <video
              src={v.video_url}
              controls
              style={{ width: '100%', borderRadius: 8 }}
            />
            <h3>{v.title}</h3>
            <p style={{ fontSize: 14 }}>{v.description}</p>
            <p style={{ color: '#22d3ee' }}>{v.category}</p>

            <button onClick={() => likeVideo(v.id, v.likes)}>
              ❤️ {v.likes}
            </button>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: 80,
          textAlign: 'center',
          animation: 'fadeIn 3s infinite alternate',
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
          @keyframes fadeIn {
            from { opacity: 0.5 }
            to { opacity: 1 }
          }
        `}</style>
      </footer>
    </main>
  )
}
