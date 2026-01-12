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
}

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Quran')
  const [videos, setVideos] = useState<Video[]>([])
  const [comments, setComments] = useState<any>({})
  const [commentText, setCommentText] = useState('')

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

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const loadVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setVideos(data)
  }

  const loadComments = async (videoId: string) => {
    const { data } = await supabase
      .from('video_comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at')

    setComments((prev: any) => ({ ...prev, [videoId]: data }))
  }

  useEffect(() => {
    loadVideos()
  }, [])

  const signIn = async () => {
    await supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async () => {
    await supabase.auth.signUp({ email, password })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

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

  const addComment = async (videoId: string) => {
    if (!commentText) return
    await supabase.from('video_comments').insert({
      video_id: videoId,
      user_id: session.user.id,
      comment: commentText,
    })
    setCommentText('')
    loadComments(videoId)
  }

  return (
    <div style={{ background: '#f5f7f6', minHeight: '100vh' }}>
      <header style={{ background: '#065f46', color: 'white', padding: 20, textAlign: 'center' }}>
        <h1>🕌 UmmahTube</h1>
        <p>Islamic video platform</p>
      </header>

      <main style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
        {!session && (
          <div style={card}>
            <input style={input} placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input style={input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button style={btn} onClick={signIn}>Login</button>
            <button style={btnOutline} onClick={signUp}>Sign up</button>
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
            </select>
            <button style={btn} onClick={openUploadWidget}>Upload</button>
            <button style={btnOutline} onClick={signOut}>Logout</button>
          </div>
        )}

        {videos.map(video => (
          <div key={video.id} style={card}>
            <span style={{ fontSize: 12, color: '#065f46' }}>{video.category}</span>
            <h3>{video.title}</h3>
            <p>{video.description}</p>
            <video controls style={{ width: '100%', borderRadius: 12 }}>
              <source src={video.video_url} />
            </video>

            <button onClick={() => loadComments(video.id)} style={btnOutline}>
              Load comments
            </button>

            {comments[video.id]?.map((c: any) => (
              <p key={c.id}>💬 {c.comment}</p>
            ))}

            {session && (
              <>
                <input
                  style={input}
                  placeholder="Write a comment"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                />
                <button style={btn} onClick={() => addComment(video.id)}>Comment</button>
              </>
            )}
          </div>
        ))}
      </main>

      <footer style={{ textAlign: 'center', padding: 20, opacity: 0.6 }}>
        Supported by Suleiman Maumo
      </footer>
    </div>
  )
}

const card = {
  background: 'white',
  padding: 20,
  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  marginBottom: 30,
}

const input = {
  width: '100%',
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: '1px solid #ccc',
}

const btn = {
  background: '#065f46',
  color: 'white',
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  marginRight: 8,
}

const btnOutline = {
  background: 'transparent',
  color: '#065f46',
  padding: '10px 16px',
  borderRadius: 8,
  border: '2px solid #065f46',
  cursor: 'pointer',
}
