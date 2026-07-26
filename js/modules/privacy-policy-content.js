export const PRIVACY_POLICY_HTML = `
  <div class="privacy-header">
    <h2 id="privacy-title">
      Polityka prywatności
      <span class="logo" style="font-size: 2rem; display: inline-block;">Domin<span>Dev</span>.</span>
    </h2>
    <p><strong>Ostatnia aktualizacja:</strong> 26 lipca 2026</p>
  </div>

  <h2>I. Najważniejsze odpowiedzi</h2>
  <p class="privacy-faq-disclaimer">Bez prawniczego labiryntu. Szczegóły znajdują się w sekcji II.</p>

  <div class="privacy-faq-container">
    <details class="privacy-details">
      <summary class="privacy-summary">
        <span class="privacy-question-text"><i class="fa-solid fa-shield-halved accent" aria-hidden="true"></i>Czy moje dane są sprzedawane albo używane do spamu?</span>
        <i class="fa-solid fa-chevron-down chevron" aria-hidden="true"></i>
      </summary>
      <div class="privacy-answer"><p>Nie. Dane służą do obsługi Twojego zapytania, briefu i ewentualnej współpracy. DominDev nie sprzedaje ich i nie prowadzi newslettera marketingowego.</p></div>
    </details>

    <details class="privacy-details">
      <summary class="privacy-summary">
        <span class="privacy-question-text"><i class="fa-solid fa-floppy-disk accent" aria-hidden="true"></i>Co dzieje się ze szkicem briefu?</span>
        <i class="fa-solid fa-chevron-down chevron" aria-hidden="true"></i>
      </summary>
      <div class="privacy-answer"><p>Szkic zapisuje się wyłącznie w pamięci Twojej przeglądarki na maksymalnie 24 godziny. Nie trafia do DominDev przed wysłaniem briefu i możesz usunąć go ręcznie.</p></div>
    </details>

    <details class="privacy-details">
      <summary class="privacy-summary">
        <span class="privacy-question-text"><i class="fa-solid fa-user-xmark accent" aria-hidden="true"></i>Czy mogę uzyskać dostęp do danych albo je usunąć?</span>
        <i class="fa-solid fa-chevron-down chevron" aria-hidden="true"></i>
      </summary>
      <div class="privacy-answer"><p>Tak. Napisz na <strong>contact@domindev.com</strong>. Możesz poprosić m.in. o dostęp, korektę, ograniczenie lub usunięcie danych.</p></div>
    </details>

    <details class="privacy-details">
      <summary class="privacy-summary">
        <span class="privacy-question-text"><i class="fa-solid fa-eye-slash accent" aria-hidden="true"></i>Czy strona mnie profiluje?</span>
        <i class="fa-solid fa-chevron-down chevron" aria-hidden="true"></i>
      </summary>
      <div class="privacy-answer"><p>Nie. Strona nie używa reklamowych ani profilujących mechanizmów śledzących. Cloudflare może przetwarzać ograniczone dane techniczne w celu ochrony strony i tworzenia zbiorczych statystyk.</p></div>
    </details>
  </div>

  <div style="width: 100%; height: 1px; background: rgba(255,255,255,0.1); margin: 0 0 30px 0;"></div>

  <h2>II. Pełna informacja</h2>

  <h3>1. Administrator i kontakt</h3>
  <p>Administratorem danych jest <strong>Paweł Dominiak</strong>, działający pod nazwą <strong>DominDev</strong>. Kontakt w sprawach danych: <strong>contact@domindev.com</strong> lub <strong>+48 536 553 820</strong>.</p>

  <h3>2. Jakie dane mogą być przetwarzane</h3>
  <ul>
    <li>dane wpisane w formularzu kontaktowym: imię lub nazwa, e-mail, wiadomość, wybrana usługa, budżet i informacja o zgodzie;</li>
    <li>dane podane w briefie projektowym, jeśli zdecydujesz się go wysłać;</li>
    <li>ograniczone dane techniczne potrzebne do bezpieczeństwa, w tym adres IP lub jego skrót, informacje o żądaniu i wynik weryfikacji antyspamowej.</li>
  </ul>

  <h3>3. Cele i podstawy przetwarzania</h3>
  <p>Dane są używane do odpowiedzi na zapytanie, przygotowania oferty, obsługi briefu i podjęcia działań przed zawarciem umowy, a także do zapewnienia bezpieczeństwa, ograniczania spamu i obrony przed roszczeniami. Podstawą jest — zależnie od sytuacji — zgoda, działania na Twoje żądanie przed zawarciem umowy oraz prawnie uzasadniony interes Administratora.</p>

  <h3>4. Dostawcy technologii</h3>
  <p>W niezbędnym zakresie dane mogą być obsługiwane przez:</p>
  <ul>
    <li><strong>Cloudflare</strong> — hosting, ochrona strony, Turnstile, limity nadużyć, Web Analytics oraz krótkotrwały zapis awaryjny lub obsługa linku do briefu;</li>
    <li><strong>Resend</strong> — wysyłka wiadomości e-mail związanych z zapytaniem i briefem.</li>
  </ul>
  <p>Dostawcy mogą przetwarzać dane poza Europejskim Obszarem Gospodarczym z zastosowaniem mechanizmów prawnych wymaganych przez RODO.</p>

  <h3>5. Jak długo dane są przechowywane</h3>
  <ul>
    <li>korespondencja dotycząca zapytania lub projektu — przez czas potrzebny do obsługi sprawy, a standardowo nie dłużej niż 24 miesiące od ostatniego kontaktu; dłużej tylko wtedy, gdy wymaga tego prawo, umowa lub ochrona przed roszczeniami;</li>
    <li>awaryjna kopia niewysłanego zapytania w Cloudflare KV — maksymalnie 7 dni;</li>
    <li>rekord i jednorazowy link do briefu — maksymalnie 7 dni;</li>
    <li>lokalny szkic briefu — maksymalnie 24 godziny w Twojej przeglądarce; jest usuwany po prawidłowym wysłaniu lub na Twoje żądanie;</li>
    <li>techniczne rekordy ograniczające spam — przez czas działania danego limitu, zwykle od 10 minut do 24 godzin.</li>
  </ul>

  <h3>6. Cookies, pamięć przeglądarki i statystyka</h3>
  <p>Strona nie używa marketingowych cookies ani profilowania reklamowego. Mechanizmy bezpieczeństwa Cloudflare mogą używać technicznych danych przeglądarki. Cloudflare Web Analytics dostarcza zbiorczą statystykę bez tworzenia profilu marketingowego. Pamięć <code>localStorage</code> jest używana wyłącznie do 24-godzinnego szkicu briefu.</p>

  <h3>7. Twoje prawa</h3>
  <p>Możesz zażądać dostępu do danych, ich sprostowania, usunięcia, ograniczenia lub przeniesienia, wnieść sprzeciw wobec przetwarzania opartego na prawnie uzasadnionym interesie, cofnąć zgodę oraz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych. Cofnięcie zgody nie wpływa na zgodność wcześniejszego przetwarzania z prawem.</p>

  <h3>8. Bezpieczeństwo</h3>
  <p>Stosowane są m.in. szyfrowanie TLS, Cloudflare Turnstile, limity żądań, ograniczony dostęp do danych i awaryjny zapis z automatycznym terminem usunięcia. Żaden system nie daje absolutnej gwarancji, dlatego zakres zbieranych danych jest ograniczony do potrzeb obsługi kontaktu.</p>

  <br><br>
  <button class="btn full-width" type="button" data-action="close-privacy">Zamknij politykę</button>
`;
