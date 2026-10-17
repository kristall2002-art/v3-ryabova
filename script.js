(function () {
  'use strict';
  var root = document.documentElement;
  var body = document.body;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- A11Y: размер шрифта ---------- */
  var FS_KEY = 'ryabova_fs', CT_KEY = 'ryabova_contrast';
  var FS_STEPS = [1, 1.12, 1.25];
  function fsIndex(v) {
    var best = 0, bd = 999;
    FS_STEPS.forEach(function (s, i) { var d = Math.abs(s - v); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function applyFontScale(v) {
    root.style.setProperty('--fs-scale', v);
    try { localStorage.setItem(FS_KEY, v); } catch (e) {}
  }
  (function initFs() {
    var saved = 1;
    try { saved = parseFloat(localStorage.getItem(FS_KEY)) || 1; } catch (e) {}
    applyFontScale(saved);
    document.querySelectorAll('[data-fs]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cur = parseFloat(getComputedStyle(root).getPropertyValue('--fs-scale')) || 1;
        var i = fsIndex(cur);
        if (btn.getAttribute('data-fs') === 'up') i = Math.min(i + 1, FS_STEPS.length - 1);
        else i = Math.max(i - 1, 0);
        applyFontScale(FS_STEPS[i]);
      });
    });
  })();

  /* ---------- A11Y: контраст ---------- */
  function setContrast(on) {
    body.classList.toggle('a11y-contrast', on);
    document.querySelectorAll('[data-contrast]').forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    try { localStorage.setItem(CT_KEY, on ? '1' : '0'); } catch (e) {}
  }
  (function initContrast() {
    var want = false;
    try { want = localStorage.getItem(CT_KEY) === '1'; } catch (e) {}
    setContrast(want);
    document.querySelectorAll('[data-contrast]').forEach(function (b) {
      b.addEventListener('click', function () { setContrast(!body.classList.contains('a11y-contrast')); });
    });
  })();

  /* ---------- мобильное меню ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var closeMenuBtn = document.getElementById('closeMenuBtn');
  function openMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
  if (menuBtn) menuBtn.addEventListener('click', openMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ---------- IntersectionObserver: fade-up ниже первого экрана ---------- */
  var faders = document.querySelectorAll('.section .animate-fade-up');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    faders.forEach(function (el) { io.observe(el); });
  } else {
    faders.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- иконки для карточек услуг ---------- */
  var ICONS = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>',
    scroll: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M6 4h11a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v3H4V6a2 2 0 0 1 2-2z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M20.8 8.6c0 5-8.8 10-8.8 10s-8.8-5-8.8-10a4.6 4.6 0 0 1 8.8-1.9A4.6 4.6 0 0 1 20.8 8.6Z"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2M16 6l2 2M19 3l2 2"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><rect x="3" y="7" width="18" height="12" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    stamp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M8 14h8l2 6H6l2-6Z"/><path d="M9 14V9a3 3 0 0 1 6 0v5"/><path d="M4 20h16"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M4 16V9l2.5-4h11L20 9v7"/><path d="M4 16h16"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/></svg>'
  };

  /* ---------- данные услуг (общий каталог нотариальных действий) ---------- */
  var CATEGORIES = [
    { icon: 'home', title: 'Недвижимость и ипотека', desc: 'Сделки с квартирами, долями, залогом и рентой', items: ['Купля-продажа квартиры, дома, участка', 'Продажа доли в квартире', 'Дарение недвижимости', 'Договор ипотеки доли в праве общей собственности'] },
    { icon: 'scroll', title: 'Наследство и завещания', desc: 'Завещания, наследственные дела, свидетельства о праве', items: ['Удостоверение завещания', 'Открытие и ведение наследственного дела', 'Свидетельство о праве на наследство', 'Соглашение о разделе наследственного имущества'] },
    { icon: 'heart', title: 'Семья и брак', desc: 'Брачный договор, алименты, согласия', items: ['Брачный договор', 'Соглашение о разделе имущества супругов', 'Соглашение об уплате алиментов', 'Согласие супруга на сделку'] },
    { icon: 'key', title: 'Доверенности', desc: 'Любые доверенности, включая машиночитаемые', items: ['Генеральная доверенность', 'На управление и распоряжение автомобилем', 'На ведение наследственного дела', 'Отмена доверенности'] },
    { icon: 'briefcase', title: 'Бизнес и ООО', desc: 'Доли, уставы, протоколы', items: ['Купля-продажа доли в уставном капитале ООО', 'Залог доли', 'Удостоверение решения единственного участника', 'Удостоверение протокола общего собрания'] },
    { icon: 'stamp', title: 'Свидетельствования', desc: 'Подписи, копии, переводы, факты', items: ['Свидетельствование подлинности подписи', 'Свидетельствование верности копий документов', 'Свидетельствование верности перевода', 'Удостоверение факта нахождения гражданина в живых'] },
    { icon: 'car', title: 'Прочие действия и выезд', desc: 'Консультации, выезд, корпоративное обслуживание', items: ['Правовая консультация по нотариальному действию', 'Выезд нотариуса на дом, в больницу, в офис', 'Корпоративное обслуживание организаций', 'Составление проектов договоров и заявлений'] }
  ];

  var svcGrid = document.getElementById('svcGrid');
  if (svcGrid) {
    svcGrid.innerHTML = CATEGORIES.map(function (c) {
      return '<article class="svc-card"><div class="svc-ico">' + ICONS[c.icon] + '</div>' +
        '<h3>' + c.title + '</h3><p class="svc-desc">' + c.desc + '</p>' +
        '<ul>' + c.items.map(function (it) { return '<li>' + it + '</li>'; }).join('') + '</ul></article>';
    }).join('');
  }

  /* ---------- карусель панели 2 ---------- */
  var CARDS = [
    { icon: 'home', color: '#2c2a24', text: 'Сделки с недвижимостью и долями в праве собственности' },
    { icon: 'scroll', color: '#31502f', text: 'Завещания, наследственные дела и свидетельства о праве' },
    { icon: 'key', color: '#2f4a57', text: 'Доверенности любого назначения, включая машиночитаемые' },
    { icon: 'heart', color: '#5c4326', text: 'Брачные договоры и соглашения о разделе имущества' }
  ];
  var activeCard = 0;
  var cardContainer = document.getElementById('cardContainer');
  var dotsContainer = document.getElementById('cardDots');
  var carouselTimer = null;

  function renderCards() {
    if (!cardContainer) return;
    cardContainer.innerHTML = CARDS.map(function (c, i) {
      var vis = i === activeCard ? 'opacity:1;transform:translateY(0)' : 'opacity:0;transform:translateY(16px);position:absolute;inset:0';
      return '<div class="card" style="' + vis + '"><div class="card-ico" style="background:' + c.color + '">' + ICONS[c.icon] + '</div><p>' + c.text + '</p></div>';
    }).join('');
    dotsContainer.innerHTML = CARDS.map(function (_, i) {
      return '<button type="button" class="dot" role="tab" aria-selected="' + (i === activeCard) + '" data-i="' + i + '" aria-label="Слайд ' + (i + 1) + '"><span></span></button>';
    }).join('');
  }
  if (dotsContainer) {
    dotsContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('.dot');
      if (!btn) return;
      activeCard = parseInt(btn.getAttribute('data-i'), 10);
      renderCards();
      restartCarousel();
    });
  }
  function tickCarousel() { activeCard = (activeCard + 1) % CARDS.length; renderCards(); }
  function restartCarousel() {
    if (carouselTimer) clearInterval(carouselTimer);
    if (!reduceMotion) carouselTimer = setInterval(tickCarousel, 3500);
  }
  renderCards();
  restartCarousel();

  /* ---------- отзывы (примеры) ---------- */
  var REVIEWS = [
    { stars: 5, text: 'Оформляли сделку купли-продажи квартиры с ипотекой, заранее прислали список документов по выписке ЕГРН и согласиям супругов — всё прошло за один визит.', tag: 'Сделки с недвижимостью' },
    { stars: 5, text: 'Записывались на вступление в наследство, объяснили весь порядок и какие документы нужны на свидетельство о праве на наследство.', tag: 'Наследство' },
    { stars: 4, text: 'Вызывали нотариуса на дом в Купчино к пожилому родственнику для завещания — приехали в назначенное время.', tag: 'Выезд на дом' },
    { stars: 4, text: 'Оформляли брачный договор, приняли карту и наличные, контора рядом с метро Купчино.', tag: 'Брачный договор' }
  ];
  var revGrid = document.getElementById('revGrid');
  if (revGrid) {
    revGrid.innerHTML = REVIEWS.map(function (r) {
      return '<article class="rev-card"><div class="rev-top"><span class="rev-stars" aria-label="Оценка ' + r.stars + ' из 5">' + '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars) + '</span><span class="rev-tag">пример</span></div>' +
        '<p>' + r.text + '</p><span class="rev-cat">' + r.tag + '</span></article>';
    }).join('');
  }

  /* ---------- FAQ ---------- */
  var FAQ = [
    { q: 'Как записаться на приём к нотариусу Рябовой?', a: 'По телефону +7 (812) 708-19-17. Приём ведётся по будням: пн 10:00–13:00 и 14:00–18:00, вт 09:00–13:00 и 14:00–18:00, ср 10:00–13:00 и 14:00–17:00, чт 10:00–13:00 и 14:00–18:00. В пятницу приёма граждан нет, суббота и воскресенье — выходные.' },
    { q: 'По одному ли адресу работает только нотариус Рябова?', a: 'По адресу Пловдивская, 9 находится нотариальная контора, в которой ведут приём несколько независимых нотариусов. Чтобы попасть именно к нотариусу Рябовой О.В., звоните по её телефону +7 (812) 708-19-17.' },
    { q: 'Можно ли вызвать нотариуса на дом?', a: 'Да, в пределах Купчино — Будапештская, Пловдивская, Малая Каштановая аллея, Купчинская. Время выезда согласуется заранее по телефону.' },
    { q: 'Нужно ли самому приносить выписку из ЕГРН для сделки?', a: 'Нет, при удостоверении сделки нотариус самостоятельно запрашивает выписку из ЕГРН в электронном виде — это занимает от 3 до 7 дней. При желании собственник может получить выписку заранее сам через МФЦ.' },
    { q: 'Кому положены льготы по уплате пошлины?', a: 'Инвалиды I и II группы — скидка 50% по всем нотариальным действиям (ст. 333.38 НК РФ). Герои СССР и РФ, полные кавалеры ордена Славы, участники и инвалиды ВОВ — освобождены от пошлины полностью (ст. 333.35, 333.38 НК РФ). Несовершеннолетние наследники и подопечные с психическим расстройством не платят пошлину за свидетельство о праве на наследство.' },
    { q: 'Какие способы оплаты принимаются?', a: 'Наличные деньги и банковские карты.' }
  ];
  var faqList = document.getElementById('faqList');
  if (faqList) {
    faqList.innerHTML = FAQ.map(function (f, i) {
      return '<div class="acc-item" aria-expanded="false">' +
        '<button type="button" class="acc-q" id="faq-q-' + i + '" aria-controls="faq-a-' + i + '" aria-expanded="false">' + f.q + '<span class="plus" aria-hidden="true">+</span></button>' +
        '<div class="acc-a" id="faq-a-' + i + '" role="region" aria-labelledby="faq-q-' + i + '"><p>' + f.a + '</p></div></div>';
    }).join('');
    faqList.addEventListener('click', function (e) {
      var btn = e.target.closest('.acc-q');
      if (!btn) return;
      var item = btn.closest('.acc-item');
      var answer = item.querySelector('.acc-a');
      var open = item.getAttribute('aria-expanded') === 'true';
      item.setAttribute('aria-expanded', open ? 'false' : 'true');
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      answer.style.maxHeight = open ? '' : answer.scrollHeight + 'px';
    });
  }

  /* ---------- реакция на смену prefers-reduced-motion "на лету" ---------- */
  if (window.matchMedia) {
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
      reduceMotion = e.matches;
      restartCarousel();
    });
  }
})();
