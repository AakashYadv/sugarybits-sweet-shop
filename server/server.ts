import express from "express";
import cors from "cors";
import db from "./database.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

// -------------------- LOGGING --------------------
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// -------------------- HEALTH --------------------
app.get("/", (req, res) => {
  res.json({ status: "OK", message: "SugaryBits API running" });
});

// ==================== AUTH ====================

// REGISTER
app.post("/api/auth/register", (req, res) => {
  const { username, email, password, firstName = "", lastName = "" } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const id = `usr_${Date.now()}`;
  const role = username.toLowerCase().includes("admin") ? "ADMIN" : "CUSTOMER";

  db.run(
    `INSERT INTO users (id, username, email, password, firstName, lastName, role)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, username, email, password, firstName, lastName, role],
    (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      res.json({
        user: { id, username, email, firstName, lastName, role },
        token: `jwt-${id}`,
      });
    }
  );
});

// LOGIN
app.post("/api/auth/login", (req, res) => {
  const { identifier } = req.body;

  db.get(
    `SELECT * FROM users WHERE username = ? OR email = ?`,
    [identifier, identifier],
    (err, row) => {
      if (!row) return res.status(401).json({ error: "Invalid credentials" });

      res.json({
        user: {
          id: row.id,
          username: row.username,
          email: row.email,
          firstName: row.firstName,
          lastName: row.lastName,
          role: row.role,
        },
        token: `jwt-${row.id}`,
      });
    }
  );
});

// GET USER
app.get("/api/users/:id", (req, res) => {
  db.get(
    `SELECT id, username, email, firstName, lastName, role FROM users WHERE id = ?`,
    [req.params.id],
    (err, row) => {
      if (!row) return res.status(404).json({ error: "User not found" });
      res.json(row);
    }
  );
});

// ==================== SWEETS ====================

app.get("/api/sweets", (req, res) => {
  db.all(`SELECT * FROM sweets`, [], (err, rows) => {
    res.json(rows || []);
  });
});

app.post("/api/sweets", (req, res) => {
  const { name, category, description, price, quantity, imageUrl } = req.body;
  const id = `sw_${Date.now()}`;

  db.run(
    `INSERT INTO sweets VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, category, description, price, quantity, imageUrl],
    () => res.json({ id, name, category, description, price, quantity, imageUrl })
  );
});

app.put("/api/sweets/:id", (req, res) => {
  const { name, category, description, price, quantity, imageUrl } = req.body;

  db.run(
    `UPDATE sweets SET name=?, category=?, description=?, price=?, quantity=?, imageUrl=? WHERE id=?`,
    [name, category, description, price, quantity, imageUrl, req.params.id],
    () => res.json(req.body)
  );
});

app.delete("/api/sweets/:id", (req, res) => {
  db.run(`DELETE FROM sweets WHERE id=?`, [req.params.id], () =>
    res.json({ success: true })
  );
});

// ==================== CART ====================

app.get("/api/cart/:userId", (req, res) => {
  db.all(
    `SELECT c.quantity as cartQuantity, s.*
     FROM cart_items c JOIN sweets s ON s.id = c.sweetId
     WHERE c.userId = ?`,
    [req.params.userId],
    (err, rows) => res.json(rows || [])
  );
});

app.post("/api/cart/:userId", (req, res) => {
  const { sweetId } = req.body;
  const userId = req.params.userId;

  db.run(
    `INSERT INTO cart_items VALUES (?, ?, 1)
     ON CONFLICT(userId, sweetId)
     DO UPDATE SET quantity = quantity + 1`,
    [userId, sweetId],
    () => {
      db.all(
        `SELECT c.quantity as cartQuantity, s.*
         FROM cart_items c JOIN sweets s ON s.id = c.sweetId
         WHERE c.userId = ?`,
        [userId],
        (err, rows) => res.json(rows || [])
      );
    }
  );
});

app.delete("/api/cart/:userId", (req, res) => {
  db.run(`DELETE FROM cart_items WHERE userId=?`, [req.params.userId], () =>
    res.json({ success: true })
  );
});

// ==================== ORDERS ====================

// CREATE ORDER
app.post("/api/orders", (req, res) => {
  const { userId, username, items, totalAmount, shippingAddress } = req.body;

  const orderId = `ORD-${Date.now()}`;
  const createdAt = Date.now();

  db.run(
    `INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      orderId,
      userId,
      username,
      totalAmount,
      JSON.stringify(shippingAddress),
      "PENDING",
      createdAt,
    ],
    () => {
      items.forEach((i) => {
        db.run(
          `INSERT INTO order_items VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            i.id,
            i.name,
            i.price,
            i.cartQuantity,
            i.imageUrl,
            i.category,
            i.description,
          ]
        );

        db.run(
          `UPDATE sweets SET quantity = quantity - ? WHERE id = ?`,
          [i.cartQuantity, i.id]
        );
      });

      db.run(`DELETE FROM cart_items WHERE userId=?`, [userId]);

      res.json({ id: orderId, status: "PENDING", totalAmount });
    }
  );
});

// GET ORDERS (ADMIN + USER)
app.get("/api/orders", (req, res) => {
  const { userId, role } = req.query;

  let sql = `SELECT * FROM orders`;
  const params = [];

  if (role !== "ADMIN") {
    sql += ` WHERE userId = ?`;
    params.push(userId);
  }

  sql += ` ORDER BY createdAt DESC`;

  db.all(sql, params, (err, orders) => {
    if (!orders || orders.length === 0) return res.json([]);

    let done = 0;

    orders.forEach((o) => {
      db.all(
        `SELECT * FROM order_items WHERE orderId = ?`,
        [o.id],
        (err, items) => {
          o.items = items.map((i) => ({
            ...i,
            cartQuantity: i.quantity,
          }));
          o.shippingAddress = JSON.parse(o.shippingAddress);
          done++;
          if (done === orders.length) res.json(orders);
        }
      );
    });
  });
});

// UPDATE STATUS
app.put("/api/orders/:id/status", (req, res) => {
  const { status } = req.body;

  db.run(
    `UPDATE orders SET status=? WHERE id=?`,
    [status, req.params.id],
    () => {
      db.get(
        `SELECT * FROM orders WHERE id=?`,
        [req.params.id],
        (err, o) => res.json(o)
      );
    }
  );
});

// ==================== START ====================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
