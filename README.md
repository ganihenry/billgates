# Bill Gates — Recurring Payment Management for Small Businesses

**Team Name:** Bill Gates &nbsp;|&nbsp; **Proposed Level of Achievement:** Project Gemini &nbsp;|&nbsp; **Milestone:** 2 — Prototype

---

## Table of Contents

1. [Testing the App](#-testing-the-app)
2. [Motivation](#motivation)
3. [Aim](#aim)
4. [Features](#features)
5. [Application Design](#application-design)
6. [Development Plan](#development-plan)
7. [Documentation of System](#documentation-of-system)

---

## 🔍 Testing the App

Live app: **https://billgates-nine.vercel.app/**

> Account creation is invite-only. Use the credentials below to log in and explore all features.

| Field    | Value                |
| -------- | -------------------- |
| Email    | soshaoqing@gmail.com |
| Password | BillGates123         |

### What to Try

**Logging in**
Go to the live URL, enter the credentials above and click **Sign In**. You'll land on the Customer Dashboard. Use the 👁 icon to toggle password visibility.

**Adding a customer**
Scroll to the bottom of the Dashboard and fill in the **Add New Customer** form. You'll need to provide a business name, contact person, WhatsApp number, monthly fee, payment due day, and how many days before the due date the system should send a reminder. Hit **Add Customer** and the new entry appears in the table right away, already tagged as Unpaid for the current month.

**Editing a customer**
Click **Edit** on any row. A modal pops up with everything pre-filled. Make your changes and hit **Save Changes**. If you change your mind, hit **Cancel** and nothing gets saved.

**Updating payment status manually**
In the **Status** column, click the coloured badge and pick a new status from the dropdown. Green = Paid, Red = Unpaid, Amber = Overdue. It saves the moment you pick, no extra button.

**Sending a WhatsApp reminder**
Click **Remind** on any unpaid customer. The system sends a WhatsApp message immediately using the template saved in the Reminders page. The message includes their name, amount owed, due date, and a PayNow payment link. The Remind button is disabled for customers who have already paid.

**Generating a PayNow payment link**
Click the **💳 PayNow** button on any unpaid or overdue customer. A Stripe Checkout link is generated and copied to your clipboard. Paste it into WhatsApp or a browser to test the payment flow. Once paid, the dashboard status updates to Paid automatically without refreshing.

**Using the Reminders Centre**
Click **Reminders** in the sidebar. You'll see three editable message templates (pre-due, overdue, payment confirmed), a **Remind All Unpaid** button that blasts a WhatsApp to every unpaid customer at once, and a Message History table showing every message ever sent.

**Viewing payment history**
Click **Payments** in the sidebar. You'll see every payment record across all months. Filter by month or by status to narrow things down. The table updates in real time when a payment comes in.

**Viewing monthly reports**
Click **Reports** in the sidebar and pick a month from the dropdown. You'll see total collected, total outstanding, collection rate percentage, and a breakdown of which customers have and haven't paid. Also updates in real time.

**Deleting a customer**
Click **Delete** on any customer row. You'll be asked to confirm. Once deleted, all their payment records and reminder history are also removed.

---

## Motivation

We have a friend who runs a small tuition centre. Every month, she manually checks her bank statements to figure out who has paid, texts each parent individually to follow up on late payments, and types out receipts one by one. By the time she's done with all of this, she's spent hours on admin work that has nothing to do with actually teaching.

She's not alone in this. Fitness coaches, music teachers, freelancers, and plenty of other small business owners deal with the same thing. The moment you have more than a handful of recurring customers, payment collection becomes a real headache, not because the work is hard, but because it's constant, repetitive, and easy to let slip.

We built Bill Gates to take that off their plate.

---

## Aim

Bill Gates is a recurring payment management system built for small businesses. The goal is simple: the admin should be able to see who has paid, who hasn't, send reminders, and collect payment, all from one place, with as little manual effort as possible.

Specifically, the system:

- Gives the admin a single dashboard showing every customer and their current payment status
- Sends WhatsApp reminders automatically before and after payment due dates, using templates the admin can customise
- Lets customers pay instantly via PayNow through a Stripe-generated checkout link, which is included in every reminder
- Updates payment status automatically the moment a payment goes through, with no manual action needed
- Keeps a full history of every payment and every message sent
- Produces monthly collection reports so the admin always knows where they stand

---

## Features

### Feature 1 — Customer Management ✅

The admin manages all customers from the main dashboard. Each customer record holds everything the system needs to track their payments and send them messages.

**What's stored per customer:**

| Field | What it's for |
|---|---|
| Name | Business or customer name shown throughout the app |
| Contact Person | The individual to address in messages |
| WhatsApp Phone | The number all automated messages are sent to |
| Monthly Fee | The fixed amount due each month, in SGD |
| Payment Day | The day of the month the payment is due (e.g. 15 means the 15th) |
| Reminder Days | How many days before the due date the system fires an automated reminder |

**Adding a customer** submits the form to Supabase and immediately creates a payment record for the current month. The new customer shows up in the table right away as Unpaid.

**Editing a customer** opens a pre-filled modal. The admin changes what they need and clicks Save. The update writes to Supabase instantly.

**Deleting a customer** asks for confirmation, then removes the customer along with all their associated payment records and reminder history. This is done in sequence: payment records and reminder logs are deleted first, then the customer row, to avoid foreign key constraint errors.

All changes reflect in the dashboard immediately without a page refresh.

---

### Feature 2 — Payment Status Tracking ✅

Every customer has exactly one payment record per billing month. This is what the dashboard is built around. At any given time, the admin can see the current month's payment status for every customer in one table.

**The three statuses:**

| Status | What it means | Badge colour |
|---|---|---|
| Unpaid | Payment hasn't been received yet | 🔴 Red |
| Paid | Payment has been confirmed | 🟢 Green |
| Overdue | Due date has passed without payment | 🟠 Amber |

The admin can change any customer's status manually by clicking the badge and selecting from a dropdown. It saves the moment they pick, with no extra button press. This is useful for recording cash payments or bank transfers that happen outside the system.

When a customer pays via PayNow (Feature 4), the status updates to Paid automatically through a Stripe webhook. The admin doesn't need to do anything.

The dashboard, Payments page, and Reports page all subscribe to Supabase Realtime, so any status change, whether manual or webhook-triggered, is reflected across all pages immediately.

---

### Feature 3 — WhatsApp Reminders ✅

The system handles WhatsApp reminders in three different ways, each serving a different purpose.

**Manual remind button (per customer)**
On the Dashboard, each customer row has a **Remind** button. Clicking it sends a WhatsApp message immediately to that customer. The message uses the pre-due or overdue template depending on the customer's current status. The Remind button is greyed out and disabled for customers who have already paid, so you can't accidentally send a "please pay" message to someone who already has.

**Blast all unpaid**
On the Reminders page, there's a **Remind All Unpaid** button. This loops through every customer with an Unpaid or Overdue status and sends them a WhatsApp in one go. For overdue customers it uses the overdue template; for others it uses the pre-due template. The admin gets a summary at the end showing how many messages were sent successfully.

**Automated daily cron jobs**
Two scheduled jobs run every day via Supabase Edge Functions:
- A pre-due job checks if today is exactly `reminder_days` before any customer's `payment_day`. If so, and the customer is still Unpaid, a reminder is sent automatically.
- An overdue job checks for customers whose due date has already passed and who are still Unpaid. It marks them as Overdue and sends a follow-up message.

All three paths use the same message templates and include a personalised PayNow payment link in the message body.

Every reminder sent, whether manual, blast, or automated, is logged to the Message History table on the Reminders page, including the full message text, the timestamp, and whether it was delivered or failed.

---

### Feature 4 — Stripe PayNow Integration ✅

Customers can pay directly via PayNow through a Stripe-hosted checkout page. The entire flow, from generating the link to updating the payment status, is automated.

**How the flow works:**

1. A payment link is generated for a customer. This happens automatically when a reminder is sent (the link is embedded in the message), or the admin can generate one manually using the **💳 PayNow** button on the Dashboard.

2. Behind the scenes, the frontend calls a Vercel serverless function (`/api/create-checkout-session`) which creates a Stripe Checkout session. The session is linked to the specific payment record via metadata, and PayNow is set as the only payment method.

3. The customer opens the link and scans the PayNow QR code to pay.

4. Once Stripe confirms the payment, it fires a `checkout.session.completed` webhook to `/api/stripe-webhook`. The webhook verifies Stripe's signature to make sure the request is genuine, then extracts the `payment_id` from the session metadata.

5. The webhook updates the corresponding row in the `payments` table, setting status to `paid`, recording the timestamp, and saving the Stripe session ID.

6. The Dashboard, Payments page, and Reports page all pick up the change in real time via Supabase Realtime subscriptions, so the admin sees the status flip to green immediately.

The Stripe secret key and webhook signing secret are stored only in Vercel's server-side environment variables and are never exposed to the browser.

---

### Feature 5 — Reminder Centre ✅

The Reminders page is where the admin controls everything to do with outgoing messages. It has four sections:

**Send to All Unpaid**
A single button that sends a WhatsApp to every unpaid or overdue customer at once. The count of unpaid customers is shown on the button so the admin knows exactly how many messages will go out before clicking.

**Message Templates**
Three editable templates, each for a different situation:

| Template | When it's used |
|---|---|
| Pre-Due Reminder | Sent before the payment due date (manual or automated) |
| Overdue Reminder | Sent when the customer's status is Overdue |
| Payment Confirmed | Available for when payment is received |

Each template supports variables that get replaced with real data when the message is sent:
- `{name}` replaced with the customer's contact person name
- `{amount}` replaced with their monthly fee
- `{due_date}` replaced with their payment day
- `{payment_link}` replaced with a freshly generated Stripe PayNow checkout URL

A live preview panel sits next to each template editor, showing what the message will look like with sample data as the admin types. Templates are saved to Supabase and persist across sessions.

**Message History**
A table of every WhatsApp message ever sent through the system. Each row shows the customer name, message type (manual, blast, pre-due, or overdue), the full message text, when it was sent, and whether it was delivered or failed. The admin can clear the history at any time using the **Clear History** button.

---

### Feature 6 — Payment History Page ✅

The Payments page shows every payment record in the system, across all months and all customers. It's a historical log, useful for checking a specific customer's payment track record, resolving disputes, or reviewing a past month's collection.

The table can be filtered by month and by status independently. The stat cards at the top update based on whatever filters are applied, so if you filter to June 2026 and Overdue, the cards show the total outstanding amount for just that subset.

Each row shows the billing month, customer name and contact person, amount, current status, and the date and time the payment was confirmed (or a dash if it hasn't been paid).

The page subscribes to Supabase Realtime, so if a payment comes in while the admin has this page open, the record updates without needing a refresh.

---

### Feature 7 — Monthly Summary Report ✅

The Reports page gives the admin a financial snapshot of any given month. The admin picks a month from a dropdown at the top, defaulting to the current month.

**The four headline stats:**

| Stat | What it shows |
|---|---|
| Total Collected | Sum of all paid amounts for the selected month |
| Outstanding | Sum of all unpaid and overdue amounts |
| Collection Rate | Percentage of customers who have paid |
| Customer count | How many paid vs total for the month |

Below the stat cards, customers are grouped into three sections (Paid, Overdue, and Unpaid), each with their own subtotal. This makes it easy to see at a glance who's paid up and who still owes.

Like the Payments page, this page uses Supabase Realtime so the numbers update the moment a payment is confirmed.

---

## Application Design

### Tech Stack

| Technology | What we use it for |
|---|---|
| React (Vite) | All frontend UI and user interactions |
| Supabase | PostgreSQL database, admin authentication, Edge Functions, Realtime subscriptions |
| Twilio | WhatsApp messaging for reminders, blast, and confirmation messages |
| Stripe | PayNow checkout sessions and webhook event delivery |
| Vercel | Hosting the frontend and running serverless API functions |
| GitHub | Version control, issues, and pull requests |

### Database Schema

**`customers` table**

| Column | Type | Description |
|---|---|---|
| id | int8 | Auto-generated primary key |
| name | text | Business or customer name |
| contact_name | text | Name of contact person |
| contact_phone | text | WhatsApp phone number |
| monthly_fee | numeric | Monthly payment amount (SGD) |
| payment_day | int4 | Day of month payment is due |
| reminder_days | int4 | Days before due date to send automated reminder |

**`payments` table**

| Column | Type | Description |
|---|---|---|
| id | int8 | Auto-generated primary key |
| customer_id | int8 | Foreign key referencing customers(id) |
| month | text | Billing month in YYYY-MM format |
| amount | numeric | Amount due for that month |
| status | text | unpaid, paid, or overdue |
| paid_at | timestamptz | Timestamp of payment confirmation (null if unpaid) |
| stripe_session_id | text | Stripe Checkout session ID (set on webhook confirmation) |

**`reminder_templates` table**

| Column | Type | Description |
|---|---|---|
| id | int8 | Auto-generated primary key |
| type | text | pre_due, overdue, or payment_confirmed |
| message | text | The template text with {variable} placeholders |
| updated_at | timestamptz | Last saved timestamp |

**`reminder_logs` table**

| Column | Type | Description |
|---|---|---|
| id | int8 | Auto-generated primary key |
| customer_id | int8 | References the customer the message was sent to |
| customer_name | text | Stored at time of sending (in case customer is later deleted) |
| type | text | manual, blast, pre_due, or overdue |
| message | text | The full message text that was sent |
| sent_at | timestamptz | When the message was sent |
| status | text | sent or failed |

---

## Development Plan

### Milestones

**Milestone 1 — Technical Proof of Concept** *(Completed 1 June 2026)*

- [x] GitHub repository set up
- [x] React app with Vite deployed on Vercel
- [x] Supabase database and authentication set up
- [x] Login page with show/hide password
- [x] Customer dashboard: add, view, edit, delete
- [x] Payment status tracking (paid / unpaid / overdue)
- [x] Stat cards: total fees, customer count, next payment day
- [x] Dark themed UI across all pages
- [x] Sidebar navigation

**Milestone 2 — Prototype** *(By 29 June 2026)*

- [x] WhatsApp reminders: manual button, pre-due cron, overdue cron
- [x] Payment History page with filters and Realtime
- [x] Monthly Reports page with Realtime
- [x] Stripe PayNow integration — checkout session, webhook, auto status update
- [x] Reminders Centre — custom templates, blast all unpaid, message history
- [x] PayNow link auto-generated and included in all reminder messages
- [x] Dashboard, Payments, and Reports all update in real time via Supabase Realtime

**Milestone 3 — Extended System** *(By 27 July 2026)*

- [ ] Auto-generated PDF receipts sent via WhatsApp on payment confirmation
- [ ] UI polish across all pages
- [ ] Custom domain
- [ ] Row Level Security (RLS) enabled for production

---

### Project Log

**Milestone 1**

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
| WhatsApp reminder — manual button | Henry |
| WhatsApp reminder — pre-due cron job | Henry |
| WhatsApp reminder — overdue cron job + auto status update | Shao Qing |
| Payment History page | Shao Qing |
| Monthly Summary Report page | Shao Qing |
| Sidebar navigation | Henry |

**Milestone 2**

| Task | Person |
|---|---|
| Stripe PayNow — `/api/create-checkout-session` serverless function | Shao Qing |
| Stripe PayNow — `/api/stripe-webhook` handler | Henry |
| `stripeUtils.js` frontend helper | Shao Qing |
| PayNow button on Dashboard | Henry |
| Supabase Realtime subscriptions — Dashboard, Payments, Reports | Shao Qing |
| `reminder_templates` and `reminder_logs` Supabase tables | Henry |
| Reminders page — skeleton, routing, sidebar | Shao Qing |
| Reminders page — template editor with live preview | Henry |
| Reminders page — Blast All Unpaid function and UI | Shao Qing |
| Reminders page — Message History log | Henry |
| PayNow link auto-generated and embedded in reminder messages | Shao Qing |
| Foreign key constraint fix and orphaned record cleanup | Henry |
| Disable Remind button for paid customers | Shao Qing |
| Fix delete customer to cascade through payments and logs | Henry |

---

## Documentation of System

### Project Structure

```
billgates/
├── api/                                    # Vercel serverless functions (server-side only)
│   ├── create-checkout-session.js          # Creates a Stripe PayNow checkout session
│   └── stripe-webhook.js                   # Receives Stripe webhook, updates payment status
├── src/
│   ├── components/
│   │   ├── AddCustomerForm.jsx             # Form to add a new customer
│   │   └── EditCustomerForm.jsx            # Modal to edit an existing customer
│   ├── pages/
│   │   ├── Dashboard.jsx                   # Main dashboard, customer table, status, actions
│   │   ├── PaymentHistory.jsx              # All payment records with filters
│   │   ├── Reports.jsx                     # Monthly summary report
│   │   └── Reminders.jsx                   # Templates, blast button, message history
│   ├── lib/
│   │   ├── supabaseClient.js               # Supabase client initialisation
│   │   ├── paymentUtils.js                 # Payment record creation, status updates, WhatsApp
│   │   └── stripeUtils.js                  # Frontend helper to call checkout session API
│   ├── App.jsx                             # Root component, auth, routing between pages
│   └── main.jsx                            # React entry point
├── supabase/
│   └── functions/
│       └── send-whatsapp/
│           └── index.ts                    # Supabase Edge Function, sends WhatsApp via Twilio
├── index.html
├── package.json
└── README.md
```

### Running Locally

```bash
# Clone the repo
git clone https://github.com/ganihenry/billgates.git
cd billgates

# Install dependencies
npm install

# Create a .env file at the root
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_APP_URL=http://localhost:5173

# Start the dev server
npm run dev
```

Note: the `/api` serverless functions only run on Vercel. They will return 404 on localhost. To test Stripe webhooks locally, use the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

The following variables must be added to Vercel's environment variables (not the `.env` file, as they are server-side only):

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret API key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key, used by the webhook to bypass RLS |

### How Authentication Works

Login is handled by Supabase Auth. The app calls `supabase.auth.signInWithPassword()` and stores the session automatically. On page load, `supabase.auth.getSession()` checks for an existing session so the admin stays logged in after a refresh. Logging out calls `supabase.auth.signOut()`. Account creation is not exposed in the UI. New accounts are created via Supabase invite only.

### How Reminders Work End-to-End

When a reminder is triggered (manual, blast, or cron), the system:
1. Looks up the appropriate template from `reminder_templates` in Supabase
2. Replaces `{name}`, `{amount}`, `{due_date}` with the customer's actual data
3. Calls `/api/create-checkout-session` to generate a fresh Stripe PayNow link for that customer
4. Replaces `{payment_link}` in the template with the generated URL
5. Calls the `send-whatsapp` Supabase Edge Function, passing the final message text
6. The Edge Function calls the Twilio API to deliver the WhatsApp message
7. The result (sent or failed) is logged to `reminder_logs`

### How the Stripe PayNow Flow Works

1. Frontend calls `/api/create-checkout-session` with the payment ID, customer ID, name, and amount
2. Vercel serverless function creates a Stripe Checkout session with PayNow as the payment method and embeds the `payment_id` in the session metadata
3. The function returns the checkout URL to the frontend
4. Customer opens the URL, scans the PayNow QR code, and pays
5. Stripe fires `checkout.session.completed` to `/api/stripe-webhook`
6. Webhook verifies the Stripe signature, extracts `payment_id` from metadata
7. Updates the `payments` row: sets `status = 'paid'`, records `paid_at` and `stripe_session_id`
8. Supabase Realtime broadcasts the change to all connected clients. The dashboard, payments page, and reports page all update immediately.

---

*Bill Gates — Built for NUS Orbital 2026 by Henry and Shao Qing*
