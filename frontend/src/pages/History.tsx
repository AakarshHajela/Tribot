import { toast } from 'sonner';
import { exportSessionPdf } from '../api/exportApi';
import { useHistory } from '../hooks/useHistory';
import { SessionHistoryTable } from '../components/session-history/SessionHistoryTable';


export default function History() {
  const {
    items, isLoading, error,
    searchQuery, setSearchQuery,
    expandedId, expandedDetail, isLoadingDetail, toggleExpanded,
  } = useHistory();

  const handleDownloadPDF = (sessionId: string, _patientName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.info('Preparing download...');
    exportSessionPdf(sessionId)
      .then(() => toast.success('Download started'))
      .catch((err: Error) => toast.error(err.message || 'Export failed'));
  };

  return (
    <div className="pt-[52px] h-screen bg-[#F4F6F8]">
      <div className="max-w-[1440px] mx-auto h-[calc(100vh-52px)] p-4 md:p-6">
        <div className="bg-white rounded-xl p-4 md:p-6 h-full flex flex-col">

          {/* ===== SHARED COMPONENTS REFACTOR ===== */}
          <div className="flex items-start justify-between mb-4 md:mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-[20px] md:text-[24px] font-semibold text-[#1A1A1A] mb-1">Session history</h1>
              <p className="text-[13px] text-[#5F5E5A]">View completed triage sessions and transcripts</p>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {isLoading && (
              <div className="py-12 text-center text-[13px] text-[#5F5E5A]">Loading history…</div>
            )}
            {error && (
              <div className="py-12 text-center text-[13px] text-[#A32D2D]">{error}</div>
            )}
            {!isLoading && !error && (
              <SessionHistoryTable
                items={items}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                expandedId={expandedId}
                expandedDetail={expandedDetail}
                onToggleExpand={toggleExpanded}
                isLoadingDetail={isLoadingDetail}
                showExportColumn={true}
                onExportRow={handleDownloadPDF}
                showVitals={true}
              />
            )}
          </div>
          {/* ===== END SHARED COMPONENTS REFACTOR ===== */}

        </div>
      </div>
    </div>
  );
}