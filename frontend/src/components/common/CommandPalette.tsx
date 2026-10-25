import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileCheck,
  PlusCircle,
  Shield,
  Sliders,
  FileText,
  Users,
  Moon,
  Sun,
  ArrowRight,
  ExternalLink,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Command,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Navigation' | 'Demo Roles' | 'Preferences' | 'Quick Lookups';
  icon: React.ElementType;
  action: () => void;
  keywords?: string[];
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { success, info } = useToast();

  // Listen for open events and hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const runAndClose = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  const handleRoleSwitch = async (email: string, roleName: string) => {
    try {
      await login(email, 'Password123!');
      success(`Switched role to ${roleName}`);
      if (email.includes('reviewer')) {
        navigate('/reviewer/queue');
      } else if (email.includes('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/applicant/dashboard');
      }
    } catch {
      info(`Logged in as ${roleName}`);
    }
  };

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-app-dash',
      title: 'Applicant Dashboard',
      subtitle: 'View active submissions and verification progress',
      category: 'Navigation',
      icon: FileCheck,
      action: () => navigate('/applicant/dashboard'),
      keywords: ['applicant', 'applications', 'status', 'home']
    },
    {
      id: 'nav-new-app',
      title: 'New Verification Application',
      subtitle: 'Launch the multi-step compliance submission wizard',
      category: 'Navigation',
      icon: PlusCircle,
      action: () => navigate('/applicant/new'),
      keywords: ['new', 'create', 'submit', 'upload', 'apply']
    },
    {
      id: 'nav-reviewer-queue',
      title: 'Reviewer Adjudication Queue',
      subtitle: 'Human-in-the-loop review queue and AI recommendations',
      category: 'Navigation',
      icon: Shield,
      action: () => navigate('/reviewer/queue'),
      keywords: ['reviewer', 'queue', 'adjudicate', 'officer', 'approval']
    },
    {
      id: 'nav-rules',
      title: 'Compliance Rule Engine',
      subtitle: 'Configure automated decision weights and thresholds',
      category: 'Navigation',
      icon: Sliders,
      action: () => navigate('/admin/rules'),
      keywords: ['rules', 'threshold', 'weights', 'compliance', 'engine']
    },
    {
      id: 'nav-audit',
      title: 'Audit Trail & Immutable Logs',
      subtitle: 'Inspect cryptographic security actions and forensic trail',
      category: 'Navigation',
      icon: FileText,
      action: () => navigate('/admin/audit-logs'),
      keywords: ['audit', 'logs', 'security', 'history', 'forensic']
    },
    {
      id: 'nav-users',
      title: 'User Access Management',
      subtitle: 'Manage administrative and reviewer roles & permissions',
      category: 'Navigation',
      icon: Users,
      action: () => navigate('/admin/users'),
      keywords: ['users', 'roles', 'permissions', 'admin']
    },
    {
      id: 'nav-verify-registry',
      title: 'Public Credential Registry',
      subtitle: 'Search and cryptographically verify issued certificates',
      category: 'Navigation',
      icon: CheckCircle2,
      action: () => navigate('/verify'),
      keywords: ['verify', 'certificate', 'registry', 'public', 'lookup', 'fingerprint']
    },
    {
      id: 'nav-how-it-works',
      title: 'Platform Architecture & Guide',
      subtitle: 'Technical overview of the AI pipeline and validation steps',
      category: 'Navigation',
      icon: ExternalLink,
      action: () => navigate('/how-it-works'),
      keywords: ['how it works', 'docs', 'pipeline', 'architecture', 'guide']
    },

    // Demo Role Switching
    {
      id: 'role-applicant',
      title: 'Switch Role: Applicant (Sarah Jenkins)',
      subtitle: 'Experience applicant submission, live OCR, and status tracking',
      category: 'Demo Roles',
      icon: UserCheck,
      action: () => handleRoleSwitch('applicant@example.com', 'Sarah Jenkins (Applicant)'),
      keywords: ['switch', 'applicant', 'sarah', 'role', 'login']
    },
    {
      id: 'role-reviewer',
      title: 'Switch Role: Compliance Officer (Marcus Vance)',
      subtitle: 'Access the reviewer queue, risk flags, and determination panel',
      category: 'Demo Roles',
      icon: Shield,
      action: () => handleRoleSwitch('reviewer@example.com', 'Marcus Vance (Compliance Officer)'),
      keywords: ['switch', 'reviewer', 'marcus', 'officer', 'role']
    },
    {
      id: 'role-admin',
      title: 'Switch Role: Chief Administrator (Elena Rostova)',
      subtitle: 'Full governance, rules config, user roles, and audit trail',
      category: 'Demo Roles',
      icon: Sparkles,
      action: () => handleRoleSwitch('admin@example.com', 'Elena Rostova (Administrator)'),
      keywords: ['switch', 'admin', 'elena', 'administrator', 'role']
    },

    // Preferences
    {
      id: 'pref-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: `Currently using ${theme} appearance`,
      category: 'Preferences',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        toggleTheme();
        success(`Switched to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      },
      keywords: ['dark', 'light', 'theme', 'mode', 'color', 'appearance']
    },

    // Quick Lookups
    {
      id: 'lookup-demo-1',
      title: 'Verify Credential: AIV-SCH-2026-81923',
      subtitle: 'Academic Research Fellowship credential (Valid / Verified)',
      category: 'Quick Lookups',
      icon: CheckCircle2,
      action: () => navigate('/verify?ref=AIV-SCH-2026-81923'),
      keywords: ['aiv', 'sch', '81923', 'fellowship', 'academic']
    },
    {
      id: 'lookup-demo-2',
      title: 'Verify Credential: AIV-COR-2026-90412',
      subtitle: 'Corporate KYC Business Verification credential',
      category: 'Quick Lookups',
      icon: CheckCircle2,
      action: () => navigate('/verify?ref=AIV-COR-2026-90412'),
      keywords: ['aiv', 'cor', '90412', 'kyc', 'corporate']
    }
  ];

  const filtered = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = cmd.title.toLowerCase().includes(q);
    const subMatch = cmd.subtitle?.toLowerCase().includes(q);
    const kwMatch = cmd.keywords?.some((kw) => kw.includes(q));
    const catMatch = cmd.category.toLowerCase().includes(q);
    return titleMatch || subMatch || kwMatch || catMatch;
  });

  // Handle arrow keys and Enter
  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        runAndClose(filtered[selectedIndex].action);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm transition-opacity"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyNavigation}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, jump to page, switch role, or verify credential..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent border-0 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0 text-sm sm:text-base font-medium"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              ESC
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Command List */}
        <div ref={listRef} className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <Command className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No matching commands found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for "applicant", "rules", "dark", or "verify"</p>
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={cmd.id}
                  onClick={() => runAndClose(cmd.action)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-colors duration-100 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{cmd.title}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium uppercase tracking-wider ${
                            isSelected
                              ? 'bg-indigo-500/80 text-white'
                              : 'bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {cmd.category}
                        </span>
                      </div>
                      {cmd.subtitle && (
                        <p
                          className={`text-xs truncate mt-0.5 ${
                            isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {cmd.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-white translate-x-0.5' : 'text-slate-400 dark:text-slate-600'
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs font-mono text-[10px]">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded shadow-2xs font-mono text-[10px]">
                ↵
              </kbd>{' '}
              Select
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3 h-3" /> AI Verify Enterprise Omnibar
          </span>
        </div>
      </div>
    </div>
  );
};
