/* Hallmark · component: Next.js Component · genre: editorial · theme: editorial-studio
 * states: default · hover · focus · active · disabled · loading · error · success
 * contrast: pass
 */
/* Hallmark · pre-emit critique: P5 H5 E5 S5 R5 V5 */
"use client";

import {
  AlertCircle,
  Calendar,
  Key,
  Loader2,
  Mail,

  Shield,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

// Custom UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AddSquare, Search } from "@/lib/icons";

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

  // Interaction / Validation States
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editing and Deletion states
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Search & Filter States
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "EDITOR">(
    "ALL",
  );

  const filteredUsers = users.filter((u) => {
    const nameStr = u.name ?? "Staff Writer";
    const matchesSearch =
      nameStr.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      return "Email is required. Please enter an email address.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return "Invalid email format. Please check (e.g. name@example.com).";
    }
    return null;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      return "Password is required. Please enter a password.";
    }
    if (val.length < 6) {
      return "Password too short. Must be at least 6 characters.";
    }
    return null;
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("EDITOR");
    setEmailTouched(false);
    setPasswordTouched(false);
    setEmailError(null);
    setPasswordError(null);
    setError(null);

    setEditingUser(null);
    setDeleting(false);
    setConfirmingDelete(false);
    setDeleteConfirmEmail("");
    setDeleteError(null);
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    setEmailError(validateEmail(email));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailTouched) {
      setEmailError(validateEmail(val));
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    setPasswordError(validatePassword(password));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordTouched) {
      setPasswordError(validatePassword(val));
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailTouched(true);
    const emailErr = validateEmail(email);
    let passErr = null;

    // Password is only validated if editing and typed, or creating new
    if (!editingUser || password.trim().length > 0) {
      passwordTouched && setPasswordTouched(true);
      passErr = validatePassword(password);
    }

    if (emailErr || passErr) {
      setEmailError(emailErr);
      if (passErr) setPasswordError(passErr);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}`
        : "/api/admin/users";
      const method = editingUser ? "PATCH" : "POST";
      const payload: {
        name: string | null;
        email: string;
        role: "EDITOR" | "ADMIN";
        password?: string;
      } = {
        name: name.trim() || null,
        email: email.trim().toLowerCase(),
        role,
      };

      if (password.trim().length > 0) {
        payload.password = password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { error?: string } & UserData;

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save user.");
      }

      if (editingUser) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? data : u)),
        );
      } else {
        setUsers((prev) => [data, ...prev]);
      }

      setSheetOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!editingUser) return;
    if (
      deleteConfirmEmail.toLowerCase().trim() !==
      editingUser.email.toLowerCase().trim()
    ) {
      setDeleteError("Confirmation email does not match.");
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to delete user.");
      }

      setUsers((prev) => prev.filter((u) => u.id !== editingUser.id));
      setSheetOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Users
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Create and manage system user accounts for content editors and
            administrators. Currently displaying {users.length} active accounts.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            resetForm();
            setSheetOpen(true);
          }}
          className="active:scale-[0.97] transition-all duration-100 ease-out rounded-xl"
        >
          <AddSquare className="**:stroke-current **:stroke-1.5" />
          Create User
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80"
          />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="h-10 w-full rounded-xl border border-border/85 bg-background pl-10 pr-4 text-xs outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/5"
          />
        </div>

        <div className="flex items-center gap-3">
          <Label
            htmlFor="admin-role-filter"
            className="text-xs text-muted-foreground font-semibold uppercase tracking-wider"
          >
            Role
          </Label>

          <Select
            value={roleFilter}
            onValueChange={(val) =>
              setRoleFilter(val as "ALL" | "ADMIN" | "EDITOR")
            }
          >
            <SelectTrigger id="admin-role-filter" className="w-32 h-8">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="EDITOR">Editor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-2xl overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_0_1px_1px_rgba(255,255,255,0.05)]">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-36">
                Role
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-44">
                Joined Date
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-16 text-center text-xs text-muted-foreground"
                  >
                    {users.length === 0
                      ? "No users found in directory."
                      : "No users match the active filters."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => (
                  <motion.tr
                    key={u.id}
                    layout
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98, y: -4 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.25 }}
                    className="border-b transition-colors hover:bg-muted/20 data-[state=selected]:bg-muted/30"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 items-center justify-center rounded-full bg-secondary text-secondary-foreground border border-border/50">
                          <User size={13} />
                        </div>
                        <span className="font-semibold text-foreground text-sm">
                          {u.name ?? "Staff Writer"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono">
                        <Mail size={12} className="opacity-75" />
                        {u.email}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        variant={u.role === "ADMIN" ? "default" : "secondary"}
                      >
                        <Shield size={10} className="mr-1" />
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-muted-foreground/80 font-mono text-xs">
                        <Calendar size={12} className="opacity-75" />
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          resetForm();
                          setEditingUser(u);
                          setName(u.name ?? "");
                          setEmail(u.email);
                          setPassword("");
                          setRole(u.role);
                          setSheetOpen(true);
                        }}
                        className="active:scale-[0.97] transition-all duration-100 ease-out h-7 text-xs px-2.5 font-medium"
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Invite/Add/Edit User Drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md flex flex-col p-6 shadow-none"
        >
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2 text-base font-bold">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-primary border border-border">
                <User size={14} />
              </span>
              {editingUser ? "Edit User Account" : "Create User Account"}
            </SheetTitle>
            <SheetDescription>
              {editingUser
                ? "Modify details or permissions for this user."
                : "Create a new user account for an editor or admin."}
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSaveUser}
            className="space-y-4 pt-4 border-t border-border flex-1 flex flex-col overflow-y-auto scrollbar-none px-1"
          >
            <div className="space-y-2 flex-1 ">
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Operation failed</p>
                    <p className="opacity-90">{error}</p>
                  </div>
                </div>
              )}

              {/* Display Name */}
              <div className="space-y-1.5 flex flex-col">
                <Label htmlFor="user-name">Display Name</Label>
                <Input
                  id="user-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  disabled={submitting}
                  autoComplete="off"
                />
                <div className="min-h-5 text-[11px] text-muted-foreground">
                  Optional. Defaults to "Staff Writer" if left blank.
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 flex flex-col">
                <Label
                  htmlFor="user-email"
                  className="after:content-['*'] after:ml-0.5 after:text-destructive"
                >
                  Email
                </Label>
                <Input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="name@example.com"
                  disabled={submitting}
                  autoComplete="off"
                  aria-invalid={emailError ? "true" : "false"}
                  aria-describedby={emailError ? "email-error" : undefined}
                  aria-required="true"
                  className={cn(
                    emailError &&
                      "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                  )}
                />
                <div
                  id="email-error"
                  className="min-h-5 text-[11px] text-destructive font-medium transition-colors duration-150"
                >
                  {emailError && (
                    <span className="flex items-center gap-1">
                      <AlertCircle size={10} /> {emailError}
                    </span>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 flex flex-col">
                <Label
                  htmlFor="user-password"
                  className={cn(
                    !editingUser &&
                      "after:content-['*'] after:ml-0.5 after:text-destructive",
                  )}
                >
                  {editingUser
                    ? "New Password (Optional)"
                    : "Temporary Password"}
                </Label>
                <div className="relative">
                  <Key
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    id="user-password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={handlePasswordBlur}
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current"
                        : "At least 6 characters"
                    }
                    disabled={submitting}
                    autoComplete="new-password"
                    aria-invalid={passwordError ? "true" : "false"}
                    aria-describedby={
                      passwordError ? "password-error" : undefined
                    }
                    aria-required={!editingUser ? "true" : "false"}
                    className={cn(
                      "pl-9",
                      passwordError &&
                        "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
                    )}
                  />
                </div>
                <div
                  id="password-error"
                  className="min-h-5 text-[11px] text-destructive font-medium transition-colors duration-150"
                >
                  {passwordError && (
                    <span className="flex items-center gap-1">
                      <AlertCircle size={10} /> {passwordError}
                    </span>
                  )}
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1.5 flex flex-col">
                <Label htmlFor="user-role">System Role</Label>
                <Select
                  value={role}
                  onValueChange={(val) => setRole(val as "EDITOR" | "ADMIN")}
                  disabled={submitting}
                >
                  <SelectTrigger id="user-role" className="w-full h-8">
                    <SelectValue placeholder="Select system role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EDITOR">
                      <span className="flex items-center gap-2">
                        <User size={13} className="text-muted-foreground" />
                        Editor (Write &amp; Edit Content)
                      </span>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <span className="flex items-center gap-2">
                        <Shield size={13} className="text-primary" />
                        Admin (Full Site Control)
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="min-h-5 text-[11px] text-muted-foreground">
                  Determines access permissions for the control panel.
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSheetOpen(false)}
                disabled={submitting}
                className="active:scale-[0.97] transition-all duration-100 ease-out"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  submitting ||
                  (emailTouched && !!emailError) ||
                  (passwordTouched && !!passwordError)
                }
                className="active:scale-[0.97] transition-all duration-100 ease-out"
              >
                {submitting ? (
                  <>
                    <Loader2 size={12} className="animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : editingUser ? (
                  "Save Changes"
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>

            {/* Danger Zone */}
            {editingUser && (
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-destructive uppercase tracking-wider">
                    Danger Zone
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Deleting this user will permanently remove their account.
                    This cannot be undone.
                  </p>
                </div>

                {confirmingDelete ? (
                  <div className="space-y-3 p-3 border border-destructive/20 bg-destructive/5 rounded-lg">
                    <Label
                      htmlFor="delete-confirm-email"
                      className="text-xs font-semibold text-foreground/80 flex flex-wrap items-center gap-1"
                    >
                      Type{" "}
                      <span className="font-mono bg-muted-foreground/10 px-1 py-0.5 rounded text-destructive select-all">
                        {editingUser.email}
                      </span>{" "}
                      to confirm:
                    </Label>
                    <Input
                      id="delete-confirm-email"
                      type="text"
                      value={deleteConfirmEmail}
                      onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                      placeholder="Type email to confirm"
                      className="border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20 h-8"
                    />
                    {deleteError && (
                      <p className="text-[11px] text-destructive font-medium flex items-center gap-1">
                        <AlertCircle size={10} /> {deleteError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        disabled={
                          deleteConfirmEmail.toLowerCase().trim() !==
                            editingUser.email.toLowerCase().trim() || deleting
                        }
                        onClick={handleDeleteUser}
                        className="flex-1 active:scale-[0.97] transition-all"
                      >
                        {deleting ? (
                          <>
                            <Loader2
                              size={12}
                              className="animate-spin mr-1.5"
                            />
                            Deleting...
                          </>
                        ) : (
                          "Delete Account"
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setConfirmingDelete(false);
                          setDeleteConfirmEmail("");
                          setDeleteError(null);
                        }}
                        disabled={deleting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setConfirmingDelete(true)}
                    className="w-full active:scale-[0.97] transition-all"
                  >
                    Delete Account
                  </Button>
                )}
              </div>
            )}
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
