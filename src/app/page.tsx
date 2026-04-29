'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import TransactionForm from '@/components/TransactionForm'
import SpendingChart from '@/components/SpendingChart'
import { Transaction } from '@/types'

export default function Dashboard() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false) // ✅ ADDED
  
  const supabase = createClient()
  const router = useRouter()

  const fetchTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching:', error)
    } else {
      setTransactions(data || [])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const channel = supabase
      .channel('realtime-transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          console.log('Database updated, fetching new transactions...')
          fetchTransactions()
        }
      )
      .subscribe()

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        fetchTransactions()
      }
    }
    checkUser()

    return () => {
      supabase.removeChannel(channel)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTransactions])

  // --- FIXED M-PESA SYNC LOGIC ---
  const handleMpesaSync = async () => {
    if (!user) return alert("User not loaded yet.")

    setSyncing(true)
    try {
      const res = await fetch('/api/mpesa/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: 1, 
          phone: "254794213005", // Using your confirmed test number
          userId: user.id        // THIS IS THE KEY FIX
        }),
      })
      
      const result = await res.json()

      if (res.ok && result.ResponseCode === "0") {
        alert("Check your phone! The M-Pesa PIN prompt has been sent.")
      } else {
        console.error("M-Pesa Error:", result)
        alert("Failed to initiate push. Check your server console.")
      }
    } catch (err) {
      console.error("Sync error:", err)
      alert("Connection error. Make sure 'npm run dev' and 'ngrok' are active!")
    } finally {
      setSyncing(false)
    }
  }

  // ✅ ADDED: Withdraw handler
  const handleWithdraw = async () => {
    const amountStr = window.prompt('Enter amount to withdraw (Ksh):')
    if (!amountStr || isNaN(Number(amountStr))) return
    const amount = Number(amountStr)
    if (amount <= 0) return alert('Enter a valid amount')
    if (!user) return

    setWithdrawing(true)
    try {
      const res = await fetch('/api/mpesa/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, phone: '254794213005', userId: user.id }),
      })
      const result = await res.json()
      if (res.ok && result.ResponseCode === '0') {
        alert('Withdrawal initiated! Money coming to your phone.')
      } else {
        console.error('Withdraw error:', result)
        alert('Withdrawal failed. Check server console.')
      }
    } catch (err) {
      console.error(err)
      alert('Connection error.')
    } finally {
      setWithdrawing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this?')) return
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (!error) fetchTransactions()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totalBalance = transactions.reduce((acc, curr) => {
    const amount = Number(curr.amount) || 0
    return curr.type === 'income' ? acc + amount : acc - amount
  }, 0)

  if (!user || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-200"></div>
        <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Glow Loading...</p>
      </div>
    </div>
  )

  const glassClass = "bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/40 transition-all duration-500"

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-rose-50 via-slate-50 to-indigo-50 p-4 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4 md:gap-6">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 tracking-tight">
              Wallet Glow
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1 ml-1 opacity-80">
              Welcome back, <span className="text-purple-600 font-bold">{user.email?.split('@')[0]}</span>
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-4 w-full md:w-auto">
            <button 
              onClick={handleMpesaSync}
              disabled={syncing}
              className={`group flex items-center justify-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-200/50 font-bold text-xs md:text-sm ${syncing ? 'animate-pulse opacity-70' : 'hover:scale-105 active:scale-95'}`}
            >
              <div className={`w-2 h-2 bg-white rounded-full ${syncing ? 'animate-ping' : ''}`}></div>
              {syncing ? 'Connecting...' : 'Sync Live M-Pesa'}
            </button>

            {/* ✅ ADDED: Withdraw button */}
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className={`group flex items-center justify-center gap-2 bg-purple-500 text-white px-4 py-2.5 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-200/50 font-bold text-xs md:text-sm ${withdrawing ? 'animate-pulse opacity-70' : 'hover:scale-105 active:scale-95'}`}
            >
              <div className={`w-2 h-2 bg-white rounded-full ${withdrawing ? 'animate-ping' : ''}`}></div>
              {withdrawing ? 'Processing...' : 'Withdraw to M-Pesa'}
            </button>

            <button 
              onClick={handleLogout} 
              className="col-span-2 md:col-span-1 group flex items-center justify-center gap-2 bg-white/40 backdrop-blur-md text-slate-600 border border-white/40 px-4 py-2.5 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 shadow-sm font-bold text-xs md:text-sm"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Balance & Form */}
          <div className="lg:col-span-4 space-y-8">
            <div className="relative overflow-hidden group bg-gradient-to-br from-purple-600 to-pink-500 p-8 rounded-[2.5rem] shadow-2xl shadow-purple-200/50 text-white transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <p className="text-purple-100 text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Current Balance</p>
              <p className="text-3xl md:text-4xl font-black mt-4 tracking-tighter">
                Ksh {totalBalance.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-6">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-lg rounded-full text-[10px] font-bold uppercase tracking-wider">Verified Asset</span>
              </div>
            </div>

            <div className={glassClass}>
               <TransactionForm 
                onSuccess={fetchTransactions} 
                initialData={editingTransaction}
                onCancelEdit={() => setEditingTransaction(null)}
              />
            </div>
          </div>

          {/* RIGHT: Visuals & History */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <SpendingChart transactions={transactions} />
              
              <div className={`${glassClass} p-4 md:p-8 flex flex-col justify-center relative overflow-hidden`}>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Insight</p>
                <h4 className="text-xl font-bold text-slate-800 leading-tight">
                  Your largest expense this week was <br />
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
                    &ldquo;{transactions.filter(t => t.type === 'expense').sort((a,b) => b.amount - a.amount)[0]?.description || 'None'}&rdquo;
                  </span>
                </h4>
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-pink-400/10 blur-3xl rounded-full"></div>
              </div>
            </div>

            <div className={`${glassClass} p-4 md:p-8`}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Recent Activity</h3>
                <div className="w-10 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {transactions.length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-slate-400 font-medium italic">No transactions found.</p>
                  </div>
                ) : (
                  transactions.map((t) => (
                    <div 
                      key={t.id} 
                      className="group flex justify-between items-center p-3 md:p-5 bg-white/30 hover:bg-white/70 rounded-[1.8rem] transition-all duration-300 border border-transparent hover:border-white hover:shadow-lg gap-2"
                    >
                      <div className="grid grid-cols-2 md:flex md:items-center gap-2 md:gap-4 w-full md:w-auto">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${
                          t.type === 'income' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'
                        }`}>
                          {t.description?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 capitalize tracking-tight text-sm md:text-base truncate max-w-[100px] md:max-w-none">{t.description || 'Untitled'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <p className={`text-sm md:text-lg font-black tracking-tighter shrink-0 ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                          {t.type === 'income' ? '+' : '-'} Ksh {Number(t.amount).toFixed(2)}
                        </p>
                        <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingTransaction(t)} className="text-purple-600 text-[10px] font-black uppercase">Edit</button>
                          <button onClick={() => handleDelete(t.id)} className="text-rose-400 text-[10px] font-black uppercase">Del</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}