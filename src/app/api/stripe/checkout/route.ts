import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-03-25.dahlia',
    })

    const { plan, userId, email } = await req.json()

    const priceId = plan === 'dreamer'
      ? process.env.STRIPE_DREAMER_PRICE_ID
      : process.env.STRIPE_WEAVER_PRICE_ID

    if (!priceId) {
      return NextResponse.json({ error: '잘못된 플랜이에요' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
      customer_email: email,
      metadata: { userId, plan },
      locale: 'ko',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout]', err)
    return NextResponse.json({ error: '결제 세션 생성 실패' }, { status: 500 })
  }
}
