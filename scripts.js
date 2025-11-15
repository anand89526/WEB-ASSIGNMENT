// scripts.js — shared for both pages
const API_BASE = '/api'; // On Vercel this will route to serverless functions

function el(q){return document.querySelector(q)}
function els(q){return Array.from(document.querySelectorAll(q))}

async function fetchJSON(path){
  const r = await fetch(path);
  if(!r.ok) throw new Error('Network error');
  return r.json();
}

function showModal(html){
  const modal = el('#modal');
  el('#modal-content').innerHTML = html;
  modal.classList.add('show');
}
function closeModal(){ el('#modal').classList.remove('show') }

document.addEventListener('click', (e)=>{
  if(e.target && e.target.id === 'close-modal') closeModal();
  if(e.target && e.target.classList.contains('btn') && e.target.dataset.fees){
    const uni = e.target.dataset.fees;
    loadFeesModal(uni);
  }
})

// populate page (uni = 'amity' or 'cu')
async function initPage(uni){
  try{
    // Overview
    const ov = await fetchJSON(`${API_BASE}/overview?uni=${uni}`);
    el('#overview-text').textContent = ov.description;

    // Courses
    const courses = await fetchJSON(`${API_BASE}/courses?uni=${uni}`);
    const list = el('#courses-list'); list.innerHTML = '';
    const sel = el('select[name="course"]');
    sel.innerHTML = '<option value="">Course interested</option>';
    courses.forEach(c=>{
      const li = document.createElement('li'); li.textContent = `${c.name} — ${c.duration}`;
      list.appendChild(li);
      const opt = document.createElement('option'); opt.value = c.name; opt.textContent = c.name;
      sel.appendChild(opt);
    });

    // Placements
    const placements = await fetchJSON(`${API_BASE}/placements?uni=${uni}`);
    el('#placements').innerHTML = `<p>Top recruiters: ${placements.top_recruiters.join(', ')}</p><p>Average package: ${placements.avg_package}</p>`;

    // Facilities
    const fac = await fetchJSON(`${API_BASE}/facilities?uni=${uni}`);
    el('#facilities').innerHTML = '<ul>' + fac.map(f=>`<li>${f}</li>`).join('') + '</ul>';

    // form handling
    setupForm(uni);
  }catch(err){
    console.error(err);
    document.body.insertAdjacentHTML('beforeend', `<div class="error section">Unable to load data — ${err.message}</div>`);
  }
}

async function loadFeesModal(uni){
  try{
    const feesJson = await fetchJSON(`${API_BASE}/fees?uni=${uni}`);
    // feesJson is {courses: [{name, feeRange:{min,max}, details:{...}}]}
    let html = '<table class="fees-table"><thead><tr><th>Course</th><th>Fee Range (INR)</th></tr></thead><tbody>';
    feesJson.courses.forEach(c=>{
      html += `<tr><td>${c.name}</td><td>₹${c.feeRange.min.toLocaleString()} - ₹${c.feeRange.max.toLocaleString()}</td></tr>`;
    });
    html += '</tbody></table>';
    showModal(html);
  }catch(e){ showModal(`<div class="error">Failed to load fees: ${e.message}</div>`); }
}

function setupForm(uni){
  const form = el('#lead-form');
  const msg = el('#form-msg');
  form.addEventListener('submit', async (ev)=>{
    ev.preventDefault();
    msg.textContent = '';

    const fd = new FormData(form);
    const payload = {
      uni,
      fullName: (fd.get('fullName') || '').trim(),
      email: (fd.get('email') || '').trim(),
      phone: (fd.get('phone') || '').trim(),
      state: (fd.get('state') || '').trim(),
      course: (fd.get('course') || '').trim(),
      intake: (fd.get('intake') || '').trim(),
      consent: !!fd.get('consent')
    };

    // Validation: phone 10 digits India, required consent
    if(!/^[6-9]\d{9}$/.test(payload.phone)){
      msg.innerHTML = `<div class="error">Enter a valid 10-digit Indian phone number.</div>`;
      return;
    }
    if(!payload.consent){
      msg.innerHTML = `<div class="error">Consent is required to submit.</div>`;
      return;
    }

    // POST to PIPEDREAM endpoint — Replace PIPEDREAM_URL below with your workflow URL
    const PIPEDREAM_URL = window.PIPEDREAM_ENDPOINT || 'https://example.com/replace-with-your-pipedream'; 

    try{
      const r = await fetch(PIPEDREAM_URL, {
        method:'POST',
        headers:{'content-type':'application/json'},
        body: JSON.stringify(payload)
      });
      if(!r.ok) throw new Error('Failed to send lead');
      const result = await r.json().catch(()=>({ok:true}));
      msg.innerHTML = `<div class="success">Thanks! Your enquiry was submitted successfully.</div>`;
      form.reset();
    }catch(err){
      console.error(err);
      msg.innerHTML = `<div class="error">Submission failed — please try again later.</div>`;
    }
  });

  // clear
  const clearBtn = el('#clear-form');
  if(clearBtn) clearBtn.addEventListener('click', ()=>{ form.reset(); el('#form-msg').textContent = ''; });
}
