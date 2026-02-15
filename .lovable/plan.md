

## Plan: Show Ticket Submitter Info + Debit Card Removal Guidance

### 1. Show "Submitted By" on Admin Support Tickets

Currently the admin ticket list and detail dialog don't display who submitted the ticket. The `user_id` is stored on each ticket, and the `profiles` table has the user's `email` and `full_name`.

**Changes:**

**A. Update `admin-list-tickets` edge function** (`supabase/functions/admin-list-tickets/index.ts`)
- Change the query to join `profiles` on `user_id` so each ticket includes the submitter's name and email.
- Use a Supabase select with a nested relation: `*, profiles!support_tickets_user_id_fkey(email, full_name)` or a manual join approach.

**B. Update `SupportTickets.tsx`** (admin ticket list)
- Add `submitter_email` and `submitter_name` fields to the interface.
- Display the submitter name/email on each ticket row (e.g., "Submitted by: Amanda Eagle (amandalynneagle1028@gmail.com)").

**C. Update `TicketDetailDialog.tsx`** (admin ticket detail)
- Show submitter info prominently in the dialog header area (name, email).
- This helps admins immediately know who to respond to.

### 2. Debit Card Removal Workflow

The platform already has a `customer-portal` edge function that opens the Stripe Customer Portal. The Stripe Customer Portal natively allows users to update or remove their payment methods.

**Changes:**

**A. No new backend work needed** -- the `customer-portal` function already exists and works.

**B. Update the ticket detail dialog or add a quick-action for billing tickets:**
- When an admin views a billing-category ticket about card removal, they can reply with instructions directing the user to Settings > Subscription Management > "Manage Subscription" button, which opens the Stripe portal where they can remove their card.
- Add a "canned response" / quick-reply button in the ticket detail dialog for common billing actions (e.g., "Send card removal instructions") that auto-fills a helpful message like:

  > "You can remove your payment method by going to Settings > Subscription Management and clicking 'Manage Subscription'. This will open a secure portal where you can update or remove your card."

**C. Optionally, add a direct "Remove Payment Method" link on the Settings/Billing page** that is more discoverable, so users can self-serve without needing to submit a ticket.

---

### Technical Details

**Edge function change (`admin-list-tickets/index.ts`):**
- Replace `.from('support_tickets').select('*')` with `.from('support_tickets').select('*, profiles!user_id(email, full_name)')` to get submitter info in one query.

**Frontend changes:**
- `SupportTickets.tsx`: Parse the nested `profiles` object from each ticket, display submitter name/email below the creation date.
- `TicketDetailDialog.tsx`: Add a "Submitted by" section with user icon, name, and email. Add a canned responses dropdown for common billing replies (card removal instructions, subscription help).
- `Settings/SubscriptionManagement.tsx` or `Settings/Billing.tsx`: Ensure the "Manage Subscription" button is clearly labeled as the place to manage/remove payment methods.

**No database changes required** -- all necessary data already exists.

