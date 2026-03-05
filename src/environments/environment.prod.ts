export const environment = {
  production: true,
  apiUrl: import.meta.env.NG_APP_API_URL || 'https://iti-ecommerce-backend.up.railway.app/api/v1',
  stripePublishableKey: import.meta.env.NG_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51T6afs45PS59SM0Hb7lEjybpj2c7mCkFAcoXiFgng1kY8vCnN05eXWyFZGHohbcFotsJbh71QFE3eURVUaUOuwRj0098W5UH9M',
};
