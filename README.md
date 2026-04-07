# SmartStore — Inventory & POS System

An offline-first inventory and point-of-sale management system built for supermarkets and small-to-medium retail stores in emerging markets.

---

## Features

- **Dashboard** — Daily sales, profit, transaction count, and low-stock alerts
- **Product Management** — Add, edit, and delete products with barcode, category, cost & sell price, and reorder levels
- **Stock Adjustment** — Log stock-in, stock-out, and manual adjustments with a full audit trail
- **Point of Sale (POS)** — Fast checkout with cart management, quantity controls, and Cash / Transfer / POS payment methods
- **Receipt Generation** — Auto-generated receipt modal on every completed sale
- **Inventory Logs** — Full history of every stock change with timestamps

---

## Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React (Vite) + Vanilla CSS    |
| Backend    | Python — FastAPI + SQLAlchemy |
| Database   | SQLite                        |
| API Client | Axios                         |

---

## Getting Started

### Option A: Run with Docker (Recommended)
You can run the entire application (PostgreSQL + FastAPI Backend + React Frontend) with a single command.

1. Create your environment variables:
   ```bash
   cp .env.example .env
   ```
2. Start the containers:
   ```bash
   docker-compose up --build -d
   ```
3. Access the application:
   - **Frontend App**: http://localhost
   - **Backend API Docs**: http://localhost:8000/docs

*To stop the app, run `docker-compose down`.*

---

### Option B: Local Development (Without Docker)

#### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Start the server (uses local SQLite by default):
```bash
# From the project root
backend/venv/bin/python3 -m uvicorn backend.main:app --reload --port 8000
```

#### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App → **http://localhost:5173**

---

## Project Structure

```
smart_store/
├── backend/
│   ├── __init__.py
│   ├── main.py         # FastAPI routes
│   ├── models.py       # SQLAlchemy models
│   ├── schemas.py      # Pydantic schemas
│   └── database.py     # DB engine & session
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── api.js
│       ├── db.js
│       ├── index.css
│       └── components/
│           ├── Dashboard.jsx
│           ├── Products.jsx
│           ├── POS.jsx
│           └── InventoryLogs.jsx
├── SmartStore_PRD.md
└── mvp.md
```

---

## License

MIT
