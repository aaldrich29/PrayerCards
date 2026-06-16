import { useState } from 'react';

interface Props {
  title: string;
  label?: string;
  placeholder?: string;
  initial?: string;
  saveLabel?: string;
  /** Called with the trimmed note (may be empty string). */
  onSave: (note: string) => void;
  onClose: () => void;
}

/** Small themed modal for entering / editing a short note (e.g. an answered testimony). */
export function NoteDialog({ title, label, placeholder, initial = '', saveLabel = 'Save', onSave, onClose }: Props) {
  const [note, setNote] = useState(initial);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="safe-bottom w-full max-w-md rounded-t-3xl border-t border-border bg-bg p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
        <h2 className="mb-1 text-lg font-semibold text-ink">{title}</h2>
        {label && <p className="mb-3 text-sm text-muted">{label}</p>}
        <textarea
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-xl border border-border bg-surface2 px-3 py-2.5 text-sm text-ink placeholder-faint focus:border-accent focus:outline-none"
        />
        <div className="mt-4 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-xl bg-surface py-3 text-sm font-medium text-ink">
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(note.trim());
              onClose();
            }}
            className="flex-1 rounded-xl bg-accent py-3 text-sm font-semibold text-accentink"
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
