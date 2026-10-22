# EventCraft AI – Celebration & Event Planner

**PromptWars Virtual Challenge 5**  
Built for Hack2skill × Google for Developers

A clean, modern GenAI-powered planning assistant that helps users organize **weddings**, **birthdays**, and **community events** with:

- Personalized timelines & milestones  
- Budget breakdown + interactive allocation  
- Vendor checklists tailored to event type & location  
- Theme, guest-experience and sustainability ideas  

## Live Demo

Open `index.html` directly in any modern browser, or deploy to:

- GitHub Pages  
- Vercel / Netlify (drag & drop the folder)  
- Any static host  

## Features

| Feature | Description |
|---------|-------------|
| Event Form | Type, name, date, guests, budget, location, theme, special notes |
| AI Plan Generation | Instant complete blueprint (timeline + budget + vendors + ideas) |
| Interactive Timeline | Milestone checklist with mark-as-done |
| Budget Optimizer | Live doughnut chart + adjustable category sliders |
| Vendor Directory | Category-based recommendations with match % and tips |
| Personalized Ideas | Theme execution, guest experience, sustainability, type-specific ideas |
| Save / Load | Plans stored in browser `localStorage` (last 10) |
| Print-friendly | Clean print stylesheet for PDF export |
| Accessibility | Semantic HTML, ARIA roles on tabs, keyboard-friendly controls |

## Tech Stack

- **Frontend**: HTML5 + Tailwind CSS (CDN) + vanilla JavaScript  
- **Charts**: Chart.js 4  
- **Icons**: Font Awesome 6  
- **Fonts**: Inter (Google Fonts)  
- **Storage**: localStorage  
- **GenAI**: Currently a high-quality deterministic planner that mirrors real Gemini-style output.  
  Ready to swap the `buildPlan()` function with a real Google Gemini API call (see below).

## How to Run Locally

```bash
# Clone or download
cd eventcraft-ai

# Option 1 – just open in browser
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux

# Option 2 – simple local server (recommended)
npx serve .
# or
python -m http.server 3000
```

## Deploy in 30 seconds

1. Push the folder to a public GitHub repository.  
2. Enable GitHub Pages (Settings → Pages → Deploy from main branch).  
3. Or drag the folder onto [vercel.com/new](https://vercel.com/new).

## Connecting Real Google Gemini (optional upgrade)

1. Get an API key from [Google AI Studio](https://aistudio.google.com/).  
2. Replace the simulated generation inside `js/app.js` → `generatePlan()` with a fetch to Gemini:

```js
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an expert event planner. Create a detailed plan for a ${type} named "${name}" on ${date} for ${guests} guests in ${location} with budget ₹${budget}. Theme: ${theme}. Notes: ${notes}.

Return ONLY valid JSON with this shape:
{
  "milestones": [{"days": number, "title": string, "desc": string}],
  "allocation": [{"key": string, "label": string, "defaultPct": number}],
  "vendors": [{"category": string, "name": string, "tip": string, "match": number}],
  "ideas": [{"title": string, "items": [string]}]
}`
        }]
      }]
    })
  }
);
const data = await response.json();
// parse data.candidates[0].content.parts[0].text and feed into currentPlan
```

Keep the existing rendering functions – they already expect that structure.

## Evaluation Criteria Alignment

- **Problem Statement Alignment** – Directly solves weddings / birthdays / community events with budgets, timelines, vendors and personalized ideas.  
- **Code Quality** – Clean, modular JS, readable HTML, consistent naming.  
- **Accessibility** – Semantic tabs, labels, ARIA, keyboard operable, good contrast.  
- **Efficiency** – Pure client-side, no unnecessary dependencies, fast load.  
- **Testing** – Manual test flow: generate → switch tabs → adjust budget → save → reload.  
- **Security** – No secrets in client code; localStorage only; ready for server-side Gemini proxy.

## Submission Notes (Hack2skill)

- **Public GitHub Repository Link**: (your repo URL)  
- **Project Deployed Link**: (GitHub Pages / Vercel URL)  
- **Demo Video**: Record a 2–3 min walkthrough of generating a wedding + birthday plan and showing all tabs.  
- **GenAI services utilized**: Simulated intelligent planner (structure ready for Google Gemini). All generation logic lives in `js/app.js` → `buildPlan()`, `getMilestones()`, `getVendors()`, `getIdeas()`.  
- **LinkedIn Post**: Share the live demo + repo with hashtags #PromptWars #BuildWithAI #Hack2skill

## Project Structure

```
eventcraft-ai/
├── index.html          # Main app shell
├── js/
│   └── app.js          # All logic, generation, rendering, storage
├── README.md           # This file
└── (optional) assets/  # Screenshots for README
```

## License

MIT – feel free to use and extend for the challenge.

---

Built with ❤️ for PromptWars Virtual 2026.
