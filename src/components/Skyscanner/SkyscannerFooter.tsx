import React from 'react';
import { Bus, Shield, ExternalLink, Award } from 'lucide-react';

export const SkyscannerFooter: React.FC = () => {
  return (
    <footer className="skyscanner-footer">
      <div className="skyscanner-footer-inner">
        <div className="skyscanner-footer-grid">
          {/* Col 1 */}
          <div>
            <h4 className="footer-col-title">RouteLess Prototype</h4>
            <ul className="footer-links">
              <li><span>AI-Powered Rural Transport Challenge</span></li>
              <li><span>When a bus stops, learning should not</span></li>
              <li><span>Deterministic Heuristic Allocation</span></li>
              <li><span>Dijkstra Dynamic Shortest Path</span></li>
              <li><span>Zero Student PII Collection</span></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="footer-col-title">Mangaluru Network</h4>
            <ul className="footer-links">
              <li><span>Ganjimutt Valley (GANJ)</span></li>
              <li><span>Bajpe Plateau (BAJP)</span></li>
              <li><span>Gurupura Riverside (GURU)</span></li>
              <li><span>Polali Temple Junction (POLA)</span></li>
              <li><span>St. Aloysius PU College (Kodialbail)</span></li>
              <li><span>Karnataka (Govt) Polytechnic (Kadri)</span></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="footer-col-title">Crisis Operations</h4>
            <ul className="footer-links">
              <li><span>The Exam Day Crisis Simulation</span></li>
              <li><span>40% Surge Capacity Model</span></li>
              <li><span>Flooded Road Dynamic Detour (+8m)</span></li>
              <li><span>15-Minute Exam Arrival Buffer</span></li>
              <li><span>State A / State B / State C Audit</span></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="footer-col-title">Cloud & Security</h4>
            <ul className="footer-links">
              <li><span>Supabase PostgreSQL Integration</span></li>
              <li><span>Row Level Security (RLS) Enforced</span></li>
              <li><span>Atomic RPC Stored Procedures</span></li>
              <li><span>Local Demo Isolated Mode</span></li>
              <li><span>Vercel & GitHub Pages Deployed</span></li>
            </ul>
          </div>
        </div>

        <div className="skyscanner-footer-bottom">
          <div>
            <strong>RouteLess © 2026</strong> — Built for the <em>ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge</em>.
          </div>
          <div>
            <span style={{ color: '#ffb39e', marginRight: '14px' }}>
              ⚠️ Simulation — not a live transport service
            </span>
            <span>Mangaluru Rural Transit Corridor Prototype</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

