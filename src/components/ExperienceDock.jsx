import React, { useMemo, useState } from 'react';
import { addDays, format, isSameDay, parseISO, startOfDay } from 'date-fns';
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
  const [eventVersion, setEventVersion] = useState(0);
  const previewTitle = getSuggestedTitle(noteText);

  const getNotesContextKey = (targetDate) => {
    if (startDate && endDate && !isSameDay(startDate, endDate)) {
      return `notes_${format(startDate, 'yyyy-MM-dd')}_to_${format(endDate, 'yyyy-MM-dd')}`;
    }
    if (startDate || targetDate) {
      const normalized = targetDate || startDate;
      return `notes_${format(normalized, 'yyyy-MM-dd')}`;
    }
    if (currentDate) {
      return `notes_${format(currentDate, 'yyyy-MM-dd')}`;
    }
    return `notes_month_${format(currentDate, 'yyyy-MM')}`;
  };

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
  }, [currentDate, eventVersion]);

  const upcomingWeekCount = useMemo(() => {
    const today = startOfDay(new Date());
    const weekEnd = addDays(today, 7);
    return timeline.filter(item => {
      const d = parseISO(item.date);
      return d >= today && d <= weekEnd;
    }).length;
  }, [timeline]);

  const busiestDay = useMemo(() => {
    if (!timeline.length) return 'None';
    const counters = {};
    timeline.forEach((item) => {
      const weekday = format(parseISO(item.date), 'EEEE');
      counters[weekday] = (counters[weekday] || 0) + 1;
    });

    return Object.entries(counters).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
  }, [timeline]);

  const planningStreak = useMemo(() => {
    if (!timeline.length) return 0;
    const uniqueDays = [...new Set(timeline.map(item => item.date))].sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let cursor = startOfDay(new Date());

    for (let i = 0; i < uniqueDays.length; i += 1) {
      const day = startOfDay(parseISO(uniqueDays[i]));
      if (day.getTime() === cursor.getTime()) {
        streak += 1;
        cursor = addDays(cursor, -1);
      } else if (day.getTime() < cursor.getTime()) {
        break;
      }
    }

    return streak;
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

    const notesKey = `notes_list_${getNotesContextKey(target)}`;
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
    setEventVersion(prev => prev + 1);
    window.dispatchEvent(new CustomEvent('chronocanvas-notes-updated', { detail: { key: notesKey } }));

    // Keep calendar and notes panel focused on the same target context.
    setCurrentDate(target);
    setStartDate(target);
    setEndDate(target);
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

  const handleExportImage = async () => {
    await onExportImage();
  };

  const handleExportPdf = async () => {
    await onExportPdf();
  };

  const applyInspirationMode = () => {
    const randomMonth = Math.floor(Math.random() * 12);
    const next = new Date(currentDate);
    next.setMonth(randomMonth);
    setCurrentDate(next);
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <aside className="feature-dock">
      <div className="feature-group feature-group-actions">
        <section className="feature-cluster feature-cluster-actions">
          <h4><CalendarSearch className="w-4 h-4" /> Smart Actions</h4>
          <label>Go to specific date</label>
          <div className="action-inline-row">
            <input type="date" value={goToDate} onChange={(e) => setGoToDate(e.target.value)} />
            <button onClick={jumpToDate} className="action-inline-go">Go</button>
          </div>

          <div className="action-pill-row">
            <button onClick={onJumpToToday} className="action-pill">Today</button>
            <button onClick={onClearSelection} className="action-pill">Clear</button>
          </div>

          <div className="action-pill-row action-pill-row-single">
            <button onClick={applyInspirationMode} className="action-pill">Inspiration Mode</button>
          </div>

          <div className="feature-toggles">
            <label><input type="checkbox" checked={disablePastDates} onChange={(e) => setDisablePastDates(e.target.checked)} /> Disable past dates</label>
            <label><input type="checkbox" checked={disableFutureDates} onChange={(e) => setDisableFutureDates(e.target.checked)} /> Disable future dates</label>
            <label><input type="checkbox" checked={compactMode} onChange={(e) => setCompactMode(e.target.checked)} /> Compact density</label>
          </div>
        </section>

        <section className="feature-cluster feature-cluster-export">
          <h4><Download className="w-4 h-4" /> Export</h4>
          <div className="export-row">
            <button onClick={handleExportImage} className="export-action" aria-label="Export PNG">
              <Download className="w-4 h-4" />
              <span>PNG</span>
            </button>
            <button onClick={handleExportPdf} className="export-action" aria-label="Export PDF">
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
          </div>
        </section>
      </div>

      <section className="feature-cluster feature-cluster-notes">
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

        <div className="note-preview-stack" aria-hidden="true">
          <div className="note-preview note-preview-main">
            <small>{previewTitle || 'Quick Note'}</small>
            <p>{noteText.trim() || 'Your note preview appears here'}</p>
          </div>
          <div className="note-preview note-preview-sub">
            <small>{priority} priority</small>
          </div>
        </div>

        <button onClick={addSmartNote} className="feature-primary-btn">Add Smart Note</button>
      </section>

      <section className="insight-strip">
        <h4><Sparkles className="w-4 h-4" /> Insight Panel</h4>
        <div className="insight-main">
          <span className="insight-number">{upcomingWeekCount}</span>
          <span className="insight-label">events this week</span>
        </div>
        <p className="feature-stat">Total tracked events: {timeline.length}</p>
        <p className="feature-stat">Most busy day: {busiestDay}</p>
        <p className="feature-stat">Planning streak: {planningStreak} day{planningStreak === 1 ? '' : 's'} 🔥</p>
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
    </aside>
  );
}
