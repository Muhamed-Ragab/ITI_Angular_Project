export const environment = {
  production: false,
  apiUrl: import.meta.env.NG_APP_API_URL || 'https://iti-ecommerce-backend.up.railway.app/api/v1',
  stripePublishableKey: import.meta.env.NG_APP_STRIPE_PUBLISHABLE_KEY || '',
};
