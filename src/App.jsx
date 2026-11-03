import { useState, useEffect, useCallback, useMemo } from 'react';
import React from 'react';
import {
  BarChart3,
  BookOpen,
  RotateCcw,
  Target,
  Bot,
  Plus,
  Sun,
  Moon,
  Download,
  Upload,
  RefreshCw,
  Sheet,
  Sparkles,
  Layers,
  FileText,
  HelpCircle,
  AlertTriangle,
  Key,
} from 'lucide-react';

// Storage & Utilities
import {
  loadMistakes,
  saveMistakes,
  resetToSeedData,
  clearAllData,
  exportToJson,
  parseImportedJson,
  loadTheme,
  saveTheme,
} from './utils/storage';
import { entriesToCsv, downloadCsv } from './utils/csvExport';

// Hooks
import { useGemini } from './hooks/useGemini';
import { useGoogleSheets } from './hooks/useGoogleSheets';

// Components
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { MistakeTableView } from './components/MistakeTableView';
import { WeaknessEngine } from './components/WeaknessEngine';
import { RetestStudio } from './components/RetestStudio';
import { AIChatAssistant } from './components/AIChatAssistant';
import { AddMistakeModal } from './components/AddMistakeModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { GSheetsModal } from './components/GSheetsModal';
import { Toast, useToast } from './components/Toast';
import clsx from 'clsx';

export default function App() {
  // Navigation Tabs: 'analytics' | 'log' | 'retest' | 'recommendations' | 'chat'
  const [activeTab, setActiveTab] = useState('analytics');

  // Theme: 'dark' | 'light'
  const [theme, setTheme] = useState(loadTheme());

  // Mistakes Database
  const [mistakes, setMistakes] = useState(() => loadMistakes());

  // Modals & Active Retest State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [activeRetestQuestion, setActiveRetestQuestion] = useState(null);
  const [isGSheetsOpen, setIsGSheetsOpen] = useState(false);

  // Notifications & Hooks
  const { toasts, addToast, dismissToast } = useToast();
  const { processFiles, isProcessing, progress, error: geminiError } = useGemini();
  const sheetsHook = useGoogleSheets();

  // Apply theme class to <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  // Persist mistakes to localStorage on change
  useEffect(() => {
    saveMistakes(mistakes);
  }, [mistakes]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // ── Mistake Operations ───────────────────────────────────────────────────────
  const handleSaveMistake = useCallback((newEntry) => {
    setMistakes(prev => [newEntry, ...prev]);
    addToast({
      type: 'success',
      title: 'Mistake Recorded',
      message: `Question #${newEntry.questionNumber} added to error intelligence log.`,
      duration: 3500,
    });
  }, [addToast]);

  const handleUpdateMistake = useCallback((id, updates) => {
    setMistakes(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item))
    );
  }, []);

  const handleDeleteMistake = useCallback((id) => {
    setMistakes(prev => prev.filter(item => item.id !== id));
    addToast({
      type: 'info',
      title: 'Question Deleted',
      message: 'The record was removed from your log.',
      duration: 2500,
    });
  }, [addToast]);

  // ── AI Vision Extraction on Upload ──────────────────────────────────────────
  const handleAnalyzeUpload = useCallback(async (files) => {
    await processFiles(files, (extractedMistakes) => {
      if (extractedMistakes.length > 0) {
        setMistakes(prev => [...extractedMistakes, ...prev]);
        addToast({
          type: 'success',
          title: 'AI Analysis Complete',
          message: `Extracted & diagnosed ${extractedMistakes.length} question(s) from your upload.`,
          duration: 4000,
        });
        setActiveTab('log');
      } else {
        addToast({
          type: 'info',
          title: 'No Questions Found',
          message: 'Could not detect SAT questions in the uploaded document.',
          duration: 3500,
        });
      }
    });
  }, [processFiles, addToast]);

  // ── Retest Navigation ───────────────────────────────────────────────────────
  const handleStartRetest = useCallback((question) => {
    setActiveRetestQuestion(question);
    setActiveTab('retest');
  }, []);

  // ── Data Backup & Management ────────────────────────────────────────────────
  const handleExportCsv = () => {
    const csv = entriesToCsv(mistakes);
    downloadCsv(csv, `sat_error_log_${new Date().toISOString().slice(0, 10)}.csv`);
    addToast({ type: 'success', title: 'CSV Downloaded', duration: 2500 });
  };

  const handleExportJson = () => {
    exportToJson(mistakes);
    addToast({ type: 'success', title: 'JSON Backup Downloaded', duration: 2500 });
  };

  const handleImportJsonFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = parseImportedJson(evt.target.result);
        setMistakes(prev => [...imported, ...prev]);
        addToast({
          type: 'success',
          title: 'Data Imported',
          message: `Imported ${imported.length} questions successfully.`,
          duration: 4000,
        });
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Import Failed',
          message: err.message,
          duration: 4000,
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset mistake log back to the default diagnostic seed dataset?')) {
      const resetData = resetToSeedData();
      setMistakes(resetData);
      addToast({
        type: 'info',
        title: 'Demo Data Restored',
        message: 'Loaded sample questions across Math & R&W.',
        duration: 3000,
      });
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear ALL recorded mistakes? This cannot be undone unless you have a JSON backup.')) {
      clearAllData();
      setMistakes([]);
      addToast({ type: 'info', title: 'All Records Cleared', duration: 2500 });
    }
  };

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col font-sans transition-colors duration-200">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* AI Processing Modal Overlay */}
      {isProcessing && <ProcessingOverlay progress={progress} />}

      {/* Manual Entry & OCR Upload Modal */}
      <AddMistakeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveMistake}
        onAnalyzeUpload={handleAnalyzeUpload}
        isProcessing={isProcessing}
      />

      {/* API Key Settings Modal (Essential for GitHub Pages) */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={() =>
          addToast({
            type: 'success',
            title: 'API Key Saved',
            message: 'Active for all Gemini OCR & Socrates-SAT chat features.',
            duration: 3500,
          })
        }
      />

      {/* Google Sheets Push Modal */}
      <GSheetsModal
        isOpen={isGSheetsOpen}
        onClose={() => setIsGSheetsOpen(false)}
        onPush={(id, tab) => sheetsHook.pushToSheet(id, tab, mistakes)}
        isAuthed={sheetsHook.isAuthed}
        isPushing={sheetsHook.isPushing}
        pushError={sheetsHook.pushError}
        pushSuccess={sheetsHook.pushSuccess}
        isConfigured={sheetsHook.isConfigured}
        onSignOut={sheetsHook.signOut}
      />

      {/* ── Top Header Bar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-extrabold tracking-tight text-text-primary">
                SAT Mistake Intelligence
              </span>
              <span className="hidden md:inline text-[11px] font-semibold text-gold/80 px-1.5 py-0.2 rounded bg-gold/10 border border-gold/20">
                Cognitive Diagnostic Engine
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {/* Record Mistake Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary py-1.5 px-3 flex items-center gap-1.5 text-xs shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Question</span>
            </button>

            {/* API Key Settings Button */}
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="p-1.5 rounded-lg border border-border bg-surface text-text-muted hover:text-gold hover:border-gold/40 transition-colors"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4" />
            </button>

            {/* Google Sheets Push */}
            <button
              onClick={() => setIsGSheetsOpen(true)}
              className="p-1.5 rounded-lg border border-border bg-surface text-text-muted hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
              title="Push to Google Sheets"
            >
              <Sheet className="w-4 h-4" />
            </button>

            {/* CSV Export */}
            <button
              onClick={handleExportCsv}
              className="p-1.5 rounded-lg border border-border bg-surface text-text-muted hover:text-gold hover:border-gold/40 transition-colors"
              title="Download CSV Error Log"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-border bg-surface text-text-muted hover:text-text-primary transition-colors"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* ── Main Navigation Tabs ──────────────────────────────────────────── */}
        <div className="border-t border-border/50 bg-surface/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto space-x-1 sm:space-x-2 py-1">
            {[
              { id: 'analytics', label: 'Performance Analytics', icon: <BarChart3 className="w-3.5 h-3.5" /> },
              { id: 'log', label: `Mistake Log (${mistakes.length})`, icon: <FileText className="w-3.5 h-3.5" /> },
              { id: 'retest', label: 'Smart Retest Studio', icon: <RotateCcw className="w-3.5 h-3.5" /> },
              { id: 'recommendations', label: 'AI Study Prescription', icon: <Target className="w-3.5 h-3.5" /> },
              { id: 'chat', label: 'Socrates-SAT Chatbot', icon: <Bot className="w-3.5 h-3.5" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150',
                  activeTab === tab.id
                    ? 'bg-gold/15 text-gold border border-gold/30 shadow-sm'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface/60'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        {geminiError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex flex-wrap items-center justify-between gap-3 animate-slide-up">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>
                {geminiError.includes('leaked') || geminiError.includes('403') || geminiError.includes('PERMISSION_DENIED')
                  ? 'Your Google API key was reported as leaked/revoked. Please generate a fresh key from Google AI Studio and enter it below.'
                  : geminiError}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsApiKeyModalOpen(true)}
                className="btn-primary text-xs py-1 px-3 flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                Update API Key
              </button>
              <button
                onClick={() => window.location.reload()}
                className="text-text-muted hover:text-text-primary underline text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Analytics & Performance Dashboard */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            mistakes={mistakes}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 2: Mistake Log & Entry Table */}
        {activeTab === 'log' && (
          <MistakeTableView
            mistakes={mistakes}
            onUpdateMistake={handleUpdateMistake}
            onDeleteMistake={handleDeleteMistake}
            onRetestQuestion={handleStartRetest}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {/* Tab 3: Smart Retest Studio */}
        {activeTab === 'retest' && (
          <RetestStudio
            mistakes={mistakes}
            onUpdateMistake={handleUpdateMistake}
            activeRetestItem={activeRetestQuestion}
            onCloseRetest={() => setActiveRetestQuestion(null)}
          />
        )}

        {/* Tab 4: Weakness Matrix & Personalized Study Recommendations */}
        {activeTab === 'recommendations' && (
          <WeaknessEngine
            mistakes={mistakes}
            onSelectQuestionForRetest={handleStartRetest}
          />
        )}

        {/* Tab 5: Contextual AI SAT Tutor Chatbot */}
        {activeTab === 'chat' && (
          <AIChatAssistant mistakes={mistakes} />
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface/50 py-5 text-xs text-text-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-gold" />
            <span className="font-semibold text-text-secondary">SAT Mistake Intelligence</span>
            <span>· Academic Cognitive Analysis</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="hover:text-gold cursor-pointer transition-colors flex items-center gap-1">
              <Upload className="w-3 h-3" />
              Import Backup (JSON)
              <input type="file" accept=".json" onChange={handleImportJsonFile} className="hidden" />
            </label>
            <button onClick={handleExportJson} className="hover:text-gold transition-colors flex items-center gap-1">
              <Download className="w-3 h-3" />
              Export Backup (JSON)
            </button>
            <button onClick={handleResetDemoData} className="hover:text-text-primary transition-colors flex items-center gap-1">
              <RefreshCw className="w-3 h-3" />
              Reset Demo
            </button>
            <button onClick={handleClearAll} className="hover:text-rose-400 transition-colors">
              Clear All
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
