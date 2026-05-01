import { useState, useEffect, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { listSessions, deleteSession } from '../api/adminApi';
import type { AdminSession } from '../types';
// ===== EXPORT PDF FIX  =====
import { toast } from 'sonner';
// ===== END EXPORT PDF FIX =====
// ===== PDF EXPORT WIRED  =====
import { exportSessionPdf } from '../api/exportApi';
// ===== END PDF EXPORT WIRED =====
// ===== SHARED COMPONENTS REFACTOR  =====
import { getSessionDetail } from '../api/triageApi';
import type { SessionDetail } from '../api/triageApi';
import { SessionHistoryTable } from '../components/session-history/SessionHistoryTable';
// ===== END SHARED COMPONENTS REFACTOR =====


export function AdminSessionHistory() {
  // ── Data state ──
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Expanded row ──
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  // ===== SHARED COMPONENTS REFACTOR  =====
  const [expandedDetail, setExpandedDetail] = useState<SessionDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // ===== END SHARED COMPONENTS REFACTOR =====

  // ── Delete modal ──
  const [deleteTarget, setDeleteTarget] = useState<AdminSession | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // ── Fetch sessions ──
  useEffect(() => {
    setIsLoading(true);
    setError('');
    listSessions()
      .then((res) => setSessions(res.items))
      .catch((err: Error) => setError(err.message || 'Could not load sessions.'))
      .finally(() => setIsLoading(false));
  }, []);

  // ===== SESSION DETAIL LOAD  =====
  useEffect(() => {
    if (!expandedRow) {
      setExpandedDetail(null);
      return;
    }
    setIsLoadingDetail(true);
    setExpandedDetail(null);
    getSessionDetail(expandedRow)
      .then(setExpandedDetail)
      .catch(() => { })
      .finally(() => setIsLoadingDetail(false));
  }, [expandedRow]);
  // ===== END SESSION DETAIL LOAD =====

  // ── Delete session ──
  const handleDeleteSession = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    deleteSession(deleteTarget.session_id)
      .then(() => {
        setSessions((prev) => prev.filter((s) => s.session_id !== deleteTarget.session_id));
        setShowDeleteModal(false);
        setDeleteTarget(null);
      })
      .catch((err: Error) => setDeleteError(err.message || 'Could not delete session.'))
      .finally(() => setIsDeleting(false));
  };

  // ===== SHARED COMPONENTS REFACTOR  =====
  const handleToggleExpand = useCallback((id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    const target = sessions.find((s) => s.session_id === id) ?? null;
    setDeleteTarget(target);
    setShowDeleteModal(true);
  }, [sessions]);

  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return !q || s.patient_name.toLowerCase().includes(q) || s.mrn.toLowerCase().includes(q);
  });
  // ===== END SHARED COMPONENTS REFACTOR =====

  return (
    <div>
      {/* ===== NAV REMOVED - NOW IN AdminNavBar  ===== */}

      {/* Main Content */}
      <div className="p-3 sm:p-4 md:p-8">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-[#5F5E5A] py-20">
            Loading sessions…
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-[#A32D2D] py-20">
            {error}
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-2 px-4 py-3" style={{ backgroundColor: '#FAEEDA', border: '1px solid #EF9F27', borderRadius: '8px' }}>
              <AlertCircle size={16} style={{ color: '#854F0B' }} />
              <span style={{ fontSize: '13px', color: '#854F0B' }}>
                Note: All actions in this view are recorded in the change log.
              </span>
            </div>

            <div className="bg-white p-4 md:p-8" style={{ borderRadius: '12px', border: '0.5px solid #E0DED6' }}>
              <div className="flex items-start justify-between mb-4 md:mb-6 flex-wrap gap-3">
                <div>
                  <h1 className="text-[20px] md:text-[24px] font-semibold text-[#1A1A1A] mb-1">Session history</h1>
                  <p className="text-[13px] text-[#5F5E5A]">View completed triage sessions and transcripts</p>
                </div>
              </div>
              <SessionHistoryTable
                items={filteredSessions}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                expandedId={expandedRow}
                expandedDetail={expandedDetail}
                onToggleExpand={handleToggleExpand}
                isLoadingDetail={isLoadingDetail}
                showDeleteButton={true}
                onDelete={handleDeleteClick}
                showExportButton={true}
                onExport={/* ===== PDF EXPORT WIRED  ===== */ () => {
                  if (!expandedRow) return;
                  toast.info('Preparing download...');
                  exportSessionPdf(expandedRow)
                    .then(() => toast.success('Download started'))
                    .catch((err: Error) => toast.error(err.message || 'Export failed'));
                } /* ===== END PDF EXPORT WIRED ===== */}
                showVitals={false}
              />
              {/* ===== END SHARED COMPONENTS REFACTOR ===== */}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[440px]" style={{ borderRadius: '12px', padding: '32px' }}>
            <h3 className="mb-3" style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A1A' }}>
              Delete session record
            </h3>
            <p className="mb-6" style={{ fontSize: '13px', color: '#5F5E5A', lineHeight: '1.6' }}>
              This will permanently delete the session transcript for {deleteTarget.patient_name} ({new Date(deleteTarget.started_at).toLocaleString('en-AU', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}). This action is logged in the change log and cannot be undone.
            </p>

            {deleteError && (
              <p className="mb-4" style={{ fontSize: '12px', color: '#A32D2D' }}>{deleteError}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDeleteSession}
                disabled={isDeleting}
                className="flex-1 transition-opacity hover:opacity-90"
                style={{
                  height: '40px',
                  backgroundColor: '#A32D2D',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  opacity: isDeleting ? 0.7 : 1
                }}
              >
                {isDeleting ? 'Deleting…' : 'Delete record'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                  setDeleteError('');
                }}
                className="flex-1 transition-colors hover:bg-gray-50"
                style={{
                  height: '40px',
                  border: '1px solid #E0DED6',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#5F5E5A'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
