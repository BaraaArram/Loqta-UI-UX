// i18n-config.ts: Defines supported locales and i18n configuration for the app.
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'ar'],
} as const;

export type Locale = (typeof i18n)['locales'][number]; 