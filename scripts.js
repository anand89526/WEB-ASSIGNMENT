// -----------------------------
// GLOBAL CONFIG
// -----------------------------
const API_BASE = window.location.origin + "/api";

function api(url) {
  return fetch(API_BASE + url).then((res) => res.json());
}

// -----------------------------
// INIT PAGE
// -----------------------------
function initPage(university) {
  setupNavScrolling();
  loadOverview(university);
  loadCourses(university);
  loadPlacements(university);
  loadFacilities(university);
  setupForm(university);
  setupFAQ();
}

// -----------------------------
// SCROLL TO SECTIONS
// -----------------------------
function setupNavScrolling() {
  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const sectionId = btn.getAttribute("data-section");
      document.getElementById(sectionId).scrollIntoView({ behavior: "smooth" });
    });
  });
}

// -----------------------------
// OVERVIEW
// -----------------------------
function loadOverview(uni) {
  const box = document.getElementById("overview-box");
  box.innerHTML = "Loading overview...";

  api(`/overview?uni=${uni}`)
    .then((data) => {
      box.innerHTML = `
        <p>${data.description}</p>
      `;
    })
    .catch(() => {
      box.innerHTML = `<p style="color:#f87171;">Failed to load overview</p>`;
    });
}

// -----------------------------
// COURSES
// -----------------------------
function loadCourses(uni) {
  const box = document.getElementById("course-box");
  const dropdown = document.getElementById("course-dropdown");

  box.innerHTML = "Loading courses...";
  dropdown.innerHTML = `<option>Loading...</option>`;

  api(`/courses?uni=${uni}`)
    .then((courses) => {
      box.innerHTML = courses
        .map(
          (c) => `
          <div class="course-card">
            <h4>${c.name}</h4>
            <p>${c.duration}</p>
          </div>
        `
        )
        .join("");

      dropdown.innerHTML = `
        <option value="">Select course</option>
        ${courses
          .map((c) => `<option value="${c.name}">${c.name}</option>`)
          .join("")}
      `;
    })
    .catch(() => {
      box.innerHTML = `<p style="color:#f87171;">Failed to load courses</p>`;
      dropdown.innerHTML = `<option>Failed to load courses</option>`;
    });
}

// -----------------------------
// PLACEMENTS
// -----------------------------
function loadPlacements(uni) {
  const box = document.getElementById("placement-box");
  box.innerHTML = "Loading placements...";

  api(`/placements?uni=${uni}`)
    .then((data) => {
      box.innerHTML = `
        <p><strong>Top Recruiters:</strong> ${data.top_recruiters.join(", ")}</p>
        <p><strong>Average Package:</strong> ${data.avg_package}</p>
        <p><strong>Highest Package:</strong> ${data.details.highest}</p>
      `;
    })
    .catch(() => {
      box.innerHTML = `<p style="color:#f87171;">Failed to load placement details</p>`;
    });
}

// -----------------------------
// FACILITIES
// -----------------------------
function loadFacilities(uni) {
  const box = document.getElementById("facility-box");
  box.innerHTML = "";

  api(`/facilities?uni=${uni}`)
    .then((items) => {
      box.innerHTML = items
        .map((f) => `<span class="chip">${f}</span>`)
        .join("");
    })
    .catch(() => {
      box.innerHTML = `<span style="color:#f87171;">Failed to load facilities</span>`;
    });
}

// -----------------------------
// FORM SUBMISSION
// -----------------------------
function setupForm(uni) {
  const form = document.getElementById("enquiry-form");
  const msg = document.getElementById("form-msg");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    msg.innerHTML = "Submitting…";

    api("/submit") // Dummy API
      .then(() => {
        msg.style.color = "#4ade80";
        msg.innerHTML = "Submitted successfully!";
        form.reset();
      })
      .catch(() => {
        msg.style.color = "#f87171";
        msg.innerHTML = "Failed to submit.";
      });
  });
}

// -----------------------------
// FAQ
// -----------------------------
function setupFAQ() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("click", () => {
      const box = item.nextElementSibling;
      box.classList.toggle("open");
    });
  });
}
