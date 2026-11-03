export function ProcessingOverlay({ progress }) {
  const { current, total, label } = progress;
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm animate-fade-in">
      <div className="card p-8 max-w-sm w-full mx-4 space-y-6 glow-gold">
        {/* Animated logo / spinner */}
        <div className="flex justify-center">
          <div className="relative w-20 h-20">
            {/* Outer ring */}
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" stroke="#2e2e2e" strokeWidth="4" fill="none" />
              <circle
                cx="40" cy="40" r="34"
                stroke="#c9a84c"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            {/* Inner pulse */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center animate-pulse-gold">
                <svg className="w-5 h-5 text-gold animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-semibold text-text-primary">Analyzing with Gemini AI</h3>
          <p className="text-sm text-text-muted leading-relaxed min-h-[2.5rem] flex items-center justify-center">
            {label || 'Preparing…'}
          </p>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-text-muted">
              <span>File {current} of {total}</span>
              <span className="text-gold font-semibold">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold-dark to-gold rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        <p className="text-center text-xs text-text-dim">
          This may take a moment for PDFs with many pages
        </p>
      </div>
    </div>
  );
}
