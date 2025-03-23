// PayPal client SDK initialization helper

export const loadPayPalScript = () => {
  return new Promise<void>((resolve, reject) => {
    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    
    if (!clientId) {
      reject(new Error('PayPal client ID not found'));
      return;
    }
    
    // Check if the script is already loaded
    if (document.querySelector('script[data-paypal-script]')) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.setAttribute('data-paypal-script', '');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load PayPal script'));
    document.body.appendChild(script);
  });
};
