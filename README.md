# Bill Gates — Payment Management System for Small Businesses

**Team Name:** Bill Gates
**Proposed Level of Achievement:** Project Gemini
**Milestone:** 1 — Technical Proof of Concept

---

## Table of Contents

1. [Motivation](#motivation)
2. [Aim](#aim)
3. [Features and Design of Application](#features-and-design-of-application)
4. [Development Plan](#development-plan)
5. [Documentation of System](#documentation-of-system)

---

## Motivation

Many small businesses — tuition centres, fitness coaches, music teachers, freelancers, and more — spend significant time each month on repetitive payment-related tasks. This includes manually checking transactions to see who has paid, calculating fees based on service usage, sending individual payment reminders, and issuing receipts by hand.

We were inspired by a friend who runs a tuition business and faces exactly these challenges. Seeing how time-consuming and error-prone this process is, especially as the number of customers grows, we decided to build a system that automates these administrative tasks so that business owners can focus on what they do best.

---

## Aim

Bill Gates is a payment management web application designed for small businesses that collect recurring payments from customers. The system aims to:

- Provide a centralised dashboard to track all customers and their payment statuses
- Automatically calculate fees and flag overdue payments
- Send automated WhatsApp reminders to customers before and after payment due dates
- Verify payments via Stripe/PayNow and automatically update payment status
- Generate and send PDF receipts upon payment confirmation

By streamlining these administrative tasks, Bill Gates seeks to reduce manual workload, improve accuracy, and scale easily as a business grows.

---

## Features and Design of Application

### User Stories

1. As a business owner, I want to add, edit, and remove customers and set their monthly fees and due dates, so that my customer records are always up to date.
2. As a business owner, I want to see a clear dashboard showing which customers have paid and which have not, so that I can monitor payment status at a glance.
3. As a business owner, I want the system to automatically send WhatsApp reminders to customers before the due date, so that I do not need to follow up individually.
4. As a business owner, I want the system to automatically verify PayNow payments and update the dashboard, so that I do not need to manually check bank transactions.
5. As a customer, I want to automatically receive a PDF receipt after payment confirmation, so that I have proof of payment.
6. As a business owner, I want overdue customers to be automatically flagged and sent follow-up reminders, so that outstanding payments are not forgotten.

---

### Features

| # | Feature | Type | Status |
|---|---------|------|--------|
| 1 | **Customer & Fee Management** — Add, edit, delete customers; set monthly fees and payment due dates via a centralised dashboard | Core | ✅ Done |
| 2 | **Automated WhatsApp Reminders** — System automatically sends WhatsApp messages to customers before payment is due, including amount owed and payment details | Core | Upcoming |
| 3 | **Payment Integration** — Customers pay via PayNow; system detects and verifies payment via Stripe webhooks and auto-updates dashboard | Core | Upcoming |
| 4 | **Auto-Generated PDF Receipts** — Upon payment confirmation, a PDF receipt is generated and sent to the customer via WhatsApp | Extension | Upcoming |
| 5 | **Overdue Payment Escalation** — If payment is not made by the due date, system sends follow-up reminders every X days and flags the customer as overdue | Extension | Upcoming |
| 6 | **Monthly Summary Report** — At end of each month, admin receives an automated summary of total collected, outstanding payments, and number of customers paid | Extension | Upcoming |

---

### Application Design

**Tech Stack**

| Technology | Role |
|---|---|
| React (Vite) | Frontend — all UI and user interactions |
| Supabase | Database (PostgreSQL) and admin authentication |
| Twilio | WhatsApp messaging for reminders and receipts |
| Stripe | Payment processing and PayNow webhook integration |
| GitHub | Version control and collaboration |
| VS Code | Development environment |

**Current UI (Milestone 1)**

The app currently consists of:

- **Login Page** — Admin logs in securely via Supabase Auth (email + password). Session persists on page refresh.
- **Customer Dashboard** — Displays all customers in a table with their name, contact person, phone number, monthly fee, and payment day. Admin can delete customers.
- **Add Customer Form** — Admin fills in customer details and submits to add them to the database instantly.

**Database Schema (Supabase)**

`customers` table:

| Column | Type | Description |
|---|---|---|
| id | int8 | Auto-generated unique ID |
| name | text | Business or customer name |
| contact_name | text | Name of contact person |
| contact_phone | text | WhatsApp phone number |
| monthly_fee | numeric | Monthly payment amount |
| payment_day | int4 | Day of month payment is due (e.g. 15) |

---

## Development Plan

### Milestones

**Milestone 1 — Technical Proof of Concept** *(By 1 June 2026)*
- [x] GitHub repository set up with version control
- [x] React app initialised with Vite
- [x] Supabase database and authentication configured
- [x] Admin login feature fully working
- [x] Customer dashboard — add, view, delete customers
- [x] App running locally and accessible for evaluation

**Milestone 2 — Prototype: Core Features** *(By 29 June 2026)*
- [ ] Edit customer details (Feature 1 completion)
- [ ] Payment status column (paid / unpaid / overdue) on dashboard
- [ ] Automated WhatsApp reminders via Twilio (Feature 2)
- [ ] Stripe PayNow integration with webhook (Feature 3)
- [ ] Dashboard auto-updates on payment confirmation

**Milestone 3 — Extended System** *(By 27 July 2026)*
- [ ] Auto-generated PDF receipts sent via WhatsApp (Feature 4)
- [ ] Overdue detection and follow-up reminders (Feature 5)
- [ ] Monthly summary report auto-sent to admin (Feature 6)
- [ ] UI polished to a clean, professional standard
- [ ] App deployed live with a real domain

---

### Project Log

| Task | Person |
|---|---|
| Project setup, GitHub repo, Supabase client | Henry |
| Supabase table setup, customer form component | Shao Qing |
| Customer dashboard page | Shao Qing |
| App.jsx routing and wiring | Henry |
| Twilio WhatsApp integration | TBD |
| Stripe webhook integration | TBD |
| PDF receipt generation | TBD |
| UI polish and deployment | Both |

---

## Documentation of System

### Project Structure

```
tuition-app/
├── src/
│   ├── components/
│   │   └── AddCustomerForm.jsx   # Form to add a new customer
│   ├── pages/
│   │   └── Dashboard.jsx         # Customer list and management
│   ├── lib/
│   │   └── supabaseClient.js     # Supabase connection setup
│   ├── App.jsx                   # Main app — login + routing
│   └── main.jsx                  # React entry point
├── .env                          # Secret keys (not committed to GitHub)
├── .gitignore
├── package.json
└── README.md
```

### How to Run Locally

**Prerequisites:**
- Node.js (LTS) installed
- A Supabase project set up with the `customers` table

**Steps:**

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/tuition-app.git
cd tuition-app

# 2. Install dependencies
npm install

# 3. Create a .env file in the root folder with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 4. Start the development server
npm run dev

# 5. Open http://localhost:5173 in your browser
```

**Login:** Use the admin credentials created in your Supabase Authentication dashboard.

### How Authentication Works

Admin login is handled entirely by Supabase Auth. When the admin enters their email and password, the app calls `supabase.auth.signInWithPassword()`. On success, Supabase returns a session token which is stored automatically. The app checks for an existing session on load using `supabase.auth.getSession()`, so the admin stays logged in even after a page refresh. Logging out calls `supabase.auth.signOut()` which clears the session.

### How the Database Works

The app uses Supabase (PostgreSQL) as its database. All customer records are stored in the `customers` table. The frontend communicates directly with Supabase using the `@supabase/supabase-js` client library — there is no separate backend server needed for basic CRUD operations. Row Level Security (RLS) is currently disabled for development and will be enabled before deployment.

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anon key |

> ⚠️ Never commit your `.env` file to GitHub. It is listed in `.gitignore`.

---

*Bill Gates — Built for Orbital 2026 by Team Bill Gates*
