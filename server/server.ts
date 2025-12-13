import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import db from './database.ts';

const app = express();
const PORT = process.env.PORT || 3001; // Use env PORT for deployment

// Allow requests from anywhere (for deployment simplicity) or specific domains
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Middleware to log requests
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- Routes ---

// Root Status Check
app.get('/', (req: Request, res: Response) => {
    res.json({ message: "SugaryBits API is running", status: "OK", timestamp: new Date() });
});

// 1. Auth: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
    try {
        console.log('Register request body:', req.body);
        const { username, email, password, firstName, lastName } = req.body;
        
        if (!username || !email || !password) {
            res.status(400).json({ error: "Missing required fields (username, email, password)" });
            return;
        }

        const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const role = username.toLowerCase().includes('admin') ? 'admin' : 'customer';

        // Fix: SQLite throws "SQLITE_MISUSE" if parameters are undefined. Default to empty string or null.
        const safeFirstName = firstName || '';
        const safeLastName = lastName || '';

        db.run(
            `INSERT INTO users (id, username, email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, username, email, password, safeFirstName, safeLastName, role],
            function(this: any, err: Error | null) {
                if (err) {
                    console.error("Registration DB Error:", err.message);
                    // Check for unique constraint violation
                    if (err.message.includes('UNIQUE constraint failed')) {
                         res.status(400).json({ error: "Username or Email already exists." });
                         return;
                    }
                     res.status(400).json({ error: err.message });
                     return;
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
app.post('/api/auth/login', (req: Request, res: Response) => {
    const { identifier, password } = req.body;
    console.log('Login attempt for:', identifier);
    
    db.get(
        `SELECT * FROM users WHERE username = ? OR email = ?`,
        [identifier, identifier],
        (err: Error | null, row: any) => {
            if (err) {
                 res.status(500).json({ error: err.message });
                 return;
            }
            if (!row) {
                if (identifier === 'admin') {
                     res.status(404).json({ error: "User not found. Please register first." });
                     return;
                }
                 res.status(401).json({ error: "Invalid credentials" });
                 return;
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
app.get('/api/users/:id', (req: Request, res: Response) => {
    db.get(`SELECT id, username, email, firstName, lastName, role FROM users WHERE id = ?`, [req.params.id], (err: Error | null, row: any) => {
        if(err || !row) {
             res.status(404).json({error: "User not found"});
             return;
        }
        res.json(row);
    });
});

// 4. Sweets: Get All
app.get('/api/sweets', (req: Request, res: Response) => {
    const { search, category, minPrice, maxPrice } = req.query;
    let query = "SELECT * FROM sweets WHERE 1=1";
    const params: any[] = [];

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

    db.all(query, params, (err: Error | null, rows: any[]) => {
        if (err) {
             res.status(500).json({ error: err.message });
             return;
        }
        res.json(rows);
    });
});

// 5. Sweets: Add (Admin)
app.post('/api/sweets', (req: Request, res: Response) => {
    const { name, category, description, price, quantity, imageUrl } = req.body;
    const id = Date.now().toString();
    db.run(
        `INSERT INTO sweets VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, category, description, price, quantity, imageUrl],
        function(err: Error | null) {
            if(err) {
                 res.status(500).json({error: err.message});
                 return;
            }
            res.json({ id, name, category, description, price, quantity, imageUrl });
        }
    );
});

// 6. Sweets: Update (Admin)
app.put('/api/sweets/:id', (req: Request, res: Response) => {
    const { name, category, description, price, quantity, imageUrl } = req.body;
    db.run(
        `UPDATE sweets SET name=?, category=?, description=?, price=?, quantity=?, imageUrl=? WHERE id=?`,
        [name, category, description, price, quantity, imageUrl, req.params.id],
        function(err: Error | null) {
            if(err) {
                 res.status(500).json({error: err.message});
                 return;
            }
            res.json(req.body);
        }
    );
});

// 7. Sweets: Restock
app.post('/api/sweets/:id/restock', (req: Request, res: Response) => {
    const { amount } = req.body;
    db.run(`UPDATE sweets SET quantity = quantity + ? WHERE id = ?`, [amount, req.params.id], function(err: Error | null) {
        if(err) {
             res.status(500).json({error: err.message});
             return;
        }
        
        db.get(`SELECT * FROM sweets WHERE id = ?`, [req.params.id], (err: Error | null, row: any) => {
            res.json(row);
        });
    });
});

// 8. Sweets: Delete
app.delete('/api/sweets/:id', (req: Request, res: Response) => {
    db.run(`DELETE FROM sweets WHERE id = ?`, [req.params.id], (err: Error | null) => {
        if(err) {
             res.status(500).json({error: err.message});
             return;
        }
        res.json({ success: true });
    });
});

// 9. Cart: Get
app.get('/api/cart/:userId', (req: Request, res: Response) => {
    db.all(
        `SELECT c.quantity as cartQuantity, s.* 
         FROM cart_items c 
         JOIN sweets s ON c.sweetId = s.id 
         WHERE c.userId = ?`,
        [req.params.userId],
        (err: Error | null, rows: any[]) => {
            if (err) {
                 res.status(500).json({ error: err.message });
                 return;
            }
            res.json(rows);
        }
    );
});

// 10. Cart: Add/Update
app.post('/api/cart/:userId', (req: Request, res: Response) => {
    const { sweetId } = req.body;
    const userId = req.params.userId;

    db.get(`SELECT quantity FROM sweets WHERE id = ?`, [sweetId], (err: Error | null, sweet: any) => {
        if (!sweet || sweet.quantity < 1) {
             res.status(400).json({error: "Out of stock"});
             return;
        }

        db.get(`SELECT quantity FROM cart_items WHERE userId = ? AND sweetId = ?`, [userId, sweetId], (err: Error | null, row: any) => {
            if (row) {
                if (row.quantity + 1 > sweet.quantity) {
                     res.status(400).json({error: "Insufficient stock"});
                     return;
                }
                db.run(`UPDATE cart_items SET quantity = quantity + 1 WHERE userId = ? AND sweetId = ?`, [userId, sweetId], (err: Error | null) => {
                    if (err) {
                         res.status(500).json({error: err.message});
                         return;
                    }
                    fetchCart(userId, res);
                });
            } else {
                db.run(`INSERT INTO cart_items VALUES (?, ?, 1)`, [userId, sweetId], (err: Error | null) => {
                    if (err) {
                         res.status(500).json({error: err.message});
                         return;
                    }
                    fetchCart(userId, res);
                });
            }
        });
    });
});

// 11. Cart: Update Quantity
app.put('/api/cart/:userId/item/:itemId', (req: Request, res: Response) => {
    const { quantity } = req.body;
    const { userId, itemId } = req.params;

    if (quantity <= 0) {
        db.run(`DELETE FROM cart_items WHERE userId = ? AND sweetId = ?`, [userId, itemId], (err: Error | null) => {
            fetchCart(userId, res);
        });
    } else {
        db.get(`SELECT quantity FROM sweets WHERE id = ?`, [itemId], (err: Error | null, sweet: any) => {
            if (sweet.quantity < quantity) {
                 res.status(400).json({error: "Insufficient stock"});
                 return;
            }
            db.run(`UPDATE cart_items SET quantity = ? WHERE userId = ? AND sweetId = ?`, [quantity, userId, itemId], (err: Error | null) => {
                fetchCart(userId, res);
            });
        });
    }
});

// 12. Cart: Clear
app.delete('/api/cart/:userId', (req: Request, res: Response) => {
    db.run(`DELETE FROM cart_items WHERE userId = ?`, [req.params.userId], (err: Error | null) => {
        res.json({success: true});
    });
});

function fetchCart(userId: string, res: Response) {
    db.all(
        `SELECT c.quantity as cartQuantity, s.* 
         FROM cart_items c 
         JOIN sweets s ON c.sweetId = s.id 
         WHERE c.userId = ?`,
        [userId],
        (err: Error | null, rows: any[]) => {
            res.json(rows);
        }
    );
}

// 13. Wishlist
app.get('/api/wishlist/:userId', (req: Request, res: Response) => {
    db.all(`SELECT sweetId FROM wishlists WHERE userId = ?`, [req.params.userId], (err: Error | null, rows: any[]) => {
        res.json(rows.map(r => r.sweetId));
    });
});

app.post('/api/wishlist/:userId', (req: Request, res: Response) => {
    const { sweetId } = req.body;
    db.get(`SELECT * FROM wishlists WHERE userId = ? AND sweetId = ?`, [req.params.userId, sweetId], (err: Error | null, row: any) => {
        if (row) {
            db.run(`DELETE FROM wishlists WHERE userId = ? AND sweetId = ?`, [req.params.userId, sweetId]);
        } else {
            db.run(`INSERT INTO wishlists VALUES (?, ?)`, [req.params.userId, sweetId]);
        }
        setTimeout(() => {
             db.all(`SELECT sweetId FROM wishlists WHERE userId = ?`, [req.params.userId], (err: Error | null, rows: any[]) => {
                res.json(rows.map(r => r.sweetId));
            });
        }, 100);
    });
});

// 14. Orders: Create
app.post('/api/orders', (req: Request, res: Response) => {
    const { userId, username, items, totalAmount, shippingAddress } = req.body;
    const orderId = `ORD-${Date.now()}`;
    const createdAt = Date.now();

    db.serialize(() => {
        db.run(
            `INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [orderId, userId, username, totalAmount, JSON.stringify(shippingAddress), 'Pending', createdAt]
        );

        items.forEach((item: any) => {
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
app.get('/api/orders', (req: Request, res: Response) => {
    const { userId, role } = req.query;
    let query = `SELECT * FROM orders`;
    const params: any[] = [];

    if (role !== 'admin') {
        query += ` WHERE userId = ?`;
        params.push(userId);
    }
    
    query += ` ORDER BY createdAt DESC`;

    db.all(query, params, (err: Error | null, orders: any[]) => {
        if(err) {
             res.status(500).json([]);
             return;
        }
        if(orders.length === 0) {
             res.json([]);
             return;
        }

        let processed = 0;
        orders.forEach(order => {
            db.all(`SELECT * FROM order_items WHERE orderId = ?`, [order.id], (err: Error | null, items: any[]) => {
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
app.put('/api/orders/:id/status', (req: Request, res: Response) => {
    const { status } = req.body;
    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, req.params.id], function(err: Error | null) {
        if (err) {
             res.status(500).json({ error: err.message });
             return;
        }
        db.get(`SELECT * FROM orders WHERE id = ?`, [req.params.id], (err: Error | null, order: any) => {
             if(order) {
                 db.all(`SELECT * FROM order_items WHERE orderId = ?`, [order.id], (err: Error | null, items: any[]) => {
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
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("Global Server Error:", err.stack);
    res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
