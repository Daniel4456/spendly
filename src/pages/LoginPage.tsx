import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getFriendlyErrorMessage } from '../utils/validation';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Mail, Lock, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in both your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      showToast('Welcome back to Spendly!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signIn('demo@spendly.com', 'Spendly2026!');
      showToast('Logged in with Demo Account', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark dark:bg-background-dark light:bg-background-light flex flex-col justify-center items-center px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-accent-primary to-financial-income flex items-center justify-center p-0.5 shadow-glow-primary group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#11182B] dark:bg-[#11182B] light:bg-white rounded-[14px] flex items-center justify-center">
                <span className="text-accent-primary font-bold text-xl leading-none">S</span>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight">
              Spendly
            </span>
          </Link>
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary light:text-slate-900 tracking-tight">
            Sign In to your Account
          </h2>
          <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-500 mt-1">
            “Take control of your money.”
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 p-6 sm:p-8 shadow-card-dark dark:shadow-card-dark light:shadow-card-light space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-financial-expense/10 border border-financial-expense/30 text-financial-expense text-xs leading-relaxed animate-fade-in">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              isPassword
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-accent-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full mt-2"
              size="lg"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-white/5 dark:hover:bg-white/10 light:bg-slate-100 light:hover:bg-slate-200 border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-300 text-xs font-semibold text-text-primary dark:text-text-primary light:text-slate-800 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span>Instant Guest / Demo Login</span>
            </button>
          </div>

          <div className="pt-2 border-t border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100 text-center text-xs text-text-secondary">
            <span>Don't have an account? </span>
            <Link
              to="/signup"
              className="text-accent-primary hover:underline font-semibold"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
