import { Village, Institution, TransportConnection, VehicleTrip, StudentRequest } from '../types';

export const SIMULATION_CLOCK = '06:45 AM';
export const EXAM_ARRIVAL_BUFFER_MINUTES = 15; // Mandatory arrival 15 mins before exam starts

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
    coordinates: { x: 120, y: 350 },
    description: 'Elevated Western Ghat foothill settlement with winding road gradients and isolated student clusters.',
    connectivityType: 'Fair-Weather'
  },
  {
    id: 'vil-ganjimutt',
    name: 'Ganjimutt Valley',
    panchayat: 'Ganjimutt Grama Panchayat, Mangaluru North',
    coordinates: { x: 500, y: 340 },
    description: 'Agrarian river basin village along the Gurupura valley; secondary transit waypoint.',
    connectivityType: 'All-Weather'
  },
  {
    id: 'vil-gurupura',
    name: 'Gurupura Riverbank',
    panchayat: 'Gurupura Grama Panchayat, Mangaluru',
    coordinates: { x: 680, y: 220 },
    description: 'Low-lying riverbank settlement along the Phalguni (Gurupura) river; causeway prone to coastal monsoon overflow.',
    connectivityType: 'Vulnerable River Crossing'
  },
  {
    id: 'vil-adyar',
    name: 'Adyar Ridge Waypoint',
    panchayat: 'Adyar Grama Panchayat, Mangaluru East',
    coordinates: { x: 410, y: 270 },
    description: 'Elevated bypass ridge corridor avoiding low-lying river inundation points.',
    connectivityType: 'All-Weather'
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
    coordinates: { x: 300, y: 450 },
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
  // Primary valley corridor between Ganjimutt and Farangipete (BLOCKED in Exam Day Crisis!)
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
  // Alternative bypass corridors via Adyar Ridge
  {
    id: 'seg-ganji-adyar',
    fromId: 'vil-ganjimutt',
    toId: 'vil-adyar',
    fromName: 'Ganjimutt Valley',
    toName: 'Adyar Ridge Waypoint',
    distanceKm: 6,
    travelMinutes: 12,
    roadType: 'Detour Bypass',
    isBlocked: false
  },
  {
    id: 'seg-adyar-far',
    fromId: 'vil-adyar',
    toId: 'vil-farangipete',
    fromName: 'Adyar Ridge Waypoint',
    toName: 'Farangipete Junction',
    distanceKm: 8,
    travelMinutes: 16,
    roadType: 'Detour Bypass',
    isBlocked: false
  },
];

export const SEEDED_VEHICLE_TRIPS: VehicleTrip[] = [
  {
    id: 'trip-01',
    vehicleName: 'Bus 01 — KSRTC Rural Sarige (Govt Mini-Bus)',
    registrationNumber: 'KA-19-F-1044',
    vehicleType: 'Mini-Bus',
    driverName: 'Shekhara Poojary',
    capacity: 7,
    isCancelled: false,
    isGovernmentBus: true,
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
    vehicleName: 'Bus 02 — KSRTC JnNURM Suburban (Govt Bus)',
    registrationNumber: 'KA-19-F-3280',
    vehicleType: 'City Bus',
    driverName: 'Mohandas Rai',
    capacity: 6,
    isCancelled: false,
    isGovernmentBus: true,
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    departureTime: '07:10',
    finalArrivalTime: '08:10',
    stops: [
      {
        villageId: 'vil-kalladka',
        villageName: 'Kalladka Foothills',
        arrivalTime: '07:10',
        departureTime: '07:15',
        order: 1
      },
      {
        villageId: 'vil-farangipete',
        villageName: 'Farangipete Junction',
        arrivalTime: '07:40',
        departureTime: '07:45',
        order: 2
      }
    ],
    pathConnectionIds: ['seg-kal-far', 'seg-far-aloysius']
  },
  {
    id: 'trip-03',
    vehicleName: 'Van 03 — Dakshina Kannada ZP Feeder (Govt/ZP Van)',
    registrationNumber: 'KA-19-VA-5012',
    vehicleType: 'Maxi-Cab Van',
    driverName: 'Ganesh Shetty',
    capacity: 5,
    isCancelled: false,
    isGovernmentBus: false,
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
    id: 'trip-04',
    vehicleName: 'Cruiser 04 — Kudla Community Rural Cruiser',
    registrationNumber: 'KA-19-CR-8821',
    vehicleType: 'Rural Cruiser',
    driverName: 'Anand D’Souza',
    capacity: 6,
    isCancelled: false,
    isGovernmentBus: false,
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    departureTime: '07:05',
    finalArrivalTime: '08:15', // Base arrival before detour
    stops: [
      {
        villageId: 'vil-gurupura',
        villageName: 'Gurupura Riverbank',
        arrivalTime: '07:05',
        departureTime: '07:10',
        order: 1
      },
      {
        villageId: 'vil-ganjimutt',
        villageName: 'Ganjimutt Valley',
        arrivalTime: '07:30',
        departureTime: '07:30',
        order: 2
      },
      {
        villageId: 'vil-farangipete',
        villageName: 'Farangipete Junction',
        arrivalTime: '07:50',
        departureTime: '07:50',
        order: 3
      }
    ],
    pathConnectionIds: ['seg-guru-ganji', 'seg-ganji-far', 'seg-far-aloysius']
  }
];

// Baseline requests fixture: Exactly 20 requests (divisible by 5 for exact 40% surge)
export const SEEDED_STUDENT_REQUESTS: StudentRequest[] = [
  // --- Pavoor Riverine Fringe (4 requests -> Destination: St. Aloysius) ---
  {
    id: 'req-pav-01',
    studentName: 'Deeksha Poojary',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-pavoor',
    originVillageName: 'Pavoor Riverine Fringe',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:15',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:30',
    examSubject: 'SSLC State Mathematics Board Exam',
    submissionTimestamp: '2026-11-13T06:15:00Z',
    submissionOrder: 1,
    notes: 'Karnataka SSLC State Board Exam Candidate'
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
    requiredArrivalTime: '08:15',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:30',
    examSubject: 'SSLC State Science Board Exam',
    submissionTimestamp: '2026-11-13T06:20:00Z',
    submissionOrder: 2,
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
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:22:00Z',
    submissionOrder: 3,
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
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:25:00Z',
    submissionOrder: 4,
    notes: 'Daily high school curriculum class'
  },

  // --- Farangipete Junction (5 requests -> 3 to St. Aloysius, 2 to KPT Kadri) ---
  {
    id: 'req-far-01',
    studentName: 'Suhas Rai',
    gradeOrStream: 'Diploma Mechanical Year 2 (KPT)',
    originVillageId: 'vil-farangipete',
    originVillageName: 'Farangipete Junction',
    destinationInstitutionId: 'inst-kpt',
    destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
    destinationInstitutionName: 'Karnataka (Govt) Polytechnic (KPT)',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:45',
    examSubject: 'BTE Diploma Mechanics Midterm Assessment',
    submissionTimestamp: '2026-11-13T06:10:00Z',
    submissionOrder: 5,
    notes: 'KPT Central Mechanical Foundry Workshop Assessment'
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
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:30:00Z',
    submissionOrder: 6,
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
    requiredArrivalTime: '08:15',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:30',
    examSubject: 'SSLC Model Pre-Board Exam',
    submissionTimestamp: '2026-11-13T06:12:00Z',
    submissionOrder: 7,
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
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:40:00Z',
    submissionOrder: 8,
    notes: 'Accountancy seminar at St. Aloysius'
  },
  {
    id: 'req-far-05',
    studentName: 'Naveen Mendonca',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-farangipete',
    originVillageName: 'Farangipete Junction',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:15',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:30',
    examSubject: 'Karnataka State English Pre-Final',
    submissionTimestamp: '2026-11-13T06:42:00Z',
    submissionOrder: 9,
    notes: 'Pre-final examination'
  },

  // --- Kalladka Foothills (4 requests -> 3 to KPT Kadri, 1 to St. Aloysius) ---
  {
    id: 'req-kal-01',
    studentName: 'Rakshith Kotian',
    gradeOrStream: 'Diploma Civil Year 1 (KPT)',
    originVillageId: 'vil-kalladka',
    originVillageName: 'Kalladka Foothills',
    destinationInstitutionId: 'inst-kpt',
    destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
    destinationInstitutionName: 'Karnataka (Govt) Polytechnic (KPT)',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:45',
    examSubject: 'BTE Surveying Lab Assessment',
    submissionTimestamp: '2026-11-13T06:18:00Z',
    submissionOrder: 10,
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
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:45',
    examSubject: 'BTE Data Structures Semester Exam',
    submissionTimestamp: '2026-11-13T06:05:00Z',
    submissionOrder: 11,
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
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:35:00Z',
    submissionOrder: 12,
    notes: 'Engineering graphics lecture'
  },
  {
    id: 'req-kal-04',
    studentName: 'Sneha Shetty',
    gradeOrStream: 'Grade 12 - Science (PUC)',
    originVillageId: 'vil-kalladka',
    originVillageName: 'Kalladka Foothills',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'LAB_PRACTICAL',
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:38:00Z',
    submissionOrder: 13,
    notes: 'Biology lab dissection session'
  },

  // --- Ganjimutt Valley (4 requests -> Destination: St. Aloysius) ---
  {
    id: 'req-ganji-01',
    studentName: 'Divya Shenoy',
    gradeOrStream: 'Grade 12 - Science (PUC)',
    originVillageId: 'vil-ganjimutt',
    originVillageName: 'Ganjimutt Valley',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:15',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:30',
    examSubject: 'PUC II Chemistry State Practical Board Exam',
    submissionTimestamp: '2026-11-13T06:08:00Z',
    submissionOrder: 14,
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
    requiredArrivalTime: '08:15',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:30',
    examSubject: 'SSLC Kannada First Language Board Exam',
    submissionTimestamp: '2026-11-13T06:14:00Z',
    submissionOrder: 15,
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
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:45:00Z',
    submissionOrder: 16,
    notes: 'History & Sociology lecture'
  },
  {
    id: 'req-ganji-04',
    studentName: 'Girish Kudroli',
    gradeOrStream: 'Grade 9',
    originVillageId: 'vil-ganjimutt',
    originVillageName: 'Ganjimutt Valley',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:48:00Z',
    submissionOrder: 17,
    notes: 'Regular classroom attendance'
  },

  // --- Gurupura Riverbank (3 requests -> Destination: St. Aloysius) ---
  {
    id: 'req-guru-01',
    studentName: 'Prathiksha Prabhu',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-gurupura',
    originVillageName: 'Gurupura Riverbank',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:15',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:30',
    examSubject: 'SSLC Biology Board Practical',
    submissionTimestamp: '2026-11-13T06:02:00Z',
    submissionOrder: 18,
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
    requiredArrivalTime: '08:15',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:30',
    examSubject: 'SSLC English Pre-Final',
    submissionTimestamp: '2026-11-13T06:06:00Z',
    submissionOrder: 19,
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
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:50:00Z',
    submissionOrder: 20,
    notes: 'Secondary science lesson'
  }
];

// Deterministic Crisis Surge Requests: Exactly 8 requests (40% increase of 20 baseline requests)
// ceil(20 * 0.40) = 8 requests. 20 + 8 = 28 total requests.
// Seeded with documented exam deadlines within 2 hours of simulated 06:45 AM clock.
export const DETERMINISTIC_CRISIS_SURGE_REQUESTS: StudentRequest[] = [
  {
    id: 'req-crisis-01',
    studentName: 'Avinash D’Cunha',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-ganjimutt',
    originVillageName: 'Ganjimutt Valley',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:15',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:30',
    examSubject: 'SSLC Karnataka State Board Mathematics Exam',
    submissionTimestamp: '2026-11-13T06:46:00Z',
    submissionOrder: 21,
    isCrisisAdded: true,
    notes: 'Emergency exam transport request after village van failed to arrive'
  },
  {
    id: 'req-crisis-02',
    studentName: 'Bhavya Kulal',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-farangipete',
    originVillageName: 'Farangipete Junction',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:15',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:30',
    examSubject: 'SSLC Karnataka State Board Mathematics Exam',
    submissionTimestamp: '2026-11-13T06:46:30Z',
    submissionOrder: 22,
    isCrisisAdded: true,
    notes: 'Exam candidate walking to junction seeking transport'
  },
  {
    id: 'req-crisis-03',
    studentName: 'Chirag Ullal',
    gradeOrStream: 'Diploma Mechanical Year 2 (KPT)',
    originVillageId: 'vil-kalladka',
    originVillageName: 'Kalladka Foothills',
    destinationInstitutionId: 'inst-kpt',
    destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
    destinationInstitutionName: 'Karnataka (Govt) Polytechnic (KPT)',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:45',
    examSubject: 'BTE State Diploma Engineering Practical Assessment',
    submissionTimestamp: '2026-11-13T06:47:00Z',
    submissionOrder: 23,
    isCrisisAdded: true,
    notes: 'Critical final lab exam at KPT Kadri'
  },
  {
    id: 'req-crisis-04',
    studentName: 'Deepthi Kotian',
    gradeOrStream: 'Grade 12 - Science (PUC)',
    originVillageId: 'vil-pavoor',
    originVillageName: 'Pavoor Riverine Fringe',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:15',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:30',
    examSubject: 'PUC II State Board Physics Practical Exam',
    submissionTimestamp: '2026-11-13T06:47:30Z',
    submissionOrder: 24,
    isCrisisAdded: true,
    notes: 'Board exam scheduled at 08:30 AM sharp'
  },
  {
    id: 'req-crisis-05',
    studentName: 'Eshwar Bangera',
    gradeOrStream: 'Diploma Civil Year 1 (KPT)',
    originVillageId: 'vil-farangipete',
    originVillageName: 'Farangipete Junction',
    destinationInstitutionId: 'inst-kpt',
    destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
    destinationInstitutionName: 'Karnataka (Govt) Polytechnic (KPT)',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    isExamStudent: true,
    examStartTime: '08:45',
    examSubject: 'BTE Engineering Drawing Midterm',
    submissionTimestamp: '2026-11-13T06:48:00Z',
    submissionOrder: 25,
    isCrisisAdded: true,
    notes: 'Semester drawing assessment at KPT'
  },
  {
    id: 'req-crisis-06',
    studentName: 'Farzana Banu',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-ganjimutt',
    originVillageName: 'Ganjimutt Valley',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:48:30Z',
    submissionOrder: 26,
    isCrisisAdded: true,
    notes: 'Urgent transport requested due to private auto strikes'
  },
  {
    id: 'req-crisis-07',
    studentName: 'Gautham Kunder',
    gradeOrStream: 'Grade 11 - Commerce (PUC)',
    originVillageId: 'vil-kalladka',
    originVillageName: 'Kalladka Foothills',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:49:00Z',
    submissionOrder: 27,
    isCrisisAdded: true,
    notes: 'Regular attendance request'
  },
  {
    id: 'req-crisis-08',
    studentName: 'Hemanth Poojary',
    gradeOrStream: 'Grade 9',
    originVillageId: 'vil-gurupura',
    originVillageName: 'Gurupura Riverbank',
    destinationInstitutionId: 'inst-aloysius',
    destinationName: 'St. Aloysius High School & PU College',
    destinationInstitutionName: 'St. Aloysius High School & PU College',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    isExamStudent: false,
    submissionTimestamp: '2026-11-13T06:49:30Z',
    submissionOrder: 28,
    isCrisisAdded: true,
    notes: 'Regular high school attendance'
  }
];
