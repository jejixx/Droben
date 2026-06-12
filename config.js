/** Configuration globale du bot DroBen */
module.exports = {
  /** Couleur principale des embeds (Discord Blurple) */
  COLOR: 0x5865f2,
  /** Nom affiché du bot */
  BOT_NAME: 'DroBen',
  /** Version actuelle */
  VERSION: '1.0.0',
  /** Préfixe legacy pour d'éventuelles commandes texte */
  PREFIX: '!',

  /** API HTTP interne (supp-gap → DroBen) */
  INTERNAL_API: {
    host: '127.0.0.1',
    port: Number.parseInt(process.env.INTERNAL_API_PORT || '4001', 10),
  },
  /** Secret partagé avec supp-gap (Authorization: Bearer) */
  INTERNAL_API_SECRET: process.env.INTERNAL_API_SECRET || '',
  /** Serveur Discord SUPP GAP (fallback sur GUILD_ID) */
  SUPPGAP_GUILD_ID: process.env.SUPPGAP_GUILD_ID || process.env.GUILD_ID || '',
  /** Rôle Premium fixe partagé */
  PREMIUM_ROLE_ID: process.env.PREMIUM_ROLE_ID || '',
  /** Catégorie des salons vocaux d'abonnés */
  SUBSCRIBER_CATEGORY_ID: process.env.SUBSCRIBER_CATEGORY_ID || '',
  /** URL de l'app supp-gap (scheduler d'expiration des passes) */
  NEXTJS_INTERNAL_URL: process.env.NEXTJS_INTERNAL_URL || 'http://127.0.0.1:3000',
};
