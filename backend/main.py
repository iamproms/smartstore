from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date

from .database import engine, get_db
from . import models, schemas

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="SmartStore API", version="1.0.0")

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "SmartStore API v1"}


# ─── Products ──────────────────────────────────────────────────────────────────

@app.get("/products/", response_model=List[schemas.ProductSchema])
def list_products(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return db.query(models.Product).offset(skip).limit(limit).all()


@app.get("/products/{product_id}", response_model=schemas.ProductSchema)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/products/", response_model=schemas.ProductSchema, status_code=201)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    data = product.dict()
    if not data.get('barcode'):  # treat empty string as null
        data['barcode'] = None
    db_product = models.Product(**data)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


@app.put("/products/{product_id}", response_model=schemas.ProductSchema)
def update_product(product_id: int, update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in update.dict(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@app.delete("/products/{product_id}", status_code=204)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()


# ─── Inventory Logs ────────────────────────────────────────────────────────────

@app.get("/inventory/logs/", response_model=List[schemas.InventoryLogSchema])
def list_inventory_logs(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return db.query(models.InventoryLog).order_by(models.InventoryLog.timestamp.desc()).offset(skip).limit(limit).all()


@app.post("/inventory/adjust/", response_model=schemas.InventoryLogSchema, status_code=201)
def adjust_inventory(log: schemas.InventoryLogCreate, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == log.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.stock_quantity += log.quantity_changed
    if product.stock_quantity < 0:
        raise HTTPException(status_code=400, detail="Stock cannot go below 0")
    db_log = models.InventoryLog(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


# ─── Sales ─────────────────────────────────────────────────────────────────────

@app.get("/sales/", response_model=List[schemas.SaleSchema])
def list_sales(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return db.query(models.Sale).order_by(models.Sale.timestamp.desc()).offset(skip).limit(limit).all()


@app.post("/sales/", response_model=schemas.SaleSchema, status_code=201)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    total_amount = 0.0
    profit = 0.0
    item_records = []

    for item in sale.items:
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for '{product.name}'")

        subtotal = product.selling_price * item.quantity
        item_profit = (product.selling_price - product.cost_price) * item.quantity
        total_amount += subtotal
        profit += item_profit

        item_records.append((product, item.quantity))

    db_sale = models.Sale(
        total_amount=total_amount,
        profit=profit,
        payment_method=sale.payment_method,
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)

    for product, qty in item_records:
        db.add(models.SaleItem(
            sale_id=db_sale.id,
            product_id=product.id,
            quantity=qty,
            price_at_sale=product.selling_price,
        ))
        product.stock_quantity -= qty
        db.add(models.InventoryLog(
            product_id=product.id,
            change_type="stock-out",
            quantity_changed=-qty,
            reason="POS Sale",
        ))

    db.commit()
    db.refresh(db_sale)
    return db_sale


# ─── Dashboard Stats ──────────────────────────────────────────────────────────

@app.get("/stats/daily")
def get_daily_stats(db: Session = Depends(get_db)):
    today = date.today()
    sales = db.query(models.Sale).all()
    today_sales = [s for s in sales if s.timestamp.date() == today]
    total_sales = sum(s.total_amount for s in today_sales)
    total_profit = sum(s.profit for s in today_sales)
    low_stock = db.query(models.Product).filter(
        models.Product.stock_quantity <= models.Product.reorder_level
    ).all()

    return {
        "total_sales": total_sales,
        "total_profit": total_profit,
        "transaction_count": len(today_sales),
        "low_stock_count": len(low_stock),
        "low_stock_products": [{"id": p.id, "name": p.name, "stock": p.stock_quantity} for p in low_stock],
    }
