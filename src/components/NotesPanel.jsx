import React, { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { Plus } from 'lucide-react';

export function NotesPanel({ currentDate, startDate, endDate }) {
  const [notes, setNotes] = useState([]);
  const [draft, setDraft] = useState('');

  // Determine the current context key
  const getStorageKey = () => {
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      return `notes_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}`;
    } else if (startDate && (!endDate || isSameDay(startDate, endDate))) {
      return `notes_${format(startDate, 'yyyy-MM-dd')}`;
    }
    return `notes_month_${format(currentDate, 'yyyy-MM')}`;
  };

  const getContextLabel = () => {
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    } else if (startDate && (!endDate || isSameDay(startDate, endDate))) {
      return format(startDate, 'MMMM d, yyyy');
    }
    return format(currentDate, 'MMMM yyyy');
  };

  const currentKey = `notes_list_${getStorageKey()}`;

  const loadNotes = () => {
    const savedRaw = localStorage.getItem(currentKey);
    if (!savedRaw) {
      setNotes([]);
      return;
    }

    try {
      const parsed = JSON.parse(savedRaw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter((item) => {
          if (!item || typeof item.text !== 'string') return false;
          return item.text.trim().toLowerCase() !== 'cgc';
        });

        if (cleaned.length !== parsed.length) {
          localStorage.setItem(currentKey, JSON.stringify(cleaned));
        }

        setNotes(cleaned);
      } else setNotes([]);
    } catch {
      setNotes([]);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [currentKey]);

  useEffect(() => {
    const onNotesUpdated = (event) => {
      if (event?.detail?.key === currentKey) {
        loadNotes();
      }
    };

    window.addEventListener('chronocanvas-notes-updated', onNotesUpdated);
    return () => window.removeEventListener('chronocanvas-notes-updated', onNotesUpdated);
  }, [currentKey]);

  const addNote = () => {
    const clean = draft.trim();
    if (!clean) return;

    const next = [
      {
        id: Date.now(),
        title: getContextLabel().replace(',', ''),
        text: clean
      },
      ...notes
    ].slice(0, 6);

    setNotes(next);
    localStorage.setItem(currentKey, JSON.stringify(next));
    setDraft('');
  };

  return (
    <div className="mt-4 lg:mt-0 lg:ml-4">
      <div className="notes-card">
        <div className="notes-title-wrap">
          <h3 className="month-script notes-title">Notes</h3>
        </div>

        <div className="notes-list custom-scrollbar">
          {notes.length === 0 && (
            <div className="notes-empty">No notes yet for this period.</div>
          )}

          {notes.map((item, index) => (
            <div key={item.id} className={index === 0 ? 'note-item note-item-featured' : 'note-item'}>
              <p className="note-item-date">{item.title}</p>
              <p className="note-item-text">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="notes-input-row">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addNote();
            }}
            placeholder="Add Note"
            className="notes-input"
          />
          <button onClick={addNote} className="notes-add-btn" aria-label="Add note">
            <Plus className="w-3.5 h-3.5" />
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}
