import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Link from 'next/link'

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  category: string
}

export default function CreatorPage() {
  const router = useRouter()
  const { id } = router.query

  const [creatorEmail, setCreatorEmail] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    const loadCreator = async () => {
      // Get creator email
      const { data: user } = await supabase
        .from('auth.users')
        .select('email')
        .eq('id', id)
        .single()

      setCreatorEmail(user?.email || 'Unknown Creator')

      // Get creator videos
      const { data: vids } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false })

      setVideos(vids || [])
      setLoading(false)
    }

    loadCreator()
  }, [id])

  if (loading) {
    return (
      <div style={loadingStyle}>
        Loading creator profile…
      </div>
    )
  }

  return (
    <div style={app}>
      <header style={header}>
        <Link href="/" style={backLink}>← Back to UmmahTube</Link>
        <h1 style={title}>👤 Creator Profile</h1>
        <p style={email}>{creatorEmail}</p>
      </header>

      <main style={{ padding: 30 }}>
        {videos.length === 0 && (
          <p style={{ textAlign: 'center', opacity: 0.7 }}>
            No videos uploaded yet.
          </p>
        )}

        <div style={grid}>
          {videos.map(v => (
            <div key={v.id} style={card}>
              <span style={badge}>{v.category}</span>
              <h3>{v.title}</h3>
              <video controls style={video}>
                <source src={v.video_url} />
              </video>
              <p>{v.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer style={footer}>
        © UmmahTube
      </footer>
    </div>
  )
}

/* 🎨 STYLES */

const app = {
  background: 'linear-gradient(180deg, #020617, #064e3b)',
  minHeight: '100vh',
  color: '#ecfeff',
}

const header = {
  textAlign: 'center' as const,
  padding: 40,
}

const title = {
  fontSize: 42,
  color: '#22c55e',
}

const email = {
  opacity: 0.85,
}

const backLink = {
  color: '#38bdf8',
  display: 'inline-block',
  marginBottom: 20,
  textDecoration: 'none',
}

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: 24,
}

const card = {
  background: '#022c22',
  padding: 20,
  borderRadius: 20,
}

const badge = {
  background: '#facc15',
  color: '#000',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
}

const video = {
  width: '100%',
  borderRadius: 12,
  marginTop: 10,
}

const footer = {
  textAlign: 'center' as const,
  padding: 20,
  opacity: 0.6,
}

const loadingStyle = {
  background: '#020617',
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#22c55e',
  fontSize: 20,
}
