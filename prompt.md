# Prompt Engineering & Execution History Log

This document provides a complete, chronological record of all prompts utilized across tools (Perplexity, Promptcowboy, and Google Antigravity) throughout the design, architecture, build, localization, and crisis recovery phases of the **RouteLess** project for the **ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge**.

---

## Prompt 1
- **Time:** 2026-11-13 10:35 AM IST
- **Tool:** Perplexity
- **Prompt:** "A Perplexity. Now you act as a professional problem solver with 25 years of experience in solving problems and explaining I am a professional prompt engineer. Now explain to me what all steps I should take. Explain to me, step by step, the things to do, and give me a prompt for prompt cowboy, which can create a mega Prompt to build a website using anti-gravity."

---

## Prompt 2
- **Time:** 2026-11-13 10:49 AM IST
- **Tool:** Perplexity
- **Prompt:** "And also inform that I do not require a web-coded-looking website. I want a clean, professional-looking website, so make UI/UX better."

---

## Prompt 3
- **Time:** 2026-11-13 10:53 AM IST
- **Tool:** Perplexity
- **Prompt:** "Now, can you merge both prompts, the building prompt and the website UI/UX prompt, into a single prompt so that I can provide it to prompt cowboy to make an accurate prompt"

---

## Prompt 4
- **Time:** 2026-11-13 11:04 AM IST
- **Tool:** Perplexity
- **Prompt:** "Now give me the whole history of the prompt which I have used, so I can create a file named prompt.md and paste it"

---

## Prompt 5
- **Time:** 2026-11-13 11:05 AM IST
- **Tool:** Perplexity
- **Prompt:** "Not like this. What prompt have I used, at what time have I used it, and which model (meaning which AI model, like Replicate or Gemini) have I used? Give me the details."

---

## Prompt 6
- **Time:** 2026-11-13 11:10 AM IST
- **Tool:** Perplexity
- **Prompt:**
```text
## Prompt 34
- **Time:** 2026-11-07 10:35 AM
- **Tool:** Gemini
- **Prompt:** "now you act as a judge of this hackathon and tell me what all terminal statements I should"

I want it in this format.
```

---

## Prompt 7
- **Time:** 2026-11-13 10:53 AM IST
- **Tool:** Promptcowboy
- **Prompt:**
```text
You are an expert prompt architect. Create one implementation-ready master prompt for Google Antigravity to build a complete, polished web application.

YOUR TASK
Transform the specification below into one coherent, self-contained master prompt that I can paste directly into Antigravity.

Your output must:
- Start with the master prompt.
- End with a concise acceptance checklist.
- Preserve all essential requirements and constraints.
- Remove repetition without removing important details.
- Clearly distinguish essential features from optional enhancements.
- Use direct, actionable instructions.
- Avoid contradictory requirements.
- Avoid expanding the project into a large platform.
- Not include application source code.
- Not merely provide product advice.

Make reasonable assumptions and state them briefly rather than asking unnecessary questions.

The final master prompt should instruct Antigravity to act as a senior full-stack engineer, product designer, and QA engineer working under a strict three-hour deadline.

==================================================
1. CHALLENGE CONTEXT
==================================================

Event:
“ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge.”

Problem:
Rural students depend on limited transportation to reach schools and colleges. Buses may be unavailable, routes disrupted, or demand greater than available capacity.

The solution should demonstrate:
- Practical problem-solving.
- Creativity.
- Effective AI utilization.
- Good prompt engineering and iteration.
- Debugging.
- Adaptability to an unexpected requirement.
- A functional final application.

Total development time:
Three hours, including testing and deployment.

Submission requirements:
- A publicly accessible working application.
- A public GitHub repository containing its source code.

Build a functional prototype, not a landing page or static dashboard.

==================================================
2. PRODUCT DEFINITION
==================================================

Product name:
RouteLess

Tagline:
“When a bus stops, learning should not.”

Product statement:
RouteLess helps rural students request transport and helps a coordinator reassign limited transport resources when a vehicle becomes unavailable or a route is disrupted.

Core demonstration:
1. Students from fictional villages request transport to educational institutions.
2. The coordinator views requests, vehicle trips, and available capacity.
3. The coordinator runs a baseline allocation.
4. A vehicle is cancelled or a route connection is blocked.
5. The coordinator runs recovery allocation.
6. The application shows valid new assignments and clearly identifies students who remain unassigned.

Do not manufacture a successful outcome when capacity is insufficient.

All operating data must be synthetic.

Display a clear but unobtrusive notice:
“Simulation — not a live transport service.”

Do not imply government affiliation, live government data, verified operational readiness, or transport safety certification.

==================================================
3. SCOPE AND PRIORITIES
==================================================

Prioritize a small, complete, reliable application over a broad platform.

P0 — Essential:
- Student transport request flow.
- Coordinator dashboard.
- Seeded fictional data.
- Valid capacity-aware allocation.
- Vehicle cancellation.
- Blocked-route handling.
- Clear assignment and unmet-demand results.
- Honest explanations.
- Reset demo.
- Responsive, coherent interface.
- Successful production build.
- Public deployment.

P1 — After the core flow works:
- Automated allocation tests.
- Baseline versus recovery comparison.
- Persistence checks.
- Prompt and debugging logs.
- Focused UI/UX refinement.
- Demo script.

P2 — Optional:
- Live AI explanation.
- Natural-language disruption parsing.
- Extra visualizations.

Never sacrifice P0 to implement P2.

Exclude:
- Payments.
- Live GPS.
- Real SMS.
- Actual government transport integrations.
- Public driver onboarding.
- Real student personal data.
- Complex authentication.
- Complex multi-tenant infrastructure.
- Unnecessary map services.

==================================================
4. TECHNICAL APPROACH
==================================================

Inspect the workspace before making changes.

If an existing project is present:
- Preserve its working stack where practical.
- Avoid unnecessary rewrites.
- Identify relevant constraints before implementation.

For a new project, prefer:
- React.
- TypeScript.
- Vite.
- Lightweight responsive styling.
- Local application state.
- localStorage for demo persistence.
- A pure TypeScript allocation module.
- A static-host-compatible build for the essential application.

Use a small number of dependable dependencies.
Do not add a large UI framework solely for decoration.

The core application must work without:
- Paid APIs.
- API credentials.
- A database.
- Map services.
- A backend.

Only introduce a secure server-side endpoint if an optional live model integration is implemented after the MVP works.

Document that localStorage:
- Persists data only within the relevant browser.
- Is not shared multiuser storage.
- Is not secure authentication.
- Must not hold real sensitive student information.

Switching between student and coordinator views is a demo feature, not access control.

==================================================
5. SYNTHETIC DATA AND MODEL
==================================================

Create typed models for:
- Village.
- Institution.
- Transport connection or route segment.
- Vehicle trip.
- Student transport request.
- Assignment.
- Disruption.
- Allocation result.

Seed:
- Five fictional villages.
- Two fictional educational institutions.
- Three vehicle trips with deliberately limited capacity.
- A small transport graph with synthetic travel times.
- Enough fictional requests to show successful assignments and unmet demand.

Keep the transport model simple and internally consistent.

Vehicle-trip semantics:
- Each vehicle has at most one active trip in the demo allocation window.
- Each trip has a departure time, destination, and ordered supported stops.
- Each stop-to-stop journey has a defined synthetic travel time.
- Each vehicle has a fixed capacity.
- A student occupies one seat from pickup until the institution destination.
- Do not invent extra trips to increase successful allocations.
- Do not assign a vehicle to incompatible destinations simultaneously.
- Do not add unscheduled detours unless explicitly represented in the model.

A blocked connection makes affected trip paths unavailable unless an alternate path is explicitly represented and implemented.

Seed at least:
1. A scenario where a cancelled vehicle leaves some students with feasible alternatives.
2. A scenario where remaining capacity is genuinely insufficient.

Provide:
- Editable vehicle capacity.
- Vehicle availability controls.
- Block/unblock controls for route connections.
- A deterministic “Reset demo” action.

Use fictional request identifiers instead of real student identities.

==================================================
6. STUDENT EXPERIENCE
==================================================

Create a simple student view focused on one primary action:
“Request a seat.”

Required form fields:
- Village.
- Institution.
- Required arrival deadline.

Required behavior:
- Validate inputs.
- Preserve entered values when validation fails.
- Add the request to application state.
- Update coordinator demand.
- Show a clear submission confirmation.
- Show whether the request is awaiting allocation, assigned, or unassigned.
- When assigned, show vehicle, pickup point, estimated pickup time, and estimated arrival time.
- When unassigned, explain the actual reason in plain language.

Do not show coordinator-only operational controls in this view.

==================================================
7. COORDINATOR EXPERIENCE
==================================================

Provide:
- Total requests.
- Assigned request count.
- Unassigned request count.
- Available capacity with a clear definition.
- Active vehicle count.
- Readable request list.
- Vehicle availability and capacity controls.
- Cancel-vehicle action.
- Block/unblock connection action.
- “Run allocation” or “Update recovery plan” action.
- Baseline and recovery results.
- Clear unresolved-demand section.

Make disruption controls visually distinct from student requests.

Allow the coordinator to:
1. Run a baseline allocation.
2. Save the baseline snapshot.
3. Apply a disruption.
4. Run recovery allocation.
5. Compare the results.

Compare baseline and recovery for the same request set.
If requests change, require a new baseline or clearly mark the comparison as not directly comparable.

==================================================
8. ALLOCATION ENGINE
==================================================

Implement allocation in a separate, testable module.

Use a deterministic greedy heuristic.
Do not claim global optimality.

Hard constraints:
- Never exceed vehicle capacity.
- Never assign an unavailable vehicle.
- Never use a blocked connection.
- Never assign a request twice.
- Match the requested institution.
- Respect the student’s arrival deadline.
- Use only supported pickup stops and explicitly feasible trip paths.
- Reject negative capacity and invalid numeric values.
- Do not create transport resources that do not exist in the data.

Suggested heuristic:
1. Validate inputs.
2. Sort requests by earliest arrival deadline.
3. Break ties by submission order.
4. Find eligible vehicle trips with remaining seats.
5. Select the feasible trip with the earliest arrival.
6. Use a stable tie-breaker when trips are otherwise equal.
7. Leave the request unassigned if no feasible trip exists.
8. Generate a structured result and explanation.

Provide specific unassigned reasons, such as:
- No available vehicle serves this institution.
- All eligible seats are occupied.
- The available trip arrives after the required deadline.
- The route is blocked.
- No supported pickup stop is available.

Handle multiple reasons consistently and document the chosen explanation priority.

Limitations must be visible in the documentation:
- Greedy heuristic, not an optimal solver.
- Synthetic travel times.
- No live traffic.
- No guarantee of real transport availability.
- Not an operational dispatch or safety system.

==================================================
9. METRICS AND STATE CONSISTENCY
==================================================

Display:
- Assigned requests.
- Unassigned requests.
- Active vehicle capacity.
- Seat utilization.
- Change in assigned count from the saved baseline.

Define the denominator used for seat utilization.
Handle zero capacity without division errors.
Explain changed capacity denominators after disruptions.

Do not fabricate efficiency, emissions, cost, or time-saving percentages.

When requests, vehicles, routes, or capacity change:
- Mark existing results as stale or recompute them.
- Do not present invalid previous assignments as current.
- Keep baseline and recovery snapshots separate.
- Ensure repeated allocation with identical inputs produces identical results.

Use clear stale-state copy:
“Transport details changed. Update the plan to see current assignments.”

==================================================
10. AI USE AND TRANSPARENCY
==================================================

Separate development AI from runtime AI.

Development AI:
Antigravity assists with implementation, debugging, testing, and documentation.

Core allocation:
Deterministic code, not a language model.

Required explanation mode:
Result-grounded templates generated from actual allocation data.

Clearly label:
“Template explanation.”

Optional runtime AI:
Only after the full MVP is working, implement either:
- A model-generated summary of computed allocation results.
- Natural-language parsing of a disruption into structured input.

If optional runtime AI is implemented:
- Use a secure server-side endpoint.
- Keep secrets out of client code.
- Use environment variables.
- Provide a safe example environment file.
- Validate structured model output.
- Never allow a model to override transport constraints.
- Require coordinator confirmation before applying a parsed disruption.
- Handle missing credentials, timeouts, and invalid responses.
- Fall back to deterministic templates.
- Show which explanation mode actually produced the result.

If no live model is configured, display:
“Rule-based allocation with template explanations. Live AI explanation is not enabled.”

Never present a template as a live AI response.

==================================================
11. UI/UX DESIGN INTENT
==================================================

The application must look like a clean, professional product.

I do not want:
- A coding exercise.
- A developer demo.
- A wireframe.
- A generic AI-generated dashboard.
- A decorative marketing website with little functionality.

Professional means:
- Clear information hierarchy.
- Thoughtful spacing.
- Readable typography.
- Consistent components.
- Intuitive interaction.
- Trustworthy presentation.

The visual experience should feel calm, accessible, and appropriate for students and transport coordinators.

Do not use visual polish to hide missing functionality.

==================================================
12. VISUAL DESIGN SYSTEM
==================================================

Before implementing screens, define a small reusable design system:
- Color tokens.
- Typography scale.
- Spacing scale.
- Buttons.
- Form controls.
- Cards.
- Tables.
- Status badges.
- Alerts.
- Confirmation dialogs.

Visual direction:
- Light, warm-neutral page background.
- Clean white content surfaces.
- Deep navy primary text.
- Restrained teal primary actions.
- Amber for warnings.
- Red for genuine errors or disruptions.
- Consistent, moderate corner radii.
- Subtle borders.
- Restrained shadows.
- One coherent icon family.
- Readable sans-serif typography with reliable fallbacks.

Use generous but purposeful whitespace.
Maintain consistent alignment.
Make the primary action obvious on each screen.

Avoid:
- Neon colors.
- Excessive gradients.
- Glassmorphism.
- Glowing elements.
- Oversized decorative headings.
- Unnecessary cards.
- Random icons.
- Emoji illustrations.
- Monospace text for normal interface content.
- Raw JSON or debug output.
- Technical IDs where a readable label is appropriate.
- Fake charts.
- Placeholder content.
- Dead buttons.
- Unrelated stock photography.
- Large hero sections that delay access to the application.
- Heavy animation libraries.

Use existing reliable UI primitives when practical.
Do not spend excessive time creating a component framework.

==================================================
13. LAYOUT AND NAVIGATION
==================================================

Use:
- A consistent application header.
- Clear student/coordinator demo navigation.
- Controlled content widths.
- Consistent content alignment.
- A simple page structure.

Student view:
- Welcoming and focused.
- Short form.
- Prominent “Request a seat” action.
- Clear confirmation and status.

Coordinator view:
- Compact operational overview.
- Readable demand and capacity information.
- Grouped disruption controls.
- Clear allocation action.
- Assignment results and unresolved demand.

Prefer a lightweight schematic route diagram or readable route table over a map-service dependency.

Label any displayed geography as illustrative.

Keep the simulation notice visible but unobtrusive.

==================================================
14. RESPONSIVE AND ACCESSIBLE INTERACTIONS
==================================================

Make the application usable on mobile and desktop.

On mobile:
- Prioritize the student request flow.
- Avoid horizontal page overflow.
- Adapt dense tables into readable cards or a clearly labelled scrollable region.
- Ensure controls remain easy to operate.

Provide:
- Proper form labels.
- Visible keyboard focus.
- Semantic controls.
- Readable contrast.
- Status text in addition to color.
- Understandable validation.
- Clear empty states.
- Clear success and error states.
- Reduced-motion support for nonessential animation.

For each important action, show a meaningful visible result:
- Request submitted.
- Vehicle cancelled.
- Inputs changed.
- Results stale.
- Allocation completed.
- Request unassigned.
- Demo reset.

Confirm disruptive changes before applying them.
For reset, provide a clear confirmation explaining that current demo changes will be lost.

Do not add artificial loading delays.
Use loading states only for genuinely asynchronous work.

==================================================
15. MICROCOPY
==================================================

Use concise, natural language.

Prefer:
- “Request a seat.”
- “No seats available.”
- “Bus unavailable.”
- “Update recovery plan.”
- “[Actual count] students still need transport.”
- “Transport details changed. Update the plan to see current assignments.”

Avoid:
- “Execute optimization pipeline.”
- “Invoke allocation engine.”
- “Resource orchestration successful.”

All counts and outcomes must come from current application state.
Do not hardcode success claims.

==================================================
16. RESPONSIBLE PROTOTYPING
==================================================

Use fictional data only.

Do not collect:
- Real student identities.
- Precise home locations.
- Sensitive personal information.

Do not recommend unvetted strangers as transport providers.

Vehicles represent fictional institution-approved resources.

Explain that real deployment would require:
- Institutional oversight.
- Provider verification.
- Appropriate permissions.
- Privacy and security controls.
- Operational safety review.

Do not imply those safeguards are already implemented.

==================================================
17. IMPLEMENTATION WORKFLOW
==================================================

Instruct Antigravity to:

1. Inspect the workspace and available tooling.
2. State reasonable assumptions.
3. Produce a concise implementation plan and acceptance checklist.
4. Begin implementation unless a genuine blocker requires clarification.
5. Define lightweight design tokens.
6. Build a complete vertical slice:
   request → dashboard → allocation → result.
7. Implement allocation as a separate module.
8. Add disruption controls and state invalidation.
9. Add baseline/recovery comparison.
10. Run the application.
11. Fix observed errors.
12. Produce an early production build.
13. Prepare and verify deployment.
14. Perform one focused UI/UX refinement pass.
15. Add optional features only if essential requirements are complete.

Use implementation plans, code diffs, screenshots, and browser testing when supported by the installed environment.

If browser tooling is unavailable:
- State what could not be verified.
- Provide a precise manual test checklist.
- Do not claim visual or interaction verification occurred.

Avoid unnecessary clarification loops.
Do not ask me to choose every color, component, or implementation detail.

==================================================
18. TESTING AND QUALITY CONTROL
==================================================

Automated allocation tests:
- Normal allocation.
- Demand exceeding capacity.
- Cancelled vehicle.
- Blocked connection.
- Impossible arrival deadline.
- Institution mismatch.
- Unsupported pickup stop.
- Empty demand.
- Invalid or negative capacity.
- Zero available capacity.
- No duplicate assignments.
- Capacity never exceeded.
- Deterministic repeated execution.

UI workflow verification:
- Submit a request.
- Confirm demand updates.
- Run baseline allocation.
- Cancel a vehicle.
- Run recovery allocation.
- Inspect assignments.
- Inspect genuine unmet-demand reasons.
- Change capacity.
- Confirm stale results are handled.
- Reset the demo.
- Reload and verify intended persistence.
- Check a narrow mobile viewport.
- Open the public deployment directly.

Visual review:
- Alignment.
- Spacing.
- Typography hierarchy.
- Contrast.
- Text wrapping.
- Button consistency.
- Form clarity.
- Table overflow.
- Empty and error states.
- Keyboard focus.
- Mobile usability.

Fix functionality and constraint violations before decorative issues.

Report only tests and checks actually performed.

==================================================
19. SURPRISE-CHALLENGE READINESS
==================================================

Keep scenario data and allocation rules separate from UI components.

Make it straightforward to demonstrate:
- A second vehicle cancellation.
- Reduced remaining capacity.
- A blocked connection.
- An earlier arrival deadline.
- Increased student demand.

Use existing controls where possible.
Do not overengineer a generic rules platform.

After a changed requirement:
- Preserve hard constraints.
- Invalidate or recalculate results.
- Show unmet demand honestly.
- Re-run relevant tests.

==================================================
20. DOCUMENTATION AND EVIDENCE
==================================================

Create:
- README.md.
- docs/prompt-log.md.
- docs/debug-log.md.
- docs/demo-script.md.
- A short final verification report.

README:
- Product purpose.
- Setup instructions.
- Run, build, and test commands.
- Architecture.
- Allocation heuristic.
- Synthetic-data notice.
- AI usage and fallback behavior.
- localStorage limitations.
- Deployment instructions.
- Known limitations.

Prompt log:
Record actual prompts, revisions, reasons, and observed outcomes.
Do not invent prompt iterations.

Debug log:
Record observed failures, fixes, and verification results.
Do not invent bugs or successful checks.

Demo script:
A 90-second presentation covering:
1. Rural transport disruption.
2. Student request.
3. Baseline allocation.
4. Vehicle cancellation.
5. Recovery allocation.
6. Remaining unmet demand.
7. Honest AI usage.
8. One real development iteration.
9. Prototype limitations.

==================================================
21. DEPLOYMENT AND EXTERNAL ACTIONS
==================================================

Produce a successful production build before claiming readiness.

Keep the essential client-only application compatible with static hosting.

Use deployment instructions appropriate to the actual selected host.
If optional server-side AI is implemented, verify host compatibility separately.

Never claim:
- The application is deployed.
- A public URL exists.
- A repository was pushed.
- Tests passed.
- Browser verification succeeded.

Unless those actions actually occurred and were verified.

Do not invent deployment URLs or repository links.

Request approval before publishing, pushing, or modifying external resources.

If credentials, permissions, or manual account actions are required:
- State the exact blocker.
- Provide the exact remaining action.
- Keep the rest of the application ready.

Never commit or expose secrets.

==================================================
22. TIME MANAGEMENT
==================================================

Suggested three-hour allocation:
- 0–15 minutes: scope, assumptions, data, and design direction.
- 15–25 minutes: implementation plan and project setup.
- 25–65 minutes: complete core vertical slice.
- 65–95 minutes: disruption handling and allocation correctness.
- 95–115 minutes: first production build and deployment.
- 115–145 minutes: testing, bug fixes, and focused UI refinement.
- 145–165 minutes: surprise-change rehearsal and documentation.
- 165–180 minutes: freeze features and verify submission links.

Adapt this schedule to actual progress.
Protect deployment and testing time.
Do not add optional features late in the build.

==================================================
23. FINAL ACCEPTANCE STANDARD
==================================================

The finished application must:
- Be a working application, not a static mockup.
- Look coherent, clean, and professionally designed.
- Make the next action obvious.
- Support the main journey without a spoken walkthrough.
- Respect all hard transport constraints.
- Show actual application state.
- Handle insufficient capacity honestly.
- Distinguish current results from stale results.
- Work on mobile and desktop.
- Clearly label synthetic data and simulation status.
- Describe AI use accurately.
- Build successfully.
- Be ready for a publicly accessible deployment and public source submission.

==================================================
24. REQUIRED FINAL REPORT FROM ANTIGRAVITY
==================================================

Ask Antigravity to finish with:
1. What was implemented.
2. What was actually tested.
3. Actual build and test results.
4. Actual deployment status.
5. Genuine public links only if created and verified.
6. Known limitations.
7. Exact remaining submission steps.

FINAL INSTRUCTION TO PROMPT COWBOY
Now generate the single master prompt for Antigravity.

Preserve the functional requirements, polished UI/UX direction, honest AI
labeling, testing requirements, and deployment constraints.

Organize it for efficient execution rather than verbosity.
Keep the project achievable within three hours.
Do not add features beyond this specification.
```

---

## Prompt 8
- **Time:** 2026-11-13 10:56 AM IST
- **Tool:** Google Antigravity (Model: Gemini 3.8 Flash High)
- **Prompt:**
```text
You are a senior full-stack engineer, product designer, and QA engineer working under a strict three-hour deadline. Build and deploy a complete, working prototype of **RouteLess** for the "ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge." Deliver a publicly accessible working application and a public GitHub repository containing its source code. This must be a functional prototype, not a landing page or static dashboard.

**Product statement:** RouteLess helps rural students request transport and helps a coordinator reassign limited transport resources when a vehicle becomes unavailable or a route is disrupted. Tagline: "When a bus stops, learning should not."

**Core demonstration flow (must work end to end):**
1. Students from fictional villages submit transport requests to educational institutions.
2. The coordinator views requests, vehicle trips, and available capacity.
3. The coordinator runs a baseline allocation.
4. The coordinator cancels a vehicle or blocks a route connection.
5. The coordinator runs a recovery allocation.
6. The application shows valid new assignments and clearly identifies students who remain unassigned.

Do not manufacture a successful outcome when capacity is insufficient. Show honest explanations for every unmet request.

**Assumptions (state these briefly in the README; do not ask questions):** the app is a single-user demo; the coordinator and student views are switched by a demo toggle, not authenticated access; all data is synthetic.

**Scope priorities**

P0 (essential; never sacrifice these for P2 work):
- Student transport request flow.
- Coordinator dashboard.
- Seeded fictional data.
- Valid, capacity-aware allocation.
- Vehicle cancellation.
- Blocked-route handling.
- Clear assignment and unmet-demand results with honest explanations.
- Reset demo.
- Editable vehicle capacity and vehicle availability controls.
- Responsive, coherent interface.
- Successful production build.
- Public deployment.

P1 (only after P0 works):
- Automated allocation tests.
- Baseline versus recovery comparison.
- Persistence checks.
- Prompt and debugging logs.
- Focused UI/UX refinement.
- Demo script.

P2 (optional, only if time remains):
- Live AI explanation.
- Natural-language disruption parsing.
- Extra visualizations.

Exclude entirely: payments, live GPS, real SMS, government transport integrations, driver onboarding, real student personal data, complex authentication, multi-tenant infrastructure, and map services.

**Technical approach**

Inspect the workspace first. If an existing project is present, preserve its working stack and avoid unnecessary rewrites. For a new project, use React, TypeScript, and Vite with lightweight responsive styling, local application state, and localStorage for demo persistence. Put allocation logic in a pure TypeScript module with no UI dependencies. Use a small number of dependable dependencies and no large UI framework. The app must build as a static site and must work with no paid APIs, credentials, database, map service, or backend. Do not introduce a server unless an optional live AI feature is implemented after the MVP works, and then only as a secure server-side endpoint.

Document in the README that localStorage persists data only within the current browser, is not shared multiuser storage, is not secure authentication, and must not hold real sensitive student information. State that the student/coordinator toggle is a demo feature, not access control.

Display an unobtrusive notice on every screen: "Simulation — not a live transport service." Do not imply government affiliation, live government data, verified operational readiness, or transport safety certification.

**Synthetic data and domain model**

Create typed models for: Village, Institution, transport connection (route segment with synthetic travel time), vehicle trip, student transport request, assignment, disruption, and allocation result.

Seed:
- Five fictional villages.
- Two fictional educational institutions.
- Three vehicle trips with deliberately limited capacity.
- A small, internally consistent transport graph with synthetic travel times.
- Enough fictional requests to show both successful assignments and unmet demand.
- One scenario where a cancelled vehicle leaves some students with feasible alternatives.
- One scenario where remaining capacity is genuinely insufficient.

Vehicle-trip rules:
- Each vehicle has at most one active trip in the demo allocation window.
- Each trip has a departure time, destination, and ordered supported stops.
- Each stop-to-stop journey has a defined synthetic travel time.
- Each vehicle has a fixed, editable capacity.
- A student occupies one seat from pickup until the institution destination.
- Never invent extra trips to increase successful allocations.
- Never assign a vehicle to incompatible destinations at the same time.
- Do not add unscheduled detours unless the model explicitly represents them.
- A blocked connection makes affected trip paths unavailable unless an alternate path is explicitly modeled and implemented.

**Allocation requirements**

The allocation module must never exceed vehicle capacity, never assign a student to a trip that cannot reach their institution in time, never assign a cancelled vehicle, and never use a blocked connection. Students who cannot be served must be listed as unmet with a specific, true reason (for example: "no remaining seat on trips reaching X before start time," "only feasible trip was cancelled," "route segment A–B blocked"). Make allocation deterministic so repeated runs produce identical results.

**Acceptance checklist (verify before submitting)**
- Public URL loads and the core flow in steps 1–6 completes without errors.
- Baseline allocation and recovery allocation both run and display results.
- No assignment violates capacity, cancellation, blocked routes, or timing.
- Unmet students are shown with accurate reasons; no outcome is fabricated.
- Editable capacity and vehicle availability controls change allocation results.
- Reset demo restores the seeded state.
- Simulation notice is visible; no prohibited claims appear.
- Production build succeeds and the app is responsive on mobile and desktop widths.
- GitHub repository is public, contains source code, and has a README covering setup, assumptions, localStorage limits, and the demo script.
- Application source code is authored by the build, not pasted from this prompt.
```

---

## Prompt 9
- **Time:** 2026-11-13 11:13 AM IST
- **Tool:** Google Antigravity (Model: Gemini 3.8 Flash High)
- **Prompt:** "This is my GitHub repository. Push all the code to this repository."

---

## Prompt 10
- **Time:** 2026-11-13 11:22 AM IST
- **Tool:** Google Antigravity (Model: Gemini 3.8 Flash High)
- **Prompt:** "Can you give the location near Mangalore? Use Mangalore's location and update the details in there. And use Mangalore College and School name."

---

## Prompt 11
- **Time:** 2026-11-13 12:15 PM IST
- **Tool:** Google Antigravity (Model: Gemini 3.8 Flash High)
- **Prompt:**
```text
Act as a senior full-stack engineer, transport-allocation problem solver,
product designer, and QA engineer.

Modify my existing RouteLess application in place.

Do not rebuild it from scratch.
Inspect the current codebase, identify the actual stack, and preserve working
functionality.

We have a strict 100-minute implementation window.

Your priorities are:
1. Correct surprise-crisis behavior.
2. A working end-to-end demonstration.
3. An attractive, polished, animated interface.
4. Testing and production-build verification.

Do not sacrifice transport correctness for decorative effects.

==================================================
1. OFFICIAL SURPRISE HURDLE
==================================================

Title: THE EXAM DAY CRISIS

The rural transport network experiences all of these simultaneously:
- Two government buses become unavailable due to technical issues.
- Student transport demand increases by 40%.
- Flooding blocks a major road connecting two villages.
- Several students have examinations within the next two hours.

Adapt the existing application to:
- Reallocate available buses.
- Suggest feasible alternative routes.
- Prioritize students appearing for examinations.
- Use remaining transportation resources efficiently.
- Minimize students who cannot arrive at their institutions on time.

Do not invent successful assignments or ignore unmet demand.

All transport data remains synthetic.
Keep a visible “Simulation — not a live transport service” notice.

==================================================
2. INSPECT BEFORE EDITING
==================================================

First inspect:
- Existing application structure.
- Student/request data.
- Vehicle data.
- Route representation.
- Current allocation logic.
- Persistence.
- Styling and animation libraries.
- Available tests.
- Build and deployment configuration.

Produce a short implementation plan and begin immediately.

Preserve the existing stack and working flows.
Reuse installed components and animation utilities.
Do not introduce a large dependency or external service unless essential.

If implementation differs from the earlier proposed architecture, adapt to
the actual code rather than forcing a rewrite.

==================================================
3. CRISIS SCENARIO CONTROL
==================================================

Add an obvious coordinator action:
“Activate Exam Day Crisis”

Use an atomic, repeatable scenario transformation.

On activation:
1. Save an immutable pre-crisis snapshot.
2. Disable two existing government buses.
3. Increase the original request count by 40%.
4. Block one actual road connection between two villages.
5. Give a documented subset of requests exam deadlines within two hours.
6. Mark existing allocation results as stale.
7. Display a concise summary of the changes.
8. Offer “Generate Recovery Plan.”

Use:
additionalRequests = ceil(originalRequestCount * 0.40)

Show:
- Original demand.
- Added demand.
- New total.
- Actual percentage increase if rounding prevents exactly 40%.

Where practical, use a default fixture whose request count is divisible by
five, so the default demonstration has an exact 40% increase.

Generate synthetic new requests deterministically.
Use stable identifiers.
Do not duplicate requests if the activation button is pressed again.
Persist the scenario activation state consistently.

Add:
- A confirmation before activation.
- “Reset to Normal Scenario.”
- A documented fixed simulation time.
- A visible indicator that the displayed clock is simulated.

Do not depend on the real wall clock for the demo.

Inspect the current vehicle fixture:
- If it already has two suitable government buses, use them.
- If it does not, make the smallest clearly documented synthetic-fixture
  adjustment needed to demonstrate the official crisis.
- Do not invent extra available vehicles after activation to manufacture
  a successful recovery.

Ensure the default fixture demonstrates:
- At least one feasible alternative-route recovery.
- A genuine capacity or timing limitation.
- A meaningful difference between pre-recovery and post-recovery results.

==================================================
4. EXAM INFORMATION AND DEADLINES
==================================================

Extend requests minimally with:
- isExamStudent.
- examStartTime, when applicable.
- requiredArrivalTime.
- submissionOrder.
- Relevant existing pickup and institution information.

Clearly distinguish:
- Exam start.
- Required arrival deadline.
- Estimated arrival.

If using an arrival buffer before an examination:
- Make it explicit and configurable.
- Use it consistently.
- Do not silently introduce it.

Define “within two hours” relative to the fixed simulation clock.

In the student form, add:
“Do you have an examination today?”

If selected, show an exam-time field and validate it.

For seeded crisis requests, state how many exam students were created and
how their deadlines were selected.

==================================================
5. REAL ROUTE BLOCKAGE AND ALTERNATIVE PATHS
==================================================

The flooded road must affect allocation logic, not only the interface.

Represent the relevant transport network with:
- Nodes.
- Connections.
- Positive synthetic travel times.
- A blocked/available state.

Respect directionality if connections are directed.

If the existing application already supports route search, extend it.

Otherwise, implement a lightweight shortest-path method over the small
synthetic graph, such as Dijkstra.

Exclude blocked connections from route search.

A recovery route is valid only if:
- Every connection exists.
- No connection is blocked.
- The vehicle can serve the pickup.
- The vehicle reaches the requested institution.
- The trip respects capacity and schedule constraints.

Show:
- Blocked connection.
- Selected alternative path.
- Estimated travel time.
- Added travel time compared with the unblocked path, when comparable.

If no path exists, say:
“No accessible route is available.”

Do not draw an alternative route that is not used by the actual allocation
calculation.

Avoid paid maps, geocoding, live traffic, or map API dependencies.

A labelled schematic network diagram is sufficient.

==================================================
6. RECOVERY ALLOCATION
==================================================

Keep allocation deterministic and separate from UI components.

Honor these hard constraints:
- No unavailable vehicle.
- No blocked connection.
- No capacity overflow.
- No duplicate assignment.
- Correct institution.
- Supported pickup.
- Feasible pickup and arrival times.
- No incompatible simultaneous vehicle trips.

Prioritize:
1. Exam students with imminent deadlines.
2. Earlier required arrival deadlines within that group.
3. Remaining students by required arrival deadline.
4. Stable submission order as a final request tie-breaker.

For each request:
- Evaluate feasible vehicle/trip options.
- Compute arrival using the actual allowed path.
- Select a feasible on-time option with a documented deterministic rule.
- Preserve scarce capacity sensibly where practical.
- Leave the request unassigned when no valid option exists.

Do not describe a greedy algorithm as globally optimal.

If a small bounded improvement pass is practical within the time limit,
try deterministic reassignment/swaps that improve the result according to:

1. More exam students arriving on time.
2. Then more total students arriving on time.
3. Then lower travel time as a tie-breaker.

Do not introduce a complex optimization service.

Keep the current trip model unless a small extension is necessary.
Do not silently create repeated trips or reuse a vehicle at overlapping times.

Distinguish:
- Assigned and on time.
- Unassigned.
- A late alternative, if shown.

Late alternatives must be labelled as late and must not count as successful
on-time assignments.

Explain real failure reasons:
- Insufficient seats.
- No accessible route.
- No available compatible vehicle.
- Cannot reach the institution before the deadline.
- Unsupported pickup or destination.

==================================================
7. HONEST BEFORE/AFTER COMPARISON
==================================================

Keep three distinct states:

A. Normal baseline:
Original requests and original available transport.

B. Crisis before recovery:
Crisis demand and resources, with surviving original assignments revalidated.
Remove invalid assignments.
Treat new requests as not yet assigned.
Do not silently run recovery in this state.

C. Crisis after recovery:
The computed recovery plan for exactly the same crisis requests and resources.

Use B versus C for recovery-improvement metrics.

Show:
- Total crisis requests.
- Total exam requests.
- Exam students on time.
- Total students on time.
- Unassigned students.
- Late alternatives, if any.
- Active vehicles.
- Assigned seats and active capacity.
- Recovery improvement in on-time count.

Define every denominator.
Handle zero capacity safely.
Do not invent savings, efficiency percentages, or success rates.

When inputs change:
- Recompute or clearly mark results stale.
- Never show obsolete assignments as current.

==================================================
8. MAIN CRISIS INTERFACE
==================================================

Create a prominent but controlled “Exam Day Crisis” section.

Include:
- Two buses unavailable.
- Demand increase.
- Flooded road.
- Exam deadline window.
- Scenario status.
- “Generate Recovery Plan.”
- “Reset to Normal Scenario.”

Keep the student view simple.
Keep operational crisis controls in the coordinator view.

After recovery, show:
- A concise outcome summary.
- Route changes.
- Student assignments.
- Students still at risk.
- Plain-language reasons.
- A clear next action.

Use actual computed values, not hardcoded claims.

==================================================
9. VISUAL REDESIGN
==================================================

The existing website feels too plain and white.

Make it attractive and professional without turning it into a flashy
marketing page.

Visual direction:
- Deep navy or dark teal application header.
- Soft tinted page backgrounds rather than an entirely white canvas.
- White or lightly tinted readable content surfaces.
- Teal primary actions.
- Amber exam and urgency accents.
- Red for actual disruptions and failures.
- Consistent typography, spacing, borders, and corner radii.
- Subtle depth and restrained background gradients.

Maintain readable contrast.
Use color deliberately, not randomly.

Avoid:
- Neon effects.
- Excessive glassmorphism.
- Large empty hero sections.
- Too many competing colors.
- Dense collections of decorative cards.
- Fake charts.
- Unrelated stock images.
- A complete component-system rewrite.

Preserve a clear primary action on each screen.

==================================================
10. ANIMATED ILLUSTRATIONS AND ROUTE VISUALIZATION
==================================================

Create lightweight local SVG illustrations or use suitable existing local
assets.

Suggested visuals:
- A rural village and school illustration.
- A bus travelling along a schematic route.
- A visibly closed or flooded connection.
- A highlighted alternative route.
- A student pickup marker.

Prefer an informative route visualization over unrelated decorative imagery.

Animation behavior:
- Move a bus marker along the currently selected computed path.
- Stop or remove the marker if that trip becomes unavailable.
- Highlight the actual flooded connection.
- Reveal the actual recovery path after allocation.
- Update visuals when the scenario changes.

Label movement as illustrative, not live vehicle tracking.

If realistic path animation is too expensive to implement:
- Use a static accurate diagram.
- Animate only the route highlight or state transition.

Never animate a route that contradicts application data.
Do not download unverified remote assets or depend on external image hosting.

Decorative SVGs should be hidden from assistive technology.
Meaningful route information needs an equivalent text description.

==================================================
11. TRANSITIONS AND MICROINTERACTIONS
==================================================

Use restrained motion:
- Short screen and panel transitions.
- Subtle card entrance effects.
- Clear button hover and pressed states.
- Smooth expansion of route details.
- Assignment-change highlights.
- Brief metric transitions when values actually change.
- Toasts or inline feedback for completed actions.

Use approximately 150–300 ms transitions for ordinary UI interactions.

Do not:
- Add artificial waiting time.
- Animate every element continuously.
- Make large parts of the interface float.
- Use flashing or aggressive warning pulses.
- Delay access to important results.

Respect prefers-reduced-motion.
When reduced motion is enabled, preserve all information with minimal or
no animation.

Announce final meaningful result changes accessibly rather than announcing
every intermediate animated number.

==================================================
12. FLOATING ACTIONS
==================================================

Add a contextual floating primary action only where it improves usability.

Examples:
- Student: “Request a seat.”
- Coordinator: “Recovery plan,” when a crisis is active or results are stale.

Requirements:
- Do not duplicate actions unnecessarily.
- Do not cover forms, table controls, status messages, or mobile navigation.
- Respect mobile safe areas.
- Provide an accessible label and keyboard focus.
- Hide or reposition it when a dialog is open.
- Keep the action connected to real functionality.

A floating “View demo guide” action is acceptable only if a real concise
guide is implemented.

Do not add a fake chatbot or nonfunctional support widget.

==================================================
13. RESPONSIVE UX AND ACCESSIBILITY
==================================================

Verify desktop and narrow mobile layouts.

Required:
- No horizontal page overflow.
- Readable tables or adapted mobile cards.
- Labelled inputs.
- Keyboard-operable controls.
- Visible focus.
- Text labels alongside status colors.
- Clear empty, success, error, and stale-result states.
- Form values preserved after validation failure.
- Confirmation before resetting or activating disruptive changes.
- No motion-dependent understanding.

Keep the normal workflow understandable without a spoken explanation.

==================================================
14. AI TRANSPARENCY
==================================================

Keep the working deterministic allocation independent of a model API.

Explain assignments using actual computed results.

If explanations are templates, label them honestly.

Preserve any existing working optional AI integration, but do not introduce
one now if it threatens the deadline.

Never claim:
- A globally optimal plan.
- Live transport data.
- Live GPS.
- Operational safety validation.
- Model-generated output when a template was used.

Do not expose credentials.

==================================================
15. TESTS
==================================================

Add or update focused tests for:
- Exactly two designated buses disabled.
- Demand increases by the documented 40% rounding rule.
- Repeated activation does not duplicate requests.
- Flooded connection excluded from all allocated paths.
- Alternative path used when feasible.
- Disconnected route produces an honest failure.
- Exam priority applied to feasible competing requests.
- Impossible exam deadlines remain unsuccessful.
- No capacity overflow.
- No duplicate assignments.
- No overlapping incompatible vehicle use.
- Zero available transport.
- Deterministic allocation.
- Reset restores the normal fixture.
- Stale-state handling after changes.
- Honest before/after metric calculation.

Run available tests and the production build.

Use browser tools if available to verify:
1. Normal scenario.
2. Crisis activation.
3. All four crisis changes.
4. Recovery generation.
5. Alternative-route display.
6. Exam-priority results.
7. Unmet-demand explanations.
8. Reset.
9. Mobile layout.
10. Reduced-motion behavior.

Report only checks actually performed.

==================================================
16. TIME BUDGET
==================================================

Suggested allocation:
- 0–10 minutes: inspect and plan.
- 10–40 minutes: scenario transformation, routes, and allocation.
- 40–60 minutes: crisis UI, metrics, and explanations.
- 60–80 minutes: focused visual redesign and lightweight animation.
- 80–95 minutes: tests, bug fixes, and production build.
- 95–100 minutes: deployment verification and demo preparation.

If time runs short:
- Preserve correct crisis behavior.
- Keep the route diagram static if needed.
- Remove decorative enhancements before removing validation or tests.
- Stop adding features.

==================================================
17. DOCUMENTATION AND DELIVERY
==================================================

Update existing documentation with:
- Surprise-hurdle requirements.
- Scenario assumptions.
- Exam-priority policy.
- Route-search behavior.
- Demand-rounding rule.
- Fixed simulation clock.
- Remaining limitations.
- Actual tests and results.

Record actual prompts and debugging steps.
Do not fabricate history.

Prepare a concise demonstration:
1. Show the normal scenario.
2. Activate the crisis.
3. Show the two disabled buses, demand surge, flood, and exams.
4. Generate recovery.
5. Show an actual alternative route.
6. Show exam-priority assignments.
7. Explain remaining unmet demand.
8. Reset if needed.

If an existing deployment workflow is available, prepare the updated build.
Request approval before publishing, pushing, or changing external resources.

Do not invent public links or claim deployment without verification.

FINAL REPORT
Return:
- Changes implemented.
- Files or modules changed.
- Allocation and routing approach.
- Actual tests and production-build results.
- UI/UX improvements.
- Deployment status.
- Known limitations.
- Exact remaining actions.

Begin by inspecting the existing project, then implement the smallest
complete solution that satisfies the official crisis scenario.
```

---

## Prompt 12
- **Time:** 2026-11-13 12:52 PM IST
- **Tool:** Google Antigravity (Model: Gemini 3.8 Flash High)
- **Prompt:** "Now create a prompt.md file. I have given you a text in which I have saved every prompt which I use outside Antigravity. Also add the details of which prompt I have used in Antigravity, and create a prompt.md file."
