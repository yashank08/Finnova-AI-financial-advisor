# FinNova Backend API

> Smart Finance. Smarter Future. — Production-ready FastAPI backend.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | FastAPI 0.110+ |
| Database | MongoDB (Motor async driver) |
| Authentication | JWT (PyJWT) + bcrypt |
| Validation | Pydantic v2 |
| AI/ML | scikit-learn LinearRegression |
| Python | 3.12+ |

## Project Structure

```
backend/
├── app/
│   ├── main.py                  # App factory, routers, middleware
│   ├── core/
│   │   ├── config.py            # Settings from .env
│   │   ├── database.py          # Motor connection + in-memory fallback
│   │   └── security.py          # JWT + bcrypt helpers
│   ├── dependencies/
│   │   └── auth.py              # get_current_user dependency
│   ├── models/
│   │   └── user.py              # User Pydantic models
│   ├── schemas/
│   │   ├── transaction.py       # Transaction request/response schemas
│   │   ├── budget.py            # Budget schemas
│   │   ├── dashboard.py         # Dashboard response schema
│   │   ├── report.py            # Report schemas (Chart.js ready)
│   │   └── ai.py                # AI response schemas
│   ├── routers/
│   │   ├── auth.py              # POST /api/auth/*
│   │   ├── user.py              # GET /api/users/me, PUT /api/users/profile
│   │   ├── transactions.py      # CRUD /api/transactions
│   │   ├── dashboard.py         # GET /api/dashboard
│   │   ├── reports.py           # GET /api/reports/*
│   │   └── ai.py                # GET /api/ai/*
│   ├── services/
│   │   ├── transaction_service.py
│   │   ├── budget_service.py
│   │   ├── dashboard_service.py
│   │   ├── report_service.py
│   │   └── ai_service.py
│   ├── middleware/
│   │   └── error_handler.py     # Global exception handlers
│   └── ml/
│       └── predictor.py         # LinearRegression + recommendations
├── requirements.txt
├── .env.example
└── README.md
```

## Quick Start

### 1. Install dependencies

```powershell
cd backend
pip install -r requirements.txt
```

### 2. Configure environment

```powershell
copy .env.example .env
# Edit .env with your MongoDB URL and secret key
```

### 3. Run the server

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Open API docs

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT token |
| POST | `/api/auth/forgot-password` | Request reset token |
| POST | `/api/auth/reset-password` | Reset password with token |

### User / Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/profile` | Update name, nationality, currency |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions` | List with pagination + filters |
| GET | `/api/transactions/{id}` | Get single transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |

**Query params for GET list:**
- `page`, `limit` — pagination
- `search` — description search
- `type` — `Income` or `Expense`
- `category` — filter by category
- `date_from`, `date_to` — date range (ISO format)
- `amount_min`, `amount_max` — amount range

**Valid categories:** Income, Food, Transport, Utilities, Entertainment, Healthcare, Education, Investment, Shopping, Rent, Insurance, Travel, Gifts, Freelance, Other

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Full financial dashboard summary |

**Response includes:** totalIncome, totalExpenses, totalSavings, monthlyBudget, remainingBudget, latestTransactions, expenseCategories, monthlyAnalytics

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/monthly` | Monthly income/expense/savings |
| GET | `/api/reports/category` | Expense by category |
| GET | `/api/reports/yearly` | Year-over-year breakdown |

All responses include Chart.js-ready `labels` + `data` arrays.

### AI Insights

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/summary` | Spending summary with savings rate |
| GET | `/api/ai/predict` | Next month ML expense prediction |
| GET | `/api/ai/recommendations` | Personalised financial recommendations |

---

## Database Collections

### users
```json
{
  "_id": "ObjectId",
  "fullName": "string",
  "email": "string",
  "password": "bcrypt hash",
  "nationality": "string",
  "preferredCurrency": "INR",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### transactions
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "type": "Income | Expense",
  "category": "string",
  "amount": 1500.00,
  "description": "string",
  "date": "datetime",
  "createdAt": "datetime"
}
```

### budgets
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "monthlyBudget": 50000.00,
  "spent": 12000.00,
  "remaining": 38000.00,
  "month": "2026-07"
}
```

### predictions
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "predictionMonth": "2026-08",
  "predictedExpense": 18500.00,
  "aiRecommendation": "string",
  "createdAt": "datetime"
}
```

---

## AI / ML Module

The `ml/predictor.py` module uses **scikit-learn LinearRegression** to:

1. **Train** on the user's historical monthly expense totals (ordered oldest → newest)
2. **Predict** next month's total expenses
3. **Detect** the highest spending category
4. **Generate** personalised recommendations based on:
   - Savings rate (< 10%, 10–20%, > 20%)
   - Top spending category alert
   - Expense trend (increasing/stable/decreasing)
   - Nationality-specific tax tips (Section 80C for Indian users)
   - Emergency fund health check

> Minimum 2 months of data required for ML regression. Single-month users receive average-based predictions.

---

## MongoDB vs In-Memory

The server automatically falls back to an **in-memory store** if MongoDB is unavailable (e.g., local dev without MongoDB installed). This means the backend works **out of the box** even without a MongoDB instance.

> ⚠️ In-memory data is lost when the server restarts. Install MongoDB for persistent storage.

---

## Security

- All `/api/transactions`, `/api/dashboard`, `/api/reports`, `/api/ai`, and `/api/users/*` routes require a valid `Authorization: Bearer <token>` header.
- Passwords are hashed using **bcrypt** (12 rounds).
- JWT tokens expire after 24 hours (or 30 days if `rememberMe: true`).
- Input validation via Pydantic v2 on all request bodies.
