# Live MCQ Mock Test Platform (MERN)

A production-ready full-stack web application designed for concurrent mock test examinations. Built with high-concurrency resilience, server-authoritative state, and a mobile-first responsive design.

---

## 🚀 Getting Started

### Option 1: Run with Docker Compose (Recommended)
This spins up MongoDB, the Node.js API server (port 5000), and the React Client (served via Nginx on port 3000):

```bash
docker-compose up --build
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Run Locally (Non-Docker)

1. **Install Dependencies:**
   In the root directory, run:
   ```bash
   npm run install:all
   ```

2. **Start MongoDB:**
   Ensure a local instance of MongoDB is running on `mongodb://localhost:27017/mocktest-db`.

3. **Run Development Servers:**
   ```bash
   npm run dev
   ```
   This runs the backend on [http://localhost:5000](http://localhost:5000) and frontend on [http://localhost:3000](http://localhost:3000).

---

## 🔒 Default Test Accounts
On database initialization, the server automatically seeds the following credentials for testing:

*   **Student Account:** `student@mocktest.org` / `student123`
*   **Admin Account:** `admin@mocktest.org` / `adminPass123`

---

## ⚙️ Core System Architecture

### 1. Server-Authoritative Timer
*   **No Client-Trust:** The countdown timer is defined and owned strictly by the server (`startedAt` and `deadlineAt`). The client's browser timer is purely cosmetic.
*   **Background Cron Sweep:** A `node-cron` daemon runs every 30 seconds querying `Attempt.find({ status: 'in-progress', deadlineAt: { $lte: now } })` and force-submits them, ensuring students get graded even if they close their browser tab.
*   **Reactive Auto-Submit:** Every API request related to an attempt (retrieving the exam, selection updates, submissions) performs an instant inline check against the deadline and force-submits immediately if expired, preventing late writes.

### 2. Question Selection Logic (Subset-Sum)
*   To assemble a test paper worth exactly **100 marks** from a bank of 300+ questions, the platform implements a **Dynamic Programming 0-1 Knapsack solver**.
*   **Mandatory Constraints:** It first randomly extracts questions from each category that has a `minQuestions` rule. It then filters the remaining active questions to respect `maxQuestions` constraints, shuffles them, and runs the DP solver on the remaining sum.
*   **Variety:** Backtracking through the DP table uses random selection when multiple paths are valid, ensuring that concurrent students receive distinct question selections.
*   *Note:* The question bank requires a diverse spread of mark tiers (1, 2, 3, and 5 marks) for the solver to hit exactly 100. The seeded bank contains 320 questions with mixed weights.

### 3. Concurrency Protection
*   All exam-state modifications (specifically saving option selections) are written atomically via indexed queries scoped to `{ attemptId, userId, status: 'in-progress' }` to ensure zero collision under concurrent load.
*   Correct answers and text explanations are never returned to the client in the `/attempts/start` or `/attempts/:id` payloads. They are only exposed via the secure `/attempts/:id/review` endpoint after the test changes status to `submitted` or `auto-submitted`.
