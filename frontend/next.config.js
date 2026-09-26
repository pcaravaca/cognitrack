module.exports = {
  // Internacionalización de rutas
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es'
  },
  // Variables de entorno expuestas al cliente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }
};
