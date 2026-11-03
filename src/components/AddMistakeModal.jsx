import { useState, useRef } from 'react';
import {
  X,
  Upload,
  PlusCircle,
  Sparkles,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import {
  SAT_SECTIONS,
  SAT_MODULES,
  SAT_DIFFICULTIES,
  SAT_DOMAINS,
  ERROR_CATEGORIES,
  REVIEW_STATUSES,
} from '../utils/satTaxonomy';
import { deepDiagnoseMistake } from '../utils/geminiIntelligence';
import clsx from 'clsx';

export function AddMistakeModal({ isOpen, onClose, onSave, onAnalyzeUpload, isProcessing }) {
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'upload'
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagError, setDiagError] = useState(null);

  // Manual Form State
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    testName: 'Practice Test 1',
    section: 'Math',
    module: 'Module 1',
    questionNumber: '1',
    difficulty: 'Medium',
    timeSpentSeconds: 75,
    domain: 'Algebra',
    topic: 'Linear equations in one variable',
    subtopic: '',
    questionText: '',
    options: { A: '', B: '', C: '', D: '' },
    selectedAnswer: 'A',
    correctAnswer: 'B',
    errorCategory: 'Application Error',
    rootCause: '',
    conceptTested: '',
    takeaway: '',
    reviewStatus: 'New Mistake',
    customNotes: '',
    tags: '',
  });

  // Upload Tab State
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const currentDomains = SAT_DOMAINS[form.section] || [];
  const currentDomainObj = currentDomains.find(d => d.name === form.domain) || currentDomains[0];
  const currentTopics = currentDomainObj ? currentDomainObj.topics : [];

  const handleSectionChange = (section) => {
    const domains = SAT_DOMAINS[section] || [];
    const firstDomain = domains[0]?.name || '';
    const firstTopic = domains[0]?.topics[0] || '';
    setForm(prev => ({
      ...prev,
      section,
      domain: firstDomain,
      topic: firstTopic,
    }));
  };

  const handleDomainChange = (domain) => {
    const dObj = currentDomains.find(d => d.name === domain);
    setForm(prev => ({
      ...prev,
      domain,
      topic: dObj?.topics[0] || '',
    }));
  };

  // Run Gemini deep diagnostic on current form inputs
  const handleAutoDiagnose = async () => {
    if (!form.questionText.trim()) {
      setDiagError('Please enter the question text first.');
      return;
    }
    setDiagError(null);
    setIsDiagnosing(true);

    try {
      const diag = await deepDiagnoseMistake({
        section: form.section,
        questionText: form.questionText,
        options: form.options,
        selectedAnswer: form.selectedAnswer,
        correctAnswer: form.correctAnswer,
        studentNotes: form.customNotes || form.rootCause,
      });

      setForm(prev => ({
        ...prev,
        conceptTested: diag.conceptTested || prev.conceptTested,
        errorCategory: diag.errorCategory || prev.errorCategory,
        rootCause: diag.rootCause || prev.rootCause,
        takeaway: diag.takeaway || prev.takeaway,
        reviewStatus: 'Analyzed',
      }));
    } catch (err) {
      setDiagError(`Diagnostic failed: ${err.message}`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: 'sat-' + Math.random().toString(36).slice(2, 9) + '-' + Date.now().toString(36),
      ...form,
      timeSpentSeconds: Number(form.timeSpentSeconds) || 60,
      isCorrect: form.selectedAnswer === form.correctAnswer,
      tags: form.tags ? form.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [form.section.toLowerCase()],
      stepByStepSolution: [],
      misconceptionsDetected: [],
      knowsRuleStrugglesApplication: form.errorCategory === 'Application Error',
      correctiveExercise: '',
      retestHistory: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onSave(newEntry);
    onClose();
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(files);
  };

  const handleTriggerUploadAnalysis = () => {
    if (uploadedFiles.length === 0) return;
    onAnalyzeUpload(uploadedFiles);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-6 animate-slide-up flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Record SAT Question / Mistake</h2>
              <p className="text-xs text-text-muted">Enter manual details or upload question screenshots for AI OCR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-border bg-surface/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab('manual')}
            className={clsx(
              'px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2',
              activeTab === 'manual'
                ? 'border-gold text-gold'
                : 'border-transparent text-text-muted hover:text-text-primary'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Fast Manual Entry
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={clsx(
              'px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2',
              activeTab === 'upload'
                ? 'border-gold text-gold'
                : 'border-transparent text-text-muted hover:text-text-primary'
            )}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Screenshot / PDF (AI Vision)
          </button>
        </div>

        {/* Tab 1: Manual Entry Form */}
        {activeTab === 'manual' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
            {diagError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {diagError}
              </div>
            )}

            {/* Row 1: Test, Date, Section, Module */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Test / Source
                </label>
                <input
                  type="text"
                  className="input-field text-xs"
                  value={form.testName}
                  onChange={e => setForm({ ...form, testName: e.target.value })}
                  placeholder="e.g. Practice 5"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  className="input-field text-xs"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  SAT Section
                </label>
                <select
                  className="select-field text-xs"
                  value={form.section}
                  onChange={e => handleSectionChange(e.target.value)}
                >
                  {SAT_SECTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Module
                </label>
                <select
                  className="select-field text-xs"
                  value={form.module}
                  onChange={e => setForm({ ...form, module: e.target.value })}
                >
                  {SAT_MODULES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Q#, Difficulty, Time spent, Review status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Question #
                </label>
                <input
                  type="text"
                  className="input-field text-xs"
                  value={form.questionNumber}
                  onChange={e => setForm({ ...form, questionNumber: e.target.value })}
                  placeholder="e.g. 19"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Difficulty
                </label>
                <select
                  className="select-field text-xs"
                  value={form.difficulty}
                  onChange={e => setForm({ ...form, difficulty: e.target.value })}
                >
                  {SAT_DIFFICULTIES.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Time Spent (sec)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="5"
                    max="600"
                    className="input-field text-xs pr-8"
                    value={form.timeSpentSeconds}
                    onChange={e => setForm({ ...form, timeSpentSeconds: e.target.value })}
                  />
                  <Clock className="w-3.5 h-3.5 text-text-dim absolute right-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Review Status
                </label>
                <select
                  className="select-field text-xs"
                  value={form.reviewStatus}
                  onChange={e => setForm({ ...form, reviewStatus: e.target.value })}
                >
                  {REVIEW_STATUSES.map(st => (
                    <option key={st.id} value={st.id}>{st.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Domain & Topic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Domain
                </label>
                <select
                  className="select-field text-xs"
                  value={form.domain}
                  onChange={e => handleDomainChange(e.target.value)}
                >
                  {currentDomains.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Specific Topic
                </label>
                <select
                  className="select-field text-xs"
                  value={form.topic}
                  onChange={e => setForm({ ...form, topic: e.target.value })}
                >
                  {currentTopics.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question Text */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                  Question Text / Prompt
                </label>
                <button
                  type="button"
                  onClick={handleAutoDiagnose}
                  disabled={isDiagnosing || !form.questionText.trim()}
                  className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-light disabled:opacity-40 transition-colors font-medium"
                >
                  <Sparkles className={clsx('w-3.5 h-3.5', isDiagnosing && 'animate-spin')} />
                  {isDiagnosing ? 'Diagnosing with AI…' : '✨ Auto-Diagnose with AI'}
                </button>
              </div>
              <textarea
                rows={3}
                className="input-field text-xs"
                placeholder="Paste the question or passage prompt here..."
                value={form.questionText}
                onChange={e => setForm({ ...form, questionText: e.target.value })}
                required
              />
            </div>

            {/* Answer Choices A, B, C, D */}
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1.5">
                Answer Choices (Optional)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['A', 'B', 'C', 'D'].map(letter => (
                  <div key={letter} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-surface border border-border flex items-center justify-center text-xs font-bold text-text-secondary">
                      {letter}
                    </span>
                    <input
                      type="text"
                      className="input-field text-xs flex-1"
                      placeholder={`Choice ${letter}`}
                      value={form.options[letter] || ''}
                      onChange={e =>
                        setForm({
                          ...form,
                          options: { ...form.options, [letter]: e.target.value },
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Selected vs Correct Answer */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  My Selected Answer
                </label>
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D', 'Blank'].map(choice => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setForm({ ...form, selectedAnswer: choice })}
                      className={clsx(
                        'flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                        form.selectedAnswer === choice
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                          : 'bg-surface border-border text-text-muted hover:border-border/80'
                      )}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Correct Answer
                </label>
                <div className="flex gap-2">
                  {['A', 'B', 'C', 'D'].map(choice => (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => setForm({ ...form, correctAnswer: choice })}
                      className={clsx(
                        'flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                        form.correctAnswer === choice
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-surface border-border text-text-muted hover:border-border/80'
                      )}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Category & Root Cause */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Intelligent Error Category
                </label>
                <select
                  className="select-field text-xs"
                  value={form.errorCategory}
                  onChange={e => setForm({ ...form, errorCategory: e.target.value })}
                >
                  {ERROR_CATEGORIES.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-text-dim mt-1">
                  {ERROR_CATEGORIES.find(c => c.name === form.errorCategory)?.description}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                  Personal Takeaway / Rule to Remember
                </label>
                <input
                  type="text"
                  className="input-field text-xs"
                  placeholder="e.g. In Module 2, circle the requested variable"
                  value={form.takeaway}
                  onChange={e => setForm({ ...form, takeaway: e.target.value })}
                />
              </div>
            </div>

            {/* Root Cause Detail */}
            <div>
              <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-1">
                Root Cause & What Went Wrong
              </label>
              <textarea
                rows={2}
                className="input-field text-xs"
                placeholder="Why did you pick your selected answer? What cognitive trap or miscalculation occurred?"
                value={form.rootCause}
                onChange={e => setForm({ ...form, rootCause: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Save to Error Intelligence Log
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: Upload Zone */
          <div className="p-8 space-y-6 flex-1 flex flex-col justify-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-gold/60 bg-surface/40 hover:bg-gold/5 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFilesSelected}
              />
              <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                <Upload className="w-7 h-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-text-primary">
                  Click to select screenshots or drag & drop files
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Supports PNG, JPG, WebP screenshots of Bluebook test questions and full test PDFs
                </p>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gold">
                    {uploadedFiles.length} file(s) selected
                  </span>
                  <button
                    onClick={() => setUploadedFiles([])}
                    className="text-xs text-rose-400 hover:text-rose-300"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {uploadedFiles.map((f, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded bg-card border border-border text-xs text-text-secondary flex items-center gap-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-gold" />
                      {f.name}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleTriggerUploadAnalysis}
                  disabled={isProcessing}
                  className="btn-primary w-full justify-center py-2 text-xs flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze with Gemini AI Vision & Add to Log
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
