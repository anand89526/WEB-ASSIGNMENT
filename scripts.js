// scripts.js
(() => {
  const API_BASE = "/api";

  // Small helpers
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Network error: ${res.status}`);
    return res.json();
  }

  /* ---------- NAVIGATION & INTERACTION ---------- */

  function setupNavigation() {
    const navLinks = $$(".nav-link");
    if (!navLinks.length) return;

    navLinks.forEach((btn) => {
      const target = btn.getAttribute("data-scroll");
      if (!target) return;

      btn.addEventListener("click", () => {
        const section = $(target);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        navLinks.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });
  }

  function setupHeroButtons(uni) {
    // Apply now scroll button
    const applyBtnId = uni === "amity" ? "scroll-apply-amity" : "scroll-apply-cu";
    const applyBtn = document.getElementById(applyBtnId);
    if (applyBtn) {
      applyBtn.addEventListener("click", () => {
        const applySection = document.getElementById("apply");
        if (applySection) {
          applySection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    }

    // Fake brochure download (just shows a toast for demo)
    const brochureId =
      uni === "amity" ? "download-brochure-amity" : "download-brochure-cu";
    const brochureBtn = document.getElementById(brochureId);
    if (brochureBtn) {
      brochureBtn.addEventListener("click", () => {
        alert("Demo only: brochure download is mocked for this assignment.");
      });
    }
  }

  function setupAccordion() {
    const items = $$("[data-acc]");
    items.forEach((btn) => {
      btn.addEventListener("click", () => {
        const panel = btn.nextElementSibling;
        if (!panel) return;
        const open = panel.classList.toggle("open");
        btn.querySelector(".acc-icon").textContent = open ? "−" : "+";
      });
    });
  }

  /* ---------- MODAL (FEES) ---------- */

  function setupModal() {
    const modal = $("#modal");
    const closeBtn = $("#close-modal");
    if (!modal || !closeBtn) return;

    closeBtn.addEventListener("click", () => {
      modal.classList.remove("show");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("show");
    });
  }

  async function openFeesModal(uni) {
    const modal = $("#modal");
    const modalContent = $("#modal-content");
    if (!modal || !modalContent) return;

    modalContent.textContent = "Loading fees…";
    modal.classList.add("show");

    try {
      const data = await fetchJSON(`${API_BASE}/fees?uni=${uni}`);
      const rows = (data.courses || [])
        .map(
          (c) =>
            `<tr><td>${c.name}</td><td>₹${c.feeRange.min.toLocaleString()} – ₹${c.feeRange.max.toLocaleString()}</td></tr>`
        )
        .join("");

      modalContent.innerHTML = `
        <p class="small">Fees shown below are sample ranges for demo purpose only.</p>
        <table class="fees-table">
          <thead><tr><th>Course</th><th>Annual fee (approx.)</th></tr></thead>
          <tbody>${rows || "<tr><td colspan='2'>No data.</td></tr>"}</tbody>
        </table>
      `;
    } catch (err) {
      console.error(err);
      modalContent.innerHTML = `<div class="error">Unable to load fees. Please try again later.</div>`;
    }
  }

  /* ---------- API DATA BINDING ---------- */

  async function loadUniversityData(uni) {
    // Overview
    const overviewEl = $("#overview-text");
    if (overviewEl) {
      try {
        const overview = await fetchJSON(`${API_BASE}/overview?uni=${uni}`);
        overviewEl.textContent = overview.description || "Overview not available.";
      } catch (err) {
        console.error(err);
        overviewEl.textContent = "Unable to load overview.";
      }
    }

    // Courses
    const coursesContainer = $("#courses-container");
    const coursesSelect = $('select[name="course"]');
    if (coursesContainer) {
      try {
        const courses = await fetchJSON(`${API_BASE}/courses?uni=${uni}`);
        if (!courses.length) {
          coursesContainer.innerHTML = "<p>No courses found.</p>";
        } else {
          coursesContainer.innerHTML = "";
          courses.forEach((c) => {
            const card = document.createElement("article");
            card.className = "course-card";
            card.innerHTML = `
              <h3>${c.name}</h3>
              <p class="small">Duration: ${c.duration}</p>
            `;
            coursesContainer.appendChild(card);
          });
        }

        if (coursesSelect) {
          coursesSelect.innerHTML =
            '<option value="">Course interested</option>' +
            courses
              .map(
                (c) =>
                  `<option value="${c.name.replace(/"/g, "&quot;")}">${c.name}</option>`
              )
              .join("");
        }
      } catch (err) {
        console.error(err);
        coursesContainer.innerHTML =
          '<div class="error">Unable to load courses at the moment.</div>';
      }
    }

    // Placements
    const placementsEl = $("#placements-content");
    if (placementsEl) {
      try {
        const data = await fetchJSON(`${API_BASE}/placements?uni=${uni}`);
        placementsEl.innerHTML = `
          <p><strong>Top recruiters:</strong> ${data.top_recruiters.join(", ")}</p>
          <p><strong>Average package:</strong> ${data.avg_package}</p>
          <p class="small">Highest package (demo): ${data.details.highest} (year ${data.details.year})</p>
        `;
      } catch (err) {
        console.error(err);
        placementsEl.innerHTML =
          '<div class="error">Unable to load placements.</div>';
      }
    }

    // Facilities
    const facilitiesChips = $("#facilities-chips");
    if (facilitiesChips) {
      try {
        const facilities = await fetchJSON(`${API_BASE}/facilities?uni=${uni}`);
        facilitiesChips.innerHTML = facilities
          .map((f) => `<span class="chip-pill">${f}</span>`)
          .join("");
      } catch (err) {
        console.error(err);
        facilitiesChips.innerHTML =
          '<div class="error">Unable to load facilities.</div>';
      }
    }
  }

  /* ---------- LEAD FORM / PIPEDREAM ---------- */

  function setupForm(uni) {
    const form = $("#lead-form");
    const msg = $("#form-msg");
    const clearBtn = $("#clear-form");

    if (!form || !msg) return;

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      msg.textContent = "";

      const fd = new FormData(form);
      const payload = {
        uni,
        fullName: (fd.get("fullName") || "").trim(),
        email: (fd.get("email") || "").trim(),
        phone: (fd.get("phone") || "").trim(),
        state: (fd.get("state") || "").trim(),
        course: (fd.get("course") || "").trim(),
        intake: (fd.get("intake") || "").trim(),
        consent: !!fd.get("consent"),
      };

      // Phone validation for India
      if (!/^[6-9]\d{9}$/.test(payload.phone)) {
        msg.innerHTML =
          '<div class="error">Enter a valid 10-digit Indian mobile number.</div>';
        return;
      }
      if (!payload.consent) {
        msg.innerHTML =
          '<div class="error">Please tick the consent checkbox to continue.</div>';
        return;
      }

      const endpoint = window.PIPEDREAM_ENDPOINT;
      if (!endpoint || endpoint.includes("YOUR-PIPEDREAM-URL")) {
        msg.innerHTML =
          '<div class="error">Pipedream endpoint not configured. (Demo mode only.)</div>';
        return;
      }

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Network error while sending lead");

        msg.innerHTML =
          '<div class="success">Thank you! Your enquiry has been submitted successfully.</div>';
        form.reset();
      } catch (err) {
        console.error(err);
        msg.innerHTML =
          '<div class="error">Could not submit the form. Please retry later.</div>';
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        form.reset();
        msg.textContent = "";
      });
    }
  }

  /* ---------- MAIN ENTRY ---------- */

  async function initPage(uni) {
    try {
      setupNavigation();
      setupAccordion();
      setupModal();
      setupHeroButtons(uni);

      await loadUniversityData(uni);
      setupForm(uni);

      // Attach fees button handlers
      $$("button[data-fees]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const targetUni = btn.getAttribute("data-fees") || uni;
          openFeesModal(targetUni.toLowerCase());
        });
      });
    } catch (err) {
      console.error("Error while initialising page", err);
    }
  }

  // Expose initPage globally so HTML can call it
  window.initPage = initPage;
})();
