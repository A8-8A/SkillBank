# SkillBank

**Trade Skills, Grow Together.**

A community platform where people exchange skills using time-based credits instead of money. Teach what you know, learn what you love.

🌐 **Live at:** [https://skillbank-489a8.web.app](https://skillbank-489a8.web.app)

---

## What Is SkillBank?

SkillBank lets people trade skills with each other. If you teach someone guitar for an hour, you earn 1 credit. You can then spend that credit to learn photography, cooking, or anything else from someone in the community.

No money changes hands between users — just time for time.

Users can also buy credits ($15 each or $60 for 5) and cash out earned credits ($50 per 5). Payments are handled manually through WhatsApp and local Lebanese payment methods (OMT, Wish Money, bank transfer) since international payment gateways like Stripe don't support Lebanon.

---

## Key Features

- **Skill exchange with escrow** — credits are held safely during sessions and only released after completion
- **Smart matching** — finds mutual matches, one-way matches, and lets you search all users by name, skill, category, or tag
- **Weekly availability grid** — teachers set when they're free, learners book directly from their profile
- **Session lifecycle** — booking, confirmation, auto-cancellation, completion, disputes, and refunds all handled automatically
- **Review system** — separate teaching and learning ratings with detailed feedback questions
- **Email notifications** — verification, booking alerts, session reminders (2hrs before), referral bonuses
- **Referral system** — invite friends, both get a bonus credit
- **Profile pictures** via Firebase Storage
- **Google Calendar integration** — one-click event creation for confirmed sessions
- **Admin panel** — platform stats, user management, session monitoring, credit operations, dispute resolution
- **Profile completion prompts** — nudges users to fill out their profile
- **Account deletion** — users can fully delete their accounts

---

## Tech Stack

### Frontend
React, Vite, Axios, Framer Motion, Three.js/React Three Fiber, Firebase SDK, CSS

### Backend
Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, Hibernate, JWT (jjwt), Lombok, PostgreSQL

### Infrastructure
Firebase Hosting (frontend), Render (backend via Docker), Neon (PostgreSQL), Firebase Storage (images), Firebase Analytics, Brevo (transactional emails)

---

## Skills Used to Build This

- Full-stack web development (React + Spring Boot)
- REST API design and JWT authentication
- Database design with PostgreSQL (relational modeling, escrow transactions, constraint management)
- Docker containerization
- Cloud deployment across multiple free-tier platforms
- Email service integration (migrated from Gmail SMTP to Brevo HTTP API)
- Firebase configuration (Hosting, Storage, Analytics)
- Git version control with multi-contributor workflow
- CI/CD with GitHub Actions (auto-deploy frontend to Firebase)
- DNS, CORS, and cross-origin debugging
- CSS design without component libraries

---

## Hosting It for $0 — The Hard Part

One of the biggest challenges of this project was deploying a full-stack application with absolutely zero budget. Here's what that looked like:

**The good:** We found a combination of free tiers that actually works — Firebase Hosting for the frontend, Render for the backend, and Neon for PostgreSQL. Each service has generous free allowances and the app runs entirely within them.

**The painful:**

- **Railway burned us first.** We initially deployed on Railway, got everything working, then came back days later to find the project gone — the trial credits expired silently and the app was just dead. That's how we ended up on Render.

- **Render's free tier spins down** after 15 minutes of inactivity. The first request after sleep takes ~30 seconds. Not ideal for demos, but acceptable for a student project with no budget.

- **Stripe doesn't support Lebanon.** Neither does Tap Payments. We spent time researching payment gateways before accepting that manual WhatsApp-based payments were the only viable free option.

- **Gmail SMTP got blocked** on Render. The server couldn't reach `smtp.gmail.com:587` — Render's free tier blocks outbound SMTP. We had to migrate to Brevo's HTTP-based email API mid-development.

- **Database constraints broke silently.** When we added the `REDEMPTION` transaction type in Java, PostgreSQL's CHECK constraint (created when the table was first made) only allowed the original 4 types. Every credit deduction failed with a cryptic error until we manually ALTER'd the constraint in the database.

- **Timezone mismatches** between the server (UTC) and users (Lebanon, UTC+3) caused the dispute/report feature to think sessions hadn't started yet. Fixed by setting `TZ=Asia/Beirut` on Render.

- **CORS issues** — the frontend and backend live on different domains, so every new deployment URL had to be added to the CORS whitelist manually.

- **File placement chaos** — coordinating code changes across 20+ files, three hosting platforms, and multiple team members using downloaded files (not a shared IDE) led to plenty of "I replaced the wrong file" and "git merge conflicts in Vim" moments.

Despite all of this, the app is live and functional on a $0/month infrastructure.

---

## Architecture

```
User's Browser
    │
    ▼
Firebase Hosting ──── serves the React frontend
    │
    ▼
Render ──── runs Spring Boot API in Docker
    │
    ▼
Neon ──── PostgreSQL database
    │
    ├── Firebase Storage ──── profile pictures
    ├── Firebase Analytics ──── usage tracking
    └── Brevo ──── transactional emails
```

---

## Running Locally

```bash
# Start the database
docker-compose up -d

# Start the backend
mvn spring-boot:run

# Start the frontend (in a second terminal)
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment Variables (Production)

| Variable | Purpose |
|----------|---------|
| `SPRING_DATASOURCE_URL` | Neon PostgreSQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `APP_URL` | Frontend URL for email links |
| `BREVO_API_KEY` | Brevo email API key |
| `BREVO_FROM_EMAIL` | Sender email address |
| `BREVO_FROM_NAME` | Sender display name |
| `TZ` | Timezone (`Asia/Beirut`) |

---

## Team
[@Ali Al Ameer Amhaz](https://github.com/A8-8A)
[@Mohamad Azan](https://github.com/mohamad-azan)
[@Jawad Diab](https://github.com/JawadDiab07)
[@Mohammad Mahdi Shaito](https://github.com/mms200)
[@Hashem Jawad](https://github.com/HashemJawad)
