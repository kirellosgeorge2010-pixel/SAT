import { useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Brain,
  HelpCircle,
  Clock,
  Sparkles,
  Layers,
  Activity,
} from 'lucide-react';
import {
  computeGlobalMetrics,
  computeErrorCategoryDistribution,
  computeTopicBreakdown,
  computeImprovementTimeline,
} from '../utils/analyticsEngine';
import { ERROR_CATEGORIES } from '../utils/satTaxonomy';
import clsx from 'clsx';

export function AnalyticsDashboard({ mistakes, onNavigateTab }) {
  const [sectionFilter, setSectionFilter] = useState('All'); // 'All' | 'Math' | 'Reading & Writing'

  const filteredMistakes = sectionFilter === 'All'
    ? mistakes
    : mistakes.filter(m => m.section === sectionFilter);

  const metrics = computeGlobalMetrics(filteredMistakes);
  const errorDistribution = computeErrorCategoryDistribution(filteredMistakes);
  const topicBreakdown = computeTopicBreakdown(filteredMistakes);
  const timeline = computeImprovementTimeline(filteredMistakes);

  const hasData = mistakes.length > 0;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Banner: Section Filter & Data Confidence */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-gold" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Scope Filter:
          </span>
          <div className="flex rounded-lg bg-surface border border-border p-0.5">
            {['All', 'Math', 'Reading & Writing'].map(sec => (
              <button
                key={sec}
                onClick={() => setSectionFilter(sec)}
                className={clsx(
                  'px-3 py-1 rounded-md text-xs font-medium transition-all',
                  sectionFilter === sec
                    ? 'bg-gold text-base font-semibold shadow'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {sec}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {!metrics.sufficientData ? (
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Preliminary Data ({metrics.total} recorded) — Log 5+ questions for full confidence
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Statistically Grounded Analysis ({metrics.total} questions)
            </span>
          )}
        </div>
      </div>

      {/* Module 2 Adaptive Drop Warning Banner */}
      {metrics.modDropWarning && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300 animate-slide-up">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-rose-200 text-sm">
              Adaptive Module 2 Performance Drop Detected ({metrics.modDropDelta}% Gap)
            </h4>
            <p className="mt-1 leading-relaxed text-rose-300/90">
              Your accuracy drops from <strong>{metrics.mod1.accuracyPct}%</strong> in Module 1 down to{' '}
              <strong>{metrics.mod2.accuracyPct}%</strong> in Module 2. On the Digital SAT, Module 2 introduces higher difficulty questions and tighter time constraints. Review your Module 2 mistakes below to address fatigue and pacing.
            </p>
          </div>
        </div>
      )}

      {/* 4 Key KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Questions Recorded */}
        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Total Questions</span>
            <Layers className="w-4 h-4 text-gold" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-text-primary">{metrics.total}</span>
            <span className="text-xs text-text-muted ml-2">items logged</span>
          </div>
          <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-dim">
            <span>{metrics.correct} fixed / verified</span>
            <span>{metrics.incorrect} active errors</span>
          </div>
        </div>

        {/* Accuracy Rate */}
        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Resolution Accuracy</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-emerald-400">{metrics.accuracyPct}%</span>
            <span className="text-xs text-text-muted ml-2">mastery</span>
          </div>
          <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-dim">
            <span>{metrics.fixedCount} Fixed</span>
            <span>{metrics.readyForRetestCount} Ready for Retest</span>
          </div>
        </div>

        {/* Math vs Reading/Writing */}
        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Section Split</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-300 font-medium">Math</span>
              <span className="font-bold text-text-primary">{metrics.math.accuracyPct}% ({metrics.math.total} Qs)</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-medium">Reading & Writing</span>
              <span className="font-bold text-text-primary">{metrics.rw.accuracyPct}% ({metrics.rw.total} Qs)</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-border text-[11px] text-text-dim">
            {metrics.math.total > 0 && metrics.rw.total > 0 ? (
              metrics.math.accuracyPct >= metrics.rw.accuracyPct
                ? 'Stronger in Math'
                : 'Stronger in Reading & Writing'
            ) : 'Log both sections for comparison'}
          </div>
        </div>

        {/* Repeated Mistakes Alert */}
        <div className="card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-muted text-xs">
            <span>Repeated Mistakes</span>
            <AlertTriangle className={clsx('w-4 h-4', metrics.repeatedMistakesCount > 0 ? 'text-rose-400' : 'text-text-muted')} />
          </div>
          <div className="mt-2">
            <span className={clsx('text-3xl font-extrabold', metrics.repeatedMistakesCount > 0 ? 'text-rose-400' : 'text-text-primary')}>
              {metrics.repeatedMistakesCount}
            </span>
            <span className="text-xs text-text-muted ml-2">critical recurring</span>
          </div>
          <div className="mt-2 pt-2 border-t border-border text-[11px] text-text-dim">
            {metrics.repeatedMistakesCount > 0 ? (
              <span className="text-rose-400 font-medium">Requires immediate revision</span>
            ) : (
              <span className="text-emerald-400">No recurring traps yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Module Comparison & Error Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1 vs Module 2 Breakdown */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Module 1 vs Module 2 Comparison
            </h3>
            <span className="text-xs text-text-muted">Digital SAT Adaptive Engine</span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-text-primary">Module 1 (Standard Level)</span>
                <span className="font-bold text-text-primary">{metrics.mod1.accuracyPct}% ({metrics.mod1.total} Qs)</span>
              </div>
              <div className="h-2 rounded-full bg-surface border border-border overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.mod1.accuracyPct}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-text-primary">Module 2 (Hard / Adaptive Level)</span>
                <span className="font-bold text-text-primary">{metrics.mod2.accuracyPct}% ({metrics.mod2.total} Qs)</span>
              </div>
              <div className="h-2 rounded-full bg-surface border border-border overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-500',
                    metrics.modDropWarning ? 'bg-rose-500' : 'bg-gold'
                  )}
                  style={{ width: `${metrics.mod2.accuracyPct}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-border text-xs text-text-muted leading-relaxed">
              <strong>SAT Diagnostic Insight:</strong>{' '}
              {metrics.modDropWarning
                ? 'Your Module 2 accuracy is significantly lower. This indicates that complex multi-step wording and time limits are triggering unforced errors. Focus on pacing drills.'
                : 'Your Module 1 and Module 2 performance are balanced. Continue challenging yourself with advanced difficulty questions.'}
            </div>
          </div>
        </div>

        {/* Error Category Distribution */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Root Cause Error Distribution
            </h3>
            <span className="text-xs text-text-muted">8 Error Categories</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {errorDistribution.length === 0 ? (
              <p className="text-xs text-text-dim text-center py-6">No error categories logged yet.</p>
            ) : (
              errorDistribution.map(cat => {
                const conf = ERROR_CATEGORIES.find(c => c.name === cat.category);
                return (
                  <div key={cat.category} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary font-medium">{cat.category}</span>
                      <span className="font-bold text-text-primary">
                        {cat.count} <span className="text-text-dim font-normal">({cat.pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-surface border border-border overflow-hidden">
                      <div
                        className={clsx(
                          'h-full rounded-full transition-all duration-500',
                          conf ? conf.badgeClass.split(' ')[0] : 'bg-gold'
                        )}
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Topic Accuracy Matrix */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Accuracy & Mistake Frequency by SAT Topic
          </h3>
          <span className="text-xs text-text-muted">{topicBreakdown.length} Topics tracked</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-text-dim text-left">
                <th className="pb-2.5 font-semibold">Section & Domain</th>
                <th className="pb-2.5 font-semibold">Specific Topic</th>
                <th className="pb-2.5 font-semibold text-center">Total Logged</th>
                <th className="pb-2.5 font-semibold text-center">Resolved</th>
                <th className="pb-2.5 font-semibold text-center">Recurring?</th>
                <th className="pb-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {topicBreakdown.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-text-dim">
                    No topic data available yet.
                  </td>
                </tr>
              ) : (
                topicBreakdown.map((t, idx) => (
                  <tr key={idx} className="hover:bg-surface/30 transition-colors">
                    <td className="py-2.5 pr-3 font-medium text-text-primary">
                      <span className={clsx(
                        'inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-1.5',
                        t.section === 'Math' ? 'bg-blue-500/15 text-blue-300' : 'bg-emerald-500/15 text-emerald-300'
                      )}>
                        {t.section === 'Math' ? 'M' : 'R&W'}
                      </span>
                      {t.domain}
                    </td>
                    <td className="py-2.5 pr-3 text-text-secondary">{t.topic}</td>
                    <td className="py-2.5 text-center font-bold text-text-primary">{t.total}</td>
                    <td className="py-2.5 text-center text-emerald-400 font-semibold">{t.fixed}</td>
                    <td className="py-2.5 text-center">
                      {t.repeated > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                          {t.repeated} recurring
                        </span>
                      ) : (
                        <span className="text-text-dim">—</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {t.unresolved === 0 ? (
                        <span className="text-emerald-400 font-medium">✓ Mastered</span>
                      ) : (
                        <span className="text-amber-400 font-medium">
                          {t.unresolved} active error{t.unresolved > 1 ? 's' : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
