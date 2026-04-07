from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String, unique=True, index=True, nullable=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True)
    cost_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0)
    reorder_level = Column(Integer, default=10)
    last_restocked = Column(DateTime, default=datetime.datetime.utcnow)

    inventory_logs = relationship("InventoryLog", back_populates="product")
    sale_items = relationship("SaleItem", back_populates="product")

class InventoryLog(Base):
    __tablename__ = "inventory_logs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    change_type = Column(String)  # 'stock-in', 'stock-out', 'adjustment'
    quantity_changed = Column(Integer)
    reason = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    product = relationship("Product", back_populates="inventory_logs")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    total_amount = Column(Float)
    profit = Column(Float)
    payment_method = Column(String)  # 'cash', 'transfer', 'pos'
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    items = relationship("SaleItem", back_populates="sale")

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price_at_sale = Column(Float)

    sale = relationship("Sale", back_populates="items")
    product = relationship("Product", back_populates="sale_items")
