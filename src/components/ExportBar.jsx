import { useState } from 'react';
import { Download, Sheet, Copy, Check, Trash2, AlertCircle } from 'lucide-react';
import { entriesToCsv, downloadCsv } from '../utils/csvExport';
import { GSheetsModal } from './GSheetsModal';
import clsx from 'clsx';

export function ExportBar({
  entries,
  sheetsHook,
}) {
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    isConfigured,
    isAuthed,
    isPushing,
    pushError,
    pushSuccess,
    pushToSheet,
    signOut,
    setPushSuccess,
    setPushError,
  } = sheetsHook;

  const handleDownloadCsv = () => {
    const csv = entriesToCsv(entries);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `sat_error_log_${date}.csv`);
  };

  const handleCopyCSV = async () => {
    const csv = entriesToCsv(entries);
    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = csv;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (entries.length === 0) return null;

  return (
    <>
      <div className="card p-4 animate-slide-up">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-label mb-0.5">Export</p>
            <p className="text-xs text-text-muted">
              {entries.length} entr{entries.length === 1 ? 'y' : 'ies'} ready to export
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Copy CSV */}
            <button
              className={clsx(
                'btn-secondary text-xs py-1.5 transition-all',
                copied && 'border-success/40 text-success',
              )}
              onClick={handleCopyCSV}
              title="Copy CSV to clipboard"
            >
              {copied ? (
                <><Check className="w-3.5 h-3.5" />Copied!</>
              ) : (
                <><Copy className="w-3.5 h-3.5" />Copy CSV</>
              )}
            </button>

            {/* Download CSV */}
            <button
              className="btn-secondary text-xs py-1.5"
              onClick={handleDownloadCsv}
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>

            {/* Google Sheets */}
            <button
              className={clsx(
                'inline-flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium text-xs transition-all duration-150',
                isConfigured
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50'
                  : 'btn-secondary opacity-60',
              )}
              onClick={() => { setPushSuccess(false); setPushError(null); setShowSheetsModal(true); }}
              title={isConfigured ? 'Push to Google Sheets' : 'Configure VITE_GOOGLE_CLIENT_ID to enable'}
            >
              <Sheet className="w-3.5 h-3.5" />
              {isConfigured ? 'Push to Google Sheets' : 'Google Sheets (configure)'}
              {!isConfigured && <AlertCircle className="w-3 h-3 text-warning" />}
            </button>
          </div>
        </div>
      </div>

      <GSheetsModal
        isOpen={showSheetsModal}
        onClose={() => setShowSheetsModal(false)}
        onPush={(id, tab) => pushToSheet(id, tab, entries)}
        isAuthed={isAuthed}
        isPushing={isPushing}
        pushError={pushError}
        pushSuccess={pushSuccess}
        isConfigured={isConfigured}
        onSignOut={signOut}
      />
    </>
  );
}
