import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Creator() {
  const { query } = useRouter()
  const id = query.id as string

  const [profile, setProfile] = useState<any>(null)
  const [videos, setVideos] = useState<any[]>([])
  const [followers, setFollowers] = useState(0)

  useEffect(() => {
    if (!id) return
    load()
  }, [id])

  const load = async () => {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single()
    setProfile(p)

    const { data: v } = await supabase.from('videos').select('*').eq('user_id', id)
    setVideos(v || [])

    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', id)

    setFollowers(count || 0)
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>{profile?.username}</h1>
      <p>{followers} followers</p>

      <div style={{ display: 'flex', gap: 20 }}>
        {videos.map(v => (
          <video key={v.id} src={v.video_url} controls width="260" />
        ))}
      </div>
    </main>
  )
}
