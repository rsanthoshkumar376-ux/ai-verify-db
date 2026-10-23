import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, UserCheck, Ban, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { TableSkeleton } from '../../components/common/LoadingSkeleton';

export const UserManagementPage: React.FC = () => {
  const { success, error, warning } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');

  // Role Edit Modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('APPLICANT');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.listUsers(roleFilter || undefined);
      setUsers(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleRoleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsUpdatingRole(true);
    try {
      await api.updateUserRole(selectedUser.id, newRole);
      success(`Updated ${selectedUser.full_name}'s role to ${newRole}.`);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err: any) {
      error(err.message || 'Failed to update role.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!window.confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} ${user.full_name}?`)) {
      return;
    }
    try {
      await api.toggleUserStatus(user.id);
      success(`User account status updated.`);
      await fetchUsers();
    } catch (err: any) {
      error(err.message || 'Failed to toggle status.');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (search) {
      const q = search.toLowerCase();
      return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.organization || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Identity & Authorization
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">User & Role Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer institutional user accounts, role-based privileges, and authorization statuses.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Registered Platform Users ({filteredUsers.length})</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Role-based access control directory</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-48 sm:w-56"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <option value="">All Roles</option>
              <option value="APPLICANT">Applicants</option>
              <option value="REVIEWER">Reviewers</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton rows={4} cols={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-5">User</th>
                    <th className="py-3 px-4">Affiliation / Org</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Enrolled Date</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-slate-900">{u.full_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{u.organization || 'Independent'}</td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            u.role === 'ADMIN' ? 'danger' : u.role === 'REVIEWER' ? 'info' : 'default'
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={u.is_active ? 'success' : 'neutral'}>
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u);
                            setNewRole(u.role);
                          }}
                        >
                          Edit Role
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={u.is_active ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Edit Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Update Authorization Role"
        description={`Assign a new institutional role to ${selectedUser?.full_name}.`}
      >
        <form onSubmit={handleRoleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Role</label>
            <select
              value={newRole}
              onChange={(e: any) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option value="APPLICANT">APPLICANT — Restricted to personal submissions & drafts</option>
              <option value="REVIEWER">REVIEWER — Authorized to inspect queue & record determinations</option>
              <option value="ADMIN">ADMIN — Full system governance, rules, and user management</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedUser(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingRole}>
              Update Role
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
