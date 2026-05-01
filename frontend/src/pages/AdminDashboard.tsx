import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  reactivateUser,
  // ===== RESET PASSWORD BUTTON  =====
  resetPassword,
  // ===== END RESET PASSWORD BUTTON =====
} from '../api/adminApi';
// ===== RESET PASSWORD BUTTON  =====
import { toast } from 'sonner';
// ===== END RESET PASSWORD BUTTON =====
import type { AdminUser, CreateUserPayload, UpdateUserPayload, ResetPasswordResponse } from '../types';

function formatLastLogin(iso: string | null): string {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleString('en-AU', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function AdminDashboard() {
  // ── Data state ──
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Add user modal ──
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'clinician'>('clinician');
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [addError, setAddError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Edit user modal ──
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'clinician'>('clinician');
  const [editError, setEditError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // ── Delete modal ──
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // ===== RESET PASSWORD BUTTON  =====
  const [resetResult, setResetResult] = useState<ResetPasswordResponse | null>(null);
  // ===== END RESET PASSWORD BUTTON =====

  // ── Fetch users ──
  useEffect(() => {
    setIsLoading(true);
    setError('');
    listUsers({ search: searchQuery || undefined })
      .then((res) => setUsers(res.items))
      .catch((err: Error) => setError(err.message || 'Could not load users.'))
      .finally(() => setIsLoading(false));
  }, [searchQuery]);

  // ── Create user ──
  const handleCreateUser = () => {
    if (!newFullName.trim() || !newEmail.trim()) {
      setAddError('Full name and email are required.');
      return;
    }
    setIsSubmitting(true);
    setAddError('');
    const payload: CreateUserPayload = { full_name: newFullName.trim(), email: newEmail.trim(), role: newRole };
    createUser(payload)
      .then((res) => {
        setTempPassword(res.temporary_password);
        setUsers((prev) => [res.user, ...prev]);
      })
      .catch((err: Error) => setAddError(err.message || 'Could not create user.'))
      .finally(() => setIsSubmitting(false));
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewFullName('');
    setNewEmail('');
    setNewRole('clinician');
    setTempPassword(null);
    setAddError('');
  };

  // ── Edit user ──
  const openEditModal = (user: AdminUser) => {
    setEditTarget(user);
    setEditFullName(user.full_name ?? '');
    setEditRole(user.role);
    setEditError('');
  };

  const handleUpdateUser = () => {
    if (!editTarget) return;
    setIsEditing(true);
    setEditError('');
    const payload: UpdateUserPayload = { full_name: editFullName.trim() || undefined, role: editRole };
    updateUser(editTarget.id, payload)
      .then((updated) => {
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setEditTarget(null);
      })
      .catch((err: Error) => setEditError(err.message || 'Could not update user.'))
      .finally(() => setIsEditing(false));
  };

  // ── Delete user ──
  const handleDeleteUser = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError('');
    deleteUser(deleteTarget.id)
      .then(() => {
        setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
        setShowDeleteModal(false);
        setDeleteTarget(null);
      })
      .catch((err: Error) => setDeleteError(err.message || 'Could not delete user.'))
      .finally(() => setIsDeleting(false));
  };

  // ── Deactivate / reactivate ──
  const handleToggleActive = (user: AdminUser) => {
    const action = user.is_active ? deactivateUser : reactivateUser;
    action(user.id)
      .then((updated) => setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u))))
      .catch((err: Error) => setError(err.message || 'Could not update user status.'));
  };

  return (
    <div>
    

      {/* Main Content */}
      <div className="p-3 sm:p-4 md:p-8">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-[#5F5E5A] py-20">
            Loading users…
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-[#A32D2D] py-20">
            {error}
          </div>
        ) : (
          <div className="bg-white p-4 md:p-8" style={{ borderRadius: '12px', border: '0.5px solid #E0DED6' }}>
            {/* Header */}
            {/* ===== RESPONSIVE  ===== */}
            <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            {/* ===== END RESPONSIVE ===== */}
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 500, color: '#1A1A1A', marginBottom: '4px' }}>
                  User management
                </h2>
                <p style={{ fontSize: '13px', color: '#5F5E5A' }}>
                  Manage clinician accounts and access permissions
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="transition-opacity hover:opacity-90"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#185FA5',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                + Add user
              </button>
            </div>

            {/* Search Bar */}
            {/* ===== RESPONSIVE  ===== */}
            <div className="mb-6 relative w-full md:w-[40%]">
            {/* ===== END RESPONSIVE ===== */}
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#5F5E5A' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full outline-none pl-10"
                style={{
                  height: '40px',
                  border: '1px solid #E0DED6',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#1A1A1A',
                  paddingRight: '12px'
                }}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  {/* ===== RESPONSIVE TABLE  ===== */}
                  <tr style={{ borderBottom: '1px solid #E0DED6' }}>
                    <th className="text-left pb-3 px-2 md:px-4 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A', fontWeight: 500 }}>Name</th>
                    <th className="hidden md:table-cell text-left pb-3 px-2 md:px-4 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A', fontWeight: 500 }}>Email</th>
                    <th className="text-left pb-3 px-2 md:px-4 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A', fontWeight: 500 }}>Role</th>
                    <th className="text-left pb-3 px-2 md:px-4 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A', fontWeight: 500 }}>Status</th>
                    <th className="hidden lg:table-cell text-left pb-3 px-2 md:px-4 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A', fontWeight: 500 }}>Last login</th>
                    <th className="text-left pb-3 px-2 md:px-4 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A', fontWeight: 500 }}>Actions</th>
                  </tr>
                  {/* ===== END RESPONSIVE TABLE ===== */}
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user.id} style={{ borderBottom: idx < users.length - 1 ? '1px solid #E0DED6' : 'none' }}>
                      <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px]" style={{ color: '#1A1A1A' }}>{user.full_name ?? '-'}</td>
                      <td className="hidden md:table-cell py-3 px-2 md:px-4 text-[12px] md:text-[13px]" style={{ color: '#5F5E5A' }}>{user.email}</td>
                      <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px]" style={{ color: '#1A1A1A' }}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
                      <td className="py-3 px-2 md:px-4">
                        <span
                          className="px-2 py-1"
                          style={{
                            fontSize: '11px',
                            borderRadius: '12px',
                            backgroundColor: user.is_active ? '#E8F5E9' : '#F5F5F5',
                            color: user.is_active ? '#2E7D32' : '#757575',
                            fontWeight: 500
                          }}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="hidden lg:table-cell py-3 px-2 md:px-4 text-[12px] md:text-[13px]" style={{ color: '#5F5E5A' }}>{formatLastLogin(user.last_login)}</td>
                      <td className="py-3 px-2 md:px-4">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <button
                            className="hover:underline"
                            style={{ fontSize: '13px', color: '#185FA5' }}
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </button>
                          <button
                            className="hover:underline"
                            style={{
                              fontSize: '13px',
                              color: user.is_active ? '#BA7517' : '#3B6D11'
                            }}
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.is_active ? 'Deactivate' : 'Reactivate'}
                          </button>
                          <button
                            className="hover:underline"
                            style={{ fontSize: '13px', color: '#A32D2D' }}
                            onClick={() => {
                              setDeleteTarget(user);
                              setShowDeleteModal(true);
                            }}
                          >
                            Delete
                          </button>
                          {/* ===== RESET PASSWORD BUTTON  ===== */}
                          <button
                            className="hover:underline"
                            style={{ fontSize: '13px', color: '#5F5E5A' }}
                            onClick={() => {
                              if (window.confirm(`Reset password for ${user.full_name ?? user.email}? A new temporary password will be generated.`)) {
                                resetPassword(user.id)
                                  .then(setResetResult)
                                  .catch((err: Error) => toast.error(err.message || 'Could not reset password.'));
                              }
                            }}
                          >
                            Reset password
                          </button>
                          {/* ===== END RESET PASSWORD BUTTON ===== */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* ===== RESPONSIVE - Racha ===== */}
          <div className="bg-white w-full max-w-[480px]" style={{ borderRadius: '12px', padding: '32px' }}>
          {/* ===== END RESPONSIVE ===== */}
            {tempPassword ? (
              <>
                <h3 className="mb-4" style={{ fontSize: '18px', fontWeight: 500, color: '#1A1A1A' }}>
                  User created
                </h3>
                <p className="mb-2" style={{ fontSize: '13px', color: '#5F5E5A', lineHeight: '1.6' }}>
                  Share this temporary password with the new user. It will not be shown again.
                </p>
                <div
                  className="mb-6 px-4 py-3 font-mono"
                  style={{
                    backgroundColor: '#F4F6F8',
                    border: '1px solid #E0DED6',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1A1A1A',
                    letterSpacing: '0.05em'
                  }}
                >
                  {tempPassword}
                </div>
                <button
                  onClick={handleCloseAddModal}
                  className="w-full transition-opacity hover:opacity-90"
                  style={{
                    height: '40px',
                    backgroundColor: '#185FA5',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h3 className="mb-6" style={{ fontSize: '18px', fontWeight: 500, color: '#1A1A1A' }}>
                  Add new user
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A' }}>Full name</label>
                    <input
                      type="text"
                      value={newFullName}
                      onChange={(e) => setNewFullName(e.target.value)}
                      className="w-full outline-none"
                      style={{
                        height: '40px',
                        padding: '0 12px',
                        border: '1px solid #E0DED6',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A' }}>Email address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full outline-none"
                      style={{
                        height: '40px',
                        padding: '0 12px',
                        border: '1px solid #E0DED6',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A' }}>Role</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'admin' | 'clinician')}
                      className="w-full outline-none"
                      style={{
                        height: '40px',
                        padding: '0 12px',
                        border: '1px solid #E0DED6',
                        borderRadius: '8px',
                        fontSize: '13px'
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="clinician">Clinician</option>
                    </select>
                  </div>

                  <p className="pt-2" style={{ fontSize: '11px', color: '#5F5E5A' }}>
                    Admins can manage users and view session history. Clinicians can translate and view session history.
                  </p>

                  {addError && (
                    <p style={{ fontSize: '12px', color: '#A32D2D' }}>{addError}</p>
                  )}

                  {/* ===== RESPONSIVE - Racha ===== */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {/* ===== END RESPONSIVE ===== */}
                    <button
                      onClick={handleCreateUser}
                      disabled={isSubmitting}
                      className="flex-1 transition-opacity hover:opacity-90"
                      style={{
                        height: '40px',
                        backgroundColor: '#185FA5',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        opacity: isSubmitting ? 0.7 : 1
                      }}
                    >
                      {isSubmitting ? 'Creating…' : 'Send invitation'}
                    </button>
                    <button
                      onClick={handleCloseAddModal}
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
              </>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* ===== RESPONSIVE - Racha ===== */}
          <div className="bg-white w-full max-w-[480px]" style={{ borderRadius: '12px', padding: '32px' }}>
          {/* ===== END RESPONSIVE ===== */}
            {/* ===== BACK BUTTON ===== */}
            <button
              onClick={() => {
                setEditTarget(null);
                setEditError('');
              }}
              className="flex items-center gap-1 mb-4 hover:underline transition-colors"
              style={{ fontSize: '13px', color: '#5F5E5A' }}
            >
              ← Back
            </button>
            {/* ===== END BACK BUTTON ===== */}
            <h3 className="mb-6" style={{ fontSize: '18px', fontWeight: 500, color: '#1A1A1A' }}>
              Edit user
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A' }}>Full name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full outline-none"
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid #E0DED6',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label className="block mb-1 uppercase tracking-wide" style={{ fontSize: '11px', color: '#5F5E5A' }}>Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'admin' | 'clinician')}
                  className="w-full outline-none"
                  style={{
                    height: '40px',
                    padding: '0 12px',
                    border: '1px solid #E0DED6',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="clinician">Clinician</option>
                </select>
              </div>

              {editError && (
                <p style={{ fontSize: '12px', color: '#A32D2D' }}>{editError}</p>
              )}

              {/* ===== RESPONSIVE - Racha ===== */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* ===== END RESPONSIVE ===== */}
                <button
                  onClick={handleUpdateUser}
                  disabled={isEditing}
                  className="flex-1 transition-opacity hover:opacity-90"
                  style={{
                    height: '40px',
                    backgroundColor: '#185FA5',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    opacity: isEditing ? 0.7 : 1
                  }}
                >
                  {isEditing ? 'Saving…' : 'Save changes'}
                </button>
                <button
                  onClick={() => setEditTarget(null)}
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* ===== RESPONSIVE - Racha ===== */}
          <div className="bg-white w-full max-w-[440px]" style={{ borderRadius: '12px', padding: '32px' }}>
          {/* ===== END RESPONSIVE ===== */}
            <h3 className="mb-3" style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A1A' }}>
              Delete user
            </h3>
            <p className="mb-6" style={{ fontSize: '13px', color: '#5F5E5A', lineHeight: '1.6' }}>
              This will remove {deleteTarget.full_name ?? deleteTarget.email} from the system. The account will be deactivated in the back end. This action is logged in the change log.
            </p>

            {deleteError && (
              <p className="mb-4" style={{ fontSize: '12px', color: '#A32D2D' }}>{deleteError}</p>
            )}

            {/* ===== RESPONSIVE - Racha ===== */}
            <div className="flex flex-col sm:flex-row gap-3">
            {/* ===== END RESPONSIVE ===== */}
              <button
                onClick={handleDeleteUser}
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
                {isDeleting ? 'Deleting…' : 'Delete user'}
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

      {/* ===== RESET PASSWORD RESULT MODAL - Rach ===== */}
      {resetResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-[440px]" style={{ borderRadius: '12px', padding: '32px' }}>
            <h3 className="mb-3" style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A1A' }}>
              Password reset
            </h3>
            <p className="mb-2" style={{ fontSize: '13px', color: '#5F5E5A', lineHeight: '1.6' }}>
              Share this temporary password with the user. It will not be shown again.
            </p>
            <div
              className="mb-6 px-4 py-3 font-mono"
              style={{
                backgroundColor: '#F4F6F8',
                border: '1px solid #E0DED6',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#1A1A1A',
                letterSpacing: '0.05em'
              }}
            >
              {resetResult.temporary_password}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(resetResult.temporary_password)
                    .then(() => toast.success('Copied to clipboard.'))
                    .catch(() => toast.error('Could not copy.'));
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
                Copy to clipboard
              </button>
              <button
                onClick={() => setResetResult(null)}
                className="flex-1 transition-opacity hover:opacity-90"
                style={{
                  height: '40px',
                  backgroundColor: '#185FA5',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== END RESET PASSWORD RESULT MODAL ===== */}
    </div>
  );
}
