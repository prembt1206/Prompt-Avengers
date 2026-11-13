import React from 'react';
import { Village, Institution, TransportConnection, VehicleTrip, StudentRequest } from '../../types';
import { AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';

interface NetworkMapSvgProps {
  villages: Village[];
  institutions: Institution[];
  connections: TransportConnection[];
  trips: VehicleTrip[];
  requests: StudentRequest[];
  onToggleConnection: (connectionId: string) => void;
  onToggleTrip: (tripId: string) => void;
}

export const NetworkMapSvg: React.FC<NetworkMapSvgProps> = ({
  villages,
  institutions,
  connections,
  trips,
  requests,
  onToggleConnection,
  onToggleTrip
}) => {
  // Build lookup of node coordinates
  const nodeCoords = new Map<string, { x: number; y: number; name: string }>();
  villages.forEach(v => nodeCoords.set(v.id, { x: v.coordinates.x, y: v.coordinates.y, name: v.name }));
  institutions.forEach(i => nodeCoords.set(i.id, { x: i.coordinates.x, y: i.coordinates.y, name: i.name }));

  // Count requests per origin
  const requestCountByVillage = new Map<string, number>();
  requests.forEach(r => {
    requestCountByVillage.set(r.originVillageId, (requestCountByVillage.get(r.originVillageId) || 0) + 1);
  });

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-title">
          <ShieldAlert size={18} className="text-primary" />
          Interactive Rural Transit Network Topology
        </h3>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 12, height: 4, background: '#38bdf8', display: 'inline-block', borderRadius: 2 }}></span>
            Active Corridor
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 12, height: 4, background: '#ef4444', display: 'inline-block', borderRadius: 2, border: '1px dashed red' }}></span>
            Blocked Corridor (Click to Toggle)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span>
            Active Vehicle
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 10, height: 10, background: '#ef4444', borderRadius: '50%', display: 'inline-block' }}></span>
            Cancelled Vehicle
          </span>
        </div>
      </div>

      <div className="card-body" style={{ background: '#0f172a', padding: '16px', borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '880px', margin: '0 auto' }}>
          <svg
            viewBox="0 0 820 490"
            className="network-svg"
            style={{ width: '100%', height: 'auto', overflow: 'visible' }}
          >
            {/* Background grid pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="820" height="490" fill="url(#grid)" rx="8" />

            {/* Road Connections / Edges */}
            {connections.map(conn => {
              const from = nodeCoords.get(conn.fromId);
              const to = nodeCoords.get(conn.toId);
              if (!from || !to) return null;

              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;

              return (
                <g
                  key={conn.id}
                  onClick={() => onToggleConnection(conn.id)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                >
                  <title>{`${conn.fromName} ↔ ${conn.toName}: ${conn.distanceKm}km, ${conn.travelMinutes}m (${conn.isBlocked ? 'BLOCKED: ' + conn.blockedReason : 'PASSABLE'}). Click to toggle block status.`}</title>
                  {/* Invisible wide line for easier clicking */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="transparent"
                    strokeWidth="20"
                  />
                  {/* Road line */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={conn.isBlocked ? '#ef4444' : '#38bdf8'}
                    strokeWidth={conn.isBlocked ? '4' : '2.5'}
                    strokeDasharray={conn.isBlocked ? '6,6' : undefined}
                    opacity={conn.isBlocked ? 0.9 : 0.65}
                  />

                  {/* Distance / Status badge pill */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-38"
                      y="-12"
                      width="76"
                      height="24"
                      rx="12"
                      fill={conn.isBlocked ? '#7f1d1d' : '#1e293b'}
                      stroke={conn.isBlocked ? '#f87171' : '#475569'}
                      strokeWidth="1.5"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={conn.isBlocked ? '#fca5a5' : '#cbd5e1'}
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {conn.isBlocked ? 'BLOCKED' : `${conn.distanceKm}km • ${conn.travelMinutes}m`}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Village Nodes */}
            {villages.map(village => {
              const reqCount = requestCountByVillage.get(village.id) || 0;
              return (
                <g key={village.id} transform={`translate(${village.coordinates.x}, ${village.coordinates.y})`}>
                  <circle
                    r="24"
                    fill="#1e293b"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />
                  {/* Village icon circle */}
                  <circle
                    r="8"
                    fill="#0284c7"
                  />
                  {/* Student request count badge */}
                  <g transform="translate(14, -14)">
                    <circle r="10" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
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
                  {/* Village Name */}
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
                    fontSize="8.5"
                  >
                    {reqCount} requests
                  </text>
                </g>
              );
            })}

            {/* Institution Nodes */}
            {institutions.map(inst => {
              return (
                <g key={inst.id} transform={`translate(${inst.coordinates.x}, ${inst.coordinates.y})`}>
                  <rect
                    x="-120"
                    y="-22"
                    width="240"
                    height="44"
                    rx="8"
                    fill="#1e1b4b"
                    stroke="#818cf8"
                    strokeWidth="2"
                  />
                  <text
                    x="0"
                    y="-2"
                    textAnchor="middle"
                    fill="#e0e7ff"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    🏛️ {inst.name}
                  </text>
                  <text
                    x="0"
                    y="13"
                    textAnchor="middle"
                    fill="#a5b4fc"
                    fontSize="9.5"
                  >
                    Starts {inst.schoolStartTime} • {inst.type}
                  </text>
                </g>
              );
            })}

            {/* Vehicle Trip Status Badges (Clickable to toggle cancel) */}
            {trips.map((trip, idx) => {
              // Position trip cards in corner or alongside routes
              const badgeY = 390 + idx * 30;
              const badgeX = 580;

              return (
                <g
                  key={trip.id}
                  transform={`translate(${badgeX}, ${badgeY})`}
                  onClick={() => onToggleTrip(trip.id)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                >
                  <title>{`Trip: ${trip.vehicleName} (${trip.capacity} seats). Status: ${trip.isCancelled ? 'CANCELLED: ' + trip.cancelReason : 'ACTIVE'}. Click to toggle cancellation.`}</title>
                  <rect
                    x="0"
                    y="0"
                    width="220"
                    height="26"
                    rx="4"
                    fill={trip.isCancelled ? '#450a0a' : '#064e3b'}
                    stroke={trip.isCancelled ? '#ef4444' : '#10b981'}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="14"
                    cy="13"
                    r="5"
                    fill={trip.isCancelled ? '#ef4444' : '#10b981'}
                  />
                  <text
                    x="26"
                    y="17"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {trip.vehicleName.split('—')[0]} [{trip.capacity} seats]
                  </text>
                  <text
                    x="210"
                    y="17"
                    textAnchor="end"
                    fill={trip.isCancelled ? '#fca5a5' : '#a7f3d0'}
                    fontSize="9"
                    fontWeight="bold"
                  >
                    {trip.isCancelled ? 'CANCELLED' : 'ACTIVE'}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
          💡 <em>Tip: Click any road corridor above to simulate a wash-out/blockage, or click any vehicle card in the fleet panel to simulate mechanical breakdown.</em>
        </div>
      </div>
    </div>
  );
};

