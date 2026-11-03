import { useState } from 'react';
import {
  AlertTriangle,
  Target,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { rankWeaknesses, generateStudyRecommendations } from '../utils/analyticsEngine';
import clsx from 'clsx';

export function WeaknessEngine({ mistakes, onSelectQuestionForRetest }) {
  const rankedWeaknesses = rankWeaknesses(mistakes);
  const recommendations = generateStudyRecommendations(mistakes);

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── Top Section: 3 Highest-Priority Weaknesses Prescription ──────── */}
      <div className="card p-6 space-y-6 border-gold/30 bg-gradient-to-b from-card to-surface">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">
                Personalized AI Study Prescription
              </h2>
              <p className="text-xs text-text-muted">
                Synthesized directly from your recorded errors and cognitive patterns
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            Top 3 High-Leverage Fixes
          </span>
        </div>

        {/* Suggested Next Session Focus Box */}
        <div className="p-4 rounded-xl bg-gold/10 border border-gold/25 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-gold">
              Recommended Focus for Next Study Session
            </p>
            <p className="text-sm font-semibold text-text-primary leading-relaxed">
              {recommendations.nextSessionFocus}
            </p>
          </div>
        </div>

        {/* 3 Priority Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.topPriorities.length === 0 ? (
            <div className="md:col-span-3 text-center py-8 text-text-muted text-xs">
              Log at least 2 questions to generate targeted study recommendations.
            </div>
          ) : (
            recommendations.topPriorities.map(p => (
              <div
                key={p.rank}
                className="p-4 rounded-xl bg-surface border border-border flex flex-col justify-between space-y-3 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 px-2.5 py-1 rounded-bl-lg bg-gold/15 text-gold text-[10px] font-bold">
                  Priority #{p.rank}
                </div>

                <div>
                  <span className={clsx(
                    'inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1.5',
                    p.section === 'Math' ? 'bg-blue-500/15 text-blue-300' : 'bg-emerald-500/15 text-emerald-300'
                  )}>
                    {p.section} · {p.domain}
                  </span>
                  <h4 className="text-sm font-bold text-text-primary line-clamp-2">
                    {p.topic}
                  </h4>
                  <p className="text-xs text-text-dim mt-1">
                    {p.unresolvedCount} active mistake{p.unresolvedCount > 1 ? 's' : ''}{' '}
                    {p.repeatedCount > 0 && `(${p.repeatedCount} recurring)`}
                  </p>
                </div>

                {/* Cognitive pattern */}
                <div className="p-2.5 rounded-lg bg-card border border-border/60 text-[11px] text-text-secondary leading-snug">
                  <span className="font-semibold text-gold block mb-0.5">Diagnosed Pattern:</span>
                  {p.cognitivePattern}
                </div>

                {/* Recommended Drill */}
                <div className="text-xs text-text-muted leading-relaxed">
                  <span className="font-semibold text-text-primary block mb-0.5">Corrective Drill:</span>
                  {p.recommendedPractice}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Ranked Weakness Matrix ─────────────────────────────────────────── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Ranked SAT Weakness Matrix
              </h3>
              <p className="text-xs text-text-muted">
                Weighted by frequency, question difficulty, and repetition penalty (no 1-question distortions)
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {rankedWeaknesses.length === 0 ? (
            <p className="text-xs text-text-dim text-center py-6">No weaknesses recorded yet.</p>
          ) : (
            rankedWeaknesses.map((w, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-surface border border-border hover:border-gold/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold text-gold">
                      #{idx + 1}
                    </span>
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-[10px] font-bold',
                      w.section === 'Math' ? 'bg-blue-500/15 text-blue-300' : 'bg-emerald-500/15 text-emerald-300'
                    )}>
                      {w.section}
                    </span>
                    <span className="text-xs font-semibold text-text-dim">{w.domain}</span>
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-[10px] font-bold border',
                      w.severity === 'Critical' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                      w.severity === 'High' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                      'bg-surface text-text-muted border-border'
                    )}>
                      {w.severity} Severity (Score: {w.score})
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-text-primary">
                    {w.topic}
                  </h4>

                  <p className="text-xs text-text-muted">
                    {w.primaryCognitivePattern}
                  </p>
                </div>

                {/* Question Chips & Retest Action */}
                <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
                  <span className="text-xs text-text-dim mr-1">
                    {w.unresolved} unresolved / {w.total} total
                  </span>
                  {w.questions.slice(0, 2).map(q => (
                    <button
                      key={q.id}
                      onClick={() => onSelectQuestionForRetest?.(q)}
                      className="px-2.5 py-1 rounded bg-card hover:bg-gold-muted border border-border text-xs text-gold hover:text-gold-light transition-colors flex items-center gap-1"
                      title="Retest this question"
                    >
                      <span>Q{q.questionNumber}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
