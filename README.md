# 5e D&D Character Sheet (2014 rules)

A web app for creating and managing **Fifth Edition Dungeons & Dragons** character sheets using the **2014 core rules** (original PHB / SRD 5.1). Enter stats by hand, roll dice (including ability and skill checks), track spell slots, and save/load characters on a backend server. No 2024 revised core rulebooks — this uses the original SRD 5.1.

---

## Features

### Character sheet
- **Manual input**: All standard 2014 5e fields — abilities, skills, saving throws, combat stats (AC, initiative, HP, death saves), equipment, features & traits, and notes
- **Auto-calculated modifiers**: Ability modifiers and skill/save modifiers (including proficiency) update as you type
- **Layout**: Compact layout with Combat, Saving Throws, and Dice Roller in one row; PB/Speed/Inspiration below the Dice Roller; tabbed sections for Actions, Inventory, Spells, Features & Traits, Background, and Notes

### Dice rolling
- **Ability checks**: Roll d20 for any ability (STR, DEX, CON, INT, WIS, CHA) with the correct modifier
- **Skills**: Roll for any skill with ability + proficiency (if proficient)
- **Dice roller**: Choose number of dice (e.g. 2d6), die type (d4–d100), and modifier; quick buttons for d4, d6, d8, d10, d12, d20, 2d6
- **Roll Multiple**: Add multiple die types to a pool and roll them at once
- **Roll history**: See recent rolls and clear when needed

### Spells
- **Spells known/prepared**: Add spells from your class list (filtered by class and level); limits follow 2014 5e (e.g. spells known for Bard, prepared for Wizard/Cleric)
- **Spell slot counter**: Checkbox tracker for spell slots by level (1st–9th). Check a box when you use a slot; uncheck all after a long rest. Slot counts are derived from your class and level (full casters, half casters, and warlock pact slots supported). State is saved with the character.

### Theming
- **Dark / light mode**: Toggle in the top-right (sun/moon icon). Preference is saved in `localStorage`.
- **Change Scene**: Pick a color scheme for the sheet — **Default** (red), **Forest** (green), **Ocean** (blue), **Royal** (purple), **Ember** (orange). Background and accent colors change to match; choice is saved in `localStorage`.

### Storage & reference
- **Backend storage**: Save and load character sheets on the server (create, update, list, load, delete). Requires an account (Register / Log in).
- **Reference**: In-app browser for spells, equipment, magic items, and SRD rules (Open5e API, 2014 5e SRD). No new tabs; no API key required.
- **Save as PDF**: Print or save the sheet as PDF from the browser.

---

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the server**
   ```bash
   npm start
   ```

3. **Open in browser**  
   [http://localhost:3000](http://localhost:3000)

The app is served from the same origin, so **Save to Server** and **Load** work without extra configuration. Create an account from the landing page or after clicking **Log in** to save and load characters.

---

## Project structure

```
dice_proj/
├── server.js          # Express server, auth, character & reference APIs
├── public/
│   ├── index.html     # Single-page app (landing, sheet, modals)
│   ├── styles.css     # Layout, theming, print
│   ├── app.js         # Sheet logic, dice, spells, save/load, builder
│   ├── builder-data.js    # Character builder options (classes, races, etc.)
│   ├── feature-choices.js # Feature choices (e.g. domain, fighting style)
│   └── descriptions.js    # Trait/feature descriptions
├── data/              # Created at runtime
│   ├── characters.json
│   └── users.json
└── README.md
```

---

## API

### Auth
- `POST /api/auth/register` — Register (username, password, optional email)
- `POST /api/auth/login` — Log in
- `POST /api/auth/logout` — Log out
- `GET /api/auth/me` — Current user (or 401)

### Characters
- `GET /api/characters` — List characters for the current user (id, name, class, level, updatedAt)
- `GET /api/characters/:id` — Get one character by id (owner only)
- `POST /api/characters` — Create a character (body: full character object)
- `PUT /api/characters/:id` — Update a character (owner only)
- `DELETE /api/characters/:id` — Delete a character (owner only)

### Reference (Open5e – 2014 5e SRD)
- `GET /api/spells` — List spells (cached from Open5e)
- `GET /api/equipment` — List weapons, armor, and equipment (includes modern/futuristic options)
- `GET /api/magicitems` — List magic items
- `GET /api/rules` — List SRD rules sections

Data is stored in `data/characters.json` and `data/users.json` (created automatically). Spells, equipment, magic items, and rules are fetched from the Open5e API and cached by the server.

---

## Tech

- **Backend**: Node.js 18+, Express, express-session, bcryptjs, JSON file storage, Open5e API integration
- **Frontend**: Vanilla HTML, CSS, and JavaScript (no build step). Uses `localStorage` for theme and scene preferences.

---

## Deploying to production

The app is a **Node.js + Express** backend with a **vanilla HTML/CSS/JS** frontend and file-based storage. Suitable hosts include **Railway** and **Render**.

### 1. Push to GitHub

1. Create a new repository on [github.com](https://github.com) (e.g. `dice-proj`), **Public**, no “Add a README”.
2. In your project folder:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/dice_proj.git
   git push -u origin main
   ```
   Use a **Personal Access Token** as the password if Git prompts for credentials.

### 2. Deploy on Railway

1. Sign in at [railway.app](https://railway.app) (e.g. “Login with GitHub”).
2. **New Project** → **Deploy from GitHub repo** → select your repo.
3. After deploy, open the service → **Variables** → add **`SESSION_SECRET`** (long random string) for secure sessions.
4. **Settings** → **Networking** → **Generate Domain**. Your app is live at the generated URL.

### 3. Or deploy on Render

1. Sign in at [render.com](https://render.com) with GitHub.
2. **New** → **Web Service** → connect your repo.
3. **Environment**: Node. **Build**: `npm install`. **Start**: `npm start`.
4. Add **`SESSION_SECRET`** under Environment. Create the service and use the URL Render provides.

**Summary:** Push the repo to GitHub, then deploy with Railway or Render. Set **`SESSION_SECRET`** in the host’s environment. You can attach a custom domain later from the host’s dashboard.
