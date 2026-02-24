import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está definida en .env.local');
}

// Inicializar Stripe con tu Secret Key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Price ID del producto KintEdge Pro
export const PRICE_ID = process.env.STRIPE_PRICE_ID!;
