import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
};

export default function UsersPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage admin and editor accounts. Only admins can access this page.
          </p>
        </div>
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          + Invite User
        </button>
      </div>

      <div className="rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                Joined
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No users found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
