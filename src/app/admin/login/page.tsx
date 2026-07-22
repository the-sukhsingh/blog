import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    /* CONFIG:ADMIN_LOGIN_META_DESC */ "Blog CMS Administration" /* /CONFIG:ADMIN_LOGIN_META_DESC */,
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-block rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
            CMS
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            {/* CONFIG:ADMIN_LOGIN_TITLE */}Welcome back{/* /CONFIG:ADMIN_LOGIN_TITLE */}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {/* CONFIG:ADMIN_LOGIN_DESC */}Sign in to your account to continue.{/* /CONFIG:ADMIN_LOGIN_DESC */}
          </p>
        </div>

        {/*
          Suspense is required here because LoginForm calls useSearchParams(),
          which opts it into dynamic rendering during SSR.
        */}
        <Suspense
          fallback={
            <div className="h-56 rounded-xl border border-border bg-card" />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
