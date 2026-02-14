(function() {
  // Inject toggle CSS
  var css = document.createElement('style');
  css.textContent = '.lang-toggle{position:fixed;bottom:2rem;left:2rem;z-index:200;display:flex;align-items:center;gap:0.5rem;font-family:"DM Sans",sans-serif;font-size:0.65rem;letter-spacing:0.15em;text-transform:uppercase;opacity:0;animation:ltFade 1s 2.5s ease forwards}.lang-option{color:var(--mist,#D4C9B8);cursor:pointer;transition:color 0.4s ease;padding:0.2rem 0}.lang-option.active{color:var(--umber,#3D2B1F)}.lang-option:hover{color:var(--smoke,#8B7D6B)}.lang-sep{color:var(--mist,#D4C9B8);font-size:0.5rem}@keyframes ltFade{to{opacity:1}}@media(max-width:480px){.lang-toggle{bottom:1.2rem;left:1.2rem}}';
  document.head.appendChild(css);

  // Create toggle
  var toggle = document.createElement('div');
  toggle.className = 'lang-toggle';
  toggle.innerHTML = '<span class="lang-option active" data-lang="en">EN</span><span class="lang-sep">\u00b7</span><span class="lang-option" data-lang="es">ES</span><span class="lang-sep">\u00b7</span><span class="lang-option" data-lang="rw">RW</span>';
  document.body.appendChild(toggle);

  var T = window.pageTranslations;
  if (!T) return;

  var lang = localStorage.getItem('ds-lang') || 'en';
  var enCache = {};

  // Gather elements and cache English
  function gatherSection(sec) {
    var inner = sec.querySelector('.section-inner');
    if (!inner && sec.classList.contains('hero')) return null;
    if (!inner) return null;
    var data = {};
    var h2 = inner.querySelector('h2');
    if (h2) data.h = h2;
    data.p = Array.from(inner.querySelectorAll(':scope > p'));
    var q = inner.querySelector('.pullquote');
    if (q) data.q = q;
    return data;
  }

  // Cache English content
  var heroSub = document.querySelector('.hero-subtitle');
  if (heroSub) enCache._hs = heroSub.innerHTML;

  var sectionEls = {};
  document.querySelectorAll('.section[data-index]').forEach(function(sec) {
    var idx = sec.dataset.index;
    var data = gatherSection(sec);
    if (!data) return;
    sectionEls[idx] = data;
    if (data.h) enCache['s' + idx + 'h'] = data.h.innerHTML;
    data.p.forEach(function(p, i) { enCache['s' + idx + 'p' + i] = p.innerHTML; });
    if (data.q) enCache['s' + idx + 'q'] = data.q.innerHTML;
  });

  // Rebind term links after content swap
  function rebindTerms() {
    document.querySelectorAll('.term-link').forEach(function(el) {
      el.onclick = function(e) {
        e.preventDefault();
        if (typeof openTerm === 'function') openTerm(el.dataset.term);
      };
    });
  }

  function applyLang(newLang, animate) {
    function doSwap() {
      var langData = newLang !== 'en' ? T[newLang] : null;

      // Hero subtitle
      if (heroSub) {
        if (langData && langData.heroSubtitle) {
          heroSub.innerHTML = langData.heroSubtitle;
        } else {
          heroSub.innerHTML = enCache._hs;
        }
      }

      // Sections
      var sections = langData && langData.sections ? langData.sections : null;
      Object.keys(sectionEls).forEach(function(idx) {
        var sec = sectionEls[idx];
        var t = sections ? sections[idx] : null;

        // Heading
        if (sec.h) {
          sec.h.innerHTML = (t && t.h) ? t.h : enCache['s' + idx + 'h'];
        }

        // Paragraphs
        sec.p.forEach(function(pEl, i) {
          var translated = t && t.p && t.p[i];
          if (translated !== undefined && translated !== null) {
            pEl.innerHTML = translated;
          } else if (!t || newLang === 'en') {
            pEl.innerHTML = enCache['s' + idx + 'p' + i];
          }
        });

        // Pullquote
        if (sec.q) {
          sec.q.innerHTML = (t && t.q) ? t.q : enCache['s' + idx + 'q'];
        }
      });

      rebindTerms();

      // Update toggle state
      lang = newLang;
      localStorage.setItem('ds-lang', newLang);
      toggle.querySelectorAll('.lang-option').forEach(function(o) {
        o.classList.toggle('active', o.dataset.lang === newLang);
      });

      if (animate) {
        requestAnimationFrame(function() {
          document.body.style.transition = 'opacity 0.35s ease';
          document.body.style.opacity = '1';
        });
      }
    }

    if (animate) {
      document.body.style.transition = 'opacity 0.3s ease';
      document.body.style.opacity = '0';
      setTimeout(doSwap, 320);
    } else {
      doSwap();
    }
  }

  // Click handlers
  toggle.querySelectorAll('.lang-option').forEach(function(o) {
    o.addEventListener('click', function() {
      if (o.dataset.lang !== lang) applyLang(o.dataset.lang, true);
    });
  });

  // Apply saved preference without animation
  if (lang !== 'en') applyLang(lang, false);

  // ====== Infinite loop scroll for word nav ======
  setTimeout(function() {
    var navEl = document.getElementById('wordNav');
    if (!navEl || navEl.scrollWidth <= navEl.clientWidth) return;

    var origWidth = navEl.scrollWidth;
    var savedScroll = navEl.scrollLeft;

    // Snapshot original children
    var kids = [];
    var c = navEl.firstChild;
    while (c) { kids.push(c); c = c.nextSibling; }

    // Prepend a full clone set (enables leftward looping)
    var preFrag = document.createDocumentFragment();
    for (var i = 0; i < kids.length; i++) {
      preFrag.appendChild(kids[i].cloneNode(true));
    }
    navEl.insertBefore(preFrag, navEl.firstChild);

    // Append a full clone set (enables rightward looping)
    var postFrag = document.createDocumentFragment();
    for (var j = 0; j < kids.length; j++) {
      postFrag.appendChild(kids[j].cloneNode(true));
    }
    navEl.appendChild(postFrag);

    // Compensate scroll position for the prepended content
    var setW = navEl.scrollWidth / 3;
    navEl.scrollLeft = savedScroll + setW;

    // Loop: reset position seamlessly when crossing boundaries
    navEl.addEventListener('scroll', function() {
      if (navEl.scrollLeft >= setW * 2) {
        navEl.scrollLeft -= setW;
      } else if (navEl.scrollLeft < 1) {
        navEl.scrollLeft += setW;
      }
    });
  }, 250);
})();
