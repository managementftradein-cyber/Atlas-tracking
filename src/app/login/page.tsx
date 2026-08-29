import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="grid min-h-[calc(100vh-70px)] place-items-center px-5 text-slate-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
