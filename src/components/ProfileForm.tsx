'use client';

import { useState } from 'react';
import Link from 'next/link';

import type { Profile } from '@/types';
import { USER_ROLE_OPTIONS } from '@/types';
import { Textarea } from '@/components/ui/Textarea';
import { ProfileCard } from './ProfileCard';

interface ProfileFormProps {
  initialProfile: Profile;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const [form, setForm] = useState({
    display_name: initialProfile.display_name ?? '',
    headline: initialProfile.headline ?? '',
    bio: initialProfile.bio ?? '',
    roles: initialProfile.roles ?? ([] as string[]),
    location: initialProfile.location ?? '',
    links: {
      linkedin: initialProfile.links?.linkedin ?? '',
      x: initialProfile.links?.x ?? '',
      website: initialProfile.links?.website ?? '',
    },
    is_public: initialProfile.is_public ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Tracks what's actually persisted in the DB (not just local form state).
  const [persisted, setPersisted] = useState({
    display_name: initialProfile.display_name ?? '',
    is_public: initialProfile.is_public ?? true,
  });

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function setLink(key: 'linkedin' | 'x' | 'website', value: string) {
    setForm((f) => ({ ...f, links: { ...f.links, [key]: value } }));
    setSaved(false);
  }

  function toggleRole(role: string) {
    setForm((f) => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter((r) => r !== role) : [...f.roles, role],
    }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: form.display_name || null,
          headline: form.headline || null,
          bio: form.bio || null,
          roles: form.roles,
          location: form.location || null,
          links: {
            ...(form.links.linkedin ? { linkedin: form.links.linkedin } : {}),
            ...(form.links.x ? { x: form.links.x } : {}),
            ...(form.links.website ? { website: form.links.website } : {}),
          },
          is_public: form.is_public,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Save failed');
      } else {
        setSaved(true);
        setPersisted({ display_name: form.display_name, is_public: form.is_public });
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  const showPublicLink = !!persisted.display_name && persisted.is_public;

  const isDirty =
    form.display_name !== (initialProfile.display_name ?? '') ||
    form.headline     !== (initialProfile.headline     ?? '') ||
    form.bio          !== (initialProfile.bio          ?? '') ||
    form.location     !== (initialProfile.location     ?? '') ||
    form.is_public    !== (initialProfile.is_public    ?? true) ||
    form.links.linkedin !== (initialProfile.links?.linkedin ?? '') ||
    form.links.x        !== (initialProfile.links?.x        ?? '') ||
    form.links.website  !== (initialProfile.links?.website  ?? '') ||
    JSON.stringify(form.roles) !== JSON.stringify(initialProfile.roles ?? []);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Form column */}
      <div className="space-y-6">
        {/* Display name */}
        <div className="space-y-1 pb-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Display name
          </label>
          <input
            value={form.display_name}
            onChange={(e) => set('display_name', e.target.value)}
            placeholder="Jane Doe"
            maxLength={80}
            className="w-full bg-transparent text-2xl font-semibold tracking-tight text-text-primary placeholder:text-text-tertiary border-b-2 border-accent/40 focus:border-accent focus:outline-none pb-1.5 transition-colors"
          />
        </div>

        {/* Headline */}
        <div className="space-y-1 pb-1">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            Headline
          </label>
          <input
            value={form.headline}
            onChange={(e) => set('headline', e.target.value)}
            placeholder="Founder @ Acme · ex-Google"
            maxLength={120}
            className="w-full bg-transparent text-base text-text-primary placeholder:text-text-tertiary border-b border-accent/30 focus:border-accent focus:outline-none pb-1.5 transition-colors"
          />
        </div>

        {/* Bio */}
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Bio
          </label>
          <Textarea
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder="A few sentences about you and your work."
            rows={4}
            maxLength={600}
          />
        </div>

        {/* Roles */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary">
            Roles
          </label>
          <div className="flex flex-wrap gap-1.5">
            {USER_ROLE_OPTIONS.map((role) => {
              const active = form.roles.includes(role);
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                    active
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-surface-hover text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {role}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-3 border-b border-border py-2">
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary w-16">Location</span>
          <input
            value={form.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="Hong Kong"
            maxLength={80}
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
        </div>

        {/* Links */}
        <div className="space-y-0 divide-y divide-border border-b border-border">
          {(['linkedin', 'x', 'website'] as const).map((key) => (
            <div key={key} className="flex items-center gap-3 py-2">
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-text-tertiary w-16">{key}</span>
              <input
                value={form.links[key]}
                onChange={(e) => setLink(key, e.target.value)}
                placeholder={key === 'linkedin' ? 'https://linkedin.com/in/…' : key === 'x' ? 'https://x.com/…' : 'https://yoursite.com'}
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
            </div>
          ))}
        </div>

        {/* Public toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">Public profile</p>
            <p className="text-xs text-text-secondary mt-0.5">Anyone with the link can view your profile.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.is_public}
            onClick={() => set('is_public', !form.is_public)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              form.is_public ? 'bg-accent' : 'bg-border'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full shadow transition-all ${
                form.is_public ? 'translate-x-5 bg-accent-foreground' : 'translate-x-0.5 bg-white'
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex h-9 items-center rounded-lg bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
          {saved && (
            <span className="font-mono text-[10px] text-success uppercase tracking-widest">Saved ✓</span>
          )}
          {error && (
            <span className="font-mono text-[10px] text-destructive uppercase tracking-widest">{error}</span>
          )}
        </div>

        {showPublicLink && (
          <Link
            href={`/profile/${initialProfile.id}`}
            target="_blank"
            className="font-mono text-[10px] uppercase tracking-widest text-text-tertiary hover:text-text-primary transition-colors"
          >
            View your profile ↗
          </Link>
        )}
      </div>

      {/* Preview column */}
      <div className="hidden lg:block">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-tertiary mb-3">Preview</p>
        <div>
          <ProfileCard
            displayName={form.display_name || 'Your Name'}
            headline={form.headline || null}
            bio={form.bio || null}
            roles={form.roles}
            location={form.location || null}
            links={form.links}
          />
        </div>
      </div>
    </div>
  );
}
