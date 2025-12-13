# 🍬 SugaryBits Sweet Shop Management System

> A full-stack E-commerce solution for managing a sweet shop inventory, featuring user authentication, role-based access control, and a persistent SQLite database.

## 📖 Overview

SugaryBits is a modern Single Page Application (SPA) designed to demonstrate a robust full-stack architecture. It allows customers to browse sweets, manage a shopping cart, and place orders, while administrators can manage inventory and order fulfillment.

The project implements a **TDD (Test-Driven Development)** mindset with a clean separation of concerns between the React frontend and the Node.js/Express backend.

---

## 🚀 Features

### 👤 User Features (Customer)
*   **Authentication**: Secure Registration and Login.
*   **Browse Products**: View all sweets with search and filtering (Category, Price Range).
*   **Shopping Cart**: Add items, update quantities, and remove items with real-time stock validation.
*   **Wishlist**: Save favorite items for later.
*   **Checkout**: Simulated payment process with address validation.
*   **Order History**: View past orders and their current status.
*   **Dark Mode**: Fully responsive UI with toggleable dark theme.

### 🛡️ Admin Features
*   **Inventory Management**: Add, Edit, and Delete sweets.
*   **Stock Control**: Restock items directly from the dashboard.
*   **Order Management**: View all customer orders and update their status (Pending → Shipped → Delivered).
*   **Dashboard**: Quick view of stock levels and product details.

---

## 🛠️ Tech Stack

### Frontend
*   **Framework**: [React](https://react.dev/) (v18+) with [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: FontAwesome

### Backend
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Database**: [SQLite3](https://www.sqlite.org/) (Persistent file-based DB)
*   **API**: RESTful architecture

---

## 🏃‍♂️ Installation & Setup

Follow these steps to get the project running locally.

### Prerequisites
*   Node.js (v16 or higher)
*   npm (v8 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/sugarybits-sweet-shop.git
cd sugarybits-sweet-shop
```

### 2. Install Dependencies
Install dependencies for both the root package (frontend) and the server.
```bash
npm install
```

### 3. Start the Application
You need to run the Backend and the Frontend simultaneously.

**Option A: Separate Terminals (Recommended)**

*Terminal 1 (Backend):*
```bash
# This starts the Express server on port 3001 and initializes the SQLite DB
npm run server
```

*Terminal 2 (Frontend):*
```bash
# This starts the Vite dev server on port 5173
npm run dev
```

**Option B: Concurrent (If configured)**
If you have `concurrently` installed or a similar script:
```bash
npm run start:all
```

### 4. Access the App
Open your browser and navigate to:
`http://localhost:5173`

> **Note:** The database file `server/sugarybits.db` will be created automatically upon the first run of the server.

---

## 📂 Project Structure

```
sugarybits-sweet-shop/
├── src/                  # React Frontend Source
│   ├── components/       # Reusable UI components (SweetCard, CartView, etc.)
│   ├── services/         # API Service layer (fetches to backend)
│   ├── types.ts          # TypeScript interfaces
│   ├── App.tsx           # Main Application component
│   └── main.tsx          # Entry point
├── server/               # Node.js Backend Source
│   ├── server.js         # Express App & Route Definitions
│   ├── database.js       # SQLite connection & Schema initialization
│   └── sugarybits.db     # Generated Database file (gitignored)
├── public/               # Static assets
├── index.html            # HTML entry point
├── vite.config.ts        # Vite configuration (includes API proxy)
└── package.json          # Project dependencies
```

---

## 🔌 API Endpoints

The backend runs on `http://localhost:3001` and serves the following endpoints:

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| **Auth** | | | |
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login user | Public |
| **Sweets** | | | |
| `GET` | `/api/sweets` | Get all sweets (with filters) | Public |
| `POST` | `/api/sweets` | Add a new sweet | Admin |
| `PUT` | `/api/sweets/:id` | Update sweet details | Admin |
| `DELETE` | `/api/sweets/:id` | Delete a sweet | Admin |
| `POST` | `/api/sweets/:id/restock`| Increase quantity | Admin |
| **Cart & Orders** | | | |
| `GET` | `/api/cart/:userId` | Get user's cart | User |
| `POST` | `/api/cart/:userId` | Add item to cart | User |
| `POST` | `/api/orders` | Create a new order | User |
| `GET` | `/api/orders` | Get orders (User: own, Admin: all)| Both |

---

## 🤖 My AI Usage

**AI Tools Used:**
*   **Google Gemini 2.0 Flash**: Primary coding assistant and architectural advisor.

**How I used them:**

1.  **Boilerplate Generation**:
    *   *Prompt*: "Create a RESTful API structure for a sweet shop using Express and SQLite."
    *   *Result*: Gemini generated the initial `server.js` and `database.js` files, setting up the connection and basic CRUD routes, saving approximately 2 hours of setup time.

2.  **Frontend Component Design**:
    *   *Prompt*: "Design a responsive Product Card component using Tailwind CSS that shows stock levels and an 'Add to Cart' button."
    *   *Result*: The AI provided the `SweetCard.tsx` component with hover effects, badges for "Low Stock", and responsive layout classes.

3.  **Debugging & Problem Solving**:
    *   *Issue*: I encountered a `SQLITE_MISUSE` error when registering a user without a last name.
    *   *AI Assistance*: I pasted the error log into Gemini. It identified that the SQL query expected a value but received `undefined`. It suggested sanitizing the inputs to default to empty strings (`safeFirstName || ''`), which resolved the crash.

4.  **Data Seeding**:
    *   Used AI to generate the initial JSON list of dummy candy products to populate the database for testing purposes.

**Reflection:**
Using AI tools significantly streamlined the development of this full-stack application. It acted as a "pair programmer," handling the repetitive syntax of SQL queries and CSS utility classes, allowing me to focus on the business logic (e.g., ensuring stock is deducted only after a successful order). However, I learned that manual verification is crucial, especially for backend error handling, as AI generated code sometimes assumes "happy paths" (perfect inputs) by default.

---

## 📄 License

© 2025 SugaryBits Inc. All rights reserved.

