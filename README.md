# StoreRate — Store Rating & Discovery Platform

StoreRate is a full-stack web application designed for discovering, rating, and managing local businesses and retail stores. It features role-based access control for **Customers**, **Store Owners**, and **Administrators**, interactive rating systems, categorized store exploration, storefront image uploads, and dashboard analytics.

---

## 🌟 Key Features

### 🏪 Store Discovery & Exploration
- **Cinematic Hero Slider**: Highlights top-rated approved stores with smooth auto-sliding, hover pauses, touch swiping, and direct rating links.
- **Top 10 Stores Section**: Curated leaderboard ranking stores with IMDb-inspired gold badges, quick rating actions, and detailed metadata.
- **Categorized Store Directory**: Visual category cards and horizontal filter pills (`Food & Beverage`, `Cafe`, `Electronics`, `Grocery`, `Health & Fitness`, `Music & Entertainment`, `Sports & Outdoors`, etc.) with dedicated routing (`/category/:category`).
- **Live Search & URL Sync**: Real-time store search with debounced typing and deep linking via URL query parameters (`/search?query=...&category=...`).

### ⭐ Interactive Community Rating System
- **1 to 5 Star Ratings**: Authenticated customers can submit and modify their ratings directly from store cards or store detail pages.
- **Weighted Average Calculation**: Real-time calculation of overall store rating score and total review counts.
- **Role Permissions**: Store owners cannot rate their own stores or submit duplicate reviews; unauthenticated visitors are prompted to log in.

### 🛡️ Role-Based Access Control (RBAC)
- **Customer (USER)**: Browse stores, search, filter by category, submit ratings, and manage personal profile & avatar.
- **Store Owner (STORE_OWNER)**: Submit store registration requests with storefront photos, track owned stores, view customer ratings table, and manage account details.
- **Administrator (ADMIN)**: View system-wide metrics (total users, approved stores, pending stores, submitted ratings), moderate store submissions (Approve / Reject), and manage user accounts and role assignments.

### 📸 Image Upload & Asset Management
- **Storefront Images**: Drag-and-drop file uploader (JPEG, PNG, WebP ≤ 2MB) for store owners.
- **Profile Photos**: Avatar photo upload with instant preview and cross-origin static serving for all roles.
- **Curated Fallbacks**: SVG placeholder fallbacks matching the platform's gold-and-neutral design palette.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) (SPA)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **State & HTTP**: Context API, [Axios](https://axios-http.com/)
- **Design System**: Pure white canvas (`#FFFFFF`), Brand Gold (`#D4AF37`), Dark Slate typography (`#0F172A`)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MySQL](https://www.mysql.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **File Uploads**: [Multer](https://github.com/expressjs/multer) with local disk storage
- **Security**: [Helmet](https://helmetjs.github.io/) (configured with cross-origin resource sharing for static uploads), [CORS](https://github.com/expressjs/cors)

---

## 📁 Project Structure

```
roxiller/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma             # Database models (User, Store, Rating)
│   │   ├── migrations/               # Prisma migration history
│   │   ├── seed.js                   # Initial users and stores seeder
│   │   └── populateStoreImages.js    # Storefront image seeder
│   ├── src/
│   │   ├── controllers/              # Route controllers (auth, stores, admin, owner)
│   │   ├── middleware/               # Auth, role authorization, upload, errors
│   │   ├── routes/                   # Express route definitions
│   │   ├── utils/                    # Password validation, API response helpers
│   │   └── app.js                    # Express app configuration & static middleware
│   ├── uploads/                      # Uploaded assets
│   │   ├── profiles/                 # User profile photos
│   │   └── stores/                   # Storefront photos
│   ├── server.js                     # Backend entry point (Port 5000)
│   ├── test_phase2.js                # Automated backend test suite
│   ├── test_phase5.js                # Extended integration test suite
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                      # Axios API clients (auth, store, admin, owner)
│   │   ├── components/
│   │   │   ├── admin/                # UserTable, StoreModerationTable, MetricTile
│   │   │   ├── common/               # Navbar, LeftDrawerNavbar, StarRating, Uploader
│   │   │   ├── owner/                # CustomerRatingTable, AddStoreModal, StoreSelector
│   │   │   └── stores/               # HeroSlider, Top10Stores, CategoryPills, StoreCard
│   │   ├── context/                  # AuthContext (login, logout, session persistence)
│   │   ├── pages/                    # StoreCatalog, StoreDetail, SearchPage, Profile, etc.
│   │   ├── router/                   # AppRouter and ProtectedRoute wrappers
│   │   └── utils/                    # Asset URL resolution & SVG placeholders
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MySQL** running locally (e.g. via MySQL Server or XAMPP)

---

### 2. Environment Configuration

#### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
DATABASE_URL="mysql://root:password@localhost:3306/store_rating_db"
JWT_SECRET="your_actual_strong_random_jwt_secret_key_here"
```
*(Replace `root:password` with your local MySQL credentials and database name)*

#### Frontend (`frontend/.env`)
Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Database Setup & Migrations

In your terminal, navigate to `backend/`:

```powershell
cd backend

# Install dependencies
npm install

# Push schema to MySQL database and generate Prisma Client
npx prisma db push
npx prisma generate

# (Optional) Seed demo users, stores, and ratings
node prisma/seed.js

# (Optional) Populate high-resolution storefront photos
node prisma/populateStoreImages.js
```

---

### 4. Running the Development Servers

#### Terminal 1 — Start the Backend
```powershell
cd backend
npm run dev
```
> Backend runs at `http://localhost:5000`  
> Health check available at `http://localhost:5000/health`

#### Terminal 2 — Start the Frontend
```powershell
cd frontend
npm run dev
```
> Frontend Vite dev server runs at `http://localhost:3000`

---

## 🔑 Default Demo Accounts

If you run the seed script (`node prisma/seed.js`), the following accounts will be available:

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@storerate.io` | `Admin@1234` | Full system overview, moderation, role management |
| **Store Owner** | `owner@storerate.io` | `Owner@1234` | Add stores, view customer ratings table, owner hub |
| **Customer** | `customer@storerate.io` | `User@1234` | Submit 1–5 star ratings, profile management |

---

## 🧪 Automated Testing

Backend integration test suites are available to verify endpoints, validation rules, and business logic:

```powershell
cd backend

# Run Phase 2 verification suite
node test_phase2.js

# Run Phase 5 integration verification suite
node test_phase5.js
```

To verify the production frontend build:

```powershell
cd frontend
npm run build
```

---

## 📜 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new customer account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Yes |
| `PATCH` | `/api/auth/change-password` | Update current user password | Yes |
| `POST` | `/api/auth/profile-photo` | Upload user profile avatar | Yes |
| `GET` | `/api/stores` | List approved stores with filters & sorting | No |
| `GET` | `/api/stores/top-rated` | Get top-rated stores for Hero & Leaderboard | No |
| `GET` | `/api/stores/categories` | Get unique store categories and counts | No |
| `GET` | `/api/stores/search` | Search catalog with pagination | No |
| `GET` | `/api/stores/:id` | Get store details and rating statistics | No |
| `POST` | `/api/stores/:id/rate` | Submit or update store rating (1-5) | Yes (User) |
| `GET` | `/api/owner/stores` | List stores owned by authenticated owner | Yes (Owner) |
| `POST` | `/api/owner/stores` | Submit new store for admin moderation | Yes (Owner) |
| `GET` | `/api/admin/metrics` | System dashboard statistics | Yes (Admin) |
| `GET` | `/api/admin/users` | List all registered users with role filter | Yes (Admin) |
| `PATCH` | `/api/admin/users/:id/role` | Update user role | Yes (Admin) |
| `PATCH` | `/api/admin/stores/:id/status`| Moderate store (`APPROVED` / `REJECTED`)| Yes (Admin) |

---

## 📄 License
This project is proprietary and intended for technical assessment and demonstration purposes.
