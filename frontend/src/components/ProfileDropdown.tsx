import { useState, useRef, useEffect } from 'react';
import { KeyRound, User, Eye, EyeOff } from 'lucide-react';
import { changePassword } from '../api/authApi';
import { toast } from 'sonner';

interface ProfileDropdownProps {
  user: { full_name: string | null; email: string; role: string } | null;
  initials: string;
}

export function ProfileDropdown({ user, initials }: ProfileDropdownProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  
  const [showCpCurrent, setShowCpCurrent] = useState(false);
  const [showCpNew, setShowCpNew] = useState(false);
  const [showCpConfirm, setShowCpConfirm] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  function handleChangePasswordSubmit() {
    // 1. Backend rule: Fields cannot be empty
    if (!cpCurrent.trim() || !cpNew.trim() || !cpConfirm.trim()) {
      toast.warning('All password fields must be filled.');
      return;
    }

    // 2. Backend rule: New password must be at least 8 characters
    if (cpNew.length < 8) {
      toast.warning('New password must be at least 8 characters long.');
      return;
    }

    if (cpNew !== cpConfirm) {
      toast.error('New passwords do not match.');
      return;
    }

    setCpLoading(true);
    changePassword({ currentPassword: cpCurrent, newPassword: cpNew })
      .then(() => {
        toast.success('Password updated successfully.');
        setShowChangePassword(false);
        setCpCurrent(''); setCpNew(''); setCpConfirm('');
      })
      .catch((err: Error) => console.error('Password update failed:', err))
      .finally(() => setCpLoading(false));
  }

  return (
    <>
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((o) => !o)}
          className="w-8 h-8 bg-[#185FA5] rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
        >
          <span className="text-white text-[12px] font-medium">{initials}</span>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[#E0DED6] shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E0DED6]">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[#5F5E5A]" />
                <span className="text-[12px] font-medium text-[#5F5E5A] uppercase tracking-wide">Profile</span>
              </div>
              <p className="text-[13px] font-medium text-[#1A1A1A] truncate">{user?.full_name ?? '—'}</p>
              <p className="text-[12px] text-[#5F5E5A] truncate">{user?.email ?? '—'}</p>
              <p className="text-[11px] text-[#5F5E5A] mt-1 capitalize">{user?.role ?? '—'}</p>
            </div>

            <div className="p-1">
              <button
                onClick={() => { setShowChangePassword(true); setProfileOpen(false); }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-[14px] font-medium text-[#5F5E5A] hover:bg-[#F4F6F8] transition-colors"
              >
                <KeyRound className="w-4 h-4" />
                Change password
              </button>
            </div>
          </div>
        )}
      </div>

      {showChangePassword && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[400px] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <KeyRound className="w-4 h-4 text-[#5F5E5A]" />
              <h3 className="text-[16px] font-medium text-[#1A1A1A]">Change password</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-[11px] uppercase tracking-wide text-[#5F5E5A]">Current password</label>
                <div className="relative">
                  <input
                    type={showCpCurrent ? 'text' : 'password'}
                    value={cpCurrent}
                    onChange={(e) => setCpCurrent(e.target.value)}
                    className="w-full h-10 px-3 text-[13px] outline-none border border-[#E0DED6] rounded-lg"
                    style={{ paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCpCurrent((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5F5E5A] hover:text-[#1A1A1A] transition-colors"
                    tabIndex={-1}
                  >
                    {showCpCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[11px] uppercase tracking-wide text-[#5F5E5A]">New password</label>
                <div className="relative">
                  <input
                    type={showCpNew ? 'text' : 'password'}
                    value={cpNew}
                    onChange={(e) => setCpNew(e.target.value)}
                    className="w-full h-10 px-3 text-[13px] outline-none border border-[#E0DED6] rounded-lg"
                    style={{ paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCpNew((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5F5E5A] hover:text-[#1A1A1A] transition-colors"
                    tabIndex={-1}
                  >
                    {showCpNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block mb-1 text-[11px] uppercase tracking-wide text-[#5F5E5A]">Confirm new password</label>
                <div className="relative">
                  <input
                    type={showCpConfirm ? 'text' : 'password'}
                    value={cpConfirm}
                    onChange={(e) => setCpConfirm(e.target.value)}
                    className="w-full h-10 px-3 text-[13px] outline-none border border-[#E0DED6] rounded-lg"
                    style={{ paddingRight: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCpConfirm((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#5F5E5A] hover:text-[#1A1A1A] transition-colors"
                    tabIndex={-1}
                  >
                    {showCpConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-5">
              <button
                onClick={handleChangePasswordSubmit}
                disabled={cpLoading}
                className="flex-1 h-10 rounded-lg text-[14px] font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#185FA5', opacity: cpLoading ? 0.7 : 1 }}
              >
                {cpLoading ? 'Saving…' : 'Save password'}
              </button>
              <button
                onClick={() => { setShowChangePassword(false); setCpCurrent(''); setCpNew(''); setCpConfirm(''); }}
                className="flex-1 h-10 rounded-lg text-[14px] text-[#5F5E5A] border border-[#E0DED6] hover:bg-[#F4F6F8] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}