export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'yo', label: 'Yorùbá' },
  { code: 'ha', label: 'Hausa' },
];

// Covers site chrome (nav/footer). CMS-entered copy (hero text, about,
// blog posts, FAQs) is not auto-translated — that would require either
// storing a value per language in site_content or a translation API,
// which is a larger follow-up if you want it.
export const dict: Record<string, Record<string, string>> = {
  en: { track: 'Track', support: 'Support', dashboard: 'Dashboard', login: 'Login', signup: 'Sign Up', logout: 'Logout', about: 'About', locations: 'Locations', calculator: 'Shipping Price Calculator', prohibited: 'Prohibited Items', blog: 'Blog', faqs: 'FAQs', language: 'Language' },
  fr: { track: 'Suivre', support: 'Support', dashboard: 'Tableau de bord', login: 'Connexion', signup: "S'inscrire", logout: 'Déconnexion', about: 'À propos', locations: 'Emplacements', calculator: 'Calculateur de tarifs', prohibited: 'Articles interdits', blog: 'Blog', faqs: 'FAQ', language: 'Langue' },
  yo: { track: 'Tọpa', support: 'Ìrànlọ́wọ́', dashboard: 'Pátákó', login: 'Wọlé', signup: 'Forúkọsílẹ̀', logout: 'Jáde', about: 'Nípa Wa', locations: 'Ipò', calculator: 'Ìṣírò Owó Rírán', prohibited: 'Ohun Tí A Kò Gbà', blog: 'Blọ́ọ̀gù', faqs: 'Ìbéèrè', language: 'Èdè' },
  ha: { track: 'Bincike', support: 'Taimako', dashboard: 'Dashboard', login: 'Shiga', signup: 'Yi rijista', logout: 'Fita', about: 'Game da Mu', locations: 'Wurare', calculator: 'Kididdigar Farashi', prohibited: 'Kayayyakin Da Aka Haramta', blog: 'Blog', faqs: 'Tambayoyi', language: 'Harshe' },
};
