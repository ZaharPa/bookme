import bcrypt from "bcrypt";
import { db } from "../prisma/db";

const PASSWORD = "Password123";
const SEED_ADMIN_EMAIL = "admin@bookme.test";

function daysFromNow(days: number, hour = 12) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour, 0, 0, 0);
  return date.toISOString();
}

type Day = { open: string; close: string } | null;
const day = (open: string, close: string): Day => ({ open, close });

function week(weekday: Day, sat: Day, sun: Day) {
  return {
    mon: weekday,
    tue: weekday,
    wed: weekday,
    thu: weekday,
    fri: weekday,
    sat,
    sun,
  };
}

const STANDARD = week(day("09:00", "18:00"), day("10:00", "16:00"), null);
const LONG = week(
  day("07:00", "21:00"),
  day("09:00", "18:00"),
  day("10:00", "16:00"),
);

type Seed = {
  name: string;
  type:
    | "RESTAURANT"
    | "BARBERSHOP"
    | "COWORKING"
    | "SALON"
    | "FITNESS"
    | "MEDICAL"
    | "TUTORING";
  description: string;
  city: string;
  address: string;
  hours: ReturnType<typeof week>;
  resources: { name: string; priceCents: number; capacity: number }[];
};

const BUSINESSES: Seed[] = [
  {
    name: "Peak Fitness",
    type: "FITNESS",
    description: "Personal training and group classes in a small studio.",
    city: "Dublin",
    address: "12 Harbour Road",
    hours: LONG,
    resources: [
      { name: "Court 1", priceCents: 2500, capacity: 1 },
      { name: "Group class", priceCents: 1200, capacity: 12 },
    ],
  },
  {
    name: "Dockside Workspace",
    type: "COWORKING",
    description:
      "Flexible desks, private offices and meeting rooms by the docks.",
    city: "Dublin",
    address: "4 Dock Street",
    hours: week(day("08:00", "19:00"), day("09:00", "14:00"), null),
    resources: [
      { name: "Hot desk", priceCents: 800, capacity: 20 },
      { name: "Meeting room", priceCents: 3000, capacity: 1 },
    ],
  },
  {
    name: "Harbour Barbers",
    type: "BARBERSHOP",
    description: "Cuts, beard trims and hot towel shaves.",
    city: "Dublin",
    address: "27 Quay Lane",
    hours: STANDARD,
    resources: [
      { name: "Chair 1", priceCents: 2000, capacity: 1 },
      { name: "Chair 2", priceCents: 2000, capacity: 1 },
    ],
  },
  {
    name: "Liffey Bistro",
    type: "RESTAURANT",
    description: "Seasonal Irish cooking with a river view.",
    city: "Dublin",
    address: "9 Bridge Street",
    hours: week(
      day("12:00", "22:00"),
      day("12:00", "23:00"),
      day("12:00", "20:00"),
    ),
    resources: [{ name: "Table for 4", priceCents: 1000, capacity: 6 }],
  },
  {
    name: "Glow Studio",
    type: "SALON",
    description: "Hair, nails and skin care in the heart of Cork.",
    city: "Cork",
    address: "15 Patrick Street",
    hours: STANDARD,
    resources: [
      { name: "Hair station", priceCents: 4500, capacity: 2 },
      { name: "Nail bar", priceCents: 3000, capacity: 2 },
    ],
  },
  {
    name: "Fitzwilliam Clinic",
    type: "MEDICAL",
    description: "General practice and physiotherapy appointments.",
    city: "Dublin",
    address: "31 Fitzwilliam Square",
    hours: week(day("09:00", "17:00"), null, null),
    resources: [
      { name: "GP consultation", priceCents: 6500, capacity: 1 },
      { name: "Physiotherapy", priceCents: 5500, capacity: 1 },
    ],
  },
  {
    name: "Bright Minds Tutoring",
    type: "TUTORING",
    description: "One-to-one and small group tutoring for school and college.",
    city: "Galway",
    address: "6 Shop Street",
    hours: week(day("14:00", "20:00"), day("10:00", "14:00"), null),
    resources: [
      { name: "One-to-one", priceCents: 3500, capacity: 1 },
      { name: "Small group", priceCents: 1800, capacity: 6 },
    ],
  },
  {
    name: "Corner Coworking",
    type: "COWORKING",
    description: "A quiet workspace above a coffee shop.",
    city: "Cork",
    address: "2 Grand Parade",
    hours: STANDARD,
    resources: [{ name: "Hot desk", priceCents: 700, capacity: 12 }],
  },
  {
    name: "Old Town Barbers",
    type: "BARBERSHOP",
    description: "Traditional barbershop, walk-ins and bookings.",
    city: "Galway",
    address: "18 Quay Street",
    hours: STANDARD,
    resources: [{ name: "Chair", priceCents: 1800, capacity: 1 }],
  },
  {
    name: "Tide Pilates",
    type: "FITNESS",
    description: "Reformer and mat pilates for all levels.",
    city: "Galway",
    address: "40 Salthill Promenade",
    hours: LONG,
    resources: [
      { name: "Reformer class", priceCents: 1800, capacity: 8 },
      { name: "Mat class", priceCents: 1200, capacity: 14 },
    ],
  },
  {
    name: "The Long Table",
    type: "RESTAURANT",
    description: "Shared tables and sharing plates.",
    city: "Cork",
    address: "21 Oliver Plunkett Street",
    hours: week(
      day("12:00", "22:00"),
      day("12:00", "23:00"),
      day("12:00", "20:00"),
    ),
    resources: [{ name: "Table for 6", priceCents: 1500, capacity: 4 }],
  },
];

const OWNERS = [
  { name: "Olivia Byrne", email: "owner1@bookme.test" },
  { name: "Liam Murphy", email: "owner2@bookme.test" },
  { name: "Aoife Walsh", email: "owner3@bookme.test" },
];

const CUSTOMERS = [
  { name: "Anna Kelly", email: "anna@bookme.test", verified: true },
  { name: "Ben Doyle", email: "ben@bookme.test", verified: true },
  { name: "Clara Ryan", email: "clara@bookme.test", verified: true },
  { name: "Dan Fox", email: "dan@bookme.test", verified: false },
];

async function main() {
  const existing = await db.orm.public.User.where({
    email: SEED_ADMIN_EMAIL,
  }).first();
  if (existing) {
    console.log("Seed data already exists. Reset the database first.");
    return;
  }

  const password = await bcrypt.hash(PASSWORD, 10);

  const admin = await db.orm.public.User.create({
    name: "Admin",
    email: SEED_ADMIN_EMAIL,
    password,
    role: "ADMIN",
    emailVerifiedAt: daysFromNow(-30),
    createdAt: daysFromNow(-30),
  });
  console.log(`Admin: ${admin.email}`);

  const owners = [];
  for (const [i, owner] of OWNERS.entries()) {
    owners.push(
      await db.orm.public.User.create({
        ...owner,
        password,
        role: "BUSINESS_OWNER",
        emailVerifiedAt: daysFromNow(-28),
        createdAt: daysFromNow(-28 + i),
      }),
    );
  }

  const customers = [];
  for (const [i, customer] of CUSTOMERS.entries()) {
    customers.push(
      await db.orm.public.User.create({
        name: customer.name,
        email: customer.email,
        password,
        role: "CUSTOMER",
        emailVerifiedAt: customer.verified ? daysFromNow(-20) : null,
        createdAt: daysFromNow(-20 + i * 3),
      }),
    );
  }

  const resources = [];
  for (const [i, seed] of BUSINESSES.entries()) {
    const business = await db.orm.public.Business.create({
      ownerId: owners[i % owners.length]!.id,
      name: seed.name,
      email: `hello@${seed.name.toLowerCase().replace(/[^a-z]+/g, "")}.test`,
      phone: `+3538712345${String(10 + i)}`,
      type: seed.type,
      status: "APPROVED",
      description: seed.description,
      cancellationWindowHours: i % 3 === 0 ? 12 : 24,
      createdAt: daysFromNow(-(i * 2 + 1)),
    });

    const location = await db.orm.public.Location.create({
      businessId: business.id,
      country: "Ireland",
      city: seed.city,
      address: seed.address,
      timezone: "Europe/Dublin",
      openingHours: seed.hours,
    });

    for (const resource of seed.resources) {
      resources.push(
        await db.orm.public.Resource.create({
          locationId: location.id,
          ...resource,
        }),
      );
    }
  }
  console.log(
    `Businesses: ${BUSINESSES.length}, resources: ${resources.length}`,
  );

  const OFFSETS = [-28, -24, -21, -17, -14, -10, -7, -4, -2, 2, 4, 6, 9, 12];
  const HOURS = 2;
  let bookings = 0;

  for (const [i, offset] of OFFSETS.entries()) {
    for (let k = 0; k < 3; k++) {
      const resource = resources[(i + k) % resources.length];
      const customer = customers[(i + k) % customers.length];

      const past = offset < 0;
      const status = !past
        ? "CONFIRMED"
        : i % 7 === 3
          ? "NO_SHOW"
          : i % 7 === 5
            ? "CANCELLED"
            : "COMPLETED";

      await db.orm.public.Booking.create({
        customerId: customer!.id,
        resourceId: resource!.id,
        startTime: daysFromNow(offset, 10),
        endTime: daysFromNow(offset, 10 + HOURS),
        totalAmountCents: resource!.priceCents * HOURS,
        status,
        createdAt: daysFromNow(past ? offset - 2 : -1),
      });
      bookings++;
    }
  }
  console.log(`Bookings: ${bookings}`);

  console.log(
    `Done. Log in with any @bookme.test email and the password ${PASSWORD}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
