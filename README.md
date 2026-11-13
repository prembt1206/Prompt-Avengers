# RouteLess: The Last Mile (v2.0 Upgrade)

> **"When a bus stops, learning should not."**  
> AI-Powered Rural Transportation Resilience & Dynamic Disruption Recovery Platform

[![Automated Tests](https://img.shields.io/badge/Tests-17%20Passing-emerald)](https://github.com/prembt1206/routeless)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Production%20Ready-brightgreen)](https://github.com/prembt1206/routeless)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://prembt1206.github.io/routeless/)

---

## ⚠️ Important Simulation Notice

> **Simulation Prototype — Operational Research Demonstration.**  
> RouteLess is a synthetic operational research prototype designed for demonstration and evaluation under the *ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge*.  
> It models genuine topological and geographical corridors across the Dakshina Kannada / Mangaluru rural-suburban region. It features a clearly labelled **Simulated GPS Telematics Mode** designed with an adapter pattern for real AIS-140 / Traccar telematics integration. All student records are synthetic demonstration data.

---

## 🎯 Product Statement & Purpose

In rural and tribal regions, physical distance and vulnerable infrastructure create severe educational fragility. A single disabled mini-bus or a flooded causeway can instantly cut off dozens of students from attending secondary school exams or polytechnic laboratory sessions.

**RouteLess** solves this last-mile vulnerability by providing:
1. **Interactive GIS Mapping (Leaflet + OpenStreetMap):** Real-world geographical mapping of rural hamlets, polytechnics, causeways, and road corridors.
2. **Fleet Telematics & Vehicle Tracking:** Real-time seat occupancy, driver info, and simulated GPS telemetry with ETA calculation.
3. **Pure Deterministic Recovery Solver:** Fast, zero-hallucination capacity allocation that strictly adheres to physical seat limits and produces transparent explanations for every unassigned student.
4. **Student Portal with Privacy Protection:** Safe request submission, personalized seat and driver details, and disruption advisories without exposing peers' PII.
5. **Emergency Disruption Notification Center:** In-app emergency notifications and adapter stubs for SMS/email gateways.
6. **What-If Disruption Simulator:** Isolated sandbox allowing coordinators to stress-test breakdowns, road closures, and board exam demand surges without altering operational data.
7. **Village Fairness & Vulnerability Index:** Regional Gini equity scoring and prescriptive fleet distribution recommendations.
8. **Enterprise RBAC & PostgreSQL/PostGIS Support:** Multi-role access control (`STUDENT`, `COORDINATOR`, `ADMINISTRATOR`), complete PostGIS database schema, and an Express REST API backend.

---

## 🚀 Live Public Deployment & Repository

- **Public Web Application (Primary):** [https://prembt1206.github.io/routeless/](https://prembt1206.github.io/routeless/)
- **Public GitHub Repository (Primary):** [https://github.com/prembt1206/routeless](https://github.com/prembt1206/routeless)

---

## 🗺️ Geographical Domain Model (Dakshina Kannada / Mangaluru Region)

RouteLess models real-world geographical coordinates in Coastal Karnataka:

| Entity | ID | Location / Landmark | Coordinates (Lat, Lng) | Connectivity Type |
|---|---|---|---|---|
| **Pavoor Riverine Fringe** | `vil-pavoor` | Pavoor Uliya / Netravati Backwaters | `12.8530° N, 74.9040° E` | Fair-Weather Gravel |
| **Farangipete Junction** | `vil-farangipete` | NH 73 Transit Crossroads, Bantwal | `12.8680° N, 74.9602° E` | All-Weather Tar |
| **Kalladka Foothills** | `vil-kalladka` | NH 75 Western Ghat Foothills | `12.8210° N, 75.0505° E` | Fair-Weather Gravel |
| **Ganjimutt Valley** | `vil-ganjimutt` | Gurupura River Valley Basin | `12.9550° N, 74.9520° E` | All-Weather Tar |
| **Gurupura Riverbank** | `vil-gurupura` | Phalguni (Gurupura) River Causeway | `12.9320° N, 74.9310° E` | Vulnerable River Crossing |
| **St. Aloysius PU College** | `inst-aloysius` | Light House Hill, Mangaluru | `12.8718° N, 74.8436° E` | Higher Secondary School |
| **Karnataka Polytechnic (KPT)** | `inst-kpt` | Kadri Hills, Mangaluru | `12.8872° N, 74.8624° E` | Polytechnic & ITI |

---

## 🧩 Architectural Features

### 1. Interactive Geographical Map (Leaflet + OpenStreetMap)
- Real OpenStreetMap tile rendering with zoom and pan controls.
- Color-coded vehicle routes (Bus 01: Cyan `#0284c7`, Van 02: Orange `#ea580c`, Cruiser 03: Purple `#9333ea`).
- Blocked road corridors highlighted in bold red dashed styling with closure root cause.
- Dynamic alternative route detour polylines (Emerald green dashed lines).
- Interactive marker inspection popups for hamlets, institutions, and vehicles.
- Toggle between **Geographical Leaflet Map** and **Topological Schematic SVG**.

### 2. Fleet Telematics & Vehicle Tracking
- Registration number, driver mobile, capacity, occupied seats, and live status (`Available`, `On Route`, `Delayed`, `Breakdown`, `Out of Service`).
- Dynamic ETA calculated from remaining route distance and operational speed ($v \approx 38\text{ km/h}$).
- Built-in **Simulated GPS Playback Mode** (1x, 2x, 4x speed) with clear telematics labeling.
- CRUD controls: Add vehicle, Edit capacity/driver, Remove vehicle, Report breakdown.

### 3. Professional Coordinator Cockpit
- 7 Analytics KPI cards: Total Requests, Assigned, Unassigned, Active Fleet, Available Seats, Active Disruptions, and Recovery Rate %.
- 9 Dedicated Sections:
  - **Transport Overview:** Seat load gauges, village fulfillment rates, and academic priority triage.
  - **Interactive GIS Map:** Real OSM map with live GPS vehicle positions.
  - **Fleet Registry:** Full vehicle management table with CRUD modals.
  - **Road Corridors:** Corridor status toggles and distance/travel time metrics.
  - **Assignments & Demand:** Confirmed seat assignments and honest unmet rosters.
  - **What-If Simulator:** Isolated sandbox for breakdown/flooding stress tests.
  - **Fairness & Vulnerability Index:** Gini equity scoring and prescriptive recommendations.
  - **Recovery Diff (P1):** Side-by-side impact delta and student rerouting audit.
  - **Solver Trace Logs:** Deterministic step-by-step decision trail.

### 4. Student Portal
- Private student view: Students only see their own requests and assigned vehicle details.
- Book morning transit with academic priority selection (`Examination travel`, `Practical examination travel`, `Regular school travel`).
- Live vehicle assignment card: Confirmed seat number, driver phone, pickup time, and approaching vehicle ETA.
- Disruption alert banners notify students if their scheduled corridor is blocked or bus disabled.

### 5. Emergency Notification Center
- Real-time in-app notification center with unread badge counter.
- Automated alert triggers on road blocks, vehicle cancellations, and re-allocations.
- Notification Adapter pattern with stubs for Twilio SMS and SendGrid Email.

### 6. Enterprise RBAC & Audit Trails
- 3 Distinct Roles: `STUDENT`, `COORDINATOR`, `ADMINISTRATOR`.
- Permission checking: Students cannot modify fleet or view peers' requests.
- Immutable Audit Trail: Every disruption reported, solver executed, or capacity edited is logged with actor, role, action code, and timestamp.

---

## 🗄️ Database Schema & PostGIS Instructions

The complete PostgreSQL + PostGIS schema is located in `server/schema.sql`.

### Setup PostgreSQL with PostGIS:
```bash
# 1. Connect to PostgreSQL
psql -U postgres

# 2. Create database
CREATE DATABASE routeless;
\c routeless

# 3. Execute schema script
\i server/schema.sql
```

Tables created:
- `villages` (Spatial Point geometries for hamlets)
- `institutions` (Spatial Point geometries for schools)
- `transport_connections` (Spatial LineString geometries for road corridors)
- `vehicle_trips` & `trip_stops` (Fleet assets and schedules)
- `users` (RBAC accounts: Student, Coordinator, Administrator)
- `student_requests` (Transport demand)
- `allocations`, `assignments`, & `unmet_demands` (Deterministic solver outputs)
- `audit_logs` & `system_notifications` (Compliance and alert records)

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=3001
VITE_API_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/routeless
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_PHONE=+1234567890
```

*Note: If no database or external SMS credentials are provided, RouteLess runs 100% functionality using resilient browser persistence and the In-App Notification Center.*

---

## 💻 Local Development & Commands

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite (17 tests)
npm test

# 3. Start Vite frontend development server
npm run dev

# 4. Start Express REST API backend server (optional)
npm run server

# 5. Build production bundle
npm run build
```

---

## 🧪 Automated Test Suite (17 Passing Tests)

Run all unit and solver verification tests:

```bash
npm test
```

Test coverage includes:
1. **Determinism:** Identical repeated runs produce identical seat allocations and unmet rosters.
2. **Capacity Enforcement:** Vehicle seat allocation never exceeds capacity under any load.
3. **Vehicle Cancellation:** Cancelled vehicles receive 0 assignments; stranded villages receive honest cancellation explanations.
4. **Route Obstruction:** Blocked segments invalidate affected trip legs; downstream legs remain operational.
5. **Dynamic Capacity Adjustments:** Live editing of vehicle capacity immediately alters allocation outputs.
6. **Shortest Path Routing:** Dijkstra graph search finds optimal passable corridors.
7. **Alternative Detour Evaluation:** Calculates distance delta and alternative corridors when roads are blocked.
8. **ETA Calculation:** Accurately computes arrival times based on speed and remaining distance.
9. **GPS Waypoint Interpolation:** Smooth mathematical interpolation along geographic coordinates.
10. **Alternative Assembly Suggestions:** Proposes nearby walkable junctions when a village is severed.
11. **RBAC Permission Boundaries:** Enforces student, coordinator, and administrator access limits.
12. **Emergency Notifications:** Generates in-app alerts on road closures and vehicle breakdowns.
13. **Immutable Audit Trail:** Verifies action logging with actors and timestamps.
14. **Regional Fairness & Gini Index:** Verifies village-level fulfillment and equity scoring.
15. **What-If Simulation Sandbox:** Guarantees simulations do not mutate baseline operational records.
16. **Demand Surge Simulation:** Accurately evaluates exam day demand spikes.
17. **Vehicle Breakdown Recovery:** Reassigns surviving capacity without creating imaginary seats.

---

## 📄 License

Distributed under the MIT License. Developed for the *ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge*.
