import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for the backend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    const data = await request.json()

    console.log("M-Pesa Callback Received:", JSON.stringify(data, null, 2))

    // Safaricom sends ResultCode 0 for a successful payment
    const resultCode = data?.Body?.stkCallback?.ResultCode

    if (resultCode === 0 && userId) {
      const callbackMetadata = data.Body.stkCallback.CallbackMetadata.Item
      
      // Extract specific details from the Safaricom payload
      const amountItem = callbackMetadata.find((item: any) => item.Name === 'Amount')
      const receiptItem = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')

      const amount = amountItem?.Value || 0
      const receipt = receiptItem?.Value || 'M-Pesa'

      // Insert the new transaction into Supabase
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            amount: Number(amount),
            type: 'income', // Treating deposits as income
            category: 'M-Pesa',
            date: new Date().toISOString().split('T')[0], 
            description: `M-Pesa Deposit (${receipt})`,
          }
        ])

      if (error) {
        console.error("Supabase Database Insert Error:", error)
      } else {
        console.log("Successfully saved M-Pesa transaction to database!")
      }
    } else {
      console.log("Transaction failed or cancelled by user. ResultCode:", resultCode)
    }

    // Always return 200 to Safaricom so they know you received the message
    return NextResponse.json({ "ResultCode": 0, "ResultDesc": "Success" })

  } catch (error) {
    console.error("Callback processing error:", error)
    return NextResponse.json({ "ResultCode": 0, "ResultDesc": "Success" })
  }
}