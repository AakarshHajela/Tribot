import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { getChangeLog } from '../api/adminApi';
import type { ChangeLogEntry } from '../types';

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatActionLabel(actionType: string): string {
  return actionType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getActionColor(actionType: string): { bg: string; text: string } {
  if (actionType.includes('created') || actionType.includes('reactivated'))
    return { bg: '#E8F5E9', text: '#2E7D32' };
  if (actionType.includes('modified'))
    return { bg: '#E3F2FD', text: '#185FA5' };
  if (actionType.includes('deleted'))
    return { bg: '#FFEBEE', text: '#C62828' };
  if (actionType.includes('deactivated'))
    return { bg: '#F5F5F5', text: '#757575' };
  return { bg: '#F5F5F5', text: '#757575' };
}

export function AdminChangeLog() {
  // ── Data state ──
  const [logs, setLogs] = useState<ChangeLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // ── Date filter state ──
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ── Fetch logs ──
  const loadLogs = (from?: string, to?: string) => {
    setIsLoading(true);
    setError('');
    getChangeLog({ from_date: from, to_date: to })
      .then((res) => setLogs(res.items))
      .catch((err: Error) => setError(err.message || 'Could not load change log.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleFilter = () => {
    loadLogs(fromDate || undefined, toDate || undefined);
  };

  return (
    <div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 md:p-8">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-[#5F5E5A] py-20">
            Loading change log…
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-[#A32D2D] py-20">
            {error}
          </div>
        ) : (
          <div className="bg-white p-4 md:p-8" style={{ borderRadius: '12px', border: '0.5px solid #E0DED6' }}>
            {/* Header */}
            {/* ===== RESPONSIVE  ===== */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            {/* ===== END RESPONSIVE ===== */}
              <div className="flex items-center gap-2">
                <Lock size={18} style={{ color: '#5F5E5A' }} />
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>
                    Change log
                  </h2>
                  <p style={{ fontSize: '13px', color: '#5F5E5A' }}>
                    Audit trail of all administrative actions
                  </p>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                <div>
                  <label className="block mb-1 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A' }}>From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="outline-none"
                    style={{
                      height: '36px',
                      padding: '0 10px',
                      border: '1px solid #E0DED6',
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div>
                  <label className="block mb-1 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A' }}>To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="outline-none"
                    style={{
                      height: '36px',
                      padding: '0 10px',
                      border: '1px solid #E0DED6',
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div className="pt-6">
                  <button
                    onClick={handleFilter}
                    className="transition-colors hover:bg-gray-50"
                    style={{
                      height: '36px',
                      padding: '0 16px',
                      border: '1px solid #E0DED6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#5F5E5A'
                    }}
                  >
                    Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {/* ===== RESPONSIVE TABLE  ===== */}
                  <tr style={{ borderBottom: '1px solid #E0DED6' }}>
                    <th className="text-left pb-3 px-2 md:px-4 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A', fontWeight: 500 }}>Timestamp</th>
                    <th className="hidden md:table-cell text-left pb-3 px-2 md:px-4 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A', fontWeight: 500 }}>Admin user</th>
                    <th className="text-left pb-3 px-2 md:px-4 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A', fontWeight: 500 }}>Action type</th>
                    <th className="hidden sm:table-cell text-left pb-3 px-2 md:px-4 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A', fontWeight: 500 }}>Target</th>
                    <th className="text-left pb-3 px-2 md:px-4 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A', fontWeight: 500 }}>Details</th>
                  </tr>
                  {/* ===== END RESPONSIVE TABLE ===== */}
                </thead>
                <tbody>
                  {logs.map((log, idx) => {
                    const colors = getActionColor(log.action_type);
                    return (
                      <tr key={log.id} style={{ borderBottom: idx < logs.length - 1 ? '1px solid #E0DED6' : 'none' }}>
                        {/* ===== RESPONSIVE TABLE  ===== */}
                        <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px]" style={{ color: '#1A1A1A' }}>{formatTimestamp(log.timestamp)}</td>
                        <td className="hidden md:table-cell py-3 px-2 md:px-4 text-[12px] md:text-[13px]" style={{ color: '#5F5E5A' }}>{log.admin_user}</td>
                        <td className="py-3 px-2 md:px-4">
                          <span
                            className="px-2 py-1"
                            style={{
                              fontSize: '11px',
                              borderRadius: '12px',
                              backgroundColor: colors.bg,
                              color: colors.text,
                              fontWeight: 500
                            }}
                          >
                            {formatActionLabel(log.action_type)}
                          </span>
                        </td>
                        <td className="hidden sm:table-cell py-3 px-2 md:px-4 text-[12px] md:text-[13px]" style={{ color: '#1A1A1A' }}>{log.target}</td>
                        <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px]" style={{ color: '#5F5E5A' }}>{log.details}</td>
                        {/* ===== END RESPONSIVE TABLE ===== */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
