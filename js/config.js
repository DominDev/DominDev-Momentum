// js/config.js
export const CONFIG = {
  maintenanceMode: false,
  enablePreloader: true,

  mail: {
    provider: "cloudflare",
    // Legacy providers (kept for fallback):
    formspreeId: "mpweyqjp",
    customEndpoint: "/send-mail.php",
  },
};
