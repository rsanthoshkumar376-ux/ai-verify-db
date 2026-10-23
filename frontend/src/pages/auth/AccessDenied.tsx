import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AccessDenied: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200/90 shadow-sm text-center">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-5">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">403 — Access Denied</h1>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          You do not possess the required authorization credentials or role privileges to view this administrative resource.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Switch Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
