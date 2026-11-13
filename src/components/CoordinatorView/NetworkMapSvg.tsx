import React from 'react';
import { Village, Institution, TransportConnection, VehicleTrip, StudentRequest } from '../../types';
import { ShieldAlert, Info, AlertTriangle, ArrowRight } from 'lucide-react';

interface NetworkMapSvgProps {
  villages: Village[];
  institutions: Institution[];
  connections: TransportConnection[];
  trips: VehicleTrip[];
  requests: StudentRequest[];
  onToggleConnection: (connectionId: string) => void;
  onToggleTrip: (tripId: string) => void;
  isCrisisActive?: boolean;
}

export const NetworkMapSvg: React.FC<NetworkMapSvgProps> = ({
  villages,
  institutions,
  connections,
  trips,
  requests,
  onToggleConnection,
  onToggleTrip,
  isCrisisActive = false
}) => {
  const nodeCoords = new Map<string, { x: number; y: number; name: string }>();
  villages.forEach(v => nodeCoords.set(v.id, { x: v.coordinates.x, y: v.coordinates.y, name: v.name }));
  institutions.forEach(i => nodeCoords.set(i.id, { x: i.coordinates.x, y: i.coordinates.y, name: i.name }));

  const requestCountByVillage = new Map<string, number>();
  const examCountByVillage = new Map<string, number>();

  requests.forEach(r => {
    requestCountByVillage.set(r.originVillageId, (requestCountByVillage.get(r.originVillageId) || 0) + 1);
    if (r.isExamStudent) {
      examCountByVillage.set(r.originVillageId, (examCountByVillage.get(r.originVillageId) || 0) + 1);
    }
  });

  const floodedConnection = connections.find(c => c.isBlocked);
  const activeBypassActive = isCrisisActive && floodedConnection?.id === 'seg-ganji-far';

  return (
    <div className="card" style={{ marginBottom: '22px' }}>
      <div className="card-header" style={{ background: '#042f2e', color: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} className="text-teal" />
          <h3 className="card-title" style={{ color: '#f0fdf4' }}>
            Interactive Rural Network Schematic & Route Engine
          </h3>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 12, height: 4, background: '#14b8a6', display: 'inline-block', borderRadius: 2 }}></span>
            Active Corridor
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 12, height: 4, background: '#ef4444', display: 'inline-block', borderRadius: 2, border: '1px dashed red' }}></span>
            Flooded Corridor (Impassable)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 12, height: 4, background: '#f59e0b', display: 'inline-block', borderRadius: 2 }}></span>
            Alternative Bypass Corridor
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 9, height: 9, background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
            Active Vehicle
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 9, height: 9, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }}></span>
            Disabled Vehicle
          </span>
        </div>
      </div>

      <div className="card-body" style={{ background: '#0a192f', padding: '16px', position: 'relative' }}>
        {/* Status Callout if Flooding Active */}
        {activeBypassActive && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              padding: '8px 12px',
              marginBottom: '12px',
              color: '#fca5a5',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={15} />
              <span>
                <strong>CORRIDOR FLOODED:</strong> Ganjimutt ↔ Farangipete road submerged. Dijkstra recovery reroutes Cruiser 04 via <strong>Adyar Ridge Bypass (+8m detour)</strong>.
              </span>
            </div>
            <span className="badge badge-warning">Alternative Route Computed</span>
          </div>
        )}

        <div style={{ position: 'relative', width: '100%', maxWidth: '860px', margin: '0 auto' }}>
          <svg
            viewBox="0 0 820 500"
            className="network-svg"
            style={{ width: '100%', height: 'auto', overflow: 'visible' }}
            aria-label="Schematic rural transit network diagram showing 5 hamlets, bypass waypoint, 2 institutions, and road connections"
          >
            <defs>
              <pattern id="grid-dots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#1e293b" />
              </pattern>

              {/* Water wave ripple effect for flooded roads */}
              <filter id="water-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <rect width="820" height="500" fill="#091428" rx="8" />
            <rect width="820" height="500" fill="url(#grid-dots)" rx="8" />

            {/* Road Connections / Edges */}
            {connections.map(conn => {
              const from = nodeCoords.get(conn.fromId);
              const to = nodeCoords.get(conn.toId);
              if (!from || !to) return null;

              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              const isBypass = conn.id === 'seg-ganji-adyar' || conn.id === 'seg-adyar-far';

              return (
                <g
                  key={conn.id}
                  onClick={() => onToggleConnection(conn.id)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                >
                  <title>{`${conn.fromName} ↔ ${conn.toName}: ${conn.distanceKm}km, ${conn.travelMinutes}m (${conn.isBlocked ? 'BLOCKED: ' + conn.blockedReason : 'PASSABLE'}). Click to toggle.`}</title>

                  {/* Wide hit area */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="transparent"
                    strokeWidth="24"
                  />

                  {/* The visual line */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={
                      conn.isBlocked
                        ? '#ef4444'
                        : isBypass && activeBypassActive
                        ? '#f59e0b'
                        : '#14b8a6'
                    }
                    strokeWidth={conn.isBlocked ? '5' : isBypass && activeBypassActive ? '4' : '2.5'}
                    strokeDasharray={
                      conn.isBlocked
                        ? '6,6'
                        : isBypass && activeBypassActive
                        ? '8,4'
                        : undefined
                    }
                    className={
                      conn.isBlocked
                        ? 'road-blocked-anim'
                        : isBypass && activeBypassActive
                        ? 'road-bypass-anim'
                        : undefined
                    }
                    opacity={conn.isBlocked ? 0.95 : isBypass && !activeBypassActive ? 0.35 : 0.8}
                  />

                  {/* Badge pill in middle */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-42"
                      y="-11"
                      width="84"
                      height="22"
                      rx="11"
                      fill={conn.isBlocked ? '#7f1d1d' : isBypass && activeBypassActive ? '#78350f' : '#0f172a'}
                      stroke={conn.isBlocked ? '#f87171' : isBypass && activeBypassActive ? '#f59e0b' : '#334155'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={conn.isBlocked ? '#fca5a5' : isBypass && activeBypassActive ? '#fef3c7' : '#94a3b8'}
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {conn.isBlocked ? '⚠️ FLOODED' : `${conn.distanceKm}km • ${conn.travelMinutes}m`}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Simulated Animated Bus Moving on Unblocked Alternative Path */}
            {activeBypassActive && (
              <g className="bus-motion-element">
                {/* Visual marker showing illustrative transit movement */}
                <circle cx="410" cy="270" r="10" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                <text x="410" y="274" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">
                  🚌
                </text>
              </g>
            )}

            {/* Village Nodes */}
            {villages.map(village => {
              const reqCount = requestCountByVillage.get(village.id) || 0;
              const examCount = examCountByVillage.get(village.id) || 0;
              const isWaypoint = village.id === 'vil-adyar';

              return (
                <g key={village.id} transform={`translate(${village.coordinates.x}, ${village.coordinates.y})`}>
                  <circle
                    r={isWaypoint ? '16' : '22'}
                    fill={isWaypoint ? '#0f766e' : '#0f172a'}
                    stroke={isWaypoint ? '#5eead4' : '#14b8a6'}
                    strokeWidth="2.5"
                  />

                  {/* Icon */}
                  <text
                    x="0"
                    y={isWaypoint ? '4' : '5'}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={isWaypoint ? '10' : '12'}
                  >
                    {isWaypoint ? '⛰️' : '🏡'}
                  </text>

                  {/* Student count badge */}
                  {!isWaypoint && reqCount > 0 && (
                    <g transform="translate(14, -14)">
                      <circle r="10" fill={examCount > 0 ? '#d97706' : '#0f766e'} stroke="#ffffff" strokeWidth="1.5" />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {reqCount}
                      </text>
                    </g>
                  )}

                  {/* Village Name */}
                  <text
                    x="0"
                    y={isWaypoint ? '28' : '34'}
                    textAnchor="middle"
                    fill="#f0fdf4"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {village.name}
                  </text>

                  {!isWaypoint && (
                    <text
                      x="0"
                      y="46"
                      textAnchor="middle"
                      fill={examCount > 0 ? '#fbbf24' : '#94a3b8'}
                      fontSize="8.5"
                      fontWeight={examCount > 0 ? '600' : 'normal'}
                    >
                      {reqCount} students {examCount > 0 ? `(${examCount} exam)` : ''}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Educational Institutions */}
            {institutions.map(inst => {
              return (
                <g key={inst.id} transform={`translate(${inst.coordinates.x}, ${inst.coordinates.y})`}>
                  <rect
                    x="-125"
                    y="-22"
                    width="250"
                    height="44"
                    rx="8"
                    fill="#042f2e"
                    stroke="#14b8a6"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="-2"
                    textAnchor="middle"
                    fill="#f0fdf4"
                    fontSize="11.5"
                    fontWeight="bold"
                  >
                    🏛️ {inst.name}
                  </text>
                  <text
                    x="0"
                    y="13"
                    textAnchor="middle"
                    fill="#99f6e4"
                    fontSize="9.5"
                  >
                    Classes start {inst.schoolStartTime} • {inst.type}
                  </text>
                </g>
              );
            })}

            {/* Vehicle Trip Status Badges */}
            {trips.map((trip, idx) => {
              const badgeY = 380 + idx * 28;
              const badgeX = 580;

              return (
                <g
                  key={trip.id}
                  transform={`translate(${badgeX}, ${badgeY})`}
                  onClick={() => onToggleTrip(trip.id)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                >
                  <title>{`Trip: ${trip.vehicleName} (${trip.capacity} seats). Status: ${trip.isCancelled ? 'CANCELLED: ' + trip.cancelReason : 'ACTIVE'}. Click to toggle.`}</title>
                  <rect
                    x="0"
                    y="0"
                    width="220"
                    height="24"
                    rx="4"
                    fill={trip.isCancelled ? '#450a0a' : '#042f2e'}
                    stroke={trip.isCancelled ? '#ef4444' : '#14b8a6'}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    fill={trip.isCancelled ? '#ef4444' : '#10b981'}
                  />
                  <text
                    x="24"
                    y="16"
                    fill="#ffffff"
                    fontSize="9.5"
                    fontWeight="600"
                  >
                    {trip.vehicleName.split('—')[0]} [{trip.capacity} seats]
                  </text>
                  <text
                    x="212"
                    y="16"
                    textAnchor="end"
                    fill={trip.isCancelled ? '#fca5a5' : '#5eead4'}
                    fontSize="8.5"
                    fontWeight="bold"
                  >
                    {trip.isCancelled ? 'DISABLED' : 'ACTIVE'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: '#94a3b8' }}>
          <em>Illustrative topological schematic. Vehicle icons and animations represent computed paths, not live GPS telematics. Click any corridor to toggle road conditions.</em>
        </div>
      </div>
    </div>
  );
};
