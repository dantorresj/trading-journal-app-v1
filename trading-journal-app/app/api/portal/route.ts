import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      );
    }

    // Obtener Stripe Customer ID del usuario
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    const customerId = userData.stripeCustomerId;

    console.log('Portal - userData:', { plan: userData.plan, hasCustomerId: !!customerId });

    if (!customerId) {
      return NextResponse.json(
        { error: 'No tienes una suscripción activa. Por favor, suscríbete primero desde /upgrade' },
        { status: 400 }
      );
    }

    // Crear sesión del portal de cliente
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear portal' },
      { status: 500 }
    );
  }
}