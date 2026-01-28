import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar/sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar userName={session?.user?.name || session?.user?.email} />
      <main className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {children}
      </main>
    </div>
  );
}
