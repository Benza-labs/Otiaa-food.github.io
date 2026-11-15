/* OTIAA: Sprache, Menü, Einblenden, Galerie */
(function () {
    'use strict';
    document.documentElement.classList.add('js');

    var LANGS = ['de', 'fr', 'en'];

    function safeGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }
    function safeSet(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignorieren */ }
    }

    /* ---------- Sprache (DE / FR / EN) ---------- */
    function setLanguage(lang) {
        if (LANGS.indexOf(lang) === -1) lang = 'de';
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-de]').forEach(function (el) {
            var value = el.getAttribute('data-' + lang);
            if (value !== null && value !== '') el.innerHTML = value;
        });
        document.querySelectorAll('[data-alt-de]').forEach(function (el) {
            var value = el.getAttribute('data-alt-' + lang);
            if (value) el.setAttribute('alt', value);
        });
        document.querySelectorAll('[data-label-de]').forEach(function (el) {
            var value = el.getAttribute('data-label-' + lang);
            if (value) el.setAttribute('aria-label', value);
        });
        document.querySelectorAll('.lang-btn').forEach(function (btn) {
            btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
        });
        var titleEl = document.querySelector('title[data-de]');
        if (titleEl) document.title = titleEl.getAttribute('data-' + lang) || document.title;
        safeSet('otiaa-lang', lang);
    }

    document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.addEventListener('click', function () { setLanguage(btn.dataset.lang); });
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('lang') || safeGet('otiaa-lang') || 'de';
    if (initial !== 'de') setLanguage(initial);
    else document.querySelectorAll('.lang-btn').forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.dataset.lang === 'de' ? 'true' : 'false');
    });

    /* ---------- Mobiles Menü ---------- */
    var toggle = document.getElementById('menu-toggle');
    var nav = document.getElementById('site-nav');
    if (toggle && nav) {
        function closeMenu() {
            toggle.setAttribute('aria-expanded', 'false');
            nav.classList.remove('open');
            document.body.style.overflow = '';
        }
        toggle.addEventListener('click', function () {
            var open = toggle.getAttribute('aria-expanded') === 'true';
            if (open) { closeMenu(); return; }
            toggle.setAttribute('aria-expanded', 'true');
            nav.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > 960) closeMenu();
        });
    }

    /* ---------- Sanftes Einblenden (Inhalt bleibt ohne JS sichtbar) ---------- */
    var reveals = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window && reveals.length) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('in'); });
    }

    /* ---------- Galerie: Filter ---------- */
    var chips = document.querySelectorAll('.chip[data-filter]');
    var albums = document.querySelectorAll('.album[data-album]');
    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var f = chip.dataset.filter;
            chips.forEach(function (c) { c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'); });
            albums.forEach(function (a) { a.hidden = !(f === 'all' || a.dataset.album === f); });
            if (history.replaceState) history.replaceState(null, '', f === 'all' ? location.pathname : '#' + f);
        });
    });
    if (chips.length && location.hash) {
        var target = document.querySelector('.chip[data-filter="' + location.hash.slice(1) + '"]');
        if (target) target.click();
    }

    /* ---------- Galerie: Lightbox ---------- */
    var box = document.getElementById('lightbox');
    if (box && typeof box.showModal === 'function') {
        var img = box.querySelector('img');
        var cap = box.querySelector('.lightbox-cap');
        var items = [];
        var index = 0;

        function visibleItems() {
            return Array.prototype.filter.call(
                document.querySelectorAll('.masonry button[data-full]'),
                function (b) { return !b.closest('.album[hidden]'); }
            );
        }
        function show(i) {
            index = (i + items.length) % items.length;
            var b = items[index];
            img.src = b.dataset.full;
            img.alt = b.dataset.alt || '';
            cap.textContent = (b.dataset.caption || '') + '  ' + (index + 1) + ' / ' + items.length;
        }
        document.addEventListener('click', function (e) {
            var b = e.target.closest('.masonry button[data-full]');
            if (!b) return;
            items = visibleItems();
            show(items.indexOf(b));
            box.showModal();
        });
        box.querySelector('[data-lb="prev"]').addEventListener('click', function () { show(index - 1); });
        box.querySelector('[data-lb="next"]').addEventListener('click', function () { show(index + 1); });
        box.querySelector('[data-lb="close"]').addEventListener('click', function () { box.close(); });
        box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
        box.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') show(index - 1);
            if (e.key === 'ArrowRight') show(index + 1);
        });
        var blank = img.getAttribute('src');
        box.addEventListener('close', function () { img.setAttribute('src', blank); });
    }

    /* ---------- Videos: nur eines gleichzeitig ---------- */
    var videos = document.querySelectorAll('video');
    videos.forEach(function (v) {
        v.addEventListener('play', function () {
            videos.forEach(function (o) { if (o !== v) o.pause(); });
        });
    });
})();
