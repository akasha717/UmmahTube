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
  const [likes, setLikes] = useState<Record<string, number>>({})
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')
  const [cloudinaryReady, setCloudinaryReady] = useState(false)

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
    const { data: videoData } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (!videoData) return
    setVideos(videoData)

    const { data: likeData } = await supabase.from('likes').select('video_id')

    const likeMap: Record<string, number> = {}
    likeData?.forEach((l) => {
      likeMap[l.video_id] = (likeMap[l.video_id] || 0) + 1
    })
    setLikes(likeMap)

    if (session) {
      const { data: userLikeData } = await supabase
        .from('likes')
        .select('video_id')
        .eq('user_id', session.user.id)

      const ul: Record<string, boolean> = {}
      userLikeData?.forEach((l) => (ul[l.video_id] = true))
      setUserLikes(ul)
    }
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
      },
      async (_err: any, result: any) => {
        if (result?.event === 'success') {
          await supabase.from('videos').insert({
            user_id: session.user.id,
            title: prompt('Title?') || 'Untitled',
            category: prompt('Category?') || 'Daawah',
            description: '',
            video_url: result.info.secure_url,
          })
          loadVideos()
        }
      }
    )
  }

  /* ---------- LIKE ---------- */
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

  /* ---------- AUTH ---------- */
  const signIn = async () =>
    supabase.auth.signInWithPassword({ email, password })
  const signUp = async () =>
    supabase.auth.signUp({ email, password })
  const signOut = async () => supabase.auth.signOut()

  return (
    <>
      <main className="page">
        <style jsx global>{`
          body {
            margin: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
          }

          .page {
            min-height: 100vh;
            padding: 32px 48px;
            background: linear-gradient(
              -45deg,
              #fef9c3,
              #dcfce7,
              #ede9fe,
              #f0fdfa
            );
            background-size: 400% 400%;
            animation: gradient 18s ease infinite;
          }
          
          .videos {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 22px;
  padding-bottom: 70px;
}

@media (max-width: 1400px) {
  .videos { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 1100px) {
  .videos { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 800px) {
  .videos { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 500px) {
  .videos { grid-template-columns: 1fr; }
}

.card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  padding: 12px;
  box-shadow: 0 10px 22px rgba(124, 58, 237, 0.18);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 36px rgba(34, 197, 94, 0.35);
}

.video-thumb {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: black;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
}

.video-thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-title {
  font-size: 15px;
  font-weight: 600;
  margin: 6px 0 2px;
}

.video-meta {
  font-size: 13px;
  opacity: 0.7;
}


          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 28px;
          }

          .center-controls {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 18px;
            margin-bottom: 36px;
          }

          .logo-wrapper {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
          }

          .logo {
            font-size: 90px;
            font-weight: 900;
            background: linear-gradient(
              90deg,
              #7c3aed,
              #22c55e,
              #eab308
            );
            background-size: 300% 300%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: logoGlow 6s ease infinite, float 4s ease-in-out infinite;
          }

          @keyframes logoGlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .search-wrapper {
            position: relative;
            width: 60%;
          }

          .search {
            width: 100%;
            padding: 14px 48px 14px 18px;
            border-radius: 999px;
            border: 2px solid #7c3aed;
            font-size: 16px;
          }

          .search-icon {
            position: absolute;
            right: 18px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
          }
        `}</style>

        <div className="topbar">
          <div className="logo-wrapper">
            <div className="logo">UmmahTube</div>
          </div>

          {!session ? (
            <div className="auth">
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
              <button onClick={signUp}>Sign Up</button>
            </div>
          ) : (
            <button className="auth" onClick={signOut}>
              Logout
            </button>
          )}
        </div>

        <div className="center-controls">
          {session && (
            <button className="upload" onClick={openUploadWidget}>
              ⬆ Upload
            </button>
          )}

          <div className="search-wrapper">
            <input
              className="search"
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="videos">
          {videos
            .filter((v) =>
              v.title.toLowerCase().includes(search.toLowerCase())
            )
            .map((v) => (
              <div key={v.id} className="card">
                <div className="video-thumb">
                  <video src={v.video_url} controls />
                </div>

                <div className="video-title">{v.title}</div>
                <div className="video-meta">{v.category}</div>

                <Link href={`/creator/${v.user_id}`}>
                  View Creator
                </Link>

                <button
                  onClick={() => toggleLike(v.id)}
                  style={{
                    marginTop: 8,
                    padding: '6px 12px',
                    borderRadius: 10,
                    border: 'none',
                    background: userLikes[v.id] ? '#ef4444' : '#a855f7',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  ❤️ {likes[v.id] || 0}
                </button>
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
    </>
  )

}

