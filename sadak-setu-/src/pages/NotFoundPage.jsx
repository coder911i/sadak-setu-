import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Route, AlertTriangle, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-2">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white font-mono">404 - Corridor Not Found</h1>
      <p className="text-xs text-slate-400 max-w-md">
        The requested highway route or telemetry resource does not exist in the Sadak Setu National Registry.
      </p>
      <div className="pt-2">
        <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/')}>
          Return to Executive Command
        </Button>
      </div>
    </div>
  );
}
