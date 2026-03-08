/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly NG_APP_API_URL: string;
  readonly NG_APP_STRIPE_PUBLISHABLE_KEY: string
}

// eslint-disable-next-line no-unused-vars
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
