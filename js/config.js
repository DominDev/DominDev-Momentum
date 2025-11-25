// js/config.js
export const CONFIG = {
  maintenanceMode: false, // true = włącza ekran prac technicznych
  enablePreloader: true, // true = włącza ekran startowy

  /* --- MAIL CONFIGURATION --- */
  mail: {
    // provider: 'formspree' | 'custom'
    provider: "formspree",

    // TWÓJ ID FORMSPREE:
    formspreeId: "mpweyqjp",

    // Placeholder na przyszłość (LH.pl)
    customEndpoint: "/send-mail.php",
  },
};
