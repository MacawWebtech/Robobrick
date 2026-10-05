/* ==========================================================================
   RoboBricks — main.js (vanilla ES6+, no dependencies besides Bootstrap bundle)
   --------------------------------------------------------------------------
   Modules: preferences (theme + direction), header, reveal, counters,
   progress, program finder, filters, FAQ search, forms, toasts, lightbox,
   countdown, maker-lab robot, age explorer, badge unlock, misc.
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KEYS = { theme: "robotics-theme", dir: "robotics-dir" };
  const BS_LTR = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
  const BS_RTL = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css";

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } }
  };

  /* ---------- Photo fallbacks -------------------------------------------
     Photos load from Pexels/Unsplash CDNs. If one can't load (offline, blocked,
     removed), swap in the bundled SVG illustration from data-fallback. */
  const useFallback = (img) => {
    const fb = img.dataset.fallback;
    if (fb && img.getAttribute("src") !== fb) { img.src = fb; img.classList.add("is-fallback"); }
  };
  document.addEventListener("error", (e) => {
    const t = e.target;
    if (t && t.tagName === "IMG" && t.dataset.fallback) useFallback(t);
  }, true);
  $$("img[data-fallback]").forEach(img => { if (img.complete && img.naturalWidth === 0) useFallback(img); });

  /* ---------- Toasts ---------------------------------------------------- */
  const toast = (msg, icon = "bi-check-circle-fill") => {
    let wrap = $(".rb-toast-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "rb-toast-wrap";
      wrap.setAttribute("role", "status");
      wrap.setAttribute("aria-live", "polite");
      document.body.appendChild(wrap);
    }
    const t = document.createElement("div");
    t.className = "rb-toast";
    t.innerHTML = `<i class="bi ${icon}" aria-hidden="true"></i><span></span>`;
    t.querySelector("span").textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => { t.style.opacity = "0"; t.style.transition = "opacity .3s"; }, 3200);
    setTimeout(() => t.remove(), 3600);
  };
  window.RoboBricks = { toast };

  /* ---------- Preferences: theme + direction ---------------------------- */
  const applyTheme = (theme) => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    $$("[data-theme-toggle]").forEach(b => {
      b.setAttribute("aria-pressed", String(theme === "dark"));
      b.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  };
  const applyDir = (dir) => {
    document.documentElement.setAttribute("dir", dir);
    const bs = $("#bs-css");
    if (bs) bs.href = dir === "rtl" ? BS_RTL : BS_LTR;
    $$("[data-dir-toggle]").forEach(b => {
      b.setAttribute("aria-pressed", String(dir === "rtl"));
      const lbl = b.querySelector("[data-dir-label]");
      if (lbl) lbl.textContent = dir === "rtl" ? "LTR" : "RTL";
    });
  };
  applyTheme(document.documentElement.getAttribute("data-bs-theme") || "light");
  applyDir(document.documentElement.getAttribute("dir") || "ltr");

  document.addEventListener("click", (e) => {
    const tBtn = e.target.closest("[data-theme-toggle]");
    if (tBtn) {
      const next = document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark";
      applyTheme(next); store.set(KEYS.theme, next);
    }
    const dBtn = e.target.closest("[data-dir-toggle]");
    if (dBtn) {
      const next = document.documentElement.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
      applyDir(next); store.set(KEYS.dir, next);
      toast(next === "rtl" ? "Right-to-left layout on" : "Left-to-right layout on", "bi-translate");
    }
  });

  /* ---------- Header ---------------------------------------------------- */
  const header = $(".rb-header");
  const mobileBar = $(".mobile-cta-bar");
  const toTop = $(".to-top");
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 8);
    mobileBar?.classList.toggle("is-visible", y > 420);
    toTop?.classList.toggle("is-visible", y > 900);
    const rp = $(".reading-progress");
    if (rp) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      rp.style.width = `${Math.min(100, (y / h) * 100)}%`;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  /* ---------- Reveal + counters + bars ---------------------------------- */
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = (el.dataset.count.split(".")[1] || "").length;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = (dec ? target.toFixed(dec) : target.toLocaleString("en-IN")) + suffix; return; }
    const dur = 1400; const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (dec ? (target * eased).toFixed(dec) : Math.round(target * eased).toLocaleString("en-IN")) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      if (el.hasAttribute("data-reveal")) el.classList.add("is-in");
      if (el.hasAttribute("data-count")) countUp(el);
      if (el.hasAttribute("data-progress")) el.style.width = `${el.dataset.progress}%`;
      if (el.hasAttribute("data-ring")) el.style.setProperty("--p", el.dataset.ring);
      if (el.hasAttribute("data-bar-h")) el.style.height = `${el.dataset.barH}%`;
      io.unobserve(el);
    });
  }, { threshold: .15, rootMargin: "0px 0px -40px 0px" }) : null;
  const watch = (root = document) => {
    $$("[data-reveal],[data-count],[data-progress],[data-ring],[data-bar-h]", root).forEach(el => {
      if (io) io.observe(el);
      else { el.classList.add("is-in"); }
    });
  };
  watch();
  window.RoboBricks.watch = watch;

  /* ---------- Program data + finder ------------------------------------- */
  const PROGRAMS = [
    { id: "lego-builders", name: "LEGO Builders", age: "5-7", level: "Beginner", type: "LEGO Engineering", weeks: 8, duration: "8 weeks", day: "Saturday", format: "In-person", price: 2499, size: 8, instructor: "Anika Rao", start: "Oct 10", blurb: "Gears, levers and sturdy structures through playful builds." },
    { id: "story-bots", name: "Story Bots", age: "5-7", level: "Beginner", type: "Robotics", weeks: 6, duration: "6 weeks", day: "Sunday", format: "In-person", price: 2199, size: 8, instructor: "Maya Sharma", start: "Oct 18", blurb: "Tiny robots that act out stories kids design and code with tiles." },
    { id: "junior-robotics", name: "Junior Robotics", age: "8-10", level: "Beginner", type: "Robotics", weeks: 10, duration: "10 weeks", day: "Saturday", format: "In-person", price: 2499, size: 10, instructor: "Maya Sharma", start: "Oct 10", blurb: "Motors, sensors and first block-coded robots." },
    { id: "code-crafters", name: "Code Crafters", age: "8-10", level: "Intermediate", type: "Coding", weeks: 8, duration: "8 weeks", day: "Wednesday", format: "Hybrid", price: 2299, size: 12, instructor: "Daniel Thomas", start: "Oct 14", blurb: "Scratch-style logic, loops and events that drive real hardware." },
    { id: "robo-engineers", name: "Robo Engineers", age: "11-13", level: "Intermediate", type: "Robotics", weeks: 12, duration: "12 weeks", day: "Saturday", format: "In-person", price: 2999, size: 10, instructor: "Daniel Thomas", start: "Oct 17", blurb: "Programmable robots, multi-step engineering challenges." },
    { id: "maker-weekend", name: "Maker Weekend", age: "11-13", level: "Beginner", type: "LEGO Engineering", weeks: 4, duration: "4 weeks", day: "Sunday", format: "In-person", price: 1799, size: 12, instructor: "Anika Rao", start: "Oct 25", blurb: "Bridges, cranes and machines tested to breaking point." },
    { id: "advanced-lab", name: "Advanced Robotics Lab", age: "14+", level: "Advanced", type: "Robotics", weeks: 14, duration: "14 weeks", day: "Friday", format: "Hybrid", price: 3499, size: 8, instructor: "Daniel Thomas", start: "Oct 16", blurb: "Python, autonomous navigation and competition robots." },
    { id: "python-for-robots", name: "Python for Robots", age: "14+", level: "Intermediate", type: "Coding", weeks: 10, duration: "10 weeks", day: "Tuesday", format: "Online", price: 2799, size: 14, instructor: "Daniel Thomas", start: "Oct 13", blurb: "Text-based coding for sensors, data and control loops." }
  ];
  window.RoboBricks.programs = PROGRAMS;
  const levelChip = { Beginner: "chip-mint", Intermediate: "chip-yellow", Advanced: "chip-orange" };
  const fmtINR = (n) => "₹" + n.toLocaleString("en-IN");

  const renderPrograms = (root) => {
    const results = $("[data-finder-results]", root);
    const count = $("[data-finder-count]", root);
    if (!results) return;
    const activeTab = $("[data-age][aria-selected='true']", root);
    const f = {
      age: activeTab ? activeTab.dataset.age : "all",
      level: $("[data-f='level']", root)?.value || "all",
      type: $("[data-f='type']", root)?.value || "all",
      duration: $("[data-f='duration']", root)?.value || "all",
      day: $("[data-f='day']", root)?.value || "all",
      format: $("[data-f='format']", root)?.value || "all"
    };
    const list = PROGRAMS.filter(p =>
      (f.age === "all" || p.age === f.age) &&
      (f.level === "all" || p.level === f.level) &&
      (f.type === "all" || p.type === f.type) &&
      (f.day === "all" || p.day === f.day) &&
      (f.format === "all" || p.format === f.format) &&
      (f.duration === "all" || (f.duration === "short" ? p.weeks <= 6 : f.duration === "mid" ? p.weeks > 6 && p.weeks <= 10 : p.weeks > 10))
    );
    const base = root.dataset.base || "";
    results.innerHTML = list.length ? list.map(p => `
      <article class="mini-prog">
        <div class="d-flex justify-content-between align-items-start gap-2">
          <span class="tech-label">Ages ${p.age.replace("-", "–")}</span>
          <span class="chip ${levelChip[p.level]}">${p.level}</span>
        </div>
        <h3>${p.name}</h3>
        <p class="small mb-0">${p.blurb}</p>
        <div class="meta">
          <span class="chip"><i class="bi bi-calendar3" aria-hidden="true"></i>${p.day}s</span>
          <span class="chip"><i class="bi bi-clock" aria-hidden="true"></i>${p.duration}</span>
          <span class="chip"><i class="bi bi-${p.format === "Online" ? "laptop" : p.format === "Hybrid" ? "shuffle" : "geo-alt"}" aria-hidden="true"></i>${p.format}</span>
        </div>
        <div class="foot">
          <span class="price">${fmtINR(p.price)}<small class="text-muted-rb fw-semibold u-fs-75">/mo</small></span>
          <a class="btn-link-rb" href="${base}program-details.html?p=${p.id}">View <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
        </div>
      </article>`).join("")
      : `<div class="finder-empty"><i class="bi bi-search fs-2 d-block mb-2" aria-hidden="true"></i><strong class="text-ink d-block">No programs match all of these filters.</strong><span class="small">Clear a filter or two to see more options.</span><div class="mt-3"><button type="button" class="btn-rb btn-ghost btn-sm" data-finder-reset>Clear filters</button></div></div>`;
    if (count) count.textContent = `${list.length} program${list.length === 1 ? "" : "s"} found`;
  };
  $$("[data-finder]").forEach(root => {
    const tabs = $$("[data-age]", root);
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => { t.setAttribute("aria-selected", "false"); t.tabIndex = -1; });
        tab.setAttribute("aria-selected", "true"); tab.tabIndex = 0;
        renderPrograms(root);
      });
      tab.addEventListener("keydown", (e) => {
        const rtl = document.documentElement.dir === "rtl";
        const fwd = rtl ? "ArrowLeft" : "ArrowRight"; const back = rtl ? "ArrowRight" : "ArrowLeft";
        let n = null;
        if (e.key === fwd) n = tabs[(i + 1) % tabs.length];
        if (e.key === back) n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); n.focus(); n.click(); }
      });
    });
    $$("[data-f]", root).forEach(s => s.addEventListener("change", () => renderPrograms(root)));
    root.addEventListener("click", (e) => {
      if (!e.target.closest("[data-finder-reset]")) return;
      $$("[data-f]", root).forEach(s => { s.value = "all"; });
      tabs.forEach((t, i) => { t.setAttribute("aria-selected", String(i === 0)); t.tabIndex = i === 0 ? 0 : -1; });
      renderPrograms(root);
    });
    renderPrograms(root);
  });

  /* ---------- Generic filter groups (showcase, gallery, blog, events) --- */
  $$("[data-filter-group]").forEach(group => {
    const target = $(group.dataset.filterGroup);
    if (!target) return;
    const btns = $$("[data-filter]", group);
    btns.forEach(btn => btn.addEventListener("click", () => {
      btns.forEach(b => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
      const f = btn.dataset.filter;
      let shown = 0;
      $$("[data-cat]", target).forEach(item => {
        const match = f === "all" || item.dataset.cat.split(" ").includes(f);
        item.classList.toggle("is-hidden", !match);
        if (match) { shown++; if (!reduceMotion) { item.style.animation = "none"; void item.offsetWidth; item.style.animation = "pop .35s var(--rb-ease) both"; } }
      });
      const live = group.dataset.filterLive ? $(group.dataset.filterLive) : null;
      if (live) live.textContent = `Showing ${shown} item${shown === 1 ? "" : "s"}`;
    }));
  });

  /* ---------- FAQ search ------------------------------------------------ */
  const faqInput = $("[data-faq-search]");
  if (faqInput) {
    const items = $$(".rb-accordion .accordion-item");
    const groups = $$("[data-faq-group]");
    const empty = $("[data-faq-empty]");
    const live = $("[data-faq-live]");
    items.forEach(it => {
      const q = $(".accordion-button", it); const a = $(".accordion-body", it);
      it.dataset.q = q.textContent; it.dataset.a = a.innerHTML;
    });
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const run = () => {
      const term = faqInput.value.trim().toLowerCase();
      let total = 0;
      items.forEach(it => {
        const q = $(".accordion-button", it); const a = $(".accordion-body", it);
        const text = (it.dataset.q + " " + a.textContent).toLowerCase();
        const match = !term || text.includes(term);
        it.classList.toggle("is-hidden", !match);
        q.textContent = it.dataset.q;
        a.innerHTML = it.dataset.a;
        if (match && term.length > 1) {
          const re = new RegExp(`(${esc(term)})`, "gi");
          q.innerHTML = q.textContent.replace(re, '<mark class="hl">$1</mark>');
        }
        if (match) total++;
      });
      groups.forEach(g => g.classList.toggle("is-hidden", !$$(".accordion-item:not(.is-hidden)", g).length));
      empty?.classList.toggle("is-hidden", total > 0);
      if (live) live.textContent = term ? `${total} matching question${total === 1 ? "" : "s"}` : "";
    };
    faqInput.addEventListener("input", run);
    $$("[data-faq-chip]").forEach(c => c.addEventListener("click", () => { faqInput.value = c.dataset.faqChip; run(); faqInput.focus(); }));
  }

  /* ---------- Forms ----------------------------------------------------- */
  $$("form[data-validate]").forEach(form => {
    form.setAttribute("novalidate", "");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // custom: matching passwords
      const pw = $("[data-pw]", form); const pw2 = $("[data-pw-confirm]", form);
      if (pw && pw2) pw2.setCustomValidity(pw.value === pw2.value ? "" : "Passwords don't match");
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        const first = $(":invalid", form);
        first?.focus();
        return;
      }
      const btn = $("[type='submit']", form);
      const label = btn?.innerHTML;
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Sending…'; }
      setTimeout(() => {
        if (btn) { btn.disabled = false; btn.innerHTML = label; }
        toast(form.dataset.success || "Saved. We'll be in touch shortly.");
        const redirect = form.dataset.redirect;
        if (redirect) { setTimeout(() => { window.location.href = redirect; }, 700); return; }
        form.reset(); form.classList.remove("was-validated");
        $$(".pw-meter span", form).forEach(s => { s.style.background = ""; });
      }, 900);
    });
  });
  $$(".pw-toggle").forEach(b => b.addEventListener("click", () => {
    const input = b.parentElement.querySelector("input");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    b.setAttribute("aria-label", show ? "Hide password" : "Show password");
    b.innerHTML = `<i class="bi bi-eye${show ? "-slash" : ""}" aria-hidden="true"></i>`;
  }));
  $$("[data-pw-strength]").forEach(input => {
    const bars = $$(".pw-meter span", input.closest("form"));
    const hint = $("[data-pw-hint]", input.closest("form"));
    const colors = ["#FACC15", "#0A0A0A", "#FFFFFF", "#FDE047"];
    const words = ["Too weak", "Getting there", "Good", "Strong"];
    input.addEventListener("input", () => {
      const v = input.value; let s = 0;
      if (v.length >= 8) s++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v) && v.length >= 10) s++;
      bars.forEach((b, i) => { b.style.background = i < s ? colors[Math.max(0, s - 1)] : ""; });
      if (hint) hint.textContent = v ? words[Math.max(0, s - 1)] : "Use 8+ characters with a number";
    });
  });
  $$("form[data-newsletter]").forEach(f => f.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = $("input", f);
    if (!input.value || !input.checkValidity()) { input.focus(); toast("Enter a valid email to subscribe", "bi-exclamation-circle-fill"); return; }
    toast("Subscribed. Look out for STEM ideas in your inbox."); f.reset();
  }));

  /* ---------- Lightbox -------------------------------------------------- */
  const lb = $("#lightbox");
  if (lb && window.bootstrap) {
    const modal = new bootstrap.Modal(lb);
    $$("[data-lightbox]").forEach(btn => btn.addEventListener("click", () => {
      const lbImg = $("img", lb);
      lbImg.dataset.fallback = btn.dataset.lightboxFallback || "";
      lbImg.src = btn.dataset.lightbox;
      $("img", lb).alt = btn.querySelector("img")?.alt || "";
      $("[data-lb-caption]", lb).textContent = btn.dataset.caption || "";
      modal.show();
    }));
  }

  /* ---------- Countdown ------------------------------------------------- */
  $$("[data-countdown]").forEach(el => {
    const target = new Date(el.dataset.countdown).getTime();
    const parts = { d: $("[data-d]", el), h: $("[data-h]", el), m: $("[data-m]", el), s: $("[data-s]", el) };
    const tick = () => {
      let diff = Math.max(0, target - Date.now());
      const d = Math.floor(diff / 864e5); diff -= d * 864e5;
      const h = Math.floor(diff / 36e5); diff -= h * 36e5;
      const m = Math.floor(diff / 6e4); diff -= m * 6e4;
      const s = Math.floor(diff / 1e3);
      if (parts.d) parts.d.textContent = String(d).padStart(2, "0");
      if (parts.h) parts.h.textContent = String(h).padStart(2, "0");
      if (parts.m) parts.m.textContent = String(m).padStart(2, "0");
      if (parts.s) parts.s.textContent = String(s).padStart(2, "0");
    };
    tick(); setInterval(tick, 1000);
  });

  /* ---------- Maker Lab robot (eyes follow pointer) --------------------- */
  const robot = $("[data-robot]");
  if (robot && !reduceMotion) {
    const pupils = $$(".eye-pupil", robot);
    window.addEventListener("pointermove", (e) => {
      const r = robot.getBoundingClientRect();
      const cx = r.left + r.width / 2; const cy = r.top + r.height * .32;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width))) * 9;
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height))) * 7;
      pupils.forEach(p => { p.style.transform = `translate(${dx}px, ${dy}px)`; });
    }, { passive: true });
    robot.addEventListener("click", () => {
      robot.animate([{ transform: "translateY(0)" }, { transform: "translateY(-18px)" }, { transform: "translateY(0)" }], { duration: 500, easing: "cubic-bezier(.2,.8,.2,1)" });
      const screen = $("[data-robot-screen]", robot);
      const lines = ["HELLO, CHILDREN!", "READY TO CODE?", "LET'S BUILD!", "SENSORS: ON"];
      if (screen) screen.textContent = lines[Math.floor(Math.random() * lines.length)];
    });
  }

  /* ---------- Age explorer (Home 2) ------------------------------------ */
  $$("[data-tabs]").forEach(root => {
    const tabs = $$("[role='tab']", root);
    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => { t.setAttribute("aria-selected", "false"); t.tabIndex = -1; const p = document.getElementById(t.getAttribute("aria-controls")); if (p) p.hidden = true; });
        tab.setAttribute("aria-selected", "true"); tab.tabIndex = 0;
        const panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (panel) { panel.hidden = false; watch(panel); }
      });
      tab.addEventListener("keydown", (e) => {
        const keysNext = ["ArrowDown", "ArrowRight"]; const keysPrev = ["ArrowUp", "ArrowLeft"];
        let n = null;
        if (keysNext.includes(e.key)) n = tabs[(i + 1) % tabs.length];
        if (keysPrev.includes(e.key)) n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (n) { e.preventDefault(); n.focus(); n.click(); }
      });
    });
  });

  /* ---------- Badge unlock --------------------------------------------- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".skill-badge");
    if (!b) return;
    if (b.classList.contains("is-locked")) {
      toast(b.dataset.lockHint || "Complete the linked project to unlock this badge", "bi-lock-fill");
      return;
    }
    b.classList.remove("is-unlocking"); void b.offsetWidth; b.classList.add("is-unlocking");
    if (b.dataset.toast !== "off") toast(`${b.querySelector("h3")?.textContent.trim()} badge earned`, "bi-award-fill");
  });

  /* ---------- Program details: session picker + query param ------------ */
  const pd = $("[data-program-detail]");
  if (pd) {
    const params = new URLSearchParams(location.search);
    const p = PROGRAMS.find(x => x.id === params.get("p"));
    if (p && p.id !== "junior-robotics") {
      $$("[data-pd='name']").forEach(n => { n.textContent = p.name; });
      $$("[data-pd='age']").forEach(n => { n.textContent = `Ages ${p.age.replace("-", "–")}`; });
      $$("[data-pd='price']").forEach(n => { n.textContent = fmtINR(p.price); });
      $$("[data-pd='instructor']").forEach(n => { n.textContent = p.instructor; });
      $$("[data-pd='level']").forEach(n => { n.textContent = p.level; });
      $$("[data-pd='duration']").forEach(n => { n.textContent = p.duration; });
      $$("[data-pd='size']").forEach(n => { n.textContent = `${p.size} kids`; });
      document.title = `${p.name} — RoboBricks Programs`;
    }
    $$("input[name='session']").forEach(r => r.addEventListener("change", () => {
      const lbl = $("[data-picked-session]");
      if (lbl) lbl.textContent = r.dataset.label;
    }));
  }
  $$("[data-enroll]").forEach(b => b.addEventListener("click", () => {
    const picked = $("input[name='session']:checked");
    toast(picked ? `Seat held for ${picked.dataset.label}. Finish in the parent portal.` : "Choose a session first", picked ? "bi-check-circle-fill" : "bi-exclamation-circle-fill");
  }));

  /* ---------- Blog TOC active state ------------------------------------ */
  const tocLinks = $$(".toc a[href^='#']").filter(a => a.getAttribute("href").length > 1);
  if (tocLinks.length && io) {
    const tio = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          tocLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === `#${en.target.id}`));
        }
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    tocLinks.forEach(a => { const t = $(a.getAttribute("href")); if (t) tio.observe(t); });
  }

  /* ---------- Misc ------------------------------------------------------ */
  $$("[data-year]").forEach(el => { el.textContent = new Date().getFullYear(); });
  $$("[data-copy]").forEach(b => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy); toast("Link copied"); } catch { toast("Copy unavailable in this browser", "bi-exclamation-circle-fill"); }
  }));
  $$("[data-toast]").forEach(b => { if (!b.classList.contains("skill-badge")) b.addEventListener("click", (e) => { if (b.tagName === "A") e.preventDefault(); toast(b.dataset.toast, b.dataset.toastIcon || "bi-check-circle-fill"); }); });
  // close offcanvas when navigating to an anchor
  $$(".rb-offcanvas a").forEach(a => a.addEventListener("click", () => {
    const oc = a.closest(".offcanvas"); if (oc && window.bootstrap) bootstrap.Offcanvas.getInstance(oc)?.hide();
  }));
})();
