/**
 * EventCraft AI – Celebration & Event Planner
 * PromptWars Virtual Challenge 5
 * Clean, accessible, self-contained planner focused on
 * Weddings • Birthdays • Community Events
 */

// ========== STATE ==========
let currentPlan = null;
let budgetChart = null;

const BUDGET_CATEGORIES = [
  { key: 'venue', label: 'Venue & Setup', color: '#14b8a6', defaultPct: 35 },
  { key: 'catering', label: 'Catering & Food', color: '#3b82f6', defaultPct: 28 },
  { key: 'decor', label: 'Decor & Florals', color: '#a855f7', defaultPct: 15 },
  { key: 'photo', label: 'Photography / Video', color: '#f59e0b', defaultPct: 10 },
  { key: 'entertainment', label: 'Entertainment / Music', color: '#ec4899', defaultPct: 7 },
  { key: 'misc', label: 'Misc & Contingency', color: '#64748b', defaultPct: 5 }
];

// ========== TAB SWITCHING ==========
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    switchTab(tab);
  });
});

function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.remove('active', 'text-teal-400', 'bg-teal-500/10', 'border', 'border-teal-500/20');
    b.classList.add('text-slate-400');
    b.setAttribute('aria-selected', 'false');
  });

  const panel = document.getElementById('panel-' + tabId);
  if (panel) {
    panel.classList.add('active', 'fade-in');
  }

  const btn = document.querySelector(`[data-tab="${tabId}"]`);
  if (btn) {
    btn.classList.add('active', 'text-teal-400', 'bg-teal-500/10', 'border', 'border-teal-500/20');
    btn.classList.remove('text-slate-400');
    btn.setAttribute('aria-selected', 'true');
  }

  if (tabId === 'budget' && currentPlan) renderBudget();
  if (tabId === 'saved') renderSavedPlans();
}

// ========== PLAN GENERATION (Intelligent Mock – easy to replace with Gemini) ==========
function generatePlan(e) {
  e.preventDefault();

  const type = document.getElementById('eventType').value;
  const name = document.getElementById('eventName').value.trim() || `${type} Celebration`;
  const date = document.getElementById('eventDate').value || getFutureDate(90);
  const guests = parseInt(document.getElementById('guestCount').value) || 100;
  const budget = parseInt(document.getElementById('budget').value) || 300000;
  const location = document.getElementById('location').value.trim() || 'Your City';
  const theme = document.getElementById('theme').value.trim() || 'Elegant modern';
  const notes = document.getElementById('notes').value.trim();

  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating…';

  // Simulate thinking time (replace this whole block with real Gemini call)
  setTimeout(() => {
    currentPlan = buildPlan({ type, name, date, guests, budget, location, theme, notes });
    renderPlanSummary();
    renderTimeline();
    renderVendors();
    renderIdeas();
    renderBudget();

    document.getElementById('planStatus').innerHTML = '<span class="text-teal-400">✓ Plan ready</span>';
    document.getElementById('saveBtn').disabled = false;
    document.getElementById('saveBtn').classList.remove('bg-slate-800', 'text-slate-400', 'cursor-not-allowed');
    document.getElementById('saveBtn').classList.add('bg-teal-600', 'hover:bg-teal-500', 'text-white', 'cursor-pointer');

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-sparkles"></i> <span>Generate Complete Plan</span>';
  }, 900);
}

function getFutureDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function buildPlan(input) {
  const { type, name, date, guests, budget, location, theme, notes } = input;

  // Timeline milestones (days before event)
  const milestones = getMilestones(type, date);

  // Budget allocation
  const allocation = BUDGET_CATEGORIES.map(c => ({
    ...c,
    amount: Math.round(budget * (c.defaultPct / 100))
  }));

  // Vendors
  const vendors = getVendors(type, location, guests);

  // Ideas
  const ideas = getIdeas(type, theme, location, notes);

  return {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    input,
    milestones,
    allocation,
    vendors,
    ideas,
    summary: generateSummaryText(input, milestones, allocation)
  };
}

function getMilestones(type, eventDate) {
  const base = [
    { days: 120, title: 'Finalize date & book venue', desc: 'Confirm availability and pay token/advance.' },
    { days: 90, title: 'Lock core vendors', desc: 'Caterer, photographer, decorator, entertainment.' },
    { days: 60, title: 'Send invitations / save-the-dates', desc: 'Digital + physical as needed. Collect RSVPs.' },
    { days: 45, title: 'Finalize menu & dietary requirements', desc: 'Share final headcount and special meals.' },
    { days: 30, title: 'Confirm logistics & timeline run-sheet', desc: 'Seating, parking, power, rain plan if outdoor.' },
    { days: 14, title: 'Final vendor briefings & payments', desc: 'Share detailed schedule and remaining balances.' },
    { days: 7, title: 'Guest list freeze & seating chart', desc: 'Print place cards / digital check-in ready.' },
    { days: 2, title: 'Final walkthrough & decoration setup start', desc: 'Coordinate with venue and decor team.' },
    { days: 0, title: 'Event Day – Execute the plan!', desc: 'Enjoy the celebration. Have a day-of coordinator if possible.' }
  ];

  if (type === 'Wedding') {
    base.splice(2, 0, { days: 75, title: 'Mehendi / Sangeet / Haldi planning', desc: 'Book mehendi artist, music, and family events.' });
  }
  if (type === 'Community') {
    base.splice(1, 0, { days: 100, title: 'Permits & local authority approvals', desc: 'Sound, road closure, safety if required.' });
  }

  return base.map(m => ({
    ...m,
    dueDate: addDays(eventDate, -m.days),
    done: false
  }));
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function getVendors(type, location, guests) {
  const common = [
    { category: 'Venue', name: `${location} Heritage / Banquet Halls`, tip: 'Look for packages that include basic lighting & seating.', match: 96 },
    { category: 'Catering', name: 'Regional Multi-Cuisine Caterers', tip: `For ${guests}+ guests prefer buffet + live counters.`, match: 94 },
    { category: 'Photography', name: 'Candid + Traditional Photo/Video Team', tip: 'Book 2 photographers + 1 videographer for full coverage.', match: 93 },
    { category: 'Decor & Florals', name: 'Theme-based Decor Studios', tip: 'Ask for eco-friendly options and reusable structures.', match: 91 },
    { category: 'Entertainment', name: 'DJ / Live Band / Emcee', tip: 'Share playlist preferences and any cultural music needs early.', match: 89 },
    { category: 'Invitations', name: 'Digital + Print Design Studio', tip: 'QR code RSVP saves time and reduces paper waste.', match: 88 }
  ];

  if (type === 'Wedding') {
    common.push(
      { category: 'Mehendi / Makeup', name: 'Bridal & Family Makeup Artists', tip: 'Trial session 2–3 weeks before is essential.', match: 95 },
      { category: 'Travel & Stay', name: 'Guest Accommodation Coordinator', tip: 'Block rooms near venue for outstation guests.', match: 87 }
    );
  }
  if (type === 'Birthday') {
    common.push(
      { category: 'Cake & Desserts', name: 'Specialty Cake Studio', tip: 'Order tasting 3–4 weeks ahead for custom designs.', match: 92 },
      { category: 'Activities', name: 'Games / Photo Booth / Magician', tip: 'Great for kids or mixed-age parties.', match: 90 }
    );
  }
  if (type === 'Community') {
    common.push(
      { category: 'Security & Crowd', name: 'Event Security Services', tip: 'Required for public / large open events.', match: 94 },
      { category: 'Sound & Stage', name: 'Professional AV Rental', tip: 'Test run the day before if possible.', match: 91 }
    );
  }

  return common;
}

function getIdeas(type, theme, location, notes) {
  const ideas = [
    {
      title: 'Theme Execution',
      items: [
        `Lean into “${theme}” with consistent color palette across invitations, stage, table settings and attire suggestions.`,
        `Use local flowers and materials from ${location} to keep costs down and support local artisans.`,
        notes ? `Incorporate your note: “${notes}” into the design and guest experience.` : 'Add a signature scent or welcome drink that matches the theme.'
      ]
    },
    {
      title: 'Guest Experience',
      items: [
        'Create a simple digital itinerary (WhatsApp / website) so guests always know what’s next.',
        'Set up a photo wall or polaroid station – guests love taking memories home.',
        'Have a quiet corner or lounge area for older guests or anyone needing a break.'
      ]
    },
    {
      title: 'Sustainability Touches',
      items: [
        'Prefer digital invites + limited print run.',
        'Choose reusable décor elements and donate leftover flowers.',
        'Offer vegetarian / plant-forward menu options and clear recycling stations.'
      ]
    }
  ];

  if (type === 'Wedding') {
    ideas.push({
      title: 'Wedding-specific Ideas',
      items: [
        'Personalized couple playlist for the reception first dance and late-night set.',
        'Small welcome kits for outstation guests (snacks, map, schedule).',
        'Live painting or caricature artist as a unique entertainment + keepsake.'
      ]
    });
  }
  if (type === 'Birthday') {
    ideas.push({
      title: 'Birthday / Milestone Ideas',
      items: [
        'Memory board or video of messages from friends & family.',
        'Themed dessert table that matches the color story.',
        'Activity stations so guests of different ages stay engaged.'
      ]
    });
  }
  if (type === 'Community') {
    ideas.push({
      title: 'Community Event Ideas',
      items: [
        'Open stage for local talent / school performances.',
        'Food stalls from local home chefs or small businesses.',
        'Clear wayfinding and volunteer briefing the morning of the event.'
      ]
    });
  }

  return ideas;
}

function generateSummaryText(input, milestones, allocation) {
  const topBudget = allocation.slice(0, 3).map(a => `${a.label} (₹${a.amount.toLocaleString('en-IN')})`).join(', ');
  return `
    <div class="space-y-4">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-400 shrink-0">
          <i class="fa-solid fa-check"></i>
        </div>
        <div>
          <p class="font-semibold text-teal-400 text-base">${input.name}</p>
          <p class="text-slate-400 text-xs mt-0.5">${input.type} • ${input.date} • ${input.guests} guests • ${input.location}</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
          <p class="text-slate-500 mb-1">Theme</p>
          <p class="text-white font-medium">${input.theme}</p>
        </div>
        <div class="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
          <p class="text-slate-500 mb-1">Budget Focus</p>
          <p class="text-white font-medium">Venue + Catering + Decor</p>
        </div>
      </div>

      <div>
        <p class="text-xs text-slate-500 mb-1.5 uppercase tracking-wider font-semibold">Key Highlights</p>
        <ul class="space-y-1.5 text-sm text-slate-300">
          <li class="flex gap-2"><span class="text-teal-400">•</span> ${milestones.length} milestone timeline created (from ${milestones[0].days} days out to event day)</li>
          <li class="flex gap-2"><span class="text-teal-400">•</span> Budget of ₹${input.budget.toLocaleString('en-IN')} allocated across ${allocation.length} categories</li>
          <li class="flex gap-2"><span class="text-teal-400">•</span> Top allocations: ${topBudget}</li>
          <li class="flex gap-2"><span class="text-teal-400">•</span> Vendor checklist & personalized ideas ready in the other tabs</li>
        </ul>
      </div>

      <p class="text-xs text-slate-500 border-t border-slate-800 pt-3">
        Switch to <strong class="text-slate-300">Timeline</strong>, <strong class="text-slate-300">Budget</strong>, <strong class="text-slate-300">Vendors</strong> or <strong class="text-slate-300">Ideas</strong> tabs to explore the full plan.
      </p>
    </div>
  `;
}

// ========== RENDER FUNCTIONS ==========
function renderPlanSummary() {
  if (!currentPlan) return;
  document.getElementById('planOutput').innerHTML = currentPlan.summary;
}

function renderTimeline() {
  const container = document.getElementById('timelineList');
  if (!currentPlan) {
    container.innerHTML = '<p class="text-slate-500 text-sm italic">Generate a plan first to see the timeline.</p>';
    return;
  }

  container.innerHTML = currentPlan.milestones.map((m, idx) => `
    <div class="flex gap-4 items-start bg-slate-950/60 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition">
      <div class="flex flex-col items-center">
        <div class="w-9 h-9 rounded-full ${m.done ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-400'} flex items-center justify-center text-xs font-bold shrink-0">
          ${m.done ? '<i class="fa-solid fa-check"></i>' : (idx + 1)}
        </div>
        ${idx < currentPlan.milestones.length - 1 ? '<div class="w-0.5 flex-1 bg-slate-800 mt-1 min-h-[20px]"></div>' : ''}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2 mb-1">
          <h4 class="font-semibold text-white text-sm">${m.title}</h4>
          <span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">${m.dueDate} (${m.days === 0 ? 'Event Day' : m.days + ' days before'})</span>
        </div>
        <p class="text-xs text-slate-400">${m.desc}</p>
      </div>
      <button onclick="toggleMilestone(${idx})" class="text-xs px-3 py-1.5 rounded-lg border ${m.done ? 'border-teal-500/40 text-teal-400' : 'border-slate-700 text-slate-400 hover:border-slate-500'} transition shrink-0">
        ${m.done ? 'Done' : 'Mark done'}
      </button>
    </div>
  `).join('');
}

function toggleMilestone(idx) {
  if (!currentPlan) return;
  currentPlan.milestones[idx].done = !currentPlan.milestones[idx].done;
  renderTimeline();
}

function renderBudget() {
  if (!currentPlan) return;

  const total = currentPlan.input.budget;
  document.getElementById('budgetTotal').textContent = '₹ ' + total.toLocaleString('en-IN');

  const sliders = document.getElementById('budgetSliders');
  sliders.innerHTML = currentPlan.allocation.map((cat, i) => `
    <div>
      <div class="flex justify-between text-xs mb-1.5">
        <label class="font-medium text-slate-300">${cat.label}</label>
        <span class="text-slate-400"><span id="pct-${cat.key}">${cat.defaultPct}</span>% • ₹ <span id="amt-${cat.key}">${cat.amount.toLocaleString('en-IN')}</span></span>
      </div>
      <input type="range" min="0" max="60" value="${cat.defaultPct}" 
        class="w-full accent-teal-500 h-2 rounded-lg cursor-pointer"
        data-key="${cat.key}" data-index="${i}"
        oninput="updateBudgetSlider(this)" />
    </div>
  `).join('');

  // Chart
  const ctx = document.getElementById('budgetChart').getContext('2d');
  if (budgetChart) budgetChart.destroy();

  budgetChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: currentPlan.allocation.map(a => a.label),
      datasets: [{
        data: currentPlan.allocation.map(a => a.defaultPct),
        backgroundColor: currentPlan.allocation.map(a => a.color),
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: { size: 11, family: 'Inter' },
            padding: 12,
            boxWidth: 12
          }
        }
      },
      cutout: '62%'
    }
  });
}

function updateBudgetSlider(el) {
  if (!currentPlan) return;
  const key = el.dataset.key;
  const idx = parseInt(el.dataset.index);
  const pct = parseInt(el.value);
  const total = currentPlan.input.budget;
  const amount = Math.round(total * (pct / 100));

  currentPlan.allocation[idx].defaultPct = pct;
  currentPlan.allocation[idx].amount = amount;

  document.getElementById('pct-' + key).textContent = pct;
  document.getElementById('amt-' + key).textContent = amount.toLocaleString('en-IN');

  // Update chart
  if (budgetChart) {
    budgetChart.data.datasets[0].data = currentPlan.allocation.map(a => a.defaultPct);
    budgetChart.update();
  }

  const sum = currentPlan.allocation.reduce((s, a) => s + a.defaultPct, 0);
  document.getElementById('budgetAllocated').textContent = sum + '%';
  document.getElementById('budgetAllocated').className = sum === 100
    ? 'font-bold text-teal-400 ml-2'
    : 'font-bold text-amber-400 ml-2';
}

function renderVendors() {
  const container = document.getElementById('vendorList');
  if (!currentPlan) {
    container.innerHTML = '<p class="text-slate-500 text-sm italic col-span-full">Generate a plan first to see vendor recommendations.</p>';
    return;
  }

  container.innerHTML = currentPlan.vendors.map(v => `
    <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition flex flex-col">
      <div class="flex justify-between items-start mb-2">
        <span class="text-[11px] font-semibold uppercase tracking-wider text-teal-400/80">${v.category}</span>
        <span class="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-semibold">${v.match}% match</span>
      </div>
      <h4 class="font-semibold text-white text-sm mb-1.5">${v.name}</h4>
      <p class="text-xs text-slate-400 flex-1 mb-3">${v.tip}</p>
      <button class="w-full py-2 rounded-lg text-xs font-semibold border border-teal-500/30 text-teal-400 hover:bg-teal-500/10 transition">
        Add to shortlist
      </button>
    </div>
  `).join('');
}

function renderIdeas() {
  const container = document.getElementById('ideasList');
  if (!currentPlan) {
    container.innerHTML = '<p class="text-slate-500 text-sm italic">Generate a plan first to see personalized ideas.</p>';
    return;
  }

  container.innerHTML = currentPlan.ideas.map(section => `
    <div class="bg-slate-950 border border-slate-800 rounded-xl p-5">
      <h3 class="font-semibold text-white mb-3 flex items-center gap-2">
        <i class="fa-solid fa-lightbulb text-amber-400 text-sm"></i>
        ${section.title}
      </h3>
      <ul class="space-y-2">
        ${section.items.map(item => `
          <li class="flex gap-2.5 text-sm text-slate-300">
            <span class="text-teal-400 mt-0.5">•</span>
            <span>${item}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');
}

// ========== SAVE / LOAD ==========
function saveCurrentPlan() {
  if (!currentPlan) return;
  const plans = JSON.parse(localStorage.getItem('eventcraft_plans') || '[]');
  // Replace if same id, else add
  const idx = plans.findIndex(p => p.id === currentPlan.id);
  if (idx >= 0) plans[idx] = currentPlan;
  else plans.unshift(currentPlan);
  // Keep last 10
  if (plans.length > 10) plans.pop();
  localStorage.setItem('eventcraft_plans', JSON.stringify(plans));
  alert('Plan saved! View it in the “Saved Plans” tab.');
  renderSavedPlans();
}

function renderSavedPlans() {
  const container = document.getElementById('savedList');
  const plans = JSON.parse(localStorage.getItem('eventcraft_plans') || '[]');

  if (plans.length === 0) {
    container.innerHTML = '<p class="text-slate-500 text-sm italic">No saved plans yet.</p>';
    return;
  }

  container.innerHTML = plans.map(p => `
    <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl p-4">
      <div>
        <p class="font-semibold text-white text-sm">${p.input.name}</p>
        <p class="text-xs text-slate-400 mt-0.5">${p.input.type} • ${p.input.date} • ₹${p.input.budget.toLocaleString('en-IN')} • ${p.input.guests} guests</p>
      </div>
      <div class="flex gap-2">
        <button onclick="loadPlan(${p.id})" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition">Load</button>
        <button onclick="deletePlan(${p.id})" class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition">Delete</button>
      </div>
    </div>
  `).join('');
}

function loadPlan(id) {
  const plans = JSON.parse(localStorage.getItem('eventcraft_plans') || '[]');
  const plan = plans.find(p => p.id === id);
  if (!plan) return;
  currentPlan = plan;

  // Fill form
  document.getElementById('eventType').value = plan.input.type;
  document.getElementById('eventName').value = plan.input.name;
  document.getElementById('eventDate').value = plan.input.date;
  document.getElementById('guestCount').value = plan.input.guests;
  document.getElementById('budget').value = plan.input.budget;
  document.getElementById('location').value = plan.input.location;
  document.getElementById('theme').value = plan.input.theme;
  document.getElementById('notes').value = plan.input.notes || '';

  renderPlanSummary();
  renderTimeline();
  renderVendors();
  renderIdeas();
  renderBudget();

  document.getElementById('planStatus').innerHTML = '<span class="text-teal-400">✓ Loaded</span>';
  document.getElementById('saveBtn').disabled = false;
  document.getElementById('saveBtn').classList.remove('bg-slate-800', 'text-slate-400', 'cursor-not-allowed');
  document.getElementById('saveBtn').classList.add('bg-teal-600', 'hover:bg-teal-500', 'text-white', 'cursor-pointer');

  switchTab('planner');
}

function deletePlan(id) {
  let plans = JSON.parse(localStorage.getItem('eventcraft_plans') || '[]');
  plans = plans.filter(p => p.id !== id);
  localStorage.setItem('eventcraft_plans', JSON.stringify(plans));
  renderSavedPlans();
}

// ========== INIT ==========
document.addEventListener('DOMContentLoaded', () => {
  // Set a sensible default date (90 days from now)
  document.getElementById('eventDate').value = getFutureDate(90);
});
