'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import type { Project } from '@/types';
import { PROJECT_STAGES, PROJECT_PLATFORMS, PROJECT_SECTORS, PROJECT_SEEKING } from '@/types';
import { ProjectCard } from '@/components/ProjectCard';
import { Textarea } from '@/components/ui/Textarea';

interface ProjectFormProps {
  /** Prefill for edit mode. Omit for create mode. */
  initialProject?: Project;
  currentUserId: string;
}

type FormState = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  web_url: string;
  app_store_url: string;
  play_store_url: string;
  media_url: string;
  traction: string;
  contact_url: string;
  stage: string;
  status: 'draft' | 'published';
  platform: string[];
  sector: string[];
  seeking: string[];
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function toPreview(form: FormState, currentUserId: string): Project {
  return {
    id: 'preview',
    slug: form.slug || 'preview',
    created_by: currentUserId,
    makers: [currentUserId],
    name: form.name || 'Project name',
    tagline: form.tagline || null,
    description: form.description || null,
    web_url: form.web_url || null,
    app_store_url: form.app_store_url || null,
    play_store_url: form.play_store_url || null,
    media_url: form.media_url || null,
    thumbnail_url: null,
    stage: (form.stage as Project['stage']) || null,
    status: form.status,
    platform: form.platform,
    sector: form.sector,
    seeking: form.seeking,
    traction: form.traction || null,
    contact_url: form.contact_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function ProjectForm({ initialProject, currentUserId }: ProjectFormProps) {
  const router = useRouter();
  const isEdit = !!initialProject;

  const [form, setForm] = useState<FormState>({
    name: initialProject?.name ?? '',
    slug: initialProject?.slug ?? '',
    tagline: initialProject?.tagline ?? '',
    description: initialProject?.description ?? '',
    web_url: initialProject?.web_url ?? '',
    app_store_url: initialProject?.app_store_url ?? '',
    play_store_url: initialProject?.play_store_url ?? '',
    media_url: initialProject?.media_url ?? '',
    traction: initialProject?.traction ?? '',
    contact_url: initialProject?.contact_url ?? '',
    stage: initialProject?.stage ?? '',
    status: initialProject?.status ?? 'draft',
    platform: initialProject?.platform ?? [],
    sector: initialProject?.sector ?? [],
    seeking: initialProject?.seeking ?? [],
  });

  const [slugManual, setSlugManual] = useState(isEdit);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-derive slug from name (create mode only, until manually edited)
  useEffect(() => {
    if (!slugManual && !isEdit) {
      setForm((f) => ({ ...f, slug: slugify(f.name) }));
      setSlugAvailable(null);
    }
  }, [form.name, slugManual, isEdit]);

  // Slug uniqueness check (debounced)
  const checkSlug = useCallback(async (slug: string) => {
    if (!slug) { setSlugAvailable(null); return; }
    if (isEdit && slug === initialProject?.slug) { setSlugAvailable(true); return; }
    setCheckingSlug(true);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(slug)}`);
      setSlugAvailable(res.status === 404);
    } catch {
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  }, [isEdit, initialProject?.slug]);

  useEffect(() => {
    const id = setTimeout(() => { if (form.slug) checkSlug(form.slug); }, 500);
    return () => clearTimeout(id);
  }, [form.slug, checkSlug]);

  function set(field: keyof FormState, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
    setError(null);
  }

  function toggleMulti(field: 'platform' | 'sector' | 'seeking', value: string) {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));
  }

  async function handleSave(statusOverride?: 'draft' | 'published') {
    setSaving(true);
    setError(null);
    const payload = {
      ...form,
      status: statusOverride ?? form.status,
      tagline: form.tagline || null,
      description: form.description || null,
      web_url: form.web_url || null,
      app_store_url: form.app_store_url || null,
      play_store_url: form.play_store_url || null,
      media_url: form.media_url || null,
      traction: form.traction || null,
      contact_url: form.contact_url || null,
      stage: form.stage || null,
    };
    try {
      let res: Response;
      if (isEdit) {
        res = await fetch(`/api/projects/${initialProject!.slug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Save failed');
        return;
      }
      const saved: Project = await res.json();
      router.push(`/showcase/${saved.slug}`);
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initialProject) return;
    if (!confirm('Delete this project? This cannot be undone.')) return;
    setSaving(true);
    try {
      await fetch(`/api/projects/${initialProject.slug}`, { method: 'DELETE' });
      router.push('/showcase');
    } catch {
      setError('Delete failed');
      setSaving(false);
    }
  }

  const preview = toPreview(form, currentUserId);

  const slugStatus = checkingSlug
    ? 'checking…'
    : slugAvailable === true
    ? '✓ available'
    : slugAvailable === false
    ? '✗ taken'
    : '';

  const slugStatusColor =
    slugAvailable === true
      ? 'text-green-400'
      : slugAvailable === false
      ? 'text-red-400'
      : 'text-text-tertiary';

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* ── Form column ──────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Name */}
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Project name *
          </label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="My Awesome Project"
            maxLength={120}
            className="w-full bg-transparent text-2xl font-semibold tracking-tight text-text-primary placeholder:text-text-tertiary border-b-2 border-accent/40 focus:border-accent focus:outline-none pb-1.5 transition-colors"
          />
        </div>

        {/* Slug */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
              Slug (URL)
            </label>
            <span className={`font-mono text-[9px] ${slugStatusColor}`}>{slugStatus}</span>
          </div>
          <div className="flex items-center gap-1.5 border-b border-white/10 pb-1.5 text-sm text-text-secondary">
            <span className="text-text-tertiary">/showcase/</span>
            <input
              value={form.slug}
              onChange={(e) => {
                setSlugManual(true);
                set('slug', slugify(e.target.value));
              }}
              placeholder="my-project"
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Tagline
          </label>
          <input
            value={form.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            placeholder="One sentence that explains what you built"
            maxLength={200}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary border-b border-white/10 focus:border-accent/50 focus:outline-none pb-1.5 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Description
          </label>
          <Textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Problem, features, how to use…"
            rows={5}
            className="w-full resize-none bg-transparent text-sm text-text-primary placeholder:text-text-tertiary border border-white/10 rounded-lg p-3 focus:border-accent/50 focus:outline-none"
          />
        </div>

        {/* Stage */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Stage
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set('stage', form.stage === s ? '' : s)}
                className={`rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] transition ${
                  form.stage === s
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-white/10 text-text-tertiary hover:border-white/25'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Platform */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Platform
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => toggleMulti('platform', p)}
                className={`rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] transition ${
                  form.platform.includes(p)
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-white/10 text-text-tertiary hover:border-white/25'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Sector */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Sector
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_SECTORS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleMulti('sector', s)}
                className={`rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] transition ${
                  form.sector.includes(s)
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-white/10 text-text-tertiary hover:border-white/25'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Seeking */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Seeking
          </label>
          <div className="flex flex-wrap gap-2">
            {PROJECT_SEEKING.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleMulti('seeking', s)}
                className={`rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-[0.14em] transition ${
                  form.seeking.includes(s)
                    ? 'border-accent/60 bg-accent/10 text-accent'
                    : 'border-white/10 text-text-tertiary hover:border-white/25'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Traction */}
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Traction (one-liner)
          </label>
          <input
            value={form.traction}
            onChange={(e) => set('traction', e.target.value)}
            placeholder="1,000 beta users"
            maxLength={160}
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary border-b border-white/10 focus:border-accent/50 focus:outline-none pb-1.5 transition-colors"
          />
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Contact
          </label>
          <input
            value={form.contact_url}
            onChange={(e) => set('contact_url', e.target.value)}
            placeholder="https://wa.me/852... or https://tally.so/..."
            type="url"
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary border-b border-white/10 focus:border-accent/50 focus:outline-none pb-1.5 transition-colors"
          />
        </div>

        {/* Links */}
        <div className="space-y-3">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Links
          </label>
          {([
            ['web_url', 'Website URL'],
            ['app_store_url', 'App Store URL'],
            ['play_store_url', 'Play Store URL'],
            ['media_url', 'Demo / Video URL (YouTube or Loom)'],
          ] as [keyof FormState, string][]).map(([field, placeholder]) => (
            <input
              key={field}
              value={form[field] as string}
              onChange={(e) => set(field, e.target.value)}
              placeholder={placeholder}
              type="url"
              className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary border-b border-white/10 focus:border-accent/50 focus:outline-none pb-1.5 transition-colors"
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSave('draft')}
            disabled={saving || !form.name}
            className="rounded-full border border-white/15 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-text-secondary transition hover:border-white/30 disabled:opacity-40"
          >
            {saving ? 'Saving…' : 'Save draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSave('published')}
            disabled={saving || !form.name || slugAvailable === false}
            className="rounded-full border border-accent/40 bg-accent/10 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-accent transition hover:bg-accent/20 disabled:opacity-40"
          >
            {saving ? 'Publishing…' : 'Publish'}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="ml-auto rounded-full border border-red-500/30 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-red-400/70 transition hover:border-red-500/60 hover:text-red-400 disabled:opacity-40"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* ── Preview column ───────────────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="sticky top-8 space-y-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-tertiary">
            Preview
          </p>
          <div className="max-w-sm">
            <ProjectCard project={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}
