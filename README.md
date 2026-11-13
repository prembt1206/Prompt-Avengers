# RouteLess: The Last Mile

> **"When a bus stops, learning should not."**  
> AI-Powered Rural Transportation Resilience & Dynamic Recovery Prototype  
> Built for the *ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge*

[![Automated Tests](https://img.shields.io/badge/Tests-26%20Passing-emerald)](https://github.com/prembt1206/Prompt-Avengers)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20RLS%20Integrated-3ECF8E?logo=supabase)](https://supabase.com)
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
5. **Supabase Cloud & Local Demo Dual-Mode Integration:** Real database authentication (email/password), Row Level Security (RLS) policies protecting student privacy, database-enforced coordinator permissions, atomic crisis stored procedures, and concurrency checks.

---

## 🚀 Live Public Deployment & Repository

- **Public Web Application (Primary):** [https://prembt1206.github.io/routeless/](https://prembt1206.github.io/routeless/)
- **Public Web Application (Mirror):** [https://prembt1206.github.io/Prompt-Avengers/](https://prembt1206.github.io/Prompt-Avengers/)
- **Public GitHub Repository (Primary):** [https://github.com/prembt1206/Prompt-Avengers](https://github.com/prembt1206/Prompt-Avengers)
- **Public GitHub Repository (Mirror):** [https://github.com/prembt1206/routeless](https://github.com/prembt1206/routeless)

---

## ⚡ Supabase Cloud & Local Demo Architecture

RouteLess implements a clean **Dual-Mode Data Architecture**:

```
                              ┌────────────────────────────────────────┐
                              │ RouteLess Dual-Mode Data Access Layer │
                              └───────────────────┬────────────────────┘
                                                  │
                 ┌────────────────────────────────┴────────────────────────────────┐
                 ▼                                                                 ▼
   [Local Demo Mode (Default)]                                      [Supabase Cloud Connected]
   • Zero-credential standalone mode                               • Real Email/Password Auth
   • LocalStorage browser persistence                              • PostgreSQL Multi-tenant Tables
   • Rapid evaluation & testing                                    • Row Level Security (RLS) Enforced
   • Honest setup guide indicator                                  • Atomic Stored Procedures & Version Concurrency
```

### 1. Database Schema (`supabase/migrations/20261113000000_routeless_schema.sql`)
- `profiles`: Extends `auth.users` with user metadata via Postgres triggers.
- `scenarios`: Isolates scenario demo instances (with `version` counter and `is_active_crisis` flag).
- `scenario_memberships`: Role-Based Access Control mapping `user_id` $\to$ `role` (`'coordinator'` vs `'student'`).
- `villages`, `institutions`, `route_connections`, `vehicle_trips`: Relational network reference data.
- `transport_requests`: Student requests linked to `auth.uid()`, storing destination, exam deadlines, and submission timestamps.
- `allocation_runs`: Historical log of baseline and recovery runs with computed utilization metrics and version tag.
- `assignments`: Granular vehicle seat assignments with unique constraint preventing duplicate allocations per run.

### 2. Row Level Security (RLS) Policies
- **Student Privacy:** Students can create and query **only their own** transport requests (`user_id = auth.uid()`). They cannot read other students' requests or tamper with fleet capacity or road status.
- **Coordinator Authorization:** Only users with `role = 'coordinator'` in `scenario_memberships` (evaluated via a `SECURITY DEFINER` function with hardened search path) can cancel buses, block corridors, activate crises, or save recovery plans.
- **Tamper Protection:** Client UI toggles are never trusted as authorization. Database RLS guarantees non-coordinators receive an immediate Postgres error (`42501 Insufficient Privilege`) on mutation attempts.

### 3. Atomic Database Functions (RPCs)
- `activate_exam_crisis_rpc(p_scenario_id UUID)`: Atomically disables the 2 government buses, blocks the valley road, inserts the 8 deterministic crisis surge requests, and increments the scenario version.
- `reset_scenario_rpc(p_scenario_id UUID)`: Restores vehicles and roads, removes synthetic crisis requests (leaving student-submitted requests intact), and clears the crisis flag.
- `save_allocation_run_rpc(...)`: Verifies scenario version before saving to prevent stale race conditions.

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

```
[State A: Normal Baseline] 
        │  (Coordinator activates crisis)
        ▼
[State B: Crisis Before Recovery] 
        │  • Surviving assignments on active/unblocked trips revalidated
        │  • Cancelled bus & flooded road assignments invalidated & cleared
        │  • +40% surge requests remain unassigned
        │  • "Allocations Stale — Recovery Required" badge displayed
        │  (Coordinator clicks "Generate Recovery Plan")
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

1. **Dual Mode Flexibility:** Operates out-of-the-box in standalone Local Demo Mode, and connects seamlessly to Supabase when environment variables are supplied.
2. **Demo Role Toggle vs Real Auth:** In Local Demo Mode, the view toggle allows single-evaluator exploration. In Supabase Cloud Mode, permissions are strictly authenticated via Supabase Auth and enforced by Postgres RLS.
3. **Synthetic Domain Data (Mangaluru Suburban / Coastal Karnataka Region):** All 6 rural hamlets, 2 Mangaluru educational institutions (*St. Aloysius High School & PU College, Karnataka (Govt) Polytechnic — KPT*), 8 road corridors, 4 vehicle trips, and 20 baseline student requests are synthetic.
4. **Fixed Simulation Clock:** Operates against a fixed simulation clock: **`06:45 AM`**. The "within two hours" examination window corresponds to exams starting $\le$ **`08:45 AM`**.
5. **Configurable 15-Minute Exam Arrival Buffer:** Exam candidates require arrival at least 15 minutes before the scheduled exam start.
6. **No Hallucinated Capacity or Fake Punctuality:** Surviving fleet capacity (11 seats) is never exceeded. Late buses due to detours are flagged as **Late Alternatives**, never as on-time arrivals.

---

## 🧪 Automated Test Suite (26 Tests Passing)

Run the full test suite locally:

```bash
cmd /c npm test
```

```text
✓ src/tests/allocationSolver.test.ts (5 tests) 38ms
✓ src/tests/examCrisis.test.ts (15 tests) 53ms
✓ src/tests/supabaseIntegration.test.ts (6 tests) 9ms

Test Files  3 passed (3)
     Tests  26 passed (26)
```

### Verified Test Cases:

#### `src/tests/supabaseIntegration.test.ts` (Supabase Cloud Architecture Suite)
1. **Test 1:** Client environment handling safely detects unconfigured state without throwing exceptions.
2. **Test 2:** Unauthenticated sessions handle profile and session lookups gracefully.
3. **Test 3:** SQL migration `20261113000000_routeless_schema.sql` defines all 10 relational tables.
4. **Test 4:** Row Level Security (RLS) is enabled on all tables and security definer functions are present.
5. **Test 5:** Atomic stored procedures (`activate_exam_crisis_rpc`, `reset_scenario_rpc`, `save_allocation_run_rpc`) enforce version concurrency.
6. **Test 6:** Synthetic seed data (`supabase/seed.sql`) populates institutions, villages, connections, and vehicles.

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

## 💻 Local Development & Supabase Setup

### 1. Clone & Install
```bash
git clone https://github.com/prembt1206/Prompt-Avengers.git
cd Prompt-Avengers
npm install
```

### 2. Configure Supabase (Optional for Cloud Mode)
To connect your own Supabase project:
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your Supabase Dashboard (*Project Settings → API*).
3. In the Supabase SQL Editor, run:
   - `supabase/migrations/20261113000000_routeless_schema.sql` (Creates tables, RLS policies, and RPCs)
   - `supabase/seed.sql` (Populates Mangaluru rural corridor default data)

### 3. Run & Build
```bash
# Run automated test suite (26 tests)
npm test

# Run development server
npm run dev

# Build for production
npm run build
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
