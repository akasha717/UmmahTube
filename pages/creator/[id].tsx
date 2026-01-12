import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Creator() {
  const { id } = useRouter().query
  const [session, setSession] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [username, setUsername] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) =>
      setSession(data.session)
    )
  }, [])

  useEffect(() => {
    if (!id) return

    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setProfile(data)
        setUsername(data?.username)
      })

    supabase
      .from('videos')
      .select('*')
      .eq('user_id', id)
      .then(({ data }) => setVideos(data || []))
  }, [id])

  const updateProfile = async () => {
    await supabase
      .from('profiles')
      .update({ username })
      .eq('id', session.user.id)
    alert('Profile updated')
  }

  return (
    <main style={{ padding: 40, color: 'white' }}>
      <h1 style={{ fontSize: 48 }}>{profile?.username}</h1>

      {session?.user.id === id && (
        <>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={updateProfile}>Edit Profile</button>
        </>
      )}

      <div style={{ display: 'flex', gap: 20 }}>
        {videos.map((v) => (
          <div key={v.id} style={{ width: 300 }}>
            <video src={v.video_url} controls width="100%" />
            <h3>{v.title}</h3>
          </div>
        ))}
      </div>
    </main>
  )
}
