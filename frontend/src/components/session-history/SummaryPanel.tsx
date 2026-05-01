import { Download } from 'lucide-react';
import { SessionDetail } from '../../api/triageApi';

interface SummaryPanelProps {
  session: SessionDetail | null;
  showExportButton?: boolean;
  onExport?: () => void;
  showVitals?: boolean;
}

function formatDuration(seconds: number): string {
  return `${Math.round(seconds / 60)} min`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function getATSDescription(category: number | null): string {
  switch (category) {
    case 1: return 'Resuscitation — Immediate life threat';
    case 2: return 'Emergency — Within 10 min';
    case 3: return 'Urgent — Within 30 min';
    case 4: return 'Semi-urgent — Within 60 min';
    case 5: return 'Non-urgent — Within 120 min';
    default: return 'Not assigned';
  }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-[#F4F6F8] last:border-0">
      <h4 className="text-[10px] uppercase tracking-widest text-[#9E9C97] font-semibold mb-2">{title}</h4>
      {children}
    </div>
  );
}

export function SummaryPanel({
  session: detail,
  showExportButton = false,
  onExport,
  showVitals = false,
}: SummaryPanelProps) {
  if (!detail) return null;

  const { session, patient } = detail;
  const v = session.vitals;

  const vitals: [string, string][] = [
    ['Blood Pressure', v.bp_systolic != null && v.bp_diastolic != null ? `${v.bp_systolic}/${v.bp_diastolic} mmHg` : '—'],
    ['Heart Rate',     v.heart_rate        != null ? `${v.heart_rate} bpm`        : '—'],
    ['Temperature',    v.temperature       != null ? `${v.temperature} °F`        : '—'],
    ['Resp. Rate',     v.respiratory_rate  != null ? `${v.respiratory_rate} br/min` : '—'],
    ['SpO2',           v.spo2              != null ? `${v.spo2}%`                 : '—'],
  ];

  return (
    <div className="w-full bg-white rounded-lg border border-[#E0DED6] p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Session summary</h3>
        {showExportButton && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#185FA5] text-white rounded-md text-[12px] font-medium hover:bg-[#185FA5]/90 transition-colors"
          >
            <Download size={13} />
            Export PDF
          </button>
        )}
      </div>

      <Section title="Patient">
        <p className="text-[14px] font-medium text-[#1A1A1A]">{patient.full_name}</p>
        <p className="text-[12px] text-[#5F5E5A]">MRN: {patient.mrn}</p>
      </Section>

      <Section title="Timing">
        <p className="text-[13px] text-[#1A1A1A]">{formatDate(session.started_at)}</p>
        <p className="text-[12px] text-[#5F5E5A]">Duration: {formatDuration(session.duration_seconds)}</p>
      </Section>

      {showVitals && (
        <Section title="Vital signs">
          <div className="space-y-1.5">
            {vitals.map(([label, value]) => (
              <div key={label} className="flex justify-between text-[12px]">
                <span className="text-[#5F5E5A]">{label}</span>
                <span className="text-[#1A1A1A] font-medium">{value}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="ATS category">
        <div className="px-3 py-2 bg-[#D94F04]/10 rounded-lg">
          <p className="text-[14px] font-semibold text-[#1A1A1A]">
            {session.ats_category ? `Category ${session.ats_category}` : 'Not assigned'}
          </p>
          <p className="text-[11px] text-[#5F5E5A] mt-0.5">{getATSDescription(session.ats_category)}</p>
        </div>
      </Section>

    </div>
  );
}