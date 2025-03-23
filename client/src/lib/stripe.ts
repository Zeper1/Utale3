import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
export const getStripePromise = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return loadStripe(key || '');
};

/**
 * Create a payment intent for book purchase
 */
export async function createPaymentIntent(amount: number, bookId: number, userId: number, format: string) {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        amount, 
        bookId, 
        userId, 
        format 
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}
