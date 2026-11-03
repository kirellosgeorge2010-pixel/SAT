import { useState } from 'react';
import { X, Sheet, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

export function GSheetsModal({ isOpen, onClose, onPush, isAuthed, isPushing, pushError, pushSuccess, isConfigured, onSignOut }) {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('Error Log');

  if (!isOpen) return null;

  const extractId = (input) => {
    // Accept full URL or bare ID
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : input.trim();
  };

  const handlePush = () => {
    const id = extractId(spreadsheetId);
    if (!id) return;
    onPush(id, sheetName || 'Error Log');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-sm animate-fade-in">
      <div className="card max-w-md w-full mx-4 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Sheet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Push to Google Sheets</h2>
              <p className="text-xs text-text-muted">Append rows to your existing spreadsheet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {!isConfigured ? (
            <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning">Google Client ID not configured</p>
                  <p className="text-xs text-text-muted mt-1">
                    Add <code className="text-gold font-mono bg-surface px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> to your{' '}
                    <code className="text-gold font-mono bg-surface px-1 rounded">.env</code> file to enable Google Sheets integration.
                  </p>
                  <a
                    href="https://console.cloud.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gold hover:text-gold-light mt-2 transition-colors"
                  >
                    Create OAuth credentials <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : pushSuccess ? (
            <div className="rounded-lg bg-success/10 border border-success/20 p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-success">Successfully pushed!</p>
                <p className="text-xs text-text-muted mt-0.5">Your entries have been appended to the spreadsheet.</p>
              </div>
            </div>
          ) : (
            <>
              {pushError && (
                <div className="rounded-lg bg-error/10 border border-error/20 p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-error">{pushError}</p>
                </div>
              )}

              {/* Spreadsheet URL / ID */}
              <div className="space-y-1.5">
                <label className="section-label text-[10px]">Spreadsheet URL or ID</label>
                <input
                  className="input-field text-sm"
                  placeholder="https://docs.google.com/spreadsheets/d/YOUR_ID/..."
                  value={spreadsheetId}
                  onChange={e => setSpreadsheetId(e.target.value)}
                />
                <p className="text-xs text-text-dim">
                  Paste the full URL or just the spreadsheet ID from the URL bar.
                </p>
              </div>

              {/* Sheet / Tab name */}
              <div className="space-y-1.5">
                <label className="section-label text-[10px]">Sheet Tab Name</label>
                <input
                  className="input-field text-sm"
                  placeholder="Error Log"
                  value={sheetName}
                  onChange={e => setSheetName(e.target.value)}
                />
              </div>

              {/* Permission note */}
              <div className="rounded-lg bg-surface border border-border p-3 text-xs text-text-muted space-y-1">
                <p className="font-medium text-text-secondary">What happens when you click Push:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Google sign-in popup will appear (first time only)</li>
                  <li>A header row + all your entries will be appended</li>
                  <li>Data is written to the tab name you specify above</li>
                </ul>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  className="btn-primary flex-1 justify-center"
                  onClick={handlePush}
                  disabled={isPushing || !spreadsheetId.trim()}
                >
                  {isPushing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Pushing…</>
                  ) : (
                    <><Sheet className="w-4 h-4" />Push to Sheet</>
                  )}
                </button>
                <button className="btn-secondary" onClick={onClose}>Cancel</button>
              </div>

              {isAuthed && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-success flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Signed in to Google
                  </span>
                  <button onClick={onSignOut} className="text-text-muted hover:text-error transition-colors">
                    Sign out
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
