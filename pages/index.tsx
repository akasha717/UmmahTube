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

  // ---- LOAD LIKE COUNTS ----
  const { data: likeData } = await supabase
    .from('likes')
    .select('video_id')

  const likeCountMap: Record<string, number> = {}
  likeData?.forEach((l) => {
    likeCountMap[l.video_id] = (likeCountMap[l.video_id] || 0) + 1
  })
  setLikes(likeCountMap)

  // ---- LOAD USER LIKES ----
  if (session) {
    const { data: userLikeData } = await supabase
      .from('likes')
      .select('video_id')
      .eq('user_id', session.user.id)

    const userLikeMap: Record<string, boolean> = {}
    userLikeData?.forEach((l) => {
      userLikeMap[l.video_id] = true
    })
    setUserLikes(userLikeMap)
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

  /* ---------- AUTH ACTIONS ---------- */
  const signIn = async () =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = async () => supabase.auth.signUp({ email, password })

  const signOut = async () => supabase.auth.signOut()

  /* ---------- UI ---------- */
  return (
    <main className="page">
      <style jsx global>{`
        body {
          margin: 0;
          font-family: system-ui, sans-serif;
        }

        .page {
          min-height: 100vh;
          padding: 40px;
          background: linear-gradient(
            -45deg,
            #fef9c3,
            #dcfce7,
            #ede9fe,
            #f0fdfa
          );
          background-size: 400% 400%;
          animation: gradient 20s ease infinite;
          text-align: center;
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .logo {
          font-size: 90px;
          font-weight: 900;
          color: #7c3aed;
        }

        .auth input {
          padding: 8px;
          margin-right: 6px;
          border-radius: 8px;
          border: 1px solid #a855f7;
        }

        .auth button {
          padding: 8px 14px;
          margin-left: 4px;
          border-radius: 8px;
          border: none;
          background: #7c3aed;
          color: white;
          cursor: pointer;
        }

        .upload {
          padding: 14px 24px;
          background: #22c55e;
          color: white;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          margin-bottom: 30px;
          font-size: 16px;
        }

        .search {
          width: 60%;
          padding: 14px;
          border-radius: 16px;
          border: 2px solid #7c3aed;
          margin-bottom: 30px;
        }

        .videos {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
          padding-bottom: 40px;
        }
@media (max-width: 1200px) {
  .videos {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 700px) {
  .videos {
    grid-template-columns: repeat(1, 1fr);
  }
}

        .card {
          width: 320px;
          padding: 16px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(12px);
          box-shadow: 0 20px 40px rgba(124, 58, 237, 0.25);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .card:hover {
          transform: scale(1.06);
          box-shadow: 0 30px 60px rgba(34, 197, 94, 0.4);
        }

        footer {
          margin-top: 90px;
          color: #6b21a8;
          animation: float 4s ease-in-out infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>

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
const toggleLike = async (videoId: string) => {
  if (!session) {
    alert('Please login to like videos')
    return
  }

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

      {/* UPLOAD */}
      {session && (
        <button className="upload" onClick={openUploadWidget}>
          Upload Video
        </button>
      )}

      {/* SEARCH */}
      <input
        className="search"
        placeholder="Search videos…"
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* VIDEOS */}
      <div className="videos">
        {videos
          .filter((v) =>
            v.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((v) => (
            <div key={v.id} className="card">
              <video
  src={v.video_url}
  controls
  style={{
    width: '100%',
    aspectRatio: '16 / 9',
    borderRadius: '10px',
    marginBottom: '8px',
    background: '#000',
  }}
/>

              <h3>{v.title}</h3>
              <p>{v.category}</p>
              <Link href={`/creator/${v.user_id}`}>View Creator</Link>
              <button
  onClick={() => toggleLike(v.id)}
  style={{
    marginTop: 10,
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

      {/* FOOTER */}
      <footer>
        <p>
          Supported by <strong>Suleiman Maumo</strong>
        </p>
        <p>© {new Date().getFullYear()} UmmahTube</p>
      </footer>
    </main>
  )
}


