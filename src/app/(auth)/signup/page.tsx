'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupInput } from '@/lib/validations/auth';
import { signUp } from '@/lib/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/shared/form-field';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupInput) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await signUp(data);
      if (res?.error) {
        setServerError(res.error);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setServerError(err.message || 'An error occurred during registration');
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
        <h3 className="text-lg font-bold text-slate-900">Check your email</h3>
        <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
          We sent a verification link to your email. Click the link to activate your student profile and start finding eligible programmes.
        </p>
        <div className="pt-4">
          <Link href="/login">
            <Button variant="outline" size="sm">
              Return to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Create Student Account</h2>
        <p className="text-xs text-slate-500">
          Begin your rule-based eligibility evaluation for Germany & Austria
        </p>
      </div>

      {serverError && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{serverError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Full Name" htmlFor="fullName" error={errors.fullName?.message} required>
          <Input
            id="fullName"
            placeholder="e.g. Rahul Sharma"
            autoComplete="name"
            {...register('fullName')}
          />
        </FormField>

        <FormField label="Email address" htmlFor="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={errors.password?.message} required>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            {...register('password')}
          />
        </FormField>

        <FormField
          label="Confirm Password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            {...register('confirmPassword')}
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
              Creating Account...
            </>
          ) : (
            'Create Account & Start Wizard'
          )}
        </Button>
      </form>

      <div className="border-t pt-4 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-blue-700 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
