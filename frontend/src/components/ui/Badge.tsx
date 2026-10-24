import React from 'react';
import { ApplicationStatus, RiskLevel } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variantStyles = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    info: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    neutral: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ApplicationStatus | string }> = ({ status }) => {
  switch (status) {
    case 'VERIFIED':
      return <Badge variant="success">Verified</Badge>;
    case 'UNDER_HUMAN_REVIEW':
      return <Badge variant="info">Under Human Review</Badge>;
    case 'NEEDS_INFORMATION':
      return <Badge variant="warning">Needs Information</Badge>;
    case 'REJECTED':
      return <Badge variant="danger">Rejected</Badge>;
    case 'PROCESSING':
      return <Badge variant="info">Processing</Badge>;
    case 'SUBMITTED':
      return <Badge variant="default">Submitted</Badge>;
    case 'DRAFT':
      return <Badge variant="neutral">Draft</Badge>;
    case 'WITHDRAWN':
      return <Badge variant="neutral">Withdrawn</Badge>;
    default:
      return <Badge variant="default">{status}</Badge>;
  }
};

export const RiskBadge: React.FC<{ risk: RiskLevel | string }> = ({ risk }) => {
  switch (risk?.toUpperCase()) {
    case 'LOW':
      return <Badge variant="success">Low Risk</Badge>;
    case 'MEDIUM':
      return <Badge variant="warning">Medium Risk</Badge>;
    case 'HIGH':
    case 'CRITICAL':
      return <Badge variant="danger">High Risk</Badge>;
    default:
      return <Badge variant="default">{risk}</Badge>;
  }
};
