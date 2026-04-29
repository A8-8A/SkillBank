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

Built with React, Vite, CSS, and Axios. Hosted on **Firebase Hosting** at `https://skillbank-489a8.web.app`.

### 2. The Backend (The Brain)

Built with Spring Boot (Java 17), Spring Security, Hibernate, and Lombok. Hosted on **Render** at `https://skillbank-api.onrender.com` inside a Docker container.

### 3. The Database (The Memory)

PostgreSQL hosted on **Neon** (cloud service). The backend connects via a connection string.

### How They Connect

```
User's Browser → Firebase Hosting → Render (Spring Boot API) → Neon (PostgreSQL)
```

---

## Additional Services

- **Firebase Hosting** — serves the frontend website
- **Firebase Analytics** — tracks user behavior (initialized in `firebase.js`)
- **Firebase Storage** — stores profile pictures uploaded by users
- **Gmail SMTP** — sends all emails: verification, password reset, booking notifications, session reminders (2 hours before), referral bonus notifications, and auto-cancellation notices

---

## Database Tables

### users

| Column | What It Stores |
|--------|---------------|
| id | Unique user number |
| name | Full name |
| email | Email address (unique) |
| password_hash | Scrambled password (BCrypt) |
| bio | Short description |
| city | Location |
| phone_number | Phone number |
| profile_pic_url | Firebase Storage link to profile picture |
| email_verified | Whether email was verified (true/false) |
| verification_token | Random code for email verification |
| reset_token | Random code for password reset (expires in 1 hour) |
| reset_token_expiry | When the reset token expires |
| referral_code | Unique code like "ALI-A3F2C8" for inviting friends |
| referred_by | ID of the user who referred this person |
| role | USER or ADMIN |
| created_at | Account creation date |

### sessions

| Column | What It Stores |
|--------|---------------|
| id | Unique session number |
| teacher_id / learner_id / skill_id | Who is involved and what skill |
| scheduled_at | When the session is scheduled |
| duration_minutes | Always 60 minutes |
| status | PENDING, CONFIRMED, COMPLETED, CANCELLED, or DISPUTED |
| notes | Learner's notes when booking |
| reminder_sent | Whether the 2-hour reminder was sent (prevents duplicates) |
| created_at | When booked |

### reviews (NEW)

| Column | What It Stores |
|--------|---------------|
| id | Unique review number |
| session_id | Which session this is about |
| reviewer_id / reviewee_id | Who wrote it and who is being reviewed |
| type | TEACHING (learner reviews teacher) or LEARNING (teacher reviews learner) |
| rating | 1-5 stars |
| comment | Optional written feedback |
| teacher_on_time | Did the teacher show up on time? (only for teaching reviews) |
| content_useful | Was the content useful? (only for teaching reviews) |
| would_recommend | Would you recommend this person? |
| created_at | When submitted |

### Other tables (unchanged)

- **skills** — master list of all skills
- **skill_categories** — 20 pre-loaded categories
- **user_skills** — which user teaches/wants to learn which skill
- **skill_tags** — searchable tags linked to skills
- **availability_slots** — weekly availability grid per user
- **time_transactions** — every credit movement (PURCHASE, ESCROW_HOLD, ESCROW_RELEASE, ESCROW_REFUND, REDEMPTION)
- **dispute_reports** — complaints about sessions

---

## How Each Feature Works

### Registration and Email Verification

1. User fills out the form (name, email, password, city, bio, phone, optional referral code)
2. Backend scrambles password, generates verification token and referral code
3. User gets 1 free credit. If a valid referral code was used, both parties get 1 bonus credit
4. Verification email is sent. User must click the link before they can log in

### Login and JWT Authentication

User logs in with email/password. Backend returns a JWT token (valid 24 hours). Frontend stores it and sends it with every request. Think of it like a concert wristband — show it to access any area.

### Forgot Password / Reset

User enters email → backend sends a reset link (expires in 1 hour) → user clicks link → enters new password.

### Skills System

Users list skills as OFFER (can teach) or SEEK (want to learn) with a level (Beginner/Intermediate/Advanced). Skills have categories and tags for searching.

### Matching System (3 tabs)

- **Mutual** — both sides benefit (you teach what they want, they teach what you want)
- **They Teach Me** — people who offer skills you're seeking
- **All Users** — searchable directory of everyone, filterable by name, skill, category, or tag. Shows Teachable and Learnable skills per user

### Availability and Booking

Teachers set availability on a weekly grid (green = available, red = booked). Learners click available slots to book. Backend checks: not self-booking, 24h advance, no time conflicts, sufficient credits. 1 credit is held in escrow.

### Session Lifecycle

```
PENDING → CONFIRMED → COMPLETED (normal)
PENDING → CANCELLED (rejected or auto-cancelled)
CONFIRMED → DISPUTED → RESOLVED_REFUND or RESOLVED_RELEASE
```

Confirmed sessions show an "Add to Google Calendar" button. Completed sessions show a "Leave a Review" button.

### Reviews and Ratings

After completion, both parties can review each other. Learners rate teaching (1-5 stars + "on time?", "content useful?", "recommend?"). Teachers rate learner engagement. Profiles show separate teaching and learning averages with review counts and session counts.

### Credit System (Escrow)

Balance = sum of credits received − sum of credits spent. Transaction types: PURCHASE (+), ESCROW_HOLD (−), ESCROW_RELEASE (+), ESCROW_REFUND (+), REDEMPTION (−).

### Wallet (Buy/Redeem via WhatsApp)

- **Buy:** $15/1 credit or $60/5 credits (4 + 1 free). Opens WhatsApp with pre-filled message. Admin adds credits after payment via OMT/Wish Money/bank transfer.
- **Redeem:** 5 credits → $50. Opens WhatsApp. Admin deducts credits after sending payment.

### Profile Pictures

Uploaded directly to Firebase Storage from the browser. Backend stores the URL.

### Referral System

Every user gets a unique code (like "ALI-A3F2C8"). Dashboard shows a "Copy Link" button. Registration accepts referral codes (also via URL: `/register?ref=CODE`). Both parties get 1 bonus credit.

### Profile Completion Prompt

Dashboard shows a progress bar tracking 6 items: name, bio, city, phone, skills, availability. Clickable hints link to the right page. Disappears at 100%.

### Session Reminders

Background task checks every 60 seconds for CONFIRMED sessions within 2 hours. Sends reminder emails to both parties. Each session reminded only once.

### Google Calendar Integration

Confirmed sessions show an "Add to Google Calendar" button. Opens Google Calendar with pre-filled event details. No OAuth needed — just a URL.

### Dispute System

During a session, learners can report no-shows. Admin reviews and either refunds the learner or pays the teacher.

### Background Schedulers (3 tasks, every 60 seconds)

1. **Auto-cancel** PENDING sessions within 24 hours of start
2. **Auto-release** COMPLETED sessions with no disputes
3. **Send reminders** for CONFIRMED sessions within 2 hours

---

## Admin Panel

Admins see a completely different interface. Navigation shows: Overview, Users, Sessions, Credits, Disputes.

- **Overview** — platform stats (total users, sessions, skills, transactions)
- **Users** — searchable table of all users with balances and details
- **Sessions** — all sessions with status filters
- **Credits** — add/deduct credits (quick reference: $15/credit, $60/5, $50 payout)
- **Disputes** — resolve session complaints

---

## Frontend Pages

### Public
| Page | URL |
|------|-----|
| Homepage (landing) | `/` |
| Login | `/login` |
| Register (with referral) | `/register` |
| Forgot Password | `/forgot-password` |
| Reset Password | `/reset-password?token=...` |
| Verify Email | `/verify?token=...` |

### Regular Users
| Page | URL |
|------|-----|
| Dashboard | `/dashboard` |
| Skills | `/skills` |
| Sessions | `/sessions` |
| Matches | `/matches` |
| Wallet | `/wallet` |
| My Profile | `/profile` |
| Other Profile | `/user/:userId` |

### Admin Only
| Page | URL |
|------|-----|
| Overview | `/dashboard` |
| Users | `/admin/users` |
| Sessions | `/admin/sessions` |
| Credits | `/admin/credits` |
| Disputes | `/admin/disputes` |

---

## Components

| Component | Purpose |
|-----------|---------|
| Navbar | Different navigation for admin vs regular user |
| ProtectedRoute | Redirects to login if not authenticated |
| AvailabilityGrid | Weekly calendar with green/red/empty slots and legend |
| SessionCard | Session display with review, calendar, and action buttons |
| ReviewModal | Star rating + feedback form popup |
| ProfileStats | Teaching/learning ratings display |
| AuthContext | Login state management across the app |

---

## Backend Packages

| Package | Purpose |
|---------|---------|
| `admin` | Platform stats, user list, session list, credit management |
| `auth` | Registration (with referrals), login, verification, password reset |
| `availability` | Teacher availability grid |
| `config` | Security, JWT, CORS, database seeding |
| `dispute` | Session dispute reporting and resolution |
| `email` | All emails (verification, booking, reminders, referrals) |
| `exception` | Error handling |
| `match` | User matching and search |
| `review` | Reviews and ratings |
| `scheduler` | Auto-cancel, auto-release, session reminders |
| `session` | Session booking, confirming, cancelling |
| `skill` | Skills, categories, tags |
| `transaction` | Credit system and escrow |
| `user` | User profiles |

---

## Environment Variables (Render)

| Variable | Purpose |
|----------|---------|
| SPRING_DATASOURCE_URL | Neon database connection URL |
| SPRING_DATASOURCE_USERNAME | Database username |
| SPRING_DATASOURCE_PASSWORD | Database password |
| JWT_SECRET | Secret key for signing JWT tokens |
| SPRING_MAIL_USERNAME | Gmail address for sending emails |
| SPRING_MAIL_PASSWORD | Gmail app password (16-character) |
| APP_URL | Frontend URL for email links (`https://skillbank-489a8.web.app`) |

---

## Deployment

| Service | Provider | Plan | Hosts |
|---------|----------|------|-------|
| Frontend | Firebase Hosting | Free | React website |
| Backend | Render | Free tier | Spring Boot API |
| Database | Neon | Free (0.5 GB) | PostgreSQL |
| Files | Firebase Storage | Blaze (pay-as-you-go) | Profile pictures |
| Analytics | Firebase Analytics | Free | User tracking |
| Email | Gmail SMTP | Free | All notifications |

Note: Render's free tier spins down after 15 min of inactivity. First request after takes ~30 seconds.

---

## File Structure

```
skillbank/
├── Dockerfile
├── docker-compose.yml
├── pom.xml
├── src/main/java/com/skillbank/
│   ├── SkillBankApplication.java
│   ├── admin/AdminController.java
│   ├── auth/(AuthService, AuthController, dto/)
│   ├── availability/(AvailabilitySlot, Service, Controller, SlotDTO)
│   ├── config/(SecurityConfig, JwtUtil, JwtAuthFilter, CorsConfig, DataInitializer)
│   ├── dispute/(DisputeReport, Service, Controller)
│   ├── email/EmailService.java
│   ├── exception/(GlobalExceptionHandler, InsufficientBalanceException)
│   ├── match/(MatchService, MatchController, dto/MatchDTO)
│   ├── review/(Review, ReviewType, ReviewRepository, ReviewService, ReviewController)
│   ├── scheduler/SessionScheduler.java
│   ├── session/(Session, SessionStatus, SessionService, SessionController, dto/)
│   ├── skill/(Skill, SkillCategory, UserSkill, SkillType, SkillLevel, Service, Controller, Tag)
│   ├── transaction/(EscrowService, TimeTransaction, TransactionType, Repository)
│   └── user/(User, Role, UserRepository, UserService, UserController, dto/)
├── src/main/resources/application.properties
└── frontend/
    ├── index.html, firebase.json, vercel.json, vite.config.js, package.json
    ├── public/(favicon.ico, favicon_512.png)
    └── src/
        ├── main.jsx, App.jsx, index.css, firebase.js
        ├── api/client.js
        ├── context/AuthContext.jsx
        ├── components/(Navbar, ProtectedRoute, AvailabilityGrid, SessionCard, ReviewModal, ProfileStats)
        └── pages/(HomePage, Login, Register, ForgotPassword, ResetPassword, VerifyEmail,
                    Dashboard, UserDashboard, AdminDashboard, AdminUsers, AdminSessions,
                    AdminCredits, AdminDisputes, Skills, Sessions, Matches, Wallet, Profile)
```

---

## How to Run Locally

1. `docker-compose up` — start local PostgreSQL
2. Run `SkillBankApplication.java` in your IDE or `./mvnw spring-boot:run`
3. `cd frontend && npm install && npm run dev`
4. Open `http://localhost:5173`
