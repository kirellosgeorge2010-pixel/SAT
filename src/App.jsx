import { useState, useCallback } from 'react';
import { BookOpen, Zap, Settings, HelpCircle, Github } from 'lucide-react';
import { UploadZone } from './components/UploadZone';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { ErrorLogTable } from './components/ErrorLogTable';
import { ExportBar } from './components/ExportBar';
import { Toast, useToast } from './components/Toast';
import { useGemini } from './hooks/useGemini';
import { useGoogleSheets } from './hooks/useGoogleSheets';

const apiKeyMissing =
  !import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.VITE_GEMINI_API_KEY === 'your_gemini_api_key_here';

export default function App() {
  const [files, setFiles] = useState([]);
  const [entries, setEntries] = useState([]);
  const [showSettings, setShowSettings] = useState(apiKeyMissing);

  const { toasts, addToast, dismissToast } = useToast();
  const { processFiles, isProcessing, progress, error: geminiError, setError: setGeminiError } = useGemini();
  const sheetsHook = useGoogleSheets();

  // ── File management ──────────────────────────────────────────────────────────
  const handleFilesAdd = useCallback((newFiles) => {
    setFiles(prev => {
      const existing = new Set(prev.map(f => `${f.name}-${f.size}`));
      const unique = newFiles.filter(f => !existing.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
  }, []);

  const handleFileRemove = useCallback((file) => {
    setFiles(prev => prev.filter(f => f !== file));
  }, []);

  // ── Process files ─────────────────────────────────────────────────────────
  const handleProcess = useCallback(async () => {
    if (geminiError) setGeminiError(null);

    await processFiles(files, (newEntries) => {
      if (newEntries.length === 0) {
        addToast({ type: 'info', title: 'No questions found', message: 'Gemini did not detect any SAT questions in the uploaded files.' });
        return;
      }

      const errors = newEntries.filter(e => e._hasError).length;
      const successes = newEntries.length - errors;

      setEntries(prev => [...prev, ...newEntries]);
      setFiles([]);

      if (successes > 0) {
        addToast({
          type: 'success',
          title: `Extracted ${successes} question${successes !== 1 ? 's' : ''}`,
          message: errors > 0 ? `${errors} file(s) had errors. Check flagged rows.` : 'Review and edit the entries below.',
          duration: 5000,
        });
      }
      if (errors > 0 && successes === 0) {
        addToast({ type: 'error', title: 'Processing failed', message: 'Could not extract questions. Check the flagged rows.' });
      }
    });
  }, [files, processFiles, geminiError, setGeminiError, addToast]);

  // ── Entry CRUD ────────────────────────────────────────────────────────────
  const handleUpdate = useCallback((id, changes) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...changes } : e));
  }, []);

  const handleDelete = useCallback((id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    addToast({ type: 'info', title: 'Entry deleted', duration: 2500 });
  }, [addToast]);

  const handleAdd = useCallback((entry) => {
    setEntries(prev => [...prev, entry]);
  }, []);

  return (
    <div className="min-h-screen bg-base bg-grid-pattern bg-grid">
      {/* Processing overlay */}
      {isProcessing && <ProcessingOverlay progress={progress} />}

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-base/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-gold" />
            </div>
            <div>
              <span className="text-sm font-bold text-text-primary tracking-tight">SAT Error Log</span>
              <span className="hidden sm:inline ml-1.5 text-xs text-text-muted">Assistant</span>
            </div>
            <span className="hidden md:flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-[10px] bg-gold-muted text-gold border border-gold/20 font-semibold">
              <Zap className="w-2.5 h-2.5" />
              Gemini AI
            </span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-text-muted border border-border hover:border-gold/30 hover:text-text-primary transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Get API Key
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* ── Hero ──────────────────────────────────────────────────────────────── */}
        <div className="text-center space-y-3 py-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
            Automated SAT{' '}
            <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
              Error Analysis
            </span>
          </h1>
          <p className="text-text-muted text-base max-w-xl mx-auto">
            Upload your SAT practice test images or PDFs. Gemini AI extracts, classifies,
            and explains every mistake automatically.
          </p>
        </div>

        {/* ── API Key Warning ────────────────────────────────────────────────── */}
        {apiKeyMissing && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 animate-slide-up">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
              <Settings className="w-4 h-4 text-warning" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-warning">Gemini API key not configured</p>
              <p className="text-xs text-text-muted mt-0.5">
                Copy <code className="font-mono text-gold bg-surface px-1 rounded">.env.example</code> → <code className="font-mono text-gold bg-surface px-1 rounded">.env</code> and add your{' '}
                <code className="font-mono text-gold bg-surface px-1 rounded">VITE_GEMINI_API_KEY</code>.
                AI extraction will be disabled until configured.
              </p>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs py-1.5 whitespace-nowrap flex-shrink-0"
            >
              Get Free API Key →
            </a>
          </div>
        )}

        {/* ── Gemini Error ───────────────────────────────────────────────────── */}
        {geminiError && (
          <div className="rounded-xl border border-error/30 bg-error/5 p-4 flex items-start gap-3 animate-slide-up">
            <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-error" />
            </div>
            <div>
              <p className="text-sm font-semibold text-error">Processing Error</p>
              <p className="text-xs text-text-muted mt-0.5">{geminiError}</p>
            </div>
          </div>
        )}

        {/* ── Upload Zone ───────────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="section-label px-3">Upload Files</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <UploadZone
            files={files}
            onFilesAdd={handleFilesAdd}
            onFileRemove={handleFileRemove}
            onProcess={handleProcess}
            isProcessing={isProcessing}
          />
        </section>

        {/* ── Review Dashboard ──────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-border" />
            <span className="section-label px-3">Review & Edit Dashboard</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <ErrorLogTable
            entries={entries}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </section>

        {/* ── Export ───────────────────────────────────────────────────────── */}
        {entries.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px flex-1 bg-border" />
              <span className="section-label px-3">Export</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <ExportBar entries={entries} sheetsHook={sheetsHook} />
          </section>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="mt-16 border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-text-dim">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            SAT Error Log Assistant · Powered by Gemini 1.5 Flash
          </div>
          <p>All processing happens in your browser. Your data stays private.</p>
        </div>
      </footer>
    </div>
  );
}
