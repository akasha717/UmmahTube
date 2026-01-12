import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function CreatorPage() {
  const router = useRouter()
  const { id } = router.query
  const [videos, setVideos] = useState<any[]>([])

  useEffect(() => {
    if (!id) return

    supabase
      .from('videos')
      .select('*')
      .eq('user_id', id)
      .then(({ data }) => {
        if (data) setVideos(data)
      })
  }, [id])

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 40,
        background: '#020617',
        color: '#e5e7eb',
      }}
    >
      <h1 style={{ fontSize: 48, color: '#22d3ee' }}>
        Creator Videos
      </h1>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {videos.map((v) => (
          <div
            key={v.id}
            style={{
              width: 300,
              background: '#020617',
              borderRadius: 12,
              padding: 12,
            }}
          >
            <video src={v.video_url} controls style={{ width: '100%' }} />
            <h3>{v.title}</h3>
            <p>{v.category}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
