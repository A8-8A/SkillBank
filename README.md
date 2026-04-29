# SkillBank — Complete Project Documentation

## What Is SkillBank?

SkillBank is a web application where people exchange skills with each other using a credit-based system instead of money. Think of it like a bartering platform, but instead of trading physical goods, you trade your time and knowledge.

For example: if you know how to play guitar, you can teach someone for 1 hour and earn 1 credit. Then you can spend that credit to learn photography from someone else for 1 hour. Nobody pays money — you trade time for time.

Every new user starts with 1 free credit so they can begin learning right away, even before they teach anyone.

Users can also buy credits with real money ($15 for 1 credit, or $60 for 5 credits) and cash out credits for real money (5 credits = $50). This is how the platform makes money — the difference between what people pay and what they can cash out.

---

## How Is the Project Built?

The project has three separate parts that talk to each other over the internet:

### 1. The Frontend (What Users See)

This is the website itself — the pages, buttons, forms, and everything the user interacts with. It is built using:

- **React** — a popular tool for building interactive websites. Instead of loading a new page every time you click something, React updates only the part of the page that changed. This makes the app feel fast and smooth.
- **Vite** — a tool that bundles all the React code into files that browsers can understand. Think of it as a translator that turns developer code into website code.
- **CSS** — the styling rules that control how everything looks (colors, spacing, fonts, layout).
- **Axios** — a helper that sends requests from the frontend to the backend. When you click "Login," Axios sends your email and password to the backend and waits for a response.

The frontend is hosted on **Firebase Hosting** at `https://skillbank-489a8.web.app`. When you visit this URL, Firebase serves the website files to your browser.

### 2. The Backend (The Brain)

This is the server that handles all the logic — checking passwords, calculating balances, sending emails, matching users, and so on. The user never sees this directly. It is built using:

- **Spring Boot** (Java 17) — a framework for building server applications. It receives requests from the frontend (like "log me in" or "book a session"), processes them, and sends back responses.
- **Spring Security** — handles authentication (verifying who you are) and authorization (checking what you're allowed to do). It uses JWT tokens — a special coded string that proves you're logged in, sent with every request.
- **Hibernate** — automatically creates and manages database tables based on Java code. When the app starts, it looks at the Java classes and creates matching tables in the database if they don't exist.
- **Lombok** — a tool that automatically writes repetitive Java code (like getters, setters, constructors) so developers don't have to type it all out manually.

The backend is hosted on **Render** at `https://skillbank-api.onrender.com`. It runs inside a Docker container (a lightweight virtual computer that has everything the app needs to run).

### 3. The Database (The Memory)

This is where all the data is permanently stored — user accounts, skills, sessions, transactions, and everything else. It uses:

- **PostgreSQL** — a relational database, which means data is stored in tables with rows and columns (like Excel spreadsheets), and tables can reference each other.

The database is hosted on **Neon** (a cloud PostgreSQL service). The backend connects to it using a connection string (like a URL with a password).

### How They Connect

```
User's Browser
    │
    │ visits https://skillbank-489a8.web.app
    │
    ▼
Firebase Hosting (serves the website files)
    │
    │ website makes API calls to the backend
    │
    ▼
Render (runs the Spring Boot backend)
    │
    │ backend reads/writes data
    │
    ▼
Neon (PostgreSQL database)
```

Every time the frontend needs data (like "show me my profile"), it sends a request to the backend at `https://skillbank-api.onrender.com/api/...`. The backend checks the database, processes the request, and sends back the result as JSON (a structured text format that computers use to exchange data).

---

## Additional Services

### Firebase (Google)

Firebase provides three extra features on top of the core app:

- **Firebase Hosting** — serves the frontend website to users.
- **Firebase Analytics** — tracks how users interact with the app (which pages they visit, what buttons they click). This data helps understand user behavior. It is initialized in `frontend/src/firebase.js` and imported in `main.jsx`.
- **Firebase Storage** — stores profile pictures that users upload. When a user uploads a photo, it goes directly from their browser to Firebase Storage (not through the backend). Firebase returns a URL for that photo, and the backend saves that URL in the database.

### Gmail SMTP

The app sends emails using a Gmail account. "SMTP" is the protocol (set of rules) that computers use to send emails. The backend uses this to send:

- Email verification links when users register
- Password reset links when users forget their password
- Session booking notifications to teachers
- Session confirmation/rejection notifications to learners
- Auto-cancellation notices when sessions expire
- Session reminders 2 hours before a scheduled session (to both teacher and learner)
- Referral bonus notifications when someone joins using a referral code

---

## Database Tables

The database has these tables. Each table stores a different type of information:

### users

Stores every registered person's account information.

| Column | What It Stores |
|--------|---------------|
| id | A unique number assigned to each user (1, 2, 3, etc.) |
| name | The user's full name |
| email | Their email address (must be unique — no two users can have the same email) |
| password_hash | Their password, but scrambled so nobody can read it (even database admins). When they log in, the system scrambles what they typed and compares it to the stored scramble |
| bio | A short description about themselves |
| city | Where they're located |
| phone_number | Their phone number |
| profile_pic_url | A link to their profile picture stored in Firebase Storage |
| email_verified | Whether they clicked the verification link in their email (true/false) |
| verification_token | A random code sent in the verification email. Once they click the link, this is cleared |
| reset_token | A random code sent in the password reset email. Expires after 1 hour |
| reset_token_expiry | When the reset token expires |
| referral_code | A unique code like "ALI-A3F2C8" that other users can use when registering to earn both parties a bonus credit |
| referred_by | The ID of the user who referred this person (null if no referral was used) |
| role | Either USER or ADMIN. Admins see a completely different dashboard with platform management tools instead of the regular user interface |
| created_at | When they created their account |

### skills

The master list of all skills available on the platform.

| Column | What It Stores |
|--------|---------------|
| id | Unique skill number |
| name | The skill name (e.g., "Python Programming," "Guitar") |
| category_id | Which category this skill belongs to (links to skill_categories table) |
| custom | Whether this skill was created by a user (true) or came pre-loaded (false) |
| created_by | The user who created this custom skill (if applicable) |

### skill_categories

Groups skills into broad categories for organization.

| Column | What It Stores |
|--------|---------------|
| id | Unique category number |
| name | Category name (e.g., "Technology & Programming," "Music," "Languages") |

The app comes pre-loaded with 20 categories (set up by the DataInitializer when the app first starts).

### user_skills

Records which skills each user has and whether they teach or want to learn them.

| Column | What It Stores |
|--------|---------------|
| id | Unique entry number |
| user_id | Which user this belongs to |
| skill_id | Which skill this is about |
| type | Either OFFER (they can teach this) or SEEK (they want to learn this) |
| level | Their skill level: BEGINNER, INTERMEDIATE, or ADVANCED |
| description | Extra details about their experience with this skill |

### skill_tags

Links skills to searchable tags (a many-to-many relationship — one skill can have many tags, and one tag can be on many skills).

### sessions

Records every teaching session between two users.

| Column | What It Stores |
|--------|---------------|
| id | Unique session number |
| teacher_id | The user who is teaching |
| learner_id | The user who is learning |
| skill_id | What skill is being taught |
| scheduled_at | When the session is scheduled for (date and time) |
| duration_minutes | How long the session lasts (always 60 minutes) |
| status | The current state of the session (see Session Lifecycle below) |
| notes | Any notes the learner added when booking |
| reminder_sent | Whether the 2-hour reminder email has already been sent for this session (true/false). Prevents duplicate reminders |
| created_at | When the session was booked |

### availability_slots

Records when each teacher is available for sessions. Each slot represents one hour on a specific day of the week (recurring weekly).

| Column | What It Stores |
|--------|---------------|
| id | Unique slot number |
| user_id | Which user this availability belongs to |
| day_of_week | Which day (MONDAY, TUESDAY, etc.) |
| hour | Which hour (0-23, where 0 = midnight, 13 = 1 PM) |

### time_transactions

Records every credit movement in the system. This is how the app tracks everyone's balance.

| Column | What It Stores |
|--------|---------------|
| id | Unique transaction number |
| from_user_id | Who the credits came from (null if credits were added by the system) |
| to_user_id | Who received the credits (null if credits were deducted) |
| session_id | Which session this transaction is related to (null for purchases/redemptions) |
| hours | How many credits were moved |
| type | What kind of transaction (see Credit System below) |
| created_at | When this transaction happened |

### reviews

Records ratings and feedback left after completed sessions. Each user can only leave one review per session — enforced by a unique constraint on (session_id, reviewer_id).

| Column | What It Stores |
|--------|---------------|
| id | Unique review number |
| session_id | Which session this review is about |
| reviewer_id | The user who wrote the review |
| reviewee_id | The user being reviewed |
| type | TEACHING (a learner reviewing the teacher's teaching ability) or LEARNING (a teacher reviewing the learner's engagement) |
| rating | A score from 1 to 5 stars |
| comment | Optional written feedback about the experience |
| teacher_on_time | Whether the teacher showed up on time — yes or no (only filled in when a learner reviews a teacher) |
| content_useful | Whether the session content was useful — yes or no (only filled in when a learner reviews a teacher) |
| would_recommend | Whether the reviewer would recommend this person to others — yes or no |
| created_at | When the review was submitted |

### dispute_reports

Records complaints filed by learners about sessions that didn't go as expected.

| Column | What It Stores |
|--------|---------------|
| id | Unique dispute number |
| session_id | Which session is being disputed |
| filed_by_id | The learner who filed the complaint |
| reason | Why they're disputing (e.g., "Teacher didn't show up") |
| status | OPEN, RESOLVED_REFUND, or RESOLVED_RELEASE |
| resolved_by_id | The admin who resolved it |
| admin_notes | The admin's notes about the resolution |
| created_at | When the dispute was filed |
| resolved_at | When the dispute was resolved |

---

## How Each Feature Works

### User Registration and Email Verification

**What happens when someone creates an account:**

1. User fills out the registration form (name, email, password, city, bio, phone, and optionally a referral code).
2. The frontend sends this information to `POST /api/auth/register`.
3. The backend checks if the email is already taken. If yes, it returns an error.
4. The backend scrambles the password using BCrypt (a one-way scrambling algorithm — you can scramble "hello123" into "$2a$10$xyz..." but you can never reverse it back to "hello123").
5. The backend creates a random verification token (a long random string like "a4f2c8e1-...").
6. The backend generates a unique referral code for the new user (like "ALI-A3F2C8") so they can invite others later.
7. The backend saves the new user to the database with `emailVerified = false`.
8. The backend gives the user 1 free credit (by creating a PURCHASE transaction).
9. If a valid referral code was provided, both the new user and the referrer receive 1 bonus credit, and the referrer gets an email notification telling them someone joined using their code.
10. The backend sends a verification email containing a link like `https://skillbank-489a8.web.app/verify?token=a4f2c8e1-...`. This email is sent synchronously (not in a background thread) to ensure it actually sends before the registration response is returned.
11. The frontend shows "Check your email" instead of logging them in.

**What happens when they click the verification link:**

1. The browser opens `/verify?token=a4f2c8e1-...`.
2. The frontend sends a request to `GET /api/auth/verify?token=a4f2c8e1-...`.
3. The backend looks for a user with that token in the database.
4. If found, it sets `emailVerified = true` and clears the token.
5. The frontend shows "Email Verified" with a link to sign in.

### Login and Authentication

**What happens when someone logs in:**

1. User enters their email and password.
2. The frontend sends this to `POST /api/auth/login`.
3. The backend finds the user by email, scrambles the password they typed, and compares it to the stored scramble.
4. If the password is wrong, it returns "Invalid email or password."
5. If the email isn't verified, it returns "EMAIL_NOT_VERIFIED" and the frontend shows a "Resend verification email" option.
6. If everything is correct, the backend creates a JWT token — a long encoded string that contains the user's ID, email, and an expiration time (24 hours). This token is "signed" with a secret key so nobody can fake it.
7. The frontend stores this token in the browser's localStorage (a place where websites can save small pieces of data that persist even if you close the browser).
8. From now on, every request the frontend makes includes this token in the "Authorization" header. The backend reads the token, verifies its signature, and knows who is making the request.

**How JWT tokens work (simplified):**

Think of a JWT token like a stamped wristband at a concert. When you show your ticket (password) at the gate (login), they give you a wristband (token). For the rest of the night, you just show the wristband to get into any area (API endpoint). The wristband has a holographic stamp (signature) that can't be faked, and it expires when the concert is over (24 hours).

### Forgot Password and Reset

**What happens when someone forgets their password:**

1. User clicks "Forgot password?" on the login page.
2. They enter their email and the frontend sends it to `POST /api/auth/forgot-password`.
3. The backend looks for a user with that email. If found, it creates a random reset token and sets it to expire in 1 hour.
4. The backend sends an email with a link like `https://skillbank-489a8.web.app/reset-password?token=b5g3d9f2-...`.
5. The backend always responds "If that email exists, a reset link has been sent" — it never reveals whether the email exists or not (for security).

**What happens when they click the reset link:**

1. The browser opens `/reset-password?token=b5g3d9f2-...`.
2. User enters a new password (twice, to confirm).
3. The frontend sends the token and new password to `POST /api/auth/reset-password`.
4. The backend verifies the token exists and hasn't expired.
5. It scrambles the new password and saves it, then clears the reset token.

### Skills System

Users can list skills in two ways:

- **OFFER** — "I can teach this." They must specify their level (Beginner, Intermediate, or Advanced).
- **SEEK** — "I want to learn this." No level needed.

**Adding a skill:**

1. User goes to the Skills page and clicks "Add Skill."
2. They pick a category (e.g., "Music"), type the skill name (e.g., "Piano"), choose Teach or Learn, and pick their level.
3. The frontend sends this to `POST /api/skills/my`.
4. The backend checks if a skill with that name already exists in that category. If not, it creates a new custom skill.
5. It creates a UserSkill entry linking the user to the skill with their chosen type and level.
6. Users can't add the same skill twice with the same type (you can't list "Piano" as "Teach" twice, but you can list it as both "Teach" and "Learn").

**Browsing skills:**

The Skills page has a "Browse All" tab that shows every skill in the catalog. Users can search by name or filter by category. This uses the `GET /api/skills/all` endpoint to load all skills, or `GET /api/skills/search?q=...` for searching, or `GET /api/skills/category/{id}` for category filtering.

**Tags:**

Skills can have tags — extra keywords that help with searching. Tags are stored in a separate table and linked to skills through the `skill_tags` table. If a tag doesn't exist yet, it's automatically created.

### Matching System

The matching system finds other users you can exchange skills with. It works in three modes, shown as tabs in the order they appear:

**All Users:**

A searchable directory of every verified user on the platform (unverified users and admins are hidden). You can search by username, skill name, category, or tag. The search updates as you type with a small delay to avoid excessive requests. Each user card shows their "Teachable Skills" and "Learnable Skills." This is the default tab when opening the Matches page.

**One-Way Matches ("They teach me"):**

Users who offer skills you want to learn, regardless of whether they need anything from you. You'd still need credits to book a session with them.

**Mutual Matches:**

These are the best matches — people where both sides benefit. For example, if you teach Guitar and want to learn Cooking, and another user teaches Cooking and wants to learn Guitar, that's a mutual match.

The system finds these by looking at all users who offer skills you're seeking AND who are seeking skills you offer.

### Availability and Booking

**Setting availability (teacher side):**

1. Teacher goes to their Profile page and sees a grid with days of the week as columns and hours as rows.
2. They click cells to mark when they're available. Each click toggles a cell green (available) or empty (not available).
3. Each click sends a `POST /api/availability/toggle` request that either creates or deletes an availability slot.
4. If a slot has an active booking (PENDING or CONFIRMED session), the teacher cannot remove it. The cell shows red instead of green.

**Booking a session (learner side):**

1. Learner visits a teacher's profile and sees their availability grid.
2. Green cells are available and clickable. Red cells are booked and cannot be clicked.
3. Clicking a green cell opens a booking form where the learner picks which skill to learn, confirms the date/time, and adds optional notes.
4. The frontend sends a `POST /api/sessions` request.
5. The backend verifies:
   - The learner isn't booking themselves.
   - The session is at least 24 hours away.
   - The time slot doesn't overlap with another active session for that teacher.
   - The learner has enough credits.
6. If all checks pass, the backend creates the session as PENDING and holds 1 credit from the learner's balance (escrow).
7. The teacher gets an email notification about the new booking.

### Session Lifecycle

Every session goes through a series of states:

```
PENDING → CONFIRMED → COMPLETED (normal flow)
PENDING → CANCELLED (teacher rejects or 24h auto-cancel)
CONFIRMED → DISPUTED → RESOLVED_REFUND or RESOLVED_RELEASE
```

**PENDING:**

The session was just booked. 1 credit is held in escrow (taken from the learner's available balance but not yet given to the teacher). The teacher must confirm or reject before the session time.

**CONFIRMED:**

The teacher accepted the session. Both parties should show up at the scheduled time. An "Add to Google Calendar" button appears on the session card (see Google Calendar Integration below). A reminder email is sent to both parties 2 hours before the session.

**COMPLETED:**

After the session ends (the scheduled time + duration has passed), the system automatically releases the held credit to the teacher. This happens through a scheduled task that runs every 60 seconds. Both parties can then leave a review for each other.

**CANCELLED:**

The teacher rejected the session, OR the teacher didn't respond in time. If a session is still PENDING when it's less than 24 hours away from the scheduled time, a scheduled task automatically cancels it. In both cases, the held credit is returned to the learner.

**DISPUTED:**

The learner reported a problem (e.g., the teacher didn't show up). Disputes can only be filed during the session window (between the start time and end time). Once disputed, the session is frozen until an admin resolves it.

**RESOLVED_REFUND:**

An admin reviewed the dispute and sided with the learner. The held credit is returned to the learner.

**RESOLVED_RELEASE:**

An admin reviewed the dispute and sided with the teacher. The held credit is given to the teacher.

### Reviews and Ratings

After a session is completed, both the teacher and the learner can leave a review for each other. Reviews are separated by role so users build two distinct reputations:

**Teaching Reviews** — left by learners about the teacher. These include a 1-5 star rating, an optional written comment, and three yes/no feedback questions: "Did the teacher show up on time?", "Was the content useful?", and "Would you recommend this teacher?"

**Learning Reviews** — left by teachers about the learner. These include a 1-5 star rating, an optional written comment, and a "Would you recommend this learner?" question.

Each user's profile displays their average teaching rating (with the number of teaching reviews) and average learning rating (with the number of learning reviews), along with the total number of sessions they've taught and learned. This helps other users decide who to learn from or teach.

A "Leave a Review" button appears on completed session cards. Once a review is submitted, the button changes to "Reviewed." Each person can only review a given session once — this is enforced by a database constraint.

### Credit System (Escrow)

The credit system uses an escrow model. "Escrow" means a trusted middle-man holds onto something during a transaction.

**How balances are calculated:**

Instead of storing a single "balance" number, the system records every credit movement as a transaction. To find a user's balance, it adds up all credits they've received and subtracts all credits they've spent:

```
Balance = (sum of credits received) - (sum of credits spent)
```

Credits received include: initial 1 free credit (PURCHASE), referral bonuses (PURCHASE), credits from admin after buying (PURCHASE), credits from completed sessions where they taught (ESCROW_RELEASE), refunds from cancelled sessions (ESCROW_REFUND).

Credits spent include: credits held when booking a session (ESCROW_HOLD), credits deducted when redeeming for cash (REDEMPTION).

**Transaction types explained:**

| Type | What It Means | Effect on Balance |
|------|--------------|-------------------|
| PURCHASE | Credits were added (new user bonus, referral bonus, or admin added after payment) | +credits to user |
| ESCROW_HOLD | Credits were frozen when booking a session | -credits from learner |
| ESCROW_RELEASE | Credits were given to teacher after session completed | +credits to teacher |
| ESCROW_REFUND | Credits were returned to learner after cancellation | +credits to learner |
| REDEMPTION | Credits were deducted when user cashed out | -credits from user |

### Buying and Redeeming Credits (Wallet)

Because automated payment gateways like Stripe don't support Lebanon, the buying and redeeming process is handled manually through WhatsApp:

**Buying credits:**

1. User goes to the Wallet page and picks a package ($15 for 1 credit or $60 for 5 credits — presented as "4 + 1 free").
2. Clicking "Buy via WhatsApp" opens WhatsApp with a pre-filled message containing their account details and the chosen package.
3. The user sends the message to the platform owner.
4. The user pays via OMT, Wish Money, or bank transfer.
5. The platform owner (admin) logs into the app, goes to Admin → Credits, enters the user's email and the number of credits to add, and clicks "Add."
6. The backend creates a PURCHASE transaction and the user's balance updates immediately.

**Redeeming credits:**

1. User goes to the Wallet page → Redeem tab.
2. They need at least 5 credits to redeem. Clicking "Redeem via WhatsApp" opens WhatsApp with a pre-filled message.
3. The platform owner verifies the request, sends $50 to the user via OMT, Wish Money, or bank transfer.
4. The owner goes to Admin → Credits, enters the user's email and "5" as the amount, and clicks "Deduct."
5. The backend creates a REDEMPTION transaction and the user's balance decreases by 5.

### Profile Pictures

Profile pictures are stored using Firebase Storage:

1. User clicks on their avatar on their profile page.
2. A file picker opens and they select an image.
3. The frontend uploads the image directly to Firebase Storage (it goes straight to Google's servers, not through our backend).
4. Firebase returns a URL like `https://firebasestorage.googleapis.com/v0/b/skillbank.../profile-pictures/123_1234567890`.
5. The frontend sends this URL to the backend via `PATCH /api/users/me` with `profilePicUrl`.
6. The backend saves the URL in the user's database record.
7. Now every time someone views this user's profile, the backend returns the URL and the browser loads the image from Firebase.

### Referral System

Every user gets a unique referral code when they register (like "ALI-A3F2C8"). The user dashboard shows this code with a "Copy Link" button that copies a shareable registration URL (like `https://skillbank-489a8.web.app/register?ref=ALI-A3F2C8`).

When someone registers with a referral code — either by typing it into the registration form or by clicking a referral link — both the referrer and the new user receive 1 bonus credit. The referrer also gets an email notification telling them someone joined using their code.

### Profile Completion Prompt

The user dashboard shows a profile completion progress bar when the profile is not 100% complete. It tracks six items: name, bio, city, phone number, skills listed, and availability set. Each missing item is shown as a clickable link that takes the user to the right page to fill it in. The progress bar and hints disappear once the profile is fully complete.

### Session Reminders

A background task runs every 60 seconds checking for CONFIRMED sessions that are within 2 hours of their scheduled time and haven't had a reminder sent yet. When found, it sends reminder emails to both the teacher and the learner with the session details. Each session is only reminded once — the `reminderSent` flag is set to true after sending, preventing duplicate emails.

### Google Calendar Integration

When a session is CONFIRMED, an "Add to Google Calendar" button appears on the session card. Clicking it opens Google Calendar in a new tab with the session details pre-filled (skill name, teacher and learner names, time, and any notes). This is done through a simple URL — no OAuth login or API integration is needed. The user just clicks and the event is created in their Google Calendar.

### Dispute System

If something goes wrong with a session (teacher doesn't show up, session quality was poor, etc.), the learner can file a dispute:

1. During a CONFIRMED session (between the start time and end time), a "Report No-Show" button appears on the session card.
2. The learner clicks it and describes the issue.
3. The frontend sends a `POST /api/disputes` request.
4. The backend changes the session status to DISPUTED and creates a dispute report.
5. An admin sees the dispute in Admin → Disputes.
6. The admin reads the reason and decides:
   - **Refund Learner** — the credit goes back to the learner.
   - **Pay Teacher** — the credit goes to the teacher.
7. Both parties are notified of the resolution.

### Automatic Background Tasks (Schedulers)

Three tasks run automatically every 60 seconds in the background:

**Auto-cancel unconfirmed sessions:**

Checks for any session that is still PENDING and whose scheduled time is less than 24 hours away. These sessions are automatically cancelled, the learner's credit is refunded, and both parties receive an email notification.

**Auto-release completed sessions:**

Checks for any CONFIRMED session whose end time has passed and has no open dispute. These sessions are automatically marked as COMPLETED and the held credit is released to the teacher.

**Send session reminders:**

Checks for any CONFIRMED session whose scheduled time is within the next 2 hours and hasn't had a reminder sent yet. Sends reminder emails to both the teacher and the learner, then marks the session as reminded so it won't be reminded again.

### Admin Panel

Admins see a completely different interface from regular users. When logged in as an admin, the navigation bar changes to show admin-specific pages instead of the regular user pages (Dashboard, Skills, Sessions, Matches, Wallet, Profile). Admins cannot book sessions or manage their own skills — their role is purely platform management.

**Overview (Admin Dashboard):** Shows platform-wide statistics at a glance — total registered users, total sessions, total skills in the catalog, total skill listings, and total transactions. Below the stats are quick-link cards to each admin section.

**Users:** A searchable table of every registered user on the platform. Shows their name, email, city, role, email verification status, credit balance, and join date. The admin can search by name, email, or city.

**Sessions:** A complete list of every session on the platform with filters by status (All, Pending, Confirmed, Completed, Cancelled, Disputed). Shows session ID, skill, teacher and learner names and emails, scheduled date and time, status, and creation date.

**Credits:** A dedicated page for adding or deducting credits. The admin enters a user's email and the number of credits to add (after a purchase) or deduct (after a redemption). Includes a quick reference card showing the pricing: $15 per credit, $60 for 5 credits, $50 payout per 5 credits redeemed.

**Disputes:** Shows all open disputes. The admin can read the learner's complaint and choose to either refund the learner or pay the teacher, with optional admin notes explaining the decision.

---

## Frontend Pages Explained

### Public Pages (No Login Required)

| Page | URL | What It Does |
|------|-----|-------------|
| Homepage | `/` | Landing page that explains what SkillBank is, how credits work, shows a real example scenario (Sara and Karim exchanging French and Guitar), a detailed step-by-step walkthrough, an animated visual flow, a "Why SkillBank?" section, a FAQ with 5 expandable questions, and a sign-up call-to-action. Features rotating skill words in the hero section |
| Login | `/login` | Enter email and password to sign in. Shows "Forgot password?" link. Handles unverified emails with a "Resend verification" option |
| Register | `/register` | Create a new account with optional referral code. Supports referral links via `?ref=CODE` URL parameter. After submitting, shows "Check your email" with a verification message instead of logging in |
| Forgot Password | `/forgot-password` | Enter email to receive a password reset link |
| Reset Password | `/reset-password?token=...` | Set a new password (accessed only through the email link) |
| Verify Email | `/verify?token=...` | Confirms email verification (accessed only through the email link) |

### Protected Pages — Regular Users

| Page | URL | What It Does |
|------|-----|-------------|
| Dashboard | `/dashboard` | Home page after login. Shows credit balance, profile completion progress bar with clickable hints (if profile is incomplete), pending/upcoming sessions count, promo banners for buying/redeeming credits, referral code with a "Copy Link" button, quick action links, and recent sessions table |
| Skills | `/skills` | View and manage your skills. Two tabs: "My Skills" shows what you teach and want to learn with remove buttons. "Browse All" shows every skill in the catalog with search by name and filter by category |
| Sessions | `/sessions` | View all your sessions. Three tabs: All, Teaching (sessions where you're the teacher), Learning (sessions where you're the learner). Each session card shows status, skill, people involved, date, and action buttons (Confirm/Reject for teachers, Report No-Show for learners, Leave a Review for completed sessions, Add to Google Calendar for confirmed sessions) |
| Matches | `/matches` | Find people to exchange skills with. Three tabs: All Users (default — searchable directory of all verified users with their teachable/learnable skills), They Teach Me (people who can teach you), Mutual (people where both sides benefit) |
| Wallet | `/wallet` | Buy and redeem credits. Two tabs: Buy ($15 for 1 credit or $60 for 5 credits via WhatsApp) and Redeem ($50 for 5 credits via WhatsApp). Shows step-by-step instructions for each process |
| My Profile | `/profile` | View and edit your profile. Upload a profile picture by clicking the avatar. View your teaching and learning ratings with star averages, review counts, and session counts. Set your availability grid. Edit your name, bio, city, and phone number |
| Other User's Profile | `/user/:userId` | View another user's profile, their teaching/learning ratings, and their availability. Click available (green) slots to book a session |

### Protected Pages — Admin Only

| Page | URL | What It Does |
|------|-----|-------------|
| Overview | `/dashboard` | Platform statistics: total users, sessions, skills, skill listings, and transactions. Quick-link cards to each admin section |
| Users | `/admin/users` | Searchable table of all registered users showing name, email, city, role, verification status, balance, and join date |
| Sessions | `/admin/sessions` | All sessions on the platform with status filters (All, Pending, Confirmed, Completed, Cancelled, Disputed) showing full details |
| Credits | `/admin/credits` | Add or deduct credits for user purchases and redemptions with quick pricing reference |
| Disputes | `/admin/disputes` | Review and resolve open session disputes — refund learner or pay teacher |

### Shared Components

| Component | What It Does |
|-----------|-------------|
| Navbar | The top navigation bar. Shows completely different links depending on whether the user is a regular user or admin. Displays the user's name (with "(Admin)" label for admins) and a Logout button |
| ProtectedRoute | Wraps protected pages. If the user isn't logged in (no token in localStorage), it redirects them to the login page |
| AvailabilityGrid | The weekly availability calendar. Shows a grid of days × hours. Green = available, Red = booked, Empty = not set. Owners can click to add/remove slots (but can't remove booked slots). Visitors can click available slots to book. Includes a color legend |
| SessionCard | Displays a single session with all its details and action buttons based on status and the user's role. Includes a "Leave a Review" button for completed sessions and an "Add to Google Calendar" link for confirmed sessions |
| ReviewModal | A popup form for leaving a review after a completed session. Shows a 5-star rating selector, yes/no feedback questions (teacher on time? content useful? would recommend?), and an optional comment field |
| ProfileStats | Displays a user's teaching and learning ratings side by side, with star averages, review counts, and total session counts. Only appears on profiles that have at least one completed session or review |
| AuthContext | Manages the logged-in user's state across the entire app. Provides `login`, `register`, and `logout` functions that all pages can use |

---

## Backend Architecture Explained

### How the Backend is Organized

The backend is organized into "packages" (folders), where each package handles one area of the app:

| Package | What It Handles |
|---------|----------------|
| `auth` | Registration (with referral support), login, email verification, password reset |
| `user` | User profiles, editing profile info, review stats |
| `skill` | Skills, categories, tags, adding/removing user skills, browsing the skill catalog |
| `session` | Booking, confirming, cancelling, viewing sessions |
| `availability` | Teacher availability slots (the weekly grid) |
| `transaction` | Credit balance calculations, escrow holds/releases/refunds, redemptions |
| `match` | Finding compatible users to exchange skills with, searching all users |
| `review` | Submitting and retrieving reviews/ratings after completed sessions |
| `dispute` | Filing and resolving session disputes |
| `email` | Sending all email notifications (verification, password reset, booking, reminders, referrals, cancellations) |
| `scheduler` | Background tasks (auto-cancel, auto-release, session reminders) |
| `admin` | Admin-only endpoints: platform stats, user listing, session listing, credit management |
| `config` | Security settings, JWT handling, CORS rules, database seeding |
| `exception` | Error handling (converting errors into readable messages) |

### How a Request Flows Through the Backend

Here's what happens when a request comes in, using "book a session" as an example:

```
1. Request arrives: POST /api/sessions with JWT token in header
                    ↓
2. CorsFilter checks: Is this request from an allowed website?
   (localhost:5173, skill-bank-phi.vercel.app, or skillbank-489a8.web.app)
                    ↓
3. JwtAuthFilter extracts the JWT token, verifies the signature,
   finds the user in the database, and sets them as the "current user"
                    ↓
4. SecurityConfig checks: Is /api/sessions a protected endpoint?
   Yes → is the user authenticated? Yes → allow.
                    ↓
5. SessionController.book() receives the request and passes it
   to SessionService.book()
                    ↓
6. SessionService.book() runs the business logic:
   - Validates the request (not booking yourself, 24h advance, etc.)
   - Checks for time slot conflicts
   - Creates the session in the database
   - Calls EscrowService to hold credits
   - Calls EmailService to notify the teacher
                    ↓
7. Response sent back to the frontend with the created session details
```

### Security Configuration

**SecurityConfig.java** defines which endpoints are public and which require login:

- `/api/auth/**` — Public (anyone can register, login, verify email, reset password)
- `/api/admin/**` — Requires ADMIN role
- Everything else — Requires authentication (valid JWT token)

**CorsConfig.java** defines which websites can make requests to the backend:

- `http://localhost:5173` — For local development
- `https://skill-bank-phi.vercel.app` — The Vercel deployment (backup)
- `https://skillbank-489a8.web.app` — The Firebase deployment (primary)

Any request from a different website is rejected. This prevents random websites from making requests to your backend.

---

## Configuration and Environment Variables

The backend uses environment variables so sensitive information (passwords, secret keys) is not stored in the code. On Render, these are set in the dashboard:

| Variable | What It's For |
|----------|--------------|
| SPRING_DATASOURCE_URL | The connection URL to the Neon PostgreSQL database |
| SPRING_DATASOURCE_USERNAME | Database username |
| SPRING_DATASOURCE_PASSWORD | Database password |
| JWT_SECRET | The secret key used to sign JWT tokens. If someone gets this, they could forge tokens and impersonate any user |
| SPRING_MAIL_USERNAME | The Gmail address used to send emails |
| SPRING_MAIL_PASSWORD | The Gmail app password (a 16-character password generated in Google account settings, not the regular Gmail password) |
| APP_URL | The frontend URL (`https://skillbank-489a8.web.app`). Used in email links so verification and reset links point to the right place |

When running locally, default values are used instead (defined in `application.properties` after the colon, like `${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/skillbank}`).

---

## Deployment Architecture

| Service | Provider | Plan | What It Hosts |
|---------|----------|------|--------------|
| Frontend | Firebase Hosting | Free (Spark) | The React website |
| Backend | Render | Free tier | The Spring Boot API server |
| Database | Neon | Free tier (0.5 GB) | PostgreSQL database |
| File Storage | Firebase Storage | Pay-as-you-go (Blaze) | Profile pictures |
| Analytics | Firebase Analytics | Free | User behavior tracking |
| Email | Gmail SMTP | Free | All email notifications |

**Important notes about free tiers:**

- Render's free tier "spins down" the backend after 15 minutes of no activity. The first request after it spins down takes about 30 seconds while it starts back up. After that, it's fast again.
- Neon's free tier includes 0.5 GB of storage, which is plenty for thousands of users.
- Firebase Storage on the Blaze plan has a generous free allowance (5 GB). You only pay if you exceed it.

---

## File Structure

```
skillbank/
├── Dockerfile                          # Instructions for building the Docker container
├── docker-compose.yml                  # Local development database setup
├── pom.xml                             # Backend dependencies and build configuration
│
├── src/main/java/com/skillbank/        # Backend source code
│   ├── SkillBankApplication.java       # The starting point — launches the entire backend
│   ├── admin/                          # Admin endpoints: stats, user list, session list, credit management
│   ├── auth/                           # Login, register (with referrals), verification, password reset
│   ├── availability/                   # Teacher availability grid
│   ├── config/                         # Security, JWT, CORS, database seeding
│   ├── dispute/                        # Session dispute reporting and resolution
│   ├── email/                          # All email sending logic (verification, booking, reminders, referrals)
│   ├── exception/                      # Error handling
│   ├── match/                          # Finding compatible users, searching all users
│   ├── review/                         # Reviews and ratings after completed sessions
│   ├── scheduler/                      # Background tasks (auto-cancel, auto-release, reminders)
│   ├── session/                        # Session booking, confirming, cancelling
│   ├── skill/                          # Skills, categories, tags
│   ├── transaction/                    # Credit system and escrow
│   └── user/                           # User profiles
│
├── src/main/resources/
│   └── application.properties          # Configuration (database URL, email settings, etc.)
│
└── frontend/                           # Frontend source code
    ├── index.html                      # The single HTML page that loads the React app
    ├── firebase.json                   # Firebase Hosting configuration
    ├── vercel.json                     # Vercel configuration (backup deployment)
    ├── vite.config.js                  # Vite build tool configuration
    ├── package.json                    # Frontend dependencies
    │
    ├── public/                         # Static files served as-is
    │   ├── favicon.ico                 # Browser tab icon (small)
    │   └── favicon_512.png             # Browser tab icon (large)
    │
    └── src/
        ├── main.jsx                    # Entry point — renders the React app
        ├── App.jsx                     # Route definitions (which URL shows which page)
        ├── index.css                   # All styling for the entire app
        ├── firebase.js                 # Firebase configuration (Analytics + Storage)
        │
        ├── api/
        │   └── client.js              # Axios HTTP client (sends requests to the backend)
        │
        ├── context/
        │   └── AuthContext.jsx         # Manages who is logged in
        │
        ├── components/
        │   ├── Navbar.jsx              # Top navigation bar (different for admin vs regular user)
        │   ├── ProtectedRoute.jsx      # Redirects to login if not authenticated
        │   ├── AvailabilityGrid.jsx    # Weekly availability calendar with booked slot indicators
        │   ├── SessionCard.jsx         # Displays a session with review and calendar buttons
        │   ├── ReviewModal.jsx         # Popup form for leaving reviews after sessions
        │   └── ProfileStats.jsx        # Displays teaching/learning ratings on profiles
        │
        └── pages/
            ├── HomePage.jsx            # Landing page with walkthrough, example, FAQ, and sign-up CTA
            ├── Login.jsx               # Sign in page
            ├── Register.jsx            # Create account page (with referral code support)
            ├── ForgotPassword.jsx      # Request password reset
            ├── ResetPassword.jsx       # Set new password
            ├── VerifyEmail.jsx         # Email verification confirmation
            ├── Dashboard.jsx           # Routes to UserDashboard or AdminDashboard based on role
            ├── UserDashboard.jsx        # Regular user dashboard with completion bar and referrals
            ├── AdminDashboard.jsx       # Admin overview with platform stats
            ├── AdminUsers.jsx           # Admin: view all users
            ├── AdminSessions.jsx        # Admin: view all sessions with filters
            ├── AdminCredits.jsx         # Admin: add/deduct user credits
            ├── AdminDisputes.jsx        # Admin: resolve session disputes
            ├── Skills.jsx              # Manage and browse all skills
            ├── Sessions.jsx            # View all sessions
            ├── Matches.jsx             # Find skill exchange partners (with All Users search)
            ├── Wallet.jsx              # Buy and redeem credits
            └── Profile.jsx             # User profile with availability and ratings
```

---

## How to Run Locally

1. **Start the database:** Run `docker-compose up` in the project root. This starts a local PostgreSQL database.

2. **Start the backend:** Open the project in an IDE (like IntelliJ) and run `SkillBankApplication.java`, or run `./mvnw spring-boot:run` in the terminal.

3. **Start the frontend:** Open a terminal in the `frontend/` folder and run:
   ```
   npm install    (first time only — installs dependencies)
   npm run dev    (starts the development server)
   ```

4. **Open the app:** Visit `http://localhost:5173` in your browser.

The local setup uses the default values from `application.properties` — local PostgreSQL on port 5432, and the Vite proxy forwards `/api` requests to `localhost:8080`.
