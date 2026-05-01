import { SessionDetailMessage } from '../../api/triageApi';

interface TranscriptPanelProps {
  messages: SessionDetailMessage[] | null;
  isLoading?: boolean;
  clinicianName?: string;
  patientName?: string;
}

export function TranscriptPanel({
  messages,
  isLoading = false,
  clinicianName,
  patientName,
}: TranscriptPanelProps) {
  return (
    <div className="w-full bg-white rounded-lg border border-[#E0DED6] p-4 overflow-y-auto">
      <h3 className="text-[14px] font-semibold text-[#1A1A1A] mb-3">Session transcript</h3>

      {isLoading && (
        <p className="text-[13px] text-[#5F5E5A]">Loading transcript…</p>
      )}
      {!isLoading && messages === null && (
        <p className="text-[13px] text-[#5F5E5A]">Transcript not available.</p>
      )}
      {!isLoading && messages !== null && (
        <div className="space-y-4">
          {messages.map((msg) => {
            const isClinician = msg.sender === 'clinician';
            const bubbleColor = isClinician ? 'bg-[#185FA5]' : 'bg-[#3B6D11]';
            const translationBg = isClinician ? 'bg-[#0e3d6e]/40 text-blue-100' : 'bg-[#2a4f0c]/40 text-green-100';
            const langLabel = isClinician ? 'AR' : 'EN';

            return (
              <div key={msg.id} className={`flex ${isClinician ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col ${isClinician ? 'items-end' : 'items-start'}`}>

                  {/* Sender + timestamp */}
                  <div className={`flex items-center gap-1.5 mb-1 px-1 ${isClinician ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className={`text-[11px] font-semibold ${isClinician ? 'text-[#185FA5]' : 'text-[#3B6D11]'}`}>
                      {isClinician ? (clinicianName ?? 'Clinician') : (patientName ?? 'Patient')}
                    </span>
                    <span className="text-[10px] text-[#9E9C97]">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Bubble */}
                  <div className={`w-full rounded-2xl overflow-hidden shadow-sm text-white ${bubbleColor} ${isClinician ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                    {/* Original */}
                    <div className="px-4 pt-3 pb-2">
                      <p className="text-[14px] leading-relaxed font-medium" dir={isClinician ? 'ltr' : 'rtl'}>
                        {msg.original_text}
                      </p>
                    </div>

                    {/* Divider */}
                    <div className="mx-4 border-t border-white/20" />

                    {/* Translation */}
                    <div className={`px-4 pt-2 pb-3 ${translationBg}`}>
                      <p className="text-[10px] font-bold tracking-widest uppercase opacity-60 mb-1">{langLabel}</p>
                      <p className="text-[13px] leading-relaxed" dir={isClinician ? 'rtl' : 'ltr'}>
                        {msg.translated_text || '—'}
                      </p>
                    </div>

                   
                  </div>
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <p className="text-[13px] text-[#5F5E5A]">No messages recorded.</p>
          )}
        </div>
      )}
    </div>
  );
}