'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Transaction } from '@/types'

interface Props {
  onSuccess: () => void
  initialData?: Transaction | null
  onCancelEdit?: () => void
}

export default function TransactionForm({ onSuccess, initialData, onCancelEdit }: Props) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString())
      setDescription(initialData.description || '')
      setType(initialData.type)
    }
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description) return
    setLoading(true)

    // 1. Get the current logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      alert("Authentication error. Please log in again.")
      setLoading(false)
      return
    }

    // 2. Attach the user.id to the payload to satisfy Supabase RLS policies
    const payload = {
      amount: parseFloat(amount),
      description,
      category: 'General', 
      type,
      user_id: user.id // <--- THIS FIXES THE RLS VIOLATION
    }

    let error
    if (initialData) {
      const { error: err } = await supabase.from('transactions').update(payload).eq('id', initialData.id)
      error = err
    } else {
      const { error: err } = await supabase.from('transactions').insert([payload])
      error = err
    }

    if (!error) {
      setAmount(''); setDescription('');
      onSuccess() 
      if (onCancelEdit) onCancelEdit()
    } else {
      alert(error.message)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-5">
      <div className="flex p-1 bg-slate-100/50 rounded-2xl">
        {(['expense', 'income'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setType(t)}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              type === t ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400'
            }`}>
            {t}
          </button>
        ))}
      </div>

      <input type="number" placeholder="0.00 Ksh" value={amount} onChange={(e) => setAmount(e.target.value)}
        className="w-full bg-white/50 border border-white/60 p-4 rounded-2xl focus:ring-2 focus:ring-purple-200 outline-none font-bold text-slate-700" />
      
      <input type="text" placeholder="What for? (e.g. Subscriptions)" value={description} onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-white/50 border border-white/60 p-4 rounded-2xl focus:ring-2 focus:ring-purple-200 outline-none font-bold text-slate-700" />

      <button disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">
        {loading ? 'Processing...' : initialData ? 'Update Entry' : 'Glow Up'}
      </button>
      {initialData && <button onClick={onCancelEdit} type="button" className="w-full text-slate-400 text-[10px] font-black uppercase pt-2">Cancel</button>}
    </form>
  )
}