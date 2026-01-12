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

  // Load auth session
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

  // Load Cloudinary script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  // Auth actions
  const signIn = async () => {
    await supabase.auth.signInWithPassword({ email, password })
  }

  const signUp = async () => {
    await supabase.auth.signUp({ email, password })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  // Cloudinary upload
  const openUploadWidget = () => {
    if (!window.cloudinary) {
      alert('Cloudinary not loaded yet')
      return
    }

    window.cloudinary.openUploadWidget(
      {
        cloudName: 'PUT_YOUR_CLOUD_NAME_HERE',
        uploadPreset: 'unsigned_videos',
        resourceType: 'video',
        sources: ['local'],
        multiple: false,
        maxFileSize: 200000000, // 200MB
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          console.log('Uploaded video URL:', result.info.secure_url)
          alert('Video uploaded successfully!')
        }
      }
    )
  }

  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>UmmahTube</h1>
      <p>A halal alternative for Islamic videos</p>

      {!session && (
        <div style={{ maxWidth: '320px', marginTop: '20px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', marginBottom: '8px' }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', marginBottom: '8px' }}
          />

          <button onClick={signIn} style={{ marginRight: '8px' }}>
            Login
          </button>

          <button onClick={signUp}>
            Sign up
          </button>
        </div>
      )}

      {session && (
        <div style={{ marginTop: '20px' }}>
          <p>You are logged in</p>

          <button onClick={signOut}>
            Logout
          </button>

          <br /><br />

          <button
            onClick={openUploadWidget}
            style={{
              padding: '10px 16px',
              backgroundColor: '#0f766e',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Upload Video
          </button>
        </div>
      )}

      <footer style={{ marginTop: '60px', opacity: 0.6 }}>
        Supported by Suleiman Maumo
      </footer>
    </main>
  )
}

