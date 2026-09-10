import CommitteeGuard from '@/components/CommitteeGuard';
import CommitteeSidebar from '@/components/CommitteeSidebar';
import { colors } from '@/lib/colors';

export default function CommitteeLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommitteeGuard>
      <div className="flex min-h-screen" style={{ backgroundColor: colors.paper }}>
        <CommitteeSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </CommitteeGuard>
  );
}
