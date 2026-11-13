# RouteLess: The Last Mile

> **"When a bus stops, learning should not."**  
> AI-Powered Rural Transportation Resilience & Dynamic Recovery Prototype

[![Automated Tests](https://img.shields.io/badge/Tests-5%20Passing-emerald)](https://github.com/prembt1206/Prompt-Avengers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Production%20Ready-brightgreen)](https://github.com/prembt1206/Prompt-Avengers)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://prembt1206.github.io/Prompt-Avengers/)

---

## ⚠️ Important Simulation Notice

> **Simulation — not a live transport service.**  
> RouteLess is a synthetic operational research prototype designed for demonstration and evaluation under the *ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge*.  
> It does not connect to live government databases, real-time GPS sensors, or actual emergency dispatch services. No verified transport safety certification or official government affiliation is implied. All villages, institutions, roads, vehicles, and student records are fictional.

---

## 🎯 Product Statement & Purpose

In rural and tribal regions, physical distance and unpredictable infrastructure create severe educational fragility. A single disabled mini-bus or a flooded causeway can instantly cut off dozens of students from attending secondary school exams or polytechnic laboratory sessions.

**RouteLess** solves this last-mile vulnerability by providing:
1. An accessible, zero-friction transport request portal for rural students.
2. An intelligent coordinator cockpit that models topological road connections, vehicle trip schedules, and seat capacities.
3. A pure deterministic recovery solver that reassigns scarce vehicular seats during disruptions while **honestly reporting unmet demand** without fabricating false capacity.

---

## 🚀 Live Public Deployment & Repository

- **Public Web Application (Primary):** [https://prembt1206.github.io/Prompt-Avengers/](https://prembt1206.github.io/Prompt-Avengers/)
- **Public Web Application (Mirror):** [https://prembt1206.github.io/routeless/](https://prembt1206.github.io/routeless/)
- **Public GitHub Repository (Primary):** [https://github.com/prembt1206/Prompt-Avengers](https://github.com/prembt1206/Prompt-Avengers)
- **Public GitHub Repository (Mirror):** [https://github.com/prembt1206/routeless](https://github.com/prembt1206/routeless)

---

## 📋 Assumptions & System Boundaries

As specified in the challenge design parameters:
1. **Single-User Demonstration:** The prototype is configured for single-evaluator exploration without complex multi-tenant concurrency.
2. **Demo Role Toggle (Not Access Control):** The Coordinator View and Student View are switched via an instant demo toggle in the top header. This is a rapid demonstration feature, not role-based security (RBAC) or cryptographic authentication.
3. **Synthetic Domain Data (Mangaluru Suburban / Coastal Karnataka Region):** All 5 rural hamlets (*Pavoor Riverine Fringe, Farangipete Junction, Kalladka Foothills, Ganjimutt Valley, Gurupura Riverbank*), 2 Mangaluru educational institutions (*St. Aloysius High School & PU College, Karnataka (Govt) Polytechnic — KPT*), 7 road segments, 3 vehicle trips, and 17 student requests are modeled for demonstration.
4. **LocalStorage Storage Limitations & Privacy:**
   - State persists within the evaluator's current browser origin via `localStorage`.
   - Data is **not** synced to a centralized cloud database and is **not** shared across distinct browser sessions or devices.
   - `localStorage` does not provide encrypted or secure authentication.
   - **Never input real sensitive student personally identifiable information (PII).**
5. **No Hallucinated Capacity:** When vehicle capacity is exhausted or routes are cut off, RouteLess produces truthful, transparent reasons for every unassigned student rather than inventing extra trips or violating physical seat counts.

---

## 🔄 Core Demonstration Flow (Step-by-Step Evaluator Script)

Evaluators can verify the end-to-end resilience workflow following this exact sequence:

```
[1. Student Request] ──> [2. Coordinator Review] ──> [3. Baseline Allocation]
                                                            │
[6. Inspect Unmet & Diff] <── [5. Recovery Allocation] <── [4. Trigger Disruption]
```

### Step 1: Submit Student Transport Request
1. Click the **"Student View"** toggle in the top navigation bar.
2. Inspect the 17 seeded student requests or submit a custom request using the form (e.g., student name "Deeksha Poojary" from *Pavoor Riverine Fringe* to *St. Aloysius High School & PU College* for *Karnataka SSLC Board Practical Exam*).
3. The request is immediately registered into local state and scheduled for dispatch.

### Step 2: Coordinator Views Trips & Available Capacity
1. Toggle back to **"Coordinator View"**.
2. Examine the 3 vehicle trips:
   - **Bus 01 — KSRTC Rural Sarige Mini-Bus:** 6 seats, serves *Pavoor* & *Farangipete* → *St. Aloysius HSS, Light House Hill* (arrives 08:15).
   - **Van 02 — Dakshina Kannada ZP Maxi-Cab:** 4 seats, serves *Kalladka* & *Farangipete* → *Karnataka Polytechnic (KPT), Kadri* (arrives 08:25).
   - **Cruiser 03 — Kudla Community Cruiser:** 5 seats, serves *Gurupura*, *Ganjimutt*, & *Farangipete* → *St. Aloysius HSS* (arrives 08:20).
3. Total available seats = 15. Total student demand = 17 requests.

### Step 3: Run Baseline Allocation
1. Click **"1. Run Baseline Allocation"** in the cockpit.
2. Observe deterministic assignment:
   - Exactly 15 students are assigned valid seats matching timing, origin stops, and destination schools.
   - Exactly 2 students remain unassigned because 17 requests exceed the 15-seat physical limit.
   - The **Unmet Student Demand** roster displays truthful explanations: `"Capacity exhausted (all feasible trips at maximum occupancy)"`.

### Step 4: Simulate Disruption (Vehicle Breakdown or Blocked Causeway)
Choose either manual toggles or the one-click preset bar:
- **Option A (Vehicle Cancellation):** Click preset **"Scenario A: KSRTC Bus 01 Engine Breakdown"** (or toggle cancellation on Bus 01 card). KSRTC Bus 01 (6 seats) is marked out-of-service.
- **Option B (Route Obstruction):** Click preset **"Scenario B: Gurupura Causeway Flash Flood"** (or click the Gurupura–Ganjimutt segment on the interactive SVG map). The low-lying causeway over the Phalguni river is marked impassable.

### Step 5: Run Recovery Allocation
1. Click **"2. Run Recovery Allocation"**.
2. The pure TypeScript solver re-evaluates the network topology:
   - Cancelled vehicles and blocked route legs are strictly disqualified.
   - Surviving vehicles (*Cruiser 03* and *Van 02*) are loaded up to their capacity limit.
   - Eligible students who have alternate paths are rerouted; students with no feasible alternative are identified.

### Step 6: Review Valid New Assignments & Honest Unmet Explanations
1. Open the **"Assignments & Unmet Demand"** tab:
   - *Pavoor* students (whose only service was Bus 01) are flagged as **Unmet** with clear reason: `"The only scheduled transport serving Pavoor Riverine Fringe (Bus 01) has been CANCELLED. No active alternative vehicle exists for this sector."`
   - *Farangipete* students heading to St. Aloysius are evaluated for *Cruiser 03*; seats are allocated by academic priority (Board Exam candidates first) until Cruiser 03 reaches its 5-seat limit.
2. Open the **"Baseline vs Recovery Diff"** tab (P1) to inspect the side-by-side impact delta, displaced students, and rerouted students.
3. Open the **"Solver Trace Logs"** tab (P1) for the step-by-step deterministic audit trail.
4. Click **"Reset Demo"** at any time to return the fleet and network to the default seed state.

---

## 🧩 Domain Model & Constraints

| Entity | Attributes | Physical Constraints Enforced |
|---|---|---|
| **Village** | ID, Name, Coordinates, Connectivity Type | Must be an explicitly scheduled stop on a trip to enable boarding. |
| **Institution** | ID, Name, School Start Time (HH:MM), Type | Trip arrival time must be $\le$ school start time to be feasible. |
| **Transport Corridor** | ID, From, To, Distance (km), Travel Time (min), Blocked Flag | Impassable roads invalidate all trip legs traversing them. |
| **Vehicle Trip** | Vehicle Name, Capacity, Destination, Stops, Path Segments | 1 active trip per vehicle; fixed capacity; zero seat over-allocation. |
| **Student Request** | Student Name, Origin, Destination, Deadline, Priority Category | Occupies exactly 1 seat from pickup stop to final destination. |
| **Assignment** | Student, Trip, Pickup Time, Dropoff Time, Seat # | Deterministically generated; respects priority triage and deadlines. |
| **Unmet Request** | Student, Origin, Destination, Primary Reason, Full Audit | Never hidden or fabricated; includes evaluation of all fleet trips. |

---

## 🛠️ Technology Stack & Zero-Backend Architecture

- **Framework:** React 19 + TypeScript + Vite 8
- **Allocation Engine:** Pure TypeScript module (`src/services/allocationSolver.ts`) with **zero UI dependencies**
- **Visualization:** Interactive SVG Network Schematic with live visual statuses
- **State & Storage:** Local state with resilient `localStorage` browser persistence
- **Icons:** Lucide React
- **Testing:** Vitest automated test suite verifying determinism, capacities, cancellations, route closures, and timing
- **Deployment:** Static single-page application deployed to GitHub Pages via automated GitHub Actions

---

## 🧪 Automated Test Suite

Run the unit tests locally:

```bash
# Run pure allocation solver test suite
npm test
```

Test coverage includes:
1. **Determinism:** Identical repeated runs produce identical seat allocations and unmet rosters.
2. **Capacity Enforcement:** Vehicle seat allocation never exceeds capacity under any load.
3. **Vehicle Cancellation:** Cancelled vehicles receive 0 assignments; stranded villages receive honest cancellation explanations.
4. **Route Obstruction:** Blocked segments invalidate affected trip legs; downstream legs remain operational.
5. **Dynamic Capacity Adjustments:** Live editing of vehicle capacity immediately alters allocation outputs.
6. **Arrival Timing Incompatibility:** Trips arriving after student deadlines are disqualified with explicit timing reasons.

---

## 💻 Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/prembt1206/routeless.git
cd routeless

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build production static bundle
npm run build
```

---

## 📄 License

Distributed under the MIT License. Developed for the *ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge*.
