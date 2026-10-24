# Northstar Product Explorer — REST API Internship Task

A responsive product explorer demonstrating async JavaScript, REST API requests, dynamic DOM rendering, real-time search, category filters, sorting, localStorage cart persistence, loading skeletons, and friendly error handling.

## Files
- `index.html` — semantic page structure and accessible controls
- `style.css` — responsive product cards, loading skeletons, mobile-first layout
- `app.js` — application state, rendering, search/filter/sort, and cart logic
- `api.js` — isolated REST API client using `fetch`

## API
Uses Fake Store API: https://fakestoreapi.com/products

## Run
Because `app.js` uses ES modules, run a local server instead of opening the file directly:
- VS Code: install/use Live Server and open `index.html`, or
- Python: run `python -m http.server 8000` from this folder, then visit http://localhost:8000.

An internet connection is required to load products from the API.

## Features
- `async`/`await` with `fetch` and HTTP error checks
- Real-time search across product title, description, and category
- Category tabs and sorting by price, name, and rating
- Client-side cart state persisted in `localStorage`
- Loading skeletons, retryable error banner, empty state, and live status announcements
- Responsive CSS Grid and keyboard focus indicators

## Submit
1. Test the app using the local server.
2. Capture screenshots of the desktop and mobile layouts.
3. Create a GitHub repository and upload these four files.
4. Share the repository URL with your internship evaluator.
