# 5e D&D Character Sheet

A web app for creating and managing **Fifth Edition Dungeons & Dragons** character sheets. Enter stats by hand, roll dice (including ability and skill checks), and save/load characters on a backend server.

## Features

- **Manual input**: All standard 5e fields — abilities, skills, saving throws, combat stats, equipment, features, and notes
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

- `GET /api/characters` — List all saved characters (id, name, class, level, updatedAt)
- `GET /api/characters/:id` — Get one character by id
- `POST /api/characters` — Create a new character (body: full character object)
- `PUT /api/characters/:id` — Update a character
- `DELETE /api/characters/:id` — Delete a character

Data is stored in `data/characters.json` (created automatically).

## Tech

- **Backend**: Node.js, Express, JSON file storage
- **Frontend**: Vanilla HTML, CSS, and JavaScript (no build step)
