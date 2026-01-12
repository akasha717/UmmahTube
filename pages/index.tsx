import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
declare global {
  interface Window {
    cloudinary: any
  }
}


export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

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

  const signIn = async () => {
    await supabase.auth.signInWithPassword({
      email,
      password,
    })
  }

  const signUp = async () => {
    await supabase.auth.signUp({
      email,
      password,
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }
  const openUploadWidget = () => {
  if (!window.cloudinary) {
    alert('Cloudinary not loaded')
    return
  }

  window.cloudinary.openUploadWidget(
    {
      cloudName: 'dzcha20pc',
      uploadPreset: 'unsigned_videos',
      sources: ['local'],
      resourceType: 'video',
      multiple: false,
      maxFileSize: 200000000, // 200MB
    },
    (error: any, result: any) => {
      if (!error && result && result.event === 'success') {
        console.log('Video uploaded:', result.info.secure_url)
        alert('Video uploaded successfully!')
      }
    }
  )
}


  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>UmmahTube</h1>

      {!session && (
        <div style={{ maxWidth: '300px' }}>
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
        <div>
          <p>You are logged in</p>

          <button onClick={signOut}>
            Logout
          </button>

          <br /><br />

          <button
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



