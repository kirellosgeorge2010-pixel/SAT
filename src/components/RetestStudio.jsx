import { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';
import { REVIEW_STATUSES } from '../utils/satTaxonomy';
import clsx from 'clsx';

export function RetestStudio({ mistakes, onUpdateMistake, activeRetestItem, onCloseRetest }) {
  const [selectedQuestion, setSelectedQuestion] = useState(activeRetestItem || null);
  const [userAnswer, setUserAnswer] = useState(null);
  const [retestSubmitted, setRetestSubmitted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Ready for Retest');

  useEffect(() => {
    if (activeRetestItem) {
      setSelectedQuestion(activeRetestItem);
      setUserAnswer(null);
      setRetestSubmitted(false);
      setTimerSeconds(0);
      setIsTimerRunning(true);
    }
  }, [activeRetestItem]);

  // Retest stopwatch
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const handleStartQuestion = (q) => {
    setSelectedQuestion(q);
    setUserAnswer(null);
    setRetestSubmitted(false);
    setTimerSeconds(0);
    setIsTimerRunning(true);
  };

  const handleSubmitRetest = () => {
    if (!userAnswer || !selectedQuestion) return;
    setIsTimerRunning(false);
    setRetestSubmitted(true);

    const isCorrect = userAnswer === selectedQuestion.correctAnswer;
    const newStatus = isCorrect ? 'Fixed' : 'Repeated Mistake';

    const historyRecord = {
      date: new Date().toISOString().slice(0, 10),
      answer: userAnswer,
      isCorrect,
      timeSeconds: timerSeconds,
      notes: isCorrect
        ? `Solved independently in ${timerSeconds}s.`
        : `Selected ${userAnswer} instead of ${selectedQuestion.correctAnswer}.`,
    };

    onUpdateMistake(selectedQuestion.id, {
      reviewStatus: newStatus,
      isCorrect,
      retestHistory: [...(selectedQuestion.retestHistory || []), historyRecord],
    });
  };

  const filteredQueue = mistakes.filter(m => {
    if (filterStatus === 'All') return true;
    return m.reviewStatus === filterStatus;
  });

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Retest Active Session View */}
      {selectedQuestion ? (
        <div className="card p-6 border-gold/40 space-y-6 bg-card glow-gold">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-bold">
                Retest Mode · {selectedQuestion.section}
              </span>
              <span className="text-xs text-text-muted">
                {selectedQuestion.testName} · Question #{selectedQuestion.questionNumber}
              </span>
              <span className="text-xs font-medium text-text-dim">
                ({selectedQuestion.topic})
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface border border-border text-xs font-mono text-gold">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timerSeconds)}</span>
              </div>
              <button
                onClick={() => {
                  setSelectedQuestion(null);
                  setIsTimerRunning(false);
                  onCloseRetest?.();
                }}
                className="text-xs text-text-muted hover:text-text-primary"
              >
                Exit Retest
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-dim">
              Solve this question independently without looking at the answer:
            </p>
            <div className="p-5 rounded-xl bg-surface border border-border text-text-primary text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {selectedQuestion.questionText}
            </div>

            {selectedQuestion.questionImage && (
              <div className="max-w-md rounded-xl overflow-hidden border border-border">
                <img
                  src={selectedQuestion.questionImage}
                  alt="Question screenshot"
                  className="w-full object-contain max-h-64 bg-black"
                />
              </div>
            )}
          </div>

          {/* Answer Choice Selector */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-dim">
              Select Your Answer:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {['A', 'B', 'C', 'D'].map(choice => {
                const choiceText = selectedQuestion.options?.[choice];
                const isSelected = userAnswer === choice;
                const isCorrect = choice === selectedQuestion.correctAnswer;

                let btnStyle = 'bg-surface border-border hover:border-gold/40 text-text-primary';
                if (retestSubmitted) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-gold/20 border-gold text-gold font-bold';
                }

                return (
                  <button
                    key={choice}
                    disabled={retestSubmitted}
                    onClick={() => setUserAnswer(choice)}
                    className={clsx(
                      'p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-3',
                      btnStyle
                    )}
                  >
                    <span className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center font-bold flex-shrink-0">
                      {choice}
                    </span>
                    <span className="flex-1">{choiceText || `Choice ${choice}`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action */}
          {!retestSubmitted ? (
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={!userAnswer}
                onClick={handleSubmitRetest}
                className="btn-primary text-xs py-2 px-6 disabled:opacity-40"
              >
                Submit Independent Answer
              </button>
            </div>
          ) : (
            /* Post-submission Result & Diagnostic Feedback */
            <div className="p-5 rounded-xl border space-y-4 animate-slide-up bg-surface">
              {userAnswer === selectedQuestion.correctAnswer ? (
                <div className="flex items-start gap-3 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-emerald-300">
                      Mastered! Marked as "Fixed ✓"
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      You solved this question correctly in {formatTime(timerSeconds)}. This mistake is now marked as resolved.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 text-rose-400">
                  <XCircle className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-rose-300">
                      Incorrect — Marked as "Repeated Mistake ⚠"
                    </h4>
                    <p className="text-xs text-text-muted mt-0.5">
                      Correct Answer was <strong>{selectedQuestion.correctAnswer}</strong>. This concept still has an unresolved gap.
                    </p>
                  </div>
                </div>
              )}

              {/* Takeaway Reminder */}
              <div className="p-3 rounded-lg bg-card border border-border text-xs space-y-1">
                <span className="font-bold text-gold uppercase tracking-wider text-[10px]">
                  Core Takeaway & Solution:
                </span>
                <p className="text-text-secondary leading-relaxed">
                  {selectedQuestion.takeaway || selectedQuestion.rootCause || 'Review the step-by-step solution.'}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSelectedQuestion(null);
                    onCloseRetest?.();
                  }}
                  className="btn-secondary text-xs"
                >
                  Return to Retest Queue
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* ── Retest Queue & Spaced Review Reminders ────────────────────────── */}
      <div className="card p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-gold" />
              Smart Retest Queue
            </h3>
            <p className="text-xs text-text-muted">
              Mistakes only graduate to "Fixed" after you re-solve them independently
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Ready for Retest', 'Repeated Mistake', 'Learning in Progress', 'Fixed'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={clsx(
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  filterStatus === st
                    ? 'bg-gold text-base font-bold border-gold'
                    : 'bg-surface text-text-muted border-border hover:border-gold/30'
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Items */}
        <div className="space-y-3">
          {filteredQueue.length === 0 ? (
            <div className="text-center py-12 text-text-dim text-xs">
              No questions found under "{filterStatus}".
            </div>
          ) : (
            filteredQueue.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-surface border border-border hover:border-gold/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-[10px] font-bold',
                      item.section === 'Math' ? 'bg-blue-500/15 text-blue-300' : 'bg-emerald-500/15 text-emerald-300'
                    )}>
                      {item.section} · {item.module}
                    </span>
                    <span className="text-xs font-semibold text-text-primary">
                      {item.testName} · Q{item.questionNumber}
                    </span>
                    <span className="text-xs text-text-dim">({item.topic})</span>
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                      item.reviewStatus === 'Fixed' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' :
                      item.reviewStatus === 'Repeated Mistake' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold' :
                      'bg-purple-500/15 text-purple-300 border-purple-500/30'
                    )}>
                      {item.reviewStatus}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary line-clamp-2">
                    {item.questionText}
                  </p>

                  {item.takeaway && (
                    <p className="text-[11px] text-gold/80 italic">
                      Key Takeaway: {item.takeaway}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartQuestion(item)}
                    className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retest Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
