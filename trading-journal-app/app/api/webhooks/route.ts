import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verificar el webhook con la firma
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Procesar eventos de Stripe
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId || session.client_reference_id;

        if (userId) {
          // Activar plan PRO
          await updateDoc(doc(db, 'users', userId), {
            plan: 'pro',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            planStartDate: new Date(),
          });

          console.log(`✅ Plan PRO activado para usuario: ${userId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          // Actualizar estado de suscripción
          const status = subscription.status;
          
          if (status === 'active') {
            await updateDoc(doc(db, 'users', userId), {
              plan: 'pro',
            });
            console.log(`✅ Suscripción actualizada (activa): ${userId}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          // Cancelar plan PRO
          await updateDoc(doc(db, 'users', userId), {
            plan: 'free',
          });

          console.log(`❌ Plan PRO cancelado para usuario: ${userId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`⚠️ Pago fallido: ${invoice.customer}`);
        break;
      }

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
