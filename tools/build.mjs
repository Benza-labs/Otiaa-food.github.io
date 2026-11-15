// Baut alle HTML-Seiten von otiaa.de aus gemeinsamen Bausteinen.
// Aufruf im Repo-Ordner:  node tools/build.mjs
// Texte: Deutsch steht im Code, FR/EN werden mitgegeben oder aus tools/translations.json geholt.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.otiaa.de';
const dict = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools/translations.json'), 'utf8'));
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const A = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/* ---------- Übersetzungs-Helfer ---------- */
function tr(de, fr, en) {
    if (fr === undefined) {
        const e = dict[norm(de)];
        if (!e) throw new Error('Keine Übersetzung für: ' + de);
        return { de: norm(de), fr: e.fr, en: e.en };
    }
    return { de, fr, en };
}
const attrs = (o) => `data-de="${A(o.de)}" data-fr="${A(o.fr)}" data-en="${A(o.en)}"`;
const T = (de, fr, en) => attrs(tr(de, fr, en));
const tx = (tag, cls, de, fr, en, extra = '') => {
    const o = tr(de, fr, en);
    return `<${tag}${cls ? ` class="${cls}"` : ''}${extra ? ' ' + extra : ''} ${attrs(o)}>${o.de}</${tag}>`;
};
const ALT_TR = JSON.parse(fs.readFileSync(new URL('./alt-translations.json', import.meta.url), 'utf8'));
const alt = (de, fr, en) => {
    const t = ALT_TR[de] || [];
    const o = { de, fr: fr ?? t[0] ?? de, en: en ?? t[1] ?? de };
    return `alt="${A(o.de)}" data-alt-de="${A(o.de)}" data-alt-fr="${A(o.fr)}" data-alt-en="${A(o.en)}"`;
};

/* ---------- Bildgrößen lesen (gegen Layout-Sprünge) ---------- */
function imgSize(rel) {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    const ext = path.extname(rel).toLowerCase();
    if (ext === '.webp') {
        const kind = buf.toString('ascii', 12, 16);
        if (kind === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff];
        if (kind === 'VP8L') { const b = buf.readUInt32LE(21); return [(b & 0x3fff) + 1, ((b >> 14) & 0x3fff) + 1]; }
        if (kind === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
    }
    if (ext === '.png') return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
    if (ext === '.jpg' || ext === '.jpeg') {
        let i = 2;
        while (i < buf.length) {
            if (buf[i] !== 0xff) { i++; continue; }
            const m = buf[i + 1];
            if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
            i += 2 + buf.readUInt16BE(i + 2);
        }
    }
    return [0, 0];
}
function img(src, altAttr, { cls = '', lazy = true, sizes = '' } = {}) {
    const [w, h] = imgSize(src);
    return `<img src="${src}"${w ? ` width="${w}" height="${h}"` : ''}${cls ? ` class="${cls}"` : ''} ${altAttr}${lazy ? ' loading="lazy" decoding="async"' : ''}${sizes ? ` sizes="${sizes}"` : ''}>`;
}

/* ---------- Icons ---------- */
const ICON = {
    ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    tt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.65-1.62-1.1-.28-.24-.59-.52-.81-.88v13.3c0 1.64-1.33 2.97-2.97 2.97-1.64 0-2.97-1.33-2.97-2.97 0-1.64 1.33-2.97 2.97-2.97.17 0 .35.02.52.05v-4.22c-2.49.2-4.5 2.28-4.5 4.83 0 2.66 2.17 4.83 4.83 4.83 2.66 0 4.83-2.17 4.83-4.83V4.2c1.94 1.45 4.19 1.69 6.27.06-.05-1.41-.02-2.83-.02-4.24z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.936 3.297.936h.001c3.181 0 5.768-2.586 5.768-5.766 0-3.18-2.587-5.767-5.768-5.767zm6.591 1.637c.712.981 1.127 2.148 1.127 3.421 0 3.21-2.611 5.821-5.821 5.821-1.272 0-2.439-.415-3.419-1.126l-3.322.868.887-3.239c-.711-.98-1.127-2.147-1.127-3.419 0-3.21 2.611-5.822 5.821-5.822s5.821 2.611 5.821 5.821zm-13.623 3.42c0 4.291 3.492 7.783 7.783 7.783 1.571 0 3.033-.466 4.254-1.265l4.981 1.304-1.332-4.856c.799-1.221 1.265-2.683 1.265-4.254 0-4.291-3.491-7.782-7.782-7.782-4.292 0-7.783 3.491-7.783 7.782zm14.832 9.768l-1.956-7.147c.504-1.096.791-2.316.791-3.601 0-4.809-3.914-8.723-8.723-8.723s-8.723 3.914-8.723 8.723c0 4.808 3.914 8.722 8.723 8.722 1.285 0 2.505-.287 3.601-.791l7.147 1.956c.456.125.86.014 1.14-.138.279-.152.518-.466.518-.946v-.002z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.1L12 17.6 5.7 21.3l1.7-7.1L2 9.5l7.1-.6z"/></svg>',
};
const STARS = `<span class="stars" role="img" aria-label="5 von 5 Sternen">${ICON.star.repeat(5)}</span>`;

const WA = 'https://wa.me/4915511404383';
const GOOGLE_MAPS = 'https://www.google.com/maps/place/Otiaa+-+Kamerunische+Spezialit%C3%A4ten+%26+Feinkost/@48.8585002,8.6994823,17z/data=!4m6!3m5!1s0x6b59ae6062c4b8a5:0x72dddcb0a08725de';

/* ---------- Navigation ---------- */
const NAV = [
    ['ueber-uns.html', 'Über uns', 'À propos', 'About us'],
    ['catering.html', 'Catering', 'Traiteur', 'Catering'],
    ['kochkurse.html', 'Kochkurse', 'Cours de cuisine', 'Cooking classes'],
    ['feinkost.html', 'Feinkost', 'Épicerie fine', 'Delicatessen'],
    ['events.html', 'Events', 'Événements', 'Events'],
    ['galerie.html', 'Galerie', 'Galerie', 'Gallery'],
    ['kontakt.html', 'Kontakt', 'Contact', 'Contact'],
];

function header(current) {
    const items = NAV.map(([href, de, fr, en]) =>
        `<li><a href="${href}"${current === href ? ' aria-current="page"' : ''} ${attrs({ de, fr, en })}>${de}</a></li>`).join('');
    return `
<a class="skip-link" href="#main" ${T('Zum Inhalt springen', 'Aller au contenu', 'Skip to content')}>Zum Inhalt springen</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="index.html" aria-label="OTIAA, Startseite">
      <img src="assets/logo.png" width="52" height="52" alt="OTIAA Logo">
      <span class="brand-name">OTIAA</span>
    </a>
    <nav class="site-nav" id="site-nav" aria-label="Hauptmenü">
      <ul>${items}</ul>
    </nav>
    <div class="header-tools">
      <div class="lang-switch" role="group" aria-label="Sprache">
        <button class="lang-btn" data-lang="de" aria-pressed="true">DE</button>
        <button class="lang-btn" data-lang="fr" aria-pressed="false">FR</button>
        <button class="lang-btn" data-lang="en" aria-pressed="false">EN</button>
      </div>
      <button class="menu-toggle" id="menu-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Menü" data-label-de="Menü" data-label-fr="Menu" data-label-en="Menu"><span></span></button>
    </div>
  </div>
</header>`;
}

function footer() {
    const links = NAV.map(([href, de, fr, en]) => `<li><a href="${href}" ${attrs({ de, fr, en })}>${de}</a></li>`).join('');
    return `
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <img src="assets/logo.png" width="84" height="84" alt="OTIAA Logo" loading="lazy">
        ${tx('p', '', 'Die Küche von Maman Berthe, für alle.', 'La cuisine de Maman Berthe, pour tous.', "Maman Berthe's kitchen, for everyone.")}
      </div>
      <div>
        ${tx('h3', '', 'Seiten', 'Pages', 'Pages')}
        <ul>${links}<li><a href="faq.html">FAQ</a></li></ul>
      </div>
      <div>
        ${tx('h3', '', 'Kontakt', 'Contact', 'Contact')}
        <ul>
          <li>Uhlandstraße 37<br>75181 Pforzheim</li>
          <li><a href="${WA}" target="_blank" rel="noopener">+49 155 1140 4383</a></li>
          <li><a href="mailto:kontakt@otiaa.de">kontakt(at)otiaa.de</a></li>
        </ul>
      </div>
      <div>
        ${tx('h3', '', 'Folgen Sie uns', 'Suivez-nous', 'Follow us')}
        <div class="footer-social">
          <a href="https://instagram.com/otiaa_food" target="_blank" rel="noopener" aria-label="Instagram">${ICON.ig}</a>
          <a href="https://www.tiktok.com/@otiaa4" target="_blank" rel="noopener" aria-label="TikTok">${ICON.tt}</a>
        </div>
      </div>
    </div>
    <div class="footer-legal">
      <ul>
        <li><a href="impressum.html" ${T('Impressum', 'Mentions légales', 'Legal Notice')}>Impressum</a></li>
        <li><a href="datenschutz.html" ${T('Datenschutz', 'Confidentialité', 'Privacy Policy')}>Datenschutz</a></li>
        <li><a href="agb.html" ${T('AGB', 'CGV', 'T&C')}>AGB</a></li>
        <li><a href="widerruf.html" ${T('Widerruf', 'Rétractation', 'Cancellation')}>Widerruf</a></li>
      </ul>
      <span>&copy; 2026 OTIAA</span>
    </div>
  </div>
</footer>
<a class="wa-float" href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON.wa}<span>WhatsApp</span></a>`;
}

const LIGHTBOX = `
<dialog class="lightbox" id="lightbox" aria-label="Bildansicht">
  <div class="lightbox-inner">
    <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==">
    <div class="lightbox-bar">
      <button class="lightbox-btn" data-lb="prev" aria-label="Zurück">&larr;</button>
      <span class="lightbox-cap"></span>
      <button class="lightbox-btn" data-lb="next" aria-label="Weiter">&rarr;</button>
      <button class="lightbox-btn" data-lb="close" aria-label="Schließen">&times;</button>
    </div>
  </div>
</dialog>`;

function page({ file, title, desc, body, current, ogImage = 'assets/galerie/kochkurs-ulm-013.webp', extra = '' }) {
    const t = tr(title.de, title.fr, title.en);
    const url = `${SITE}/${file === 'index.html' ? '' : file}`;
    const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title ${attrs(t)}>${t.de}</title>
<meta name="description" content="${A(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:title" content="${A(t.de)}">
<meta property="og:description" content="${A(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/${ogImage}">
<meta name="theme-color" content="#F7F1E2">
<link rel="icon" href="assets/logo.png">
<link rel="preload" href="fonts/caprasimo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/figtree.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="site.css">
</head>
<body>
${header(current)}
<main id="main">
${body}
</main>
${footer()}
${extra}
<script src="site.js" defer></script>
</body>
</html>
`;
    fs.writeFileSync(path.join(ROOT, file), html);
    console.log('geschrieben:', file);
}

/* ---------- Bausteine ---------- */
const btn = (href, de, fr, en, cls = '') => `<a class="btn ${cls}" href="${href}" ${T(de, fr, en)}>${de}</a>`;
const arrow = (href, de, fr, en) => `<a class="link-arrow" href="${href}" ${T(de, fr, en)}>${de}</a>`;
const credit = (txt = 'Foto: Naomi Hattler') => `<span class="photo-credit">${txt}</span>`;
const video = (name, ratioCls, label, { poster = true } = {}) =>
    `<video controls preload="none" playsinline${poster ? ` poster="assets/video/${name}.webp"` : ''} aria-label="${A(label)}"><source src="assets/video/${name}.mp4" type="video/mp4"></video>`;

const ctaBand = () => `
<section class="section tight">
  <div class="container">
    <div class="cta-band" data-reveal>
      <div>
        ${tx('h2', '', 'Fragen Sie uns an', 'Écrivez-nous', 'Get in touch')}
        ${tx('p', '', 'Schreiben Sie uns, wir melden uns persönlich bei Ihnen.')}
      </div>
      <div class="btn-row">
        <a class="btn" href="${WA}" target="_blank" rel="noopener">WhatsApp</a>
        ${btn('kontakt.html', 'Zum Kontaktformular', 'Au formulaire de contact', 'To the contact form', 'ghost')}
      </div>
    </div>
  </div>
</section>`;

/* ================= START ================= */
function buildHome() {
    const reviews = `
<section class="section on-ink" aria-labelledby="rev-h">
  <div class="container">
    <div class="reviews-head" data-reveal>
      <div>
        <span class="gold-bar"></span>
        ${tx('h2', '', 'Was Gäste über uns schreiben', 'Ce que disent nos clients', 'What guests say about us', 'id="rev-h"')}
      </div>
      <div class="rating">${STARS}<span ${T('5,0 bei 15 Bewertungen auf Google', '5,0 sur 15 avis Google', '5.0 from 15 Google reviews')}>5,0 bei 15 Bewertungen auf Google</span></div>
    </div>
    <div class="reviews-grid" data-reveal>
      <blockquote class="review big" lang="de">
        <p>Kann ich von Herzen zu 100% weiter empfehlen!!! Wir haben für unsere Deutsch-Kamerunische Hochzeit viele verschiedene Speisen bestellt und wurden nicht enttäuscht. Nicht nur die kamerunische Familie war sehr zufrieden und glücklich, sondern auch die deutsche konnten wir für kamerunisches Essen richtig begeistern.<br>Das Essen wurde absolut pünktlich und warm geliefert, was uns sehr wichtig war.<br>Wir würden jederzeit wieder bei Mama Berthe und ihrem Team bestellen und ich hoffe, ich kann bald Mal einen ihrer Kochkurse besuchen.<br>Hoffentlich bis bald!</p>
        <footer>Signe S. <span>· Google</span></footer>
      </blockquote>
      <blockquote class="review" lang="de">
        <p>Anlässlich einer großen Hochzeitsfeier wurde das perfekte deutsch-kamerunische Büfett geliefert. Alles lecker, vielfältig und frisch zubereitet!!</p>
        <footer>Martina S. <span>· Google</span></footer>
      </blockquote>
      <blockquote class="review" lang="de">
        <p>Super guter Service! Tolle Kommunikation während des Bestellprozesses. Ich habe die hausgemachte Chilisauce Mifi verschenkt und sie kam super an. Die Verpackung sieht hochwertig aus und das Paket war liebevoll zusammengestellt. Absolut weiterzuempfehlen.</p>
        <footer>Bene A. <span>· Google</span></footer>
      </blockquote>
    </div>
    <p style="margin-top:2rem" data-reveal><a class="link-arrow" href="${GOOGLE_MAPS}" target="_blank" rel="noopener" ${T('Alle Rezensionen auf Google', 'Tous les avis sur Google', 'All reviews on Google')}>Alle Rezensionen auf Google</a></p>
  </div>
</section>`;

    const body = `
<section class="hero">
  <div class="container hero-grid">
    <div class="hero-copy">
      <h1 ${T('Die Küche von Maman Berthe, für alle.', 'La cuisine de Maman Berthe, pour tous.', "Maman Berthe's kitchen, for everyone.")}>Die Küche von Maman Berthe, für alle.</h1>
      ${tx('p', 'lede', 'Kamerunisches Catering, Kochkurse und handgemachte Feinkost aus Pforzheim.', 'Traiteur camerounais, cours de cuisine et épicerie fine artisanale de Pforzheim.', 'Cameroonian catering, cooking classes and handmade delicatessen from Pforzheim.')}
      <div class="btn-row">
        ${btn('kontakt.html', 'Catering anfragen')}
        ${arrow('events.html', 'Aktuelles und Events', 'Actualités et événements', 'News and events')}
      </div>
    </div>
    <div class="hero-photo">
      ${img('assets/galerie/kochkurs-ulm-013.webp', alt('Berthe lacht und hält eine Yamswurzel im Arm', 'Berthe rit en tenant une racine d’igname', 'Berthe laughing, holding a yam root'), { lazy: false })}
      ${credit()}
      <a class="hero-chip" href="events.html#kreativmarkt-frankfurt" ${T('Zuletzt: Kreativmarkt Frankfurt, 15. November 2026', 'Dernièrement : Kreativmarkt Francfort, 15 novembre 2026', 'Latest: Kreativmarkt Frankfurt, 15 November 2026')}>Zuletzt: Kreativmarkt Frankfurt, 15. November 2026</a>
    </div>
  </div>
</section>

<section class="section tight">
  <div class="container">
    <div style="margin-bottom:clamp(32px,5vw,64px)" data-reveal>
      <span class="gold-bar"></span>
      ${tx('h2', '', 'Drei Wege an unseren Tisch', 'Trois façons de venir à notre table', 'Three ways to our table')}
    </div>
    <div class="rows">
      <article class="row" data-reveal>
        <div class="row-media">${img('assets/galerie/afro-sommertag-009.webp', alt('Buffet von oben mit Beignets, Spießen und Hähnchen'))}</div>
        <div class="row-body">
          ${tx('h3', '', 'Catering', 'Traiteur', 'Catering')}
          ${tx('p', '', 'Buffets für Feiern, Firmenfeste, Messen und Festivals. Berthe kocht frisch für Ihre Gäste.', 'Des buffets pour fêtes, repas d’entreprise, salons et festivals. Berthe cuisine frais pour vos invités.', 'Buffets for celebrations, company parties, trade fairs and festivals. Berthe cooks fresh for your guests.')}
          ${arrow('catering.html', 'Zum Catering', 'Vers le traiteur', 'To catering')}
        </div>
      </article>
      <article class="row flip" data-reveal>
        <div class="row-media">${img('assets/galerie/kochkurs-ulm-051.webp', alt('Berthe erklärt am Kochtisch'))}${credit()}</div>
        <div class="row-body">
          ${tx('h3', '', 'Kochkurse', 'Cours de cuisine', 'Cooking classes')}
          ${tx('p', '', 'Gemeinsam kochen für Teams, Freunde und Familien. Oder Berthe kocht bei Ihnen zu Hause.', 'Cuisiner ensemble en équipe, entre amis ou en famille. Ou Berthe cuisine chez vous.', 'Cook together as a team, with friends or family. Or Berthe cooks at your home.')}
          ${arrow('kochkurse.html', 'Zu den Kochkursen', 'Vers les cours', 'To the classes')}
        </div>
      </article>
      <article class="row" data-reveal>
        <div class="row-media">${img('assets/mifi_real.jpg', alt('MIFI Chilisauce, MANDARA und Penja Pfeffer'))}</div>
        <div class="row-body">
          ${tx('h3', '', 'Feinkost', 'Épicerie fine', 'Delicatessen')}
          ${tx('p', '', 'MIFI, MANDARA und Penja Pfeffer. Handgemacht, ohne künstliche Zusatzstoffe.', 'MIFI, MANDARA et poivre de Penja. Fait main, sans additifs artificiels.', 'MIFI, MANDARA and Penja pepper. Handmade, without artificial additives.')}
          ${arrow('feinkost.html', 'Zur Feinkost', 'Vers l’épicerie fine', 'To the delicatessen')}
        </div>
      </article>
    </div>
  </div>
</section>

<section class="section" aria-labelledby="recent-h">
  <div class="container">
    <div class="recent">
      <div class="recent-video" data-reveal>${video('kreativmarkt-frankfurt', 'v', 'Unser Stand beim Kreativmarkt Frankfurt')}</div>
      <div data-reveal>
        <span class="gold-bar"></span>
        ${tx('h2', '', 'Zuletzt unterwegs', 'Dernières sorties', 'Recently out and about', 'id="recent-h"')}
        ${tx('p', '', 'Am 15. November 2026 standen wir mit Beignets beim Kreativmarkt in Frankfurt. Davor haben wir in Bad Wildbad das Buffet zum 30-jährigen Weltladen-Jubiläum gekocht.', 'Le 15 novembre 2026, nous étions au Kreativmarkt de Francfort avec nos beignets. Avant cela, nous avons préparé le buffet pour les 30 ans du Weltladen à Bad Wildbad.', 'On 15 November 2026 we stood at the Kreativmarkt in Frankfurt with our beignets. Before that we cooked the buffet for the Weltladen’s 30th anniversary in Bad Wildbad.')}
        <div class="event-list">
          <a href="events.html#kreativmarkt-frankfurt"><span><strong ${T('Kreativmarkt Frankfurt', 'Kreativmarkt Francfort', 'Kreativmarkt Frankfurt')}>Kreativmarkt Frankfurt</strong><span class="credit" ${T('15. November 2026', '15 novembre 2026', '15 November 2026')}>15. November 2026</span></span><span aria-hidden="true">&rarr;</span></a>
          <a href="events.html#weltladen-jubilaeum"><span><strong ${T('30 Jahre Weltladen Wildbad', '30 ans du Weltladen Wildbad', '30 years Weltladen Wildbad')}>30 Jahre Weltladen Wildbad</strong><span class="credit" ${T('23. Oktober 2026, Bad Wildbad', '23 octobre 2026, Bad Wildbad', '23 October 2026, Bad Wildbad')}>23. Oktober 2026, Bad Wildbad</span></span><span aria-hidden="true">&rarr;</span></a>
          <a href="events.html#kochkurs-ulm"><span><strong ${T('Kochkurs in Ulm', 'Cours de cuisine à Ulm', 'Cooking class in Ulm')}>Kochkurs in Ulm</strong><span class="credit" ${T('19. Oktober 2024', '19 octobre 2024', '19 October 2024')}>19. Oktober 2024</span></span><span aria-hidden="true">&rarr;</span></a>
        </div>
        <p style="margin-top:1.6rem">${arrow('events.html', 'Alle Events ansehen', 'Voir tous les événements', 'See all events')}</p>
      </div>
    </div>
  </div>
</section>

${reviews}
${ctaBand()}`;

    page({
        file: 'index.html',
        current: 'index.html',
        title: { de: 'OTIAA | Kamerunische Küche, Catering und Feinkost in Pforzheim', fr: 'OTIAA | Cuisine camerounaise, traiteur et épicerie fine à Pforzheim', en: 'OTIAA | Cameroonian cuisine, catering and delicatessen in Pforzheim' },
        desc: 'OTIAA, die Küche von Maman Berthe: kamerunisches Catering, Kochkurse und handgemachte Feinkost aus Pforzheim.',
        body,
    });
}

/* ================= ÜBER UNS ================= */
function buildAbout() {
    const body = `
<section class="page-head">
  <div class="container">
    <h1 ${T('Unsere Geschichte')}>Unsere Geschichte</h1>
    ${tx('p', 'lede', 'Frau Berthe Ngnoubamdjum')}
  </div>
</section>
<section class="section tight">
  <div class="container">
    <div class="row">
      <div class="row-body" data-reveal>
        ${tx('p', '', 'Mein Name ist Berthe Ngnoubamdjum und ich freue mich Sie bei uns willkommen heißen zu dürfen. Tauchen Sie ein in die traditionell kulinarische Welt Kameruns und überzeugen Sie sich von unseren einzigartigen Produkten und Serviceleistungen.')}
        ${tx('p', '', 'Lassen Sie den Alltag hinter sich und genießen Sie die sinnliche Vielfalt Westafrikas. Ich koche aus Leidenschaft frische und schmackhafte Gerichte aus meiner Heimat Kamerun.')}
        ${tx('p', '', 'Wir pflegen eine besondere Beziehung zum Essen. Als kleine Zugabe zu den Speisen wird stets eine scharfe Chillisauce angeboten. Durch meine Kreativität und die häufige Nachfrage meiner Gäste entstanden so die ersten eigenen Produkte, die nun in Form der Chilisauce MIFI und der Kräutermischung MANDARA verwirklicht wurden.')}
        <div class="tags">
          ${tx('span', 'tag', 'Authentizität', 'Authenticité', 'Authenticity')}
          ${tx('span', 'tag', 'Handwerk', 'Savoir-faire', 'Craftsmanship')}
          ${tx('span', 'tag', 'Familie', 'Famille', 'Family')}
        </div>
      </div>
      <div class="row-media tall" data-reveal>${img('assets/berthe_real.jpg', alt('Berthe Ngnoubamdjum lacht und hält eine Yamswurzel'), { lazy: false })}${credit()}</div>
    </div>
  </div>
</section>
<section class="section on-ink">
  <div class="container">
    <div data-reveal style="max-width:900px">
      <span class="gold-bar"></span>
      <h2 style="font-size:clamp(1.5rem,3vw,2.4rem);line-height:1.3;font-weight:600">${tx('span', '', 'Mein Versprechen - Ich verwende ausschließlich erlesene Zutaten ohne Konservierungsstoffe und ohne Zuckerzusätze oder künstliche Aromen.')}</h2>
    </div>
  </div>
</section>
<section class="section tight">
  <div class="container">
    <div class="event-media three" data-reveal>
      <figure class="ratio-p">${img('assets/galerie/kochkurs-ulm-099.webp', alt('Berthe bei der Arbeit am Kochtisch'))}</figure>
      <figure class="ratio-p">${img('assets/galerie/kochkurs-ulm-001.webp', alt('Berthe hält zwei Yamswurzeln in die Luft'))}</figure>
      <figure class="ratio-p">${img('assets/galerie/kochkurs-ulm-033.webp', alt('Berthe zeigt der Kochgruppe ein Gewürzglas'))}</figure>
    </div>
    <p class="credit" style="margin-top:12px" ${T('Fotos: Naomi Hattler', 'Photos : Naomi Hattler', 'Photos: Naomi Hattler')}>Fotos: Naomi Hattler</p>
    <div class="btn-row" style="margin-top:2.4rem">
      ${btn('catering.html', 'Catering ansehen', 'Voir le traiteur', 'See catering')}
      ${btn('kochkurse.html', 'Kochkurse ansehen', 'Voir les cours', 'See cooking classes', 'ghost')}
    </div>
  </div>
</section>
${ctaBand()}`;
    page({
        file: 'ueber-uns.html', current: 'ueber-uns.html',
        title: { de: 'Unsere Geschichte | OTIAA', fr: 'Notre histoire | OTIAA', en: 'Our story | OTIAA' },
        desc: 'Berthe Ngnoubamdjum kocht aus Leidenschaft kamerunische Gerichte. Die Geschichte hinter OTIAA, Catering und Feinkost aus Pforzheim.',
        body,
    });
}

/* ================= CATERING ================= */
function buildCatering() {
    const menu = [
        ['Couscous', 'Couscous', 'Couscous'],
        ['Gebratene Kochbananen', 'Plantains frits', 'Fried plantains'],
        ['Beignets', 'Beignets', 'Beignets'],
        ['Erdnusssauce', 'Sauce d’arachide', 'Peanut sauce'],
        ['Jollof Rice mit Hähnchen', 'Riz Jollof au poulet', 'Jollof rice with chicken'],
        ['Degué (Hirse-Joghurt-Dessert)', 'Degué (dessert mil et yaourt)', 'Degué (millet and yoghurt dessert)'],
        ['Bissap (Hibiskusgetränk)', 'Bissap (boisson à l’hibiscus)', 'Bissap (hibiscus drink)'],
    ].map(([de, fr, en]) => `<li ${T(de, fr, en)}>${de}</li>`).join('');

    const body = `
<section class="page-head">
  <div class="container">
    <h1 ${T('Catering')}>Catering</h1>
    ${tx('p', 'lede', 'Für Ihre besonderen Momente und professionellen Events.')}
    ${tx('p', '', 'Seit nun mehr als 25 Jahren biete ich mit meinem Service anspruchsvolle Kochkunst für die Gäste von Festivals, Kochkursen, Messen und privaten sowie betrieblichen Feierlichkeiten an. Schlussendlich ist es die Qualität der zubereiteten Speisen und sorgfältige Verarbeitung, welche meine Dienstleistung so erfolgreich gemacht hat.')}
  </div>
</section>
<section class="section tight">
  <div class="container rows">
    <article class="row" data-reveal>
      <div class="row-media">${img('assets/catering_food_real.jpg', alt('Schale mit gebratenen Kochbananen'), { lazy: false })}${credit()}</div>
      <div class="row-body">
        ${tx('h2', '', 'Privates Catering', 'Traiteur privé', 'Private catering')}
        ${tx('p', '', 'Erleben Sie kulinarische Momente, die über das Gewöhnliche hinausgehen. Ob runder Geburtstag, herzliche Familienfeier oder ein exklusives privates Event, wir bringen die authentischen Aromen Kameruns direkt zu Ihnen. Unser Fokus liegt auf einem persönlichen, unvergleichlichen Geschmackserlebnis, das Ihre Gäste verzaubert und Ihre Feier zu etwas ganz Besonderem macht.')}
        <ul class="check-list">
          ${tx('li', '', 'Unvergessliche Geburtstagsfeiern')}
          ${tx('li', '', 'Besondere Familienfeste')}
          ${tx('li', '', 'Authentische & persönliche Betreuung')}
        </ul>
        ${btn('kontakt.html', 'Catering anfragen')}
      </div>
    </article>
    <article class="row flip" data-reveal>
      <div class="row-media">${img('assets/galerie/afro-sommertag-010.webp', alt('Buffet mit warmen Speisen im Hof'))}</div>
      <div class="row-body">
        ${tx('h2', '', 'Firmencatering', 'Traiteur d’entreprise', 'Corporate catering')}
        ${tx('p', '', 'Setzen Sie bei Ihrer nächsten Firmenfeier, dem Sommerfest oder wichtigen Business-Events auf Professionalität und Qualität. OTIAA bietet Ihnen ein zuverlässiges Catering-Erlebnis, das bei Mitarbeitenden und Geschäftspartnern einen bleibenden Eindruck hinterlässt. Mit handwerklicher Präzision und außergewöhnlichen Speisen sorgen wir für den kulinarischen Rahmen.')}
        <ul class="check-list">
          ${tx('li', '', 'Zuverlässigkeit & höchste Qualität')}
          ${tx('li', '', 'Firmen- & Sommerfeste')}
          ${tx('li', '', 'Beeindruckende Business-Events')}
        </ul>
        ${btn('kontakt.html', 'Catering anfragen')}
      </div>
    </article>
  </div>
</section>
<section class="section on-ink">
  <div class="container">
    <div class="row">
      <div class="row-body" data-reveal>
        <span class="gold-bar"></span>
        ${tx('h2', '', 'Zuletzt serviert: 30 Jahre Weltladen Wildbad', 'Dernier service : 30 ans du Weltladen Wildbad', 'Latest service: 30 years Weltladen Wildbad')}
        ${tx('p', '', 'Am 23. Oktober 2026 haben wir im Ludwig-Hofacker-Haus in Bad Wildbad das Buffet zum Jubiläum gekocht. Das stand auf dem Tisch:', 'Le 23 octobre 2026, nous avons préparé le buffet de l’anniversaire au Ludwig-Hofacker-Haus à Bad Wildbad. Voici ce qui était sur la table :', 'On 23 October 2026 we cooked the anniversary buffet at the Ludwig-Hofacker-Haus in Bad Wildbad. This is what was on the table:')}
        <ul class="menu-inline on-ink-pills">${menu}</ul>
        <p style="margin-top:1.8rem">${arrow('events.html#weltladen-jubilaeum', 'Mehr zum Event', 'Plus sur l’événement', 'More about the event')}</p>
      </div>
      <div class="row-media" data-reveal style="aspect-ratio:16/9">${video('weltladen-buffet', 'h', 'Das Buffet beim Weltladen-Jubiläum')}</div>
    </div>
  </div>
</section>
${ctaBand()}`;
    page({
        file: 'catering.html', current: 'catering.html',
        title: { de: 'Catering | OTIAA', fr: 'Traiteur | OTIAA', en: 'Catering | OTIAA' },
        desc: 'Kamerunisches Catering für Feiern, Firmenfeste, Messen und Festivals. Frisch gekocht von Berthe, Pforzheim.',
        body, ogImage: 'assets/galerie/afro-sommertag-009.webp',
    });
}

/* ================= KOCHKURSE ================= */
function buildClasses() {
    const strip = ['005', '039', '044', '085', '161', '164'].map((n, i) => {
        const alts = {
            '005': 'Zutaten auf der Arbeitsplatte: Yamswurzel, Sellerie und Petersilie',
            '039': 'Hände schälen eine Kochbanane',
            '044': 'Yams in Scheiben geschnitten',
            '085': 'Kochbananen- und Zwiebelscheiben auf Tellern',
            '161': 'Beignets in Schalen',
            '164': 'Eintopf im Topf auf gelbem Wachsstoff',
        };
        return `<figure class="ratio-s">${img(`assets/galerie/kochkurs-ulm-${n}.webp`, alt(alts[n]))}</figure>`;
    }).join('');

    const body = `
<section class="page-head">
  <div class="container">
    <h1 ${T('Kochkurse', 'Cours de cuisine', 'Cooking classes')}>Kochkurse</h1>
    ${tx('p', 'lede', 'Entdecken Sie die Geheimnisse Kameruns')}
  </div>
</section>
<section class="section tight">
  <div class="container rows">
    <article class="row" data-reveal>
      <div class="row-media">${img('assets/workshop_firmen.jpg', alt('Kochgruppe in der Lehrküche, Berthe erklärt'), { lazy: false })}${credit()}</div>
      <div class="row-body">
        ${tx('h2', '', 'Firmenkochkurs', 'Cours de cuisine d’entreprise', 'Corporate cooking class')}
        ${tx('p', '', 'Stärken Sie den Teamgeist bei einem exklusiven Teambuilding Event. Gemeinsames Kochen und der interaktive Austausch in der Küche schaffen eine perfekte Basis für eine erfolgreiche Zusammenarbeit. Wir bieten attraktive und professionelle Konditionen für Firmen und Unternehmen jeder Größe.')}
        <ul class="check-list">
          ${tx('li', '', 'Nachhaltiges Teambuilding Event')}
          ${tx('li', '', 'Professionelle Moderation & Anleitung')}
          ${tx('li', '', 'Individuelle Terminplanung')}
        </ul>
        ${btn('kontakt.html', 'Kontakt aufnehmen')}
      </div>
    </article>
    <article class="row flip" data-reveal>
      <div class="row-media">${img('assets/workshop_privat.jpg', alt('Berthe mit Gläsern in der Hand vor der Kochgruppe'))}${credit()}</div>
      <div class="row-body">
        ${tx('h2', '', 'Privater Kochkurs mit Freunden')}
        ${tx('p', '', 'Eine immer beliebter werdende Freizeitaktivität für Freundesgruppen und Familien. Gemeinsam kochen, lachen und Neues ausprobieren, in einer lockereren, herzlichen und ganz persönlichen Atmosphäre entdecken Sie die authentischen Rezepte Westafrikas.')}
        <ul class="check-list">
          ${tx('li', '', 'Ideal für Freundesgruppen')}
          ${tx('li', '', 'Locker & Herzlich')}
          ${tx('li', '', 'Eigene Kreationen genießen')}
        </ul>
        ${btn('kontakt.html', 'Kontakt aufnehmen')}
      </div>
    </article>
  </div>
</section>
<section class="section on-ink">
  <div class="container">
    <div class="row">
      <div class="row-media tall" data-reveal>${img('assets/home_cooking.jpg', alt('Berthe kocht zu Hause mit Gästen'))}${credit()}</div>
      <div class="row-body" data-reveal>
        ${tx('h2', '', 'Oder doch lieber bekocht werden, gemeinsam mit Freunden?')}
        ${tx('h3', '', 'Exklusives Home-Cooking')}
        ${tx('p', '', 'Lassen Sie sich in Ihren eigenen vier Wänden kulinarisch verwöhnen. Berthe kreiert in enger Absprache mit Ihnen ein persönliches 3-Gänge-Menü, das Ihre Gäste begeistern wird. Wir kümmern uns um alle Details, damit Sie sich ganz auf Ihre Gäste konzentrieren können.')}
        <ul class="check-list">
          ${tx('li', '', 'Individuelles 3-Gänge-Menü nach Absprache')}
          ${tx('li', '', 'Kompletter Einkauf wird übernommen')}
          ${tx('li', '', 'Stimmungsvolle Begleitmusik während des Essens')}
          ${tx('li', '', 'Rezepte zum Nachkochen inklusive')}
          ${tx('li', '', 'Berthe übernimmt den kompletten Abwasch & die Reinigung')}
          ${tx('li', '', 'Authentische Geschichten zur kamerunischen Kultur')}
        </ul>
        ${btn('kontakt.html', 'Kontakt aufnehmen')}
      </div>
    </div>
  </div>
</section>
<section class="section tight">
  <div class="container">
    <div data-reveal style="margin-bottom:2rem">
      <span class="gold-bar"></span>
      ${tx('h2', '', 'Aus dem Kochkurs in Ulm', 'Du cours de cuisine à Ulm', 'From the cooking class in Ulm')}
    </div>
    <div class="event-media three" data-reveal>${strip}</div>
    <p class="credit" style="margin-top:12px" ${T('Fotos: Naomi Hattler', 'Photos : Naomi Hattler', 'Photos: Naomi Hattler')}>Fotos: Naomi Hattler</p>
    <p style="margin-top:2rem">${arrow('galerie.html#kochkurs-ulm', 'Alle Fotos in der Galerie', 'Toutes les photos dans la galerie', 'All photos in the gallery')}</p>
  </div>
</section>
${ctaBand()}`;
    page({
        file: 'kochkurse.html', current: 'kochkurse.html',
        title: { de: 'Kochkurse und Home-Cooking | OTIAA', fr: 'Cours de cuisine et cuisine à domicile | OTIAA', en: 'Cooking classes and home cooking | OTIAA' },
        desc: 'Kamerunisch kochen lernen: Firmenkochkurs, privater Kochkurs mit Freunden und exklusives Home-Cooking mit Berthe.',
        body, ogImage: 'assets/galerie/kochkurs-ulm-051.webp',
    });
}

/* ================= FEINKOST ================= */
function nutritionRows(rows) {
    return rows.map(([de, val]) => `<tr><td ${T(de)}>${de}</td><td>${val}</td></tr>`).join('');
}
function product({ id, name, sub, desc, qualities, imgSrc, imgAlt, ingredients, nutr, allergens, price, weight, waText }) {
    const nutrBlock = nutr ? `
      <details class="info">
        <summary ${T('Nährwerte')}>Nährwerte</summary>
        <div class="info-body">
          ${tx('p', 'credit', 'Durchschnittlich pro 100 g')}
          <table class="nutrition">${nutritionRows(nutr)}</table>
        </div>
      </details>` : '';
    const allergBlock = allergens ? `
      <details class="info">
        <summary ${T('Allergene')}>Allergene</summary>
        <div class="info-body"><p ${attrs(allergens)}>${allergens.de}</p></div>
      </details>` : '';
    return `
<article class="product" id="${id}" data-reveal>
  <div class="product-photo">${img(imgSrc, alt(imgAlt))}</div>
  <div>
    <h2 ${attrs(name)}>${name.de}</h2>
    <p class="product-sub" ${attrs(sub)}>${sub.de}</p>
    <p ${attrs(desc)}>${desc.de}</p>
    <ul class="check-list">${qualities.map((q) => `<li ${attrs(q)}>${q.de}</li>`).join('')}</ul>
    <div class="price-line"><span class="price">${price}</span><span class="weight" ${attrs(weight)}>${weight.de}</span></div>
    <div class="btn-row" style="margin-bottom:2rem"><a class="btn" href="${WA}?text=${encodeURIComponent(waText)}" target="_blank" rel="noopener" ${T('Produkt anfragen', 'Commander', 'Inquire')}>Produkt anfragen</a></div>
    <details class="info">
      <summary ${T('Zutaten', 'Ingrédients', 'Ingredients')}>Zutaten</summary>
      <div class="info-body"><p ${attrs(ingredients)}>${ingredients.de}</p></div>
    </details>
    ${nutrBlock}
    ${allergBlock}
  </div>
</article>`;
}

function buildProducts() {
    const noArt = [tr('Keine künstlichen Zusatzstoffe'), tr('Keine Geschmacksverstärker'), tr('Keine künstlichen Aromen')];
    const nutrLabels = [['Energie'], ['Fett'], ['davon gesättigte Fettsäuren'], ['Kohlenhydrate'], ['davon Zucker'], ['Eiweiß'], ['Salz']];
    const mk = (vals) => nutrLabels.map(([l], i) => [l, vals[i]]);
    const prods = [
        product({
            id: 'mifi', name: tr('MIFI', 'MIFI', 'MIFI'), sub: tr('Unsere hausgemachte Chilisauce'),
            desc: tr('Kräftig, aromatisch und authentisch, MIFI ist unsere hausgemachte Chilisauce nach Familienrezept. Perfekt zum Verfeinern von Fleisch-, Fisch- und Gemüsegerichten.'),
            qualities: noArt, imgSrc: 'assets/mifi_real.jpg', imgAlt: 'MIFI Chilisauce im Glas, davor Kochbananen und Wachsstoff',
            ingredients: tr('Chilli, Zwiebeln, Tomatenmark, Knoblauch, Djancent, Petersilie, Meersalz, frischer Zitronensaft, Olivenöl, Wasser'),
            nutr: mk(['800 kJ / 253 kcal', '19,8 g', '9,5 g', '12,3 g', '10,2 g', '5,6 g', '15,2 g']),
            allergens: tr('Kann Spuren von Sellerie enthalten'),
            price: '€ 7,90', weight: tr('200 g Glas', '200 g (pot)', '200 g jar'), waText: 'Ich interessiere mich für MIFI',
        }),
        product({
            id: 'mandara', name: tr('MANDARA', 'MANDARA', 'MANDARA'), sub: tr('Unsere hausgemachte Kräutermischung'),
            desc: tr('MANDARA vereint ausgewählte Kräuter und Gewürze aus Kamerun, harmonisch abgestimmt für eine warme, tief aromatische Küche.'),
            qualities: noArt, imgSrc: 'assets/mandara_real.jpg', imgAlt: 'MANDARA Kräutermischung im Glas neben einer Schale mit Nüssen',
            ingredients: tr('Lauch, Knoblauch, Djancent, Sellerie, Petersilie, Meersalz, Wilder Muskat, Kurkuma, Wasser'),
            nutr: mk(['527 kJ / 126 kcal', '5,2 g', '0,7 g', '16,1 g', '3,9 g', '0 g', '11,0 g']),
            allergens: tr('Sellerie'),
            price: '€ 7,90', weight: tr('200 g Glas', '200 g (pot)', '200 g jar'), waText: 'Ich interessiere mich für MANDARA',
        }),
        product({
            id: 'penja', name: tr('Schwarzer & Weißer Penja Pfeffer'), sub: tr('Handverarbeiteter Spitzenpfeffer'),
            desc: tr('Exklusiver Penja Pfeffer aus der vulkanischen Region Kameruns, weltweit geschätzt für seine intensive, komplexe Aromatik.'),
            qualities: [tr('Herkunftgeschützt'), tr('Handverarbeitet'), tr('Anbau auf mineralreichem Vulkanboden')],
            imgSrc: 'assets/penja_real.jpg', imgAlt: 'Dosen mit schwarzem und weißem Penja Pfeffer',
            ingredients: tr('100% Penja Pfeffer (Piper nigrum). Ohne künstliche Zusätze.'),
            nutr: null, allergens: null,
            price: '€ 8,90', weight: tr('50 g Glas', '50 g (pot)', '50 g jar'), waText: 'Ich interessiere mich für Penja Pfeffer',
        }),
    ];
    const body = `
<section class="page-head">
  <div class="container">
    <h1 ${T('Unsere Feinkost')}>Unsere Feinkost</h1>
    ${tx('p', 'lede', 'Ein Stück Kamerun für Zuhause.')}
  </div>
</section>
<section class="section tight">
  <div class="container">
    ${prods.join('\n')}
    <div class="pay-row" data-reveal>
      <span class="label" ${T('Wir akzeptieren', 'Nous acceptons', 'We accept')}>Wir akzeptieren</span>
      <div class="pay-icons">
        <img src="assets/giro-pay-svgrepo-com.svg" alt="Giropay" loading="lazy">
        <img src="assets/visa-3-svgrepo-com.svg" alt="Visa" loading="lazy">
        <img src="assets/mastercard-4-logo-svgrepo-com.svg" alt="Mastercard" loading="lazy">
        <img src="assets/paypal-svgrepo-com.svg" alt="PayPal" loading="lazy">
      </div>
    </div>
  </div>
</section>
${ctaBand()}`;
    page({
        file: 'feinkost.html', current: 'feinkost.html',
        title: { de: 'Feinkost: MIFI, MANDARA, Penja Pfeffer | OTIAA', fr: 'Épicerie fine : MIFI, MANDARA, poivre de Penja | OTIAA', en: 'Delicatessen: MIFI, MANDARA, Penja pepper | OTIAA' },
        desc: 'Handgemachte Feinkost aus Kamerun: Chilisauce MIFI, Kräutermischung MANDARA und Penja Pfeffer. Ohne künstliche Zusatzstoffe.',
        body, ogImage: 'assets/mifi_real.jpg',
    });
}

/* ================= EVENTS ================= */
function buildEvents() {
    const menu = [
        ['Couscous', 'Couscous', 'Couscous'], ['Gebratene Kochbananen', 'Plantains frits', 'Fried plantains'], ['Beignets', 'Beignets', 'Beignets'],
        ['Erdnusssauce', 'Sauce d’arachide', 'Peanut sauce'], ['Jollof Rice mit Hähnchen', 'Riz Jollof au poulet', 'Jollof rice with chicken'],
        ['Degué', 'Degué', 'Degué'], ['Bissap', 'Bissap', 'Bissap'],
    ].map(([de, fr, en]) => `<li ${T(de, fr, en)}>${de}</li>`).join('');

    const ev = (id, dateDe, dateFr, dateEn, place, content) => `
<article class="event" id="${id}" data-reveal>
  <div class="event-date">
    <span class="label">${place}</span>
    <span class="day" ${T(dateDe, dateFr, dateEn)}>${dateDe}</span>
  </div>
  <div>${content}</div>
</article>`;

    const body = `
<section class="page-head">
  <div class="container">
    <h1 ${T('Events', 'Événements', 'Events')}>Events</h1>
    ${tx('p', 'lede', 'Wo wir zuletzt gekocht haben und wo Sie uns als Nächstes treffen.', 'Où nous avons cuisiné dernièrement, et où vous pourrez nous retrouver.', 'Where we cooked recently and where you can meet us next.')}
  </div>
</section>
<section class="section tight">
  <div class="container">
    <div class="next-dates" data-reveal>
      <div>
        ${tx('h2', '', 'Nächste Termine', 'Prochaines dates', 'Next dates')}
        ${tx('p', '', 'Aktuell stehen keine Termine fest. Neue Termine zeigen wir hier und auf Instagram.', 'Aucune date n’est fixée pour le moment. Nous publierons les prochaines ici et sur Instagram.', 'No dates are set at the moment. We will post new ones here and on Instagram.')}
      </div>
      <div class="btn-row">
        ${btn('kontakt.html', 'Event anfragen', 'Demander pour un événement', 'Enquire about an event')}
        <a class="btn ghost" href="https://instagram.com/otiaa_food" target="_blank" rel="noopener">Instagram</a>
      </div>
    </div>

    <div class="timeline">
      ${ev('kreativmarkt-frankfurt', '15. November 2026', '15 novembre 2026', '15 November 2026', 'Frankfurt', `
        ${tx('h2', '', 'Kreativmarkt Frankfurt', 'Kreativmarkt Francfort', 'Kreativmarkt Frankfurt')}
        ${tx('p', '', 'Unser Stand auf dem Kreativmarkt: frisch frittierte Beignets auf buntem Wachsstoff, dazu ein Gruß per Instagram und Google-QR-Code.', 'Notre stand au Kreativmarkt : des beignets tout juste frits sur un tissu wax coloré, avec des codes QR Instagram et Google.', 'Our stall at the Kreativmarkt: freshly fried beignets on colourful wax fabric, with Instagram and Google QR codes.')}
        <div class="event-media"><div class="vid ratio-v" style="max-width:340px">${video('kreativmarkt-frankfurt', 'v', 'Unser Stand beim Kreativmarkt Frankfurt')}</div></div>`)}

      ${ev('weltladen-jubilaeum', '23. Oktober 2026', '23 octobre 2026', '23 October 2026', 'Bad Wildbad', `
        ${tx('h2', '', '30 Jahre Weltladen Wildbad', '30 ans du Weltladen Wildbad', '30 years Weltladen Wildbad')}
        ${tx('p', '', 'Der Weltladen Wildbad feierte 30 Jahre, fair. lokal. global. Wir haben im Ludwig-Hofacker-Haus das Buffet gekocht. Das gab es:', 'Le Weltladen Wildbad a fêté ses 30 ans, équitable. local. global. Nous avons préparé le buffet au Ludwig-Hofacker-Haus. Au menu :', 'The Weltladen Wildbad celebrated 30 years, fair. local. global. We cooked the buffet at the Ludwig-Hofacker-Haus. On the menu:')}
        <ul class="menu-inline">${menu}</ul>
        <div class="event-media two">
          <div class="vid ratio-v">${video('weltladen-reel', 'v', 'Reel vom Weltladen-Jubiläum')}</div>
          <div style="display:grid;gap:14px">
            <div class="vid ratio-h">${video('weltladen-buffet', 'h', 'Das Buffet beim Weltladen-Jubiläum')}</div>
            <figure class="ratio-h">${img('assets/galerie/weltladen-team-buffet.webp', alt('Buffet mit Couscous und Jollof Rice, das Team steht dahinter'))}</figure>
          </div>
        </div>
        <p style="margin-top:1.2rem">${arrow('galerie.html#weltladen', 'Mehr Bilder und Videos', 'Plus de photos et de vidéos', 'More photos and videos')}</p>`)}

      ${ev('afrika-festival-2026', '2026', '2026', '2026', 'Pforzheim', `
        ${tx('h2', '', 'Afrika Festival Pforzheim', 'Afrika Festival Pforzheim', 'Afrika Festival Pforzheim')}
        ${tx('p', '', 'Mit eigenem Stand beim Afrika Festival im Enzauenpark. Bilder folgen.', 'Avec notre propre stand au Afrika Festival dans l’Enzauenpark. Photos à venir.', 'With our own stall at the Afrika Festival in the Enzauenpark. Photos to follow.')}`)}

      ${ev('afro-sommertag', '20. Juli 2025', '20 juillet 2025', '20 July 2025', 'Afro Sommertag', `
        ${tx('h2', '', 'Afro Sommertag', 'Afro Sommertag', 'Afro Sommertag')}
        ${tx('p', '', 'Ein Buffet mit Beignets, Spießen und Hähnchen im Hof, Berthe und das Team hinter den Wärmebehältern.', 'Un buffet de beignets, brochettes et poulet dans la cour, Berthe et l’équipe derrière les bacs chauffants.', 'A buffet of beignets, skewers and chicken in the courtyard, Berthe and the team behind the chafing dishes.')}
        <div class="event-media three">
          <figure class="ratio-p">${img('assets/galerie/afro-sommertag-009.webp', alt('Buffet von oben mit Beignets, Spießen und Hähnchen'))}</figure>
          <figure class="ratio-p">${img('assets/galerie/afro-sommertag-002.webp', alt('Das Team serviert am Buffet'))}</figure>
          <figure class="ratio-p">${img('assets/galerie/afro-sommertag-010.webp', alt('Buffet mit warmen Speisen im Hof'))}</figure>
        </div>
        <p style="margin-top:1.2rem">${arrow('galerie.html#afro-sommertag', 'Mehr Bilder', 'Plus de photos', 'More photos')}</p>`)}

      ${ev('kochkurs-ulm', '19. Oktober 2024', '19 octobre 2024', '19 October 2024', 'Ulm', `
        ${tx('h2', '', 'Kochkurs in Ulm', 'Cours de cuisine à Ulm', 'Cooking class in Ulm')}
        ${tx('p', '', 'Gemeinsam schälen, schneiden, rühren und am Ende alle an einem langen Tisch essen.', 'Éplucher, couper, remuer ensemble, puis manger tous à une longue table.', 'Peeling, chopping and stirring together, then everyone eating at one long table.')}
        <div class="event-media three">
          <figure class="ratio-p">${img('assets/galerie/kochkurs-ulm-051.webp', alt('Berthe erklärt am Kochtisch'))}</figure>
          <figure class="ratio-p">${img('assets/galerie/kochkurs-ulm-168.webp', alt('Eintopf auf dem gedeckten Tisch mit Blumen'))}</figure>
          <figure class="ratio-p">${img('assets/galerie/kochkurs-ulm-039.webp', alt('Hände schälen eine Kochbanane'))}</figure>
        </div>
        <p class="credit" style="margin-top:10px" ${T('Fotos: Naomi Hattler', 'Photos : Naomi Hattler', 'Photos: Naomi Hattler')}>Fotos: Naomi Hattler</p>
        <p style="margin-top:1rem">${arrow('galerie.html#kochkurs-ulm', 'Mehr Bilder', 'Plus de photos', 'More photos')}</p>`)}
    </div>
  </div>
</section>
${ctaBand()}`;
    page({
        file: 'events.html', current: 'events.html',
        title: { de: 'Events und Rückblick | OTIAA', fr: 'Événements et rétrospective | OTIAA', en: 'Events and recap | OTIAA' },
        desc: 'Kreativmarkt Frankfurt, Weltladen-Jubiläum in Bad Wildbad, Afrika Festival Pforzheim: wo OTIAA zuletzt gekocht hat.',
        body, ogImage: 'assets/video/kreativmarkt-frankfurt.webp',
    });
}

/* ================= GALERIE ================= */
function buildGallery() {
    const albumPhotos = (prefix, list, creditDe) => list.map(([n, de]) => {
        const src = `assets/galerie/${prefix}-${n}.webp`;
        const [w, h] = imgSize(src);
        return `<button type="button" data-full="${src}" data-alt="${A(de)}" data-caption="${A(de)}" aria-label="${A(de)}"><img src="${src}" width="${w}" height="${h}" alt="${A(de)}" loading="lazy" decoding="async"></button>`;
    }).join('');

    const ulm = [
        ['001', 'Berthe hält zwei Yamswurzeln in die Luft'], ['005', 'Zutaten auf der Arbeitsplatte: Yamswurzel, Sellerie, Petersilie'],
        ['013', 'Berthe lacht mit einer Yamswurzel im Arm'], ['024', 'Yamswurzel neben grünen Früchten'],
        ['033', 'Berthe zeigt der Kochgruppe ein Gewürzglas'], ['039', 'Hände schälen eine Kochbanane'],
        ['044', 'Yams in Scheiben geschnitten'], ['046', 'Die Kochgruppe in der Lehrküche'],
        ['051', 'Berthe erklärt am Kochtisch'], ['074', 'Hände bereiten Gemüse und Kochbananen vor'],
        ['085', 'Kochbananen- und Zwiebelscheiben auf Tellern'], ['099', 'Berthe bei der Arbeit am Kochtisch'],
        ['112', 'Gemüse brät in der Pfanne'], ['119', 'Ein Topf mit Tomatensauce auf dem Herd'],
        ['122', 'Teller mit Gewürznüssen und Samen'], ['131', 'Töpfe auf dem Herd'],
        ['144', 'Kochbananen-Chips'], ['150', 'Schale mit gebratenen Kochbananen'],
        ['161', 'Beignets in Schalen'], ['164', 'Eintopf im Topf auf gelbem Wachsstoff'],
        ['166', 'Eintopf mit Kelle im Topf'], ['168', 'Eintopf auf dem gedeckten Tisch mit Blumen'],
        ['173', 'Schale mit gebratenen Kochbananen auf dem Tisch'],
    ];
    const afro = [
        ['009', 'Buffet von oben mit Beignets, Spießen und Hähnchen'], ['010', 'Buffet mit warmen Speisen im Hof'],
        ['001', 'Das Team bedient am Buffet'], ['002', 'Servieren am Buffet'],
        ['003', 'Beignets und Hähnchen im Wärmebehälter'], ['007', 'Zubereitung in der Küche'],
    ];
    const vids = [
        ['kreativmarkt-frankfurt', 'v', 'Kreativmarkt Frankfurt, 15. November 2026'],
        ['weltladen-reel', 'v', 'Weltladen-Jubiläum: der Reel'],
        ['weltladen-buffet', 'h', 'Weltladen-Jubiläum: das Buffet'],
        ['weltladen-buffet-oben', 'h', 'Weltladen-Jubiläum: das Buffet von oben'],
        ['vorbereitung', 'v', 'Vorbereitung in der Küche'],
    ].map(([n, r, label]) => `<figure class="video-card"><div class="frame ${r === 'v' ? 'ratio-v' : 'ratio-h'}">${video(n, r, label)}</div><figcaption>${label}</figcaption></figure>`).join('');

    const body = `
<section class="page-head">
  <div class="container">
    <h1 ${T('Galerie', 'Galerie', 'Gallery')}>Galerie</h1>
    ${tx('p', 'lede', 'Echtes Essen, echte Momente. Klicken Sie ein Bild an, um es groß zu sehen.', 'De la vraie cuisine, de vrais moments. Cliquez sur une image pour l’agrandir.', 'Real food, real moments. Click a photo to see it large.')}
  </div>
</section>
<section class="section tight">
  <div class="container">
    <div class="filters" role="group" aria-label="Filter">
      <button class="chip" data-filter="all" aria-pressed="true" ${T('Alles', 'Tout', 'All')}>Alles</button>
      <button class="chip" data-filter="videos" aria-pressed="false">Videos</button>
      <button class="chip" data-filter="kochkurs-ulm" aria-pressed="false" ${T('Kochkurs Ulm', 'Cours à Ulm', 'Ulm cooking class')}>Kochkurs Ulm</button>
      <button class="chip" data-filter="afro-sommertag" aria-pressed="false">Afro Sommertag</button>
      <button class="chip" data-filter="weltladen" aria-pressed="false">Weltladen Wildbad</button>
    </div>

    <section class="album" data-album="videos" id="videos">
      <div class="album-head"><h2>Videos</h2></div>
      <div class="video-grid">${vids}</div>
    </section>

    <section class="album" data-album="kochkurs-ulm" id="kochkurs-ulm">
      <div class="album-head"><h2 ${T('Kochkurs in Ulm', 'Cours de cuisine à Ulm', 'Cooking class in Ulm')}>Kochkurs in Ulm</h2><span class="credit" ${T('19. Oktober 2024 · Fotos: Naomi Hattler', '19 octobre 2024 · Photos : Naomi Hattler', '19 October 2024 · Photos: Naomi Hattler')}>19. Oktober 2024 · Fotos: Naomi Hattler</span></div>
      <div class="masonry">${albumPhotos('kochkurs-ulm', ulm)}</div>
    </section>

    <section class="album" data-album="afro-sommertag" id="afro-sommertag">
      <div class="album-head"><h2>Afro Sommertag</h2><span class="credit" ${T('20. Juli 2025', '20 juillet 2025', '20 July 2025')}>20. Juli 2025</span></div>
      <div class="masonry">${albumPhotos('afro-sommertag', afro)}</div>
    </section>

    <section class="album" data-album="weltladen" id="weltladen">
      <div class="album-head"><h2>Weltladen Wildbad</h2><span class="credit" ${T('23. Oktober 2026', '23 octobre 2026', '23 October 2026')}>23. Oktober 2026</span></div>
      <div class="masonry">${albumPhotos('weltladen-team', [['buffet', 'Buffet mit Couscous und Jollof Rice, das Team steht dahinter']])}</div>
    </section>
  </div>
</section>
${ctaBand()}`;
    page({
        file: 'galerie.html', current: 'galerie.html',
        title: { de: 'Galerie: Fotos und Videos | OTIAA', fr: 'Galerie : photos et vidéos | OTIAA', en: 'Gallery: photos and videos | OTIAA' },
        desc: 'Fotos und Videos von OTIAA: Kochkurs Ulm, Afro Sommertag, Weltladen-Jubiläum und Kreativmarkt Frankfurt.',
        body, extra: LIGHTBOX,
    });
}

/* ================= KONTAKT ================= */
function buildContact() {
    const body = `
<section class="page-head">
  <div class="container">
    <h1 ${T('Kontakt')}>Kontakt</h1>
    ${tx('p', 'lede', 'Bereits Appetit bekommen?')}
    ${tx('p', '', 'Schreiben Sie uns, wir melden uns persönlich bei Ihnen.')}
  </div>
</section>
<section class="section tight">
  <div class="container contact-grid">
    <div data-reveal>
      <div class="map"><iframe title="Karte: OTIAA, Uhlandstraße 37, Pforzheim" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.98461838417!2d8.696907376009833!3d48.858503700699224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6b59ae6062c4b8a5%3A0x72dddcb0a08725de!2sOtiaa%20-%20Kamerunische%20Spezialit%C3%A4ten%20%26%20Feinkost!5e0!3m2!1sen!2sde!4v1768737937102!5m2!1sen!2sde" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>
      <ul class="contact-list">
        <li>${ICON.pin}<div>Uhlandstraße 37<br>75181 Pforzheim</div></li>
        <li>${ICON.wa}<div><a href="${WA}" target="_blank" rel="noopener">+49 (0) 155 1140 4383</a></div></li>
        <li>${ICON.mail}<div><a href="mailto:kontakt@otiaa.de">kontakt(at)otiaa.de</a></div></li>
      </ul>
      <p style="margin-top:2rem">${arrow('faq.html', 'Lassen Sie mich Ihre restlichen Fragen beantworten')}</p>
    </div>
    <form class="form" action="https://formsubmit.co/kontakt@otiaa.de" method="POST" data-reveal>
      <div class="field"><label for="name" ${T('Name', 'Nom', 'Name')}>Name</label><input type="text" id="name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="email" ${T('E-Mail')}>E-Mail</label><input type="email" id="email" name="email" autocomplete="email" required></div>
      <div class="field"><label for="message" ${T('Nachricht')}>Nachricht</label><textarea id="message" name="message" rows="5" required></textarea></div>
      <label class="check"><input type="checkbox" id="privacy" name="privacy" required><span ${T('Ich stimme den Datenschutzerklärung zu')}>Ich stimme den Datenschutzerklärung zu</span></label>
      <button type="submit" class="btn" ${T('Absenden')}>Absenden</button>
    </form>
  </div>
</section>`;
    page({
        file: 'kontakt.html', current: 'kontakt.html',
        title: { de: 'Kontakt | OTIAA', fr: 'Contact | OTIAA', en: 'Contact | OTIAA' },
        desc: 'Catering, Kochkurs oder Feinkost anfragen: OTIAA, Uhlandstraße 37, 75181 Pforzheim. WhatsApp, E-Mail oder Formular.',
        body,
    });
}

/* ================= FAQ + Rechtliches (Inhalt aus content/) ================= */
function buildLegal() {
    const pages = {
        'faq.html': ['FAQ | OTIAA', 'FAQ | OTIAA', 'FAQ | OTIAA', 'Häufig gestellte Fragen zu OTIAA Catering, unseren Kochkursen und Feinkost-Produkten.'],
        'impressum.html': ['Impressum | OTIAA', 'Mentions légales | OTIAA', 'Legal notice | OTIAA', 'Impressum der OTIAA GbR - Kamerunisches Catering & Feinkost'],
        'datenschutz.html': ['Datenschutzerklärung | OTIAA', 'Politique de confidentialité | OTIAA', 'Privacy policy | OTIAA', 'Datenschutzerklärung der OTIAA GbR - Kamerunisches Catering & Feinkost'],
        'agb.html': ['AGB | OTIAA', 'CGV | OTIAA', 'T&C | OTIAA', 'Allgemeine Geschäftsbedingungen der OTIAA - Kamerunisches Catering & Feinkost'],
        'widerruf.html': ['Widerrufsbelehrung | OTIAA', 'Droit de rétractation | OTIAA', 'Right of withdrawal | OTIAA', 'Widerrufsbelehrung für Kunden der OTIAA - Kamerunisches Catering & Feinkost'],
    };
    for (const [file, [de, fr, en, desc]] of Object.entries(pages)) {
        const content = fs.readFileSync(path.join(ROOT, 'content', file), 'utf8');
        page({ file, current: '', title: { de, fr, en }, desc, body: `<div class="legal-page">\n${content}</div>` });
    }
}

/* ================= Sitemap ================= */
function buildSitemap() {
    const urls = [['', 1.0], ['ueber-uns.html', 0.8], ['catering.html', 0.9], ['kochkurse.html', 0.9], ['feinkost.html', 0.9], ['events.html', 0.8], ['galerie.html', 0.7], ['kontakt.html', 0.8], ['faq.html', 0.6]];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls.map(([u, p]) => `  <url>\n    <loc>${SITE}/${u}</loc>\n    <priority>${p.toFixed(1)}</priority>\n  </url>`).join('\n') + '\n</urlset>\n';
    fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
    console.log('geschrieben: sitemap.xml');
}

buildHome();
buildAbout();
buildCatering();
buildClasses();
buildProducts();
buildEvents();
buildGallery();
buildContact();
buildLegal();
buildSitemap();
