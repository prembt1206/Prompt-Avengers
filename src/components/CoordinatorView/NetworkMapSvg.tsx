import React, { useState } from 'react';
import {
  Village,
  Institution,
  TransportConnection,
  VehicleTrip,
  StudentRequest,
  AllocationResult
} from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Bus,
  School,
  MapPin,
  Waves,
  Mountain,
  ShieldCheck,
  Ban
} from 'lucide-react';

interface NetworkMapSvgProps {
  villages: Village[];
  institutions: Institution[];
  connections: TransportConnection[];
  trips: VehicleTrip[];
  requests: StudentRequest[];
  allocationResult?: AllocationResult | null;
  onToggleConnection: (connectionId: string) => void;
  onToggleTrip: (tripId: string) => void;
}

export const NetworkMapSvg: React.FC<NetworkMapSvgProps> = ({
  villages,
  institutions,
  connections,
  trips,
  requests,
  allocationResult,
  onToggleConnection,
  onToggleTrip
}) => {
  const [hoveredEntity, setHoveredEntity] = useState<{
    title: string;
    description: string;
    details?: string;
  } | null>(null);

  // Build coordinate lookup
  const nodeCoords = new Map<string, { x: number; y: number; name: string }>();
  villages.forEach(v => nodeCoords.set(v.id, { x: v.coordinates.x, y: v.coordinates.y, name: v.name }));
  institutions.forEach(i => nodeCoords.set(i.id, { x: i.coordinates.x, y: i.coordinates.y, name: i.name }));

  // Demand count per village
  const requestCountByVillage = new Map<string, number>();
  requests.forEach(r => {
    requestCountByVillage.set(r.originVillageId, (requestCountByVillage.get(r.originVillageId) || 0) + 1);
  });

  // Unmet count per village from solver
  const unmetCountByVillage = new Map<string, number>();
  allocationResult?.unmetRequests.forEach(u => {
    unmetCountByVillage.set(u.originVillageId, (unmetCountByVillage.get(u.originVillageId) || 0) + 1);
  });

  // Blocked connections count
  const blockedCount = connections.filter(c => c.isBlocked).length;
  const breakdownCount = trips.filter(t => t.isCancelled).length;

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      {/* Map Header */}
      <div
        className="card-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} className="text-primary" />
          <h3 className="card-title" style={{ margin: 0 }}>
            Interactive Rural Transit Network Topology (SVG Schematic)
          </h3>
          <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
            Live Topological Model
          </span>
        </div>

        {/* Status Indicators */}
        <div style={{ display: 'flex', gap: '14px', fontSize: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 4, background: '#38bdf8', display: 'inline-block', borderRadius: 2 }} />
            Passable Road
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 12, height: 4, background: '#ef4444', display: 'inline-block', borderRadius: 2, border: '1px dashed red' }} />
            Blocked Road (Click to Toggle)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 10, height: 10, background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
            Active Bus
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }} />
            Cancelled / Breakdown
          </span>
        </div>
      </div>

      {/* Disruption Feedback Banner */}
      {(blockedCount > 0 || breakdownCount > 0) && (
        <div
          style={{
            background: '#450a0a',
            borderBottom: '1px solid #7f1d1d',
            color: '#fca5a5',
            padding: '8px 16px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={15} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span>
              <b>Network Disruptions Detected:</b>{' '}
              {blockedCount > 0 && `${blockedCount} corridor(s) severed. `}
              {breakdownCount > 0 && `${breakdownCount} vehicle(s) disabled. `}
              Affected students are honestly flagged as unmet demand until recovery is executed.
            </span>
          </div>
          <span className="badge badge-danger">Topology Severed</span>
        </div>
      )}

      {/* SVG Canvas Container */}
      <div className="card-body" style={{ background: '#090d16', padding: '16px', position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '880px', margin: '0 auto' }}>
          <svg
            viewBox="0 0 840 500"
            className="network-svg"
            style={{ width: '100%', height: 'auto', overflow: 'visible', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
          >
            <defs>
              {/* Background blueprint grid */}
              <pattern id="topologyGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#131d2e" strokeWidth="0.8" />
              </pattern>

              {/* Directional arrow marker */}
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8" opacity="0.6" />
              </marker>

              {/* Pulsing glow filter for active vehicles */}
              <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Base Background */}
            <rect width="840" height="500" fill="url(#topologyGrid)" rx="8" />

            {/* ============================================================== */}
            {/* 1. ROAD CORRIDOR CONNECTIONS (EDGES) */}
            {/* ============================================================== */}
            {connections.map(conn => {
              const from = nodeCoords.get(conn.fromId);
              const to = nodeCoords.get(conn.toId);
              if (!from || !to) return null;

              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              const isBlocked = conn.isBlocked;

              return (
                <g
                  key={conn.id}
                  onClick={() => onToggleConnection(conn.id)}
                  onMouseEnter={() =>
                    setHoveredEntity({
                      title: `${conn.fromName} ↔ ${conn.toName}`,
                      description: `${conn.distanceKm} km · ${conn.travelMinutes} mins travel time · Road Type: ${conn.roadType}`,
                      details: isBlocked
                        ? `BLOCKED: ${conn.blockedReason || 'Impassable causeway/obstruction'}. Click to reopen.`
                        : 'Status: Passable. Click to simulate road obstruction.'
                    })
                  }
                  onMouseLeave={() => setHoveredEntity(null)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                >
                  <title>{`${conn.fromName} ↔ ${conn.toName}: ${conn.distanceKm}km. ${isBlocked ? 'BLOCKED' : 'PASSABLE'}. Click to toggle.`}</title>

                  {/* Wide invisible line for effortless click target */}
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth="22" />

                  {/* Shadow road track */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isBlocked ? '#450a0a' : '#0f2942'}
                    strokeWidth="7"
                    strokeLinecap="round"
                  />

                  {/* Operational / Blocked road line */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={isBlocked ? '#ef4444' : '#38bdf8'}
                    strokeWidth={isBlocked ? '3.5' : '2.5'}
                    strokeDasharray={isBlocked ? '6,6' : undefined}
                    opacity={isBlocked ? 1.0 : 0.75}
                    strokeLinecap="round"
                  />

                  {/* Midpoint Status / Distance Badge */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-42"
                      y="-12"
                      width="84"
                      height="24"
                      rx="12"
                      fill={isBlocked ? '#7f1d1d' : '#1e293b'}
                      stroke={isBlocked ? '#ef4444' : '#3b82f6'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isBlocked ? '#fca5a5' : '#e2e8f0'}
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {isBlocked ? '⛔ BLOCKED' : `${conn.distanceKm}km · ${conn.travelMinutes}m`}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* ============================================================== */}
            {/* 2. VILLAGE HAMLET NODES */}
            {/* ============================================================== */}
            {villages.map(village => {
              const reqCount = requestCountByVillage.get(village.id) || 0;
              const unmet = unmetCountByVillage.get(village.id) || 0;
              const hasUnmet = unmet > 0;

              // Check connectivity badge color
              let nodeBorderColor = '#38bdf8';
              let badgeFill = '#1e293b';
              if (village.connectivityType === 'Vulnerable River Crossing') {
                nodeBorderColor = '#f59e0b';
                badgeFill = '#451a03';
              } else if (hasUnmet) {
                nodeBorderColor = '#ef4444';
              }

              return (
                <g
                  key={village.id}
                  transform={`translate(${village.coordinates.x}, ${village.coordinates.y})`}
                  onMouseEnter={() =>
                    setHoveredEntity({
                      title: village.name,
                      description: `${village.panchayat} · Connectivity: ${village.connectivityType}`,
                      details: `Demand: ${reqCount} registered students (${unmet} unmet/stranded)`
                    })
                  }
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  {/* Pulsing ring if village is affected by unmet demand */}
                  {hasUnmet && (
                    <circle
                      r="32"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      strokeDasharray="4,4"
                      opacity="0.8"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    r="24"
                    fill={badgeFill}
                    stroke={nodeBorderColor}
                    strokeWidth="2.5"
                  />

                  {/* Inner glyph */}
                  <text x="0" y="5" textAnchor="middle" fontSize="14">
                    {village.connectivityType === 'Vulnerable River Crossing' ? '🌊' : '🏘️'}
                  </text>

                  {/* Student Demand Badge (Top Right) */}
                  <g transform="translate(16, -14)">
                    <circle
                      r="10"
                      fill={hasUnmet ? '#ef4444' : '#059669'}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {reqCount}
                    </text>
                  </g>

                  {/* Village Name and Panchayat */}
                  <text
                    x="0"
                    y="36"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11.5"
                    fontWeight="700"
                  >
                    {village.name}
                  </text>
                  <text
                    x="0"
                    y="48"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="8"
                  >
                    {village.connectivityType}
                  </text>
                </g>
              );
            })}

            {/* ============================================================== */}
            {/* 3. EDUCATIONAL INSTITUTION NODES */}
            {/* ============================================================== */}
            {institutions.map(inst => {
              const isPolytechnic = inst.id === 'inst-kpt';

              return (
                <g
                  key={inst.id}
                  transform={`translate(${inst.coordinates.x}, ${inst.coordinates.y})`}
                  onMouseEnter={() =>
                    setHoveredEntity({
                      title: inst.name,
                      description: `${inst.address} · Start Time: ${inst.schoolStartTime}`,
                      details: `Type: ${inst.type} · Code: ${inst.code}`
                    })
                  }
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  <rect
                    x="-125"
                    y="-24"
                    width="250"
                    height="48"
                    rx="8"
                    fill={isPolytechnic ? '#1e1b4b' : '#142a42'}
                    stroke={isPolytechnic ? '#a5b4fc' : '#38bdf8'}
                    strokeWidth="2"
                  />

                  <text
                    x="0"
                    y="-3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="11.5"
                    fontWeight="bold"
                  >
                    {isPolytechnic ? '⚙️ ' : '🎓 '}{inst.name}
                  </text>

                  <text
                    x="0"
                    y="13"
                    textAnchor="middle"
                    fill={isPolytechnic ? '#c7d2fe' : '#bae6fd'}
                    fontSize="9.5"
                  >
                    Bell: {inst.schoolStartTime} · {inst.type}
                  </text>
                </g>
              );
            })}

            {/* ============================================================== */}
            {/* 4. ACTIVE & CANCELLED VEHICLE INDICATORS */}
            {/* ============================================================== */}
            {trips.map((trip, idx) => {
              const badgeY = 385 + idx * 34;
              const badgeX = 575;
              const isCancelled = trip.isCancelled;

              return (
                <g
                  key={trip.id}
                  transform={`translate(${badgeX}, ${badgeY})`}
                  onClick={() => onToggleTrip(trip.id)}
                  onMouseEnter={() =>
                    setHoveredEntity({
                      title: trip.vehicleName,
                      description: `Driver: ${trip.driverName} · Capacity: ${trip.capacity} seats · Status: ${isCancelled ? 'CANCELLED' : 'ACTIVE'}`,
                      details: `Click to ${isCancelled ? 'restore vehicle to active service' : 'simulate vehicle breakdown'}!`
                    })
                  }
                  onMouseLeave={() => setHoveredEntity(null)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                >
                  <title>{`Trip: ${trip.vehicleName}. Click to toggle cancellation.`}</title>

                  <rect
                    x="0"
                    y="0"
                    width="240"
                    height="28"
                    rx="6"
                    fill={isCancelled ? '#450a0a' : '#0f172a'}
                    stroke={isCancelled ? '#ef4444' : '#10b981'}
                    strokeWidth="1.5"
                  />

                  <circle
                    cx="15"
                    cy="14"
                    r="5"
                    fill={isCancelled ? '#ef4444' : '#10b981'}
                  />

                  <text
                    x="28"
                    y="18"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {trip.vehicleName.split('—')[0].trim()} [{trip.capacity} seats]
                  </text>

                  <text
                    x="230"
                    y="18"
                    textAnchor="end"
                    fill={isCancelled ? '#fca5a5' : '#86efac'}
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {isCancelled ? 'BREAKDOWN' : 'ACTIVE'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Live Hover Information Strip */}
        <div
          style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '8px 14px',
            marginTop: '12px',
            fontSize: '0.8rem',
            color: '#cbd5e1',
            minHeight: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          {hoveredEntity ? (
            <div>
              <strong style={{ color: '#38bdf8' }}>{hoveredEntity.title}: </strong>
              <span>{hoveredEntity.description} </span>
              {hoveredEntity.details && (
                <span style={{ color: '#a5b4fc', fontStyle: 'italic' }}>— {hoveredEntity.details}</span>
              )}
            </div>
          ) : (
            <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} className="text-primary" />
              <span>
                <b>Interactive Controls:</b> Click any road corridor to toggle road closure, or click any vehicle card in the lower right to trigger a breakdown.
              </span>
            </div>
          )}

          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Topological Rural Network Schematic
          </div>
        </div>
      </div>
    </div>
  );
};
