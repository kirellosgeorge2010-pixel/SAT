import { useState, useCallback } from 'react';
import { Plus, Search, Filter, BarChart3, TrendingDown } from 'lucide-react';
import { ErrorLogRow } from './ErrorLogRow';
import clsx from 'clsx';

function makeEmptyEntry() {
  return {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    questionNumber: '',
    section: 'Unknown',
    questionSummary: '',
    correctAnswer: 'Unknown',
    selectedAnswer: 'Unknown',
    domain: 'Unknown',
    specificTopic: '',
    rootCause: 'Unknown',
    explanation: '',
    tags: [],
    customNotes: '',
    sourceFile: 'Manual',
    sourcePage: null,
  };
}

function StatsBar({ entries }) {
  const total = entries.length;
  const wrong = entries.filter(e =>
    e.selectedAnswer !== e.correctAnswer &&
    e.selectedAnswer !== 'Unknown' &&
    e.selectedAnswer !== 'Blank'
  ).length;
  const bySection = entries.reduce((acc, e) => {
    acc[e.section] = (acc[e.section] || 0) + 1;
    return acc;
  }, {});
  const topCause = Object.entries(
    entries.reduce((acc, e) => { acc[e.rootCause] = (acc[e.rootCause] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: 'Total Errors', value: total, icon: <BarChart3 className="w-4 h-4" />, color: 'text-gold' },
        { label: 'Confirmed Wrong', value: wrong, icon: <TrendingDown className="w-4 h-4" />, color: 'text-error' },
        { label: 'Math', value: bySection['Math'] || 0, icon: null, color: 'text-blue-400' },
        { label: 'Reading & Writing', value: bySection['Reading & Writing'] || 0, icon: null, color: 'text-emerald-400' },
      ].map(stat => (
        <div key={stat.label} className="card px-4 py-3 flex items-center gap-3">
          {stat.icon && <div className={clsx('opacity-70', stat.color)}>{stat.icon}</div>}
          <div>
            <p className={clsx('text-2xl font-bold', stat.color)}>{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorLogTable({ entries, onUpdate, onDelete, onAdd }) {
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('All');
  const [filterCause, setFilterCause] = useState('All');

  const sections = ['All', 'Math', 'Reading & Writing', 'Unknown'];
  const causes = ['All', 'Careless Error', 'Concept Breakdown', 'Time Pressure', 'Misread Question', 'Calculation Error', 'Unfamiliar Topic', 'Overthinking', 'Unknown'];

  const filtered = entries.filter(e => {
    const matchSearch = !search ||
      e.questionNumber?.toLowerCase().includes(search.toLowerCase()) ||
      e.questionSummary?.toLowerCase().includes(search.toLowerCase()) ||
      e.domain?.toLowerCase().includes(search.toLowerCase()) ||
      e.specificTopic?.toLowerCase().includes(search.toLowerCase()) ||
      e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchSection = filterSection === 'All' || e.section === filterSection;
    const matchCause = filterCause === 'All' || e.rootCause === filterCause;
    return matchSearch && matchSection && matchCause;
  });

  if (entries.length === 0) {
    return (
      <div className="card py-20 flex flex-col items-center justify-center gap-4 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center">
          <BarChart3 className="w-7 h-7 text-text-dim" />
        </div>
        <div>
          <p className="text-text-primary font-semibold">No entries yet</p>
          <p className="text-text-muted text-sm mt-1">Upload SAT questions above to get started, or add entries manually.</p>
        </div>
        <button className="btn-secondary" onClick={() => onAdd(makeEmptyEntry())}>
          <Plus className="w-4 h-4" />
          Add manually
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Stats */}
      <StatsBar entries={entries} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            className="input-field pl-8 py-1.5 text-xs"
            placeholder="Search questions, topics, tags…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Section filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-text-muted" />
          {sections.map(s => (
            <button
              key={s}
              onClick={() => setFilterSection(s)}
              className={clsx(
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                filterSection === s
                  ? 'bg-gold text-base'
                  : 'bg-surface text-text-muted border border-border hover:border-gold/30 hover:text-text-primary',
              )}
            >
              {s === 'Reading & Writing' ? 'R&W' : s}
            </button>
          ))}
        </div>

        <button className="btn-secondary text-xs py-1" onClick={() => onAdd(makeEmptyEntry())}>
          <Plus className="w-3.5 h-3.5" />
          Add row
        </button>
      </div>

      {/* Root cause filter pills */}
      <div className="flex flex-wrap gap-1.5">
        {causes.map(c => (
          <button
            key={c}
            onClick={() => setFilterCause(c)}
            className={clsx(
              'px-2 py-0.5 rounded-full text-xs transition-colors border',
              filterCause === c
                ? 'bg-burgundy border-burgundy-light text-white'
                : 'border-border text-text-muted hover:border-burgundy/40 hover:text-text-primary',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-surface/50">
                <th className="table-header-cell w-8 text-center">#</th>
                <th className="table-header-cell w-12">Q#</th>
                <th className="table-header-cell w-36">Section</th>
                <th className="table-header-cell w-24">Answer</th>
                <th className="table-header-cell w-52">Domain</th>
                <th className="table-header-cell w-40">Root Cause</th>
                <th className="table-header-cell w-40">Tags</th>
                <th className="table-header-cell w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted text-sm">
                    No entries match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((entry, i) => (
                  <ErrorLogRow
                    key={entry.id}
                    entry={entry}
                    index={i}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Showing {filtered.length} of {entries.length} entries
          </p>
          {filtered.length !== entries.length && (
            <button
              className="text-xs text-gold hover:text-gold-light transition-colors"
              onClick={() => { setSearch(''); setFilterSection('All'); setFilterCause('All'); }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
