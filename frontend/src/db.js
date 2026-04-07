import Dexie from 'dexie';

export const db = new Dexie('SmartStoreDB');

db.version(1).stores({
  products: '++id, barcode, name, category',
  inventory_logs: '++id, product_id, timestamp',
  sales: '++id, timestamp',
  sale_items: '++id, sale_id, product_id',
});

export default db;
