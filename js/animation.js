/* ===================================================================
   HPS LP — SCROLL ANIMATIONS  (animation.js)
   HTML me koi class/attribute add karne ki zaroorat nahi — saari
   animations selectors se apne aap lagti hain (MAP neeche hai).
   =================================================================== */
(function () {
  'use strict';

  var html = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reduce-motion ya purana browser: koi animation nahi, sab seedha dikhao
  if (reduce || !('IntersectionObserver' in window)) {
    html.classList.remove('js');
    html.classList.add('rv-ready');
    return;
  }
  html.classList.add('js');

  var STEP = 90; // ek saath dikhne wale items ke beech delay (ms)
  var $ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  try {
    /* ----------------------------------------------------------------
       1) Heading word-split  (<span> ke andar ka text bhi split hota hai)
       ---------------------------------------------------------------- */
    function splitWords(el) {
      var i = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach(function (p) {
              if (!p) return;
              if (/^\s+$/.test(p)) {
                frag.appendChild(document.createTextNode(' '));
              } else {
                var w = document.createElement('span');
                w.className = 'w';
                var inner = document.createElement('span');
                inner.className = 'wi';
                inner.style.setProperty('--i', i++);
                inner.textContent = p;
                w.appendChild(inner);
                frag.appendChild(w);
              }
            });
            node.replaceChild(frag, n);
          } else if (n.nodeType === 1) {
            walk(n);
          }
        });
      })(el);
      el.classList.add('split');
    }

    var heroTitle = $('.hero h1')[0];
    if (heroTitle) splitWords(heroTitle);
    var titles = $('.sec-title');
    titles.forEach(splitWords);

    /* ----------------------------------------------------------------
       2) Reveal map:  [selector, effect, extraDelay(ms)]
          effects: up | right | left | scale | pop | clip-up | clip-left
                   from-right | from-left | line
       ---------------------------------------------------------------- */
    var MAP = [
      ['.eyebrow', 'up'],

      // about
      ['.about', 'line'],
      ['.about-right p', 'up'],

      // gallery
      ['.g-item', 'clip-up'],

      // learning environment
      ['.env-head .btn-hps', 'up'],
      ['.pt', 'up'],

      // NCC
      ['.ncc-text p', 'up'],
      ['.ncc-media', 'clip-left'],
      ['.ncc-media figcaption', 'up', 500],
      ['.ncc-list-head', 'right'],
      ['.ncc-item', 'right'],
      ['.ncc-note', 'up'],
      ['.ncc-stat', 'up'],

      // defence
      ['.def-text p', 'up'],
      ['.def-text .btn-hps', 'up'],
      ['.def-img', 'clip-up'],
      ['.def-letter', 'pop'],
      ['.def-box', 'clip-left'],

      // results
      ['.res-text p', 'up'],
      ['.res-card', 'scale'],
      ['.res-star', 'pop', 350],
      ['.res-sub', 'up'],
      ['.res-tile', 'clip-up'],
      ['.res-cta h3', 'up'],
      ['.res-cta p', 'up'],
      ['.res-cta .btn-hps', 'up'],

      // testimonials
      ['.tst-nav', 'up'],
      ['.tst-swiper', 'up'],

      // mentors
      ['.mnt-card', 'scale'],
      ['.mnt-head p', 'up'],
      ['.mnt-divider', 'line'],
      ['.mnt-divider h3', 'up', 150],
      ['.mnt-swiper', 'up'],
      ['.mnt-foot > *', 'up'],

      // life at HPS (rows opposite direction se aati hain)
      ['.life-head .btn-hps', 'up'],
      ['.life-marquee .mq:nth-child(1)', 'from-right'],
      ['.life-marquee .mq:nth-child(2)', 'from-left'],

      // faq
      ['.faq-side p', 'up'],
      ['.faq-item', 'up'],

      // cta + footer
      ['.cta-card', 'scale'],
      ['.cta-card p', 'up'],
      ['.cta .btn-glow', 'up'],
      ['.site-footer .copy', 'up'],
      ['.site-footer .credit', 'up'],
    ];

    var pending = [];

    function reveal(el, delay) {
      if (el.dataset.rvIn) return;
      el.dataset.rvIn = '1';
      el.style.setProperty('--d', delay + 'ms');
      el.classList.add('is-in');
      if (el.dataset.count !== undefined) countUp(el, delay);
      var k = pending.indexOf(el);
      if (k > -1) pending.splice(k, 1);
    }

    var io = new IntersectionObserver(
      function (entries) {
        var batch = entries
          .filter(function (e) { return e.isIntersecting; })
          .map(function (e) { return e.target; });
        // upar se neeche, left se right order me
        batch.sort(function (a, b) {
          var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          return Math.round(ra.top / 40) - Math.round(rb.top / 40) || ra.left - rb.left;
        });
        batch.forEach(function (el, i) {
          reveal(el, Math.min(i, 8) * STEP + (parseInt(el.dataset.rvd, 10) || 0));
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    function watch(el) {
      pending.push(el);
      io.observe(el);
    }

    MAP.forEach(function (m) {
      $(m[0]).forEach(function (el) {
        if (el.dataset.rvSet) return;
        el.dataset.rvSet = '1';
        if (m[1] === 'line') el.classList.add('rv-line');
        else el.classList.add('rv', 'rv-' + m[1]);
        if (m[2]) el.dataset.rvd = m[2];
        watch(el);
      });
    });

    // headings: word reveal (heading ko hide nahi karte, words animate hote hain)
    titles.forEach(watch);

    /* ----------------------------------------------------------------
       3) Count-up numbers  (04, 800+, 3, 3, 5 …)
       ---------------------------------------------------------------- */
    function pad(n, len) {
      n = String(n);
      while (n.length < len) n = '0' + n;
      return n;
    }
    function countUp(el, delay) {
      var target = parseInt(el.dataset.count, 10),
        len = parseInt(el.dataset.len, 10),
        suf = el.dataset.suffix || '',
        dur = 1700;
      // final width lock (counting ke time layout na hile)
      el.textContent = pad(target, len) + suf;
      el.style.minWidth = el.offsetWidth + 'px';
      el.textContent = pad(0, len) + suf;
      setTimeout(function () {
        var start = performance.now();
        (function tick(now) {
          var p = Math.min(1, (now - start) / dur);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = pad(Math.round(target * e), len) + suf;
          if (p < 1) requestAnimationFrame(tick);
          else el.style.minWidth = '';
        })(start);
      }, delay);
    }
    $('.ncc-stat strong, .res-big strong, .res-tile-in strong').forEach(function (el) {
      var m = el.textContent.trim().match(/^(\d+)(\+?)$/);
      if (!m) return; // "IX-X", "Boys & Girls" skip
      el.dataset.count = m[1];
      el.dataset.len = m[1].length;
      el.dataset.suffix = m[2];
      el.classList.add('is-count');
      el.textContent = pad(0, m[1].length) + m[2];
      watch(el);
    });

    /* ----------------------------------------------------------------
       4) Hero intro (page load pe)
       ---------------------------------------------------------------- */
    var HERO = [
      ['.hero-logo a', 'drop', 100],
      ['.hero-pill', 'up', 250],
      ['.hero-text', 'up', 950],
      ['.hero-btns .btn-hps:nth-child(1)', 'up', 1100],
      ['.hero-btns .btn-hps:nth-child(2)', 'up', 1200],
    ];
    var heroEls = [];
    HERO.forEach(function (h) {
      $(h[0]).forEach(function (el) {
        el.classList.add('rv', 'rv-' + h[1]);
        el.style.setProperty('--d', h[2] + 'ms');
        heroEls.push(el);
      });
    });
    if (heroTitle) heroTitle.style.setProperty('--d', '450ms');

    html.classList.add('rv-ready'); // pre-hide hata do (ab classes lag chuki hain)

    function playHero() {
      requestAnimationFrame(function () {
        heroEls.forEach(function (el) { el.classList.add('is-in'); });
        if (heroTitle) heroTitle.classList.add('is-in');
      });
    }
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var heroTimer = setTimeout(playHero, 900); // fonts late hon to bhi
    fontsReady.then(function () {
      clearTimeout(heroTimer);
      setTimeout(playHero, 80);
    });

    /* ----------------------------------------------------------------
       5) Scroll effects: progress bar, hero parallax, image parallax
       ---------------------------------------------------------------- */
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);

    var heroTop = $('.hero-top')[0],
      video = $('.hero-video')[0],
      heroInner = $('.hero-inner')[0],
      pxImgs = $('.ncc-media img, .def-img img, .g-item img');
    pxImgs.forEach(function (img) { img.classList.add('px-img'); });

    var ticking = false,
      heroReset = false;

    function heroFx(y) {
      if (!heroTop) return;
      var h = heroTop.offsetHeight;
      if (y > h) {
        if (!heroReset) {
          heroReset = true;
          if (heroInner) heroInner.style.opacity = '0';
        }
        return;
      }
      heroReset = false;
      var t = y / h;
      if (video) video.style.transform = 'translate3d(0,' + (y * 0.06).toFixed(1) + 'px,0) scale(1.15)';
      if (heroInner) {
        heroInner.style.transform = 'translate3d(0,' + (y * 0.16).toFixed(1) + 'px,0)';
        heroInner.style.opacity = String(Math.max(0, 1 - t * 1.3).toFixed(3));
      }
    }

    function imageParallax() {
      var vh = window.innerHeight;
      pxImgs.forEach(function (img) {
        var box = img.parentElement.getBoundingClientRect();
        if (box.bottom < -120 || box.top > vh + 120) return;
        var p = (box.top + box.height / 2 - vh / 2) / (vh / 2 + box.height / 2);
        p = Math.max(-1, Math.min(1, p));
        img.style.translate = '0 ' + (-p * box.height * 0.055).toFixed(1) + 'px';
      });
    }

    function revealRemainingAtBottom() {
      // page ke bilkul end pe (footer jaise) jo elements observer se rah gaye unhe dikha do
      if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 4) return;
      pending.slice().forEach(function (el, i) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          reveal(el, i * STEP);
          io.unobserve(el);
        }
      });
    }

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
      heroFx(y);
      imageParallax();
      revealRemainingAtBottom();
      ticking = false;
    }
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(onScroll);
        }
      },
      { passive: true }
    );
    window.addEventListener('resize', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    });
    onScroll();
  } catch (err) {
    // kuch bhi fail ho to page normal dikhe (hidden states `.js` ke peeche hain)
    html.classList.remove('js');
    html.classList.add('rv-ready');
    if (window.console) console.warn('animation.js disabled:', err);
  }
})();