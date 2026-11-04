# BookMe

BookMe is an online booking platform for businesses that offer time-based services, including fitness studios, coworking spaces, barbers, restaurants and clinics.

Customers can browse places, check real-time availability, book time slots and pay online. Business owners manage their locations, resources and bookings, while admins manage platform activity.

This is a full-stack portfolio project built from scratch.

## Screenshots

<img width="1810" height="982" alt="image" src="https://github.com/user-attachments/assets/d658f0c8-09ae-4f4a-8056-8e2a2b2ca163" />
<img width="1810" height="982" alt="image" src="https://github.com/user-attachments/assets/3fcaf242-88e6-4378-af6a-0af9e8fafd5b" />
<img width="1810" height="982" alt="image" src="https://github.com/user-attachments/assets/c499e4ce-4a16-495a-925f-d8c7c5be0ee8" />
<img width="1810" height="982" alt="image" src="https://github.com/user-attachments/assets/11295ccf-3b7c-4500-8d72-ef7e0f2d8ecd" />
<img width="1810" height="982" alt="image" src="https://github.com/user-attachments/assets/e26f6919-9248-4b6b-acee-7e5901d59bc9" />


## Features

**Customers**
- Browse and filter places by type.
- View availability and book 15-minute time slots.
- Pay online using Stripe.
- View and cancel bookings.

**Business owners**
- Create and manage businesses, locations and resources.
- Configure opening hours and time zones.
- Upload business photos.
- Manage bookings and update their status.

**Admins**
- Approve or reject businesses.
- Manage users.
- View platform statistics and revenue.

## Tech stack

| Part | Technologies |
|---|---|
| Backend | Node.js, TypeScript, Express 5 |
| Database | PostgreSQL, Prisma ORM 8 |
| Cache and locks | Redis |
| Validation | Zod |
| Payments | Stripe |
| File storage | Cloudflare R2 |
| Email | Nodemailer, Mailpit |
| Frontend | React 19, TypeScript, Vite |
| Routing and data fetching | React Router, TanStack Query |
| Forms | React Hook Form |
| Styling | Tailwind CSS 4 |
| Monorepo | pnpm workspaces |

## Technical highlights

- **Authentication:** Short-lived access tokens, rotating refresh tokens stored in httpOnly cookies, Redis-based token management and rate limiting.
- **Booking concurrency:** Redis locks and overlapping booking checks prevent double bookings for the same resource.
- **Payments:** Stripe PaymentIntents with manual capture. Webhooks handle booking confirmation and payment status.
- **Time zones:** Bookings are stored in UTC, while opening hours are evaluated in each location's time zone.
- **Background jobs:** Automatic expiration of unpaid bookings and periodic synchronization of business view counts.
- **File uploads:** Direct browser uploads to Cloudflare R2 using presigned URLs.

## Running locally

### Requirements

- Node.js
- pnpm
- Docker
- Stripe CLI (for payment testing)

### Installation

```bash
git clone <repository-url>
cd bookme
pnpm install

docker compose up -d

cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Apply database migrations using the Prisma workflow configured in the repository, then seed the database:

```bash
pnpm --filter api seed
```

Start the applications in separate terminals:

```bash
pnpm --filter api dev
pnpm --filter web dev
```

- Web: http://localhost:5173
- API: http://localhost:3000
- Mailpit: http://localhost:8025

### Stripe setup

Configure your Stripe test keys and forward webhooks:

```bash
stripe listen --forward-to http://localhost:3000/webhooks/stripe
```

Use the generated webhook signing secret in the API environment.

Test card: `4242 4242 4242 4242`.

### Demo accounts

The seed command creates 11 demo businesses along with approximately 40 bookings.

All accounts use the password `Password123`.

| Role | Email |
|---|---|
| Admin | `admin@bookme.test` |
| Business owners | `owner1@bookme.test`, `owner2@bookme.test`, `owner3@bookme.test` |
| Customers | `anna@bookme.test`, `ben@bookme.test`, `clara@bookme.test` |
| Unverified customer | `dan@bookme.test` |

## Limitations

- Booking confirmation and reminder emails are not implemented.
- Business photos can only be uploaded after creation.
- The API uses in-process background jobs and requires an always-on instance.
