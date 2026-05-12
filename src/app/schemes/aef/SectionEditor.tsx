'use client';

import React, { useState, useCallback } from 'react';
import type { SchemeSection } from '@/lib/supabase/scheme-details';

interface SectionEditorProps {
  readonly schemeId: string;
  readonly sections: ReadonlyArray<SchemeSection>;
  readonly locale: string;
  readonly onSaved: () => void;
  readonly onCancel: () => void;
}

export default function SectionEditor({
  schemeId,
  sections,
  locale,
  onSaved,
  onCancel,
}: SectionEditorProps) {
  const [drafts, setDrafts] = useState<SchemeSection[]>([...sections]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDraft = useCallback((index: number, patch: Partial<SchemeSection>) => {
    setDrafts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch } as SchemeSection;
      return next;
    });
  }, []);

  const addSection = useCallback(() => {
    setDrafts((prev) => {
      const newSection: SchemeSection = {
        id: crypto.randomUUID(),
        scheme_id: schemeId,
        locale,
        section_key: `custom_${Date.now()}`,
        title: 'New Section',
        content: '',
        display_order: prev.length + 1,
        is_list: false,
      };
      return [...prev, newSection];
    });
  }, [schemeId, locale]);

  const removeSection = useCallback((index: number) => {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = drafts.map((d) => ({
        scheme_id: d.scheme_id,
        locale: d.locale,
        section_key: d.section_key,
        title: d.title,
        content: d.content,
        display_order: d.display_order,
        is_list: d.is_list,
      }));

      const res = await fetch(`/api/schemes/${encodeURIComponent(schemeId)}/sections`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: payload }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error ?? `HTTP ${res.status}`);
        return;
      }

      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [drafts, schemeId, onSaved]);

  return (
    <div className="space-y-6">
      {drafts.map((section, index) => (
        <div key={section.id ?? section.section_key} className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
              Section {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeSection(index)}
              className="text-xs text-red-500 hover:text-red-400 transition"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary mb-1">
                Title
              </label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => updateDraft(index, { title: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary mb-1">
                Section Key
              </label>
              <input
                type="text"
                value={section.section_key}
                onChange={(e) => updateDraft(index, { section_key: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary mb-1">
              Content
            </label>
            <textarea
              value={section.content}
              onChange={(e) => updateDraft(index, { content: e.target.value })}
              rows={6}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-text-primary leading-6 focus:border-accent focus:outline-none font-mono"
              placeholder="Use | to separate list items"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                checked={section.is_list}
                onChange={(e) => updateDraft(index, { is_list: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              Render as numbered list
            </label>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-tertiary">Order</span>
              <input
                type="number"
                value={section.display_order}
                onChange={(e) => updateDraft(index, { display_order: parseInt(e.target.value, 10) || 0 })}
                className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-sm text-text-primary text-center focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="w-full rounded-lg border border-dashed border-border py-3 text-sm text-text-secondary transition hover:border-accent hover:text-accent"
      >
        + Add Section
      </button>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg px-5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-lg border border-border px-5 py-2.5 text-sm text-text-secondary transition hover:border-accent hover:text-accent disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
