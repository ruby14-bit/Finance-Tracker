import { NextResponse } from 'next/server';
import crypto from 'crypto';

async function generateSecurityCredential(password: string): Promise<string> {
  // Fetch Safaricom's sandbox cert (comes as binary DER format)
  const certRes = await fetch(
    'https://developer.safaricom.co.ke/sites/default/files/cert/cert_sandbox/cert.cer'
  );
  const derBuffer = Buffer.from(await certRes.arrayBuffer());

  // Convert DER → PEM so Node crypto can read it
  const base64 = derBuffer.toString('base64');
  const pem = `-----BEGIN CERTIFICATE-----\n${base64.match(/.{1,64}/g)!.join('\n')}\n-----END CERTIFICATE-----`;

  const encrypted = crypto.publicEncrypt(
    {
      key: pem,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(password)
  );
  return encrypted.toString('base64');
}

export async function POST(req: Request) {
  try {
    const { amount, phone, userId } = await req.json();

    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const tokenRes = await fetch(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    );
    const { access_token } = await tokenRes.json();

    const securityCredential = await generateSecurityCredential(
      process.env.MPESA_INITIATOR_PASSWORD!
    );

    const response = await fetch(
      'https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          OriginatorConversationID: `withdrawal-${Date.now()}`,
          InitiatorName: process.env.MPESA_INITIATOR_NAME,
          SecurityCredential: securityCredential,
          CommandID: 'BusinessPayment',
          Amount: amount,
          PartyA: process.env.MPESA_SHORTCODE,
          PartyB: phone,
          Remarks: 'Wallet Glow Withdrawal',
          QueueTimeOutURL: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/mpesa/b2c-result?userId=${userId}`,
          ResultURL: `${process.env.NEXT_PUBLIC_NGROK_URL}/api/mpesa/b2c-result?userId=${userId}`,
          Occasion: 'Withdrawal',
        }),
      }
    );

    const data = await response.json();
    console.log('B2C Response:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
  }
}