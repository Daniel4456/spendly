import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validatePassword, validateEmail, getFriendlyErrorMessage } from '../utils/validation';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { User, Mail, Lock, CheckCircle2, Circle } from 'lucide-react';

export const SignUpPage: React.FC = () => {
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordRules = validatePassword(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!passwordRules.isValid) {
      setErrorMessage('Please ensure your password meets all requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim());
      showToast(`Welcome to Spendly, ${fullName.trim()}! Let's start tracking your money.`, 'success');
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
            Create your Account
          </h2>
          <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-500 mt-1">
            “Take control of your money.”
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="rounded-3xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 p-6 sm:p-8 shadow-card-dark dark:shadow-card-dark light:shadow-card-light space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-financial-expense/10 border border-financial-expense/30 text-financial-expense text-xs leading-relaxed animate-fade-in">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Daniel Okafor"
              value={fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

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
              autoComplete="new-password"
              required
            />

            {/* Password Validation Checklist */}
            <div className="p-3 rounded-xl bg-white/[0.02] dark:bg-white/[0.02] light:bg-slate-50 border border-spendlyBorder-dark/40 dark:border-spendlyBorder-dark/40 light:border-slate-200 space-y-1.5 text-[11px]">
              <p className="font-semibold text-text-secondary mb-1">Password requirements:</p>
              <div className="flex items-center gap-1.5">
                {passwordRules.hasMinLength ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-financial-income shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-text-secondary/60 shrink-0" />
                )}
                <span className={passwordRules.hasMinLength ? 'text-financial-income' : 'text-text-secondary'}>
                  Minimum 8 characters
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {passwordRules.hasNumber ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-financial-income shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-text-secondary/60 shrink-0" />
                )}
                <span className={passwordRules.hasNumber ? 'text-financial-income' : 'text-text-secondary'}>
                  At least one number (0-9)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {passwordRules.hasUppercase ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-financial-income shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-text-secondary/60 shrink-0" />
                )}
                <span className={passwordRules.hasUppercase ? 'text-financial-income' : 'text-text-secondary'}>
                  At least one uppercase letter (A-Z)
                </span>
              </div>
            </div>

            <Input
              label="Confirm Password"
              isPassword
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
              required
            />

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-text-secondary">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-accent-primary focus:ring-accent-primary"
                  required
                />
                <span className="leading-snug">
                  I agree to the <span className="text-accent-primary underline">Terms of Service</span> and{' '}
                  <span className="text-accent-primary underline">Privacy Policy</span>.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full mt-2"
              size="lg"
            >
              Create Account
            </Button>
          </form>

          <div className="pt-2 border-t border-spendlyBorder-dark/60 dark:border-spendlyBorder-dark/60 light:border-slate-100 text-center text-xs text-text-secondary">
            <span>Already have an account? </span>
            <Link to="/login" className="text-accent-primary hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
