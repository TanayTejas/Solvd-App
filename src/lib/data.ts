// Seed data for the solvd. demo (01_PROJECT_CONTEXT.md, section 8.3).
// Shapes follow the draft data model in section 9.2, so the same data can be
// loaded into Postgres later (see db/schema.sql and db/seed.sql).

export type NicheSlug =
  | "student" | "hosteller" | "shop_owner" | "freelancer"
  | "fitness" | "home_cook" | "commuter" | "parent";

export type Niche = { slug: NicheSlug; label: string; plural: string; icon: string; tint: string };

export const NICHES: Niche[] = [
  { slug: "student", label: "Student", plural: "Students", icon: "🎓", tint: "bg-yellow" },
  { slug: "hosteller", label: "Hosteller", plural: "Hostellers", icon: "🏠", tint: "bg-pink" },
  { slug: "shop_owner", label: "Shop owner", plural: "Shop owners", icon: "🛒", tint: "bg-peach" },
  { slug: "freelancer", label: "Freelancer", plural: "Freelancers", icon: "💻", tint: "bg-sky" },
  { slug: "fitness", label: "Fitness", plural: "Fitness fans", icon: "🏋️", tint: "bg-mint" },
  { slug: "home_cook", label: "Home cook", plural: "Home cooks", icon: "🍳", tint: "bg-peach" },
  { slug: "commuter", label: "Commuter", plural: "Commuters", icon: "🚌", tint: "bg-sky" },
  { slug: "parent", label: "Parent", plural: "Parents", icon: "👨‍👩‍👧", tint: "bg-pink" },
];

export const nicheBySlug = (s: string) => NICHES.find((n) => n.slug === s);

export type PricingType = "free" | "per_use" | "monthly";

export type Review = { name: string; rating: number; text: string; daysAgo: number };

export type App = {
  slug: string;
  name: string;
  icon: string;
  tint: string; // tailwind bg class for the icon tile
  tagline: string;
  description: string;
  developer: string;
  niches: NicheSlug[];
  pricingType: PricingType;
  priceInr: number;
  rating: number;
  usersCount: number;
  status: "beta" | "live";
  verified: boolean;
  securityScore: number;
  licence: string;
  updatedDaysAgo: number;
  newDeveloper: boolean;
  keywords: string[];
  reviews: Review[];
};

export const APPS: App[] = [
  {
    slug: "messmate", name: "MessMate", icon: "🍛", tint: "bg-peach",
    tagline: "Mess menu, dish ratings & extras bill",
    description: "Weekly mess menu, dish ratings and extra-item bill tracking.",
    developer: "rahul-dev", niches: ["hosteller", "student"], pricingType: "monthly", priceInr: 9,
    rating: 4.5, usersCount: 1200, status: "live", verified: true, securityScore: 92, licence: "MIT",
    updatedDaysAgo: 3, newDeveloper: false,
    keywords: ["mess", "menu", "food", "hostel", "bill", "extras", "dish", "rating", "split"],
    reviews: [
      { name: "Ananya", rating: 5, text: "Finally know what's for dinner before walking to the mess. The extras bill is a lifesaver.", daysAgo: 2 },
      { name: "Karthik", rating: 4, text: "Dish ratings are spot on. Wish it had a Sunday special alert.", daysAgo: 6 },
    ],
  },
  {
    slug: "billsplit", name: "BillSplit", icon: "🧾", tint: "bg-mint",
    tagline: "Split any bill, send UPI reminders",
    description: "Split mess extras, trips and Maggi runs between friends, then send UPI reminders in one tap.",
    developer: "sneha-codes", niches: ["hosteller", "student"], pricingType: "free", priceInr: 0,
    rating: 4.6, usersCount: 2300, status: "live", verified: true, securityScore: 95, licence: "MIT",
    updatedDaysAgo: 1, newDeveloper: false,
    keywords: ["split", "bill", "money", "upi", "friends", "mess", "hostel", "expense", "share", "pay"],
    reviews: [
      { name: "Priya", rating: 5, text: "Six roommates, zero arguments. The UPI reminder button is genius.", daysAgo: 1 },
      { name: "Aditya", rating: 4, text: "Simple and fast. Would love a trip mode.", daysAgo: 9 },
    ],
  },
  {
    slug: "laundryq", name: "LaundryQ", icon: "🧺", tint: "bg-sky",
    tagline: "See which machine is free",
    description: "Check washing machine queues in your hostel block and get pinged when it's your turn.",
    developer: "arjun-builds", niches: ["hosteller"], pricingType: "free", priceInr: 0,
    rating: 4.1, usersCount: 640, status: "beta", verified: true, securityScore: 84, licence: "Apache-2.0",
    updatedDaysAgo: 5, newDeveloper: false,
    keywords: ["laundry", "washing", "machine", "queue", "hostel", "clothes", "slot"],
    reviews: [{ name: "Rohit", rating: 4, text: "Saves me two trips downstairs every week.", daysAgo: 4 }],
  },
  {
    slug: "attendcalc", name: "AttendCalc", icon: "📊", tint: "bg-violet-tint",
    tagline: "Attendance % for every subject",
    description: "Track attendance for all your subjects and see how many classes you can safely skip.",
    developer: "rahul-dev", niches: ["student"], pricingType: "free", priceInr: 0,
    rating: 4.8, usersCount: 3100, status: "live", verified: true, securityScore: 92, licence: "MIT",
    updatedDaysAgo: 2, newDeveloper: false,
    keywords: ["attendance", "class", "classes", "bunk", "subject", "percent", "75", "track", "lecture"],
    reviews: [
      { name: "Priya", rating: 5, text: "I posted this request and now it exists. Shows exactly how many classes I can miss.", daysAgo: 1 },
      { name: "Meera", rating: 5, text: "Clean and does one thing perfectly.", daysAgo: 3 },
    ],
  },
  {
    slug: "duesoon", name: "DueSoon", icon: "⏰", tint: "bg-pink",
    tagline: "Never miss a deadline or due date",
    description: "Assignments, library books and fee deadlines in one countdown list with reminders.",
    developer: "kavya-k", niches: ["student"], pricingType: "monthly", priceInr: 5,
    rating: 4.4, usersCount: 1800, status: "live", verified: true, securityScore: 90, licence: "MIT",
    updatedDaysAgo: 4, newDeveloper: false,
    keywords: ["deadline", "due", "reminder", "assignment", "library", "book", "fee", "remind", "exam"],
    reviews: [{ name: "Vikram", rating: 4, text: "Library fine count: zero this semester.", daysAgo: 5 }],
  },
  {
    slug: "gpa-plotter", name: "GPA Plotter", icon: "📈", tint: "bg-mint",
    tagline: "Plot your CGPA, plan your next sem",
    description: "Enter grades, see your CGPA trend and find out what you need next semester.",
    developer: "nikhil-dev", niches: ["student"], pricingType: "per_use", priceInr: 2,
    rating: 4.3, usersCount: 950, status: "live", verified: true, securityScore: 88, licence: "MIT",
    updatedDaysAgo: 8, newDeveloper: false,
    keywords: ["gpa", "cgpa", "grade", "grades", "marks", "semester", "result", "plot"],
    reviews: [{ name: "Sana", rating: 4, text: "The 'what do I need' calculator is scary but useful.", daysAgo: 7 }],
  },
  {
    slug: "timetabler", name: "TimeTabler", icon: "🗓️", tint: "bg-sky",
    tagline: "Timetable photo → calendar",
    description: "Snap your timetable and get every class added to your calendar, with room numbers.",
    developer: "ishaan-new", niches: ["student"], pricingType: "free", priceInr: 0,
    rating: 4.2, usersCount: 210, status: "beta", verified: true, securityScore: 86, licence: "MIT",
    updatedDaysAgo: 1, newDeveloper: true,
    keywords: ["timetable", "calendar", "schedule", "class", "photo", "events", "routine"],
    reviews: [{ name: "Dev", rating: 4, text: "Got 90% of my classes right from one photo.", daysAgo: 2 }],
  },
  {
    slug: "flashprep", name: "FlashPrep", icon: "⚡", tint: "bg-yellow",
    tagline: "Turn notes into flashcards",
    description: "Paste your notes and get quiz flashcards for quick revision before compre.",
    developer: "tanvi-first", niches: ["student"], pricingType: "per_use", priceInr: 1,
    rating: 4.5, usersCount: 180, status: "live", verified: true, securityScore: 89, licence: "MIT",
    updatedDaysAgo: 2, newDeveloper: true,
    keywords: ["flashcard", "notes", "revision", "exam", "quiz", "study", "compre", "midsem"],
    reviews: [{ name: "Riya", rating: 5, text: "Night-before-midsem essential.", daysAgo: 1 }],
  },
  {
    slug: "notesnap", name: "NoteSnap", icon: "📸", tint: "bg-pink",
    tagline: "Photograph the board, get clean notes",
    description: "Snap the whiteboard and get neat, searchable notes sorted by subject.",
    developer: "farhan-first", niches: ["student"], pricingType: "free", priceInr: 0,
    rating: 4.0, usersCount: 95, status: "beta", verified: true, securityScore: 83, licence: "GPL-3.0",
    updatedDaysAgo: 6, newDeveloper: true,
    keywords: ["notes", "photo", "board", "whiteboard", "scan", "lecture", "class"],
    reviews: [{ name: "Neha", rating: 4, text: "Works great on clear boards.", daysAgo: 3 }],
  },
  {
    slug: "splitit", name: "SplitIt", icon: "➗", tint: "bg-peach",
    tagline: "Quick even splits for groups",
    description: "Type the total and the number of people. That's it.",
    developer: "om-first", niches: ["hosteller", "student"], pricingType: "free", priceInr: 0,
    rating: 3.9, usersCount: 60, status: "beta", verified: false, securityScore: 74, licence: "MIT",
    updatedDaysAgo: 10, newDeveloper: true,
    keywords: ["split", "bill", "share", "group", "mess", "hostel", "divide"],
    reviews: [],
  },
  {
    slug: "stockping", name: "StockPing", icon: "📦", tint: "bg-peach",
    tagline: "Low-stock alerts for kirana shops",
    description: "Track stock for your shop and get a WhatsApp-style alert before items run out.",
    developer: "meena-builds", niches: ["shop_owner"], pricingType: "monthly", priceInr: 29,
    rating: 4.3, usersCount: 120, status: "beta", verified: true, securityScore: 87, licence: "MIT",
    updatedDaysAgo: 3, newDeveloper: true,
    keywords: ["stock", "kirana", "shop", "inventory", "alert", "store"],
    reviews: [],
  },
  {
    slug: "invoiceit", name: "InvoiceIt", icon: "💸", tint: "bg-sky",
    tagline: "GST-ready invoices in 30 seconds",
    description: "Make clean invoices with UPI QR codes and track who has paid.",
    developer: "kabir-dev", niches: ["freelancer", "shop_owner"], pricingType: "per_use", priceInr: 3,
    rating: 4.4, usersCount: 410, status: "live", verified: true, securityScore: 91, licence: "MIT",
    updatedDaysAgo: 5, newDeveloper: false,
    keywords: ["invoice", "bill", "client", "payment", "gst", "freelance", "upi"],
    reviews: [],
  },
  {
    slug: "repcount", name: "RepCount", icon: "💪", tint: "bg-mint",
    tagline: "Log sets, track streaks",
    description: "A tiny gym log with streaks and progressive overload hints.",
    developer: "aman-fit", niches: ["fitness"], pricingType: "free", priceInr: 0,
    rating: 4.2, usersCount: 330, status: "live", verified: true, securityScore: 88, licence: "MIT",
    updatedDaysAgo: 7, newDeveloper: false,
    keywords: ["gym", "workout", "fitness", "exercise", "sets", "reps", "streak"],
    reviews: [],
  },
  {
    slug: "mealmath", name: "MealMath", icon: "🥘", tint: "bg-yellow",
    tagline: "Scale any recipe, list the groceries",
    description: "Scale recipes for 2 or 20 and get a shopping list in grams.",
    developer: "pooja-cooks", niches: ["home_cook", "parent"], pricingType: "free", priceInr: 0,
    rating: 4.1, usersCount: 150, status: "live", verified: true, securityScore: 85, licence: "MIT",
    updatedDaysAgo: 9, newDeveloper: false,
    keywords: ["recipe", "cook", "grocery", "meal", "food", "kitchen"],
    reviews: [],
  },
  {
    slug: "busbuddy", name: "BusBuddy", icon: "🚌", tint: "bg-sky",
    tagline: "Campus and city bus timings",
    description: "Live-ish bus timings from campus to the city, crowd-sourced by students.",
    developer: "sai-dev", niches: ["commuter", "student"], pricingType: "free", priceInr: 0,
    rating: 4.0, usersCount: 520, status: "live", verified: true, securityScore: 86, licence: "MIT",
    updatedDaysAgo: 4, newDeveloper: false,
    keywords: ["bus", "commute", "travel", "timing", "transport", "city"],
    reviews: [],
  },
  {
    slug: "tiffintimer", name: "TiffinTimer", icon: "🍱", tint: "bg-pink",
    tagline: "Plan the week's school tiffins",
    description: "A weekly tiffin planner with no-repeat suggestions kids actually eat.",
    developer: "lata-builds", niches: ["parent", "home_cook"], pricingType: "monthly", priceInr: 15,
    rating: 4.3, usersCount: 90, status: "live", verified: true, securityScore: 88, licence: "MIT",
    updatedDaysAgo: 6, newDeveloper: true,
    keywords: ["tiffin", "lunch", "kids", "school", "meal", "plan"],
    reviews: [],
  },
];

export type RequestStatus = "open" | "building" | "live";

export type AppRequest = {
  id: string;
  title: string;
  description: string;
  niches: NicheSlug[];
  upvotes: number;
  bountyInr: number;
  status: RequestStatus;
  builders: number;
  author: string;
  linkedAppSlug?: string;
  createdAt: number; // ms timestamp
};

const day = 24 * 60 * 60 * 1000;
const T0 = Date.UTC(2026, 10, 10);

export const REQUESTS: AppRequest[] = [
  { id: "r-timetable", title: "Timetable photo → calendar", description: "I want to take a photo of my timetable and get all my classes in Google Calendar.", niches: ["student"], upvotes: 180, bountyInr: 0, status: "open", builders: 1, author: "Dev", createdAt: T0 - 9 * day },
  { id: "r-attendance", title: "Track attendance % for all my subjects", description: "Show attendance per subject and how many classes I can still miss to stay above 75%.", niches: ["student"], upvotes: 128, bountyInr: 0, status: "building", builders: 3, author: "Priya", createdAt: T0 - 12 * day },
  { id: "r-library", title: "Remind me before library books are due", description: "A reminder two days before my library books are due so I don't pay fines.", niches: ["student"], upvotes: 64, bountyInr: 500, status: "open", builders: 0, author: "Vikram", createdAt: T0 - 5 * day },
  { id: "r-laundry", title: "Laundry slot booking", description: "Book a washing machine slot in the hostel instead of waiting in line.", niches: ["hosteller"], upvotes: 54, bountyInr: 0, status: "open", builders: 0, author: "Priya", createdAt: T0 - 3 * day },
  { id: "r-kirana", title: "Stock tracker for a small kirana shop", description: "Track stock and get alerts before items run out.", niches: ["shop_owner"], upvotes: 75, bountyInr: 0, status: "open", builders: 0, author: "Ramesh", createdAt: T0 - 7 * day },
  { id: "r-split", title: "Split mess extras between roommates", description: "Split the extra mess bill fairly and remind people to pay.", niches: ["hosteller", "student"], upvotes: 96, bountyInr: 0, status: "live", builders: 1, author: "Ananya", linkedAppSlug: "billsplit", createdAt: T0 - 40 * day },
  { id: "r-gym", title: "Gym crowd meter for the campus gym", description: "Know how crowded the gym is before walking there.", niches: ["fitness", "student"], upvotes: 22, bountyInr: 200, status: "open", builders: 0, author: "Aman", createdAt: T0 - 1 * day },
];

export type Notification = {
  id: string;
  icon: string;
  tint: string;
  title: string;
  body: string;
  link?: string;
  linkLabel?: string;
  read: boolean;
  createdAt: number;
};

export const NOTIFICATIONS: Notification[] = [
  { id: "n1", icon: "🎉", tint: "bg-yellow", title: "AttendCalc is live!", body: "The app you upvoted is ready.", link: "/app/attendcalc", linkLabel: "Try free", read: false, createdAt: T0 - 1 * 3600e3 },
  { id: "n2", icon: "💡", tint: "bg-violet-tint", title: "3 developers started building", body: "'Laundry slot booking' is being built.", link: "/requests", linkLabel: "See request", read: false, createdAt: T0 - 5 * 3600e3 },
  { id: "n3", icon: "⏰", tint: "bg-pink", title: "Your MessMate trial ends tomorrow", body: "2 free uses left, then ₹9/month.", link: "/app/messmate", linkLabel: "Open", read: false, createdAt: T0 - 20 * 3600e3 },
  { id: "n4", icon: "⭐", tint: "bg-mint", title: "Rahul replied to your feedback", body: "On BillSplit: “Trip mode is coming next week!”", link: "/app/billsplit", read: false, createdAt: T0 - 26 * 3600e3 },
  { id: "n5", icon: "✅", tint: "bg-sky", title: "Welcome to solvd.", body: "Your feed is tuned for Student · Hosteller.", read: true, createdAt: T0 - 4 * day },
  { id: "n6", icon: "🧾", tint: "bg-canvas", title: "BillSplit added to My apps", body: "You kept it after the free trial.", read: true, createdAt: T0 - 6 * day },
];

export type MyApp = { slug: string; state: "kept" | "trial"; usesLeft: number };

export const MY_APPS: MyApp[] = [
  { slug: "billsplit", state: "kept", usesLeft: 0 },
  { slug: "duesoon", state: "kept", usesLeft: 0 },
  { slug: "messmate", state: "trial", usesLeft: 2 },
];

export const FREE_USES = 3;

export const CURRENT_USER = { name: "Priya", handle: "priya", college: "BITS Pilani Hyderabad" };
export const DEVELOPER = { name: "Rahul", handle: "rahul-dev", skills: ["React", "Python"] };

export const TRENDING_SLUGS = ["attendcalc", "duesoon", "gpa-plotter", "billsplit"];
