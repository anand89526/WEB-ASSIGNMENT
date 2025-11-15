/*-------------------------------------------------------
  UNIVERSAL CONFIG
---------------------------------------------------------*/
const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

function api(path) {
  // Local → load from /api/*.js files
  if (isLocal) {
    return fetch(`./api/${path}.js`).then(res => res.json());
  }

  // Vercel → use serverless endpoint
  return fetch(`/api/${path}`).then(res => res.json());
}

/*-------------------------------------------------------
  UTILITY FUNCTIONS
---------------------------------------------------------*/
function $(selector) {
  return document.querySelector(selector);
}

function fadeIn(el) {
  el.style.opacity = 0;
  el.style.transition = "opacity 0.8s ease";
  setTimeout(() => (el.style.opacity = 1), 20);
}

/*-------------------------------------------------------
  LOAD PAGE DATA
---------------------------------------------------------*/
async function initPage(type) {
  animateSections();
  setupModal();
  setupFAQ();
  setupScrollTop();

  loadOverview(type);
  loadCourses(type);
  loadFees(type);
  loadPlacements(type);
  loadFacilities(type);
}

/*-------------------------------------------------------
  OVERVIEW
---------------------------------------------------------*/
async function loadOverview(type) {
  try {
    const data = await api("overview");
    $("#overview").innerHTML = data[type] || "No overview available.";
  } catch {
    $("#overview").innerHTML = "Error loading overview.";
  }
}

/*-------------------------------------------------------
  COURSES
---------------------------------------------------------*/
async function loadCourses(type) {
  try {
    const data = await api("courses");
    const container = $("#courses");

    container.innerHTML = data[type]
      .map(item => `<div class="course-card">${item}</div>`)
      .join("");

    fadeIn(container);
  } catch {
    $("#courses").innerHTML = "Error loading courses.";
  }
}

/*-------------------------------------------------------
  FEES MODAL
---------------------------------------------------------*/
async function loadFees(type) {
  try {
    const data = await api("fees");
    window.feesData = data[type];
  } catch {
    console.warn("Could not load fees");
  }
}

function openFeesModal() {
  const modal = $("#modal");
  const body = $("#modal-body");

  if (!window.feesData) {
    body.innerHTML = "<p>Error loading fees.</p>";
  } else {
    body.innerHTML = window.feesData
      .map(f => `<div class="fee-item"><strong>${f.course}:</strong> ₹${f.fee}/year</div>`)
      .join("");
  }

  modal.style.display = "flex";
}

function setupModal() {
  $("#modal").addEventListener("click", e => {
    if (e.target.id === "modal") e.target.style.display = "none";
  });
}

/*-------------------------------------------------------
  FACILITIES
---------------------------------------------------------*/
async function loadFacilities(type) {
  try {
    const data = await api("facilities");
    $("#facilities").innerHTML = data[type]
      .map(f => `<span class="facility-pill">${f}</span>`)
      .join("");
  } catch {
    $("#facilities").innerHTML = "Error loading facilities.";
  }
}

/*-------------------------------------------------------
  PLACEMENTS
---------------------------------------------------------*/
async function loadPlacements(type) {
  try {
    const data = await api("placements");
    $("#placements").innerHTML = `
      <div class="stat">Highest Package: <strong>₹${data[type].highest} LPA</strong></div>
      <div class="stat">Avg Package: <strong>₹${data[type].average} LPA</strong></div>
    `;
  } catch {
    $("#placements").innerHTML = "Error loading placement data.";
  }
}

/*-------------------------------------------------------
  FAQ Accordion
---------------------------------------------------------*/
function setupFAQ() {
  document.querySelectorAll(".faq-item").forEach(item => {
    item.addEventListener("click", () => {
      item.classList.toggle("open");
    });
  });
}

/*-------------------------------------------------------
  Scroll to Top Button
---------------------------------------------------------*/
function setupScrollTop() {
  const btn = $("#scrollTop");

  window.addEventListener("scroll", () => {
    btn.style.opacity = window.scrollY > 300 ? 1 : 0;
  });

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

/*-------------------------------------------------------
  Animations on Scroll
---------------------------------------------------------*/
function animateSections() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".section").forEach(sec => observer.observe(sec));
}

/*-------------------------------------------------------
  FORM SUBMISSION (PIPEDREAM)
---------------------------------------------------------*/
async function submitLead(e, type) {
  e.preventDefault();
  const btn = $("#submitBtn");
  btn.innerHTML = "Submitting...";

  const payload = {
    university: type,
    name: $("#fullName").value,
    email: $("#email").value,
    phone: $("#phone").value,
    program: $("#program").value
  };

  try {
    const res = await fetch(window.PIPEDREAM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      btn.innerHTML = "Submitted ✓";
      alert("Lead submitted successfully!");
    } else {
      throw new Error();
    }
  } catch {
    alert("Failed to submit. Try again.");
  }

  setTimeout(() => (btn.innerHTML = "Submit"), 1500);
}
