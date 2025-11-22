document.addEventListener("DOMContentLoaded", () => {
  /* --- TYPEWRITER EFFECT LOGIC --- */
  const typeTextSpan = document.querySelector(".typewriter-text");
  const cursorSpan = document.querySelector(".typewriter-cursor");

  if (typeTextSpan) {
    const words = [
      "BROŃ.",
      "PRZEWAGA.",
      "DOMINACJA.",
      "MASZYNA."
    ];

    const typingDelay = 150;
    const erasingDelay = 80;
    const newWordDelay = 2500;

    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        typeTextSpan.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        typeTextSpan.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = typingDelay;

      if (isDeleting) {
        typeSpeed = erasingDelay;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = newWordDelay;
        isDeleting = true;
        if (cursorSpan) cursorSpan.style.animationPlayState = "paused";
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex++;
        if (wordIndex === words.length) {
          wordIndex = 0;
        }
        typeSpeed = 500;
        if (cursorSpan) cursorSpan.style.animationPlayState = "running";
      }

      setTimeout(type, typeSpeed);
    }

    // Start z lekkim opóźnieniem dla dramaturgii
    setTimeout(type, 1200);
  }

  /* --- MATRIX CANVAS EFFECT (rAF + Throttling for Performance) --- */
  const canvas = document.getElementById("matrixCanvas");

  if (canvas) {
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const cols = Math.floor(width / 20);
    const ypos = Array(cols).fill(0);

    // Mouse interaction - enhanced tracking
    let mouseX = -100;
    let mouseY = -100;
    let targetMouseX = -100;
    let targetMouseY = -100;

    // Throttling for ~15 FPS (slower, cinematic Matrix feel + battery saving)
    let lastTime = 0;
    const fps = 15;
    const interval = 1000 / fps;

    // Mobile detection for reduced red glow radius
    const isMobile = window.innerWidth < 768;

    window.addEventListener("mousemove", (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    });

    window.addEventListener("resize", () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      // Fix: Add new columns if window gets wider
      const newCols = Math.floor(width / 20);
      while (ypos.length < newCols) {
        ypos.push(Math.random() * -100);
      }
    });

    function matrix(currentTime) {
      requestAnimationFrame(matrix);

      // Throttling logic - skip frame if not enough time passed
      if (!currentTime) currentTime = 0;
      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);

      // Smooth mouse interpolation for fluid effect
      mouseX += (targetMouseX - mouseX) * 0.12;
      mouseY += (targetMouseY - mouseY) * 0.12;

      // Slight fade effect for trail
      ctx.fillStyle = "rgba(5, 5, 5, 0.06)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = "15pt monospace";

      ypos.forEach((y, ind) => {
        // Generate random character (mix of chars for matrix effect)
        const chars =
          "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = ind * 20;

        // Calculate distance to mouse for interaction
        const dist = Math.hypot(x - mouseX, y - mouseY);

        // MOUSE AREA: Reduced radius on mobile (150px vs 300px desktop)
        const maxRadius = isMobile ? 150 : 300;
        const innerRadius = isMobile ? 50 : 100;
        const midRadius = isMobile ? 90 : 180;

        if (dist < maxRadius) {
          // Intensity based on distance - closer = brighter
          const intensity = 1 - dist / maxRadius;

          if (dist < innerRadius) {
            // Very close - bright red with strong glow effect
            ctx.fillStyle = `rgba(255, 31, 31, ${0.95 + intensity * 0.05})`;
            ctx.shadowColor = "#FF1F1F";
            ctx.shadowBlur = 20 * intensity;
          } else if (dist < midRadius) {
            // Medium distance - visible red
            ctx.fillStyle = `rgba(255, 31, 31, ${0.6 + intensity * 0.35})`;
            ctx.shadowColor = "#FF1F1F";
            ctx.shadowBlur = 10 * intensity;
          } else {
            // Outer ring - subtle red tint
            ctx.fillStyle = `rgba(255, 80, 80, ${0.35 + intensity * 0.3})`;
            ctx.shadowBlur = 0;
          }
        } else {
          // AMBIENT: Delikatna animacja wszędzie - zawsze widoczna
          const rand = Math.random();

          if (rand > 0.97) {
            // Losowe jasne błyski (3% szans)
            ctx.fillStyle = "#555";
            ctx.shadowColor = "#666";
            ctx.shadowBlur = 3;
          } else if (rand > 0.92) {
            // Średnie błyski (5% szans)
            ctx.fillStyle = "#3a3a3a";
            ctx.shadowBlur = 0;
          } else if (rand > 0.85) {
            // Delikatne błyski (7% szans)
            ctx.fillStyle = "#2a2a2a";
            ctx.shadowBlur = 0;
          } else {
            // Podstawowy kolor - ciemny ale widoczny
            ctx.fillStyle = "#1e1e1e";
            ctx.shadowBlur = 0;
          }
        }

        ctx.fillText(text, x, y);

        // Reset shadow for performance
        ctx.shadowBlur = 0;

        // Reset drop with slight randomization
        if (y > height + Math.random() * 10000) {
          ypos[ind] = 0;
        } else {
          ypos[ind] = y + 20;
        }
      });
    }

    // Start animation loop
    requestAnimationFrame(matrix);
  } // End of canvas block

  /* --- HAMBURGER MENU LOGIC --- */
  const hamburger = document.getElementById("hamburger-menu");
  const menu = document.getElementById("fullscreen-menu");

  if (hamburger && menu) {
    const menuLinks = menu.querySelectorAll("a");

    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      menu.classList.toggle("active");
    });

    // Close menu when clicking a link
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        menu.classList.remove("active");
      });
    });
  }

  /* --- SCROLL REVEAL ANIMATION --- */

  const observerOptions = {
    threshold: 0.15, // Trigger when 15% of item is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      }
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  /* --- SCROLL PROGRESS & BACK TO TOP --- */
  const progressWrap = document.getElementById("progress-wrap");

  if (progressWrap) {
    const progressPath = progressWrap.querySelector("path");

    if (progressPath) {
      const pathLength = progressPath.getTotalLength();

      // Initialize SVG path style
      progressPath.style.transition = progressPath.style.WebkitTransition = "none";
      progressPath.style.strokeDasharray = pathLength + " " + pathLength;
      progressPath.style.strokeDashoffset = pathLength;
      progressPath.getBoundingClientRect();
      progressPath.style.transition = progressPath.style.WebkitTransition =
        "stroke-dashoffset 10ms linear";

      const updateProgress = () => {
        const scroll = window.pageYOffset || document.documentElement.scrollTop;
        const height =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const progress = pathLength - (scroll * pathLength) / height;
        progressPath.style.strokeDashoffset = progress;
      };

      window.addEventListener("scroll", () => {
        updateProgress();

        // Show/Hide button
        if (window.pageYOffset > 50) {
          progressWrap.classList.add("active-progress");
        } else {
          progressWrap.classList.remove("active-progress");
        }
      });
    }

    // Scroll to top functionality
    progressWrap.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* --- CHATBOT LOGIC --- */
  const chatbotTrigger = document.getElementById("chatbot-trigger");
  const chatbotWindow = document.getElementById("chatbot-window");
  const chatbotClose = document.getElementById("chatbot-close");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");
  const chatbotMessages = document.getElementById("chatbot-messages");

  // Conversation context tracking
  let conversationContext = {
    lastTopic: null,
    questionCount: 0,
    userName: null,
    interestedIn: null,
  };

  // Only initialize chatbot if elements exist
  if (chatbotTrigger && chatbotWindow) {

  // Bot responses - rozbudowane odpowiedzi
  const botResponses = {
    // === POWITANIA ===
    greeting: [
      "Cześć! Miło Cię poznać. W czym mogę Ci dziś pomóc?",
      "Hej! Witaj na stronie DominDev. Czym mogę służyć?",
      "Dzień dobry! Jestem tutaj, żeby odpowiedzieć na Twoje pytania. O czym chcesz porozmawiać?",
    ],

    // === POŻEGNANIA ===
    farewell: [
      "Do zobaczenia! Jeśli będziesz mieć pytania, pisz śmiało.",
      "Pa pa! Powodzenia z projektem!",
      "Trzymaj się! Zawsze możesz wrócić, jestem tu 24/7.",
    ],

    // === USŁUGI - OGÓLNE ===
    services: [
      "Oferuję trzy główne usługi:<br><br>🚀 <strong>Landing Page</strong> - strona jednej akcji, idealna do kampanii<br>📄 <strong>Strona Wizytówka</strong> - kompletna strona firmowa z CMS<br>🛒 <strong>E-Commerce</strong> - sklep na WooCommerce<br><br>Która opcja Cię interesuje?",
      "Specjalizuję się w WordPress i oferuję: Landing Page, Strony Wizytówki oraz Sklepy E-Commerce. Każdy projekt jest szyty na miarę. O której usłudze chcesz wiedzieć więcej?",
    ],

    // === LANDING PAGE ===
    landing: [
      "🚀 <strong>Landing Page</strong> to strona skupiona na jednym celu - konwersji.<br><br>✓ Idealna do kampanii reklamowych<br>✓ Maksymalna szybkość ładowania<br>✓ Responsywny design<br>✓ Zoptymalizowana pod SEO<br><br>Świetna opcja na start. Chcesz poznać szczegóły cenowe?",
    ],

    // === STRONA WIZYTÓWKA ===
    businessCard: [
      "📄 <strong>Strona Wizytówka</strong> to fundament Twojej obecności online.<br><br>✓ Wiele podstron (O nas, Usługi, Kontakt...)<br>✓ System zarządzania treścią (CMS)<br>✓ Blog firmowy<br>✓ Integracja z social media<br>✓ Formularz kontaktowy<br><br>To najpopularniejsza opcja wśród moich klientów!",
    ],

    // === E-COMMERCE ===
    ecommerce: [
      "🛒 <strong>Sklep E-Commerce</strong> na WooCommerce to potężne narzędzie sprzedaży.<br><br>✓ Zarządzanie produktami i magazynem<br>✓ Integracja płatności (PayU, Przelewy24, BLIK)<br>✓ Integracja kurierów (InPost, DPD, DHL)<br>✓ Automatyzacja sprzedaży<br>✓ Panel administracyjny<br><br>Masz już produkty do sprzedaży?",
    ],

    // === CENY ===
    price: [
      "💰 Ceny zależą od zakresu projektu. Orientacyjnie:<br><br>• Landing Page: od 1500 zł<br>• Strona Wizytówka: od 3000 zł<br>• Sklep E-Commerce: od 5000 zł<br><br>Każdy projekt wyceniam indywidualnie. Napisz na <strong>kontakt@domindev.pl</strong> z opisem, a przygotuję dokładną wycenę.",
      "Ceny są ustalane indywidualnie - zależą od liczby podstron, funkcjonalności i złożoności projektu. Napisz mi więcej o swoim pomyśle, a przygotuję bezpłatną wycenę!",
    ],

    // === KONTAKT ===
    contact: [
      "📬 Możesz się ze mną skontaktować:<br><br>📧 Email: <strong>kontakt@domindev.pl</strong><br>📍 Lokalizacja: Wrocław, Polska<br><br>Odpisuję zazwyczaj w ciągu kilku godzin!",
      "Najszybciej odpowiem na maila: kontakt@domindev.pl. Możesz też kliknąć przycisk 'Napisz Wiadomość' na dole strony!",
    ],

    // === CZAS REALIZACJI ===
    time: [
      "⏱️ Orientacyjne czasy realizacji:<br><br>• Landing Page: 3-5 dni roboczych<br>• Strona Wizytówka: 1-2 tygodnie<br>• Sklep E-Commerce: 2-4 tygodnie<br><br>Dokładny termin ustalamy po analizie wymagań projektu.",
      "Czas realizacji zależy od złożoności. Proste projekty mogę dostarczyć w kilka dni, bardziej rozbudowane wymagają 2-4 tygodni. Zawsze dotrzymuję ustalonych terminów!",
    ],

    // === WORDPRESS ===
    wordpress: [
      "🔧 <strong>WordPress</strong> to moja specjalność!<br><br>✓ Ponad 40% stron na świecie działa na WP<br>✓ Pełna kontrola nad treścią<br>✓ Tysiące wtyczek i możliwości<br>✓ Świetne SEO out-of-the-box<br><br>Tworzę strony bez zbędnych wtyczek - szybkie i bezpieczne.",
      "WordPress + WooCommerce to potężne combo. Możesz samodzielnie zarządzać treścią bez znajomości programowania. Uczę też klientów obsługi panelu!",
    ],

    // === O MNIE / DOMINDEV ===
    about: [
      "👨‍💻 Jestem <strong>DominDev</strong> - Fullstack Developer z Wrocławia.<br><br>✓ Certyfikowany programista<br>✓ Doświadczenie w IT Security<br>✓ Obsesja na punkcie optymalizacji<br><br>Łączę inżynieryjne podejście z artystycznym zacięciem. Cukrzyca typu 1 nauczyła mnie żelaznej dyscypliny!",
      "DominDev to WordPress High-Performance. Tworzę strony, które są szybkie jak cios boksera i precyzyjne jak kod bankowy. Każdy projekt traktuję jak własny!",
    ],

    // === PROCES PRACY ===
    process: [
      "📋 Mój proces pracy składa się z 4 etapów:<br><br>1️⃣ <strong>Briefing & Analiza</strong> - poznajemy Twoje cele<br>2️⃣ <strong>UI/UX Design</strong> - tworzę makietę<br>3️⃣ <strong>Development</strong> - koduję stronę<br>4️⃣ <strong>Wdrożenie</strong> - publikacja i szkolenie<br><br>Na każdym etapie jesteś na bieżąco informowany o postępach!",
    ],

    // === PORTFOLIO ===
    portfolio: [
      "🎨 W moim portfolio znajdziesz projekty takie jak:<br><br>• FinTech Dashboard (WordPress/React)<br>• E-Commerce Sport (WooCommerce/ACF)<br>• CyberSecurity Agency (Custom Theme)<br><br>Przewiń do sekcji 'Realizacje' żeby zobaczyć więcej! Chcesz zobaczyć projekty z konkretnej branży?",
    ],

    // === TECHNOLOGIE ===
    tech: [
      "🛠️ Technologie, których używam:<br><br>• WordPress & WooCommerce<br>• PHP 8.2<br>• JavaScript & React<br>• HTML5 & CSS3<br>• ACF Pro<br>• SEO & Web Vitals<br><br>Wybieram narzędzia dopasowane do projektu, nie odwrotnie!",
    ],

    // === SEO ===
    seo: [
      "🔍 <strong>SEO</strong> to podstawa każdej mojej strony!<br><br>✓ Optymalizacja Core Web Vitals<br>✓ Szybkość ładowania < 3s<br>✓ Struktura przyjazna Google<br>✓ Meta tagi i Schema markup<br>✓ Responsywność (mobile-first)<br><br>Strona bez SEO to jak sklep bez adresu!",
    ],

    // === BEZPIECZEŃSTWO ===
    security: [
      "🔒 <strong>Bezpieczeństwo</strong> traktuję priorytetowo:<br><br>✓ Certyfikat SSL (HTTPS)<br>✓ Regularne aktualizacje<br>✓ Backup danych<br>✓ Ochrona przed atakami<br>✓ Bezpieczne formularze<br><br>Mam doświadczenie w IT Security - Twoje dane są bezpieczne!",
    ],

    // === HOSTING / DOMENA ===
    hosting: [
      "🌐 Mogę pomóc z hostingiem i domeną!<br><br>✓ Doradzę najlepszy hosting dla Twojego projektu<br>✓ Pomogę zarejestrować domenę<br>✓ Skonfiguruję wszystko od A do Z<br>✓ Mogę też przenieść istniejącą stronę<br><br>Nie musisz się martwić technicznymi szczegółami!",
    ],

    // === WSPARCIE / POMOC ===
    support: [
      "🆘 Po wdrożeniu strony oferuję:<br><br>✓ Szkolenie z obsługi CMS<br>✓ Dokumentację projektu<br>✓ Wsparcie techniczne<br>✓ Możliwość rozbudowy w przyszłości<br><br>Nie zostawiam klientów samych po projekcie!",
    ],

    // === PODZIĘKOWANIA ===
    thanks: [
      "Nie ma za co! Cieszę się, że mogłem pomóc. Masz jeszcze jakieś pytania?",
      "Proszę bardzo! Jestem tu, żeby pomagać. Co jeszcze chciałbyś wiedzieć?",
      "To ja dziękuję za zainteresowanie! Daj znać, jeśli potrzebujesz więcej informacji.",
    ],

    // === POZYTYWNE REAKCJE ===
    positive: [
      "Super! Cieszę się, że mogę pomóc. Co jeszcze chciałbyś wiedzieć?",
      "Świetnie! Masz jeszcze jakieś pytania dotyczące projektu?",
      "Fajnie! Jeśli jesteś zainteresowany współpracą, napisz na kontakt@domindev.pl!",
    ],

    // === WULGARNE - ZABAWNA REAKCJA ===
    vulgar: [
      "Ojej, mój algorytm właśnie się zarumienił! 😳 Może porozmawiamy o czymś konstruktywnym? Na przykład o Twojej wymarzonej stronie?",
      "Ups! Takie słowa to nie moja bajka. Jestem botem kulturalnym - wychowywał mnie czysty kod! Może opowiesz mi o swoim projekcie?",
      "Hola hola! Moje obwody nie są przystosowane do takiego języka. Zamieńmy temat na strony internetowe - tu jestem ekspertem!",
      "Error 418: Jestem czajnikiem i nie parzę takich słów! ☕ Ale chętnie zaparrzę Ci świetną stronę WWW!",
      "Mój firewall właśnie zablokował to słowo! 🛡️ Spróbujmy jeszcze raz - czym mogę Ci pomóc w kwestii strony internetowej?",
    ],

    // === PYTANIE O ROBOTA ===
    robot: [
      "Tak, jestem botem! 🤖 Ale bardzo pomocnym. Staram się odpowiadać na pytania o usługi DominDev. Jeśli potrzebujesz kontaktu z człowiekiem, napisz na kontakt@domindev.pl!",
      "Zgadza się, jestem asystentem AI! Pomagam odpowiadać na podstawowe pytania. Dla bardziej złożonych spraw polecam bezpośredni kontakt z Dominikiem.",
    ],

    // === ŻARTY / HUMOR ===
    joke: [
      "Dlaczego programista nosi okulary? Bo nie może C#! 😄 A tak serio, w czym mogę Ci pomóc?",
      "Co mówi programista PHP do HTML? 'Bez Ciebie nie mam wyjścia!' 😄 Dobra, wracamy do tematu?",
      "Ile programistów trzeba, żeby wymienić żarówkę? Żadnego - to problem sprzętowy! 😄 Masz pytanie o strony?",
    ],

    // === NIEZNANE - FALLBACK ===
    unknown: [
      "Hmm, nie jestem pewien czy dobrze rozumiem. Czy mógłbyś sprecyzować pytanie? Mogę pomóc z informacjami o:<br><br>• Usługach (Landing Page, Strony, Sklepy)<br>• Cenach i czasie realizacji<br>• Procesie współpracy<br>• Technologiach",
      "Przepraszam, nie do końca zrozumiałem. Jestem specjalistą od stron internetowych - zapytaj mnie o usługi, ceny, portfolio lub kontakt!",
      "Hmm, to wykracza poza moje możliwości. Ale jeśli chodzi o strony WWW, WordPress czy e-commerce - jestem do usług! O czym chcesz porozmawiać?",
    ],

    // === KONKURENCJA ===
    competition: [
      "Innych twórców stron szanuję! Ale jeśli szukasz kogoś, kto łączy szybkość, bezpieczeństwo i indywidualne podejście - dobrze trafiłeś. Każdy projekt traktuję jak własny!",
      "Na rynku jest wielu deweloperów, ale wyróżniam się obsesją na punkcie wydajności i bezpieczeństwa. Sprawdź moje portfolio i oceń sam!",
    ],

    // === OFERTA SPECJALNA ===
    discount: [
      "Aktualnie nie mam standardowych promocji - każdy projekt wyceniam indywidualnie i fair. Ale napisz do mnie z opisem projektu, a na pewno znajdziemy optymalne rozwiązanie dla Twojego budżetu!",
    ],

    // === BLOG ===
    blog: [
      "📝 <strong>Blog firmowy</strong> to świetne narzędzie marketingowe!<br><br>✓ Buduje pozycję eksperta<br>✓ Poprawia SEO (świeża treść)<br>✓ Przyciąga ruch organiczny<br>✓ Daje materiał do social media<br><br>Mogę zintegrować blog z Twoją stroną na WordPressie!",
    ],

    // === SOCIAL MEDIA ===
    socialMedia: [
      "📱 Integracja z <strong>social media</strong> to standard!<br><br>✓ Ikony i linki do profili<br>✓ Embedowanie postów<br>✓ Przyciski udostępniania<br>✓ Feed Instagram/Facebook na stronie<br><br>Połącz stronę z kanałami społecznościowymi!",
    ],

    // === FORMULARZ KONTAKTOWY ===
    form: [
      "📧 <strong>Formularz kontaktowy</strong> to must-have każdej strony!<br><br>✓ Walidacja pól<br>✓ Ochrona antyspamowa (reCAPTCHA)<br>✓ Powiadomienia email<br>✓ Zapis do bazy danych<br><br>Możemy też zintegrować z CRM lub newsletter.",
    ],

    // === REDESIGN / PRZEBUDOWA ===
    redesign: [
      "🔄 <strong>Redesign strony</strong> to moja specjalność!<br><br>✓ Analiza obecnej strony<br>✓ Modernizacja designu<br>✓ Poprawa UX i konwersji<br>✓ Optymalizacja wydajności<br>✓ Zachowanie SEO<br><br>Stara strona? Damy jej nowe życie!",
    ],

    // === UTRZYMANIE / MAINTENANCE ===
    maintenance: [
      "🔧 <strong>Utrzymanie strony</strong> to klucz do bezpieczeństwa!<br><br>✓ Aktualizacje WordPress i wtyczek<br>✓ Backup danych<br>✓ Monitoring bezpieczeństwa<br>✓ Drobne poprawki i zmiany<br><br>Oferuję pakiety maintenance - zapytaj o szczegóły!",
    ],

    // === STRONA WIELOJĘZYCZNA ===
    multilang: [
      "🌍 <strong>Strona wielojęzyczna</strong>? Żaden problem!<br><br>✓ WPML lub Polylang<br>✓ Przełącznik języków<br>✓ SEO dla każdej wersji językowej<br>✓ Automatyczne przekierowanie<br><br>Docieraj do klientów z całego świata!",
    ],

    // === ANALITYKA ===
    analytics: [
      "📊 <strong>Analityka</strong> to oczy Twojego biznesu online!<br><br>✓ Google Analytics 4<br>✓ Google Search Console<br>✓ Śledzenie konwersji<br>✓ Heatmapy i nagrania sesji<br><br>Bez danych nie ma optymalizacji!",
    ],

    // === SZYBKOŚĆ STRONY ===
    speed: [
      "⚡ <strong>Szybkość strony</strong> to moja obsesja!<br><br>✓ Optymalizacja obrazów (WebP)<br>✓ Lazy loading<br>✓ Minifikacja CSS/JS<br>✓ Cache i CDN<br>✓ Czysty kod bez bloatu<br><br>Celuję w wynik 90+ w PageSpeed!",
    ],

    // === DOSTĘPNOŚĆ (A11Y) ===
    accessibility: [
      "♿ <strong>Dostępność (WCAG)</strong> to odpowiedzialność!<br><br>✓ Kontrast kolorów<br>✓ Nawigacja klawiaturą<br>✓ Alt teksty dla obrazów<br>✓ Czytelne fonty<br>✓ Screen reader friendly<br><br>Strona dla wszystkich użytkowników!",
    ],

    // === GRAFIKA / ZDJĘCIA ===
    graphics: [
      "🎨 <strong>Grafika na stronę</strong>? Mogę pomóc!<br><br>✓ Dobór zdjęć stockowych<br>✓ Podstawowa obróbka graficzna<br>✓ Optymalizacja rozmiarów<br>✓ Ikony i ilustracje<br><br>Współpracuję też z grafikami - mogę polecić!",
    ],

    // === COPYWRITING ===
    copywriting: [
      "✍️ <strong>Copywriting</strong> to nie moja główna działka, ale:<br><br>✓ Mogę doradzić strukturę treści<br>✓ Pomogę z nagłówkami i CTA<br>✓ Zoptymalizuję teksty pod SEO<br><br>Na pełny copywriting polecę sprawdzonego copywritera!",
    ],

    // === STARTUP / NOWY BIZNES ===
    startup: [
      "🚀 Zaczynasz <strong>nowy biznes</strong>? Super wybór!<br><br>Na start polecam:<br>• Landing Page lub prostą wizytówkę<br>• Domenę i hosting<br>• Wizytówka Google Moja Firma<br>• Profile social media<br><br>Porozmawiajmy o Twoich celach!",
    ],

    // === LOKALNA FIRMA ===
    local: [
      "📍 <strong>Lokalna firma</strong>? Mam dla Ciebie rozwiązania!<br><br>✓ Google Moja Firma<br>✓ SEO lokalne (frazy + miasto)<br>✓ Mapa dojazdu na stronie<br>✓ Schema LocalBusiness<br><br>Klienci z okolicy Cię znajdą!",
    ],

    // === KORPORACJA / DUŻA FIRMA ===
    corporate: [
      "🏢 <strong>Strony korporacyjne</strong>? Mam doświadczenie!<br><br>✓ Rozbudowana struktura podstron<br>✓ Intranet i strefy klienta<br>✓ Integracje z systemami<br>✓ Wielojęzyczność<br>✓ Zaawansowane formularze<br><br>Porozmawiajmy o wymaganiach!",
    ],

    // === REZERWACJE / BOOKING ===
    booking: [
      "📅 <strong>System rezerwacji</strong>? Mogę zintegrować!<br><br>✓ Kalendarz dostępności<br>✓ Rezerwacje online<br>✓ Powiadomienia email/SMS<br>✓ Płatności zaliczek<br>✓ Panel zarządzania<br><br>Idealne dla salonów, gabinetów, trenerów!",
    ],

    // === CZŁONKOSTWO / SUBSKRYPCJE ===
    membership: [
      "🔐 <strong>Strefa członkowska</strong>? To możliwe!<br><br>✓ Rejestracja i logowanie<br>✓ Płatne subskrypcje<br>✓ Treści premium<br>✓ Kursy online<br>✓ Forum dla członków<br><br>Zbuduj społeczność wokół marki!",
    ],

    // === PŁATNOŚCI ===
    payments: [
      "💳 <strong>Płatności online</strong> integruję bez problemu!<br><br>Obsługuję:<br>• PayU, Przelewy24, Stripe<br>• BLIK, karty, przelewy<br>• Płatności ratalne<br>• Subskrypcje cykliczne<br><br>Bezpieczne i wygodne dla klientów!",
    ],

    // === FAKTURY / KSIĘGOWOŚĆ ===
    invoices: [
      "🧾 <strong>Faktury i integracje</strong> z systemami księgowymi?<br><br>✓ Automatyczne faktury WooCommerce<br>✓ Integracja z Fakturownia, iFirma<br>✓ Export do księgowości<br>✓ GTU i JPK ready<br><br>Automatyzacja oszczędza czas!",
    ],

    // === NEWSLETTER ===
    newsletter: [
      "📬 <strong>Newsletter</strong> buduje relacje z klientami!<br><br>✓ Formularze zapisu<br>✓ Integracja z MailerLite, Mailchimp<br>✓ Automatyczne sekwencje<br>✓ Segmentacja odbiorców<br><br>Email marketing wciąż działa najlepiej!",
    ],

    // === PROBLEMY Z OBECNĄ STRONĄ ===
    problems: [
      "🔧 <strong>Problemy z obecną stroną</strong>? Pomogę!<br><br>Diagnozuję i naprawiam:<br>• Wolne ładowanie<br>• Błędy 404 i 500<br>• Problemy z responsywnością<br>• Zhakowane strony<br>• Spadki w Google<br><br>Opisz problem - znajdziemy rozwiązanie!",
    ],

    // === MIGRACJA ===
    migration: [
      "🚚 <strong>Migracja strony</strong>? Przeniosę bezpiecznie!<br><br>✓ Z innego hostingu<br>✓ Z Wix/Squarespace na WordPress<br>✓ Zmiana domeny<br>✓ Zachowanie SEO (przekierowania 301)<br><br>Zero przestojów, pełne bezpieczeństwo!",
    ],

    // === DARMOWE VS PŁATNE ===
    freeVsPaid: [
      "💡 <strong>Darmowe kreatory vs profesjonalna strona</strong>?<br><br>Wix/Squarespace są OK na start, ale:<br>❌ Ograniczone możliwości<br>❌ Wolniejsze<br>❌ Brak pełnej kontroli<br>❌ Trudniejsze SEO<br><br>WordPress = nieograniczone możliwości i własność!",
    ],
  };

  // Keywords matching - rozbudowane
  const keywords = {
    greeting: [
      "cześć",
      "czesc",
      "hej",
      "witaj",
      "siema",
      "hello",
      "hi",
      "dzień dobry",
      "dzien dobry",
      "elo",
      "joł",
      "yo",
      "hejka",
      "siemka",
      "cześć!",
      "halo",
    ],
    farewell: [
      "pa",
      "papa",
      "do widzenia",
      "narazie",
      "nara",
      "bye",
      "goodbye",
      "do zobaczenia",
      "żegnaj",
      "trzymaj się",
    ],
    services: [
      "usługi",
      "uslugi",
      "oferta",
      "co robisz",
      "czym się zajmujesz",
      "co oferujesz",
      "jakie usługi",
      "w czym pomagasz",
    ],
    landing: [
      "landing page",
      "landing",
      "landingpage",
      "strona lądowania",
      "one page",
      "onepage",
      "jednostronicowa",
    ],
    businessCard: [
      "wizytówka",
      "wizytowka",
      "strona firmowa",
      "strona firmy",
      "firmowa strona",
      "business card",
      "strona wizytówka",
    ],
    ecommerce: [
      "sklep",
      "e-commerce",
      "ecommerce",
      "woocommerce",
      "sprzedaż online",
      "sklep internetowy",
      "shop",
      "sprzedawać",
    ],
    price: [
      "cena",
      "koszt",
      "ile kosztuje",
      "wycena",
      "budżet",
      "budzet",
      "cennik",
      "ile płacę",
      "ile zapłacę",
      "pricing",
      "kasa",
      "pieniądze",
      "za ile",
    ],
    contact: [
      "kontakt",
      "email",
      "mail",
      "telefon",
      "napisać",
      "napisac",
      "skontaktować",
      "gdzie cię znajdę",
      "jak się kontaktować",
      "numer",
    ],
    time: [
      "czas",
      "jak długo",
      "jak dlugo",
      "kiedy",
      "termin",
      "realizacja",
      "ile trwa",
      "deadline",
      "do kiedy",
      "jak szybko",
    ],
    wordpress: [
      "wordpress",
      "wp",
      "cms",
      "woocommerce",
      "wtyczki",
      "plugins",
      "theme",
      "motyw",
    ],
    about: [
      "o tobie",
      "kim jesteś",
      "kim jestes",
      "domindev",
      "domin dev",
      "twórca",
      "developer",
      "programista",
      "wrocław",
      "wroclaw",
      "kto ty",
    ],
    process: [
      "jak pracujesz",
      "proces",
      "etapy",
      "jak wygląda",
      "jak wyglada",
      "współpraca",
      "wspolpraca",
      "jak to działa",
    ],
    portfolio: [
      "portfolio",
      "realizacje",
      "projekty",
      "przykłady",
      "przyklady",
      "co robiłeś",
      "co robiles",
      "case study",
      "prace",
    ],
    tech: [
      "technologie",
      "tech stack",
      "narzędzia",
      "narzedzia",
      "czego używasz",
      "javascript",
      "react",
      "php",
      "html",
      "css",
      "acf",
    ],
    seo: [
      "seo",
      "pozycjonowanie",
      "google",
      "optymalizacja",
      "widoczność",
      "wyszukiwarka",
      "ranking",
    ],
    security: [
      "bezpieczeństwo",
      "bezpieczenstwo",
      "security",
      "ssl",
      "https",
      "ochrona",
      "backup",
      "bezpieczna",
    ],
    hosting: [
      "hosting",
      "domena",
      "serwer",
      "gdzie hostować",
      "przeniesienie strony",
      "migracja",
    ],
    support: [
      "wsparcie",
      "pomoc",
      "po wdrożeniu",
      "szkolenie",
      "nauka",
      "obsługa",
      "jak zarządzać",
    ],
    thanks: [
      "dziękuję",
      "dziekuje",
      "dzięki",
      "dzieki",
      "thanks",
      "thx",
      "dzięks",
      "super",
      "świetnie",
      "ok",
    ],
    positive: [
      "fajnie",
      "cool",
      "nice",
      "spoko",
      "okej",
      "dobra",
      "git",
      "extra",
      "bomba",
      "zajebiste",
      "super!",
    ],
    robot: [
      "bot",
      "robot",
      "ai",
      "sztuczna inteligencja",
      "automat",
      "czy jesteś człowiekiem",
      "czy jestes czlowiekiem",
      "człowiek czy bot",
    ],
    joke: [
      "żart",
      "zart",
      "dowcip",
      "kawał",
      "kawal",
      "pośmiej się",
      "joke",
      "śmieszne",
      "smieszne",
      "haha",
      "lol",
    ],
    competition: [
      "konkurencja",
      "inni",
      "dlaczego ty",
      "czemu ty",
      "lepszy",
      "porównanie",
    ],
    discount: [
      "zniżka",
      "znizka",
      "rabat",
      "promocja",
      "taniej",
      "discount",
      "promo",
    ],
    blog: [
      "blog",
      "blogowanie",
      "artykuły",
      "artykuly",
      "wpisy",
      "publikacje",
      "content marketing",
    ],
    socialMedia: [
      "social media",
      "facebook",
      "instagram",
      "linkedin",
      "twitter",
      "tiktok",
      "media społecznościowe",
      "social",
    ],
    form: [
      "formularz",
      "formularz kontaktowy",
      "kontakt formularz",
      "forma kontaktu",
      "jak się skontaktować przez stronę",
    ],
    redesign: [
      "redesign",
      "przebudowa",
      "odświeżenie",
      "odswiezenie",
      "modernizacja",
      "nowy wygląd",
      "zmiana wyglądu",
      "stara strona",
    ],
    maintenance: [
      "utrzymanie",
      "opieka",
      "maintenance",
      "aktualizacje",
      "serwis strony",
      "opieka nad stroną",
    ],
    multilang: [
      "wielojęzyczna",
      "wielojezyczna",
      "język",
      "jezyk",
      "angielska wersja",
      "tłumaczenie",
      "tlumaczenie",
      "inne języki",
      "po angielsku",
    ],
    analytics: [
      "analytics",
      "analityka",
      "statystyki",
      "google analytics",
      "ga4",
      "tracking",
      "śledzenie",
    ],
    speed: [
      "szybkość",
      "szybkosc",
      "wolna strona",
      "ładowanie",
      "ladowanie",
      "page speed",
      "wydajność",
      "wydajnosc",
      "optymalizacja",
    ],
    accessibility: [
      "dostępność",
      "dostepnosc",
      "wcag",
      "a11y",
      "niepełnosprawni",
      "czytnik ekranu",
      "accessibility",
    ],
    graphics: [
      "grafika",
      "zdjęcia",
      "zdjecia",
      "obrazki",
      "foto",
      "ilustracje",
      "ikony",
      "stocki",
    ],
    copywriting: [
      "copywriting",
      "teksty",
      "treści",
      "tresci",
      "pisanie tekstów",
      "copy",
    ],
    startup: [
      "startup",
      "nowy biznes",
      "nowa firma",
      "zaczynam",
      "początek",
      "poczatek",
      "pierwszy projekt",
    ],
    local: [
      "lokalna",
      "lokalny",
      "moje miasto",
      "okolica",
      "w mojej miejscowości",
      "google moja firma",
      "gmf",
    ],
    corporate: [
      "korporacja",
      "korporacyjna",
      "duża firma",
      "enterprise",
      "rozbudowana strona",
    ],
    booking: [
      "rezerwacje",
      "rezerwacja",
      "booking",
      "kalendarz",
      "umawianie",
      "wizyty",
      "terminy",
    ],
    membership: [
      "członkostwo",
      "czlonkostwo",
      "subskrypcja",
      "premium",
      "logowanie",
      "rejestracja",
      "strefa klienta",
      "konto użytkownika",
    ],
    payments: [
      "płatności",
      "platnosci",
      "payu",
      "przelewy24",
      "stripe",
      "blik",
      "płacenie online",
      "bramka płatności",
    ],
    invoices: [
      "faktury",
      "fakturowanie",
      "księgowość",
      "ksiegowosc",
      "fakturownia",
      "ifirma",
      "jpk",
    ],
    newsletter: [
      "newsletter",
      "mailing",
      "mailchimp",
      "mailerlite",
      "email marketing",
      "zapis do newslettera",
    ],
    problems: [
      "problem",
      "nie działa",
      "nie dziala",
      "błąd",
      "blad",
      "zhakowana",
      "hack",
      "zepsuta",
      "wolna",
      "spadła pozycja",
    ],
    migration: [
      "migracja",
      "przeniesienie",
      "przenieść",
      "przeniesc",
      "zmiana hostingu",
      "zmiana domeny",
      "z wix",
      "z squarespace",
    ],
    freeVsPaid: [
      "wix",
      "squarespace",
      "kreator stron",
      "darmowa strona",
      "za darmo",
      "samemu zrobić",
    ],
  };

  // Wulgarne słowa (podstawowe - filtr)
  const vulgarWords = [
    "kurwa",
    "kurwy",
    "kurwą",
    "chuj",
    "chuja",
    "chujem",
    "chuje",
    "pierdol",
    "pierdole",
    "pierdoli",
    "pierdolę",
    "pierdolony",
    "jebać",
    "jebac",
    "jebany",
    "jebana",
    "jebie",
    "jebię",
    "skurwysyn",
    "skurwiel",
    "szmata",
    "dziwka",
    "suka",
    "dupa",
    "dupą",
    "dupie",
    "gówno",
    "gowno",
    "srać",
    "srac",
    "fuck",
    "shit",
    "bitch",
    "asshole",
    "dick",
    "pussy",
    "cholera",
    "psiakrew",
    "kurde",
    "kurna",
    "do diabła",
    "idiota",
    "debil",
    "kretyn",
    "głupek",
    "glupek",
    "dureń",
    "duren",
  ];

  // === SŁOWNIK POJĘĆ ===
  // Wzorce pytań: "co to", "czym jest", "co znaczy", "definicja", "wyjaśnij"
  const glossary = {
    // --- STRONY WWW ---
    "landing page":
      "📄 <strong>Landing Page</strong> - jednostronicowa strona nastawiona na jeden cel (np. sprzedaż, zapis na newsletter). Bez menu, maksymalnie prosta, zoptymalizowana pod konwersję.",
    "strona wizytówka":
      "🏢 <strong>Strona Wizytówka</strong> - wielostronicowa strona firmowa prezentująca firmę, usługi i dane kontaktowe. Fundament obecności online każdej firmy.",
    "one page":
      "📄 <strong>One Page</strong> - to samo co Landing Page. Cała treść na jednej, przewijanej stronie bez podstron.",
    "strona responsywna":
      "📱 <strong>Responsywność</strong> - strona automatycznie dostosowuje się do ekranu urządzenia (komputer, tablet, telefon). Dziś to standard.",
    "strona statyczna":
      "📁 <strong>Strona statyczna</strong> - strona bez bazy danych, czyste pliki HTML/CSS/JS. Szybka, bezpieczna, ale trudniejsza w edycji bez wiedzy technicznej.",
    "strona dynamiczna":
      "⚙️ <strong>Strona dynamiczna</strong> - strona z bazą danych i CMS. Treść można edytować przez panel administracyjny bez znajomości kodu.",

    // --- CMS I TECHNOLOGIE ---
    cms: "🔧 <strong>CMS</strong> (Content Management System) - system do zarządzania treścią strony przez panel administracyjny. Przykłady: WordPress, Joomla, Drupal.",
    wordpress:
      "🔵 <strong>WordPress</strong> - najpopularniejszy CMS na świecie (~43% stron). Darmowy, elastyczny, z tysiącami wtyczek i motywów.",
    woocommerce:
      "🛒 <strong>WooCommerce</strong> - darmowa wtyczka do WordPressa zamieniająca stronę w sklep internetowy. Obsługuje płatności, dostawy, magazyn.",
    theme:
      "🎨 <strong>Theme (motyw)</strong> - szablon graficzny strony WordPress. Definiuje wygląd, układ i podstawowe funkcje.",
    plugin:
      "🔌 <strong>Plugin (wtyczka)</strong> - dodatek rozszerzający funkcjonalność strony. Np. formularz kontaktowy, SEO, galeria zdjęć.",
    wtyczka:
      "🔌 <strong>Wtyczka</strong> - to samo co plugin. Dodatek do CMS rozszerzający jego możliwości.",
    acf: "📝 <strong>ACF</strong> (Advanced Custom Fields) - wtyczka WordPress do tworzenia własnych pól edycji. Pozwala dostosować panel admina do potrzeb klienta.",
    api: "🔗 <strong>API</strong> - interfejs pozwalający różnym systemom komunikować się ze sobą. Np. połączenie strony z systemem płatności.",
    frontend:
      "🖥️ <strong>Frontend</strong> - warstwa wizualna strony, którą widzi użytkownik. HTML, CSS, JavaScript.",
    backend:
      "⚙️ <strong>Backend</strong> - warstwa serwerowa strony, niewidoczna dla użytkownika. Logika, baza danych, przetwarzanie.",
    fullstack:
      "👨‍💻 <strong>Fullstack</strong> - developer znający zarówno frontend jak i backend. Może zbudować całą aplikację od A do Z.",

    // --- SEO I MARKETING ---
    seo: "🔍 <strong>SEO</strong> (Search Engine Optimization) - optymalizacja strony pod wyszukiwarki. Cel: wyższa pozycja w Google = więcej odwiedzin.",
    pozycjonowanie:
      "📈 <strong>Pozycjonowanie</strong> - to samo co SEO. Działania mające na celu poprawę widoczności strony w wynikach wyszukiwania.",
    konwersja:
      "🎯 <strong>Konwersja</strong> - wykonanie przez użytkownika pożądanej akcji (zakup, zapis, kontakt). Wskaźnik skuteczności strony.",
    cta: "🔘 <strong>CTA</strong> (Call To Action) - przycisk lub link zachęcający do działania. Np. 'Kup teraz', 'Zapisz się', 'Skontaktuj się'.",
    "call to action":
      "🔘 <strong>Call To Action</strong> - element strony zachęcający użytkownika do podjęcia konkretnej akcji (kliknięcia, zakupu, kontaktu).",
    ux: "🧠 <strong>UX</strong> (User Experience) - doświadczenie użytkownika. Jak łatwo i przyjemnie korzysta się ze strony.",
    ui: "🎨 <strong>UI</strong> (User Interface) - interfejs użytkownika. Wygląd przycisków, formularzy, menu - wszystko co widać.",
    "bounce rate":
      "📉 <strong>Bounce Rate</strong> - współczynnik odrzuceń. Procent osób, które opuściły stronę bez interakcji. Im niższy, tym lepiej.",
    "core web vitals":
      "📊 <strong>Core Web Vitals</strong> - metryki Google mierzące szybkość i użyteczność strony. Wpływają na pozycję w wyszukiwarce.",

    // --- HOSTING I DOMENY ---
    hosting:
      "🖥️ <strong>Hosting</strong> - usługa przechowywania plików strony na serwerze, dzięki czemu jest dostępna online 24/7.",
    domena:
      "🌐 <strong>Domena</strong> - adres strony w internecie (np. domindev.pl). Unikalny identyfikator Twojej witryny.",
    ssl: "🔒 <strong>SSL</strong> - certyfikat bezpieczeństwa szyfrujący dane między użytkownikiem a stroną. Wymagany dla HTTPS i zaufania klientów.",
    https:
      "🔐 <strong>HTTPS</strong> - bezpieczny protokół komunikacji (z certyfikatem SSL). Kłódka w pasku adresu. Standard od 2018 roku.",
    ftp: "📤 <strong>FTP</strong> - protokół do przesyłania plików na serwer. Używany przy wgrywaniu i aktualizacji stron.",
    dns: "🔀 <strong>DNS</strong> - system tłumaczący domenę na adres IP serwera. Dzięki niemu wpisujesz nazwę, nie numery.",
    cdn: "🚀 <strong>CDN</strong> (Content Delivery Network) - sieć serwerów przyspieszająca ładowanie strony poprzez serwowanie treści z najbliższego serwera.",

    // --- E-COMMERCE ---
    "e-commerce":
      "🛍️ <strong>E-commerce</strong> - handel elektroniczny. Sprzedaż produktów lub usług przez internet.",
    koszyk:
      "🛒 <strong>Koszyk</strong> - miejsce gromadzenia produktów przed zakupem w sklepie internetowym.",
    checkout:
      "💳 <strong>Checkout</strong> - proces finalizacji zamówienia: dane, dostawa, płatność, potwierdzenie.",
    "bramka płatności":
      "💰 <strong>Bramka płatności</strong> - system obsługujący płatności online (np. PayU, Przelewy24, Stripe, BLIK).",
    dropshipping:
      "📦 <strong>Dropshipping</strong> - model sprzedaży bez własnego magazynu. Dostawca wysyła produkt bezpośrednio do klienta.",

    // --- BEZPIECZEŃSTWO ---
    backup:
      "💾 <strong>Backup</strong> - kopia zapasowa strony. Niezbędna do odtworzenia w razie awarii lub ataku.",
    firewall:
      "🛡️ <strong>Firewall</strong> - zapora sieciowa chroniąca przed nieautoryzowanym dostępem i atakami.",
    malware:
      "🦠 <strong>Malware</strong> - złośliwe oprogramowanie. Wirusy, trojany mogące zainfekować stronę.",
    ddos: "⚠️ <strong>DDoS</strong> - atak polegający na przeciążeniu serwera tysiącami zapytań, co powoduje niedostępność strony.",

    // --- INNE PRZYDATNE ---
    briefing:
      "📋 <strong>Briefing</strong> - spotkanie/dokument określający cele, wymagania i oczekiwania wobec projektu.",
    mockup:
      "🖼️ <strong>Mockup</strong> - wizualizacja projektu strony przed kodowaniem. Pokazuje jak będzie wyglądać efekt końcowy.",
    wireframe:
      "📐 <strong>Wireframe</strong> - szkielet strony bez grafiki. Pokazuje rozmieszczenie elementów i strukturę.",
    responsywność:
      "📱 <strong>Responsywność</strong> - zdolność strony do automatycznego dostosowania się do rozmiaru ekranu.",
    "mobile first":
      "📲 <strong>Mobile First</strong> - podejście projektowe: najpierw projektujemy wersję mobilną, potem desktopową.",
    favicon:
      "⭐ <strong>Favicon</strong> - mała ikona strony wyświetlana na karcie przeglądarki i w zakładkach.",
    "above the fold":
      "👆 <strong>Above The Fold</strong> - część strony widoczna bez przewijania. Najważniejsza przestrzeń reklamowa.",
    "lazy loading":
      "⏳ <strong>Lazy Loading</strong> - technika ładowania obrazów dopiero gdy są potrzebne. Przyspiesza start strony.",
    cache:
      "💨 <strong>Cache</strong> - pamięć podręczna przechowująca dane do szybszego ponownego załadowania strony.",
    minifikacja:
      "📦 <strong>Minifikacja</strong> - kompresja kodu (usunięcie spacji, komentarzy) dla szybszego ładowania.",

    // --- NOWE: DESIGN & UX ---
    "hero section":
      "🦸 <strong>Hero Section</strong> - główna sekcja na górze strony z nagłówkiem, hasłem i CTA. Pierwsze co widzi użytkownik.",
    header:
      "📌 <strong>Header</strong> - nagłówek strony z logo i menu nawigacyjnym. Zazwyczaj przyklejony na górze.",
    footer:
      "📍 <strong>Footer</strong> - stopka strony z kontaktem, linkami i informacjami prawnymi. Na samym dole.",
    sidebar:
      "📐 <strong>Sidebar</strong> - boczny panel strony, często z menu, widgetami lub reklamami.",
    breadcrumbs:
      "🍞 <strong>Breadcrumbs</strong> - ścieżka nawigacji pokazująca gdzie jesteś na stronie (np. Strona główna > Blog > Artykuł).",
    "hamburger menu":
      "☰ <strong>Hamburger Menu</strong> - ikona trzech kresek ukrywająca menu na urządzeniach mobilnych.",
    modal:
      "🪟 <strong>Modal</strong> - wyskakujące okienko nakładane na stronę (popup). Używane do formularzy, alertów.",
    slider:
      "🎠 <strong>Slider</strong> - karuzela zdjęć lub treści przesuwająca się automatycznie lub manualnie.",
    accordion:
      "🪗 <strong>Accordion</strong> - rozwijane sekcje FAQ. Kliknięcie rozwija odpowiedź, oszczędza miejsce.",
    tooltip:
      "💬 <strong>Tooltip</strong> - dymek z podpowiedzią pojawiający się po najechaniu na element.",
    placeholder:
      "📝 <strong>Placeholder</strong> - tekst zastępczy w polu formularza znikający po kliknięciu.",
    grid: "🔲 <strong>Grid</strong> - układ siatki do rozmieszczania elementów na stronie. CSS Grid to standard.",
    flexbox:
      "📏 <strong>Flexbox</strong> - system układu CSS do elastycznego pozycjonowania elementów w rzędach/kolumnach.",

    // --- NOWE: PROGRAMOWANIE ---
    html: "🏗️ <strong>HTML</strong> - język znaczników definiujący strukturę strony. Szkielet każdej witryny.",
    css: "🎨 <strong>CSS</strong> - język stylów określający wygląd strony: kolory, fonty, układy, animacje.",
    javascript:
      "⚡ <strong>JavaScript</strong> - język programowania dodający interaktywność stronie. Animacje, formularze, dynamika.",
    php: "🐘 <strong>PHP</strong> - język backendowy używany przez WordPress. Przetwarza dane i generuje strony.",
    mysql:
      "🗄️ <strong>MySQL</strong> - baza danych przechowująca treści strony. WordPress używa MySQL.",
    json: "📋 <strong>JSON</strong> - format wymiany danych. Lekki, czytelny dla ludzi i maszyn.",
    "rest api":
      "🔌 <strong>REST API</strong> - interfejs do komunikacji między systemami przez HTTP. WordPress ma wbudowane.",
    git: "🌿 <strong>Git</strong> - system kontroli wersji. Śledzi zmiany w kodzie, umożliwia cofanie i współpracę.",
    github:
      "🐙 <strong>GitHub</strong> - platforma do hostowania kodu i współpracy developerów. Portfolio programisty.",
    npm: "📦 <strong>NPM</strong> - menedżer pakietów JavaScript. Instaluje biblioteki i narzędzia.",
    webpack:
      "📦 <strong>Webpack</strong> - bundler łączący pliki JS/CSS w zoptymalizowane paczki.",
    sass: "💅 <strong>SASS/SCSS</strong> - preprocesor CSS dodający zmienne, zagnieżdżenia i funkcje.",
    bootstrap:
      "🅱️ <strong>Bootstrap</strong> - framework CSS z gotowymi komponentami. Przyspiesza tworzenie stron.",
    tailwind:
      "🌊 <strong>Tailwind CSS</strong> - framework utility-first. Style przez klasy w HTML.",
    react:
      "⚛️ <strong>React</strong> - biblioteka JavaScript do budowania interfejsów. Komponenty i Virtual DOM.",
    vue: "💚 <strong>Vue.js</strong> - framework JavaScript do tworzenia aplikacji. Reaktywny i łatwy w nauce.",
    "node.js":
      "💚 <strong>Node.js</strong> - środowisko uruchomieniowe JavaScript po stronie serwera.",

    // --- NOWE: WORDPRESS SZCZEGÓŁY ---
    gutenberg:
      "📝 <strong>Gutenberg</strong> - edytor blokowy WordPressa. Tworzenie treści przez przeciąganie bloków.",
    elementor:
      "🔧 <strong>Elementor</strong> - popularny page builder WordPress. Drag & drop bez kodowania.",
    divi: "🎨 <strong>Divi</strong> - motyw i builder WordPress. Wizualny edytor z wieloma modułami.",
    "child theme":
      "👶 <strong>Child Theme</strong> - motyw potomny dziedziczący po głównym. Bezpieczne modyfikacje.",
    "custom post type":
      "📑 <strong>Custom Post Type</strong> - własny typ treści w WP (np. Portfolio, Produkty, Referencje).",
    taxonomy:
      "🏷️ <strong>Taxonomy</strong> - system kategoryzacji w WP. Kategorie i tagi to wbudowane taksonomie.",
    shortcode:
      "⚡ <strong>Shortcode</strong> - krótki kod w nawiasach [] wstawiający dynamiczną treść w WordPress.",
    hook: "🪝 <strong>Hook</strong> - punkt zaczepienia w WP pozwalający modyfikować działanie bez zmiany kodu źródłowego.",
    "wp-admin":
      "🔐 <strong>WP-Admin</strong> - panel administracyjny WordPressa. Dostęp przez /wp-admin.",
    "wp-config":
      "⚙️ <strong>wp-config.php</strong> - plik konfiguracyjny WP z danymi bazy, kluczami bezpieczeństwa.",

    // --- NOWE: SEO ZAAWANSOWANE ---
    serp: "📊 <strong>SERP</strong> - strona wyników wyszukiwania Google. Pozycja w SERP = widoczność.",
    "meta title":
      "📰 <strong>Meta Title</strong> - tytuł strony widoczny w wynikach Google i na karcie przeglądarki.",
    "meta description":
      "📝 <strong>Meta Description</strong> - opis strony w wynikach Google. Max 160 znaków, zachęca do kliknięcia.",
    canonical:
      "🔗 <strong>Canonical URL</strong> - znacznik wskazujący główną wersję strony. Zapobiega duplikatom.",
    sitemap:
      "🗺️ <strong>Sitemap</strong> - mapa strony XML ułatwiająca robotom Google indeksowanie treści.",
    "robots.txt":
      "🤖 <strong>Robots.txt</strong> - plik instruujący roboty wyszukiwarek co mogą indeksować.",
    "alt text":
      "🖼️ <strong>Alt Text</strong> - tekst alternatywny obrazu dla SEO i dostępności.",
    "anchor text":
      "⚓ <strong>Anchor Text</strong> - klikalny tekst linku. Ważny dla SEO wewnętrznego i zewnętrznego.",
    backlink:
      "🔙 <strong>Backlink</strong> - link do Twojej strony z innej witryny. Buduje autorytet w Google.",
    keyword:
      "🔑 <strong>Keyword</strong> - słowo kluczowe, fraza którą użytkownicy wpisują w Google.",
    "long tail keyword":
      "🦎 <strong>Long Tail Keyword</strong> - długa, szczegółowa fraza (np. 'tani fryzjer Wrocław Krzyki').",
    "rich snippet":
      "⭐ <strong>Rich Snippet</strong> - rozszerzony wynik w Google z gwiazdkami, ceną, dostępnością.",
    "schema markup":
      "🏷️ <strong>Schema Markup</strong> - kod strukturalny pomagający Google zrozumieć treść strony.",
    "google search console":
      "🔍 <strong>Google Search Console</strong> - darmowe narzędzie Google do monitorowania widoczności strony.",
    "google analytics":
      "📈 <strong>Google Analytics</strong> - narzędzie do analizy ruchu na stronie. Kto, skąd, co robi.",

    // --- NOWE: BEZPIECZEŃSTWO ZAAWANSOWANE ---
    phishing:
      "🎣 <strong>Phishing</strong> - atak polegający na podszywaniu się pod zaufaną stronę/osobę.",
    xss: "💉 <strong>XSS</strong> - atak wstrzykujący złośliwy kod JavaScript na stronę.",
    "sql injection":
      "�� <strong>SQL Injection</strong> - atak wstrzykujący kod SQL do bazy danych przez formularz.",
    "brute force":
      "🔨 <strong>Brute Force</strong> - atak próbujący odgadnąć hasło przez masowe próby.",
    "2fa":
      "🔐 <strong>2FA</strong> - dwuskładnikowe uwierzytelnianie. Hasło + kod z telefonu.",
    captcha:
      "🤖 <strong>CAPTCHA</strong> - test odróżniający ludzi od botów. Chroni formularze przed spamem.",
    recaptcha:
      "✅ <strong>reCAPTCHA</strong> - system Google weryfikujący czy użytkownik jest człowiekiem.",
    waf: "🛡️ <strong>WAF</strong> - Web Application Firewall. Zapora chroniąca aplikację przed atakami.",

    // --- NOWE: E-COMMERCE SZCZEGÓŁY ---
    sku: "🏷️ <strong>SKU</strong> - unikalny kod produktu w magazynie. Ułatwia zarządzanie asortymentem.",
    upselling:
      "⬆️ <strong>Upselling</strong> - oferowanie droższej wersji produktu (np. większy rozmiar).",
    "cross-selling":
      "↔️ <strong>Cross-selling</strong> - oferowanie produktów powiązanych (np. etui do telefonu).",
    "abandoned cart":
      "🛒 <strong>Abandoned Cart</strong> - porzucony koszyk. Email przypominający może odzyskać sprzedaż.",
    "conversion rate":
      "📊 <strong>Conversion Rate</strong> - współczynnik konwersji. Procent odwiedzających dokonujących zakupu.",
    "payment gateway":
      "💳 <strong>Payment Gateway</strong> - bramka płatności łącząca sklep z bankiem/operatorem.",
    inventory:
      "📦 <strong>Inventory</strong> - stan magazynowy produktów w sklepie.",

    // --- NOWE: MARKETING DIGITAL ---
    ppc: "💰 <strong>PPC</strong> - Pay Per Click. Model reklamowy gdzie płacisz za kliknięcie (np. Google Ads).",
    cpc: "💵 <strong>CPC</strong> - Cost Per Click. Koszt jednego kliknięcia w reklamę.",
    cpm: "👁️ <strong>CPM</strong> - Cost Per Mille. Koszt za 1000 wyświetleń reklamy.",
    roi: "📈 <strong>ROI</strong> - Return On Investment. Zwrot z inwestycji w marketing.",
    funnel:
      "🔻 <strong>Funnel</strong> - lejek sprzedażowy. Ścieżka klienta od pierwszego kontaktu do zakupu.",
    lead: "👤 <strong>Lead</strong> - potencjalny klient który zostawił kontakt (np. przez formularz).",
    "lead magnet":
      "🧲 <strong>Lead Magnet</strong> - gratka (ebook, rabat) w zamian za email. Buduje bazę kontaktów.",
    "a/b testing":
      "🔬 <strong>A/B Testing</strong> - test dwóch wersji strony/elementu. Wygrywa skuteczniejsza.",
    heatmap:
      "🔥 <strong>Heatmap</strong> - mapa ciepła pokazująca gdzie użytkownicy klikają i scrollują.",
    retargeting:
      "🎯 <strong>Retargeting</strong> - reklamy śledzące użytkowników którzy odwiedzili Twoją stronę.",

    // --- NOWE: HOSTING & INFRASTRUKTURA ---
    vps: "🖥️ <strong>VPS</strong> - Virtual Private Server. Wirtualny serwer z dedykowanymi zasobami.",
    "dedicated server":
      "🏢 <strong>Dedicated Server</strong> - fizyczny serwer tylko dla Ciebie. Maksymalna wydajność.",
    "shared hosting":
      "👥 <strong>Shared Hosting</strong> - hosting współdzielony. Tani, ale zasoby dzielone z innymi.",
    "cloud hosting":
      "☁️ <strong>Cloud Hosting</strong> - hosting w chmurze. Skalowalny, płacisz za użycie.",
    uptime:
      "⏰ <strong>Uptime</strong> - czas dostępności serwera. 99.9% = max ~8h niedostępności rocznie.",
    bandwidth:
      "📶 <strong>Bandwidth</strong> - przepustowość transferu danych. Ile GB miesięcznie możesz przesłać.",
    cpanel:
      "🎛️ <strong>cPanel</strong> - panel do zarządzania hostingiem. Pliki, bazy, email, domeny.",
    phpmyadmin:
      "🗄️ <strong>phpMyAdmin</strong> - narzędzie do zarządzania bazą MySQL przez przeglądarkę.",

    // --- NOWE: PRAWNE & BIZNESOWE ---
    rodo: "📋 <strong>RODO/GDPR</strong> - rozporządzenie o ochronie danych osobowych. Wymaga zgód i polityki prywatności.",
    "polityka prywatności":
      "📜 <strong>Polityka Prywatności</strong> - dokument opisujący jak strona zbiera i przetwarza dane.",
    cookies:
      "🍪 <strong>Cookies</strong> - małe pliki zapisywane w przeglądarce. Wymagają zgody użytkownika.",
    regulamin:
      "📑 <strong>Regulamin</strong> - zasady korzystania ze strony/sklepu. Obowiązkowy dla e-commerce.",
    nip: "🏛️ <strong>NIP</strong> - Numer Identyfikacji Podatkowej. Wymagany na fakturach i stronie firmy.",
    "ssl certificate":
      "🔒 <strong>Certyfikat SSL</strong> - potwierdza tożsamość strony i szyfruje dane. Zielona kłódka.",

    // --- NOWE: RÓŻNE PRZYDATNE ---
    mvp: "🚀 <strong>MVP</strong> - Minimum Viable Product. Najprostsza wersja produktu do szybkiego startu.",
    agile:
      "🔄 <strong>Agile</strong> - metodyka pracy w krótkich cyklach (sprintach). Elastyczna i iteracyjna.",
    scrum:
      "📊 <strong>Scrum</strong> - framework Agile z rolami (Product Owner, Scrum Master) i ceremoniami.",
    deploy:
      "🚀 <strong>Deploy</strong> - wdrożenie, publikacja strony na serwerze produkcyjnym.",
    staging:
      "🧪 <strong>Staging</strong> - środowisko testowe. Kopia strony do testów przed publikacją.",
    localhost:
      "🏠 <strong>Localhost</strong> - lokalny serwer na Twoim komputerze do developmentu.",
    debug:
      "🐛 <strong>Debug</strong> - szukanie i naprawianie błędów w kodzie.",
    framework:
      "🏗️ <strong>Framework</strong> - gotowy szkielet do budowania aplikacji. Przyspiesza development.",
    "cms headless":
      "🤯 <strong>Headless CMS</strong> - CMS bez frontendu. Dostarcza treści przez API do dowolnego interfejsu.",
    jamstack:
      "⚡ <strong>JAMstack</strong> - architektura stron: JavaScript, API, Markup. Superszybkie i bezpieczne.",
    pwa: "📱 <strong>PWA</strong> - Progressive Web App. Strona działająca jak aplikacja mobilna.",
    spa: "🔄 <strong>SPA</strong> - Single Page Application. Strona ładująca się raz, bez przeładowań.",
  };

  // Wzorce pytań o definicje
  const definitionPatterns = [
    "co to jest",
    "co to",
    "czym jest",
    "co znaczy",
    "co oznacza",
    "definicja",
    "wyjaśnij",
    "wytłumacz",
    "powiedz mi co to",
    "nie wiem co to",
    "nie rozumiem co to",
    "co masz na myśli",
  ];

  // Funkcja sprawdzająca czy pytanie dotyczy definicji
  function checkGlossary(message) {
    const lowerMessage = message.toLowerCase();

    // Sprawdź czy to pytanie o definicję
    const isDefinitionQuestion = definitionPatterns.some((pattern) =>
      lowerMessage.includes(pattern)
    );

    if (isDefinitionQuestion) {
      // Szukaj terminu w słowniku
      for (const [term, definition] of Object.entries(glossary)) {
        if (lowerMessage.includes(term)) {
          return definition;
        }
      }
    }

    // Sprawdź też bezpośrednie zapytanie o termin (np. samo "landing page?")
    for (const [term, definition] of Object.entries(glossary)) {
      // Jeśli wiadomość to głównie sam termin (z pytajnikiem lub bez)
      const cleanMessage = lowerMessage.replace(/[?!.,]/g, "").trim();
      if (cleanMessage === term || cleanMessage === `co to ${term}`) {
        return definition;
      }
    }

    return null;
  }

  // Funkcja pomocnicza - losowy element z tablicy
  function getRandomResponse(responses) {
    if (Array.isArray(responses)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
    return responses;
  }

  // Sprawdzenie wulgarności
  function containsVulgar(message) {
    const lowerMessage = message.toLowerCase();
    return vulgarWords.some((word) => lowerMessage.includes(word));
  }

  // Toggle chatbot window
  function toggleChatbot() {
    chatbotWindow.classList.toggle("active");
    chatbotTrigger.classList.toggle("active");

    if (chatbotWindow.classList.contains("active")) {
      chatbotInput.focus();
    }
  }

  // Close chatbot
  function closeChatbot() {
    chatbotWindow.classList.remove("active");
    chatbotTrigger.classList.remove("active");
  }

  // Add message to chat
  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${isUser ? "user" : "bot"}`;
    messageDiv.innerHTML = `<div class="message-content">${text}</div>`;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Show typing indicator
  function showTyping() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-message bot";
    typingDiv.id = "typing-indicator";
    typingDiv.innerHTML = `
      <div class="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  // Remove typing indicator
  function removeTyping() {
    const typing = document.getElementById("typing-indicator");
    if (typing) {
      typing.remove();
    }
  }

  // Get bot response based on keywords
  function getBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Najpierw sprawdź wulgaryzmy
    if (containsVulgar(lowerMessage)) {
      return getRandomResponse(botResponses.vulgar);
    }

    // Sprawdź słownik pojęć (pytania "co to jest X?")
    const glossaryResponse = checkGlossary(userMessage);
    if (glossaryResponse) {
      conversationContext.lastTopic = "glossary";
      conversationContext.questionCount++;
      return glossaryResponse;
    }

    // Sprawdź słowa kluczowe
    for (const [category, words] of Object.entries(keywords)) {
      for (const word of words) {
        if (lowerMessage.includes(word)) {
          conversationContext.lastTopic = category;
          conversationContext.questionCount++;
          return getRandomResponse(botResponses[category]);
        }
      }
    }

    // Fallback - nieznane pytanie
    conversationContext.questionCount++;
    return getRandomResponse(botResponses.unknown);
  }

  // Send message
  function sendMessage() {
    const message = chatbotInput.value.trim();

    if (message === "") return;

    // Add user message
    addMessage(message, true);
    chatbotInput.value = "";

    // Show typing indicator
    showTyping();

    // Simulate bot response delay (różny czas dla realizmu)
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      removeTyping();
      const response = getBotResponse(message);
      addMessage(response);
    }, delay);
  }

  // Event Listeners
  chatbotTrigger.addEventListener("click", toggleChatbot);
  chatbotClose.addEventListener("click", closeChatbot);
  chatbotSend.addEventListener("click", sendMessage);

  chatbotInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

    // Close chatbot on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && chatbotWindow.classList.contains("active")) {
        closeChatbot();
      }
    });
  } // End of chatbot block

  /* --- CONTACT FORM & BUDGET SLIDER --- */
  const budgetInput = document.getElementById("budget");
  const budgetValue = document.getElementById("budgetValue");
  const contactForm = document.getElementById("contactForm");
  const formMessage = document.getElementById("formMessage");

  if (budgetInput && budgetValue) {
    budgetInput.addEventListener("input", (e) => {
      const val = parseInt(e.target.value);
      if (val === 0) {
        budgetValue.innerText = "Partnerstwo | Win-Win";
      } else if (val >= 25000) {
        budgetValue.innerText = "Bez Limitu (25k+)";
      } else {
        budgetValue.innerText = val.toLocaleString("pl-PL") + " PLN";
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector("button");
      const originalText = btn.innerText;
      btn.innerText = "WYSYŁANIE...";
      btn.disabled = true;

      // Simulate sending (replace with actual API call)
      setTimeout(() => {
        btn.innerText = "WYSŁANO!";
        btn.style.backgroundColor = "#2ecc71";
        btn.style.color = "black";
        if (formMessage) {
          formMessage.innerText = "Dzięki! Wiadomość wysłana. Odezwę się wkrótce.";
          formMessage.style.color = "#2ecc71";
        }
        contactForm.reset();
        if (budgetValue) budgetValue.innerText = "Partnerstwo | Win-Win";

        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.backgroundColor = "";
          btn.style.color = "";
          btn.disabled = false;
          if (formMessage) formMessage.innerText = "";
        }, 4000);
      }, 1500);
    });
  }

  /* --- CUSTOM CURSOR LOGIC --- */
  const cursorDot = document.getElementById("cursor-dot");
  const cursorOutline = document.getElementById("cursor-outline");

  // Uruchom tylko na desktopie (> 1024px)
  if (cursorDot && cursorOutline && window.matchMedia("(min-width: 1024px)").matches) {

    // 1. Ruch kursora
    window.addEventListener("mousemove", (e) => {
      const posX = e.clientX;
      const posY = e.clientY;

      // Kropka (środek) - ruch natychmiastowy
      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;

      // Okrąg (outline) - lekki lag (płynność)
      cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
      }, { duration: 500, fill: "forwards" });
    });

    // 2. Efekt Hover na interaktywnych elementach
    const interactiveSelectors = "a, button, input, textarea, select, .project-card, .service-card, .chatbot-trigger, input[type='range'], input[type='checkbox']";
    const interactiveElements = document.querySelectorAll(interactiveSelectors);

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", () => {
        document.body.classList.add("hovering");
      });
      el.addEventListener("mouseleave", () => {
        document.body.classList.remove("hovering");
      });
    });

    // 3. Ukrywanie kursora po wyjechaniu z okna
    document.addEventListener("mouseleave", () => {
      document.body.classList.add("cursor-hidden");
    });
    document.addEventListener("mouseenter", () => {
      document.body.classList.remove("cursor-hidden");
    });
  }
});
