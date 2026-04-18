import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const data = await request.json()

    console.log('B2C Result Received:', JSON.stringify(data, null, 2))

    const result = data?.Result
    const resultCode = result?.ResultCode

    if (resultCode === 0 && userId) {
      const params = result?.ResultParameters?.ResultParameter || []

      const amountItem = params.find((p: any) => p.Key === 'TransactionAmount')
      const receiptItem = params.find((p: any) => p.Key === 'TransactionReceipt')

      const amount = amountItem?.Value || 0
      const receipt = receiptItem?.Value || 'Withdrawal'

      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          amount: Number(amount),
          type: 'expense',
          category: 'M-Pesa',
          date: new Date().toISOString().split('T')[0],
          description: `M-Pesa Withdrawal (${receipt})`,
        }])

      if (error) {
        console.error('Supabase Insert Error:', error)
      } else {
        console.log('Withdrawal logged successfully!')
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (error) {
    console.error('B2C result error:', error)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
  }
}