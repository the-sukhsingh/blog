// The login page has its own full-screen layout and does NOT use
// the admin sidebar. We export a plain passthrough layout here to
// override the parent admin/layout.tsx for this segment only.
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
