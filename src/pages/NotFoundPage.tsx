import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-dark dark:bg-background-dark light:bg-background-light flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary flex items-center justify-center mb-4 shadow-glow-primary">
        <Compass className="w-8 h-8 animate-pulse" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-text-primary dark:text-text-primary light:text-slate-900 mb-2">
        404
      </h1>
      <p className="text-base text-text-secondary max-w-sm mb-6">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary">Return to Dashboard</Button>
      </Link>
    </div>
  );
};
