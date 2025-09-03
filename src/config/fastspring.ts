export const FASTSPRING_CONFIG = {
  // Replace with your actual FastSpring storefront URL
  storefront: process.env.NEXT_PUBLIC_FASTSPRING_STOREFRONT || 'your-store.onfastspring.com/popup-checkout',
  
  // Product paths - make sure these match your FastSpring dashboard
  products: {
    singles: 'singles-assessment',
    couples: 'couples-assessment',
    premium: 'graceai'
  },
  
  // Test mode configuration
  testMode: process.env.NODE_ENV === 'development',
  
  // Script URL
  scriptUrl: 'https://sbl.onfastspring.com/sbl/1.0.3/fastspring-builder.min.js'
};
