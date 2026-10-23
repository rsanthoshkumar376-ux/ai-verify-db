import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  CheckSquare,
  ShieldAlert,
  Users,
  History,
  FileCheck2,
  FolderGit2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const applicantLinks = [
    { label: 'Overview', path: '/applicant', icon: LayoutDashboard },
    { label: 'My Applications', path: '/applicant/applications', icon: FileText },
    { label: 'Submit Application', path: '/applicant/wizard', icon: PlusCircle },
  ];

  const reviewerLinks = [
    { label: 'Review Queue', path: '/reviewer', icon: CheckSquare },
    { label: 'Applications', path: '/reviewer/applications', icon: FileText },
    { label: 'Compliance Rules', path: '/compliance-rules', icon: ShieldAlert },
  ];

  const adminLinks = [
    { label: 'Executive Metrics', path: '/admin', icon: LayoutDashboard },
    { label: 'Review Queue', path: '/reviewer', icon: CheckSquare },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Compliance Rules', path: '/admin/rules', icon: ShieldAlert },
    { label: 'Audit Trail', path: '/admin/audit-logs', icon: History },
  ];

  const navItems = role === 'ADMIN' ? adminLinks : role === 'REVIEWER' ? reviewerLinks : applicantLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/40">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
          <FileCheck2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-none">AI Verify</h1>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Enterprise Engine</span>
        </div>
      </div>

      {/* Role Indicator */}
      <div className="px-6 py-4 border-b border-slate-800/60 bg-slate-800/20">
        <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block mb-1">
          Active Workspace
        </span>
        <div className="text-xs font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          {role === 'ADMIN' ? 'Compliance Administrator' : role === 'REVIEWER' ? 'Authorized Reviewer' : 'Applicant Portal'}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/applicant' || item.path === '/reviewer' || item.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="font-medium text-slate-400">{user.full_name}</div>
        <div className="truncate text-slate-500">{user.email}</div>
      </div>
    </aside>
  );
};
