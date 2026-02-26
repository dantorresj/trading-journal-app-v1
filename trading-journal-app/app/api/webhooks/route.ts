import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { adminDb } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;

        if (userId && session.customer) {
          const customerId = typeof session.customer === 'string'
            ? session.customer
            : session.customer.id;

          await adminDb.doc(`users/${userId}`).update({
            plan: 'pro',
            stripeCustomerId: customerId,
            stripeSubscriptionId: session.subscription as string,
            planStartDate: new Date(),
          });
          console.log(`✅ Plan PRO activado: ${userId}, Customer: ${customerId}`);
        } else {
          console.error('❌ userId o customer no encontrado:', { userId, customer: session.customer });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await adminDb.doc(`users/${userId}`).update({
            plan: 'free',
          });
          console.log(`❌ Plan cancelado: ${userId}`);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
}