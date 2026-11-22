import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const requestedNext = searchParams.get('next') ?? '/dashboard';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') && !requestedNext.includes('\\')
    ? requestedNext
    : '/dashboard';
  const providerError = searchParams.get('error_code') ?? searchParams.get('error');

  if (providerError) {
    const status = providerError === 'otp_expired' ? 'expired' : 'failed';
    return NextResponse.redirect(new URL(`/auth/confirmation?status=${status}`, origin));
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
    const status = error.code === 'otp_expired' || error.message.toLowerCase().includes('expired') ? 'expired' : 'failed';
    return NextResponse.redirect(new URL(`/auth/confirmation?status=${status}`, origin));
  }

  return NextResponse.redirect(new URL('/auth/confirmation?status=failed', origin));
}
