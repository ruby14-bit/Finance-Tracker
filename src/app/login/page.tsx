'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

// 1. Add this import at the top
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter() // 2. Initialize the router
  const supabase = createClient()

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) alert(error.message)
    else {
      alert('Account created! Logging you in...')
      handleLogin() // Automatically log them in after signup
    }
  }

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else {
      router.push('/') // 3. Redirect to the homepage
      router.refresh() // Force a refresh to update the auth state
    }
  }


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Welcome Back</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 border rounded-lg"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-6 border rounded-lg"
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-4">
          <button onClick={handleLogin} className="flex-1 bg-purple-600 text-white p-3 rounded-lg font-medium">
            Login
          </button>
          <button onClick={handleSignUp} className="flex-1 border border-purple-600 text-purple-600 p-3 rounded-lg font-medium">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  )
}