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

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.10

---

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy passlib[bcrypt] python-multipart
```

Start the server:
```bash
# From the project root
backend/venv/bin/python3 -m uvicorn backend.main:app --reload --port 8000
```

API docs → **http://localhost:8000/docs**

---

### 2. Frontend

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
