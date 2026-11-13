import React from 'react';
import { AlertTriangle, Wrench, Waves, Zap, Check } from 'lucide-react';
import { DISRUPTION_SCENARIOS, DisruptionScenario } from '../../services/simulationScenarios';
import { VehicleTrip, TransportConnection } from '../../types';

interface DisruptionPresetsProps {
  trips: VehicleTrip[];
  connections: TransportConnection[];
  onApplyScenario: (updatedTrips: VehicleTrip[], updatedConnections: TransportConnection[], scenarioName: string) => void;
}

export const DisruptionPresets: React.FC<DisruptionPresetsProps> = ({
  trips,
  connections,
  onApplyScenario
}) => {
  const handleSelectScenario = (scenario: DisruptionScenario) => {
    const { updatedTrips, updatedConnections } = scenario.apply(trips, connections);
    onApplyScenario(updatedTrips, updatedConnections, scenario.name);
  };

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'bus-breakdown':
        return <Wrench size={14} />;
      case 'causeway-flood':
        return <Waves size={14} />;
      case 'cascading-both':
        return <Zap size={14} />;
      case 'clear-all':
        return <Check size={14} />;
      default:
        return <AlertTriangle size={14} />;
    }
  };

  return (
    <div className="card" style={{ background: '#f8fafc', border: '1px solid #cbd5e1' }}>
      <div className="card-header" style={{ background: '#f1f5f9', padding: '10px 16px' }}>
        <h3 className="card-title" style={{ fontSize: '0.9rem' }}>
          <AlertTriangle size={16} className="text-warning" />
          Disruption Simulator & Quick Scenarios
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>One-click preset triggers for core demo flow</span>
      </div>
      <div className="card-body" style={{ padding: '12px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {DISRUPTION_SCENARIOS.map(sc => (
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
                border: sc.id === 'clear-all' ? '1px solid #94a3b8' : '1px solid #cbd5e1',
                background: sc.id === 'clear-all' ? '#ffffff' : '#ffffff',
                height: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', marginBottom: '4px' }}>
                <span style={{ color: sc.id === 'clear-all' ? '#10b981' : '#d97706' }}>
                  {getScenarioIcon(sc.id)}
                </span>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{sc.name}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, lineHeight: 1.3 }}>
                {sc.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

