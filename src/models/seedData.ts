import { Village, Institution, TransportConnection, VehicleTrip, StudentRequest } from '../types';

export const SEEDED_VILLAGES: Village[] = [
  {
    id: 'vil-pavoor',
    name: 'Pavoor Riverine Fringe',
    panchayat: 'Pavoor Grama Panchayat, Mangaluru Taluq',
    coordinates: { x: 90, y: 120 },
    description: 'Remote interior hamlet flanked by Netravati river backwaters; accessed via single vulnerable unpaved corridor.',
    connectivityType: 'Fair-Weather'
  },
  {
    id: 'vil-farangipete',
    name: 'Farangipete Junction',
    panchayat: 'Bantwal Mandal / Mangaluru East Arterial',
    coordinates: { x: 300, y: 220 },
    description: 'Central transit crossroads connecting rural river valleys with Mangaluru city educational institutes.',
    connectivityType: 'All-Weather'
  },
  {
    id: 'vil-kalladka',
    name: 'Kalladka Foothills',
    panchayat: 'Golthamajalu / Kalladka Grama Panchayat',
    coordinates: { x: 120, y: 340 },
    description: 'Elevated Western Ghat foothill settlement with winding road gradients and isolated student clusters.',
    connectivityType: 'Fair-Weather'
  },
  {
    id: 'vil-ganjimutt',
    name: 'Ganjimutt Valley',
    panchayat: 'Ganjimutt Grama Panchayat, Mangaluru North',
    coordinates: { x: 490, y: 340 },
    description: 'Agrarian river basin village along the Gurupura valley; secondary transit waypoint.',
    connectivityType: 'All-Weather'
  },
  {
    id: 'vil-gurupura',
    name: 'Gurupura Riverbank',
    panchayat: 'Gurupura Grama Panchayat, Mangaluru',
    coordinates: { x: 670, y: 220 },
    description: 'Low-lying riverbank settlement along the Phalguni (Gurupura) river; causeway submerges during heavy coastal monsoon runoff.',
    connectivityType: 'Vulnerable River Crossing'
  }
];

export const SEEDED_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-aloysius',
    name: 'St. Aloysius High School & PU College',
    code: 'ST-ALOYSIUS-MLR',
    type: 'Higher Secondary School',
    coordinates: { x: 300, y: 40 },
    schoolStartTime: '08:30',
    address: 'Light House Hill Road, Hampankatta, Mangaluru — 575001'
  },
  {
    id: 'inst-kpt',
    name: 'Karnataka (Govt) Polytechnic (KPT)',
    code: 'KPT-KADRI-MLR',
    type: 'Polytechnic & Vocational ITI',
    coordinates: { x: 300, y: 440 },
    schoolStartTime: '08:45',
    address: 'KPT Junction, Kadri Hills, Mangaluru — 575004'
  }
];

export const SEEDED_CONNECTIONS: TransportConnection[] = [
  {
    id: 'seg-pav-far',
    fromId: 'vil-pavoor',
    toId: 'vil-farangipete',
    fromName: 'Pavoor Fringe',
    toName: 'Farangipete Junction',
    distanceKm: 12,
    travelMinutes: 25,
    roadType: 'Gravel Corridor',
    isBlocked: false
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
    isBlocked: false
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
    isBlocked: false
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
    isBlocked: false
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
    blockedReason: undefined
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
    isBlocked: false
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
    isBlocked: false
  }
];

export const SEEDED_VEHICLE_TRIPS: VehicleTrip[] = [
  {
    id: 'trip-01',
    vehicleName: 'Bus 01 — KSRTC Rural Sarige Mini-Bus',
    registrationNumber: 'KA-19-F-1044',
    vehicleType: 'Mini-Bus',
    driverName: 'Shekhara Poojary',
    capacity: 6, // Deliberately limited capacity
    isCancelled: false,
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    departureTime: '07:15',
    finalArrivalTime: '08:15',
    stops: [
      {
        villageId: 'vil-pavoor',
        villageName: 'Pavoor Riverine Fringe',
        arrivalTime: '07:15',
        departureTime: '07:20',
        order: 1
      },
      {
        villageId: 'vil-farangipete',
        villageName: 'Farangipete Junction',
        arrivalTime: '07:45',
        departureTime: '07:50',
        order: 2
      }
    ],
    pathConnectionIds: ['seg-pav-far', 'seg-far-aloysius']
  },
  {
    id: 'trip-02',
    vehicleName: 'Van 02 — Dakshina Kannada ZP Maxi-Cab',
    registrationNumber: 'KA-19-VA-5012',
    vehicleType: 'Maxi-Cab Van',
    driverName: 'Ganesh Shetty',
    capacity: 4, // Deliberately limited capacity
    isCancelled: false,
    destinationInstitutionId: 'inst-kpt',
    destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
    departureTime: '07:20',
    finalArrivalTime: '08:25',
    stops: [
      {
        villageId: 'vil-kalladka',
        villageName: 'Kalladka Foothills',
        arrivalTime: '07:20',
        departureTime: '07:25',
        order: 1
      },
      {
        villageId: 'vil-farangipete',
        villageName: 'Farangipete Junction',
        arrivalTime: '07:50',
        departureTime: '07:55',
        order: 2
      }
    ],
    pathConnectionIds: ['seg-kal-far', 'seg-far-kpt']
  },
  {
    id: 'trip-03',
    vehicleName: 'Cruiser 03 — Kudla Community Rural Cruiser',
    registrationNumber: 'KA-19-CR-8821',
    vehicleType: 'Rural Cruiser',
    driverName: 'Anand D’Souza',
    capacity: 5, // Deliberately limited capacity
    isCancelled: false,
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    departureTime: '07:10',
    finalArrivalTime: '08:20',
    stops: [
      {
        villageId: 'vil-gurupura',
        villageName: 'Gurupura Riverbank',
        arrivalTime: '07:10',
        departureTime: '07:15',
        order: 1
      },
      {
        villageId: 'vil-ganjimutt',
        villageName: 'Ganjimutt Valley',
        arrivalTime: '07:35',
        departureTime: '07:40',
        order: 2
      },
      {
        villageId: 'vil-farangipete',
        villageName: 'Farangipete Junction',
        arrivalTime: '07:55',
        departureTime: '08:00',
        order: 3
      }
    ],
    pathConnectionIds: ['seg-guru-ganji', 'seg-ganji-far', 'seg-far-aloysius']
  }
];

export const SEEDED_STUDENT_REQUESTS: StudentRequest[] = [
  // --- Pavoor Riverine Fringe (4 requests -> Destination: St. Aloysius HSS) ---
  {
    id: 'req-pav-01',
    studentName: 'Deeksha Poojary',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-pavoor',
    originVillageName: 'Pavoor Riverine Fringe',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:15:00Z',
    notes: 'Karnataka SSLC State Board Science Practical Exam'
  },
  {
    id: 'req-pav-02',
    studentName: 'Prajwal Shetty',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-pavoor',
    originVillageName: 'Pavoor Riverine Fringe',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:20:00Z',
    notes: 'Mathematics State Preparatory Exam'
  },
  {
    id: 'req-pav-03',
    studentName: 'Vaishnavi Bhat',
    gradeOrStream: 'Grade 11 - Science (PUC)',
    originVillageId: 'vil-pavoor',
    originVillageName: 'Pavoor Riverine Fringe',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'LAB_PRACTICAL',
    submissionTimestamp: '2026-11-13T06:22:00Z',
    notes: 'Physics laboratory practical attendance mandatory'
  },
  {
    id: 'req-pav-04',
    studentName: 'Chethan Kulal',
    gradeOrStream: 'Grade 9',
    originVillageId: 'vil-pavoor',
    originVillageName: 'Pavoor Riverine Fringe',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:25:00Z',
    notes: 'Daily high school curriculum class'
  },

  // --- Farangipete Junction (4 requests -> 2 to St. Aloysius, 2 to KPT Kadri) ---
  {
    id: 'req-far-01',
    studentName: 'Suhas Rai',
    gradeOrStream: 'Diploma Mechanical Year 2 (KPT)',
    originVillageId: 'vil-farangipete',
    originVillageName: 'Farangipete Junction',
    destinationInstitutionId: 'inst-kpt',
    destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
    destinationInstitutionName: 'Karnataka (Govt) Polytechnic (KPT)',
    requiredArrivalTime: '08:45',
    priorityCategory: 'LAB_PRACTICAL',
    submissionTimestamp: '2026-11-13T06:10:00Z',
    notes: 'KPT Central Mechanical Foundry Workshop assessment'
  },
  {
    id: 'req-far-02',
    studentName: 'Ashwitha D’Souza',
    gradeOrStream: 'Diploma EEE Year 1 (KPT)',
    originVillageId: 'vil-farangipete',
    originVillageName: 'Farangipete Junction',
    destinationInstitutionId: 'inst-kpt',
    destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
    destinationInstitutionName: 'Karnataka (Govt) Polytechnic (KPT)',
    requiredArrivalTime: '08:45',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:30:00Z',
    notes: 'Electrical Circuits lecture at KPT Kadri'
  },
  {
    id: 'req-far-03',
    studentName: 'Shravan Alva',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-farangipete',
    originVillageName: 'Farangipete Junction',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:12:00Z',
    notes: 'SSLC Model Pre-Board Exam'
  },
  {
    id: 'req-far-04',
    studentName: 'Meghana Acharya',
    gradeOrStream: 'Grade 12 - Commerce (PUC)',
    originVillageId: 'vil-farangipete',
    originVillageName: 'Farangipete Junction',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:40:00Z',
    notes: 'Accountancy seminar at St. Aloysius'
  },

  // --- Kalladka Foothills (3 requests -> Destination: KPT Kadri) ---
  {
    id: 'req-kal-01',
    studentName: 'Rakshith Kotian',
    gradeOrStream: 'Diploma Civil Year 1 (KPT)',
    originVillageId: 'vil-kalladka',
    originVillageName: 'Kalladka Foothills',
    destinationInstitutionId: 'inst-kpt',
    destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
    destinationInstitutionName: 'Karnataka (Govt) Polytechnic (KPT)',
    requiredArrivalTime: '08:45',
    priorityCategory: 'LAB_PRACTICAL',
    submissionTimestamp: '2026-11-13T06:18:00Z',
    notes: 'Highway & Surveying field exercise at KPT'
  },
  {
    id: 'req-kal-02',
    studentName: 'Harshitha Hegde',
    gradeOrStream: 'Diploma Computer Science Year 2 (KPT)',
    originVillageId: 'vil-kalladka',
    originVillageName: 'Kalladka Foothills',
    destinationInstitutionId: 'inst-kpt',
    destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
    destinationInstitutionName: 'Karnataka (Govt) Polytechnic (KPT)',
    requiredArrivalTime: '08:45',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:05:00Z',
    notes: 'Board of Technical Examinations (BTE) Semester Mid-term'
  },
  {
    id: 'req-kal-03',
    studentName: 'Abhishek Mendon',
    gradeOrStream: 'Diploma Automobile Year 1 (KPT)',
    originVillageId: 'vil-kalladka',
    originVillageName: 'Kalladka Foothills',
    destinationInstitutionId: 'inst-kpt',
    destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
    destinationInstitutionName: 'Karnataka (Govt) Polytechnic (KPT)',
    requiredArrivalTime: '08:45',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:35:00Z',
    notes: 'Engineering graphics lecture'
  },

  // --- Ganjimutt Valley (3 requests -> Destination: St. Aloysius HSS) ---
  {
    id: 'req-ganji-01',
    studentName: 'Divya Shenoy',
    gradeOrStream: 'Grade 12 - Science (PUC)',
    originVillageId: 'vil-ganjimutt',
    originVillageName: 'Ganjimutt Valley',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:08:00Z',
    notes: 'Chemistry Board Practical Internal Grading'
  },
  {
    id: 'req-ganji-02',
    studentName: 'Karthik Bhandary',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-ganjimutt',
    originVillageName: 'Ganjimutt Valley',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:14:00Z',
    notes: 'Kannada Language Unit Test'
  },
  {
    id: 'req-ganji-03',
    studentName: 'Ananya Nayak',
    gradeOrStream: 'Grade 11 - Arts (PUC)',
    originVillageId: 'vil-ganjimutt',
    originVillageName: 'Ganjimutt Valley',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:45:00Z',
    notes: 'History & Sociology lecture'
  },

  // --- Gurupura Riverbank (3 requests -> Destination: St. Aloysius HSS) ---
  {
    id: 'req-guru-01',
    studentName: 'Prathiksha Prabhu',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-gurupura',
    originVillageName: 'Gurupura Riverbank',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:02:00Z',
    notes: 'Biology Board Practical Exam'
  },
  {
    id: 'req-guru-02',
    studentName: 'Mohammed Shafi',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-gurupura',
    originVillageName: 'Gurupura Riverbank',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:06:00Z',
    notes: 'English Pre-Final Exam'
  },
  {
    id: 'req-guru-03',
    studentName: 'Swathi Salian',
    gradeOrStream: 'Grade 9',
    originVillageId: 'vil-gurupura',
    originVillageName: 'Gurupura Riverbank',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:50:00Z',
    notes: 'Secondary science lesson'
  }
];
