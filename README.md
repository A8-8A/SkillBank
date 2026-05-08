# SkillBank — Complete Project Documentation

## What Is SkillBank?

SkillBank is a web application where people exchange skills using a credit-based system instead of paying each other directly with money.

The simple idea is this:

- If you teach someone for 1 hour, you earn 1 credit.
- If you want to learn from someone for 1 hour, you spend 1 credit.
- So the platform turns time and knowledge into something people can trade.

Example:

Sara knows French and wants to learn guitar. Karim knows guitar and wants to learn French. On SkillBank, Sara can teach French, earn a credit, then spend that credit to learn guitar. The platform is not trying to make every exchange happen at the exact same time between the same two people. It uses credits so the system stays flexible.

Every new user starts with **1 free credit** so they can book their first learning session immediately.

Users can also buy credits manually and cash out credits manually:

- **Buy 1 credit:** $15
- **Buy 5 credits:** $60, shown as 4 credits + 1 free
- **Redeem 5 credits:** $50 payout

Because automatic online payment gateways are not always practical in Lebanon, the payment/cashout process is handled through traditional methods such as WhatsApp coordination, OMT, Wish Money, bank transfer, or another manually agreed method. The app itself tracks credits, but the real-world money transfer is handled manually by the platform owner/admin.

---

## The Main Problem SkillBank Solves

A lot of people have valuable skills, but they do not always have money to pay for lessons. At the same time, many people are willing to teach something they know if they can get something useful in return.

SkillBank solves this by saying:

> Your time has value. Your knowledge has value. You can use what you know to learn what you do not know yet.

So instead of the platform being only about buying lessons, it becomes about skill exchange, community learning, and turning knowledge into opportunity.

---

## How Is the Project Built?

The project is split into three main technical parts:

1. **Frontend** — the website that users see.
2. **Backend** — the Java server that handles the logic.
3. **Database** — the PostgreSQL storage where the data is saved.

There are also outside services used for hosting, profile pictures, analytics, and emails.

---

## 1. Frontend — What Users See

The frontend is the actual website. It includes the landing page, login/register pages, dashboard, skills page, matches page, sessions page, wallet, profile, admin pages, and review pages.

It is built using:

- **React** — used to build the user interface as reusable components. For example, the navbar, session card, availability grid, and review modal are all separate pieces of UI.
- **React Router** — controls which page appears for each URL, such as `/dashboard`, `/skills`, `/matches`, or `/profile`.
- **Vite** — the frontend build tool. It runs the React app locally during development and builds the final production files.
- **Axios** — used to send HTTP requests from the frontend to the backend. For example, when a user logs in, Axios sends the email and password to `/api/auth/login`.
- **Framer Motion** — used for animations, page transitions, animated cards, tab transitions, category bubbles, count-up effects, and smooth UI movement.
- **Three.js / React Three Fiber** — used for the 3D animated background/orb visuals.
- **Firebase SDK** — used for Firebase Analytics and Firebase Storage.
- **Custom CSS** — most of the app styling is written in `frontend/src/index.css`.
- **Small TypeScript UI components** — some UI pieces like the AI chat mockup use `.tsx` components.

The frontend is hosted on **Firebase Hosting** at:

```text
https://skillbank-489a8.web.app
```

There is also Vercel configuration in the project, and the backend CORS config allows the Vercel deployment as a backup frontend origin.

---

## 2. Backend — The Brain

The backend is the server that receives requests, checks rules, talks to the database, and sends responses back to the frontend.

It is built using:

- **Java 17** — the programming language/runtime used by the backend.
- **Spring Boot 3.2.5** — the main backend framework.
- **Spring Web** — allows the backend to create API endpoints like `/api/sessions` and `/api/users/me`.
- **Spring Security** — protects private endpoints and checks JWT tokens.
- **Spring Data JPA / Hibernate** — maps Java classes to PostgreSQL database tables.
- **PostgreSQL Driver** — allows Spring Boot to connect to a PostgreSQL database.
- **JWT (jjwt)** — creates and verifies login tokens.
- **Lombok** — reduces repetitive Java code like getters, setters, constructors, and builders.
- **Bean Validation** — validates request fields, such as making sure email is formatted correctly and passwords have a minimum length.

The backend is hosted on **Render** at:

```text
https://skillbank-api.onrender.com
```

The frontend calls backend endpoints like:

```text
https://skillbank-api.onrender.com/api/auth/login
https://skillbank-api.onrender.com/api/sessions
https://skillbank-api.onrender.com/api/users/me
```

The backend runs inside a Docker container in production.

---

## 3. Database — The Memory

The app uses **PostgreSQL**.

PostgreSQL stores permanent data such as:

- User accounts
- Password hashes
- Profile information
- Skills and categories
- User skill listings
- Availability slots
- Sessions
- Credit transactions
- Reviews
- Disputes
- Referral codes

In production, the PostgreSQL database is hosted on **Neon**.

The backend does not manually create every database table using SQL files. Instead, Hibernate reads the Java entity classes and creates/updates the database tables based on them because this is enabled in `application.properties`:

```properties
spring.jpa.hibernate.ddl-auto=update
```

This means the database structure follows the Java model classes.

---

## How the Whole System Connects

```text
User's Browser
    |
    | visits
    v
Firebase Hosting
    |
    | serves the React frontend
    v
React Website
    |
    | sends API requests using Axios
    v
Render Backend
    |
    | reads/writes data
    v
Neon PostgreSQL Database
```

A simple example:

1. The user opens the website.
2. Firebase Hosting sends the React app to the browser.
3. The user clicks “Login”.
4. React sends the email/password to the Spring Boot backend.
5. The backend checks the database.
6. If the login is valid, the backend returns a JWT token.
7. The frontend stores the token and uses it for future requests.

---

## Extra Services Used

### Firebase Hosting

Used to host the frontend website.

### Firebase Analytics

Used to collect basic analytics about how users use the app. It is initialized in:

```text
frontend/src/firebase.js
```

### Firebase Storage

Used to store profile pictures.

When a user uploads a profile picture:

1. The browser uploads the image directly to Firebase Storage.
2. Firebase returns a public download URL.
3. The frontend sends that URL to the backend.
4. The backend saves the URL in the user's profile record.
5. Other users can now see that profile picture.

### Brevo Email API

The app now uses **Brevo's HTTP email API** for sending emails.

This replaced the older Gmail SMTP explanation. The backend does not use Gmail SMTP settings anymore. It sends email by making an HTTP request to Brevo:

```text
https://api.brevo.com/v3/smtp/email
```

The email logic is inside:

```text
src/main/java/com/skillbank/email/EmailService.java
```

The app sends emails for:

- Email verification
- Password reset
- New session request notification
- Session confirmed notification
- Session rejected notification
- Auto-cancelled session notification
- Session reminder 2 hours before the session
- Referral bonus notification

Important detail:

- Verification emails and password reset emails are sent synchronously because they are critical.
- Other notification emails use `@Async`, which means they are sent in the background after the main request continues.

---

## Main User Roles

SkillBank has two roles:

### USER

A normal user can:

- Register and verify email
- Log in
- Edit their profile
- Upload a profile picture
- Add skills they can teach
- Add skills they want to learn
- Set weekly availability
- Search for other users
- Book sessions
- Confirm/reject sessions if they are the teacher
- File a dispute if they are the learner
- Review others after completed sessions
- Buy/redeem credits manually through WhatsApp
- Invite friends using referral links
- Delete their own account

### ADMIN

An admin can:

- View platform statistics
- View/search all users
- View/search/filter all sessions
- Add credits after manual purchases
- Deduct credits after manual redemptions
- Resolve disputes

Admins do not use the normal user flow. When an admin logs in, the navbar changes to admin pages only.

---

## Database Tables Explained

The database is made of tables. A table is like an Excel sheet: columns describe what each row stores, and each row is one record.

### `users`

Stores every registered user account.

| Column | What It Stores |
|---|---|
| `id` | Unique user number |
| `name` | User's display/full name |
| `email` | Login email, must be unique |
| `password_hash` | The BCrypt-hashed password, not the readable password |
| `bio` | Short profile description |
| `city` | User's location/city |
| `phone_number` | User's phone number |
| `contact_email` | Optional public contact email shown on profile |
| `linkedin_url` | Optional LinkedIn link shown on profile |
| `social_media_url` | Optional social media link shown on profile |
| `profile_pic_url` | Firebase Storage image URL |
| `email_verified` | Whether the user clicked the verification email |
| `verification_token` | Random token used for email verification |
| `reset_token` | Random token used for password reset |
| `reset_token_expiry` | When the reset token expires |
| `referral_code` | User's unique invite/referral code |
| `referred_by` | ID of the user who referred this user, if any |
| `role` | `USER` or `ADMIN` |
| `created_at` | When the account was created |

### `skill_categories`

Stores broad skill categories.

The project seeds 20 categories automatically when the database is empty:

- Technology & Programming
- Engineering
- Science & Mathematics
- Languages
- Music
- Sports & Fitness
- Arts & Crafts
- Design & Architecture
- Cooking & Nutrition
- Business & Finance
- Writing & Literature
- Photography & Video
- Board Games & Chess
- Health & Wellness
- DIY & Home Improvement
- Education & Tutoring
- History & Culture
- Performing Arts
- Outdoor Skills
- Social Sciences

### `skills`

Stores the master skill catalog.

| Column | What It Stores |
|---|---|
| `id` | Unique skill number |
| `name` | Skill name, like Python, Guitar, Chess, Photography |
| `category_id` | Which category this skill belongs to |
| `custom` | Whether this skill was created by a user |
| `created_by` | Which user created the custom skill, if any |

### `user_skills`

Connects users to skills.

A skill can be listed in two ways:

- `OFFER` means “I can teach this.”
- `SEEK` means “I want to learn this.”

| Column | What It Stores |
|---|---|
| `id` | Unique listing number |
| `user_id` | Which user owns this listing |
| `skill_id` | Which skill is being listed |
| `type` | `OFFER` or `SEEK` |
| `level` | `BEGINNER`, `INTERMEDIATE`, or `ADVANCED` |
| `description` | Optional extra explanation |

The backend prevents a user from adding the same skill twice with the same type.

### `tags` and `skill_tags`

Skills can have tags.

Example:

```text
Skill: Python
Tags: beginner-friendly, backend, coding, projects
```

Tags make search better because users can search not only by skill name, but also by related keywords.

`skill_tags` is the join table that connects many skills to many tags.

### `availability_slots`

Stores weekly availability for teachers.

Each slot is one hour on one day of the week.

| Column | What It Stores |
|---|---|
| `id` | Unique slot number |
| `user_id` | Which teacher this availability belongs to |
| `day_of_week` | Monday, Tuesday, etc. |
| `hour` | The hour of the day, using 24-hour format |

Valid hours are from **6 AM until 1 AM**.

The slots are recurring weekly. If a teacher marks Monday 6 PM as available, that means they are generally available on Mondays at 6 PM.

### `sessions`

Stores booked teaching/learning sessions.

| Column | What It Stores |
|---|---|
| `id` | Unique session number |
| `teacher_id` | User who teaches |
| `learner_id` | User who learns |
| `skill_id` | Skill being taught |
| `scheduled_at` | Date and time of the session |
| `duration_minutes` | Usually 60 minutes |
| `status` | Current state of the session |
| `notes` | Optional learner notes |
| `reminder_sent` | Whether the 2-hour reminder was already sent |
| `created_at` | When the session was created |

Possible session statuses:

```text
PENDING
CONFIRMED
COMPLETED
CANCELLED
DISPUTED
REFUNDED
```

### `time_transactions`

Stores every credit movement.

The app does not rely on one simple `balance` column. Instead, it records transactions, then calculates balance from the transaction history.

| Column | What It Stores |
|---|---|
| `id` | Unique transaction number |
| `from_user_id` | User who lost/spent credits, if any |
| `to_user_id` | User who gained/received credits, if any |
| `session_id` | Session connected to the transaction, if any |
| `hours` | Credit amount |
| `type` | Why the transaction happened |
| `created_at` | When it happened |

Transaction types:

| Type | Meaning |
|---|---|
| `PURCHASE` | Credits added to a user, including signup bonus, referral bonus, or admin-added purchase |
| `ESCROW_HOLD` | Credit held from the learner when booking |
| `ESCROW_RELEASE` | Credit released to the teacher after successful completion |
| `ESCROW_REFUND` | Credit refunded to learner after cancellation/dispute refund |
| `REDEMPTION` | Credits deducted when user cashes out |

### `reviews`

Stores ratings and feedback after completed sessions.

Each user can only review a session once. This is enforced using a database unique constraint on:

```text
session_id + reviewer_id
```

| Column | What It Stores |
|---|---|
| `id` | Unique review number |
| `session_id` | Which session was reviewed |
| `reviewer_id` | Person writing the review |
| `reviewee_id` | Person receiving the review |
| `type` | `TEACHING` or `LEARNING` |
| `rating` | 1 to 5 stars |
| `comment` | Optional written feedback |
| `teacher_on_time` | Boolean feedback field |
| `content_useful` | Boolean feedback field |
| `would_recommend` | Boolean feedback field |
| `created_at` | When the review was written |

The same three boolean fields are stored for both teaching and learning reviews, but the frontend labels them differently depending on whether the user is reviewing a teacher or a learner.

### `dispute_reports`

Stores reports filed by learners when a session goes wrong.

| Column | What It Stores |
|---|---|
| `id` | Unique dispute number |
| `session_id` | Which session is disputed |
| `filed_by_id` | Learner who filed the dispute |
| `reason` | Learner's explanation |
| `status` | `OPEN`, `RESOLVED_REFUND`, or `RESOLVED_RELEASE` |
| `resolved_by_id` | Admin who resolved the dispute |
| `admin_notes` | Admin explanation/notes |
| `created_at` | When the dispute was filed |
| `resolved_at` | When the dispute was resolved |

Important difference:

- `dispute_reports.status` can become `RESOLVED_REFUND` or `RESOLVED_RELEASE`.
- `sessions.status` becomes `REFUNDED` if the learner is refunded.
- `sessions.status` becomes `COMPLETED` if the teacher is paid after dispute resolution.

---

## User Registration and Email Verification

### What happens when a user registers

1. The user fills in name, email, password, city, bio, phone number, and optional referral code.
2. The frontend sends the data to:

```text
POST /api/auth/register
```

3. The backend checks if the email is already registered.
4. The backend hashes the password using BCrypt.
5. The backend creates a random email verification token.
6. The backend generates a unique referral code for the new user.
7. If a referral code was entered, the backend checks that it exists.
8. The backend saves the user with `emailVerified = false`.
9. The backend gives the user 1 free credit.
10. If the referral code was valid, both users get 1 bonus credit.
11. The backend sends a verification email through Brevo.
12. The frontend shows a “Check your email” screen.

The backend response intentionally returns no login token on registration. The user must verify their email first, then log in.

### What happens when the user clicks the verification link

1. The email link opens:

```text
/verify?token=...
```

2. The frontend sends the token to:

```text
GET /api/auth/verify?token=...
```

3. The backend finds the user with that token.
4. The backend sets `emailVerified = true`.
5. The backend clears the verification token.
6. The user can now log in.

### Resending verification email

If the user tries to log in before verifying their email, the login page shows a resend option.

That calls:

```text
POST /api/auth/resend-verification
```

The backend creates a fresh verification token and sends a new email.

---

## Login and Authentication

SkillBank uses JWT-based login.

A JWT is like a digital wristband. Once the user logs in successfully, the backend gives them a token. After that, the frontend sends the token with each private request so the backend knows who the user is.

### Login flow

1. User enters email and password.
2. Frontend sends:

```text
POST /api/auth/login
```

3. Backend checks the email and password.
4. Backend checks that the email is verified.
5. Backend creates a JWT token valid for 24 hours.
6. Frontend stores the token in `localStorage`.
7. Axios automatically attaches the token to later requests:

```text
Authorization: Bearer <token>
```

If a request returns `401`, the Axios response interceptor clears local storage and redirects the user to `/login`.

---

## Password Reset

### Forgot password

1. User goes to `/forgot-password`.
2. User enters their email.
3. Frontend sends:

```text
POST /api/auth/forgot-password
```

4. Backend creates a reset token that expires after 1 hour.
5. Backend emails a reset link.
6. Backend always returns the same message so it does not reveal whether an email exists.

### Reset password

1. User opens:

```text
/reset-password?token=...
```

2. User enters a new password.
3. Frontend sends:

```text
POST /api/auth/reset-password
```

4. Backend checks that the token exists and is not expired.
5. Backend hashes the new password and saves it.
6. Backend clears the reset token.

---

## Profile System

Each user has a public profile.

A profile can show:

- Name
- City
- Bio
- Phone number
- Contact email
- LinkedIn link
- Social media link
- Profile picture
- Join month/year
- Skills they teach
- Skills they want to learn
- Availability grid
- Teaching rating
- Learning rating
- Sessions taught
- Sessions learned

### Editing your own profile

A user can edit:

- Name
- City
- Phone number
- Contact email
- LinkedIn URL
- Social media URL
- Bio
- Profile picture

The profile update request goes to:

```text
PATCH /api/users/me
```

### Profile picture upload

Profile images are uploaded directly to Firebase Storage.

The flow is:

1. User clicks the avatar on their own profile.
2. Browser opens a file picker.
3. Frontend checks the file is an image and under 5 MB.
4. Frontend uploads it to Firebase Storage.
5. Firebase returns a URL.
6. Frontend sends that URL to the backend.
7. Backend saves it in `profile_pic_url`.

### Account deletion

A user can delete their own account from the profile page.

The flow is:

1. User clicks “Delete Account”.
2. User enters their password.
3. Browser shows a confirmation prompt.
4. Frontend sends:

```text
DELETE /api/users/me
```

5. Backend verifies the password.
6. Backend deletes or disconnects related records in a safe order.
7. User is logged out and sent back to the homepage.

The backend deletes the user's sessions, reviews, skills, availability, and related disputes. It also nullifies certain references in transactions and custom skills so the database does not break from foreign-key references.

---

## Skills System

Users can add skills in two directions:

### OFFER

Means:

```text
I can teach this skill.
```

For offers, the user chooses a level:

```text
BEGINNER
INTERMEDIATE
ADVANCED
```

### SEEK

Means:

```text
I want to learn this skill.
```

### Adding a skill

1. User opens `/skills`.
2. User clicks “Add Skill”.
3. User chooses a category.
4. User types the skill name.
5. User chooses whether they teach it or want to learn it.
6. User optionally adds a description and comma-separated tags.
7. Frontend sends:

```text
POST /api/skills/my
```

8. Backend checks if the skill already exists in that category.
9. If the skill does not exist, backend creates it as a custom skill.
10. Backend creates the user's skill listing.
11. Tags are created if they do not already exist.

### Browsing skills

The Skills page has two tabs:

- **My Skills** — what the current user teaches and wants to learn.
- **Browse All** — the whole skill catalog.

Browse All supports:

- Search by skill name
- Filter by category
- Viewing tags attached to skills

---

## Matching System

The Matches page helps users find people.

It has three tabs:

### All Users

This is the default tab.

It shows a searchable directory of verified non-admin users, excluding the current user.

The search can match:

- User name
- Skill name
- Category name
- Tag name

The search is delayed by about 400ms while typing so it does not spam the backend with requests on every single keypress.

The backend endpoint is:

```text
GET /api/matches/all?q=searchText
```

### They Teach Me

Shows people who teach at least one skill that the current user wants to learn.

Backend endpoint:

```text
GET /api/matches/one-way
```

### Mutual

Shows the strongest kind of exchange:

- They teach something I want.
- They want something I teach.

Backend endpoint:

```text
GET /api/matches/mutual
```

### Category bubbles

The Matches page also shows category bubbles.

These are not normal dropdown filters. They are animated category buttons.

A category bubble is active only if at least one shown user teaches a skill in that category. Empty categories are faded/disabled so the user understands that nobody currently teaches that category.

### Category ranking

When the user filters by category, matches are ranked by usefulness.

The ranking logic gives points for:

- Teaching something the current user wants to learn
- Being in the same city
- Wanting something the current user can teach

So the app does not just show random users. It tries to put the more relevant users first.

---

## Availability and Booking

### Teacher availability

Teachers set availability from their profile page using a weekly grid.

The grid has:

- Days as columns
- Hours as rows
- Green slots for available
- Red slots for booked
- Empty slots for not available

Each slot represents one hour.

The valid hours are:

```text
6 AM → 1 AM
```

### Toggling availability

If the profile owner clicks an empty slot, it becomes available.

If the profile owner clicks an available slot, it is removed.

The request goes to:

```text
POST /api/availability/toggle
```

### Booked slots cannot be removed

If a slot has an active `PENDING` or `CONFIRMED` session, it appears as booked/red.

The teacher cannot remove that slot until the session is cancelled, rejected, completed, or otherwise no longer active.

### Booking a session

A learner can visit another user's profile and click a green available slot.

The booking modal asks for:

- Which offered skill they want to learn
- Date/time
- Optional notes

The booking request goes to:

```text
POST /api/sessions
```

The backend checks:

1. The learner is not booking themselves.
2. The session is at least 24 hours in the future.
3. The teacher does not already have an active overlapping session.
4. The learner does not already have an active overlapping session.
5. The learner has enough credits.

If everything is valid:

1. A `PENDING` session is created.
2. 1 credit is held from the learner using escrow.
3. The teacher gets an email notification.

---

## Session Lifecycle

A normal session looks like this:

```text
PENDING → CONFIRMED → COMPLETED
```

But sessions can also be cancelled, disputed, or refunded.

Full flow:

```text
PENDING → CONFIRMED → COMPLETED
PENDING → CANCELLED
CONFIRMED → CANCELLED
CONFIRMED → DISPUTED → REFUNDED
CONFIRMED → DISPUTED → COMPLETED
```

### PENDING

The learner booked a session.

1 credit is held from the learner but not given to the teacher yet.

The teacher must confirm or reject.

### CONFIRMED

The teacher accepted the session.

Both users should attend at the scheduled time.

A Google Calendar button appears on the session card.

### COMPLETED

After the session end time passes, a scheduled backend task releases the held credit to the teacher and marks the session as completed.

After completion, both users can leave reviews.

### CANCELLED

A session can become cancelled if:

- The teacher rejects it.
- The teacher cancels it while it is still pending/confirmed.
- The teacher does not confirm before the 24-hour deadline.

When a session is cancelled, the learner gets the held credit back.

### DISPUTED

During the session window only, the learner can report a problem.

The button says “Report”. It opens a dispute modal.

The learner explains what happened, and the backend changes the session status to `DISPUTED`.

### REFUNDED

If the admin resolves the dispute in favor of the learner, the held credit is returned to the learner and the session becomes `REFUNDED`.

### DISPUTE RELEASE / TEACHER PAID

If the admin resolves the dispute in favor of the teacher, the credit is released to the teacher and the session becomes `COMPLETED`.

---

## Sessions Page

The regular user Sessions page has three tabs:

- **All**
- **Teaching**
- **Learning**

Session cards show:

- Status
- Skill name
- Teacher
- Learner
- Date/time
- Duration
- Notes
- Action buttons depending on user role and session status

Teacher actions:

- Confirm a pending session
- Reject/cancel a session

Learner actions:

- Report during a confirmed session window
- Leave review after completion

Shared actions:

- Add confirmed session to Google Calendar

### Cancelled history

Cancelled sessions are separated into a collapsible “Cancelled History” section. This keeps the main session list cleaner while still allowing the user to view old cancelled sessions.

### Overlap warning

The frontend can detect active sessions that visually overlap in time and show a warning. This helps with old/legacy data or edge cases. The backend also prevents new overlapping active sessions for both the teacher and the learner.

---

## Reviews and Ratings

After a session is completed, each side can review the other.

### Learner reviewing teacher

This creates a `TEACHING` review for the teacher.

It includes:

- 1 to 5 star rating
- Optional comment
- Teacher on time?
- Content useful?
- Would recommend?

### Teacher reviewing learner

This creates a `LEARNING` review for the learner.

It includes:

- 1 to 5 star rating
- Optional comment
- Boolean feedback fields shown with learner-focused labels in the UI

### Review button behavior

On a completed session:

- If the current user has not reviewed yet, they see “Leave a Review”.
- If they already reviewed, they see “Reviewed”.

The backend endpoint that checks this is:

```text
GET /api/reviews/check/{sessionId}
```

### Profile review stats

Profiles show two rating blocks:

- **As a Teacher**
- **As a Learner**

Each block can show:

- Average star rating
- Number of reviews
- Number of completed sessions

If reviews exist, the block is clickable and opens the full reviews page.

### Full reviews page

The app has a dedicated reviews page:

```text
/user/:userId/reviews?tab=teaching
/user/:userId/reviews?tab=learning
```

It shows:

- Review summary cards
- Separate teaching/learning tabs
- Reviewer avatar/name
- Skill name
- Session date
- Star rating
- Feedback badges
- Written comment, if provided

---

## Credit System and Escrow

The credit system is based on transactions.

The balance is calculated like this:

```text
Balance = credits received - credits spent
```

### Credits received

Examples:

- Signup bonus
- Referral bonus
- Admin adds credits after manual purchase
- Teacher receives credit after completed session
- Learner receives refund after cancellation/dispute refund

### Credits spent

Examples:

- Learner books a session and 1 credit is held
- User redeems credits for cashout

### Why escrow exists

Escrow means the platform holds the credit temporarily.

When a learner books a session:

1. The learner loses access to 1 credit immediately.
2. The teacher does not receive it yet.
3. If the session happens successfully, the teacher gets it.
4. If the session is cancelled/refunded, the learner gets it back.

This prevents both sides from abusing the system.

---

## Wallet System

The Wallet page has two tabs:

- **Buy**
- **Redeem**

### Buying credits

1. User chooses a package.
2. User clicks the WhatsApp button.
3. WhatsApp opens with a pre-filled message.
4. User coordinates payment manually.
5. Admin receives/validates payment.
6. Admin opens Admin → Credits.
7. Admin adds credits to the user's email.
8. The balance updates through a `PURCHASE` transaction.

### Redeeming credits

1. User opens the Redeem tab.
2. User needs at least 5 credits.
3. User clicks the WhatsApp redeem button.
4. Admin validates the request.
5. Admin sends the payout manually.
6. Admin opens Admin → Credits.
7. Admin deducts 5 credits.
8. The balance updates through a `REDEMPTION` transaction.

---

## Referral System

Each user has a unique referral code.

Example:

```text
ALI-A3F2C8
```

The dashboard shows the referral code and a “Copy Link” button.

The copied link looks like:

```text
https://skillbank-489a8.web.app/register?ref=ALI-A3F2C8
```

When someone registers using the referral code:

- The new user gets 1 bonus credit.
- The referrer gets 1 bonus credit.
- The referrer receives an email notification.

The app also backfills referral codes for old users who do not have one yet when the backend starts.

---

## Profile Completion Prompt

The user dashboard shows a profile completion bar if the profile is incomplete.

It checks 6 things:

1. Name exists
2. Bio exists
3. City exists
4. Phone number exists
5. User has at least one skill listed
6. User has availability slots set

If something is missing, the dashboard shows clickable hints like:

- Add a bio
- Set your city
- Add phone number
- List your skills
- Set your availability

Once the profile is complete, the prompt disappears.

---

## Google Calendar Integration

This is a simple link-based integration.

There is no Google OAuth and no Google Calendar API key.

When a session is confirmed, the session card shows:

```text
Add to Google Calendar
```

Clicking it opens Google Calendar in a new tab with:

- Session title
- Start time
- End time
- Skill name
- Teacher name
- Learner name
- Notes, if any

The user can then save the event in their own Google Calendar.

---

## Dispute System

A dispute is a learner complaint about a session.

The learner can file a dispute only when:

- They are the learner of the session.
- The session is `CONFIRMED`.
- The current time is between session start and session end.
- No open dispute already exists for that session.

The frontend button appears during the session window.

The flow:

1. Learner clicks “Report”.
2. Learner writes what happened.
3. Frontend sends:

```text
POST /api/disputes
```

4. Backend creates a dispute report.
5. Backend changes the session to `DISPUTED`.
6. Admin sees it in Admin → Disputes.
7. Admin chooses:
   - Refund Learner
   - Pay Teacher
8. Admin can add notes.
9. Backend resolves the dispute and moves credits accordingly.

---

## Automatic Background Tasks

The backend has scheduling enabled.

These tasks run every 60 seconds.

### 1. Auto-cancel unconfirmed sessions

Looks for `PENDING` sessions that are less than 24 hours away.

If found:

- Session becomes `CANCELLED`.
- Learner gets refunded.
- Both users are emailed.

### 2. Auto-release completed sessions

Looks for `CONFIRMED` sessions whose end time has passed and have no open dispute.

If found:

- Credit is released to the teacher.
- Session becomes `COMPLETED`.

### 3. Send session reminders

Looks for confirmed sessions that start within the next 2 hours and have not been reminded yet.

If found:

- Teacher gets a reminder email.
- Learner gets a reminder email.
- `reminder_sent` becomes true so the reminder is not sent twice.

---

## Admin Panel

Admins see a different navbar.

Regular users see:

```text
Dashboard | Skills | Sessions | Matches | Wallet | My Profile
```

Admins see:

```text
Overview | Users | Sessions | Credits | Disputes
```

### Admin Overview

URL:

```text
/dashboard
```

For admins, `/dashboard` loads the admin dashboard.

It shows platform stats:

- Total users
- Total sessions
- Total skills
- Total user skill listings
- Total transactions

### Admin Users

URL:

```text
/admin/users
```

Shows all users in a searchable table.

The admin can search by:

- Name
- Email
- City

The table shows:

- Profile picture/avatar
- Name
- Email
- City
- Role
- Email verified status
- Balance
- Join date

Clicking a user row/avatar opens that user's profile.

### Admin Sessions

URL:

```text
/admin/sessions
```

Shows all platform sessions.

Includes:

- Search by session ID, user name, email, or skill
- Status filters
- Teacher and learner names/emails
- Clickable teacher/learner links
- Scheduled date/time
- Created date

### Admin Credits

URL:

```text
/admin/credits
```

Used for manual credit operations.

Admin can:

- Add credits after user pays manually
- Deduct credits after user redeems manually

The backend checks that deductions cannot make a user balance go below zero.

### Admin Disputes

URL:

```text
/admin/disputes
```

Shows open disputes.

Admin can:

- Read the learner's complaint
- Add admin notes
- Refund learner
- Pay teacher

---

## Public Pages

| Page | URL | What It Does |
|---|---|---|
| Homepage | `/` | Explains SkillBank, credits, journey flow, example exchange, FAQ, and call-to-action |
| Login | `/login` | Signs user in and handles unverified email resend |
| Register | `/register` | Creates account, supports referral code and `?ref=CODE` links |
| Forgot Password | `/forgot-password` | Sends reset link |
| Reset Password | `/reset-password?token=...` | Lets user set a new password |
| Verify Email | `/verify?token=...` | Verifies email address |
| AI Chat Demo | `/ai-chat` | A public v0-style UI mockup/demo page. It is a visual component, not a real connected AI assistant backend |

---

## Protected User Pages

| Page | URL | What It Does |
|---|---|---|
| Dashboard | `/dashboard` | User home page with balance, completion prompt, stats, referral code, promos, quick actions, and recent sessions |
| Skills | `/skills` | Add/remove skills and browse/search/filter the skill catalog |
| Sessions | `/sessions` | View sessions as all/teaching/learning, confirm/reject/report/review, view cancelled history |
| Matches | `/matches` | Search all users, see one-way matches, see mutual matches, filter by animated category bubbles |
| Wallet | `/wallet` | Buy/redeem credits manually through WhatsApp flow |
| My Profile | `/profile` | Edit profile, upload image, set availability, delete account, see skills/reviews/stats |
| Other Profile | `/user/:userId` | View another user, see their skills and availability, book sessions |
| User Reviews | `/user/:userId/reviews` | View teaching/learning review history for a user |

---

## Admin Pages

| Page | URL | What It Does |
|---|---|---|
| Overview | `/dashboard` | Admin dashboard stats and quick links |
| Users | `/admin/users` | Searchable user table |
| Sessions | `/admin/sessions` | Search/filter all sessions |
| Credits | `/admin/credits` | Add/deduct user credits |
| Disputes | `/admin/disputes` | Resolve open disputes |

---

## Important Frontend Components

| Component | What It Does |
|---|---|
| `Navbar.jsx` | Shows different navigation links for users vs admins and wraps page transitions |
| `ProtectedRoute.jsx` | Prevents unauthenticated users from entering protected pages |
| `AvailabilityGrid.jsx` | Weekly availability grid with available/booked/empty states |
| `SessionCard.jsx` | Shows one session and the correct buttons for that user's role/status |
| `ReviewModal.jsx` | Popup form for leaving reviews |
| `DisputeModal.jsx` | Popup form for filing a session report/dispute |
| `ProfileStats.jsx` | Shows teaching/learning rating blocks and links to review pages |
| `Background3D.jsx` | Animated background shapes using React Three Fiber |
| `HeroOrb.jsx` | Animated 3D orb visual |
| `Marquee.jsx` | Animated scrolling skill list |
| `AuthContext.jsx` | Stores logged-in user state and login/logout helpers |
| `api/client.js` | Axios client with base URL and JWT interceptor |

---

## Backend Package Structure

| Package | What It Handles |
|---|---|
| `admin` | Admin stats, users, sessions, credit operations |
| `auth` | Register, login, verification, password reset, resend verification |
| `availability` | Weekly teacher availability slots |
| `config` | Security, JWT, CORS, seed data |
| `dispute` | Filing and resolving disputes |
| `email` | Brevo email sending |
| `exception` | Global API error responses |
| `match` | All users search, one-way matches, mutual matches |
| `review` | Review creation, review stats, review listing |
| `scheduler` | Auto-cancel, auto-release, reminders |
| `session` | Booking, confirming, cancelling, viewing sessions |
| `skill` | Skills, categories, tags, user skills |
| `transaction` | Credits, balances, escrow, purchases, redemptions |
| `user` | Profiles, referral codes, account deletion |

---

## Request Flow Example — Booking a Session

This is what happens internally when a learner books a teacher:

```text
1. Frontend sends POST /api/sessions with JWT token
        |
        v
2. CORS filter checks if the frontend origin is allowed
        |
        v
3. JWT filter reads Authorization header and identifies current user
        |
        v
4. Spring Security allows the request because the user is authenticated
        |
        v
5. SessionController receives the request
        |
        v
6. SessionService validates the booking rules
        |
        v
7. EscrowService holds the learner's credit
        |
        v
8. SessionRepository saves the session
        |
        v
9. EmailService notifies the teacher
        |
        v
10. Backend returns the created session to the frontend
```

---

## Security Configuration

Public endpoints:

```text
/api/auth/**
```

Admin-only endpoints:

```text
/api/admin/**
```

Everything else requires a valid JWT token.

CORS allows these frontend origins:

```text
http://localhost:5173
https://skill-bank-phi.vercel.app
https://skillbank-489a8.web.app
```

This means random websites cannot freely call the backend from a browser.

---

## API Endpoints Overview

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify?token=...
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/resend-verification
```

### Users

```text
GET    /api/users/me
GET    /api/users/{id}
PATCH  /api/users/me
DELETE /api/users/me
POST   /api/users/me/purchase
```

### Skills

```text
GET    /api/skills/categories
GET    /api/skills/all
GET    /api/skills/category/{categoryId}
GET    /api/skills/search?q=...
GET    /api/skills/my
GET    /api/skills/user/{userId}
POST   /api/skills/my
DELETE /api/skills/my/{userSkillId}
```

### Availability

```text
GET  /api/availability/{userId}
POST /api/availability/toggle
```

### Sessions

```text
POST /api/sessions
POST /api/sessions/{id}/confirm
POST /api/sessions/{id}/cancel
GET  /api/sessions
GET  /api/sessions/teaching
GET  /api/sessions/learning
GET  /api/sessions/{id}
```

### Matches

```text
GET /api/matches/all
GET /api/matches/all?q=...
GET /api/matches/one-way
GET /api/matches/mutual
GET /api/matches/seeking-me
```

Note: `/api/matches/seeking-me` exists in the backend for users who want to find people seeking their skills, but the current main Matches UI exposes All Users, They Teach Me, and Mutual.

### Reviews

```text
POST /api/reviews
GET  /api/reviews/user/{userId}
GET  /api/reviews/user/{userId}/teaching
GET  /api/reviews/user/{userId}/learning
GET  /api/reviews/stats/{userId}
GET  /api/reviews/check/{sessionId}
```

### Disputes

```text
POST /api/disputes
GET  /api/disputes/session/{sessionId}
GET  /api/disputes/open
POST /api/disputes/resolve
```

### Transactions

```text
GET /api/transactions/my
GET /api/transactions/balance
```

### Admin

```text
GET  /api/admin/stats
GET  /api/admin/users
GET  /api/admin/sessions
POST /api/admin/credits/add
POST /api/admin/credits/deduct
```

---

## Environment Variables

The backend reads configuration from environment variables.

In production, these are set in the hosting dashboard, for example Render.

| Variable | Purpose |
|---|---|
| `SPRING_DATASOURCE_URL` | PostgreSQL database connection URL |
| `SPRING_DATASOURCE_USERNAME` | PostgreSQL username |
| `SPRING_DATASOURCE_PASSWORD` | PostgreSQL password |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `APP_URL` | Frontend URL used inside verification/reset links |
| `BREVO_API_KEY` | Brevo API key used to send email |
| `BREVO_FROM_EMAIL` | Sender email address for outgoing emails |
| `BREVO_FROM_NAME` | Sender name, usually `SkillBank` |

Local defaults are inside:

```text
src/main/resources/application.properties
```

Important: never commit real production secrets to GitHub. Environment variables should be set in Render/hosting settings, not hard-coded into source code.

---

## Deployment Architecture

| Part | Provider | What It Hosts |
|---|---|---|
| Frontend | Firebase Hosting | React website |
| Backend | Render | Spring Boot API in Docker |
| Database | Neon | PostgreSQL database |
| File Storage | Firebase Storage | Profile pictures |
| Analytics | Firebase Analytics | User behavior analytics |
| Email | Brevo | Transactional emails |

### Important free-tier behavior

Render free-tier services may spin down after inactivity. That means the first backend request after a quiet period can be slow while the server wakes up.

---

## File Structure

```text
SkillBank/
├── Dockerfile
├── docker-compose.yml
├── pom.xml
├── README.md
│
├── src/main/java/com/skillbank/
│   ├── SkillBankApplication.java
│   ├── admin/
│   ├── auth/
│   ├── availability/
│   ├── config/
│   ├── dispute/
│   ├── email/
│   ├── exception/
│   ├── match/
│   ├── review/
│   ├── scheduler/
│   ├── session/
│   ├── skill/
│   ├── transaction/
│   └── user/
│
├── src/main/resources/
│   └── application.properties
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── firebase.json
    ├── vercel.json
    ├── public/
    │   ├── favicon.ico
    │   └── favicon_512.png
    │
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── firebase.js
        ├── api/
        ├── components/
        ├── context/
        ├── lib/
        └── pages/
```

---

## How to Run Locally

### 1. Start PostgreSQL

From the project root:

```bash
docker-compose up -d
```

This starts a local PostgreSQL database with:

```text
Database: skillbank
Username: skillbank
Password: skillbank123
Port: 5432
```

### 2. Start the backend

From the project root:

```bash
mvn spring-boot:run
```

Or open the project in IntelliJ/Eclipse and run:

```text
SkillBankApplication.java
```

The backend runs on:

```text
http://localhost:8080
```

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

### 4. Open the app

Visit:

```text
http://localhost:5173
```

In local development, Vite proxies `/api` requests to:

```text
http://localhost:8080
```

That proxy is configured in:

```text
frontend/vite.config.js
```

---

## Production Build Commands

### Backend Docker build

The Dockerfile uses a two-stage build:

1. Maven image builds the JAR.
2. Eclipse Temurin JRE image runs the JAR.

Build locally:

```bash
docker build -t skillbank-api .
```

Run locally:

```bash
docker run -p 8080:8080 skillbank-api
```

### Frontend build

From `frontend/`:

```bash
npm run build
```

This creates the production frontend files in:

```text
frontend/dist/
```

---

## Current Manual / Intentional Limitations

These are not necessarily bugs. They are design decisions or current limitations.

### Payments are manual

There is no Stripe/PayPal-style automatic checkout. Buying and redeeming credits is coordinated manually through WhatsApp and local payment methods.

### Google Calendar is link-based

There is no Google OAuth integration. The app simply opens a pre-filled Google Calendar event link.

### AI chat page is only a UI demo

The `/ai-chat` page is a v0-style visual component. It is not connected to a real AI backend or SkillBank data.

### Availability is weekly/recurring

The availability grid stores day-of-week + hour, not one-time availability dates. When booking, the frontend suggests the next valid occurrence at least about 24 hours ahead.

---

## Simple Mental Model of the Whole App

Think of SkillBank like a small bank, but instead of money, it tracks learning hours.

- A user deposits value by teaching.
- A user withdraws value by learning.
- Credits are the accounting unit.
- Escrow protects both sides.
- Reviews build trust.
- Admins handle the real-world parts that cannot be fully automated yet.

That is why the name “SkillBank” fits the project: it is a bank for skills, time, and knowledge.
