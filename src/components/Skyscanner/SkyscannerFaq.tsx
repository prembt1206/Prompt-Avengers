import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How does RouteLess allocate limited rural transport seats?',
    answer:
      'RouteLess runs a pure, deterministic greedy allocation heuristic. Imminent board examination candidates are prioritized first (with a mandatory 15-minute arrival safety buffer before exam commencement), followed by regular curriculum attendance. The solver checks vehicle departure windows, road passability, and physical seat limits without manufacturing fake capacity.'
  },
  {
    id: 'faq-2',
    question: 'What happens during "The Exam Day Crisis"?',
    answer:
      'The Exam Day Crisis introduces 4 simultaneous disruptions: 1) Two government buses disabled (Bus 01 and Bus 02); 2) A 40% student demand surge (+8 students, total 28); 3) Major valley road flooded (seg-ganji-far); 4) Imminent board examinations starting within two hours. The recovery solver reallocates remaining capacity to maximize on-time exam arrivals.'
  },
  {
    id: 'faq-3',
    question: 'How does Dijkstra dynamic routing discover flood bypasses?',
    answer:
      'When the direct valley road between Ganjimutt and Farangipete is submerged, the edge weight is set to infinity. The shortest-path engine traverses adjacent topological vertices to identify the elevated Adyar Ridge bypass (+8 minutes detour), updating passenger arrival times dynamically.'
  },
  {
    id: 'faq-4',
    question: 'Why does RouteLess show honest explanations for unmet demand?',
    answer:
      'In rural transport, fabricating false capacity leaves students stranded on roadsides. RouteLess provides transparent, actionable explanations for every unmet request: whether due to total capacity exhaustion, arrival time incompatibility, or impassable roads.'
  },
  {
    id: 'faq-5',
    question: 'How does Supabase Cloud & Row Level Security protect students?',
    answer:
      'RouteLess operates in Dual-Mode: local storage demo mode by default, and real Supabase PostgreSQL when credentials are configured. Row Level Security (RLS) ensures students can only read and create their own requests (auth.uid()), while only authenticated coordinators have permission to cancel fleet trips or execute recovery protocols.'
  }
];

export const SkyscannerFaq: React.FC = () => {
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true
  });

  const toggleFaq = (id: string) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section
      style={{
        background: '#ffffff',
        border: '1px solid #e2e4e8',
        borderRadius: '12px',
        padding: '18px 24px',
        marginTop: '28px',
        boxShadow: '0 1px 3px rgba(5, 32, 60, 0.06)'
      }}
    >
      <button
        type="button"
        onClick={() => setIsSectionOpen(!isSectionOpen)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          padding: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HelpCircle size={18} color="#0770e3" />
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#111215' }}>
            Frequently Asked Operational Questions (FAQ)
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: '#0770e3', fontWeight: 600 }}>
          <span>{isSectionOpen ? 'Collapse FAQ' : 'View Answers'}</span>
          {isSectionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isSectionOpen && (
        <div style={{ marginTop: '18px', borderTop: '1px solid #e2e4e8', paddingTop: '14px' }}>
          {FAQS.map(faq => {
            const isOpen = Boolean(openIds[faq.id]);
            return (
              <div key={faq.id} style={{ borderBottom: '1px solid #f1f2f6', padding: '12px 0' }}>
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: isOpen ? '#0770e3' : '#111215',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} color="#8f929d" />}
                </button>
                {isOpen && (
                  <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.6, marginTop: '6px', margin: '6px 0 0 0' }}>
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
