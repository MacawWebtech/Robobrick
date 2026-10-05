/* ==========================================================================
   RoboBricks — dashboard.js
   Sidebar, notifications, calendar, messages, project tracker tabs.
   Loaded after main.js (uses window.RoboBricks.toast / watch).
   ========================================================================== */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const toast = (...a) => window.RoboBricks?.toast(...a);

  /* ---------- Sidebar (offcanvas below 992px) --------------------------- */
  const side = $(".dash-side");
  const backdrop = $(".dash-backdrop");
  const openSide = (open) => {
    side?.classList.toggle("is-open", open);
    backdrop?.classList.toggle("is-open", open);
    $$(".side-toggle").forEach(b => b.setAttribute("aria-expanded", String(open)));
    document.body.style.overflow = open ? "hidden" : "";
    if (open) side?.querySelector("a")?.focus();
  };
  $$(".side-toggle").forEach(b => b.addEventListener("click", () => openSide(true)));
  $$(".side-close").forEach(b => b.addEventListener("click", () => openSide(false)));
  backdrop?.addEventListener("click", () => openSide(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && side?.classList.contains("is-open")) openSide(false); });

  /* ---------- Notifications -------------------------------------------- */
  $$("[data-mark-read]").forEach(b => b.addEventListener("click", () => {
    $$(".notif-item.unread, .notif-row.unread").forEach(n => n.classList.remove("unread"));
    $$(".notif-btn .dot").forEach(d => d.remove());
    $$("[data-unread-count]").forEach(c => { c.textContent = "0"; });
    toast("All notifications marked as read");
  }));
  $$("[data-notif-filter] button").forEach(btn => btn.addEventListener("click", () => {
    const wrap = btn.closest("[data-notif-filter]");
    $$("button", wrap).forEach(b => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    const f = btn.dataset.f;
    $$(".notif-row").forEach(r => r.classList.toggle("is-hidden", !(f === "all" || (f === "unread" ? r.classList.contains("unread") : r.dataset.type === f))));
  }));

  /* ---------- Calendar -------------------------------------------------- */
  const cal = $("[data-calendar]");
  if (cal) {
    const SESSIONS = {
      "2026-10-03": [{ t: "Junior Robotics", c: "#FACC15", time: "10:00 – 11:30 AM", kid: "Aarav", room: "Robotics Lab 02", who: "Maya Sharma", st: "Attended" }],
      "2026-10-04": [{ t: "LEGO Builders", c: "#FACC15", time: "11:00 AM – 12:00 PM", kid: "Diya", room: "Build Studio 01", who: "Anika Rao", st: "Attended" }],
      "2026-10-10": [{ t: "Junior Robotics", c: "#FACC15", time: "10:00 – 11:30 AM", kid: "Aarav", room: "Robotics Lab 02", who: "Maya Sharma", st: "Confirmed" }, { t: "LEGO Builders", c: "#FACC15", time: "12:00 – 1:00 PM", kid: "Diya", room: "Build Studio 01", who: "Anika Rao", st: "Confirmed" }],
      "2026-10-17": [{ t: "Junior Robotics", c: "#FACC15", time: "10:00 – 11:30 AM", kid: "Aarav", room: "Robotics Lab 02", who: "Maya Sharma", st: "Confirmed" }],
      "2026-10-18": [{ t: "LEGO Builders", c: "#FACC15", time: "11:00 AM – 12:00 PM", kid: "Diya", room: "Build Studio 01", who: "Anika Rao", st: "Pending" }],
      "2026-10-24": [{ t: "Parent Demo Day", c: "#FACC15", time: "4:00 – 6:00 PM", kid: "Family", room: "Main Hall", who: "All mentors", st: "RSVP open" }],
      "2026-10-31": [{ t: "Junior Robotics", c: "#FACC15", time: "10:00 – 11:30 AM", kid: "Aarav", room: "Robotics Lab 02", who: "Maya Sharma", st: "Confirmed" }]
    };
    const title = $("[data-cal-title]", cal);
    const grid = $("[data-cal-grid]", cal);
    const detail = $("[data-cal-detail]");
    const today = new Date(2026, 9, 1); // demo "today"
    let view = new Date(today.getFullYear(), today.getMonth(), 1);
    let selected = null;
    const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const showDetail = (d) => {
      if (!detail) return;
      const items = SESSIONS[key(d)] || [];
      const label = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
      const stClass = (s) => s === "Confirmed" || s === "Attended" ? "st-ok" : s === "Pending" ? "st-wait" : "st-info";
      detail.innerHTML = `<h3 class="h5 mb-3">${label}</h3>` + (items.length ? items.map(s => `
        <div class="soft-card p-3 mb-2 ev-accent">
          <div class="d-flex justify-content-between gap-2 align-items-start"><strong class="text-ink">${s.t}</strong><span class="status ${stClass(s.st)}">${s.st}</span></div>
          <div class="small mt-1"><i class="bi bi-clock me-1" aria-hidden="true"></i>${s.time}</div>
          <div class="small"><i class="bi bi-person me-1" aria-hidden="true"></i>${s.kid} · ${s.who}</div>
          <div class="small"><i class="bi bi-door-open me-1" aria-hidden="true"></i>${s.room}</div>
          <button type="button" class="btn-rb btn-ghost btn-sm mt-2" data-bs-toggle="modal" data-bs-target="#rescheduleModal">Request change</button>
        </div>`).join("") : `<div class="empty-state"><i class="bi bi-calendar-x fs-3 d-block mb-1" aria-hidden="true"></i><span class="small">No sessions this day.</span></div>`);
    };
    const render = () => {
      title.textContent = view.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const start = new Date(view); start.setDate(1 - ((view.getDay() + 6) % 7)); // Monday-first
      grid.innerHTML = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => `<div class="dow" aria-hidden="true">${d}</div>`).join("");
      for (let i = 0; i < 42; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const items = SESSIONS[key(d)] || [];
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cal-day" + (d.getMonth() !== view.getMonth() ? " muted" : "") + (key(d) === key(today) ? " today" : "") + (selected && key(d) === key(selected) ? " is-selected" : "");
        btn.setAttribute("aria-label", `${d.toDateString()}${items.length ? `, ${items.length} session${items.length > 1 ? "s" : ""}` : ""}`);
        btn.innerHTML = `<span>${d.getDate()}</span>${items.length ? `<span class="ev-label">${items[0].t}</span><span class="evs">${items.map(s => `<i class="ev-dot"></i>`).join("")}</span>` : ""}`;
        btn.addEventListener("click", () => { selected = d; render(); showDetail(d); });
        grid.appendChild(btn);
      }
    };
    $("[data-cal-prev]", cal)?.addEventListener("click", () => { view.setMonth(view.getMonth() - 1); render(); });
    $("[data-cal-next]", cal)?.addEventListener("click", () => { view.setMonth(view.getMonth() + 1); render(); });
    $("[data-cal-today]", cal)?.addEventListener("click", () => { view = new Date(today.getFullYear(), today.getMonth(), 1); selected = new Date(2026, 9, 10); render(); showDetail(selected); });
    selected = new Date(2026, 9, 10);
    render(); showDetail(selected);
    $$("[data-view-switch] button").forEach(b => b.addEventListener("click", () => {
      $$("[data-view-switch] button").forEach(x => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      $$("[data-view]").forEach(v => v.classList.toggle("is-hidden", v.dataset.view !== b.dataset.v));
    }));
  }

  /* ---------- Messages -------------------------------------------------- */
  const msg = $("[data-messages]");
  if (msg) {
    const body = $(".chat-body", msg);
    const input = $(".chat-input input", msg);
    const name = $("[data-chat-name]", msg);
    const role = $("[data-chat-role]", msg);
    const ava = $("[data-chat-ava]", msg);
    $$(".thread", msg).forEach(t => t.addEventListener("click", () => {
      $$(".thread", msg).forEach(x => x.setAttribute("aria-selected", "false"));
      t.setAttribute("aria-selected", "true");
      t.querySelector(".unread-dot")?.remove();
      if (name) name.textContent = t.dataset.name;
      if (role) role.textContent = t.dataset.role;
      if (ava) ava.src = t.querySelector("img").src;
      msg.classList.add("show-chat");
      body.scrollTop = body.scrollHeight;
    }));
    $(".chat-back", msg)?.addEventListener("click", () => msg.classList.remove("show-chat"));
    const send = () => {
      const v = input.value.trim(); if (!v) return;
      const b = document.createElement("div"); b.className = "bubble me";
      b.textContent = v;
      const tm = document.createElement("time"); tm.textContent = "Just now"; b.appendChild(tm);
      body.appendChild(b); input.value = ""; body.scrollTop = body.scrollHeight;
      setTimeout(() => {
        const r = document.createElement("div"); r.className = "bubble";
        r.textContent = "Thanks! I'll check and get back to you before Saturday's session.";
        const t2 = document.createElement("time"); t2.textContent = "Just now"; r.appendChild(t2);
        body.appendChild(r); body.scrollTop = body.scrollHeight;
      }, 1200);
    };
    $(".chat-input", msg).addEventListener("submit", (e) => { e.preventDefault(); send(); });
    body.scrollTop = body.scrollHeight;
  }

  /* ---------- Project tracker tabs ------------------------------------- */
  $$("[data-project-tabs]").forEach(wrap => {
    const tabs = $$(".project-tab", wrap);
    tabs.forEach(t => t.addEventListener("click", () => {
      tabs.forEach(x => x.setAttribute("aria-selected", "false"));
      t.setAttribute("aria-selected", "true");
      $$("[data-project-panel]").forEach(p => { p.hidden = p.dataset.projectPanel !== t.dataset.target; });
    }));
  });

  /* ---------- Segmented controls --------------------------------------- */
  $$(".seg[data-seg]").forEach(seg => {
    $$("button", seg).forEach(b => b.addEventListener("click", () => {
      $$("button", seg).forEach(x => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      const target = seg.dataset.seg;
      if (target) $$(`[data-seg-panel="${target}"]`).forEach(p => p.classList.toggle("is-hidden", p.dataset.value !== b.dataset.value));
    }));
  });

  /* ---------- Table search --------------------------------------------- */
  $$("[data-table-search]").forEach(inp => {
    const table = $(inp.dataset.tableSearch);
    inp.addEventListener("input", () => {
      const v = inp.value.toLowerCase();
      $$("tbody tr", table).forEach(r => r.classList.toggle("is-hidden", !r.textContent.toLowerCase().includes(v)));
    });
  });
})();
