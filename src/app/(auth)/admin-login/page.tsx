'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { adminSignIn } from '@/lib/admin/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminSignIn(values);
      if (result.error) setError(result.error);
      else { router.replace('/admin'); router.refresh(); }
    } catch {
      setError('We could not sign you in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f0f4] text-[#173b5b]"><ShieldCheck aria-hidden="true" /></span>
        <h1 className="text-2xl font-semibold tracking-tight text-[#142f4b]">Admin sign in</h1>
        <p className="text-sm leading-6 text-slate-600">Use your UniMatch administrator account to manage the university catalogue.</p>
      </div>
      {error && <p role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="admin-email" className="text-sm font-medium text-slate-800">Email</label>
          <Input id="admin-email" type="email" autoComplete="username" {...register('email')} />
          {errors.email && <p className="text-xs text-rose-700">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="admin-password" className="text-sm font-medium text-slate-800">Password</label>
          <Input id="admin-password" type="password" autoComplete="current-password" {...register('password')} />
          {errors.password && <p className="text-xs text-rose-700">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={loading} className="w-full bg-[#173b5b] text-white hover:bg-[#102c45]">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : 'Sign in to admin'}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-600"><Link href="/login" className="font-medium text-[#173b5b] underline underline-offset-4">Sign in as a student</Link></p>
    </div>
  );
}
