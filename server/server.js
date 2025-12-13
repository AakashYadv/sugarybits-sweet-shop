import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './database.js';

const app = express();
const PORT = 3001;

// Allow requests from the Vite frontend
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- Routes ---

// Root Status Check
app.get('/', (req, res) => {
    res.json({ message: "SugaryBits API is running", status: "OK", timestamp: new Date() });
});

// 1. Auth: Register
app.post('/api/auth/register', (req, res) => {
    try {
        console.log('Register request body:', req.body);
        const { username, email, password, firstName, lastName } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: "Missing required fields (username, email, password)" });
        }

        const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const role = username.toLowerCase().includes('admin') ? 'admin' : 'customer';

        // Fix: SQLite throws "SQLITE_MISUSE" if parameters are undefined. Default to empty string or null.
        const safeFirstName = firstName || '';
        const safeLastName = lastName || '';

        db.run(
            `INSERT INTO users (id, username, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, username, email, password, safeFirstName, safeLastName, role],
            function(err) {
                if (err) {
                    console.error("Registration DB Error:", err.message);
                    // Check for unique constraint violation
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: "Username or Email already exists." });
                    }
                    return res.status(400).json({ error: err.message });
                }
                res.json({ 
                    user: { id, username, email, firstName: safeFirstName, lastName: safeLastName, role },
                    token: `jwt-fake-${id}`
                });
            }
        );
    } catch (error) {
        console.error("Unexpected error in /register:", error);
        res.status(500).json({ error: "Internal Server Error during registration." });
    }
});

// 2. Auth: Login
app.post('/api/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    console.log('Login attempt for:', identifier);
    
    db.get(
        `SELECT * FROM users WHERE username = ? OR email = ?`,
        [identifier, identifier],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) {
                if (identifier === 'admin') {
                    return res.status(404).json({ error: "User not found. Please register first." });
                }
                return res.status(401).json({ error: "Invalid credentials" });
            }
            res.json({
                user: {
                    id: row.id,
                    username: row.username,
                    email: row.email,
                    firstName: row.firstName,
                    lastName: row.lastName,
                    role: row.role
                },
                token: `jwt-fake-${row.id}`
            });
        }
    );
});

// 3. Get User By ID
app.get('/api/users/:id', (req, res) => {
    db.get(`SELECT id, username, email, firstName, lastName, role FROM users WHERE id = ?`, [req.params.id], (err, row) => {
        if(err || !row) return res.status(404).json({error: "User not found"});
        res.json(row);
    });
});

// 4. Sweets: Get All
app.get('/api/sweets', (req, res) => {
    const { search, category, minPrice, maxPrice } = req.query;
    let query = "SELECT * FROM sweets WHERE 1=1";
    const params = [];

    if (search) {
        query += " AND (name LIKE ? OR description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
    }
    if (category && category !== 'All') {
        query += " AND category = ?";
        params.push(category);
    }
    if (minPrice) {
        query += " AND price >= ?";
        params.push(minPrice);
    }
    if (maxPrice) {
        query += " AND price <= ?";
        params.push(maxPrice);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 5. Sweets: Add (Admin)
app.post('/api/sweets', (req, res) => {
    const { name, category, description, price, quantity, imageUrl } = req.body;
    const id = Date.now().toString();
    db.run(
        `INSERT INTO sweets VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, category, description, price, quantity, imageUrl],
        function(err) {
            if(err) return res.status(500).json({error: err.message});
            res.json({ id, name, category, description, price, quantity, imageUrl });
        }
    );
});

// 6. Sweets: Update (Admin)
app.put('/api/sweets/:id', (req, res) => {
    const { name, category, description, price, quantity, imageUrl } = req.body;
    db.run(
        `UPDATE sweets SET name=?, category=?, description=?, price=?, quantity=?, imageUrl=? WHERE id=?`,
        [name, category, description, price, quantity, imageUrl, req.params.id],
        function(err) {
            if(err) return res.status(500).json({error: err.message});
            res.json(req.body);
        }
    );
});

// 7. Sweets: Restock
app.post('/api/sweets/:id/restock', (req, res) => {
    const { amount } = req.body;
    db.run(`UPDATE sweets SET quantity = quantity + ? WHERE id = ?`, [amount, req.params.id], function(err) {
        if(err) return res.status(500).json({error: err.message});
        
        db.get(`SELECT * FROM sweets WHERE id = ?`, [req.params.id], (err, row) => {
            res.json(row);
        });
    });
});

// 8. Sweets: Delete
app.delete('/api/sweets/:id', (req, res) => {
    db.run(`DELETE FROM sweets WHERE id = ?`, [req.params.id], (err) => {
        if(err) return res.status(500).json({error: err.message});
        res.json({ success: true });
    });
});

// 9. Cart: Get
app.get('/api/cart/:userId', (req, res) => {
    db.all(
        `SELECT c.quantity as cartQuantity, s.* 
         FROM cart_items c 
         JOIN sweets s ON c.sweetId = s.id 
         WHERE c.userId = ?`,
        [req.params.userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// 10. Cart: Add/Update
app.post('/api/cart/:userId', (req, res) => {
    const { sweetId } = req.body;
    const userId = req.params.userId;

    db.get(`SELECT quantity FROM sweets WHERE id = ?`, [sweetId], (err, sweet) => {
        if (!sweet || sweet.quantity < 1) return res.status(400).json({error: "Out of stock"});

        db.get(`SELECT quantity FROM cart_items WHERE userId = ? AND sweetId = ?`, [userId, sweetId], (err, row) => {
            if (row) {
                if (row.quantity + 1 > sweet.quantity) return res.status(400).json({error: "Insufficient stock"});
                db.run(`UPDATE cart_items SET quantity = quantity + 1 WHERE userId = ? AND sweetId = ?`, [userId, sweetId], (err) => {
                    if (err) return res.status(500).json({error: err.message});
                    fetchCart(userId, res);
                });
            } else {
                db.run(`INSERT INTO cart_items VALUES (?, ?, 1)`, [userId, sweetId], (err) => {
                    if (err) return res.status(500).json({error: err.message});
                    fetchCart(userId, res);
                });
            }
        });
    });
});

// 11. Cart: Update Quantity
app.put('/api/cart/:userId/item/:itemId', (req, res) => {
    const { quantity } = req.body;
    const { userId, itemId } = req.params;

    if (quantity <= 0) {
        db.run(`DELETE FROM cart_items WHERE userId = ? AND sweetId = ?`, [userId, itemId], (err) => {
            fetchCart(userId, res);
        });
    } else {
        db.get(`SELECT quantity FROM sweets WHERE id = ?`, [itemId], (err, sweet) => {
            if (sweet.quantity < quantity) return res.status(400).json({error: "Insufficient stock"});
            db.run(`UPDATE cart_items SET quantity = ? WHERE userId = ? AND sweetId = ?`, [quantity, userId, itemId], (err) => {
                fetchCart(userId, res);
            });
        });
    }
});

// 12. Cart: Clear
app.delete('/api/cart/:userId', (req, res) => {
    db.run(`DELETE FROM cart_items WHERE userId = ?`, [req.params.userId], (err) => {
        res.json({success: true});
    });
});

function fetchCart(userId, res) {
    db.all(
        `SELECT c.quantity as cartQuantity, s.* 
         FROM cart_items c 
         JOIN sweets s ON c.sweetId = s.id 
         WHERE c.userId = ?`,
        [userId],
        (err, rows) => {
            res.json(rows);
        }
    );
}

// 13. Wishlist
app.get('/api/wishlist/:userId', (req, res) => {
    db.all(`SELECT sweetId FROM wishlists WHERE userId = ?`, [req.params.userId], (err, rows) => {
        res.json(rows.map(r => r.sweetId));
    });
});

app.post('/api/wishlist/:userId', (req, res) => {
    const { sweetId } = req.body;
    db.get(`SELECT * FROM wishlists WHERE userId = ? AND sweetId = ?`, [req.params.userId, sweetId], (err, row) => {
        if (row) {
            db.run(`DELETE FROM wishlists WHERE userId = ? AND sweetId = ?`, [req.params.userId, sweetId]);
        } else {
            db.run(`INSERT INTO wishlists VALUES (?, ?)`, [req.params.userId, sweetId]);
        }
        setTimeout(() => {
             db.all(`SELECT sweetId FROM wishlists WHERE userId = ?`, [req.params.userId], (err, rows) => {
                res.json(rows.map(r => r.sweetId));
            });
        }, 100);
    });
});

// 14. Orders: Create
app.post('/api/orders', (req, res) => {
    const { userId, username, items, totalAmount, shippingAddress } = req.body;
    const orderId = `ORD-${Date.now()}`;
    const createdAt = Date.now();

    db.serialize(() => {
        db.run(
            `INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [orderId, userId, username, totalAmount, JSON.stringify(shippingAddress), 'Pending', createdAt]
        );

        items.forEach(item => {
            db.run(`UPDATE sweets SET quantity = quantity - ? WHERE id = ?`, [item.cartQuantity, item.id]);
            db.run(`INSERT INTO order_items VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                [orderId, item.id, item.name, item.price, item.cartQuantity, item.imageUrl, item.category, item.description]
            );
        });

        db.run(`DELETE FROM cart_items WHERE userId = ?`, [userId]);

        res.json({ id: orderId, status: 'Pending', totalAmount });
    });
});

// 15. Orders: Get
app.get('/api/orders', (req, res) => {
    const { userId, role } = req.query;
    let query = `SELECT * FROM orders`;
    const params = [];

    if (role !== 'admin') {
        query += ` WHERE userId = ?`;
        params.push(userId);
    }
    
    query += ` ORDER BY createdAt DESC`;

    db.all(query, params, (err, orders) => {
        if(err) return res.status(500).json([]);
        if(orders.length === 0) return res.json([]);

        let processed = 0;
        orders.forEach(order => {
            db.all(`SELECT * FROM order_items WHERE orderId = ?`, [order.id], (err, items) => {
                order.items = items.map(i => ({...i, cartQuantity: i.quantity})); 
                order.shippingAddress = JSON.parse(order.shippingAddress);
                processed++;
                if (processed === orders.length) {
                    res.json(orders);
                }
            });
        });
    });
});

// 16. Orders: Update Status
app.put('/api/orders/:id/status', (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get(`SELECT * FROM orders WHERE id = ?`, [req.params.id], (err, order) => {
             if(order) {
                 db.all(`SELECT * FROM order_items WHERE orderId = ?`, [order.id], (err, items) => {
                    order.items = items.map(i => ({...i, cartQuantity: i.quantity}));
                    order.shippingAddress = JSON.parse(order.shippingAddress);
                    res.json(order);
                 });
             } else {
                 res.status(404).json({error: "Not found"});
             }
        });
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Global Server Error:", err.stack);
    res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});