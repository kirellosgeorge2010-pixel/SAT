import { useState } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash2,
  RotateCcw,
  Sparkles,
  Tag,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import {
  SAT_SECTIONS,
  SAT_MODULES,
  SAT_DIFFICULTIES,
  ERROR_CATEGORIES,
  REVIEW_STATUSES,
} from '../utils/satTaxonomy';
import { deepDiagnoseMistake } from '../utils/geminiIntelligence';
import clsx from 'clsx';

export function MistakeTableView({
  mistakes,
  onUpdateMistake,
  onDeleteMistake,
  onRetestQuestion,
  onOpenAddModal,
}) {
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('All');
  const [filterModule, setFilterModule] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [diagnosingId, setDiagnosingId] = useState(null);

  // Filter logic
  const filtered = mistakes.filter(m => {
    const qText = (m.questionText || '').toLowerCase();
    const qNum = (m.questionNumber || '').toLowerCase();
    const qTopic = (m.topic || '').toLowerCase();
    const qDomain = (m.domain || '').toLowerCase();
    const qTest = (m.testName || '').toLowerCase();
    const qTags = (m.tags || []).join(' ').toLowerCase();
    const sTerm = search.toLowerCase();

    const matchSearch =
      !sTerm ||
      qText.includes(sTerm) ||
      qNum.includes(sTerm) ||
      qTopic.includes(sTerm) ||
      qDomain.includes(sTerm) ||
      qTest.includes(sTerm) ||
      qTags.includes(sTerm);

    const matchSection = filterSection === 'All' || m.section === filterSection;
    const matchModule = filterModule === 'All' || m.module === filterModule;
    const matchCategory = filterCategory === 'All' || m.errorCategory === filterCategory;
    const matchStatus = filterStatus === 'All' || m.reviewStatus === filterStatus;

    return matchSearch && matchSection && matchModule && matchCategory && matchStatus;
  });

  const handleDeepDiagnoseRow = async (item) => {
    setDiagnosingId(item.id);
    try {
      const diag = await deepDiagnoseMistake({
        section: item.section,
        questionText: item.questionText,
        options: item.options,
        selectedAnswer: item.selectedAnswer,
        correctAnswer: item.correctAnswer,
        studentNotes: item.customNotes || item.rootCause,
      });

      onUpdateMistake(item.id, {
        conceptTested: diag.conceptTested || item.conceptTested,
        errorCategory: diag.errorCategory || item.errorCategory,
        rootCause: diag.rootCause || item.rootCause,
        stepByStepSolution: diag.stepByStepSolution || item.stepByStepSolution,
        misconceptionsDetected: diag.misconceptionsDetected || item.misconceptionsDetected,
        takeaway: diag.takeaway || item.takeaway,
        reviewStatus: 'Analyzed',
      });
    } catch (err) {
      alert(`AI diagnosis failed: ${err.message}`);
    } finally {
      setDiagnosingId(null);
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* ── Toolbar: Search & Multi-Filters ─────────────────────────────────── */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-text-dim absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by question text, #, topic, test name, tags..."
              className="input-field pl-8 text-xs py-2"
            />
          </div>

          {/* Section Filter */}
          <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5">
            {['All', 'Math', 'Reading & Writing'].map(sec => (
              <button
                key={sec}
                onClick={() => setFilterSection(sec)}
                className={clsx(
                  'px-2.5 py-1 rounded text-xs transition-colors',
                  filterSection === sec
                    ? 'bg-gold text-base font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {sec === 'Reading & Writing' ? 'R&W' : sec}
              </button>
            ))}
          </div>

          {/* Module Filter */}
          <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-0.5">
            {['All', 'Module 1', 'Module 2'].map(mod => (
              <button
                key={mod}
                onClick={() => setFilterModule(mod)}
                className={clsx(
                  'px-2.5 py-1 rounded text-xs transition-colors',
                  filterModule === mod
                    ? 'bg-gold text-base font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {mod === 'Module 1' ? 'Mod 1' : mod === 'Module 2' ? 'Mod 2' : 'All Mods'}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row: Category & Status */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          {/* Error Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-dim text-[11px] uppercase tracking-wider font-semibold">
              Category:
            </span>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="select-field text-xs py-1 w-44"
            >
              <option value="All">All Categories</option>
              {ERROR_CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Review Status Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-text-dim text-[11px] uppercase tracking-wider font-semibold">
              Review Status:
            </span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="select-field text-xs py-1 w-44"
            >
              <option value="All">All Statuses</option>
              {REVIEW_STATUSES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {(search || filterSection !== 'All' || filterModule !== 'All' || filterCategory !== 'All' || filterStatus !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setFilterSection('All');
                setFilterModule('All');
                setFilterCategory('All');
                setFilterStatus('All');
              }}
              className="text-xs text-gold hover:text-gold-light ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table Container ─────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-xs">
            <thead>
              <tr className="border-b border-border bg-surface/60 text-text-dim text-left">
                <th className="table-header-cell w-10 text-center">#</th>
                <th className="table-header-cell w-28">Test & Date</th>
                <th className="table-header-cell w-14 text-center">Q#</th>
                <th className="table-header-cell w-20">Section</th>
                <th className="table-header-cell w-20">Module</th>
                <th className="table-header-cell w-20 text-center">Answer</th>
                <th className="table-header-cell w-44">Domain & Topic</th>
                <th className="table-header-cell w-40">Error Category</th>
                <th className="table-header-cell w-36">Review Status</th>
                <th className="table-header-cell w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-text-dim">
                    No recorded questions match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => {
                  const isExpanded = expandedId === item.id;
                  const catConfig = ERROR_CATEGORIES.find(c => c.name === item.errorCategory);
                  const statusConfig = REVIEW_STATUSES.find(s => s.id === item.reviewStatus);

                  return (
                    <React.Fragment key={item.id}>
                      <tr className={clsx(
                        'hover:bg-surface/30 transition-colors group',
                        isExpanded && 'bg-surface/40',
                        item.reviewStatus === 'Repeated Mistake' && 'bg-rose-500/5'
                      )}>
                        <td className="table-cell text-center text-text-dim font-mono">
                          {index + 1}
                        </td>

                        <td className="table-cell">
                          <p className="font-semibold text-text-primary line-clamp-1">{item.testName}</p>
                          <p className="text-[10px] text-text-dim">{item.date}</p>
                        </td>

                        <td className="table-cell text-center font-bold text-gold">
                          Q{item.questionNumber}
                        </td>

                        <td className="table-cell">
                          <span className={clsx(
                            'px-2 py-0.5 rounded text-[10px] font-bold',
                            item.section === 'Math' ? 'bg-blue-500/15 text-blue-300' : 'bg-emerald-500/15 text-emerald-300'
                          )}>
                            {item.section}
                          </span>
                        </td>

                        <td className="table-cell font-mono text-[11px] text-text-secondary">
                          {item.module}
                        </td>

                        <td className="table-cell text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold text-[10px]" title="Your Selected Answer">
                              {item.selectedAnswer}
                            </span>
                            <span className="text-text-dim text-[10px]">→</span>
                            <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold text-[10px]" title="Correct Answer">
                              {item.correctAnswer}
                            </span>
                          </div>
                        </td>

                        <td className="table-cell">
                          <p className="font-semibold text-text-primary line-clamp-1">{item.topic}</p>
                          <p className="text-[10px] text-text-dim">{item.domain}</p>
                        </td>

                        <td className="table-cell">
                          <span className={clsx(
                            'inline-block px-2 py-0.5 rounded text-[10px] border font-medium line-clamp-1',
                            catConfig?.badgeClass || 'bg-surface border-border text-text-muted'
                          )}>
                            {item.errorCategory}
                          </span>
                        </td>

                        <td className="table-cell">
                          <select
                            value={item.reviewStatus}
                            onChange={e => onUpdateMistake(item.id, { reviewStatus: e.target.value })}
                            className="select-field text-[11px] py-1 bg-surface"
                          >
                            {REVIEW_STATUSES.map(st => (
                              <option key={st.id} value={st.id}>{st.label}</option>
                            ))}
                          </select>
                        </td>

                        <td className="table-cell text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onRetestQuestion?.(item)}
                              className="p-1 rounded text-text-muted hover:text-gold hover:bg-surface transition-colors"
                              title="Retest this question"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : item.id)}
                              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
                              title={isExpanded ? 'Collapse' : 'Expand full details'}
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onDeleteMistake(item.id)}
                              className="p-1 rounded text-text-muted hover:text-rose-400 hover:bg-surface transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr className="bg-surface/40 border-b border-border animate-fade-in">
                          <td colSpan={10} className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                              {/* Left Column: Question & Choices */}
                              <div className="space-y-4">
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold block mb-1">
                                    Question Text
                                  </span>
                                  <div className="p-3.5 rounded-xl bg-card border border-border text-text-primary text-xs leading-relaxed whitespace-pre-wrap">
                                    {item.questionText}
                                  </div>
                                </div>

                                {item.options && (item.options.A || item.options.B) && (
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim block mb-1">
                                      Answer Choices
                                    </span>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      {['A', 'B', 'C', 'D'].map(ch => (
                                        <div
                                          key={ch}
                                          className={clsx(
                                            'p-2 rounded-lg border text-[11px] flex items-center gap-2',
                                            ch === item.correctAnswer ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold' :
                                            ch === item.selectedAnswer ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 font-bold' :
                                            'bg-card border-border text-text-muted'
                                          )}
                                        >
                                          <span className="w-5 h-5 rounded bg-surface flex items-center justify-center font-mono">
                                            {ch}
                                          </span>
                                          <span className="line-clamp-1">{item.options[ch] || '—'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {item.questionImage && (
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim block mb-1">
                                      Captured Screenshot
                                    </span>
                                    <img
                                      src={item.questionImage}
                                      alt="Screenshot"
                                      className="rounded-xl border border-border max-h-48 object-contain bg-black"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Right Column: AI Diagnosis, Misconceptions, Takeaways */}
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                                    AI Diagnostic Analysis
                                  </span>
                                  <button
                                    onClick={() => handleDeepDiagnoseRow(item)}
                                    disabled={diagnosingId === item.id}
                                    className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light disabled:opacity-40"
                                  >
                                    <Sparkles className={clsx('w-3.5 h-3.5', diagnosingId === item.id && 'animate-spin')} />
                                    {diagnosingId === item.id ? 'Analyzing with AI…' : 'Re-Diagnose with AI'}
                                  </button>
                                </div>

                                {/* Root cause */}
                                <div className="p-3 rounded-xl bg-card border border-border text-xs space-y-1">
                                  <span className="font-semibold text-rose-300 block">
                                    Why Selected Answer Was Wrong:
                                  </span>
                                  <p className="text-text-secondary leading-relaxed">
                                    {item.rootCause || 'No root cause recorded.'}
                                  </p>
                                </div>

                                {/* Concept tested & Takeaway */}
                                <div className="p-3 rounded-xl bg-card border border-border text-xs space-y-2">
                                  {item.conceptTested && (
                                    <div>
                                      <span className="font-semibold text-text-primary block text-[11px]">
                                        Concept Tested:
                                      </span>
                                      <p className="text-text-muted">{item.conceptTested}</p>
                                    </div>
                                  )}
                                  {item.takeaway && (
                                    <div>
                                      <span className="font-semibold text-gold block text-[11px]">
                                        Key Takeaway / Rule:
                                      </span>
                                      <p className="text-text-primary font-medium">{item.takeaway}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Step by step solution if available */}
                                {item.stepByStepSolution && item.stepByStepSolution.length > 0 && (
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-dim block mb-1">
                                      Step-by-Step Resolution
                                    </span>
                                    <ol className="list-decimal list-inside space-y-1 text-xs text-text-secondary p-3 rounded-xl bg-card border border-border">
                                      {item.stepByStepSolution.map((s, si) => (
                                        <li key={si}>{s}</li>
                                      ))}
                                    </ol>
                                  </div>
                                )}

                                {/* Retest history log */}
                                {item.retestHistory && item.retestHistory.length > 0 && (
                                  <div className="p-3 rounded-xl bg-surface border border-border text-xs space-y-1.5">
                                    <span className="font-semibold text-text-dim text-[10px] uppercase tracking-wider block">
                                      Retest History Log
                                    </span>
                                    {item.retestHistory.map((rh, rhi) => (
                                      <div key={rhi} className="flex items-center justify-between text-[11px]">
                                        <span className="text-text-muted">{rh.date}</span>
                                        <span className={rh.isCorrect ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                          {rh.isCorrect ? '✓ Solved' : '✗ Missed'} ({rh.timeSeconds ? `${rh.timeSeconds}s` : 'timed'})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <span>Showing {filtered.length} of {mistakes.length} recorded questions</span>
          <button
            onClick={onOpenAddModal}
            className="text-gold hover:text-gold-light font-medium"
          >
            + Add Another Question
          </button>
        </div>
      </div>
    </div>
  );
}
