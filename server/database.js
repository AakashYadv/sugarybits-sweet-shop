import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verboseSqlite = sqlite3.verbose();

// Create a database file named 'sweetshop.db' in the server directory
const dbPath = path.resolve(__dirname, 'sweetshop.db');
const db = new verboseSqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT, -- In a real app, hash this!
      firstName TEXT,
      lastName TEXT,
      role TEXT
    )`);

    // 2. Sweets Table (Inventory)
    db.run(`CREATE TABLE IF NOT EXISTS sweets (
      id TEXT PRIMARY KEY,
      name TEXT,
      category TEXT,
      description TEXT,
      price REAL,
      quantity INTEGER,
      imageUrl TEXT
    )`);

    // 3. Cart Table
    db.run(`CREATE TABLE IF NOT EXISTS cart_items (
      userId TEXT,
      sweetId TEXT,
      quantity INTEGER,
      PRIMARY KEY (userId, sweetId),
      FOREIGN KEY(sweetId) REFERENCES sweets(id)
    )`);

    // 4. Orders Table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT,
      username TEXT,
      totalAmount REAL,
      shippingAddress TEXT, -- JSON string
      status TEXT,
      createdAt INTEGER
    )`);

    // 5. Order Items Table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
      orderId TEXT,
      sweetId TEXT,
      name TEXT,
      price REAL,
      quantity INTEGER,
      imageUrl TEXT,
      category TEXT,
      description TEXT,
      FOREIGN KEY(orderId) REFERENCES orders(id)
    )`);
    
    // 6. Wishlist Table
    db.run(`CREATE TABLE IF NOT EXISTS wishlists (
      userId TEXT,
      sweetId TEXT,
      PRIMARY KEY (userId, sweetId)
    )`);

    // Seed Initial Data if empty
    db.get("SELECT count(*) as count FROM sweets", (err, row) => {
        if (row && row.count === 0) {
            const seed = [
              ['1', 'Rainbow Gummy Bears', 'Gummy', 'Soft, chewy, and bursting with fruit flavors. A classic treat for all ages.', 3.50, 100, 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=800&q=80'],
              ['2', 'Dark Chocolate Truffles', 'Chocolate', 'Rich 70% cocoa truffles dusted with premium cocoa powder. Melt in your mouth luxury.', 12.00, 45, 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=800&q=80'],
              ['3', 'Sour Apple Rings', 'Gummy', 'Tangy apple flavor with a sugar coating that packs a punch.', 4.25, 0, 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=800&q=80'],
              ['4', 'Peppermint Swirls', 'Hard Candy', 'Classic holiday starlight mints. Refreshing and long-lasting.', 2.00, 200, 'https://images.unsplash.com/photo-1576618148400-f54bed99fcf8?auto=format&fit=crop&w=800&q=80'],
              ['5', 'Raspberry Macarons', 'Pastry', 'Delicate french cookies with ganache filling. Crispy shell, chewy center.', 15.00, 12, 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80'],
              ['6', 'Sugar Free Lollipops', 'Sugar Free', 'All the fun without the sugar. Fruit flavored swirls.', 5.50, 50, 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=800&q=80']
            ];
            const stmt = db.prepare("INSERT INTO sweets VALUES (?, ?, ?, ?, ?, ?, ?)");
            seed.forEach(s => stmt.run(s));
            stmt.finalize();
            console.log("Database seeded with initial sweets.");
        }
    });
  });
}

export default db;