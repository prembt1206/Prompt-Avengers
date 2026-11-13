import { VehicleTrip, TransportConnection, StudentRequest } from '../types';

export interface DisruptionScenario {
  id: string;
  name: string;
  badge: string;
  description: string;
  apply: (
    trips: VehicleTrip[],
    connections: TransportConnection[],
    requests?: StudentRequest[]
  ) => {
    updatedTrips: VehicleTrip[];
    updatedConnections: TransportConnection[];
    updatedRequests?: StudentRequest[];
  };
}

export const DISRUPTION_SCENARIOS: DisruptionScenario[] = [
  {
    id: 'clear-all',
    name: '1. Normal Operations (All Clear)',
    badge: 'Baseline Fleet',
    description: 'All 3 vehicles active, all 7 road corridors open. Establishes the normal operating benchmark across the Mangaluru network.',
    apply: (trips, connections) => {
      const updatedTrips = trips.map(t => ({
        ...t,
        isCancelled: false,
        cancelReason: undefined
      }));
      const updatedConnections = connections.map(c => ({
        ...c,
        isBlocked: false,
        blockedReason: undefined
      }));
      return { updatedTrips, updatedConnections };
    }
  },
  {
    id: 'bus-breakdown',
    name: '2. Single Vehicle Breakdown (Bus 01)',
    badge: 'Vehicle Breakdown',
    description: 'KSRTC Bus 01 suffers an engine radiator crack at Farangipete depot. Leaves Pavoor Fringe with no service; tests capacity reallocation.',
    apply: (trips, connections) => {
      const updatedTrips = trips.map(t =>
        t.id === 'trip-01'
          ? {
              ...t,
              isCancelled: true,
              cancelReason: 'Depot radiator crack & cooling system failure during morning pre-trip check'
            }
          : t
      );
      return { updatedTrips, updatedConnections: [...connections] };
    }
  },
  {
    id: 'causeway-flood',
    name: '3. Critical Road Flooding (Gurupura Causeway)',
    badge: 'Route Blocked',
    description: 'Monsoon runoff submerges the Phalguni river crossing (seg-guru-ganji) under 2.5 ft of flood water. Gurupura Riverbank is cut off.',
    apply: (trips, connections) => {
      const updatedConnections = connections.map(c =>
        c.id === 'seg-guru-ganji'
          ? {
              ...c,
              isBlocked: true,
              blockedReason: 'Phalguni (Gurupura) river causeway submerged under 2.5ft flood runoff; road impassable'
            }
          : c
      );
      return { updatedTrips: [...trips], updatedConnections };
    }
  },
  {
    id: 'cascading-both',
    name: '4. Multiple Simultaneous Disruptions (Dual Crisis)',
    badge: 'Compound Disaster',
    description: 'Combined coastal emergency: KSRTC Bus 01 disabled AND Gurupura river causeway submerged. Demonstrates emergency triage under severe seat deficits.',
    apply: (trips, connections) => {
      const updatedTrips = trips.map(t =>
        t.id === 'trip-01'
          ? {
              ...t,
              isCancelled: true,
              cancelReason: 'Depot radiator crack & cooling system failure'
            }
          : t
      );
      const updatedConnections = connections.map(c =>
        c.id === 'seg-guru-ganji'
          ? {
              ...c,
              isBlocked: true,
              blockedReason: 'Phalguni river causeway submerged under 2.5ft flood runoff'
            }
          : c
      );
      return { updatedTrips, updatedConnections };
    }
  },
  {
    id: 'demand-surge',
    name: '5. Increased Student Demand (Board Exam Rush)',
    badge: 'Demand Surge',
    description: 'Sudden influx of 6 high-priority SSLC/PUC Board Examination candidates from Farangipete and Kalladka. Stresses seat capacity.',
    apply: (trips, connections, existingRequests = []) => {
      // Create 6 surge requests
      const surgeStudents: StudentRequest[] = [
        {
          id: 'req-surge-01',
          studentName: 'Aarav Shetty (Surge)',
          gradeOrStream: 'Grade 10 (SSLC Exam)',
          originVillageId: 'vil-farangipete',
          originVillageName: 'Farangipete Junction',
          destinationInstitutionId: 'inst-aloysius',
          destinationName: 'St. Aloysius High School & PU College',
          destinationInstitutionName: 'St. Aloysius High School & PU College',
          requiredArrivalTime: '08:30',
          priorityCategory: 'CRITICAL_EXAM',
          submissionTimestamp: '2026-11-13T06:00:10Z',
          notes: 'SSLC State Mathematics Board Exam',
          isCustom: true
        },
        {
          id: 'req-surge-02',
          studentName: 'Bhoomika Rai (Surge)',
          gradeOrStream: 'Grade 10 (SSLC Exam)',
          originVillageId: 'vil-farangipete',
          originVillageName: 'Farangipete Junction',
          destinationInstitutionId: 'inst-aloysius',
          destinationName: 'St. Aloysius High School & PU College',
          destinationInstitutionName: 'St. Aloysius High School & PU College',
          requiredArrivalTime: '08:30',
          priorityCategory: 'CRITICAL_EXAM',
          submissionTimestamp: '2026-11-13T06:00:20Z',
          notes: 'SSLC State Mathematics Board Exam',
          isCustom: true
        },
        {
          id: 'req-surge-03',
          studentName: 'Chirag Kulal (Surge)',
          gradeOrStream: 'Grade 12 - Science',
          originVillageId: 'vil-farangipete',
          originVillageName: 'Farangipete Junction',
          destinationInstitutionId: 'inst-aloysius',
          destinationName: 'St. Aloysius High School & PU College',
          destinationInstitutionName: 'St. Aloysius High School & PU College',
          requiredArrivalTime: '08:30',
          priorityCategory: 'CRITICAL_EXAM',
          submissionTimestamp: '2026-11-13T06:00:30Z',
          notes: 'PUC Chemistry State Board Exam',
          isCustom: true
        },
        {
          id: 'req-surge-04',
          studentName: 'Deepa Alva (Surge)',
          gradeOrStream: 'Diploma Electrical Year 3',
          originVillageId: 'vil-kalladka',
          originVillageName: 'Kalladka Foothills',
          destinationInstitutionId: 'inst-kpt',
          destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
          destinationInstitutionName: 'Karnataka (Govt) Polytechnic (KPT)',
          requiredArrivalTime: '08:45',
          priorityCategory: 'CRITICAL_EXAM',
          submissionTimestamp: '2026-11-13T06:00:40Z',
          notes: 'BTE Electrical Machinery Practical Exam',
          isCustom: true
        },
        {
          id: 'req-surge-05',
          studentName: 'Eshwar Poojary (Surge)',
          gradeOrStream: 'Diploma Computer Science Year 2',
          originVillageId: 'vil-kalladka',
          originVillageName: 'Kalladka Foothills',
          destinationInstitutionId: 'inst-kpt',
          destinationName: 'Karnataka (Govt) Polytechnic (KPT)',
          destinationInstitutionName: 'Karnataka (Govt) Polytechnic (KPT)',
          requiredArrivalTime: '08:45',
          priorityCategory: 'CRITICAL_EXAM',
          submissionTimestamp: '2026-11-13T06:00:50Z',
          notes: 'BTE Database Lab Practical',
          isCustom: true
        },
        {
          id: 'req-surge-06',
          studentName: 'Farhan Ahmed (Surge)',
          gradeOrStream: 'Grade 10',
          originVillageId: 'vil-farangipete',
          originVillageName: 'Farangipete Junction',
          destinationInstitutionId: 'inst-aloysius',
          destinationName: 'St. Aloysius High School & PU College',
          destinationInstitutionName: 'St. Aloysius High School & PU College',
          requiredArrivalTime: '08:30',
          priorityCategory: 'CRITICAL_EXAM',
          submissionTimestamp: '2026-11-13T06:01:00Z',
          notes: 'SSLC Model Exam',
          isCustom: true
        }
      ];

      // Filter out previous surge requests if any to avoid duplication
      const baseReqs = existingRequests.filter(r => !r.id.startsWith('req-surge-'));
      return {
        updatedTrips: [...trips],
        updatedConnections: [...connections],
        updatedRequests: [...surgeStudents, ...baseReqs]
      };
    }
  }
];
