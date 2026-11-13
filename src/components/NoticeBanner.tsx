import React from 'react';
import { AlertCircle } from 'lucide-react';

export const NoticeBanner: React.FC = () => {
  return (
    <div className="notice-banner" role="alert">
      <AlertCircle size={15} />
      <span>
        <strong>Simulation — not a live transport service.</strong> Synthetic operational research model for rural education transit resilience. No live GPS, government agency affiliation, or actual student PII.
      </span>
    </div>
  );
};
