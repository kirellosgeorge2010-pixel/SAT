import { useState, useEffect } from 'react';
import { X, Key, CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { getEffectiveApiKey, setStoredApiKey, testGeminiApiKey } from '../utils/geminiIntelligence';

export function ApiKeyModal({ isOpen, onClose, onKeyUpdated }) {
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, msg: string }

  useEffect(() => {
    if (isOpen) {
      const current = getEffectiveApiKey();
      setApiKeyInput(current || '');
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, msg: 'Please enter an API key to test.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      await testGeminiApiKey(apiKeyInput.trim());
      setTestResult({ success: true, msg: 'API Key is valid and active with Gemini 2.5!' });
    } catch (err) {
      setTestResult({ success: false, msg: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    setStoredApiKey(apiKeyInput.trim());
    onKeyUpdated?.();
    onClose();
  };

  const handleResetDefault = () => {
    localStorage.removeItem('sat_gemini_api_key');
    const def = getEffectiveApiKey();
    setApiKeyInput(def);
    setTestResult({ success: true, msg: 'Reset to default project API key.' });
    onKeyUpdated?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up bg-card border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Gemini AI Key Settings</h3>
              <p className="text-xs text-text-muted">Configure key for GitHub Pages deployment</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-text-muted hover:text-text-primary">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="input-field text-xs font-mono py-2"
            />
            <p className="text-[11px] text-text-dim">
              Stored securely in your browser's localStorage. Never sent to third parties.
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="break-all">{testResult.msg}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-1">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light inline-flex items-center gap-1 font-medium"
            >
              Get Free Gemini Key <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={handleResetDefault}
              className="text-text-muted hover:text-text-primary flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Default
            </button>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={handleTestKey}
              disabled={isTesting}
              className="btn-secondary text-xs flex-1 justify-center py-2"
            >
              {isTesting ? 'Verifying…' : 'Test API Key'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="btn-primary text-xs flex-1 justify-center py-2"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
