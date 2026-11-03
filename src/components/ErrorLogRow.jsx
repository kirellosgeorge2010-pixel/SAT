import { useState, useCallback } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronUp, Tag, X, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

const SECTIONS = ['Math', 'Reading & Writing', 'Unknown'];
const ANSWERS = ['A', 'B', 'C', 'D', 'Unknown', 'Blank'];
const DOMAINS = [
  'Algebra',
  'Advanced Math',
  'Problem-Solving & Data Analysis',
  'Geometry & Trigonometry',
  'Craft & Structure',
  'Information & Ideas',
  'Standard English Conventions',
  'Expression of Ideas',
  'Unknown',
];
const ROOT_CAUSES = [
  'Careless Error',
  'Concept Breakdown',
  'Time Pressure',
  'Misread Question',
  'Calculation Error',
  'Unfamiliar Topic',
  'Overthinking',
  'Unknown',
];

const ANSWER_COLORS = {
  A: 'text-blue-400',
  B: 'text-purple-400',
  C: 'text-emerald-400',
  D: 'text-orange-400',
  Unknown: 'text-text-muted',
  Blank: 'text-text-dim',
};

const ROOT_CAUSE_BADGES = {
  'Careless Error': 'bg-warning/10 text-warning border-warning/30',
  'Concept Breakdown': 'bg-error/10 text-error border-error/30',
  'Time Pressure': 'bg-orange-400/10 text-orange-400 border-orange-400/30',
  'Misread Question': 'bg-purple-400/10 text-purple-400 border-purple-400/30',
  'Calculation Error': 'bg-blue-400/10 text-blue-400 border-blue-400/30',
  'Unfamiliar Topic': 'bg-burgundy/10 text-burgundy-light border-burgundy/30',
  'Overthinking': 'bg-gold-muted text-gold border-gold/30',
  'Unknown': 'bg-border text-text-muted border-border',
};

function AnswerBadge({ value, isSelected, isCorrect }) {
  if (!value || value === 'Unknown' || value === 'Blank') {
    return <span className="text-text-dim text-xs">—</span>;
  }
  return (
    <span className={clsx(
      'inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold border',
      isCorrect && 'bg-success/10 border-success/30 text-success',
      isSelected && !isCorrect && 'bg-error/10 border-error/30 text-error',
      !isSelected && !isCorrect && `border-border ${ANSWER_COLORS[value] || 'text-text-muted'}`,
    )}>
      {value}
    </span>
  );
}

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const removeTag = (tag) => onChange(tags.filter(t => t !== tag));

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gold-muted text-gold border border-gold/20">
          {tag}
          <button onClick={() => removeTag(tag)} className="hover:text-error transition-colors">
            <X className="w-2.5 h-2.5" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
        onBlur={addTag}
        placeholder={tags.length === 0 ? 'Add tag…' : '+'}
        className="bg-transparent border-none outline-none text-xs text-text-muted placeholder:text-text-dim w-16 min-w-0"
      />
    </div>
  );
}

export function ErrorLogRow({ entry, index, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const update = useCallback((field, value) => {
    onUpdate(entry.id, { [field]: value });
  }, [entry.id, onUpdate]);

  const isWrong = entry.selectedAnswer !== entry.correctAnswer
    && entry.selectedAnswer !== 'Unknown'
    && entry.selectedAnswer !== 'Blank';

  return (
    <>
      {/* Main row */}
      <tr className={clsx(
        'border-b border-border/50 transition-colors group',
        entry._hasError ? 'bg-error/5' : 'hover:bg-surface/50',
        expanded && 'bg-surface/30',
      )}>
        {/* Row # */}
        <td className="table-cell text-text-dim text-center font-mono text-xs w-8">
          {index + 1}
        </td>

        {/* Q# */}
        <td className="table-cell font-mono text-xs w-12">
          {isEditing ? (
            <input
              className="input-field py-0.5 w-14 text-xs"
              value={entry.questionNumber || ''}
              onChange={e => update('questionNumber', e.target.value)}
            />
          ) : (
            <span className="text-gold font-semibold">
              {entry._hasError ? <AlertTriangle className="w-3.5 h-3.5 text-error inline" /> : (entry.questionNumber || '?')}
            </span>
          )}
        </td>

        {/* Section */}
        <td className="table-cell w-36">
          {isEditing ? (
            <select className="select-field py-0.5 text-xs" value={entry.section} onChange={e => update('section', e.target.value)}>
              {SECTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          ) : (
            <span className={clsx(
              'text-xs px-2 py-0.5 rounded-full border font-medium',
              entry.section === 'Math' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' :
              entry.section === 'Reading & Writing' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' :
              'bg-border text-text-muted border-border'
            )}>
              {entry.section}
            </span>
          )}
        </td>

        {/* Answers */}
        <td className="table-cell w-20">
          <div className="flex items-center gap-1.5">
            <AnswerBadge value={entry.correctAnswer} isCorrect={true} />
            <span className="text-text-dim text-xs">vs</span>
            <AnswerBadge value={entry.selectedAnswer} isSelected={true} isCorrect={entry.selectedAnswer === entry.correctAnswer} />
          </div>
        </td>

        {/* Domain */}
        <td className="table-cell w-52">
          {isEditing ? (
            <select className="select-field py-0.5 text-xs" value={entry.domain} onChange={e => update('domain', e.target.value)}>
              {DOMAINS.map(d => <option key={d}>{d}</option>)}
            </select>
          ) : (
            <span className="text-text-secondary text-xs">{entry.domain}</span>
          )}
        </td>

        {/* Root Cause */}
        <td className="table-cell w-40">
          {isEditing ? (
            <select className="select-field py-0.5 text-xs" value={entry.rootCause} onChange={e => update('rootCause', e.target.value)}>
              {ROOT_CAUSES.map(r => <option key={r}>{r}</option>)}
            </select>
          ) : (
            <span className={clsx('text-xs px-2 py-0.5 rounded border', ROOT_CAUSE_BADGES[entry.rootCause] || ROOT_CAUSE_BADGES['Unknown'])}>
              {entry.rootCause}
            </span>
          )}
        </td>

        {/* Tags */}
        <td className="table-cell w-40">
          <TagInput tags={entry.tags || []} onChange={v => update('tags', v)} />
        </td>

        {/* Actions */}
        <td className="table-cell w-20">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(e => !e)}
              className={clsx(
                'p-1.5 rounded-md transition-colors',
                isEditing ? 'bg-gold/20 text-gold' : 'hover:bg-surface text-text-muted hover:text-text-primary',
              )}
              title={isEditing ? 'Done editing' : 'Edit row'}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
              title={expanded ? 'Collapse' : 'Expand details'}
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onDelete(entry.id)}
              className="p-1.5 rounded-md hover:bg-error/10 text-text-muted hover:text-error transition-colors"
              title="Delete row"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b border-border/30 bg-surface/20 animate-fade-in">
          <td colSpan={8} className="px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
              {/* Question Summary */}
              <div className="space-y-1.5">
                <label className="section-label text-[10px]">Question Summary</label>
                <textarea
                  rows={3}
                  className="input-field text-xs resize-none"
                  value={entry.questionSummary || ''}
                  onChange={e => update('questionSummary', e.target.value)}
                  placeholder="What did the question ask?"
                />
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <label className="section-label text-[10px]">Explanation / Takeaway</label>
                <textarea
                  rows={3}
                  className="input-field text-xs resize-none"
                  value={entry.explanation || ''}
                  onChange={e => update('explanation', e.target.value)}
                  placeholder="Key insight or correct approach…"
                />
              </div>

              {/* Specific Topic */}
              <div className="space-y-1.5">
                <label className="section-label text-[10px]">Specific Topic / Sub-skill</label>
                <input
                  className="input-field text-xs"
                  value={entry.specificTopic || ''}
                  onChange={e => update('specificTopic', e.target.value)}
                  placeholder="e.g. Linear equations in two variables"
                />
              </div>

              {/* Custom Notes */}
              <div className="space-y-1.5">
                <label className="section-label text-[10px]">Personal Notes</label>
                <textarea
                  rows={2}
                  className="input-field text-xs resize-none"
                  value={entry.customNotes || ''}
                  onChange={e => update('customNotes', e.target.value)}
                  placeholder="Your own notes, reminders, or references…"
                />
              </div>

              {/* Source file info */}
              {entry.sourceFile && (
                <div className="md:col-span-2 flex items-center gap-2 text-xs text-text-dim">
                  <Tag className="w-3 h-3" />
                  Source: <span className="text-text-muted font-mono">{entry.sourceFile}</span>
                  {entry.sourcePage && <span>· page {entry.sourcePage}</span>}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
