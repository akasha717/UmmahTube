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
  const [likes, setLikes] = useState<Record<string, number>>({})
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({})

  /* ---------- AUTH ---------- */
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

  /* ---------- LOAD VIDEOS ---------- */
  const loadVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setVideos(data)
      loadLikes(data.map(v => v.id))
    }
  }

  const loadLikes = async (videoIds: string[]) => {
    const { data } = await supabase
      .from('likes')
      .select('video_id, user_id')

    if (!data) return

    const count: Record<string, number> = {}
    const mine: Record<string, boolean> = {}

    data.forEach(l => {
      count[l.video_id] = (count[l.video_id] || 0) + 1
      if (session && l.user_id === session.user.id) {
        mine[l.video_id] = true
      }
    })

    setLikes(count)
    setUserLikes(mine)
  }

  useEffect(() => {
    loadVideos()
  }, [session])

  /* ---------- CLOUDINARY ---------- */
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
    if (!cloudinaryReady || !session) return

    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dzcha20pc',
        uploadPreset: 'unsigned_videos',
        resourceType: 'video',
        sources: ['local'],
      },
      async (_err: any, result: any) => {
        if (result?.event === 'success') {
          const title = prompt('Video title?') || 'Untitled'
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
          alert('Video uploaded successfully')
        }
      }
    )
  }

  /* ---------- LIKES ---------- */
  const toggleLike = async (videoId: string) => {
    if (!session) return alert('Login to like videos')

    if (userLikes[videoId]) {
      await supabase
        .from('likes')
        .delete()
        .eq('video_id', videoId)
        .eq('user_id', session.user.id)
    } else {
      await supabase.from('likes').insert({
        video_id: videoId,
        user_id: session.user.id,
      })
    }

    loadVideos()
  }

  /* ---------- AUTH ACTIONS ---------- */
  const signIn = async () =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = async () => supabase.auth.signUp({ email, password })

  const signOut = async () => supabase.auth.signOut()

  /* ---------- UI ---------- */
  return (
    <main className="page">
      {/* styles unchanged */}
      {/* TOP BAR */}
      <div className="topbar">
        <div className="logo">UmmahTube</div>

        {!session ? (
          <div className="auth">
            <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={signIn}>Login</button>
            <button onClick={signUp}>Signup</button>
          </div>
        ) : (
          <button className="auth" onClick={signOut}>
            Logout
          </button>
        )}
      </div>

      {session && (
        <button className="upload" onClick={openUploadWidget}>
          Upload Video
        </button>
      )}

      <input
        className="search"
        placeholder="Search videos…"
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="videos">
        {videos
          .filter((v) =>
            v.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((v) => (
            <div key={v.id} className="card">
              <video src={v.video_url} controls width="100%" />
              <h3>{v.title}</h3>
              <p>{v.category}</p>

              <button
                onClick={() => toggleLike(v.id)}
                style={{
                  marginTop: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 18,
                }}
              >
                {userLikes[v.id] ? '❤️' : '🤍'} {likes[v.id] || 0}
              </button>

              <br />
              <Link href={`/creator/${v.user_id}`}>View Creator</Link>
            </div>
          ))}
      </div>

      <footer>
        <p>
          Supported by <strong>Suleiman Maumo</strong>
        </p>
        <p>© {new Date().getFullYear()} UmmahTube</p>
      </footer>
    </main>
  )
}
