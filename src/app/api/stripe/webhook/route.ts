import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia',
  })

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('[webhook] 서명 실패:', err.message)
    return NextResponse.json({ error: `Webhook 서명 실패: ${err.message}` }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, plan } = session.metadata ?? {}
      console.log('[webhook] checkout completed:', { userId, plan })

      if (userId && plan) {
        const { error } = await supabase
          .from('profiles')
          .update({
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq('id', userId)

        if (error) console.error('[webhook] DB 업데이트 실패:', error)
        else console.log('[webhook] 플랜 업데이트 성공:', plan)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from('profiles')
        .update({ plan: 'free' })
        .eq('stripe_subscription_id', subscription.id)
    }
  } catch (err) {
    console.error('[webhook] 처리 실패:', err)
    return NextResponse.json({ error: '처리 실패' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
