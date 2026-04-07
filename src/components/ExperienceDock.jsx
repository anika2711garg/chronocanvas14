import React, { useMemo, useState } from 'react';
import { addDays, format, parseISO, startOfDay } from 'date-fns';
import { CalendarSearch, Sparkles, Download, FileText, WandSparkles } from 'lucide-react';

function getSuggestedTitle(text) {
  const lower = text.toLowerCase();
  if (lower.includes('trip') || lower.includes('travel')) return 'Travel Plan';
  if (lower.includes('birthday') || lower.includes('party')) return 'Celebration';
  if (lower.includes('meeting') || lower.includes('call')) return 'Meeting';
  if (lower.includes('exam') || lower.includes('study')) return 'Study Focus';
  return 'Quick Note';
}

function inferTag(text) {
  const lower = text.toLowerCase();
  if (lower.includes('gift') || lower.includes('birthday')) return 'personal';
  if (lower.includes('meeting') || lower.includes('deadline')) return 'work';
  if (lower.includes('trip') || lower.includes('travel')) return 'travel';
  return 'general';
}

function tagColor(tag) {
  if (tag === 'work') return '#b3c7e2';
  if (tag === 'personal') return '#f0cbc2';
  if (tag === 'travel') return '#c7dfce';
  return '#d9d7dd';
}

export function ExperienceDock({
  currentDate,
  setCurrentDate,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  disablePastDates,
  setDisablePastDates,
  disableFutureDates,
  setDisableFutureDates,
  compactMode,
  setCompactMode,
  onJumpToToday,
  onClearSelection,
  onExportImage,
  onExportPdf
}) {
  const [goToDate, setGoToDate] = useState(format(currentDate, 'yyyy-MM-dd'));
  const [noteText, setNoteText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [emoji, setEmoji] = useState('📝');

  const timeline = useMemo(() => {
    const events = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('chronocanvas_event_')) continue;
      try {
        const parsed = JSON.parse(localStorage.getItem(key));
        if (parsed?.date && parsed?.title) events.push(parsed);
      } catch {
        // ignore malformed records
      }
    }
    return events
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 8);
  }, [currentDate]);

  const upcomingWeekCount = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = addDays(today, 7);
    return timeline.filter(item => {
      const d = parseISO(item.date);
      return d >= today && d <= weekEnd;
    }).length;
  }, [timeline]);

  const addSmartNote = () => {
    const content = noteText.trim();
    if (!content) return;

    const target = startDate || endDate || currentDate;
    const dateKey = format(target, 'yyyy-MM-dd');
    const title = getSuggestedTitle(content);
    const tag = inferTag(content);

    const event = {
      id: Date.now(),
      date: dateKey,
      title,
      content,
      tag,
      priority,
      emoji
    };

    localStorage.setItem(`chronocanvas_event_${event.id}`, JSON.stringify(event));

    const notesKey = `notes_list_notes_${dateKey}`;
    let existing = [];
    try {
      const raw = localStorage.getItem(notesKey);
      if (raw) existing = JSON.parse(raw);
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }

    const combined = [
      { id: event.id, title: `${emoji} ${title}`, text: content, tag, priority },
      ...existing
    ].slice(0, 8);

    localStorage.setItem(notesKey, JSON.stringify(combined));
    setNoteText('');
  };

  const jumpToDate = () => {
    if (!goToDate) return;
    const target = new Date(goToDate);
    if (Number.isNaN(target.getTime())) return;
    setCurrentDate(target);
    setStartDate(target);
    setEndDate(target);
  };

  return (
    <aside className="feature-dock">
      <section className="feature-card">
        <h4><CalendarSearch className="w-4 h-4" /> Smart Actions</h4>
        <label>Go to specific date</label>
        <div className="feature-row">
          <input type="date" value={goToDate} onChange={(e) => setGoToDate(e.target.value)} />
          <button onClick={jumpToDate}>Go</button>
        </div>

        <div className="feature-row feature-grid-2">
          <button onClick={onJumpToToday}>Today</button>
          <button onClick={onClearSelection}>Clear</button>
        </div>

        <div className="feature-toggles">
          <label><input type="checkbox" checked={disablePastDates} onChange={(e) => setDisablePastDates(e.target.checked)} /> Disable past dates</label>
          <label><input type="checkbox" checked={disableFutureDates} onChange={(e) => setDisableFutureDates(e.target.checked)} /> Disable future dates</label>
          <label><input type="checkbox" checked={compactMode} onChange={(e) => setCompactMode(e.target.checked)} /> Compact density</label>
        </div>
      </section>

      <section className="feature-card">
        <h4><WandSparkles className="w-4 h-4" /> Smart Notes</h4>
        <textarea
          placeholder="Type note with emoji support, e.g. 🎁 Buy gift for mom"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <div className="feature-row feature-grid-2">
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2} />
        </div>
        <button onClick={addSmartNote} className="feature-primary-btn">Add Smart Note</button>
      </section>

      <section className="feature-card">
        <h4><Sparkles className="w-4 h-4" /> Insight Panel</h4>
        <p className="feature-stat">You have {upcomingWeekCount} events this week</p>
        <div className="feature-agenda custom-scrollbar">
          {timeline.length === 0 && <p className="feature-muted">No events yet.</p>}
          {timeline.map(item => (
            <div key={item.id} className="feature-agenda-item">
              <span className="feature-dot" style={{ backgroundColor: tagColor(item.tag) }} />
              <div>
                <p>{item.title}</p>
                <small>{item.date}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-card">
        <h4><Download className="w-4 h-4" /> Export</h4>
        <div className="feature-row feature-grid-2">
          <button onClick={onExportImage}>PNG</button>
          <button onClick={onExportPdf}><FileText className="w-3.5 h-3.5" /> PDF</button>
        </div>
      </section>
    </aside>
  );
}
