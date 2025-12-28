# Stripe Webhook Decision Tree

## Complete Flow Diagram

```
                    ┌─────────────────────────┐
                    │  Webhook Received       │
                    │  (POST /api/webhooks/   │
                    │   stripe/route.ts)      │
                    └─────────────┬───────────┘
                                  │
                                  ▼
                    ┌──────────────────────────────┐
                    │  Validate Stripe Signature   │
                    │  (lines 68-98)               │
                    └─────────────┬────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            Valid Signature?            Invalid Signature?
                    │                           │
                    ▼                           ▼
        ┌───────────────────┐      ┌──────────────────────┐
        │  Continue          │      │  Return 400 Error    │
        │  Processing        │      │  (Invalid signature)  │
        └──────────┬─────────┘      └──────────────────────┘
                   │
                   ▼
        ┌──────────────────────────────┐
        │  Check Event Type            │
        │  (lines 100-106)             │
        │  successType includes:       │
        │  - checkout.session.completed│
        │  - payment_intent.succeeded  │
        │  - invoice.paid              │
        └─────────────┬────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
  Event type in              Event type not
  successType?               in successType?
        │                           │
        ▼                           ▼
┌───────────────┐        ┌────────────────────┐
│  Process      │        │  Log & Return 200  │
│  Payment      │        │  (Not supported)   │
└───────┬───────┘        └────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│  Extract Payment Data Based on Event Type    │
│  (lines 119-176)                             │
└─────────────┬────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼                   ▼
┌──────────┐    ┌──────────────┐    ┌──────────────┐
│payment_  │    │checkout.     │    │invoice.paid  │
│intent.   │    │session.      │    │              │
│succeeded │    │completed     │    │              │
└────┬─────┘    └──────┬───────┘    └──────┬───────┘
     │                 │                   │
     │ Extract from    │ Extract from      │ Extract from
     │ PaymentIntent   │ CheckoutSession   │ Invoice
     │                 │                   │
     └─────────┬───────┴───────────┬───────┘
               │                   │
               └─────────┬─────────┘
                         │
                         ▼
            ┌──────────────────────────────┐
            │  Validate Metadata           │
            │  (lines 186-191)             │
            │  Check: metadata?.userId?    │
            └─────────────┬────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
      userId exists?            userId missing?
            │                           │
            ▼                           ▼
    ┌───────────────┐        ┌────────────────────┐
    │  Continue      │        │  Return 400 Error  │
    │  Processing    │        │  (Missing userId)  │
    └───────┬───────┘        └────────────────────┘
            │
            ▼
    ┌──────────────────────────────┐
    │  Parse ticketMetadata        │
    │  (lines 201-217)             │
    │  Parse JSON from             │
    │  metadata.ticketMetadata     │
    └─────────────┬────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
ticketMetadata exists    ticketMetadata is null
&& length > 0?          or empty/undefined?
        │                   │
        ▼                   ▼
┌───────────────┐    ┌─────────────────┐
│ MULTI-TICKET  │    │  SINGLE-TICKET  │
│    PATH       │    │      PATH       │
│ (lines 220-284)│   │ (lines 285-322) │
└───────┬───────┘    └────────┬────────┘
        │                     │
        │                     │
        ▼                     ▼
┌──────────────────┐  ┌──────────────────────┐
│ For each ticket  │  │ Validate eventTicketId│
│ in ticketMetadata│  │ (if not Membership)  │
│                  │  │ (lines 289-306)      │
│ 1. Fetch ticket  │  └──────────┬───────────┘
│    from DB       │             │
│ 2. Calculate    │             ▼
│    price ratio   │  ┌──────────────────────┐
│ 3. Create        │  │ Create single Payment│
│    Payment record│  │ record               │
│    (lines 270-282)│ │ (lines 309-321)      │
│                  │  │                      │
│ ✅ sold count    │  │ Note: sold count     │
│    updated later │  │ updated in email     │
│    in email      │  │ section              │
│    section       │  └──────────────────────┘
└────────┬─────────┘             │
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │  Email & Seat Map Section    │
        │  (lines 325-555)             │
        └─────────────┬────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
metadata.type !==          metadata.type ===
'Membership'?              'Membership'?
        │                           │
        ▼                           ▼
┌───────────────┐        ┌────────────────────┐
│  CONTINUE     │        │  SKIP Email        │
│  TO EMAIL     │        │  & Seat Map         │
│  HANDLING     │        │  (Membership only) │
└───────┬───────┘        └────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  Check ticketMetadata again  │
│  (line 334)                  │
└─────────────┬────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
ticketMetadata      ticketMetadata
&& length > 0?      is null/empty?
    │                   │
    ▼                   ▼
┌───────────────┐  ┌────────────────────┐
│ MULTI-TICKET  │  │ SINGLE-TICKET      │
│ EMAIL PATH    │  │ EMAIL PATH         │
│ (lines        │  │ (lines 490-550)    │
│  334-384)     │  │                    │
│               │  │                    │
│ ✅ Send       │  │ ✅ Send single     │
│    combined   │  │    ticket email    │
│    email with │  │    confirmation    │
│    all tickets│  │                    │
└───────┬───────┘  └──────────┬─────────┘
        │                     │
        └───────────┬─────────┘
                    │
                    ▼
        ┌──────────────────────────────┐
        │  Update Seat Map             │
        │  (lines 386-487)             │
        │                              │
        │  Collect seat numbers from:  │
        │  - ticketMetadata (multi)    │
        │  - metadata.seatNumbers      │
        │  - metadata.seatNumber       │
        │                              │
        │  Update seatingMap status   │
        │  to 2 (OCCUPIED)            │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │  Membership Handling         │
        │  (lines 562-576)             │
        └─────────────┬────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
metadata.type ===          metadata.type !==
'Membership'?              'Membership'?
        │                           │
        ▼                           ▼
┌───────────────┐        ┌────────────────────┐
│ Update User   │        │  Skip Membership   │
│ - subscribedAt│        │  Updates           │
│ - subscribe   │        │                    │
│   Expires     │        │                    │
│ - stripe      │        │                    │
│   Subscription│        │                    │
│   Id          │        │                    │
│               │        │                    │
│ Update        │        │                    │
│ Subscription  │        │                    │
│ Metadata      │        │                    │
│ (for renewals)│        │                    │
└───────┬───────┘        └────────────────────┘
        │
        └───────────┬───────────┘
                    │
                    ▼
        ┌──────────────────────────────┐
        │  Invalidate Payment Cache    │
        │  (line 559)                  │
        └─────────────┬────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │  Return Success Response     │
        │  { received: true }          │
        │  Status: 200                 │
        └──────────────────────────────┘
```

## Event Type Handling Details

### payment_intent.succeeded
- Extracts: `amount`, `metadata`, `id`
- Sets: `quantity = 1`
- Used for: Direct payment intents

### checkout.session.completed
- Extracts: `amount_total`, `metadata`, `payment_intent`
- Fetches: `quantity` from line items
- Handles: Subscription creation (first payment)
- Used for: Checkout sessions

### invoice.paid
- Extracts: `amount_paid`, `payment_intent`, subscription metadata
- Fetches: `quantity` from invoice lines
- Handles: Subscription renewals
- Used for: Recurring subscription payments

## Payment Flow Examples

### Single Ticket Checkout Flow

```
1. Webhook Received
   ↓
2. Parse metadata (no ticketMetadata)
   ↓
3. Validate eventTicketId (if not Membership)
   ↓
4. Create Payment Record (lines 309-321)
   - userId, eventId, eventTicketId
   - stripePaymentId, pricePaid
   - quantity, seatNumber
   ↓
5. Email Section (if not Membership)
   ↓
6. Update Seat Map (lines 386-487)
   - Parse seatNumber from metadata
   - Update seatingMap status to 2 (OCCUPIED)
   ↓
7. Send Email Confirmation (lines 490-550)
   - Single ticket email
   ↓
8. Invalidate Cache & Return Success
```

### Multi-Ticket Checkout Flow

```
1. Webhook Received
   ↓
2. Parse ticketMetadata (JSON array)
   ↓
3. For each ticket in ticketMetadata:
   - Fetch ticket from DB
   - Calculate price ratio (for discounts)
   - Create Payment Record (lines 270-282)
     * One payment per ticket type
     * Includes seatCount in quantity
   ↓
4. Email Section (if not Membership)
   ↓
5. Send Combined Email (lines 334-384)
   - All ticket types in one email
   - Combined seat numbers
   ↓
6. Update Seat Map (lines 386-487)
   - Collect all seat numbers from ticketMetadata
   - Update all seats to status 2 (OCCUPIED)
   ↓
7. Invalidate Cache & Return Success
```

### Membership Payment Flow

```
1. Webhook Received
   ↓
2. Parse metadata (no ticketMetadata)
   ↓
3. Create Payment Record (lines 309-321)
   - type: 'Membership'
   - eventTicketId: null
   - expiresAt: subscriptionEnd
   ↓
4. SKIP Email Section (Membership check)
   ↓
5. Update User (lines 562-576)
   - subscribedAt: new Date()
   - subscribeExpires: expiresAt
   - stripeSubscriptionId: subscriptionId
   ↓
6. Update Subscription Metadata
   - For future renewal invoices
   ↓
7. Invalidate Cache & Return Success
```

### Subscription Renewal Flow (invoice.paid)

```
1. Webhook Received
   ↓
2. Event Type: invoice.paid
   ↓
3. Extract from Invoice:
   - amount_paid
   - payment_intent
   - subscription metadata (from parent)
   - quantity from invoice lines
   ↓
4. Get Subscription Details
   - current_period_end
   ↓
5. Create Payment Record
   - type: 'Membership'
   - expiresAt: subscriptionEnd
   ↓
6. Update User Subscription
   - subscribeExpires: new expiry date
   ↓
7. Return Success
```