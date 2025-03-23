import { loadStripe } from '@stripe/stripe-js';
import { apiRequest } from './queryClient';

// Initialize Stripe with publishable key
export const getStripePromise = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLIC_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    console.warn('No se encontró la clave pública de Stripe');
  }
  return loadStripe(key || '');
};

/**
 * Create a payment intent for book purchase
 */
export async function createPaymentIntent(amount: number, bookId: number, userId: number, format: string) {
  try {
    const response = await apiRequest("POST", "/api/create-payment-intent", { 
      amount, 
      bookId, 
      userId, 
      format 
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}

/**
 * Create a subscription checkout session
 */
export async function createSubscriptionCheckout(tierId: number, userId: number, returnUrl?: string) {
  try {
    const response = await apiRequest("POST", "/api/create-subscription-payment", { 
      tierId,
      userId,
      returnUrl
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    throw error;
  }
}

/**
 * Create a subscription directly (development/testing only)
 */
export async function createSubscription(tierId: number, userId: number) {
  try {
    const response = await apiRequest("POST", "/api/subscriptions", { 
      tierId,
      userId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Una semana desde ahora
    });

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: number, cancelAtPeriodEnd: boolean = true) {
  try {
    const response = await apiRequest("PATCH", `/api/subscriptions/${subscriptionId}/cancel`, { 
      cancelAtPeriodEnd
    });

    return await response.json();
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}
