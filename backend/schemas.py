from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Product Schemas
class ProductBase(BaseModel):
    barcode: Optional[str] = None
    name: str
    category: Optional[str] = None
    cost_price: float
    selling_price: float
    stock_quantity: int = 0
    reorder_level: int = 10

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    barcode: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    reorder_level: Optional[int] = None

class ProductSchema(ProductBase):
    id: int
    last_restocked: datetime

    class Config:
        from_attributes = True

# Inventory Log Schemas
class InventoryLogBase(BaseModel):
    change_type: str
    quantity_changed: int
    reason: Optional[str] = None

class InventoryLogCreate(InventoryLogBase):
    product_id: int

class InventoryLogSchema(InventoryLogBase):
    id: int
    product_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

# Sale Schemas
class SaleItemBase(BaseModel):
    product_id: int
    quantity: int

class SaleItemCreate(SaleItemBase):
    price_at_sale: float

class SaleItemSchema(SaleItemBase):
    id: int
    sale_id: int
    price_at_sale: float

    class Config:
        from_attributes = True

class SaleBase(BaseModel):
    total_amount: float
    profit: float
    payment_method: str

class SaleCreate(BaseModel):
    payment_method: str
    items: List[SaleItemBase]

class SaleSchema(SaleBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
