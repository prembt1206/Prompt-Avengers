# RouteLess: The Last Mile

> **"When a bus stops, learning should not."**  
> AI-Powered Rural Transportation Resilience & Dynamic Recovery Prototype  
> Built for the *ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge*

[![Automated Tests](https://img.shields.io/badge/Tests-20%20Passing-emerald)](https://github.com/prembt1206/Prompt-Avengers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Production%20Ready-brightgreen)](https://github.com/prembt1206/Prompt-Avengers)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://prembt1206.github.io/routeless/)

---

## ⚠️ Mandatory Simulation Notice

> **Simulation — not a live transport service.**  
> RouteLess is a synthetic operational research prototype designed for demonstration and evaluation under the *ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge*.  
> It does not connect to live government databases, real-time GPS sensors, or actual emergency dispatch services. No verified transport safety certification or official government affiliation is implied. All villages, educational institutions, roads, vehicles, and student records are fictional.

---

## 🎯 Product Statement & Purpose

In rural and suburban corridors, physical distance and unpredictable infrastructure create severe educational fragility. A single disabled mini-bus or a flooded causeway can instantly cut off dozens of students from attending secondary school board examinations or polytechnic laboratory sessions.

**RouteLess** solves this last-mile vulnerability by providing:
1. An accessible, zero-friction transport request portal for rural students with dedicated board examination tracking.
2. An intelligent coordinator cockpit that models topological road connections, vehicle trip schedules, and physical seat capacities.
3. A pure deterministic recovery solver that reassigns scarce vehicular seats during disruptions while **honestly reporting unmet demand** without fabricating false capacity.
4. An integrated crisis management engine capable of handling simultaneous multi-vector failures: fleet breakdowns, demand surges, and flooded road blockages.

---

## 🚀 Live Public Deployment & Repository

- **Public Web Application (Primary):** [https://prembt1206.github.io/routeless/](https://prembt1206.github.io/routeless/)
- **Public Web Application (Mirror):** [https://prembt1206.github.io/Prompt-Avengers/](https://prembt1206.github.io/Prompt-Avengers/)
- **Public GitHub Repository (Primary):** [https://github.com/prembt1206/Prompt-Avengers](https://github.com/prembt1206/Prompt-Avengers)
- **Public GitHub Repository (Mirror):** [https://github.com/prembt1206/routeless](https://github.com/prembt1206/routeless)

---

## 🚨 Official Surprise Hurdle: "THE EXAM DAY CRISIS"

During the morning transit window on secondary board examination day, the rural transport network experiences four simultaneous cascading disruptions:

| Disruption Vector | Concrete Network Impact | System Handling |
|---|---|---|
| **Two Government Buses Disabled** | Bus 01 (KSRTC Mini-Bus, 7 seats) and Bus 02 (KSRTC JnNURM Suburban, 6 seats) suffer simultaneous mechanical and alternator failures. | Fleet capacity drops from 24 seats to 11 seats (Van 03: 5 seats, Cruiser 04: 6 seats). |
| **+40% Student Demand Surge** | Baseline demand increases by exactly 40%: $\lceil 20 \times 0.40 \rceil = 8$ new deterministic student requests (Total: 28 requests). | Deterministic crisis requests added with stable identifiers; repeated activations are 100% idempotent. |
| **Major Valley Road Flooded** | Phalguni-Netravati river overflow submerges the direct valley corridor between *Ganjimutt Valley* and *Farangipete Junction* (`seg-ganji-far`). | Dijkstra shortest-path router dynamically discovers the elevated *Adyar Ridge* bypass (`seg-ganji-adyar` + `seg-adyar-far`), calculating an 8-minute detour (+8m). |
| **Imminent Board Examinations** | 10 students across the network have state board examinations starting within the next two hours ($\le$ 08:45 AM). | Pure solver prioritizes imminent exam candidates, enjoining a mandatory **15-minute arrival buffer** before exam start times. |

### The Transparent 3-State Model

RouteLess strictly avoids manufacturing instant magical outcomes upon crisis activation:

```
[State A: Normal Baseline] 
        │  (Evaluator clicks "Activate Exam Day Crisis")
        ▼
[State B: Crisis Before Recovery] 
        │  • Surviving assignments on active/unblocked trips revalidated
        │  • Cancelled bus & flooded road assignments invalidated & cleared
        │  • +40% surge requests remain unassigned
        │  • "Allocations Stale — Recovery Required" badge displayed
        │  (Evaluator clicks "Generate Recovery Plan")
        ▼
[State C: Crisis After Recovery]
        • Pure Dijkstra solver discovers Adyar Ridge bypass (+8m detour)
        • Remaining 11 seats allocated by strict priority triage
        • Imminent exam candidates prioritized
        • Truthful unmet demand roster (17 unmet students) with honest capacity explanations
        • Side-by-side comparison panel auditing State B vs State C gains
```

---

## 📋 Assumptions & System Boundaries

1. **Single-User Demonstration:** The prototype is configured for single-evaluator exploration without multi-tenant concurrency.
2. **Demo Role Toggle (Not Access Control):** The Coordinator View and Student View are switched via an instant demo toggle in the top header. This is a rapid demonstration feature, not role-based security (RBAC) or cryptographic authentication.
3. **Synthetic Domain Data (Mangaluru Suburban / Coastal Karnataka Region):** All 6 rural hamlets (*Pavoor Riverine Fringe, Farangipete Junction, Kalladka Foothills, Ganjimutt Valley, Gurupura Riverbank, Adyar Ridge Waypoint*), 2 Mangaluru educational institutions (*St. Aloysius High School & PU College, Karnataka (Govt) Polytechnic — KPT*), 7 road corridors, 4 vehicle trips, and 20 baseline student requests (+8 crisis surge requests = 28 total) are synthetic.
4. **Fixed Simulation Clock:** To ensure consistent, reproducible demonstration across time zones, RouteLess operates against a fixed simulation clock: **`06:45 AM`**. The "within two hours" examination window corresponds to exams starting $\le$ **`08:45 AM`**.
5. **Configurable 15-Minute Exam Arrival Buffer:** Exam candidates require arrival at least 15 minutes before the scheduled exam start (e.g. an 08:30 exam requires arrival $\le$ 08:15).
6. **No Hallucinated Capacity or Fake Punctuality:**
   - Surviving fleet capacity (11 seats) is never exceeded under any load.
   - When a vehicle arrives after a student's required buffer due to a detour (e.g. Cruiser 04 arriving at 08:23 for an 08:30 exam requiring 08:15 arrival), RouteLess **does not count them as on-time**. Instead, it classifies them as an unmet request and surfaces a truthful **"Late Alternative Option"** card with the exact delay (+8 minutes).
7. **LocalStorage Privacy & Limitations:**
   - Data persists within the evaluator's local browser origin via `localStorage`.
   - Data is not synced to a remote database and is not shared across browser sessions.
   - **Never input real sensitive student personally identifiable information (PII).**

---

## 🔄 Core Demonstration Flow (Step-by-Step Evaluator Script)

Evaluators can follow the built-in **"Demo Script"** walkthrough in the application header:

### Step 1: Normal Baseline Roster & Allocation
1. Toggle to **Coordinator View**.
2. Review the fleet of 4 vehicles (Bus 01, Bus 02, Van 03, Cruiser 04; 24 seats total) and 20 student requests.
3. Click **"Run Baseline Allocation"**.
4. Observe deterministic baseline results: 18 students assigned, 2 unmet due to sector capacity limits.

### Step 2: Activate "The Exam Day Crisis"
1. In the prominent crisis banner, click **"Activate Exam Day Crisis"**.
2. Confirm the activation dialog.
3. Observe **State B (Crisis Before Recovery)**:
   - Bus 01 and Bus 02 are disabled simultaneously.
   - `seg-ganji-far` is blocked by flood waters (indicated with animated flood pulses on the interactive SVG map).
   - Demand surges by +40.0% (20 $\to$ 28 requests; +8 deterministic crisis requests).
   - The UI displays an amber badge: `"Allocations Stale — Recovery Required"`.
   - Only surviving trips on unblocked corridors remain assigned; newly surged requests remain unassigned.

### Step 3: Generate Recovery Plan
1. Click the primary button **"Generate Recovery Plan"** (or the floating action button at bottom-right).
2. The pure solver executes Dijkstra shortest-path routing:
   - Dynamic bypass discovery: Cruiser 04 routes around flooded `seg-ganji-far` via the elevated *Adyar Ridge* corridor (`seg-ganji-adyar` + `seg-adyar-far`), arriving at 08:23 (+8 min detour).
   - Priority triage: Imminent board examination candidates ($\le$ 08:45 AM) are prioritized for the surviving 11 seats.
3. Inspect the **"State B vs State C Crisis Comparison"** panel:
   - Full side-by-side audit of surviving capacity (11 seats), exam students saved, and net recovery improvement.

### Step 4: Inspect Truthful Unmet Demand & Late Alternatives
1. Open the **"Assignments & Unmet Demand"** tab:
   - Review the 11 successfully assigned students (including high-priority exam students).
   - Review the 17 unassigned students. Each student features an **honest, transparent explanation** (`CAPACITY_EXCEEDED`, `TRIP_CANCELLED`, or `ROUTE_BLOCKED`).
   - Notice the **"Late Alternative Option"** card for candidates whose vehicle arrives slightly after the 15-minute buffer due to the detour.

### Step 5: Test Reset & Edge Cases
1. Click **"Reset to Normal Scenario"** in the crisis control banner or header.
2. Confirm that the application returns to the clean 20-request baseline fixture with unblocked roads and all 4 vehicles active.

---

## 🧩 Domain Model & Constraints

| Entity | Attributes | Physical Constraints Enforced |
|---|---|---|
| **Village** | ID, Name, Coordinates, Connectivity Type | Must be an explicitly scheduled stop on a trip to enable boarding. |
| **Institution** | ID, Name, School Start Time (HH:MM), Type | Trip arrival time must be $\le$ institution start time to be feasible. |
| **Transport Corridor** | ID, From, To, Distance (km), Travel Time (min), Road Type, Blocked Flag | Impassable roads are excluded from shortest-path calculations. |
| **Vehicle Trip** | Vehicle Name, Capacity, Destination, Stops, Path Segments, Cancelled Flag | 1 active trip per vehicle; fixed capacity; zero seat over-allocation. |
| **Student Request** | Student Name, Origin, Destination, Exam Details, Deadline, Priority Category | Occupies exactly 1 seat from pickup stop to final destination. |
| **Assignment** | Student, Trip, Pickup Time, Dropoff Time, Seat #, On-Time Flag | Deterministically generated; respects priority triage and deadlines. |
| **Unmet Request** | Student, Origin, Destination, Reason Code, Honest Explanation, Late Alternative | Never hidden or fabricated; includes full multi-trip evaluation. |
| **Exam Crisis State** | Active Flag, Disabled Buses, Blocked Roads, Surge Metrics, Stale Flag | Atomic snapshot and 3-state transition tracking. |

---

## 🛠️ Technology Stack & Zero-Backend Architecture

- **Framework:** React 19 + TypeScript + Vite 8
- **Allocation Engine:** Pure TypeScript module (`src/services/allocationSolver.ts`) with **zero UI dependencies**
- **Routing Engine:** Pure Dijkstra shortest-path graph search (`src/services/routingEngine.ts`)
- **Crisis Manager:** Deterministic scenario state and comparison metrics (`src/services/crisisScenario.ts`)
- **Visualization:** Interactive SVG Network Schematic with animated vehicle markers and road water pulses (fully accessible with `prefers-reduced-motion` compliance)
- **State & Storage:** Local state with resilient `localStorage` browser persistence
- **Icons:** Lucide React
- **Testing:** Vitest automated test suite verifying determinism, capacities, cancellations, route closures, and timing
- **Deployment:** Static single-page application deployed to GitHub Pages

---

## 🧪 Automated Test Suite (20 Tests Passing)

Run the full test suite locally:

```bash
# Run unit test suite
npm test
```

### Verified Test Cases:

#### `src/tests/allocationSolver.test.ts` (Core Baseline Solver)
1. **Determinism:** Identical repeated runs produce identical seat allocations and unmet rosters.
2. **Capacity Enforcement:** Vehicle seat allocation never exceeds capacity under any load.
3. **Vehicle Cancellation:** Cancelled vehicles receive 0 assignments; stranded villages receive honest cancellation explanations.
4. **Bypass Rerouting:** Solver detects flooded corridor and routes via Adyar Ridge with +8m detour.
5. **Dynamic Capacity Adjustments:** Live editing of vehicle capacity immediately alters allocation outputs.
6. **Arrival Timing Incompatibility:** Trips arriving after student deadlines are disqualified with explicit timing reasons.

#### `src/tests/examCrisis.test.ts` (Official Surprise Hurdle Suite)
1. **Test 1:** Exactly two government buses (`trip-01`, `trip-02`) disabled simultaneously upon activation.
2. **Test 2:** Demand increases by exact 40% rounding rule (20 baseline $\to$ +8 surge = 28 total requests, +40.0%).
3. **Test 3:** Repeated activation is 100% idempotent and never duplicates requests.
4. **Test 4:** Flooded road `seg-ganji-far` is strictly excluded from all allocated paths in recovery.
5. **Test 5:** Dijkstra shortest-path finds Adyar Ridge bypass with +8m detour.
6. **Test 6:** Completely severed route produces honest failure explaining no accessible route is available.
7. **Test 7:** Imminent exam candidates are prioritized over non-exam requests.
8. **Test 8:** Impossible deadlines remain unmet and are never marked on-time.
9. **Test 9:** Active capacity ceiling strictly respects surviving fleet capacity (11 seats maximum).
10. **Test 10:** Zero capacity when all vehicles are cancelled is handled safely without throwing exceptions.
11. **Test 11:** Allocation solver is 100% deterministic across multiple runs.
12. **Test 12:** `crisisState.isStale` flag is set to true on activation and cleared upon recovery plan generation.
13. **Test 13:** State B vs State C comparison metrics accurately calculate recovery gains.
14. **Test 14:** Mandatory 15-minute exam arrival buffer and 06:45 AM simulation clock are strictly enforced.
15. **Test 15:** Unmet students with feasible but delayed buses receive detailed late alternative information.

---

## 💻 Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/prembt1206/Prompt-Avengers.git
cd Prompt-Avengers

# 2. Install dependencies
npm install

# 3. Run automated tests
npm test

# 4. Start local development server
npm run dev

# 5. Build for production
npm run build
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
