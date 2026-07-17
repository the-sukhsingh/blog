"use client";

import { Calendar, Key, Loader2, Mail, Plus, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "EDITOR";
  createdAt: string | Date;
}

interface UserManagerProps {
  initialUsers: UserData[];
}

export default function UserManager({ initialUsers }: UserManagerProps) {
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"EDITOR" | "ADMIN">("EDITOR");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("EDITOR");
    setError(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || null,
          email: email.trim().toLowerCase(),
          password: password,
          role,
        }),
      });

      const data = (await res.json()) as { error?: string } & UserData;

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to create user.");
      }

      setUsers((prev) => [data, ...prev]);
      setSheetOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          User Database Directory ({users.length})
        </h2>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setSheetOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all duration-150 cursor-pointer active:translate-y-px"
        >
          <Plus size={13} />
          Create User
        </button>
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-border/80 overflow-hidden bg-card shadow-sm shadow-muted/5">
        <table className="w-full text-sm border-collapse">
          <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-wider w-36">
                Role
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-wider w-44">
                Joined Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-16 text-center text-xs text-muted-foreground"
                >
                  No users found in directory.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-muted/15 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-7 items-center justify-center rounded-full bg-muted text-muted-foreground border border-border/50">
                        <User size={13} />
                      </div>
                      <span className="font-bold text-foreground text-sm">
                        {u.name ?? "Staff Writer"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <Mail size={12} className="opacity-75" />
                      {u.email}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        u.role === "ADMIN"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Shield size={9} />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-muted-foreground/80 font-mono text-xs">
                      <Calendar size={12} className="opacity-75" />
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite/Add User Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md flex flex-col p-6"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2 text-base font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/10">
                <User size={14} />
              </span>
              Create User Account
            </SheetTitle>
            <SheetDescription>
              Create a new user account for an editor or admin.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleCreateUser}
            className="space-y-4 pt-4 border-t border-border flex-1 flex flex-col"
          >
            <div className="space-y-4 flex-1">
              {error && (
                <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-xs text-destructive font-semibold">
                  {error}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="user-name"
                  className="text-xs font-semibold text-foreground/80"
                >
                  Display Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  disabled={submitting}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5 disabled:opacity-60"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="user-email"
                  className="text-xs font-semibold text-foreground/80"
                >
                  Email <span className="text-destructive">*</span>
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  disabled={submitting}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5 disabled:opacity-60"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="user-password"
                  className="text-xs font-semibold text-foreground/80"
                >
                  Temporary Password <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Key
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    id="user-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    disabled={submitting}
                    className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5 disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label
                  htmlFor="user-role"
                  className="text-xs font-semibold text-foreground/80"
                >
                  System Role
                </label>
                <select
                  id="user-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  disabled={submitting}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5 disabled:opacity-60"
                >
                  <option value="EDITOR">
                    Editor (Write &amp; Edit Content)
                  </option>
                  <option value="ADMIN">Admin (Full Site Control)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                disabled={submitting}
                className="rounded-lg border border-border px-4 py-2 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !email.trim() || !password.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 cursor-pointer active:translate-y-px transition-all"
              >
                {submitting && <Loader2 size={12} className="animate-spin" />}
                Create Account
              </button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
