import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateEmail, getFriendlyErrorMessage } from '../utils/validation';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const { sendPasswordReset } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setIsSent(true);
      showToast('Password reset email sent.', 'success');
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-dark dark:bg-background-dark light:bg-background-light flex flex-col justify-center items-center px-4 py-12 transition-colors duration-200">
      <div className="w-full max-w-md">
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
            Reset Password
          </h2>
          <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-500 mt-1">
            Enter your email to receive recovery instructions
          </p>
        </div>

        <div className="rounded-3xl bg-card-dark dark:bg-card-dark light:bg-white border border-spendlyBorder-dark dark:border-spendlyBorder-dark light:border-slate-200 p-6 sm:p-8 shadow-card-dark dark:shadow-card-dark light:shadow-card-light space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-financial-expense/10 border border-financial-expense/30 text-financial-expense text-xs leading-relaxed animate-fade-in">
              {errorMessage}
            </div>
          )}

          {isSent ? (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-financial-income/10 border border-financial-income/30 text-financial-income flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary dark:text-text-primary light:text-slate-900">
                  Reset link sent
                </h3>
                <p className="text-xs text-text-secondary dark:text-text-secondary light:text-slate-500 mt-1 max-w-xs mx-auto">
                  If an account exists with <strong className="text-text-primary">{email}</strong>, you will receive an email with instructions to reset your password.
                </p>
              </div>
              <Link to="/login" className="inline-block pt-2">
                <Button variant="primary" size="md">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full mt-2"
                size="lg"
              >
                Send Reset Link
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
