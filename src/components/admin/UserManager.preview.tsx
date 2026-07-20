/* Hallmark · component-preview: UserManager · states: 8 states wrapper */
"use client";

import { AlertCircle, Check, Loader2, Shield, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserManagerPreview() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 bg-background border border-border rounded-2xl my-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          UserManager — Component States Preview
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visual verification wrapper showing the 8 interactive states for the
          primary inputs, buttons, and badges.
        </p>
      </div>

      <div className="border-t border-border pt-8 space-y-8">
        {/* Buttons Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Buttons</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1.5 p-3 border border-border/60 rounded-xl bg-card">
              <span className="text-[11px] font-mono text-muted-foreground">
                1. Default
              </span>
              <Button>Create User</Button>
            </div>

            <div className="flex flex-col gap-1.5 p-3 border border-border/60 rounded-xl bg-card">
              <span className="text-[11px] font-mono text-muted-foreground">
                2. Hover
              </span>
              <Button className="bg-primary/80">Create User</Button>
            </div>

            <div className="flex flex-col gap-1.5 p-3 border border-border/60 rounded-xl bg-card">
              <span className="text-[11px] font-mono text-muted-foreground">
                3. Focus
              </span>
              <Button className="border-ring ring-2 ring-ring/50">
                Create User
              </Button>
            </div>

            <div className="flex flex-col gap-1.5 p-3 border border-border/60 rounded-xl bg-card">
              <span className="text-[11px] font-mono text-muted-foreground">
                4. Active (Pressed)
              </span>
              <Button className="translate-y-px opacity-90 scale-[0.97] transition-all">
                Create User
              </Button>
            </div>

            <div className="flex flex-col gap-1.5 p-3 border border-border/60 rounded-xl bg-card">
              <span className="text-[11px] font-mono text-muted-foreground">
                5. Disabled
              </span>
              <Button disabled>Create User</Button>
            </div>

            <div className="flex flex-col gap-1.5 p-3 border border-border/60 rounded-xl bg-card">
              <span className="text-[11px] font-mono text-muted-foreground">
                6. Loading
              </span>
              <Button disabled>
                <Loader2 size={12} className="animate-spin mr-1.5" />
                Creating...
              </Button>
            </div>

            <div className="flex flex-col gap-1.5 p-3 border border-border/60 rounded-xl bg-card">
              <span className="text-[11px] font-mono text-muted-foreground">
                7. Error
              </span>
              <Button variant="destructive">
                <AlertCircle size={12} className="mr-1.5" />
                Failed
              </Button>
            </div>

            <div className="flex flex-col gap-1.5 p-3 border border-border/60 rounded-xl bg-card">
              <span className="text-[11px] font-mono text-muted-foreground">
                8. Success
              </span>
              <Button className="bg-emerald-600 text-white hover:bg-emerald-600/90 border-transparent">
                <Check size={12} className="mr-1.5" />
                Created
              </Button>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Input Fields
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {/* 1. Default */}
            <div className="flex flex-col gap-1.5 p-4 border border-border/60 rounded-xl bg-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  1. Default
                </span>
                <Label htmlFor="input-default">Email</Label>
              </div>
              <Input id="input-default" placeholder="name@example.com" />
              <div className="min-h-5 text-[11px] text-muted-foreground">
                Provide a unique email address.
              </div>
            </div>

            {/* 2. Hover */}
            <div className="flex flex-col gap-1.5 p-4 border border-border/60 rounded-xl bg-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  2. Hover
                </span>
                <Label htmlFor="input-hover">Email</Label>
              </div>
              <Input
                id="input-hover"
                placeholder="name@example.com"
                className="bg-muted/10 border-input"
              />
              <div className="min-h-5 text-[11px] text-muted-foreground">
                Provide a unique email address.
              </div>
            </div>

            {/* 3. Focus */}
            <div className="flex flex-col gap-1.5 p-4 border border-border/60 rounded-xl bg-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  3. Focus / Active
                </span>
                <Label htmlFor="input-focus">Email</Label>
              </div>
              <Input
                id="input-focus"
                placeholder="name@example.com"
                className="border-ring ring-3 ring-ring/50"
              />
              <div className="min-h-5 text-[11px] text-muted-foreground">
                Provide a unique email address.
              </div>
            </div>

            {/* 4. Disabled */}
            <div className="flex flex-col gap-1.5 p-4 border border-border/60 rounded-xl bg-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  4. Disabled
                </span>
                <Label htmlFor="input-disabled" className="opacity-50">
                  Email
                </Label>
              </div>
              <Input
                id="input-disabled"
                placeholder="name@example.com"
                disabled
              />
              <div className="min-h-5 text-[11px] text-muted-foreground opacity-50">
                Provide a unique email address.
              </div>
            </div>

            {/* 5. Loading */}
            <div className="flex flex-col gap-1.5 p-4 border border-border/60 rounded-xl bg-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  5. Loading
                </span>
                <Label htmlFor="input-loading">Email</Label>
              </div>
              <div className="relative">
                <Input
                  id="input-loading"
                  placeholder="Verifying availability..."
                  className="pr-9"
                />
                <Loader2
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground animate-spin"
                />
              </div>
              <div className="min-h-5 text-[11px] text-muted-foreground">
                Checking server data...
              </div>
            </div>

            {/* 6. Error */}
            <div className="flex flex-col gap-1.5 p-4 border border-border/60 rounded-xl bg-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  6. Error
                </span>
                <Label htmlFor="input-error" className="text-destructive">
                  Email
                </Label>
              </div>
              <Input
                id="input-error"
                placeholder="name@example.com"
                defaultValue="invalid-email"
                className="border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                aria-invalid="true"
                aria-describedby="input-error-text"
              />
              <div
                id="input-error-text"
                className="min-h-5 text-[11px] text-destructive font-medium flex items-center gap-1"
              >
                <AlertCircle size={10} /> Invalid email format. Please check
                spelling.
              </div>
            </div>

            {/* 7. Success */}
            <div className="flex flex-col gap-1.5 p-4 border border-border/60 rounded-xl bg-card">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-muted-foreground">
                  7. Success
                </span>
                <Label htmlFor="input-success" className="text-foreground">
                  Email
                </Label>
              </div>
              <div className="relative">
                <Input
                  id="input-success"
                  placeholder="name@example.com"
                  defaultValue="writer@editorial.studio"
                  className="border-emerald-600 focus-visible:border-emerald-600 focus-visible:ring-emerald-600/20 pr-9"
                />
                <Check
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600"
                />
              </div>
              <div className="min-h-5 text-[11px] text-emerald-600 font-medium">
                Email is verified and available.
              </div>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Role Badges</h2>
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col gap-1.5 p-3 border border-border/60 rounded-xl bg-card min-w-[120px]">
              <span className="text-[11px] font-mono text-muted-foreground">
                Admin Badge
              </span>
              <Badge variant="default" className="w-fit">
                <Shield size={10} className="mr-1" />
                ADMIN
              </Badge>
            </div>
            <div className="flex flex-col gap-1.5 p-3 border border-border/60 rounded-xl bg-card min-w-[120px]">
              <span className="text-[11px] font-mono text-muted-foreground">
                Editor Badge
              </span>
              <Badge variant="secondary" className="w-fit">
                <User size={10} className="mr-1" />
                EDITOR
              </Badge>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
