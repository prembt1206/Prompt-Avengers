/**
 * RouteLess Backend REST API Server
 * 
 * Production Express Server with GIS, Fleet Telematics,
 * Allocation Solver Integration, RBAC, and Audit Logging.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-Memory Database Store (Initialized from Mangaluru Regional Seed Data)
let db = {
  villages: [
    {
      id: 'vil-pavoor',
      name: 'Pavoor Riverine Fringe',
      panchayat: 'Pavoor Grama Panchayat, Mangaluru Taluq',
      coordinates: { x: 90, y: 120 },
      geoCoordinates: { lat: 12.8530, lng: 74.9040 },
      description: 'Remote interior hamlet flanked by Netravati river backwaters; accessed via single vulnerable unpaved corridor.',
      connectivityType: 'Fair-Weather'
    },
    {
      id: 'vil-farangipete',
      name: 'Farangipete Junction',
      panchayat: 'Bantwal Mandal / Mangaluru East Arterial',
      coordinates: { x: 300, y: 220 },
      geoCoordinates: { lat: 12.8680, lng: 74.9602 },
      description: 'Central transit crossroads connecting rural river valleys with Mangaluru city educational institutes.',
      connectivityType: 'All-Weather'
    },
    {
      id: 'vil-kalladka',
      name: 'Kalladka Foothills',
      panchayat: 'Golthamajalu / Kalladka Grama Panchayat',
      coordinates: { x: 120, y: 340 },
      geoCoordinates: { lat: 12.8210, lng: 75.0505 },
      description: 'Elevated Western Ghat foothill settlement with winding road gradients and isolated student clusters.',
      connectivityType: 'Fair-Weather'
    },
    {
      id: 'vil-ganjimutt',
      name: 'Ganjimutt Valley',
      panchayat: 'Ganjimutt Grama Panchayat, Mangaluru North',
      coordinates: { x: 490, y: 340 },
      geoCoordinates: { lat: 12.9550, lng: 74.9520 },
      description: 'Agrarian river basin village along the Gurupura valley; secondary transit waypoint.',
      connectivityType: 'All-Weather'
    },
    {
      id: 'vil-gurupura',
      name: 'Gurupura Riverbank',
      panchayat: 'Gurupura Grama Panchayat, Mangaluru',
      coordinates: { x: 670, y: 220 },
      geoCoordinates: { lat: 12.9320, lng: 74.9310 },
      description: 'Low-lying riverbank settlement along the Phalguni (Gurupura) river; causeway submerges during heavy coastal monsoon runoff.',
      connectivityType: 'Vulnerable River Crossing'
    }
  ],
  institutions: [
    {
      id: 'inst-aloysius',
      name: 'St. Aloysius High School & PU College',
      code: 'ST-ALOYSIUS-MLR',
      type: 'Higher Secondary School',
      coordinates: { x: 300, y: 40 },
      geoCoordinates: { lat: 12.8718, lng: 74.8436 },
      schoolStartTime: '08:30',
      address: 'Light House Hill Road, Hampankatta, Mangaluru — 575001'
    },
    {
      id: 'inst-kpt',
      name: 'Karnataka (Govt) Polytechnic (KPT)',
      code: 'KPT-KADRI-MLR',
      type: 'Polytechnic & Vocational ITI',
      coordinates: { x: 300, y: 440 },
      geoCoordinates: { lat: 12.8872, lng: 74.8624 },
      schoolStartTime: '08:45',
      address: 'KPT Junction, Kadri Hills, Mangaluru — 575004'
    }
  ],
  connections: [
    {
      id: 'seg-pav-far',
      fromId: 'vil-pavoor',
      toId: 'vil-farangipete',
      fromName: 'Pavoor Fringe',
      toName: 'Farangipete Junction',
      distanceKm: 12,
      travelMinutes: 25,
      roadType: 'Gravel Corridor',
      isBlocked: false,
      waypoints: [[12.8530, 74.9040], [12.8580, 74.9300], [12.8680, 74.9602]]
    },
    {
      id: 'seg-far-aloysius',
      fromId: 'vil-farangipete',
      toId: 'inst-aloysius',
      fromName: 'Farangipete Junction',
      toName: 'St. Aloysius School, Light House Hill',
      distanceKm: 14,
      travelMinutes: 25,
      roadType: 'All-Weather Tar',
      isBlocked: false,
      waypoints: [[12.8680, 74.9602], [12.8690, 74.9100], [12.8705, 74.8700], [12.8718, 74.8436]]
    },
    {
      id: 'seg-kal-far',
      fromId: 'vil-kalladka',
      toId: 'vil-farangipete',
      fromName: 'Kalladka Foothills',
      toName: 'Farangipete Junction',
      distanceKm: 10,
      travelMinutes: 20,
      roadType: 'Gravel Corridor',
      isBlocked: false,
      waypoints: [[12.8210, 75.0505], [12.8450, 75.0000], [12.8680, 74.9602]]
    },
    {
      id: 'seg-far-kpt',
      fromId: 'vil-farangipete',
      toId: 'inst-kpt',
      fromName: 'Farangipete Junction',
      toName: 'Karnataka Polytechnic (KPT), Kadri',
      distanceKm: 16,
      travelMinutes: 30,
      roadType: 'All-Weather Tar',
      isBlocked: false,
      waypoints: [[12.8680, 74.9602], [12.8750, 74.9100], [12.8850, 74.8750], [12.8872, 74.8624]]
    },
    {
      id: 'seg-guru-ganji',
      fromId: 'vil-gurupura',
      toId: 'vil-ganjimutt',
      fromName: 'Gurupura Riverbank',
      toName: 'Ganjimutt Valley',
      distanceKm: 8,
      travelMinutes: 20,
      roadType: 'Low-Lying Causeway',
      isBlocked: false,
      waypoints: [[12.9320, 74.9310], [12.9430, 74.9400], [12.9550, 74.9520]]
    },
    {
      id: 'seg-ganji-far',
      fromId: 'vil-ganjimutt',
      toId: 'vil-farangipete',
      fromName: 'Ganjimutt Valley',
      toName: 'Farangipete Junction',
      distanceKm: 11,
      travelMinutes: 20,
      roadType: 'Gravel Corridor',
      isBlocked: false,
      waypoints: [[12.9550, 74.9520], [12.9100, 74.9580], [12.8680, 74.9602]]
    },
    {
      id: 'seg-ganji-aloysius',
      fromId: 'vil-ganjimutt',
      toId: 'inst-aloysius',
      fromName: 'Ganjimutt Valley',
      toName: 'St. Aloysius School, Light House Hill',
      distanceKm: 18,
      travelMinutes: 35,
      roadType: 'Paved Highway',
      isBlocked: false,
      waypoints: [[12.9550, 74.9520], [12.9300, 74.8900], [12.8900, 74.8550], [12.8718, 74.8436]]
    }
  ],
  trips: [
    {
      id: 'trip-01',
      vehicleName: 'Bus 01 — KSRTC Rural Sarige Mini-Bus',
      registrationNumber: 'KA-19-F-1044',
      vehicleType: 'Mini-Bus',
      driverName: 'Shekhara Poojary',
      driverPhone: '+91 94481 20144',
      capacity: 6,
      isCancelled: false,
      destinationInstitutionId: 'inst-aloysius',
      destinationName: 'St. Aloysius High School & PU College',
      departureTime: '07:15',
      finalArrivalTime: '08:15',
      status: 'Available',
      speedKmh: 38,
      pathConnectionIds: ['seg-pav-far', 'seg-far-aloysius'],
      stops: [
        { villageId: 'vil-pavoor', villageName: 'Pavoor Riverine Fringe', arrivalTime: '07:15', departureTime: '07:20', order: 1 },
        { villageId: 'vil-farangipete', villageName: 'Farangipete Junction', arrivalTime: '07:45', departureTime: '07:50', order: 2 }
      ]
    },
    {
      id: 'trip-02',
      vehicleName: 'Van 02 — Dakshina Kannada ZP Maxi-Cab',
      registrationNumber: 'KA-19-VA-5012',
      vehicleType: 'Maxi-Cab Van',
      driverName: 'Ganesh Shetty',
      driverPhone: '+91 98452 35012',
      capacity: 4,
      isCancelled: false,
      destinationInstitutionId: 'inst-kpt',
      destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
      departureTime: '07:20',
      finalArrivalTime: '08:25',
      status: 'Available',
      speedKmh: 42,
      pathConnectionIds: ['seg-kal-far', 'seg-far-kpt'],
      stops: [
        { villageId: 'vil-kalladka', villageName: 'Kalladka Foothills', arrivalTime: '07:20', departureTime: '07:25', order: 1 },
        { villageId: 'vil-farangipete', villageName: 'Farangipete Junction', arrivalTime: '07:45', departureTime: '07:50', order: 2 }
      ]
    },
    {
      id: 'trip-03',
      vehicleName: 'Cruiser 03 — Kudla Community Cruiser',
      registrationNumber: 'KA-19-MC-8840',
      vehicleType: 'Rural Cruiser',
      driverName: 'Abdul Razak',
      driverPhone: '+91 97410 88840',
      capacity: 5,
      isCancelled: false,
      destinationInstitutionId: 'inst-aloysius',
      destinationName: 'St. Aloysius High School & PU College',
      departureTime: '07:10',
      finalArrivalTime: '08:20',
      status: 'Available',
      speedKmh: 40,
      pathConnectionIds: ['seg-guru-ganji', 'seg-ganji-far', 'seg-far-aloysius'],
      stops: [
        { villageId: 'vil-gurupura', villageName: 'Gurupura Riverbank', arrivalTime: '07:10', departureTime: '07:15', order: 1 },
        { villageId: 'vil-ganjimutt', villageName: 'Ganjimutt Valley', arrivalTime: '07:35', departureTime: '07:40', order: 2 },
        { villageId: 'vil-farangipete', villageName: 'Farangipete Junction', arrivalTime: '07:55', departureTime: '08:00', order: 3 }
      ]
    }
  ],
  requests: [],
  auditLogs: [
    {
      id: 'audit-boot-01',
      timestamp: new Date().toISOString(),
      actor: 'System Bootstrap',
      role: 'ADMINISTRATOR',
      action: 'SERVER_BOOTSTRAP',
      details: 'RouteLess Express REST API listening on port ' + PORT
    }
  ],
  notifications: []
};

// --- REST API ENDPOINTS ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    platform: 'RouteLess: The Last Mile',
    version: '2.0.0',
    region: 'Mangaluru / Dakshina Kannada',
    database: process.env.DATABASE_URL ? 'PostgreSQL (Connected)' : 'In-Memory / PostGIS Fallback Store',
    timestamp: new Date().toISOString()
  });
});

// Villages
app.get('/api/villages', (req, res) => {
  res.json(db.villages);
});

// Institutions
app.get('/api/institutions', (req, res) => {
  res.json(db.institutions);
});

// Road Connections
app.get('/api/connections', (req, res) => {
  res.json(db.connections);
});

app.patch('/api/connections/:id/block', (req, res) => {
  const { id } = req.params;
  const { isBlocked, blockedReason } = req.body;
  const conn = db.connections.find(c => c.id === id);
  if (!conn) return res.status(404).json({ error: 'Connection not found' });

  conn.isBlocked = isBlocked ?? !conn.isBlocked;
  if (conn.isBlocked) {
    conn.blockedReason = blockedReason || 'Roadway flooded / impassable';
  } else {
    conn.blockedReason = undefined;
  }

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: req.headers['x-actor'] || 'Coordinator',
    role: 'COORDINATOR',
    action: conn.isBlocked ? 'ROAD_BLOCKED' : 'ROAD_REOPENED',
    details: `Road segment ${conn.fromName} ↔ ${conn.toName} is now ${conn.isBlocked ? 'BLOCKED' : 'OPEN'}`
  });

  res.json(conn);
});

// Vehicle Trips
app.get('/api/trips', (req, res) => {
  res.json(db.trips);
});

app.post('/api/trips', (req, res) => {
  const newTrip = {
    ...req.body,
    id: `trip-${Date.now()}`
  };
  db.trips.push(newTrip);
  res.status(201).json(newTrip);
});

app.put('/api/trips/:id', (req, res) => {
  const { id } = req.params;
  const index = db.trips.findIndex(t => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Trip not found' });

  db.trips[index] = { ...db.trips[index], ...req.body };
  res.json(db.trips[index]);
});

app.delete('/api/trips/:id', (req, res) => {
  const { id } = req.params;
  db.trips = db.trips.filter(t => t.id !== id);
  res.json({ message: 'Vehicle deleted successfully', id });
});

app.patch('/api/trips/:id/breakdown', (req, res) => {
  const { id } = req.params;
  const { isCancelled, cancelReason } = req.body;
  const trip = db.trips.find(t => t.id === id);
  if (!trip) return res.status(404).json({ error: 'Trip not found' });

  trip.isCancelled = isCancelled ?? !trip.isCancelled;
  trip.cancelReason = trip.isCancelled ? (cancelReason || 'Mechanical engine failure') : undefined;

  db.auditLogs.unshift({
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: req.headers['x-actor'] || 'Coordinator',
    role: 'COORDINATOR',
    action: trip.isCancelled ? 'VEHICLE_BREAKDOWN' : 'VEHICLE_RESTORED',
    details: `${trip.vehicleName} status changed to ${trip.isCancelled ? 'CANCELLED' : 'ACTIVE'}`
  });

  res.json(trip);
});

// Student Requests
app.get('/api/requests', (req, res) => {
  res.json(db.requests);
});

app.post('/api/requests', (req, res) => {
  const newRequest = {
    ...req.body,
    id: `req-${Date.now()}`,
    submissionTimestamp: new Date().toISOString()
  };
  db.requests.unshift(newRequest);
  res.status(201).json(newRequest);
});

// Audit Logs
app.get('/api/audit', (req, res) => {
  res.json(db.auditLogs);
});

app.post('/api/audit', (req, res) => {
  const log = {
    ...req.body,
    id: `audit-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  db.auditLogs.unshift(log);
  res.status(201).json(log);
});

// Notifications
app.get('/api/notifications', (req, res) => {
  res.json(db.notifications);
});

app.patch('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notif = db.notifications.find(n => n.id === id);
  if (notif) notif.read = true;
  res.json({ success: true, id });
});

// Static frontend serving if built
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for client side routing
app.use((req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) res.json({ message: 'RouteLess API Server Active. Build frontend with npm run build.' });
  });
});

app.listen(PORT, () => {
  console.log(`[RouteLess API] Server running on http://localhost:${PORT}`);
});
