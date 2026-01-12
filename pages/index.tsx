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

  const [search, setSearch] = useState('')
  const [creatorView, setCreatorView] = useState<any>(null)

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
      .select('*, profiles(username)')
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

      commentsMap[v.id] = c || []
    }

    setLikes(likesCount)
    setComments(commentsMap)
  }

  useEffect(() => {
    loadVideos()
  }, [])

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
      async (_: any, result: any) => {
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
  const likeVideo = async (videoId: string) => {
    if (!session) return

    await supabase.from('likes').insert({
      user_id: session.user.id,
      video_id: videoId,
    })

    setLikes({ ...likes, [videoId]: (likes[videoId] || 0) + 1 })
  }

  const addComment = async (videoId: string) => {
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

    setComments({
      ...comments,
      [videoId]: [...(comments[videoId] || []), data],
    })

    setCommentText({ ...commentText, [videoId]: '' })
  }

  const signIn = async () =>
    supabase.auth.signInWithPassword({ email, password })

  const signUp = async () =>
    supabase.auth.signUp({ email, password })

  const signOut = async () => supabase.auth.signOut()

  // ---------------- CREATOR PAGE ----------------
  if (creatorView) {
    return (
      <main style={{ background: '#020617', color: '#e5e7eb', minHeight: '100vh', padding: 40, textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, color: '#22d3ee' }}>
          @{creatorView.username}
        </h1>

        <button onClick={() => setCreatorView(null)}>← Back</button>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 30 }}>
          {videos
            .filter(v => v.user_id === creatorView.id)
            .map(v => (
              <div key={v.id} style={{ width: 300 }}>
                <video src={v.video_url} controls width="100%" />
                <h3>{v.title}</h3>
              </div>
            ))}
        </div>
      </main>
    )
  }

  // ---------------- MAIN UI ----------------
  return (
    <main style={{ background: '#020617', color: '#e5e7eb', minHeight: '100vh', padding: 40, textAlign: 'center' }}>
      <h1 style={{ fontSize: 72, color: '#22d3ee', marginBottom: 10 }}>
        UmmahTube
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: 30 }}>
        A halal video platform for the Ummah
      </p>

      {!session && (
        <div>
          <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
          <br /><br />
          <button onClick={signIn}>Login</button>
          <button onClick={signUp}>Sign up</button>
        </div>
      )}

      {session && (
        <div>
          <button onClick={signOut}>Logout</button>
          <button onClick={openUploadWidget}>Upload Video</button>
        </div>
      )}

      <div style={{ marginTop: 30 }}>
        <input
          placeholder="Search videos..."
          onChange={e => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', overflowX: 'auto', marginTop: 40 }}>
        {videos
          .filter(v => v.title.toLowerCase().includes(search.toLowerCase()))
          .map(v => (
            <div key={v.id} style={{ minWidth: 320, border: '1px solid #334155', padding: 14 }}>
              <video src={v.video_url} controls width="300" />
              <h3>{v.title}</h3>
              <p>{v.description}</p>
              <p>📂 {v.category}</p>

              <p
                style={{ color: '#38bdf8', cursor: 'pointer' }}
                onClick={() => setCreatorView(v.profiles)}
              >
                @{v.profiles?.username}
              </p>

              <button onClick={() => likeVideo(v.id)}>
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
                  <button onClick={() => addComment(v.id)}>Post</button>
                </>
              )}
            </div>
          ))}
      </div>
    </main>
  )
}
