"""
═══════════════════════════════════════════════════════════════════
SUBSET IKON FONT AWESOME - tylko te, ktore strona faktycznie uzywa
═══════════════════════════════════════════════════════════════════

PO CO TO JEST
-------------
Font Awesome to komplet ~1900 ikon spakowany w dwa pliki fontu
(fa-solid-900.woff2 = 147 KB, fa-brands-400.woff2 = 106 KB). Strona uzywa
30 ikon. Bez subsetowania kazdy odwiedzajacy pobiera 253 KB, zeby zobaczyc
rakiete, logo GitHuba i kilka strzalek.

Ten skrypt czyta index.html, ustala ktore ikony sa realnie uzywane, bierze
ich kanoniczne kody z pelnej dystrybucji Font Awesome i generuje okrojone
pliki fontu zawierajace wylacznie te glify.

WYMAGANIA
---------
    py -3 -m pip install fonttools brotli

JAK URUCHOMIC
-------------
    py -3 _scripts/subset-icons.py            # generuje subsety
    py -3 _scripts/subset-icons.py --check    # tylko raport, bez zapisu

KIEDY URUCHAMIAC
----------------
Po KAZDYM dodaniu nowej ikony do index.html. Nowa ikona nie znajdzie sie
w okrojonym foncie automatycznie - dopoki nie przegenerujesz, bedzie
niewidoczna.

Skrypt sam ostrzega, jesli ikona jest uzyta w HTML, ale nie ma reguly
`content:` w css/critical.css - to wlasnie ten blad sprawil, ze
8 ikon (m.in. strzalki rozwijania w FAQ) nie wyswietlalo sie na produkcji.

ZRODLA PRAWDY
-------------
  index.html                      -> ktore ikony i w jakiej rodzinie
  assets/fonts/fontawesome.min.css -> kanoniczne kody unicode (pelna dystrybucja)
  assets/fonts/originals/*.woff2   -> pelne fonty, z nich tniemy
  css/critical.css        -> reguly content: uzywane przez strone

Pelne fonty i pelny CSS zostaja w repo celowo - bez nich nie da sie
odtworzyc subsetu ani dodac nowej ikony.
═══════════════════════════════════════════════════════════════════
"""
import io
import os
import re
import sys
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# WSZYSTKIE strony serwisu, nie tylko index.html. Kazda podstrona uslugowa moze
# uzywac ikony, ktorej nie ma na stronie glownej - jesli skanujemy tylko
# index.html, taka ikona nie trafia do subsetu i renderuje sie jako nic
# (element o zerowej szerokosci, bez zadnego bledu w konsoli).
HTML_PAGES = [
    os.path.join(ROOT, 'index.html'),
    os.path.join(ROOT, '404.html'),
    os.path.join(ROOT, 'maintenance.html'),
    os.path.join(ROOT, 'brief', 'index.html'),
]
# + kazda podstrona uslugowa w roocie (strony-*.html, sklepy-*.html itd.)
HTML_PAGES += [os.path.join(ROOT, f) for f in sorted(os.listdir(ROOT))
               if f.endswith('.html') and os.path.join(ROOT, f) not in HTML_PAGES]
FULL_CSS = os.path.join(ROOT, 'assets', 'fonts', 'fontawesome.min.css')
CRIT_CSS = os.path.join(ROOT, 'css', 'critical.css')
ORIG_DIR = os.path.join(ROOT, 'assets', 'fonts', 'originals')
OUT_DIR = os.path.join(ROOT, 'assets', 'fonts')

FAMILIES = {
    'solid': ('fa-solid-900.woff2', ('fa-solid', 'fas')),
    'brands': ('fa-brands-400.woff2', ('fa-brands', 'fab')),
}
# Klasy pomocnicze Font Awesome - to nie sa nazwy ikon
MODIFIERS = {'fa-solid', 'fa-brands', 'fa-regular', 'fa-light', 'fa-thin',
             'fa-duotone', 'fa-fw', 'fa-spin', 'fa-beat', 'fa-shake',
             'fa-2x', 'fa-3x', 'fa-lg', 'fa-sm', 'fa-xs'}


def kanoniczne_kody():
    """Klasa ikony -> codepoint, z pelnej dystrybucji Font Awesome."""
    css = io.open(FULL_CSS, encoding='utf-8', errors='ignore').read()
    mapa = {}
    for m in re.finditer(r'([^{}]+)\{\s*content:\s*"\\([0-9a-fA-F]+)"\s*\}', css):
        for sel in re.findall(r'\.(fa-[a-z0-9-]+)::?before', m.group(1)):
            mapa[sel] = m.group(2).upper()
    return mapa


def uzyte_ikony(mapa):
    """Klasa -> rodzina, na podstawie atrybutow class we wszystkich stronach."""
    html = ''
    for strona in HTML_PAGES:
        if os.path.exists(strona):
            html += io.open(strona, encoding='utf-8').read()
    uzyte = {}
    for m in re.finditer(r'class="([^"]*\bfa-[a-z0-9-]+[^"]*)"', html):
        klasy = m.group(1).split()
        rodzina = 'brands' if any(k in FAMILIES['brands'][1] for k in klasy) else 'solid'
        for k in klasy:
            if k.startswith('fa-') and k not in MODIFIERS and k in mapa:
                uzyte[k] = rodzina
    return uzyte


def zdefiniowane_w_critical():
    crit = io.open(CRIT_CSS, encoding='utf-8').read()
    return set(re.findall(r'\.(fa-[a-z0-9-]+)::before\s*\{\s*content:', crit))


def main():
    tylko_raport = '--check' in sys.argv

    mapa = kanoniczne_kody()
    uzyte = uzyte_ikony(mapa)
    zdef = zdefiniowane_w_critical()

    print('Ikon uzytych na %d stronach: %d' % (len([x for x in HTML_PAGES if os.path.exists(x)]), len(uzyte)))

    brak = sorted(k for k in uzyte if k not in zdef)
    if brak:
        print('')
        print('!!! UWAGA: %d ikon uzytych w HTML nie ma reguly content: w critical.css.' % len(brak))
        print('    Bez niej ikona sie NIE wyswietli. Dopisz do critical.css:')
        for k in brak:
            print('      .%s::before { content: "\\%s"; }' % (k, mapa[k].lower()))
        print('')

    nadmiar = sorted(zdef - set(uzyte))
    if nadmiar:
        print('Zdefiniowane w critical.css, ale nieuzywane (%d): %s'
              % (len(nadmiar), ', '.join(nadmiar)))

    if tylko_raport:
        print('')
        print('--check: nie zapisuje plikow.')
        return 0

    print('')
    for rodzina, (plik, _) in FAMILIES.items():
        ikony = sorted(k for k, v in uzyte.items() if v == rodzina)
        if not ikony:
            print('%-8s pominiete (zadna ikona nie uzywa tej rodziny)' % rodzina)
            continue

        zrodlo = os.path.join(ORIG_DIR, plik)
        if not os.path.exists(zrodlo):
            print('BLAD: brak pelnego fontu %s - nie mam z czego ciac.' % zrodlo)
            return 1

        cel = os.path.join(OUT_DIR, plik)
        unicodes = ','.join('U+' + mapa[k] for k in ikony)

        przed = os.path.getsize(zrodlo)
        subprocess.run([
            sys.executable, '-m', 'fontTools.subset', zrodlo,
            '--unicodes=' + unicodes,
            '--flavor=woff2',
            '--layout-features=',       # ikony nie potrzebuja funkcji OpenType
            '--no-hinting',
            '--desubroutinize',
            '--output-file=' + cel,
        ], check=True)
        po = os.path.getsize(cel)

        print('%-8s %2d ikon: %6.1f KB -> %5.1f KB  (-%d%%)'
              % (rodzina, len(ikony), przed / 1024, po / 1024,
                 round((1 - po / przed) * 100)))

    print('')
    print('Gotowe. Uruchom `npm run minify` i sprawdz strone - kazda ikona')
    print('powinna miec niezerowa szerokosc.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
