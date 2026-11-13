import { Village, Institution, TransportConnection, VehicleTrip, StudentRequest } from '../types';

export const SEEDED_VILLAGES: Village[] = [
  {
    id: 'vil-kallupatti',
    name: 'Kallupatti',
    panchayat: 'Kallupatti Gram Panchayat',
    coordinates: { x: 90, y: 120 },
    description: 'Remote interior hamlet flanked by forest reserve; accessed via single unpaved corridor.',
    connectivityType: 'Fair-Weather'
  },
  {
    id: 'vil-badepalli',
    name: 'Badepalli Junction',
    panchayat: 'Badepalli Mandal',
    coordinates: { x: 300, y: 220 },
    description: 'Central agricultural crossroads connecting northern hilly tracts and eastern plains.',
    connectivityType: 'All-Weather'
  },
  {
    id: 'vil-devarkonda',
    name: 'Devarkonda',
    panchayat: 'Devarkonda Gram Panchayat',
    coordinates: { x: 120, y: 340 },
    description: 'Elevated settlement with winding gradient roads; predominantly tribal hamlets.',
    connectivityType: 'Fair-Weather'
  },
  {
    id: 'vil-mallareddy',
    name: 'Mallareddy Palle',
    panchayat: 'Mallareddy Gram Panchayat',
    coordinates: { x: 490, y: 340 },
    description: 'Agrarian riverine village with farming clusters; secondary transit waypoint.',
    connectivityType: 'All-Weather'
  },
  {
    id: 'vil-sirikonda',
    name: 'Sirikonda',
    panchayat: 'Sirikonda Gram Panchayat',
    coordinates: { x: 670, y: 220 },
    description: 'Low-lying river valley village; vulnerable to seasonal monsoon overflow on the causeway.',
    connectivityType: 'Vulnerable River Crossing'
  }
];

export const SEEDED_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-ghss',
    name: 'Govt Higher Secondary School',
    code: 'GHSS-TALUQ-01',
    type: 'Higher Secondary School',
    coordinates: { x: 300, y: 40 },
    schoolStartTime: '08:30',
    address: 'Collectorate Road, Taluq Headquarters'
  },
  {
    id: 'inst-poly',
    name: 'Vidyalatha Rural Polytechnic & ITI',
    code: 'VR-POLY-04',
    type: 'Polytechnic & Vocational ITI',
    coordinates: { x: 300, y: 440 },
    schoolStartTime: '08:45',
    address: 'Industrial Development Area, South Bypass'
  }
];

export const SEEDED_CONNECTIONS: TransportConnection[] = [
  {
    id: 'seg-kal-bad',
    fromId: 'vil-kallupatti',
    toId: 'vil-badepalli',
    fromName: 'Kallupatti',
    toName: 'Badepalli Junction',
    distanceKm: 12,
    travelMinutes: 25,
    roadType: 'Gravel Corridor',
    isBlocked: false
  },
  {
    id: 'seg-bad-ghss',
    fromId: 'vil-badepalli',
    toId: 'inst-ghss',
    fromName: 'Badepalli Junction',
    toName: 'Govt Higher Secondary School',
    distanceKm: 14,
    travelMinutes: 25,
    roadType: 'All-Weather Tar',
    isBlocked: false
  },
  {
    id: 'seg-dev-bad',
    fromId: 'vil-devarkonda',
    toId: 'vil-badepalli',
    fromName: 'Devarkonda',
    toName: 'Badepalli Junction',
    distanceKm: 10,
    travelMinutes: 20,
    roadType: 'Gravel Corridor',
    isBlocked: false
  },
  {
    id: 'seg-bad-poly',
    fromId: 'vil-badepalli',
    toId: 'inst-poly',
    fromName: 'Badepalli Junction',
    toName: 'Vidyalatha Rural Polytechnic & ITI',
    distanceKm: 16,
    travelMinutes: 30,
    roadType: 'All-Weather Tar',
    isBlocked: false
  },
  {
    id: 'seg-siri-mal',
    fromId: 'vil-sirikonda',
    toId: 'vil-mallareddy',
    fromName: 'Sirikonda',
    toName: 'Mallareddy Palle',
    distanceKm: 8,
    travelMinutes: 20,
    roadType: 'Low-Lying Causeway',
    isBlocked: false,
    blockedReason: undefined
  },
  {
    id: 'seg-mal-bad',
    fromId: 'vil-mallareddy',
    toId: 'vil-badepalli',
    fromName: 'Mallareddy Palle',
    toName: 'Badepalli Junction',
    distanceKm: 11,
    travelMinutes: 20,
    roadType: 'Gravel Corridor',
    isBlocked: false
  },
  {
    id: 'seg-mal-ghss',
    fromId: 'vil-mallareddy',
    toId: 'inst-ghss',
    fromName: 'Mallareddy Palle',
    toName: 'Govt Higher Secondary School',
    distanceKm: 18,
    travelMinutes: 35,
    roadType: 'Paved Highway',
    isBlocked: false
  }
];

export const SEEDED_VEHICLE_TRIPS: VehicleTrip[] = [
  {
    id: 'trip-01',
    vehicleName: 'Bus 01 — Yellow Mini-Bus',
    registrationNumber: 'AP-29-TB-1044',
    vehicleType: 'Mini-Bus',
    driverName: 'Rameshwaram G.',
    capacity: 6, // Deliberately limited capacity
    isCancelled: false,
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    departureTime: '07:15',
    finalArrivalTime: '08:15',
    stops: [
      {
        villageId: 'vil-kallupatti',
        villageName: 'Kallupatti',
        arrivalTime: '07:15',
        departureTime: '07:20',
        order: 1
      },
      {
        villageId: 'vil-badepalli',
        villageName: 'Badepalli Junction',
        arrivalTime: '07:45',
        departureTime: '07:50',
        order: 2
      }
    ],
    pathConnectionIds: ['seg-kal-bad', 'seg-bad-ghss']
  },
  {
    id: 'trip-02',
    vehicleName: 'Van 02 — Panchayat Rural Maxi-Cab',
    registrationNumber: 'AP-29-VA-5012',
    vehicleType: 'Maxi-Cab Van',
    driverName: 'Bhikshamayya K.',
    capacity: 4, // Deliberately limited capacity
    isCancelled: false,
    destinationInstitutionId: 'inst-poly',
    destinationName: 'Vidyalatha Rural Polytechnic & ITI',
    departureTime: '07:20',
    finalArrivalTime: '08:25',
    stops: [
      {
        villageId: 'vil-devarkonda',
        villageName: 'Devarkonda',
        arrivalTime: '07:20',
        departureTime: '07:25',
        order: 1
      },
      {
        villageId: 'vil-badepalli',
        villageName: 'Badepalli Junction',
        arrivalTime: '07:50',
        departureTime: '07:55',
        order: 2
      }
    ],
    pathConnectionIds: ['seg-dev-bad', 'seg-bad-poly']
  },
  {
    id: 'trip-03',
    vehicleName: 'Cruiser 03 — Community Shared Cruiser',
    registrationNumber: 'AP-29-CR-8821',
    vehicleType: 'Rural Cruiser',
    driverName: 'Sattaiah N.',
    capacity: 5, // Deliberately limited capacity
    isCancelled: false,
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    departureTime: '07:10',
    finalArrivalTime: '08:20',
    stops: [
      {
        villageId: 'vil-sirikonda',
        villageName: 'Sirikonda',
        arrivalTime: '07:10',
        departureTime: '07:15',
        order: 1
      },
      {
        villageId: 'vil-mallareddy',
        villageName: 'Mallareddy Palle',
        arrivalTime: '07:35',
        departureTime: '07:40',
        order: 2
      },
      {
        villageId: 'vil-badepalli',
        villageName: 'Badepalli Junction',
        arrivalTime: '07:55',
        departureTime: '08:00',
        order: 3
      }
    ],
    pathConnectionIds: ['seg-siri-mal', 'seg-mal-bad', 'seg-bad-ghss']
  }
];

export const SEEDED_STUDENT_REQUESTS: StudentRequest[] = [
  // --- Kallupatti (4 requests -> Destination: Govt HSS) ---
  {
    id: 'req-kal-01',
    studentName: 'Aarti Sharma',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-kallupatti',
    originVillageName: 'Kallupatti',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:15:00Z',
    notes: 'State SSC Board Practical Exam today'
  },
  {
    id: 'req-kal-02',
    studentName: 'Manoj Nayak',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-kallupatti',
    originVillageName: 'Kallupatti',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:20:00Z',
    notes: 'Math Pre-Finals examination'
  },
  {
    id: 'req-kal-03',
    studentName: 'Kavitha Rao',
    gradeOrStream: 'Grade 11 - Science',
    originVillageId: 'vil-kallupatti',
    originVillageName: 'Kallupatti',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'LAB_PRACTICAL',
    submissionTimestamp: '2026-11-13T06:22:00Z',
    notes: 'Physics laboratory practical attendance mandatory'
  },
  {
    id: 'req-kal-04',
    studentName: 'Sandeep Varma',
    gradeOrStream: 'Grade 9',
    originVillageId: 'vil-kallupatti',
    originVillageName: 'Kallupatti',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:25:00Z',
    notes: 'Daily curriculum class'
  },

  // --- Badepalli (4 requests -> 2 to Govt HSS, 2 to Polytechnic) ---
  {
    id: 'req-bad-01',
    studentName: 'Suresh Reddy',
    gradeOrStream: 'Polytechnic Year 2 - Mech',
    originVillageId: 'vil-badepalli',
    originVillageName: 'Badepalli Junction',
    destinationInstitutionId: 'inst-poly',
    destinationName: 'Vidyalatha Rural Polytechnic & ITI',
    requiredArrivalTime: '08:45',
    priorityCategory: 'LAB_PRACTICAL',
    submissionTimestamp: '2026-11-13T06:10:00Z',
    notes: 'Workshop foundry assessment'
  },
  {
    id: 'req-bad-02',
    studentName: 'Deepa Naik',
    gradeOrStream: 'Polytechnic Year 1 - EEE',
    originVillageId: 'vil-badepalli',
    originVillageName: 'Badepalli Junction',
    destinationInstitutionId: 'inst-poly',
    destinationName: 'Vidyalatha Rural Polytechnic & ITI',
    requiredArrivalTime: '08:45',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:30:00Z',
    notes: 'Circuits lecture'
  },
  {
    id: 'req-bad-03',
    studentName: 'Rahul Goud',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-badepalli',
    originVillageName: 'Badepalli Junction',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:12:00Z',
    notes: 'SSC Model Paper Exam'
  },
  {
    id: 'req-bad-04',
    studentName: 'Bhavani M.',
    gradeOrStream: 'Grade 12 - Arts',
    originVillageId: 'vil-badepalli',
    originVillageName: 'Badepalli Junction',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:40:00Z',
    notes: 'Economics seminar'
  },

  // --- Devarkonda (3 requests -> Destination: Polytechnic) ---
  {
    id: 'req-dev-01',
    studentName: 'Raju Korra',
    gradeOrStream: 'Polytechnic Year 1 - Civil',
    originVillageId: 'vil-devarkonda',
    originVillageName: 'Devarkonda',
    destinationInstitutionId: 'inst-poly',
    destinationName: 'Vidyalatha Rural Polytechnic & ITI',
    requiredArrivalTime: '08:45',
    priorityCategory: 'LAB_PRACTICAL',
    submissionTimestamp: '2026-11-13T06:18:00Z',
    notes: 'Surveying field exercise'
  },
  {
    id: 'req-dev-02',
    studentName: 'Sunita Bai',
    gradeOrStream: 'Polytechnic Year 2 - Comp',
    originVillageId: 'vil-devarkonda',
    originVillageName: 'Devarkonda',
    destinationInstitutionId: 'inst-poly',
    destinationName: 'Vidyalatha Rural Polytechnic & ITI',
    requiredArrivalTime: '08:45',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:05:00Z',
    notes: 'Semester Diploma Mid-term'
  },
  {
    id: 'req-dev-03',
    studentName: 'Ganesh Rathod',
    gradeOrStream: 'Polytechnic Year 1 - Mech',
    originVillageId: 'vil-devarkonda',
    originVillageName: 'Devarkonda',
    destinationInstitutionId: 'inst-poly',
    destinationName: 'Vidyalatha Rural Polytechnic & ITI',
    requiredArrivalTime: '08:45',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:35:00Z',
    notes: 'Engineering graphics lecture'
  },

  // --- Mallareddy Palle (3 requests -> Destination: Govt HSS) ---
  {
    id: 'req-mal-01',
    studentName: 'Lakshmi Narayana',
    gradeOrStream: 'Grade 12 - Science',
    originVillageId: 'vil-mallareddy',
    originVillageName: 'Mallareddy Palle',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:08:00Z',
    notes: 'Chemistry board practical grading'
  },
  {
    id: 'req-mal-02',
    studentName: 'Anitha Kumari',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-mallareddy',
    originVillageName: 'Mallareddy Palle',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:14:00Z',
    notes: 'Social Studies Unit Test'
  },
  {
    id: 'req-mal-03',
    studentName: 'Pradeep Kumar',
    gradeOrStream: 'Grade 11 - Commerce',
    originVillageId: 'vil-mallareddy',
    originVillageName: 'Mallareddy Palle',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:45:00Z',
    notes: 'Accountancy class'
  },

  // --- Sirikonda (3 requests -> Destination: Govt HSS) ---
  {
    id: 'req-siri-01',
    studentName: 'Maheshwari B.',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-sirikonda',
    originVillageName: 'Sirikonda',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:02:00Z',
    notes: 'Biology Board Practical'
  },
  {
    id: 'req-siri-02',
    studentName: 'Venkat Ram',
    gradeOrStream: 'Grade 10',
    originVillageId: 'vil-sirikonda',
    originVillageName: 'Sirikonda',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'CRITICAL_EXAM',
    submissionTimestamp: '2026-11-13T06:06:00Z',
    notes: 'English Grammar Assessment'
  },
  {
    id: 'req-siri-03',
    studentName: 'Swathi K.',
    gradeOrStream: 'Grade 9',
    originVillageId: 'vil-sirikonda',
    originVillageName: 'Sirikonda',
    destinationInstitutionId: 'inst-ghss',
    destinationName: 'Govt Higher Secondary School',
    requiredArrivalTime: '08:30',
    priorityCategory: 'REGULAR_ATTENDANCE',
    submissionTimestamp: '2026-11-13T06:50:00Z',
    notes: 'General science lesson'
  }
];
