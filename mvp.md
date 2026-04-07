# SmartStore MVP Specification

This document defines the Minimum Viable Product (MVP) scope for SmartStore, derived from the core functional requirements of Phase 1.

## 1. Goal
To provide a functional inventory and sales management system that works offline and enables store owners to track stock and daily profit.

## 2. Core Features (Phase 1)

### 2.1 Product & Inventory Management
- **Product CRUD**: Add, edit, and delete products with barcode, cost price, and selling price.
- **Stock Tracking**: Real-time stock count updates.
- **Stock Adjustments**: Manual stock-in (purchases) and stock-out (wastage/theft) logging.
- **History Logs**: Simple audit trail of all inventory changes.

### 2.2 Point of Sale (POS)
- **Checkout Interface**: Simple list-based or scanned item entry.
- **Automatic Deduction**: Real-time inventory update upon transaction completion.
- **Payment Methods**: Support for Cash, Bank Transfer, and POS.
- **Receipts**: Generation of digital receipts (or printable plain text).

### 2.3 Dashboard & Analytics
- **Sales Summary**: Total sales and profit for the current day.
- **Stock Alerts**: List of products below the reorder threshold (Low Stock).
- **Quick Actions**: Shortcuts to Sell, Add Stock, and Product List.

### 2.4 User Management
- **Basic Auth**: Login for Admin and Cashier roles.
- **Role Permissions**: 
    - Admin: Full access to inventory, pricing, and reports.
    - Cashier: Access to POS and view-only product list.

## 3. Technical Requirements

- **Frontend**: React (Vite) + Vanilla CSS (Premium Aesthetic).
- **Backend**: Python (FastAPI) for REST API.
- **Database**: SQLite (Local) for rapid MVP development.
- **Persistence**: Offline-first with local storage (IndexedDB) and background sync to Python backend.
- **Mobile Optimized**: Responsive web interface suitable for tablets/phones.
- **Performance**: Transaction processing in <2 seconds.

## 4. Exclusions (Post-MVP)
- AI demand forecasting.
- Supplier purchase order automation.
- Multi-branch synchronization.
- Customer loyalty programs.
