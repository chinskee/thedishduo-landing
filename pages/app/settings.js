import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

export default function Settings() {
  const router = useRouter()
  const supabase = useSupabaseClient()
  const session = useSession()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
    router.push('/')
  }

  return (
    <div className="pt-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-card">
        <h1 className="text-2xl font-bold mb-4 text-neutralDark">Settings</h1>
        {session ? (
          <>
            <p className="mb-4 text-neutralDark">Logged in as <strong>{session.user.email}</strong></p>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? 'Logging out...' : 'Logout'}
            </button>
          </>
        ) : (
          <p className="text-gray-600">You are not logged in.</p>
        )}
      </div>
    </div>
  )
}
