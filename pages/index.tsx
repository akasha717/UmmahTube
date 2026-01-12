declare global {
  interface Window {
    cloudinary: any
  }
}

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [session, setSession] = useState<any>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [videos, setVideos] = useState<any[]>([])
  const [likes, setLikes] = useState<any>({})
  const [comments, setComments] = useState<any>({})
  const [commentText, setCommentText] = useState<any>({})

  const [notifications, setNotifications] = useState<any[]>([])

  const [search, setSearch] = useState('')

  // ---------------- AUTH ----------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ---------------- LOAD VIDEOS ----------------
  const loadVideos = async () => {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    setVideos(data || [])

    const likesCount: any = {}
    const commentsMap: any = {}

    for (const v of data || []) {
      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', v.id)

      likesCount[v.id] = count || 0

      const { data: c } = await supabase
        .from('comments')
        .select('*, profiles(username)')
        .eq('video_id', v.id)
        .order('created_at')

      commentsMap[v.id] = c || []
    }

    setLikes(likesCount)
    setComments(commentsMap)
  }

  useEffect(() => {
    loadVideos()
  }, [])

  // ---------------- NOTIFICATIONS ----------------
  useEffect(() => {
    if (!session) return

    supabase
      .from('notifications')
      .select('*, profiles!actor_id(username)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setNotifications(data || []))
  }, [session])

  // ---------------- CLOUDINARY ----------------
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  const openUploadWidget = () => {
    if (!session) return alert('Login first')

    window.cloudinary.openUploadWidget(
      {
        cloudName: 'dzcha20pc',
        uploadPreset: 'unsigned_videos',
        resourceType: 'video',
      },
      async (_error: any, result: any) => {
        if (result.event === 'success') {
          const title = prompt('Video title?') || ''
          const description = prompt('Description?') || ''
          const category = prompt('Category (Quran / Hadith / Dawah)') || 'Dawah'

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

  // ---------------- ACTIONS ----------------
  const likeVideo = async (videoId: string, ownerId: string) => {
    if (!session) return

    await supabase.from('likes').insert({
      user_id: session.user.id,
      video_id: videoId,
    })

    if (session.user.id !== ownerId) {
      await supabase.from('notifications').insert({
        user_id: ownerId,
        actor_id: session.user.id,
        video_id: videoId,
        type: 'like',
        message: 'liked your video',
      })
    }

    setLikes({ ...likes, [videoId]: (likes[videoId] || 0) + 1 })
  }

  const addComment = async (videoId: string, ownerId: string) => {
    if (!session || !commentText[videoId]) return

    const { data } = await supabase
      .from('comments')
      .insert({
        user_id: session.user.id,
        video_id: videoId,
        content: commentText[videoId],
      })
      .select('*, profiles(username)')
      .single()

    if (session.user.id !== ownerId) {
      await supabase.from('notifications').insert({
        user_id: ownerId,
        actor_id: session.user.id,
        video_id: videoId,
        type: 'comment',
        message: 'commented on your video',
      })
    }

    setComments({
      ...comments,
      [videoId]: [...(comments[videoId] || []), data],
    })

    setCommentText({ ...commentText, [videoId]: '' })
  }

  // ---------------- AUTH ACTIONS ----------------
  const signIn = async () =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = async () =>
    supabase.auth.signUp({ email, password })

  const signOut = async () => supabase.auth.signOut()

  // ---------------- UI ----------------
  return (
    <main style={{ background: '#020617', color: '#e5e7eb', minHeight: '100vh', padding: 30 }}>
      <h1 style={{ fontSize: 48, color: '#22d3ee' }}>UmmahTube</h1>
      <p style={{ color: '#94a3b8' }}>A halal video platform</p>

      {/* AUTH */}
      {!session && (
        <div>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
          <button onClick={signIn}>Login</button>
          <button onClick={signUp}>Sign up</button>
        </div>
      )}

      {session && (
        <>
          <button onClick={signOut}>Logout</button>
          <button onClick={openUploadWidget}>Upload Video</button>

          <h3>🔔 Notifications</h3>
          {notifications.map(n => (
            <p key={n.id}>
              <b>@{n.profiles?.username}</b> {n.message}
            </p>
          ))}
        </>
      )}

      <input
        placeholder="Search videos..."
        onChange={e => setSearch(e.target.value)}
        style={{ marginTop: 20 }}
      />

      {/* VIDEOS */}
      <div style={{ display: 'flex', gap: 20, overflowX: 'auto', marginTop: 20 }}>
        {videos
          .filter(v => v.title.toLowerCase().includes(search.toLowerCase()))
          .map(v => (
            <div key={v.id} style={{ minWidth: 320, background: '#020617', border: '1px solid #334155', padding: 12 }}>
              <video src={v.video_url} controls width="300" />
              <h3>{v.title}</h3>
              <p>{v.description}</p>
              <p>📂 {v.category}</p>

              <button onClick={() => likeVideo(v.id, v.user_id)}>
                ❤️ {likes[v.id] || 0}
              </button>

              {comments[v.id]?.map((c: any) => (
                <p key={c.id}><b>@{c.profiles?.username}</b> {c.content}</p>
              ))}

              {session && (
                <>
                  <input
                    placeholder="Comment..."
                    value={commentText[v.id] || ''}
                    onChange={e => setCommentText({ ...commentText, [v.id]: e.target.value })}
                  />
                  <button onClick={() => addComment(v.id, v.user_id)}>Post</button>
                </>
              )}
            </div>
          ))}
      </div>
    </main>
  )
}
