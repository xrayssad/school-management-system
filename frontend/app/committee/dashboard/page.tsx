'use client';

import { useEffect, useState } from 'react';
import { Users, GraduationCap, Wallet, TrendingDown, Megaphone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { committeeApi } from '@/lib/api';
import type { CommitteeDashboardStats } from '@/lib/types';
import { colors } from '@/lib/colors';

function formatMoney(amount: number): string {
  return `TSh ${amount.toLocaleString('sw-TZ')}`;
}

export default function CommitteeDashboardPage() {
  const [stats, setStats] = useState<CommitteeDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const data = await committeeApi.dashboard();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Imeshindikana kupakia dashibodi.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => { cancelled = true; };
  }, []);

  const statCards = stats ? [
    { label: 'Wanafunzi', value: String(stats.total_students), icon: GraduationCap, href: '/committee/students' },
    { label: 'Walimu', value: String(stats.total_teachers), icon: Users, href: '/committee/teachers' },
    { label: 'Mapato (mwezi)', value: formatMoney(stats.month_collections), icon: Wallet, href: '/committee/finance' },
    { label: 'Matumizi (mwezi)', value: formatMoney(stats.month_expenses), icon: TrendingDown, href: '/committee/finance' },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>
          Dashibodi ya Kamati
        </h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>
          Muhtasari wa haraka wa madrasa
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm" style={{ color: colors.stone }}>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: colors.primary }} />
          Inapakia...
        </div>
      )}

      {error && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {stats && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.label} href={item.href} className="group rounded-xl border bg-white p-5 transition-all hover:shadow-md" style={{ borderColor: colors.line }}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: colors.soft }}>
                      <Icon size={20} style={{ color: colors.primary }} />
                    </div>
                    <ArrowRight size={16} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: colors.primary }} />
                  </div>
                  <p className="text-xs font-medium" style={{ color: colors.stone }}>{item.label}</p>
                  <p className="mt-1 text-xl font-semibold" style={{ color: colors.primary }}>{item.value}</p>
                </Link>
              );
            })}
          </div>

          <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: colors.line }}>
              <div className="flex items-center gap-2">
                <Megaphone size={18} style={{ color: colors.primary }} />
                <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Matangazo ya hivi karibuni</h2>
              </div>
              <Link href="/committee/announcements" className="text-xs font-medium hover:underline" style={{ color: colors.primary }}>
                Ona yote
              </Link>
            </div>
            {stats.recent_announcements.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna matangazo bado.</p>
            ) : (
              <ul>
                {stats.recent_announcements.map((announcement) => (
                  <li key={announcement.id} className="border-b px-5 py-4 last:border-b-0" style={{ borderColor: colors.line }}>
                    <p className="text-sm font-medium" style={{ color: colors.ink }}>{announcement.title}</p>
                    <p className="mt-1 text-xs" style={{ color: colors.stone }}>
                      {new Date(announcement.created_at).toLocaleDateString('sw-TZ')}
                      {announcement.target_class_name ? ` · ${announcement.target_class_name}` : ' · Wanafunzi wote'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
