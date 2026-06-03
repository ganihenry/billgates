# Bill Gates — Payment Management System for Small Businesses

**Team Name:** Bill Gates
**Proposed Level of Achievement:** Project Gemini
**Milestone:** 1 — Technical Proof of Concept

---

## Table of Contents

1. [Testing the App](#-testing-the-app)
2. [Motivation](#motivation)
3. [Aim](#aim)
4. [Features and Design of Application](#features-and-design-of-application)
5. [Development Plan](#development-plan)
6. [Documentation of System](#documentation-of-system)

---

## 🔍 Testing the App

The live app is deployed at: **https://billgates-nine.vercel.app/**

> Account creation is not available to the public. Use the test credentials below to log in.

**Login Credentials:**
| Field | Value |
|---|---|
| Email | soshaoqing@gmail.com |
| Password | BillGates123 |

### How to Test the Current Features

**1. Logging In**
- Go to the live URL above
- Enter the email and password provided
- Click **Sign In** — you will be taken to the Customer Dashboard
- Use the 👁 icon to show or hide the password while typing

**2. Adding a Customer**
- Scroll down to the **Add New Customer** form at the bottom of the dashboard
- Fill in all 5 fields: Business/Name, Contact Person, WhatsApp Phone, Monthly Fee, and Payment Day
- Click **Add Customer** — the new customer will appear in the table immediately with an Unpaid status

**3. Editing a Customer**
- Find any customer in the table and click the **Edit** button
- A popup will appear with the customer's details pre-filled
- Make your changes and click **Save Changes**, or click **Cancel** to discard

**4. Changing Payment Status**
- In the **Status** column, click the coloured badge for any customer
- Select **Paid**, **Unpaid**, or **Overdue** from the dropdown
- The badge colour updates instantly — green for Paid, red for Unpaid, amber for Overdue
- The change is saved automatically, no button needed

**5. Deleting a Customer**
- Click the **Delete** button next to any customer to remove them from the system

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
| 2 | **Payment Status Tracking** — Each customer has a per-month payment record. Admin can manually toggle status between Paid, Unpaid, and Overdue directly from the dashboard | Core | ✅ Done |
| 3 | **Automated WhatsApp Reminders** — System automatically sends WhatsApp messages to customers before payment is due, including amount owed and payment details | Core | Upcoming |
| 4 | **Payment Integration** — Customers pay via PayNow; system detects and verifies payment via Stripe webhooks and auto-updates dashboard | Core | Upcoming |
| 5 | **Auto-Generated PDF Receipts** — Upon payment confirmation, a PDF receipt is generated and sent to the customer via WhatsApp | Extension | Upcoming |
| 6 | **Overdue Payment Escalation** — If payment is not made by the due date, system sends follow-up reminders every X days and flags the customer as overdue | Extension | Upcoming |
| 7 | **Monthly Summary Report** — At end of each month, admin receives an automated summary of total collected, outstanding payments, and number of customers paid | Extension | Upcoming |

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

- **Login Page** — Admin logs in securely via Supabase Auth (email + password). Includes a show/hide password toggle. Session persists on page refresh.
- **Customer Dashboard** — Displays all customers in a table with their name, contact person, phone number, monthly fee, payment day, and live payment status. Admin can add, edit, and delete customers.
- **Payment Status Column** — Each customer row shows a colour-coded status badge (green for Paid, red for Unpaid, amber for Overdue). Admin can change the status directly from the dropdown in the table.
- **Add Customer Form** — Embedded at the bottom of the dashboard. On submission, a payment record for the current month is automatically created for the new customer.
- **Stat Cards** — At the top of the dashboard, three cards show total monthly fees, total number of customers, and the earliest upcoming payment day.

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

`payments` table:

| Column | Type | Description |
|---|---|---|
| id | int8 | Auto-generated unique ID |
| customer_id | int8 | References the customer this payment belongs to |
| month | text | Billing month in YYYY-MM format (e.g. 2026-06) |
| amount | numeric | Amount due for that month |
| status | text | Current status: unpaid, paid, or overdue |
| paid_at | timestamptz | Timestamp of when payment was confirmed (nullable) |

---

## Development Plan

### Milestones

**Milestone 1 — Technical Proof of Concept** *(By 1 June 2026)*
- [x] GitHub repository set up with version control
- [x] React app initialised with Vite
- [x] Supabase database and authentication configured
- [x] Admin login with show/hide password toggle
- [x] Customer dashboard — add, view, edit, delete customers
- [x] Payment status tracking per customer per month (paid / unpaid / overdue)
- [x] Stat cards showing total fees, customer count, and next payment day
- [x] Dark themed professional UI across login and dashboard
- [x] App deployed live on Vercel

**Milestone 2 — Prototype: Core Features** *(By 29 June 2026)*
- [ ] Automated WhatsApp reminders via Twilio (Feature 3)
- [ ] Stripe PayNow integration with webhook (Feature 4)
- [ ] Dashboard auto-updates on payment confirmation

**Milestone 3 — Extended System** *(By 27 July 2026)*
- [ ] Auto-generated PDF receipts sent via WhatsApp (Feature 5)
- [ ] Overdue detection and automatic follow-up reminders (Feature 6)
- [ ] Monthly summary report auto-sent to admin (Feature 7)
- [ ] App deployed live with a real domain

---

### Project Log

| Task | Person |
|---|---|
| Project setup, GitHub repo, Supabase client | Henry |
| Supabase `customers` table setup | Shao Qing |
| Add Customer form component | Shao Qing |
| Customer dashboard page | Shao Qing |
| Edit Customer form component | Henry |
| App.jsx routing and wiring | Henry |
| Payment status tracking — `payments` table setup | Shao Qing |
| Payment utility functions (`paymentUtils.js`) | Henry |
| Payment status dropdown in dashboard | Henry |
| Dark theme UI redesign — dashboard | Henry |
| Dark theme UI redesign — login page | Henry |
| App deployed to Vercel | Henry |

---

## Documentation of System

### Project Structure

```
tuition-app/
├── src/
│   ├── components/
│   │   ├── AddCustomerForm.jsx     # Form to add a new customer
│   │   └── EditCustomerForm.jsx    # Modal popup to edit a customer
│   ├── pages/
│   │   └── Dashboard.jsx           # Main dashboard — customers + payment status
│   ├── lib/
│   │   ├── supabaseClient.js       # Supabase connection setup
│   │   └── paymentUtils.js         # Payment record creation and status updates
│   ├── App.jsx                     # Main app — login + routing
│   └── main.jsx                    # React entry point
├── index.html                      # App entry HTML (includes Google Fonts)
├── .env                            # Secret keys (not committed to GitHub)
├── .gitignore
├── package.json
└── README.md
```

### How to Run Locally

**Prerequisites:**
- Node.js (LTS) installed
- A Supabase project set up with the `customers` and `payments` tables

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

The app uses Supabase (PostgreSQL) as its database. Customer records are stored in the `customers` table, and monthly payment records are stored in the `payments` table. When a new customer is added, a payment record for the current month is automatically created via `createPaymentForMonth()` in `paymentUtils.js`. The frontend communicates directly with Supabase using the `@supabase/supabase-js` client library — there is no separate backend server needed for CRUD operations. Row Level Security (RLS) is currently disabled for development.

### How Payment Status Works

Each customer has one payment record per billing month stored in the `payments` table. The current month is derived from the system date in `YYYY-MM` format. On the dashboard, each customer row fetches their payment record for the current month and displays a colour-coded status badge. The admin can change the status directly from a dropdown in the table, which calls `updatePaymentStatus()` to update the record in Supabase instantly.

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anon key |

> ⚠️ Never commit your `.env` file to GitHub. It is listed in `.gitignore`.

---

*Bill Gates — Built for Orbital 2026 by Team Bill Gates*
