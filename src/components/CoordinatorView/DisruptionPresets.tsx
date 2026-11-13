import React from 'react';
import { AlertTriangle, Wrench, Waves, Zap, Check, Users } from 'lucide-react';
import { DISRUPTION_SCENARIOS, DisruptionScenario } from '../../services/simulationScenarios';
import { VehicleTrip, TransportConnection, StudentRequest } from '../../types';

interface DisruptionPresetsProps {
  trips: VehicleTrip[];
  connections: TransportConnection[];
  requests?: StudentRequest[];
  onApplyScenario: (
    updatedTrips: VehicleTrip[],
    updatedConnections: TransportConnection[],
    scenarioName: string,
    updatedRequests?: StudentRequest[]
  ) => void;
}

export const DisruptionPresets: React.FC<DisruptionPresetsProps> = ({
  trips,
  connections,
  requests = [],
  onApplyScenario
}) => {
  const handleSelectScenario = (scenario: DisruptionScenario) => {
    const { updatedTrips, updatedConnections, updatedRequests } = scenario.apply(trips, connections, requests);
    onApplyScenario(updatedTrips, updatedConnections, scenario.name, updatedRequests);
  };

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'clear-all':
        return <Check size={16} />;
      case 'bus-breakdown':
        return <Wrench size={16} />;
      case 'causeway-flood':
        return <Waves size={16} />;
      case 'cascading-both':
        return <Zap size={16} />;
      case 'demand-surge':
        return <Users size={16} />;
      default:
        return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="card" style={{ background: '#0f172a', border: '1px solid #1e293b', marginBottom: '20px' }}>
      <div className="card-header" style={{ background: '#1e293b', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} className="text-warning" />
          <h3 className="card-title" style={{ fontSize: '0.9rem', margin: 0, color: '#f8fafc' }}>
            Predefined Demonstration Scenarios (One-Click State Triggers)
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          Configures real application network state for live evaluation
        </span>
      </div>

      <div className="card-body" style={{ padding: '14px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
          {DISRUPTION_SCENARIOS.map(sc => {
            const isClear = sc.id === 'clear-all';
            const isSurge = sc.id === 'demand-surge';

            let iconColor = '#f59e0b';
            if (isClear) iconColor = '#10b981';
            else if (isSurge) iconColor = '#38bdf8';
            else if (sc.id === 'cascading-both') iconColor = '#ef4444';

            return (
              <button
                key={sc.id}
                type="button"
                className="btn btn-secondary"
                onClick={() => handleSelectScenario(sc)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  padding: '10px 12px',
                  border: isClear ? '1px solid #059669' : isSurge ? '1px solid #0284c7' : '1px solid #334155',
                  background: isClear ? '#064e3b20' : '#1e293b',
                  height: '100%',
                  borderRadius: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginBottom: '4px' }}>
                  <span style={{ color: iconColor, flexShrink: 0 }}>
                    {getScenarioIcon(sc.id)}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#f8fafc' }}>
                    {sc.name}
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, lineHeight: 1.35 }}>
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
