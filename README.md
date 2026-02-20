# 5e D&D Character Sheet (2014 rules)

A web app for creating and managing **Fifth Edition Dungeons & Dragons** character sheets using the **2014 core rules** (original PHB / SRD 5.1), not the 2024 revised core rulebooks. Enter stats by hand, roll dice (including ability and skill checks), and save/load characters on a backend server.

## Features

- **Manual input**: All standard 2014 5e fields — abilities, skills, saving throws, combat stats, equipment, features, and notes
- **Auto-calculated modifiers**: Ability modifiers and skill/save modifiers (including proficiency) update as you type
- **Dice rolling**: 
  - Roll d20 for any ability (STR, DEX, CON, INT, WIS, CHA)
  - Roll for any skill with the correct modifier (ability + proficiency if proficient)
  - Custom dice roller: choose number of dice (e.g. 2d6), die type (d4–d100), and modifier
  - Quick buttons for d4, d6, d8, d10, d12, d20, 2d6
- **Backend storage**: Save and load character sheets on the server (create, update, list, load, delete via API)

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

The app is served from the same origin, so "Save to Server" and "Load" work without extra configuration.

## API

### Characters
- `GET /api/characters` — List all saved characters (id, name, class, level, updatedAt)
- `GET /api/characters/:id` — Get one character by id
- `POST /api/characters` — Create a new character (body: full character object)
- `PUT /api/characters/:id` — Update a character
- `DELETE /api/characters/:id` — Delete a character

### Reference (Open5e – 2014 5e SRD, no credentials)
- `GET /api/spells` — List spells (from Open5e; 2014 SRD)
- `GET /api/equipment` — List weapons and armor
- `GET /api/magicitems` — List magic items
- `GET /api/rules` — List SRD rules sections

Data is stored in `data/characters.json` (created automatically). Spells, equipment, magic items, and rules are fetched from the Open5e API (2014 5e SRD / OGL content) and cached by the server. Everything is shown in-app (no new tabs); no account or credentials required.

## Tech

- **Backend**: Node.js 18+, Express, JSON file storage, Open5e API integration
- **Frontend**: Vanilla HTML, CSS, and JavaScript (no build step)

## Admin backdoor (local use only)

You can sign in as admin without a normal account. Not linked in the UI.

1. Open the app with **`#backdoor`** in the URL (e.g. `http://localhost:3000/#backdoor`).
2. Enter the passcode **admin-login** and click Unlock.
3. You are taken to the **admin panel** (Users and All characters). To open it again later, add **`#admin`** to the URL (e.g. `http://localhost:3000/#admin`) while still logged in as admin.

To use a different passcode, set `ADMIN_BACKDOOR_SECRET` when starting the server.

---

## Push to production (no domain yet)

This app is a **Node.js + Express** backend with **vanilla HTML/CSS/JS** frontend and file-based storage. A standard, easy host for this is **Railway** (or **Render**). Below: get the app live first; you can connect your GoDaddy domain later.

### Step 1: Put your code on GitHub

1. Go to [github.com](https://github.com) and sign in (or create an account).
2. Click the **+** (top right) → **New repository**.
3. Name it (e.g. `dice-proj`), leave it **Public**, do **not** check “Add a README”. Click **Create repository**.
4. On your computer, open **PowerShell** in your project folder (`c:\Users\tachy\OneDrive\Desktop\dice_proj`).
5. Run these commands one by one (replace `YOUR_USERNAME` and `dice_proj` with your GitHub username and repo name if different):

   ```powershell
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/dice_proj.git
   git push -u origin main
   ```

   If Git asks for login, use your GitHub username and a **Personal Access Token** as the password (GitHub → Settings → Developer settings → Personal access tokens → Generate new token).

### Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign in (e.g. “Login with GitHub”).
2. Click **New Project**.
3. Choose **Deploy from GitHub repo**.
4. Select your repo (e.g. `dice_proj`). If you don’t see it, click **Configure GitHub App** and allow Railway to see the repo, then try again.
5. Railway will detect Node.js and deploy. Wait until the status is **Success** / **Active**.
6. Click your service (the box with your app name), then open the **Variables** tab.
7. Add a variable:
   - **Name:** `SESSION_SECRET`
   - **Value:** any long random string (e.g. copy from [randomkeygen.com](https://randomkeygen.com) “CodeIgniter Encryption Keys”). This keeps sessions secure in production.
8. Railway will redeploy automatically. When it’s done, open the **Settings** tab and find **Networking** → **Generate Domain**. Click it.
9. You’ll get a URL like `https://your-app-name.up.railway.app`. Open it in your browser — your app is live.

### Step 3: (Optional) Same thing on Render instead of Railway

If you prefer **Render**:

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. **New** → **Web Service**.
3. Connect your GitHub repo (`dice_proj`).
4. **Environment:** Node. **Build command:** `npm install`. **Start command:** `npm start`.
5. Under **Environment**, add: **Key** `SESSION_SECRET`, **Value** (a long random string).
6. Click **Create Web Service**. When it’s finished, use the URL Render gives you (e.g. `https://dice-proj.onrender.com`).

---

**Summary:** Your stack is Node.js + Express + vanilla frontend. Easiest path: push the project to GitHub, then deploy with **Railway** (or Render). Set `SESSION_SECRET` in the host’s environment. You’ll get a default URL; connecting your GoDaddy domain can be done later from the host’s dashboard.
