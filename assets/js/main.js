/* ============================================================
   Metro Prosperity 都市盛世 — interactions
   ============================================================ */
(function(){
  "use strict";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header scroll state + back-to-top ---------- */
  var header = document.getElementById("header");
  var toTop = document.getElementById("toTop");
  function onScroll(){
    header.classList.toggle("is-scrolled", window.scrollY > 30);
    toTop.classList.toggle("show", window.scrollY > 600);
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();

  /* ---------- Mobile drawer ---------- */
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");
  var menuOpen = document.getElementById("menuOpen");
  var menuClose = document.getElementById("menuClose");
  var lastFocus = null;
  function openDrawer(){
    lastFocus = document.activeElement;
    drawer.classList.add("open"); scrim.classList.add("open");
    drawer.setAttribute("aria-hidden","false");
    menuOpen.setAttribute("aria-expanded","true");
    document.body.style.overflow = "hidden";
    var f = drawer.querySelector("a,button"); if(f) f.focus();
  }
  function closeDrawer(){
    drawer.classList.remove("open"); scrim.classList.remove("open");
    drawer.setAttribute("aria-hidden","true");
    menuOpen.setAttribute("aria-expanded","false");
    document.body.style.overflow = "";
    if(lastFocus) lastFocus.focus();
  }
  menuOpen.addEventListener("click", openDrawer);
  menuClose.addEventListener("click", closeDrawer);
  scrim.addEventListener("click", closeDrawer);
  // only close on in-page anchor links; external links navigate away anyway
  drawer.querySelectorAll('a[href^="#"]').forEach(function(a){ a.addEventListener("click", closeDrawer); });

  /* ---------- Search overlay (wired to WordPress search) ---------- */
  var sOverlay = document.getElementById("searchOverlay");
  var sOpen = document.getElementById("searchOpen");
  var sClose = document.getElementById("searchClose");
  var sInput = document.getElementById("searchInput");
  var sForm = document.getElementById("searchForm");
  function openSearch(){
    sOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(function(){ sInput.focus(); }, 120);
  }
  function closeSearch(){
    sOverlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  sOpen.addEventListener("click", openSearch);
  sClose.addEventListener("click", closeSearch);
  sOverlay.addEventListener("click", function(e){ if(e.target === sOverlay) closeSearch(); });
  // native GET submit to https://metro-prosperity.com/?s=... (opens in new tab via target="_blank")
  sForm.addEventListener("submit", function(e){
    if(!sInput.value.trim()){ e.preventDefault(); sInput.focus(); return; }
    setTimeout(closeSearch, 120);
  });

  document.addEventListener("keydown", function(e){
    if(e.key === "Escape"){
      if(sOverlay.classList.contains("open")) closeSearch();
      if(drawer.classList.contains("open")) closeDrawer();
    }
  });

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener("click", function(e){
      var id = link.getAttribute("href");
      if(id === "#" || id.length < 2) return;
      var target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
      window.scrollTo({top:y, behavior: prefersReduced ? "auto" : "smooth"});
    });
  });
  toTop.addEventListener("click", function(){
    window.scrollTo({top:0, behavior: prefersReduced ? "auto" : "smooth"});
  });

  /* ---------- Active nav link on scroll ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  var sections = navLinks.map(function(a){ return document.querySelector(a.getAttribute("href")); });
  if("IntersectionObserver" in window){
    var navObs = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          navLinks.forEach(function(a){
            a.classList.toggle("active", a.getAttribute("href") === "#"+en.target.id);
          });
        }
      });
    }, {rootMargin:"-45% 0px -50% 0px"});
    sections.forEach(function(s){ if(s) navObs.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if("IntersectionObserver" in window && !prefersReduced){
    var revObs = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add("is-visible"); revObs.unobserve(en.target); }
      });
    }, {threshold:0.12, rootMargin:"0px 0px -40px 0px"});
    revealEls.forEach(function(el){ revObs.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("is-visible"); });
  }

  /* ---------- Animated counters ---------- */
  function animateCount(el){
    var target = parseFloat(el.getAttribute("data-count"));
    if(prefersReduced){ el.textContent = target; return; }
    var dur = 1500, start = null;
    function frame(ts){
      if(!start) start = ts;
      var p = Math.min((ts - start)/dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if(p < 1) requestAnimationFrame(frame); else el.textContent = target;
    }
    requestAnimationFrame(frame);
  }
  var counters = document.querySelectorAll("[data-count]");
  if("IntersectionObserver" in window){
    var cObs = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ animateCount(en.target); cObs.unobserve(en.target); }
      });
    }, {threshold:0.6});
    counters.forEach(function(c){ cObs.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Generic category filter (deals grid, enterprise grid, …) ---------- */
  document.querySelectorAll("[data-filterbar]").forEach(function(bar){
    var grid = document.querySelector(bar.getAttribute("data-target"));
    if(!grid) return;
    var cards = grid.querySelectorAll("[data-category]");
    bar.addEventListener("click", function(e){
      var btn = e.target.closest("button"); if(!btn) return;
      bar.querySelectorAll("button").forEach(function(b){ b.classList.remove("active"); });
      btn.classList.add("active");
      var cat = btn.getAttribute("data-filter");
      cards.forEach(function(card){
        var show = cat === "all" || card.getAttribute("data-category") === cat;
        card.style.display = show ? "" : "none";
      });
    });
  });

  /* ---------- Generic carousels ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function(car){
    var track = car.querySelector("[data-carousel-track]");
    var prev = car.querySelector("[data-carousel-prev]");
    var next = car.querySelector("[data-carousel-next]");
    var dotsWrap = car.querySelector("[data-carousel-dots]");
    var items = Array.prototype.slice.call(track.children);
    if(!items.length) return;
    var dots = [];

    function step(){
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 22;
      return items[0].getBoundingClientRect().width + gap;
    }
    function currentIndex(){ return Math.round(track.scrollLeft / step()); }
    function maxIndex(){
      var visible = Math.max(1, Math.round(track.clientWidth / step()));
      return Math.max(0, items.length - visible);
    }
    function buildDots(){
      if(!dotsWrap) return;
      dotsWrap.innerHTML = ""; dots = [];
      var count = maxIndex() + 1;
      for(var i=0;i<count;i++){
        (function(idx){
          var b = document.createElement("button");
          b.setAttribute("aria-label","前往第 "+(idx+1)+" 組");
          b.addEventListener("click", function(){ track.scrollTo({left: idx*step(), behavior:"smooth"}); pauseAuto(); });
          dotsWrap.appendChild(b); dots.push(b);
        })(i);
      }
    }
    function update(){
      var idx = currentIndex(), mx = maxIndex();
      if(prev) prev.disabled = idx <= 0;
      if(next) next.disabled = idx >= mx;
      dots.forEach(function(d,i){ d.classList.toggle("active", i === Math.min(idx, dots.length-1)); });
    }
    if(prev) prev.addEventListener("click", function(){ track.scrollBy({left:-step(), behavior:"smooth"}); pauseAuto(); });
    if(next) next.addEventListener("click", function(){ track.scrollBy({left:step(), behavior:"smooth"}); pauseAuto(); });

    var st;
    track.addEventListener("scroll", function(){ clearTimeout(st); st = setTimeout(update, 60); }, {passive:true});
    var rt;
    window.addEventListener("resize", function(){ clearTimeout(rt); rt = setTimeout(function(){ buildDots(); update(); }, 150); });

    // autoplay
    var autoMs = parseInt(car.getAttribute("data-autoplay"),10);
    var autoPausedUntil = 0;
    function pauseAuto(){ autoPausedUntil = Date.now() + 9000; }
    function tick(){
      if(prefersReduced || document.hidden || Date.now() < autoPausedUntil) return;
      if(currentIndex() >= maxIndex()) track.scrollTo({left:0, behavior:"smooth"});
      else track.scrollBy({left:step(), behavior:"smooth"});
    }
    if(autoMs && !prefersReduced){
      setInterval(tick, autoMs);
      car.addEventListener("mouseenter", function(){ autoPausedUntil = Date.now() + 999999; });
      car.addEventListener("mouseleave", function(){ autoPausedUntil = 0; });
      track.addEventListener("touchstart", pauseAuto, {passive:true});
      track.addEventListener("pointerdown", pauseAuto);
    }
    buildDots();
    update();
  });

  /* ---------- Lightbox (poster images + YouTube video preview) ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.innerHTML = '<button class="lightbox-close" aria-label="關閉"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button><div class="lightbox-body"></div>';
  document.body.appendChild(lb);
  var lbBody = lb.querySelector(".lightbox-body");
  function lbOpen(html){ lbBody.innerHTML = html; lb.classList.add("open"); document.body.style.overflow = "hidden"; }
  function lbClose(){ lb.classList.remove("open"); document.body.style.overflow = ""; setTimeout(function(){ lbBody.innerHTML = ""; }, 250); }
  lb.addEventListener("click", function(e){ if(e.target === lb || e.target.closest(".lightbox-close")) lbClose(); });
  document.addEventListener("keydown", function(e){ if(e.key === "Escape" && lb.classList.contains("open")) lbClose(); });
  document.addEventListener("click", function(e){
    var vid = e.target.closest("[data-lightbox-video]");
    if(vid){
      e.preventDefault();
      var id = vid.getAttribute("data-lightbox-video");
      lbOpen('<div class="lb-video"><iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1" title="影片" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div>');
      return;
    }
    var img = e.target.closest("[data-lightbox-img]");
    if(img){
      e.preventDefault();
      lbOpen('<img src="' + img.getAttribute("data-lightbox-img") + '" alt="著數優惠" />');
    }
  });
})();
