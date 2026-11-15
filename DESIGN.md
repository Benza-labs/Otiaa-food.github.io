---
name: OTIAA de Maman Berthe
description: Ein gedeckter Tisch aus echten Fotos auf Sand, mit Tinte-Bändern und Gold nur als Fläche.
colors:
  sand: "#F7F1E2"
  ink: "#171310"
  gold: "#FEB34E"
  gold-deep: "#8F5716"
  terracotta: "#C67139"
  sage: "#7A8A5E"
  field-cream: "#FFFAF0"
typography:
  display:
    fontFamily: "Caprasimo, Georgia, serif"
    fontSize: "clamp(2.4rem, 5.6vw, 4.9rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Figtree, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.7rem, 3.2vw, 2.6rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Figtree, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "clamp(1.25rem, 2vw, 1.6rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Figtree, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "Figtree, system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.78rem"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "0.2em"
rounded:
  sm: "12px"
  md: "20px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4vw, 40px)"
  section: "clamp(64px, 9vw, 120px)"
  header: "72px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sand}"
    rounded: "{rounded.pill}"
    padding: "0.8em 1.7em"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.terracotta}"
    textColor: "{colors.ink}"
  button-on-ink:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.8em 1.7em"
    height: "52px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.8em 1.7em"
    height: "52px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "10px 20px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sand}"
  input:
    backgroundColor: "{colors.field-cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "14px 16px"
    height: "52px"
  photo-frame:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.md}"
  cta-band:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
---

# Design System: OTIAA de Maman Berthe

Quelle der Wahrheit ist `site.css` (Tokens als Custom Properties auf `:root`). Die HTML-Seiten werden von `tools/build.mjs` erzeugt. Texte ändert man dort (und in `content/*.html` für FAQ und Rechtliches), danach `node tools/build.mjs`. Nie die erzeugten `*.html` von Hand bearbeiten.

## Overview

**Creative North Star: "Der gedeckte Tisch"**

Große, echte Fotos und Videos tragen jede Seite. Der Grund ist warmer Sand, der Text ist kurz und gastfreundlich, und der Topf ist der Star. Die Seite ist ein Brand-Book-Ableger (Brand Book 2026, vom Nutzer gepinnt): Farben und Schriften sind Vorgabe, nicht Geschmack.

Das System ist flach und linienbasiert. Tiefe entsteht durch Wechsel von Sand-Fläche und Tinte-Band, durch 1px-Linien und durch große abgerundete Fotos, nicht durch Schatten. Gold ist eine Fläche (Button auf Tinte, Balken, Band), nie ein Textton auf Sand.

**Key Characteristics:**
- Sand als Grund (etwa 70 %), Tinte für Bänder (Rezensionen, Mobilmenü, Footer)
- Caprasimo nur für die H1 jeder Seite, Figtree für alles andere
- 20px-Radius für Fotos und Bänder, Pillen für Buttons, Chips und Tags
- 1px-Linien in Tinte oder 18 % Tinte statt Schatten
- Echte Fotos in 4:3, 4:5, 9:16; keine Muster als Layout-Dekor

## Colors

Warm, erdig, wenig Farbe: ein Papier-Sand, eine fast schwarze Tinte und ein Gold, das nur als Fläche leuchtet.

### Primary
- **Tinte** (`{colors.ink}`): Text, Primär-Button, Bänder, Footer, Linien. Der Anker des Systems.
- **Kamerun-Gold** (`{colors.gold}`): Fläche auf Tinte (Buttons, Sterne, Footer-Titel), Auswahlfarbe, CTA-Band, Balken unter Wörtern. Nie Text auf Sand.

### Secondary
- **Gold dunkel** (`{colors.gold-deep}`): Text-Gold auf Sand: Labels, Produkt-Untertitel, Häkchen, Icons, Links in Rechtstexten.
- **Terrakotta** (`{colors.terracotta}`): Hover von Buttons, Fokusring, Scrollbar.

### Tertiary
- **Salbei** (`{colors.sage}`): im Brand Book definiert, im Stylesheet aktuell nur als Token angelegt und nirgends verwendet.

### Neutral
- **Sand** (`{colors.sand}`): Seitengrund, Header, Text auf Tinte.
- **Feldcreme** (`{colors.field-cream}`): Formularfelder und Hinweisboxen, eine Spur heller als Sand.
- Abgeleitet per Alpha: Tinte 72 % (Fließtext sekundär), Tinte 18 % (Linien), Sand 78 % (Text auf Tinte), Sand 22 % (Linien auf Tinte).

### Named Rules
**The Gold-Is-A-Surface Rule.** Gold (#FEB34E) füllt Flächen oder unterstreicht als Balken. Auf Sand ist Text-Gold immer Gold dunkel.
**The Ink-Band Rule.** Dunkle Bänder sind Tinte, nie Schwarz oder Braun, und sie tragen Sand-Text.

## Typography

**Display Font:** Caprasimo (Georgia, serif)
**Body Font:** Figtree (system-ui, sans-serif), variabel 300 bis 700, selbst gehostet (`fonts/*.woff2`)

**Character:** Eine weiche, fette Schmuckschrift als einmaliger Auftritt über einer klaren, freundlichen Grotesk.

### Hierarchy
- **Display** (400, clamp 2.4rem bis 4.9rem, 1.04): ausschließlich die H1 jeder Seite. Rechtstexte verkleinern sie auf clamp 2rem bis 3.4rem.
- **Headline** (700, clamp 1.7rem bis 2.6rem, 1.12): H2, Abschnittstitel.
- **Title** (700, clamp 1.25rem bis 1.6rem, 1.12): H3, Zeilen- und Produkttitel.
- **Body** (400, 1.0625rem, 1.6): Fließtext, max. 68ch.
- **Label** (500, 0.78rem, 0.2em, Großbuchstaben): Meta-Angaben wie Datum, Kategorie, Foto-Credit.

### Named Rules
**The One Caprasimo Rule.** Caprasimo steht nur auf der H1. Alle anderen Überschriften sind Figtree 700.
**The Meta-Only Label Rule.** Das Label-Format kennzeichnet Datum, Kategorie oder Credit. Es sitzt nicht als Kicker über einer Überschrift.

## Layout

Container maximal 1280px, seitlich `clamp(16px, 4vw, 40px)`. Abschnitte haben `clamp(64px, 9vw, 120px)` Luft. Kopf ist sticky (72px, Sand, 1px Linie).

Die Grundfigur ist ein Zweispalter 7fr/5fr mit Foto oder Video gegenüber dem Text, abwechselnd gespiegelt (`.row.flip` 5fr/7fr). Hero: Text 7/12, hohes Foto 5/12 (4:5), mobil Foto zuerst (5:4). Galerie läuft als Masonry (3 Spalten ab 280px, mobil 2), Videos als Auto-Fill-Raster ab 240px. Events sind eine Zeitleiste mit 220px-Datumsspalte (sticky). Umbruch auf eine Spalte bei 960px, Mobilmenü als Tinte-Vollfläche. Weitere Schwellen: 1100px (Markenname weg), 700px, 560px.

## Elevation & Depth

Flach. Tiefe kommt von Tinte-Bändern gegen Sand, 1px-Linien und großen Foto-Flächen. Der einzige Schatten ist der schwebende WhatsApp-Button (`box-shadow: 0 6px 18px rgba(23, 19, 16, 0.28)`).

### Named Rules
**The Line-Not-Shadow Rule.** Trennung durch 1px-Linien (Tinte oder 18 % Tinte). Kein weiterer Schatten, kein Hard-Offset.

## Shapes

Zwei Radien plus Pille: 20px für Fotos, Videos, Produktbild, CTA-Band und Kartenrahmen; 12px für Raster-Thumbnails, Event-Medien, Felder und Hinweisboxen; 999px für Buttons, Chips, Tags, Sprachschalter und das Hero-Chip. Runde Marke (Logo als Kreis, 52px im Kopf, 84px im Footer). Alle Medien haben `object-fit: cover` in festen Seitenverhältnissen.

## Components

### Buttons
- **Shape:** Pille (999px), Mindesthöhe 52px, 2px Rand, Figtree 600.
- **Primary:** Tinte-Fläche, Sand-Text, Padding 0.8em 1.7em.
- **Hover / Focus:** Terrakotta-Fläche mit Tinte-Text; Fokusring 3px Terrakotta, 3px Abstand (auf Tinte Gold). Aktiv: 1px nach unten.
- **Ghost:** transparent mit Tinte-Rand; Hover füllt Tinte.
- **Auf Tinte:** Gold-Fläche mit Tinte-Text; Hover Sand.
- **Mobil:** Buttons laufen volle Breite (unter 560px).

### Chips und Tags
- **Filter-Chip:** Pille, 1px Tinte-Rand, 44px hoch; Hover Gold 35 %; gewählt Tinte-Fläche mit Sand-Text (`aria-pressed`).
- **Tag:** Pille mit 1px Tinte-Rand, Figtree 600, nicht klickbar.

### Cards / Containers
Es gibt keine Icon-Karten. Inhalte sind Zeilen (Foto + Text), Linienlisten (`event-list`, 1px Linien, Hover Gold 22 % mit eingerücktem Padding) und das CTA-Band (Gold-Fläche, 20px Radius, Padding bis 80px). Rahmenboxen (`next-dates`, Hinweisboxen) nutzen 1px Tinte-Linie, ohne Schatten.

### Inputs / Fields
Feldcreme-Fläche, 1.5px Tinte-Rand, 12px Radius, mindestens 52px hoch, Label darüber in Figtree 600. Fokus: 3px Tinte-Ring mit 2px Abstand. Checkbox 22px mit Tinte-Akzent.

### Navigation
Sand-Kopf mit Logo, Textnavigation (Figtree 500, aktiv 700 mit 2px Tinte-Linie, Hover 2px Gold-Linie), Sprachschalter DE/FR/EN als Pillen-Gruppe und Rundknopf für das Menü. Unter 960px öffnet ein Tinte-Overlay mit großen Zeilen (1.5rem, Gold für die aktive Seite).

### Foto- und Videorahmen (Signatur)
Jedes Medium sitzt in einem Rahmen mit Tinte-Hintergrund und festem Seitenverhältnis. Hero-Foto trägt unten eine Sand-Pille mit Pfeil (Link zum letzten Event), oben rechts einen Credit in dunkler Pille. Galerie öffnet in einem nativen `<dialog>` als Lightbox auf 94 % Tinte.

### Bewegung
Ein Moment: das Hero-Foto enthüllt sich per Clip-Path (1.1s) und setzt von Scale 1.12 auf 1 (1.6s). Sonst sanftes Einblenden per `data-reveal` (22px, 0.8s). Alles hinter `prefers-reduced-motion: no-preference`. Easing überall `cubic-bezier(0.22, 1, 0.36, 1)`.

## Do's and Don'ts

### Do:
- **Do** Sand als Grund und Tinte als Band nutzen; Gold nur als Fläche oder Balken.
- **Do** Text-Gold auf Sand immer als Gold dunkel (#8F5716) setzen.
- **Do** Caprasimo nur für die H1 verwenden, den Rest in Figtree.
- **Do** echte Fotos und Videos in festen Seitenverhältnissen mit 20px (oder 12px im Raster) Radius zeigen.
- **Do** Trennung durch 1px-Linien lösen und Buttons als Pillen mit mindestens 52px Höhe bauen.
- **Do** Fotos von Naomi Hattler mit "Foto: Naomi Hattler" kennzeichnen.

### Don't:
- **Don't** Gold als Textfarbe auf Sand verwenden.
- **Don't** Wax- oder Ankara-Muster als Layout-Dekor einsetzen; sie gehören nur ins Foto.
- **Don't** ein Raster gleich großer Icon-Karten, Stock- oder KI-Bilder bauen.
- **Don't** Schatten zur Trennung nutzen (nur der WhatsApp-Button hat einen).
- **Don't** das Logo auf unruhigen Bildbereichen platzieren.

Nicht kanonisiert (Defekte oder Abweichungen im Build): die Pfeil-Zeichen als Text-Glyph in `.link-arrow` und `.hero-chip` (Unicode-Pfeil statt SVG); das Label-Format ist auch im Footer über Spaltentiteln (`.site-footer h3`) im Einsatz, was einem Kicker nahekommt; Salbei ist als Token vorhanden, aber nicht verbaut.
