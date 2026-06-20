import { Navbar } from "@/components/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl">{children}</div>
    </div>
  );
}
