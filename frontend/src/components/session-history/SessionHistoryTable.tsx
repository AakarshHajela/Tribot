// ===== SHARED COMPONENT =====
import { Fragment, useState } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { SessionDetail } from '../../api/triageApi';
import { TranscriptPanel } from './TranscriptPanel';
import { SummaryPanel } from './SummaryPanel';

export interface SessionRow {
  session_id: string;
  started_at: string;
  patient_name: string;
  mrn: string;
  patient_language: string;
  ats_category: number | null;
  duration_seconds: number | null;
  provider_name?: string | null;
}

interface SessionHistoryTableProps {
  items: SessionRow[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  expandedId: string | null;
  expandedDetail: SessionDetail | null;
  onToggleExpand: (id: string) => void;
  isLoadingDetail?: boolean;
  showDeleteButton?: boolean;
  onDelete?: (id: string) => void;
  showExportColumn?: boolean;
  onExportRow?: (id: string, patientName: string, e: React.MouseEvent) => void;
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

/* Accordion content — tab switcher on mobile, side-by-side on md+ */
function AccordionContent({
  expandedDetail,
  isLoadingDetail,
  expandedId,
  items,
  showExportButton,
  onExport,
  showVitals,
  totalCols,
}: {
  expandedDetail: SessionDetail | null;
  isLoadingDetail: boolean;
  expandedId: string | null;
  items: SessionRow[];
  showExportButton?: boolean;
  onExport?: () => void;
  showVitals?: boolean;
  totalCols: number;
}) {
  const [mobileTab, setMobileTab] = useState<'transcript' | 'summary'>('transcript');

  const currentItem = items.find((i) => i.session_id === expandedId);

  return (
    <tr>
      <td colSpan={totalCols} className="bg-[#F4F6F8] p-0">
        <div className="p-3 md:p-4">
          {isLoadingDetail && (
            <div className="py-6 text-center text-[13px] text-[#5F5E5A]">Loading session…</div>
          )}
          {!isLoadingDetail && !expandedDetail && (
            <div className="py-6 text-center text-[13px] text-[#A32D2D]">Could not load session detail.</div>
          )}

          {!isLoadingDetail && expandedDetail && (
            <>
              {/* Mobile: tab switcher */}
              <div className="flex md:hidden gap-1 mb-3">
                {(['transcript', 'summary'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMobileTab(tab)}
                    className={`flex-1 py-2 rounded-lg text-[12px] font-medium capitalize transition-colors ${
                      mobileTab === tab
                        ? 'bg-white text-[#185FA5] shadow-sm border border-[#E0DED6]'
                        : 'text-[#5F5E5A] hover:text-[#1A1A1A]'
                    }`}
                  >
                    {tab === 'transcript' ? 'Transcript' : 'Summary'}
                  </button>
                ))}
              </div>

              {/* Mobile: single panel */}
              <div className="md:hidden">
                {mobileTab === 'transcript' ? (
                  <TranscriptPanel
                    messages={expandedDetail.messages}
                    clinicianName={currentItem?.provider_name ?? undefined}
                    patientName={currentItem?.patient_name}
                  />
                ) : (
                  <SummaryPanel
                    session={expandedDetail}
                    showExportButton={showExportButton}
                    onExport={onExport}
                    showVitals={showVitals}
                  />
                )}
              </div>

              {/* Desktop: side by side */}
              <div className="hidden md:flex gap-4">
                <TranscriptPanel
                  messages={expandedDetail.messages}
                  clinicianName={currentItem?.provider_name ?? undefined}
                  patientName={currentItem?.patient_name}
                />
                <SummaryPanel
                  session={expandedDetail}
                  showExportButton={showExportButton}
                  onExport={onExport}
                  showVitals={showVitals}
                />
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export function SessionHistoryTable({
  items,
  searchQuery,
  onSearchChange,
  expandedId,
  expandedDetail,
  onToggleExpand,
  isLoadingDetail = false,
  showDeleteButton = false,
  onDelete,
  showExportColumn = false,
  onExportRow,
  showExportButton = false,
  onExport,
  showVitals = false,
}: SessionHistoryTableProps) {
  const totalCols = 6 + (showExportColumn ? 1 : 0) + (showDeleteButton ? 1 : 0);

  return (
    <>
      <div className="flex justify-end mb-4">
        <input
          type="text"
          placeholder="Search patient name, MRN…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-[36px] px-3 rounded-lg border border-[#E0DED6] text-[13px] focus:outline-none focus:ring-2 focus:ring-[#185FA5] w-full sm:w-[220px]"
        />
      </div>

      <table className="w-full">
        <thead className="border-b border-[#E0DED6] bg-[#F4F6F8]">
          <tr>
            {/* Date — always visible */}
            <th className="text-left px-2 md:px-4 py-3 text-[11px] uppercase text-[#5F5E5A] font-medium">
              Date/time
            </th>
            {/* Patient — always visible */}
            <th className="text-left px-2 md:px-4 py-3 text-[11px] uppercase text-[#5F5E5A] font-medium">
              Patient
            </th>
            {/* MRN — md+ */}
            <th className="hidden md:table-cell text-left px-4 py-3 text-[11px] uppercase text-[#5F5E5A] font-medium">
              MRN
            </th>
            {/* Language — lg+ */}
            <th className="hidden lg:table-cell text-left px-4 py-3 text-[11px] uppercase text-[#5F5E5A] font-medium">
              Language
            </th>
            {/* ATS — always visible */}
            <th className="text-left px-2 md:px-4 py-3 text-[11px] uppercase text-[#5F5E5A] font-medium">
              ATS
            </th>
            {/* Duration — sm+ */}
            <th className="hidden sm:table-cell text-left px-2 md:px-4 py-3 text-[11px] uppercase text-[#5F5E5A] font-medium">
              Duration
            </th>
            {showExportColumn && (
              <th className="hidden sm:table-cell text-left px-2 md:px-4 py-3 text-[11px] uppercase text-[#5F5E5A] font-medium">
                Export
              </th>
            )}
            {showDeleteButton && (
              <th className="text-left px-2 md:px-4 py-3 text-[11px] uppercase text-[#5F5E5A] font-medium">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {items.map((item) => {
            const isExpanded = expandedId === item.session_id;
            return (
              <Fragment key={item.session_id}>
                <tr
                  onClick={() => onToggleExpand(item.session_id)}
                  className="border-b border-[#E0DED6] hover:bg-[#F4F6F8] cursor-pointer transition-colors"
                >
                  {/* Date */}
                  <td className="px-2 md:px-4 py-3 text-[12px] md:text-[13px] text-[#1A1A1A]">
                    <div className="flex items-center gap-1.5">
                      {isExpanded
                        ? <ChevronUp className="w-3.5 h-3.5 text-[#5F5E5A] flex-shrink-0" />
                        : <ChevronDown className="w-3.5 h-3.5 text-[#5F5E5A] flex-shrink-0" />}
                      <span className="whitespace-nowrap">{formatDate(item.started_at)}</span>
                    </div>
                  </td>

                  {/* Patient name — on mobile also shows MRN below */}
                  <td className="px-2 md:px-4 py-3">
                    <p className="text-[12px] md:text-[13px] text-[#1A1A1A]">{item.patient_name}</p>
                    {/* MRN shown inline on mobile since its column is hidden */}
                    <p className="md:hidden text-[11px] text-[#5F5E5A] mt-0.5">{item.mrn}</p>
                  </td>

                  {/* MRN — md+ */}
                  <td className="hidden md:table-cell px-4 py-3 text-[13px] text-[#5F5E5A]">
                    {item.mrn}
                  </td>

                  {/* Language — lg+ */}
                  <td className="hidden lg:table-cell px-4 py-3 text-[13px] text-[#5F5E5A]">
                    {item.patient_language}
                  </td>

                  {/* ATS */}
                  <td className="px-2 md:px-4 py-3">
                    {item.ats_category ? (
                      <span className="px-2 py-1 bg-[#D94F04]/10 text-[#D94F04] rounded-full text-[11px] font-medium whitespace-nowrap">
                        Cat {item.ats_category}
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#9E9C97]">—</span>
                    )}
                  </td>

                  {/* Duration — sm+ */}
                  <td className="hidden sm:table-cell px-2 md:px-4 py-3 text-[12px] md:text-[13px] text-[#5F5E5A]">
                    {item.duration_seconds != null ? formatDuration(item.duration_seconds) : '—'}
                  </td>

                  {/* Export — hidden on mobile to keep row tight; accessible via accordion summary */}
                  {showExportColumn && (
                    <td className="hidden sm:table-cell px-2 md:px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onExportRow?.(item.session_id, item.patient_name, e); }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#5F5E5A] text-[#5F5E5A] rounded-md text-[11px] font-medium hover:bg-[#F4F6F8] transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </button>
                    </td>
                  )}

                  {showDeleteButton && (
                    <td className="px-2 md:px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(item.session_id); }}
                        className="text-[13px] text-[#A32D2D] hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>

                {isExpanded && (
                  <AccordionContent
                    expandedDetail={expandedDetail}
                    isLoadingDetail={isLoadingDetail}
                    expandedId={expandedId}
                    items={items}
                    showExportButton={showExportButton}
                    onExport={onExport}
                    showVitals={showVitals}
                    totalCols={totalCols}
                  />
                )}
              </Fragment>
            );
          })}

          {items.length === 0 && (
            <tr>
              <td colSpan={totalCols} className="py-12 text-center text-[13px] text-[#5F5E5A]">
                No sessions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}