'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Transaction } from '@/types'

interface SpendingChartProps {
  transactions: Transaction[]
}

export default function SpendingChart({ transactions }: SpendingChartProps) {
  // Filter for expenses only
  const expenses = transactions.filter(t => t.type === 'expense')
  
  // Group expenses by description for the chart data
  const dataMap = expenses.reduce((acc, curr) => {
    const name = curr.description || 'Other'
    acc[name] = (acc[name] || 0) + Number(curr.amount)
    return acc
  }, {} as Record<string, number>)

  const data = Object.keys(dataMap).map(key => ({
    name: key,
    value: dataMap[key]
  }))

  // Your modern feminine palette
  const COLORS = ['#d946ef', '#ec4899', '#8b5cf6', '#a855f7', '#f43f5e']

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-200/40 transition-all duration-500 p-8 w-full">
      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-6 text-center">
        Expense Breakdown
      </p>
      
      <div className="w-full h-[250px] relative" style={{ minHeight: 250, minWidth: 0 }}>
        {expenses.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-slate-400 font-medium italic text-sm">No expenses yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
                animationBegin={0}
                animationDuration={1200}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.05))' }}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.6)', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}