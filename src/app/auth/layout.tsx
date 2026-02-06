export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-soft bg-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">{children}</div>
    </div>
  );
}

