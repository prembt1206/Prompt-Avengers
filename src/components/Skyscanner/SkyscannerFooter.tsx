import React from 'react';
import { Bus, Shield } from 'lucide-react';

export const SkyscannerFooter: React.FC = () => {
  return (
    <footer
      style={{
        background: '#05203c',
        color: '#ffffff',
        padding: '24px 20px',
        marginTop: '36px',
        borderTop: '1px solid #0b2a4a',
        textAlign: 'center'
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#0770e3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Bus size={14} />
          </div>
          <strong style={{ fontSize: '0.95rem', color: '#ffffff' }}>RouteLess</strong>
          <span style={{ fontSize: '0.8rem', color: '#a1b0cb' }}>— When a bus stops, learning should not.</span>
        </div>

        <p style={{ fontSize: '0.75rem', color: '#8f929d', margin: '4px 0 10px 0' }}>
          Built for the <em>ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge</em>.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 123, 89, 0.15)', border: '1px solid rgba(255, 123, 89, 0.3)', color: '#ffb39e', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.725rem' }}>
          <span>⚠️ Simulation — not a live transport service. Fictional Mangaluru rural network.</span>
        </div>
      </div>
    </footer>
  );
};
