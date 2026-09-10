'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Megaphone, Plus, Send } from 'lucide-react';
import { committeeApi } from '@/lib/api';
import type { CommitteeAnnouncement, SchoolClass } from '@/lib/types';
import { colors } from '@/lib/colors';

export default function CommitteeAnnouncementsPage() {
  const [items, setItems] = useState<CommitteeAnnouncement[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetClassId, setTargetClassId] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [announcements, classList] = await Promise.all([
        committeeApi.listAnnouncements(),
        committeeApi.listClasses(),
      ]);
      setItems(announcements);
      setClasses(classList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Imeshindikana kupakia matangazo.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSuccess('');
    setError('');

    if (!title.trim() || !content.trim()) {
      setError('Jaza kichwa na maudhui ya tangazo.');
      return;
    }

    setSaving(true);
    try {
      await committeeApi.createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        target_class_id: targetClassId || null,
      });
      setTitle('');
      setContent('');
      setTargetClassId('');
      setSuccess('Tangazo limetumwa kwa mafanikio.');
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Imeshindikana kutuma tangazo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-semibold" style={{ color: colors.primary }}>Matangazo</h1>
        <p className="mt-1 text-sm" style={{ color: colors.stone }}>Tuma na simamia matangazo kwa wanafunzi</p>
      </div>

      {error && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2', color: '#b91c1c' }}>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 rounded border px-4 py-3 text-sm" style={{ borderColor: colors.line, backgroundColor: colors.soft, color: colors.primary }}>
          {success}
        </div>
      )}

      <div className="mb-8 rounded-xl border bg-white p-6" style={{ borderColor: colors.line }}>
        <div className="mb-5 flex items-center gap-2">
          <Plus size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Tangazo jipya</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Kichwa cha tangazo</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: colors.line, backgroundColor: colors.soft }}
              placeholder="Mfano: Kikao cha wazazi"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Maudhui ya tangazo</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: colors.line, backgroundColor: colors.soft }}
              placeholder="Andika ujumbe kamili hapa..."
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold" style={{ color: colors.primary }}>Lengwa</label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none"
              style={{ borderColor: colors.line, backgroundColor: colors.soft }}
            >
              <option value="">Wanafunzi wote</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: colors.primary }}
          >
            <Send size={16} />
            {saving ? 'Inatuma...' : 'Tuma tangazo'}
          </button>
        </form>
      </div>

      <div className="rounded-xl border bg-white" style={{ borderColor: colors.line }}>
        <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: colors.line }}>
          <Megaphone size={18} style={{ color: colors.primary }} />
          <h2 className="text-sm font-semibold" style={{ color: colors.primary }}>Matangazo yaliyotumwa</h2>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 px-5 py-8 text-sm" style={{ color: colors.stone }}>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: colors.primary }} />
            Inapakia...
          </div>
        ) : items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm" style={{ color: colors.stone }}>Hakuna matangazo bado.</p>
        ) : (
          <ul>
            {items.map((announcement) => (
              <li key={announcement.id} className="border-b px-5 py-4 last:border-b-0" style={{ borderColor: colors.line }}>
                <p className="text-sm font-medium" style={{ color: colors.ink }}>{announcement.title}</p>
                <p className="mt-1.5 text-sm leading-relaxed" style={{ color: colors.stone }}>{announcement.content}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs" style={{ color: colors.stone }}>
                  <span>{new Date(announcement.created_at).toLocaleString('sw-TZ')}</span>
                  <span>·</span>
                  <span>{announcement.target_class_name || 'Wanafunzi wote'}</span>
                  <span>·</span>
                  <span>Waliofikiwa: {announcement.reach_count}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
