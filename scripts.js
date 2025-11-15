// scripts.js – shared behaviour for both landing pages
(() => {
  const API_BASE = "/api";

  function $(selector, root = document) {
    return root.querySelector(selector);
  }
  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  async function fetchJSON(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Network error ${res.status}`);
    return res.json();
  }

  // ---------- CONTENT LOADERS ----------

  async function loadOverview(uni) {
    const target = $("#overview-text");
    if (!target) return;
    target.textContent = "Loading overview…";

    try {
      const data = await fetchJSON(`${API_BASE}/overview?uni=${uni}`);
      target.textContent = data.description || "Overview not available.";
    } catch (err) {
      console.error(err);
      target.textContent = "Unable to load overview right now.";
    }
  }

  async function loadCourses(uni) {
    const container = $("#courses-grid");
    const select = $("#course-select");
    if (!container) return;

    container.innerHTML = "<p>Loading courses…</p>";
    if (select) {
      select.innerHTML = '<option value="">Loading courses…</option>';
    }

    try {
      const data = await fetchJSON(`${API_BASE}/courses?uni=${uni}`);

      if (!Array.isArray(data) || data.length === 0) {
        container.innerHTML = "<p>No courses found (demo).</p>";
        if (select) {
          select.innerHTML = '<option value="">No courses available</option>';
        }
        return;
      }

      // Render cards
      container.innerHTML = "";
      data.forEach((c) => {
        const card = document.createElement("article");
        card.className = "course-card";
        card.innerHTML = `
          <h3>${c.name}</h3>
          <p class="course-duration">${c.duration || ""}</p>
          <p class="course-tag">Demo listing from JSON API</p>
        `;
        container.appendChild(card);
      });

      // Fill select
      if (select) {
        select.innerHTML =
          '<option value="">Select course</option>' +
          data
            .map((c) => `<option value="${c.name}">${c.name}</option>`)
            .join("");
      }
    } catch (err) {
      console.error(err);
      container.innerHTML =
        '<p class="error-text">Could not load courses. Please refresh.</p>';
      if (select) {
        select.innerHTML =
          '<option value="">Failed to load courses</option>';
      }
    }
  }

  async function loadPlacements(uni) {
    const box = $("#placements-content");
    if (!box) return;
    box.textContent = "Loading placements…";

    try {
      const data = await fetchJSON(`${API_BASE}/placements?uni=${uni}`);
      const recruiters = (data.top_recruiters || []).join(", ");
      box.innerHTML = `
        <p><strong>Top recruiters:</strong> ${recruiters || "N/A"}</p>
        <p><strong>Average package:</strong> ${data.avg_package || "N/A"}</p>
        ${
          data.details
            ? `<p class="micro-copy">Highest package (demo): ${data.details.highest} (Batch ${data.details.year})</p>`
            : ""
        }
      `;
    } catch (err) {
      console.error(err);
      box.textContent = "Unable to load placements right now.";
    }
  }

  async function loadFacilities(uni) {
    const chips = $("#facilities-chips");
    if (!chips) return;

    chips.innerHTML = "";
    try {
      const data = await fetchJSON(`${API_BASE}/facilities?uni=${uni}`);
      if (!Array.isArray(data) || data.length === 0) {
        chips.innerHTML = "<span class='chip'>Facilities data not available</span>";
        return;
      }
      chips.innerHTML = data.map((f) => `<span class="chip">${f}</span>`).join("");
    } catch (err) {
      console.error(err);
      chips.innerHTML =
        "<span class='chip'>Error while loading facilities</span>";
    }
  }

  async function openFeesModal(uni) {
    const modal = $("#modal");
    const content = $("#modal-content");
    if (!modal || !content) return;

    content.innerHTML = "Loading fees…";
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    try {
      const data = await fetchJSON(`${API_BASE}/fees?uni=${uni}`);
      const courses = (data.courses || []).map(
        (c) => `
        <tr>
          <td>${c.name}</td>
          <td>₹${c.feeRange.min.toLocaleString()} – ₹${c.feeRange.max.toLocaleString()}</td>
        </tr>`
      );

      content.innerHTML = `
        <p class="section-subtitle">Demo fee ranges (not real university data).</p>
        <table class="fees-table">
          <thead><tr><th>Course</th><th>Fee range / year</th></tr></thead>
          <tbody>
            ${courses.join("")}
          </tbody>
        </table>
      `;
    } catch (err) {
      console.error(err);
      content.innerHTML =
        '<p class="error-text">Unable to load fee details at the moment.</p>';
    }
  }

  // ---------- FORM & INTERACTION ----------

  function setupLeadForm(uni) {
    const form = $("#lead-form");
    const msg = $("#form-msg");
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

      // simple validations
      if (!/^[6-9]\d{9}$/.test(payload.phone)) {
        msg.innerHTML =
          '<div class="msg error">Enter a valid 10-digit Indian phone number.</div>';
        return;
      }
      if (!payload.consent) {
        msg.innerHTML =
          '<div class="msg error">Please tick the consent checkbox to continue.</div>';
        return;
      }

      const endpoint = window.PIPEDREAM_ENDPOINT;
      if (!endpoint || !endpoint.startsWith("https://")) {
        msg.innerHTML =
          '<div class="msg error">Pipedream endpoint not configured.</div>';
        return;
      }

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Bad status " + res.status);
        msg.innerHTML =
          '<div class="msg success">Thank you! Your enquiry has been submitted.</div>';
        form.reset();
      } catch (err) {
        console.error(err);
        msg.innerHTML =
          '<div class="msg error">Submission failed. Please try again later.</div>';
      }
    });

    const clearBtn = $("#clear-form");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        form.reset();
        msg.textContent = "";
      });
    }
  }

  function setupNavScroll() {
    $all("[data-scroll]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = document.querySelector(btn.dataset.scroll);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function setupFeesButtons(uni) {
    $all("[data-fees]").forEach((btn) => {
      btn.addEventListener("click", () => openFeesModal(uni));
    });

    const modal = $("#modal");
    const close = $("#close-modal");
    if (modal && close) {
      close.addEventListener("click", () => {
        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");
      });

      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("show");
          modal.setAttribute("aria-hidden", "true");
        }
      });
    }
  }

  function setupFAQ() {
    $all(".faq-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const content = btn.nextElementSibling;
        if (!content) return;
        const open = content.classList.toggle("open");
        btn.querySelector("span:last-child").textContent = open ? "−" : "＋";
      });
    });
  }

  // ---------- PUBLIC ENTRY POINT ----------

  window.initPage = function initPage(uni) {
    // content
    loadOverview(uni);
    loadCourses(uni);
    loadPlacements(uni);
    loadFacilities(uni);

    // interactions
    setupLeadForm(uni);
    setupNavScroll();
    setupFeesButtons(uni);
    setupFAQ();
  };
})();
