'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations/auth';
import { resetPassword } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await resetPassword(data);
      if (res?.error) {
        setServerError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setServerError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Reset Link Sent</h3>
        <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
          Check your email for instructions to reset your password.
        </p>
        <div className="pt-4">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Reset Password</h2>
        <p className="text-xs text-slate-500">
          Enter your account email to receive a password recovery link
        </p>
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{serverError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email address" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
        </FormField>

        <Button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending Link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      <div className="border-t pt-4 text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-xs font-semibold text-blue-700 hover:underline gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
