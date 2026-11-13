import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Village,
  Institution,
  TransportConnection,
  VehicleTrip,
  StudentRequest,
  AllocationResult
} from '../../types';
import { TrackingService, TelemetryUpdate } from '../../services/trackingService';
import { RoutingService } from '../../services/routingService';
import {
  Navigation,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Maximize2,
  Layers,
  MapPin,
  Bus
} from 'lucide-react';

interface InteractiveLeafletMapProps {
  villages: Village[];
  institutions: Institution[];
  connections: TransportConnection[];
  trips: VehicleTrip[];
  requests: StudentRequest[];
  allocationResult: AllocationResult | null;
  onToggleConnection: (connectionId: string) => void;
  onToggleTrip: (tripId: string) => void;
}

export const InteractiveLeafletMap: React.FC<InteractiveLeafletMapProps> = ({
  villages,
  institutions,
  connections,
  trips,
  requests,
  allocationResult,
  onToggleConnection,
  onToggleTrip
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer groups
  const roadsLayerRef = useRef<L.LayerGroup | null>(null);
  const nodesLayerRef = useRef<L.LayerGroup | null>(null);
  const vehiclesLayerRef = useRef<L.LayerGroup | null>(null);
  const alternativeRoutesLayerRef = useRef<L.LayerGroup | null>(null);

  // Telematics & Simulation State
  const [telemetry, setTelemetry] = useState<Map<string, TelemetryUpdate>>(() =>
    TrackingService.getAllTelemetry()
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'VILLAGE' | 'INSTITUTION' | 'VEHICLE' | 'ROAD';
    id: string;
    name: string;
    details: any;
  } | null>(null);

  // Keep tracking service in sync with trips
  useEffect(() => {
    TrackingService.syncWithTrips(trips, connections);
  }, [trips, connections]);

  // Subscribe to live GPS telemetry updates
  useEffect(() => {
    const unsubscribe = TrackingService.subscribe(updates => {
      setTelemetry(new Map(updates));
    });
    return () => unsubscribe();
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Mangaluru - Bantwal - Gurupura corridor
    const map = L.map(mapContainerRef.current, {
      center: [12.885, 74.93],
      zoom: 12,
      minZoom: 10,
      maxZoom: 16
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors | RouteLess GIS',
      maxZoom: 18
    }).addTo(map);

    // Initialize layer groups
    roadsLayerRef.current = L.layerGroup().addTo(map);
    alternativeRoutesLayerRef.current = L.layerGroup().addTo(map);
    nodesLayerRef.current = L.layerGroup().addTo(map);
    vehiclesLayerRef.current = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    // Auto resize fix
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Road Corridors and Alternative Routes
  useEffect(() => {
    if (!mapInstanceRef.current || !roadsLayerRef.current || !alternativeRoutesLayerRef.current) return;

    roadsLayerRef.current.clearLayers();
    alternativeRoutesLayerRef.current.clearLayers();

    // Color map for vehicle trips
    const tripColorMap: Record<string, string> = {
      'trip-01': '#0284c7', // Cyan Blue
      'trip-02': '#ea580c', // Orange Amber
      'trip-03': '#9333ea'  // Violet Purple
    };

    connections.forEach(conn => {
      if (!conn.waypoints || conn.waypoints.length === 0) return;

      const isBlocked = conn.isBlocked;
      const color = isBlocked ? '#ef4444' : '#0ea5e9';
      const weight = isBlocked ? 6 : 4;
      const dashArray = isBlocked ? '8, 8' : undefined;

      const polyline = L.polyline(conn.waypoints, {
        color,
        weight,
        dashArray,
        opacity: isBlocked ? 0.9 : 0.75,
        lineCap: 'round'
      });

      // Interactive road tooltip and popup
      polyline.bindTooltip(
        `<b>${conn.fromName} ↔ ${conn.toName}</b><br/>${conn.distanceKm} km · ${conn.travelMinutes} mins · ${isBlocked ? '<span style="color:#ef4444;font-weight:bold;">BLOCKED: ' + (conn.blockedReason || 'Impassable') + '</span>' : '<span style="color:#10b981;">Passable</span>'}`,
        { sticky: true }
      );

      polyline.on('click', () => {
        setSelectedEntity({
          type: 'ROAD',
          id: conn.id,
          name: `${conn.fromName} ↔ ${conn.toName}`,
          details: {
            distanceKm: conn.distanceKm,
            travelMinutes: conn.travelMinutes,
            roadType: conn.roadType,
            isBlocked: conn.isBlocked,
            blockedReason: conn.blockedReason
          }
        });
      });

      roadsLayerRef.current?.addLayer(polyline);
    });

    // Render Alternative Detour corridors when disruptions exist
    trips.forEach(trip => {
      const alt = RoutingService.evaluateAlternativeRoute(trip, connections);
      if (!alt.isFeasible || alt.originalPathConnectionIds.length === alt.alternativePathConnectionIds.length) {
        return; // No detour needed or not feasible
      }

      // Collect waypoints for the alternative detour
      const connMap = new Map(connections.map(c => [c.id, c]));
      const altWaypoints: [number, number][] = [];
      alt.alternativePathConnectionIds.forEach(id => {
        const c = connMap.get(id);
        if (c?.waypoints) altWaypoints.push(...c.waypoints);
      });

      if (altWaypoints.length > 0) {
        const altLine = L.polyline(altWaypoints, {
          color: '#10b981', // Emerald green
          weight: 4,
          dashArray: '4, 8',
          opacity: 0.85
        });

        altLine.bindTooltip(
          `<b>Alternative Detour for ${trip.vehicleName.split('—')[0]}</b><br/>${alt.viaDescription}`,
          { sticky: true }
        );

        alternativeRoutesLayerRef.current?.addLayer(altLine);
      }
    });
  }, [connections, trips]);

  // Render Villages & Schools (Nodes)
  useEffect(() => {
    if (!mapInstanceRef.current || !nodesLayerRef.current) return;

    nodesLayerRef.current.clearLayers();

    // Requests count per village
    const demandCount = new Map<string, number>();
    requests.forEach(r => {
      demandCount.set(r.originVillageId, (demandCount.get(r.originVillageId) || 0) + 1);
    });

    // Unmet count per village
    const unmetCount = new Map<string, number>();
    allocationResult?.unmetRequests.forEach(u => {
      unmetCount.set(u.originVillageId, (unmetCount.get(u.originVillageId) || 0) + 1);
    });

    // Render Villages
    villages.forEach(v => {
      if (!v.geoCoordinates) return;

      const demand = demandCount.get(v.id) || 0;
      const unmet = unmetCount.get(v.id) || 0;
      const hasUnmet = unmet > 0;

      // Custom HTML pin icon
      const villageIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: ${hasUnmet ? '#ef4444' : '#1e293b'};
            color: #ffffff;
            border: 2px solid ${hasUnmet ? '#fca5a5' : '#38bdf8'};
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            white-space: nowrap;
          ">
            <span>🏘️</span>
            <span>${v.name.split(' ')[0]}</span>
            <span style="background: rgba(255,255,255,0.25); border-radius: 4px; padding: 1px 4px; font-size: 10px;">${demand}</span>
          </div>
        `,
        iconSize: [90, 28],
        iconAnchor: [45, 14]
      });

      const marker = L.marker([v.geoCoordinates.lat, v.geoCoordinates.lng], {
        icon: villageIcon
      });

      marker.bindTooltip(
        `<b>${v.name}</b><br/>${v.panchayat}<br/>Demand: ${demand} students (${unmet} unmet)<br/>Connectivity: ${v.connectivityType}`,
        { sticky: true }
      );

      marker.on('click', () => {
        setSelectedEntity({
          type: 'VILLAGE',
          id: v.id,
          name: v.name,
          details: {
            panchayat: v.panchayat,
            description: v.description,
            connectivityType: v.connectivityType,
            demand,
            unmet,
            assigned: demand - unmet
          }
        });
      });

      nodesLayerRef.current?.addLayer(marker);
    });

    // Render Educational Institutions
    institutions.forEach(inst => {
      if (!inst.geoCoordinates) return;

      const schoolIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: #4f46e5;
            color: #ffffff;
            border: 2px solid #a5b4fc;
            border-radius: 8px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            white-space: nowrap;
          ">
            <span>🎓</span>
            <span>${inst.name.split(' ')[0]}</span>
            <span style="background: #312e81; border-radius: 4px; padding: 1px 4px; font-size: 9px;">${inst.schoolStartTime}</span>
          </div>
        `,
        iconSize: [110, 28],
        iconAnchor: [55, 14]
      });

      const marker = L.marker([inst.geoCoordinates.lat, inst.geoCoordinates.lng], {
        icon: schoolIcon
      });

      marker.bindTooltip(
        `<b>${inst.name}</b><br/>${inst.address}<br/>Start Time: ${inst.schoolStartTime}`,
        { sticky: true }
      );

      marker.on('click', () => {
        setSelectedEntity({
          type: 'INSTITUTION',
          id: inst.id,
          name: inst.name,
          details: {
            code: inst.code,
            type: inst.type,
            address: inst.address,
            schoolStartTime: inst.schoolStartTime
          }
        });
      });

      nodesLayerRef.current?.addLayer(marker);
    });
  }, [villages, institutions, requests, allocationResult]);

  // Render Vehicles with Live / Simulated Telemetry
  useEffect(() => {
    if (!mapInstanceRef.current || !vehiclesLayerRef.current) return;

    vehiclesLayerRef.current.clearLayers();

    trips.forEach(trip => {
      const telem = telemetry.get(trip.id);
      const lat = telem?.lat ?? (trip.currentLocation?.lat || 12.868);
      const lng = telem?.lng ?? (trip.currentLocation?.lng || 74.96);
      const isCancelled = trip.isCancelled;
      const status = telem?.status || (isCancelled ? 'Breakdown' : 'On Route');

      // Vehicle capacity details from allocation result
      const util = allocationResult?.tripUtilization.find(u => u.tripId === trip.id);
      const occupied = util?.allocatedSeats || 0;
      const capacity = trip.capacity;
      const available = Math.max(0, capacity - occupied);

      const statusBg = isCancelled
        ? '#ef4444'
        : status === 'Delayed'
          ? '#f59e0b'
          : '#10b981';

      const vehicleIcon = L.divIcon({
        className: 'vehicle-leaflet-marker',
        html: `
          <div style="
            background: #0f172a;
            color: #f8fafc;
            border: 2px solid ${statusBg};
            border-radius: 20px;
            padding: 3px 8px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 5px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.4);
            white-space: nowrap;
          ">
            <span>${trip.vehicleType === 'Mini-Bus' ? '🚌' : trip.vehicleType === 'Maxi-Cab Van' ? '🚐' : '🚙'}</span>
            <span>${trip.vehicleName.split('—')[0].trim()}</span>
            <span style="
              background: ${statusBg};
              color: #ffffff;
              padding: 1px 5px;
              border-radius: 10px;
              font-size: 9px;
            ">${occupied}/${capacity}</span>
          </div>
        `,
        iconSize: [120, 26],
        iconAnchor: [60, 13]
      });

      const marker = L.marker([lat, lng], {
        icon: vehicleIcon,
        zIndexOffset: 1000
      });

      marker.bindTooltip(
        `<b>${trip.vehicleName}</b><br/>Reg: ${trip.registrationNumber}<br/>Driver: ${trip.driverName} (${trip.driverPhone || 'N/A'})<br/>Status: <b>${status}</b><br/>Occupied: ${occupied}/${capacity} seats (${available} left)<br/>ETA to ${trip.destinationName.split(' ')[0]}: ${telem?.estimatedArrivalMinutes || 35} mins`,
        { sticky: true }
      );

      marker.on('click', () => {
        setSelectedEntity({
          type: 'VEHICLE',
          id: trip.id,
          name: trip.vehicleName,
          details: {
            registrationNumber: trip.registrationNumber,
            driverName: trip.driverName,
            driverPhone: trip.driverPhone,
            vehicleType: trip.vehicleType,
            capacity,
            occupied,
            available,
            status,
            isCancelled: trip.isCancelled,
            cancelReason: trip.cancelReason,
            speedKmh: telem?.speedKmh || trip.speedKmh || 38,
            etaMinutes: telem?.estimatedArrivalMinutes || 35
          }
        });
      });

      vehiclesLayerRef.current?.addLayer(marker);
    });
  }, [trips, telemetry, allocationResult]);

  // Handlers for GPS playback controls
  const handleToggleSimulation = () => {
    const nextState = !isSimulating;
    setIsSimulating(nextState);
    TrackingService.setSimulationRunning(nextState, trips, connections);
  };

  const handleToggleSpeed = () => {
    const nextSpeed = simSpeed === 1 ? 2 : simSpeed === 2 ? 4 : 1;
    setSimSpeed(nextSpeed);
    TrackingService.setSpeedMultiplier(nextSpeed);
  };

  const handleResetMap = () => {
    mapInstanceRef.current?.setView([12.885, 74.93], 12);
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      {/* Map Header with Legend & Telematics Controls */}
      <div
        className="card-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Navigation size={18} className="text-primary" />
          <h3 className="card-title" style={{ margin: 0 }}>
            Geographical Transportation Network (Leaflet & OSM)
          </h3>
          <span
            className="badge badge-info"
            style={{ fontSize: '0.7rem', padding: '2px 8px' }}
          >
            Dakshina Kannada / Mangaluru Region
          </span>
        </div>

        {/* Telematics Simulation Control Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${isSimulating ? 'btn-danger' : 'btn-primary'}`}
            style={{ fontSize: '0.75rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
            onClick={handleToggleSimulation}
          >
            {isSimulating ? <Pause size={14} /> : <Play size={14} />}
            <span>{isSimulating ? 'Pause GPS Playback' : 'Start Simulated GPS'}</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '5px 8px' }}
            onClick={handleToggleSpeed}
            title="Adjust GPS playback speed"
          >
            Speed: {simSpeed}x
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '5px 8px' }}
            onClick={handleResetMap}
            title="Reset map view to corridor center"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Simulated GPS Mode Notice Bar */}
      <div
        style={{
          background: '#0f172a',
          color: '#94a3b8',
          fontSize: '0.75rem',
          padding: '6px 16px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Info size={14} className="text-primary" />
          <span>
            <b>Simulated Telematics Demo:</b> Synthetic GPS coordinates dynamically computed along road geometries. Ready for live AIS-140 / Traccar telematics feeds.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 4, background: '#0ea5e9', display: 'inline-block', borderRadius: 2 }} />
            Open Road
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 4, background: '#ef4444', display: 'inline-block', borderRadius: 2 }} />
            Blocked Road (Click to toggle)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 4, borderTop: '2px dashed #10b981', display: 'inline-block' }} />
            Feasible Detour
          </span>
        </div>
      </div>

      {/* Leaflet Map Canvas Container */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '480px',
          background: '#e2e8f0',
          position: 'relative'
        }}
      />

      {/* Selected Entity Inspection Drawer */}
      {selectedEntity && (
        <div
          style={{
            background: '#1e293b',
            color: '#f8fafc',
            padding: '12px 16px',
            borderTop: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Selected {selectedEntity.type} Inspection
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{selectedEntity.name}</span>
              {selectedEntity.type === 'ROAD' && selectedEntity.details.isBlocked && (
                <span className="badge badge-danger">BLOCKED</span>
              )}
              {selectedEntity.type === 'VEHICLE' && selectedEntity.details.isCancelled && (
                <span className="badge badge-danger">OUT OF SERVICE</span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>
              {selectedEntity.type === 'VILLAGE' && (
                <span>
                  {selectedEntity.details.panchayat} · Demand: <b>{selectedEntity.details.demand}</b> students ({selectedEntity.details.unmet} unmet) · Connectivity: <i>{selectedEntity.details.connectivityType}</i>
                </span>
              )}
              {selectedEntity.type === 'INSTITUTION' && (
                <span>
                  {selectedEntity.details.type} · Starts at: <b>{selectedEntity.details.schoolStartTime}</b> · {selectedEntity.details.address}
                </span>
              )}
              {selectedEntity.type === 'ROAD' && (
                <span>
                  Length: <b>{selectedEntity.details.distanceKm} km</b> · Travel Time: <b>{selectedEntity.details.travelMinutes} mins</b> · {selectedEntity.details.roadType}
                  {selectedEntity.details.blockedReason && ` · Reason: ${selectedEntity.details.blockedReason}`}
                </span>
              )}
              {selectedEntity.type === 'VEHICLE' && (
                <span>
                  Reg: <b>{selectedEntity.details.registrationNumber}</b> · Driver: {selectedEntity.details.driverName} ({selectedEntity.details.driverPhone || 'N/A'}) · Available Seats: <b>{selectedEntity.details.available}</b> / {selectedEntity.details.capacity} · Live Speed: {selectedEntity.details.speedKmh} km/h · ETA: {selectedEntity.details.etaMinutes} mins
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedEntity.type === 'ROAD' && (
              <button
                type="button"
                className={`btn ${selectedEntity.details.isBlocked ? 'btn-success' : 'btn-danger'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => {
                  onToggleConnection(selectedEntity.id);
                  setSelectedEntity(null);
                }}
              >
                {selectedEntity.details.isBlocked ? 'Reopen Road' : 'Block Road'}
              </button>
            )}

            {selectedEntity.type === 'VEHICLE' && (
              <button
                type="button"
                className={`btn ${selectedEntity.details.isCancelled ? 'btn-success' : 'btn-danger'}`}
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => {
                  onToggleTrip(selectedEntity.id);
                  setSelectedEntity(null);
                }}
              >
                {selectedEntity.details.isCancelled ? 'Restore Vehicle' : 'Report Breakdown'}
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => setSelectedEntity(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
