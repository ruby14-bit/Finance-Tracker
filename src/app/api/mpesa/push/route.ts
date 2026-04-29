import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, phone, userId } = await req.json();
    if (!amount || !phone || !userId) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const tokenRes = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
      headers: { Authorization: `Basic ${auth}` }
    });
    const { access_token } = await tokenRes.json();

    const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');

    const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/mpesa/callback?userId=${userId}`,
        AccountReference: "Finance Tracker",
        TransactionDesc: "M-Pesa Sync"
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to initiate push' }, { status: 500 });
  }
}
