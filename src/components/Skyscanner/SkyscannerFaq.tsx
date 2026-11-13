import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS_COL_1: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How does RouteLess allocate limited rural transport seats?',
    answer:
      'RouteLess runs a pure, deterministic greedy allocation heuristic. Requests are ordered by priority: first, students with imminent board examinations (requiring arrival at least 15 minutes prior to the exam bell), followed by regular curriculum attendance. The solver checks vehicle departure windows, road passability, and physical seat limits without manufacturing fake capacity.'
  },
  {
    id: 'faq-2',
    question: 'What happens when a government bus breaks down on an exam morning?',
    answer:
      'When a vehicle trip is cancelled (e.g. Bus 01 radiator failure or Bus 02 mechanical breakdown), RouteLess immediately frees up its timetable and reroutes surviving vehicles (Van 03 and Cruiser 04) to pick up stranded students along intersecting feeder nodes, prioritizing exam candidates.'
  },
  {
    id: 'faq-3',
    question: 'Why does RouteLess prioritize exam candidates with a 15-minute buffer?',
    answer:
      'State board examinations (Karnataka SSLC / PUC) enforce strict entry gates. Arriving at the exact bell time means students are turned away. RouteLess mandates a 15-minute arrival safety buffer before exam commencement (08:15 AM for an 08:30 AM paper), disqualifying buses arriving later as infeasible.'
  },
  {
    id: 'faq-4',
    question: 'How does Dijkstra dynamic routing discover bypasses during floods?',
    answer:
      'When a direct corridor is marked flooded (such as the Phalguni-Netravati valley road between Ganjimutt and Farangipete), the edge is assigned an infinite weight. The shortest-path engine traverses adjacent topological vertices to identify elevated bypasses (like the Adyar Ridge corridor), calculating accurate detour travel times (+8 minutes).'
  },
  {
    id: 'faq-5',
    question: 'Why does RouteLess show honest explanations for unmet demand?',
    answer:
      'In rural transport, fabricating false capacity or hiding stranded students leaves children stranded on roadsides. RouteLess provides transparent, actionable explanations for every unmet request: whether due to total capacity exhaustion, arrival time incompatibility, or impassable roads.'
  }
];

const FAQS_COL_2: FaqItem[] = [
  {
    id: 'faq-6',
    question: 'How does Supabase Cloud & Row Level Security protect students?',
    answer:
      'RouteLess operates in Dual-Mode: local storage demo mode by default, and real Supabase PostgreSQL when credentials are configured. Row Level Security (RLS) ensures students can only read and create their own requests (auth.uid()), while only authenticated coordinators in scenario_memberships have permission to cancel fleet trips or execute recovery protocols.'
  },
  {
    id: 'faq-7',
    question: 'What are the 4 simultaneous vectors in "The Exam Day Crisis"?',
    answer:
      'The Exam Day Crisis introduces: 1) Two government buses disabled simultaneously (Bus 01 and Bus 02); 2) A 40% student demand surge (+8 students, total 28); 3) Major valley road flooded (seg-ganji-far); 4) Imminent board examinations starting within two hours. The recovery solver reallocates remaining capacity to maximize on-time exam arrivals.'
  },
  {
    id: 'faq-8',
    question: 'Can coordinators manually adjust vehicle capacities or cancel trips?',
    answer:
      'Yes. Coordinators have real-time controls in the Fleet view to edit vehicle capacities (e.g., if a mini-bus has additional standing room or reduced seats) and toggle vehicle availability. Allocation metrics update dynamically in response.'
  },
  {
    id: 'faq-9',
    question: 'Is this connected to real live GPS or emergency transit?',
    answer:
      'No. RouteLess is a synthetic operational research prototype designed for demonstration and evaluation under the "ROUTELESS: THE LAST MILE — AI-Powered Rural Transportation Challenge". It operates on synthetic road models and fictional student records without live GPS tracking or emergency service affiliations.'
  },
  {
    id: 'faq-10',
    question: 'What institutions and rural villages are served in this corridor?',
    answer:
      'The corridor models rural Dakshina Kannada near Mangaluru: villages include Ganjimutt, Gurupura, Bajpe, Polali, Farangipete, and Mudipu; target institutions include St. Aloysius PU College (Kodialbail) and Karnataka (Govt) Polytechnic (Kadri Hills).'
  }
];

export const SkyscannerFaq: React.FC = () => {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-6': true
  });

  const toggleFaq = (id: string) => {
    setOpenIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section className="skyscanner-accordion-section">
      <h2 className="skyscanner-accordion-title">
        Transport Resilience & Allocation with RouteLess
      </h2>
      <p className="skyscanner-accordion-sub">
        Explore how our deterministic solver, flood-bypass routing, and Supabase security maintain educational continuity.
      </p>

      <div className="skyscanner-accordion-grid">
        {/* Column 1 */}
        <div>
          {FAQS_COL_1.map(faq => {
            const isOpen = Boolean(openIds[faq.id]);
            return (
              <div key={faq.id} className="skyscanner-faq-item">
                <button
                  type="button"
                  className="skyscanner-faq-header"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp size={18} color="#0770e3" />
                  ) : (
                    <ChevronDown size={18} color="#686974" />
                  )}
                </button>
                {isOpen && <p className="skyscanner-faq-body">{faq.answer}</p>}
              </div>
            );
          })}
        </div>

        {/* Column 2 */}
        <div>
          {FAQS_COL_2.map(faq => {
            const isOpen = Boolean(openIds[faq.id]);
            return (
              <div key={faq.id} className="skyscanner-faq-item">
                <button
                  type="button"
                  className="skyscanner-faq-header"
                  onClick={() => toggleFaq(faq.id)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp size={18} color="#0770e3" />
                  ) : (
                    <ChevronDown size={18} color="#686974" />
                  )}
                </button>
                {isOpen && <p className="skyscanner-faq-body">{faq.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
