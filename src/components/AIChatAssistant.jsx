import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { askSATTutorChat } from '../utils/geminiIntelligence';
import { computeGlobalMetrics, rankWeaknesses } from '../utils/analyticsEngine';
import clsx from 'clsx';

const SUGGESTED_PROMPTS = [
  'Why do I keep getting these questions wrong?',
  'What is my biggest weakness right now?',
  'Why is my Module 2 performance worse than Module 1?',
  'What should I study today?',
  'Show me my repeated mistakes and how to fix them.',
  'Give me a similar practice question for my weakest topic.',
];

export function AIChatAssistant({ mistakes }) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'model',
      text: `Hello! I'm **Socrates-SAT**, your personal AI performance analyst and coach. I have full access to your mistake database (${mistakes.length} recorded items). Ask me anything about your error patterns, Module 1 vs Module 2 trends, or request a custom drill question!`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Build real contextual summary string of student's mistake log
  const buildContextSummary = () => {
    const metrics = computeGlobalMetrics(mistakes);
    const ranked = rankWeaknesses(mistakes).slice(0, 4);
    const repeated = mistakes.filter(m => m.reviewStatus === 'Repeated Mistake');

    const topWeaknessesStr = ranked
      .map(
        (w, i) =>
          `#${i + 1}: ${w.section} - ${w.topic} (Unresolved: ${w.unresolved}, Pattern: ${w.primaryCognitivePattern})`
      )
      .join('\n');

    const repeatedListStr = repeated
      .map(
        r =>
          `- Q${r.questionNumber} (${r.section}, ${r.topic}): Selected ${r.selectedAnswer} vs Correct ${r.correctAnswer}. Root cause: ${r.rootCause}`
      )
      .join('\n');

    const recentMistakesStr = mistakes
      .slice(-6)
      .map(
        m =>
          `- Q${m.questionNumber} (${m.section}, ${m.module}, ${m.topic}): Student chose ${m.selectedAnswer}, Correct was ${m.correctAnswer}. Error category: ${m.errorCategory}. Takeaway: ${m.takeaway || m.rootCause}`
      )
      .join('\n');

    return `Total Questions Logged: ${metrics.total}
Resolution Accuracy: ${metrics.accuracyPct}%
Math Accuracy: ${metrics.math.accuracyPct}% (${metrics.math.total} Qs)
Reading & Writing Accuracy: ${metrics.rw.accuracyPct}% (${metrics.rw.total} Qs)
Module 1 Accuracy: ${metrics.mod1.accuracyPct}% vs Module 2 Accuracy: ${metrics.mod2.accuracyPct}%
Module 2 Performance Collapse Flag: ${metrics.modDropWarning ? 'YES (Significant Drop Detected)' : 'No'}

TOP RANKED WEAKNESSES:
${topWeaknessesStr || 'None recorded'}

CRITICAL REPEATED MISTAKES:
${repeatedListStr || 'None currently marked as repeated'}

RECENT QUESTIONS SUMMARY:
${recentMistakesStr || 'None'}`;
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    setError(null);
    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const context = buildContextSummary();
      const replyText = await askSATTutorChat(messages, text, context);

      const botMsg = {
        id: 'bot-' + Date.now(),
        sender: 'model',
        text: replyText,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(`Assistant error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card h-[750px] flex flex-col overflow-hidden border-border bg-card animate-slide-up">
      {/* Header */}
      <div className="p-4 border-b border-border bg-surface/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              Socrates-SAT Intelligence Coach
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-text-muted">
              Live context: {mistakes.length} mistakes loaded
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'init-reset',
                sender: 'model',
                text: "Chat refreshed. How can I help analyze your SAT performance today?",
                timestamp: Date.now(),
              },
            ])
          }
          className="p-1.5 rounded-md hover:bg-surface text-text-muted hover:text-text-primary transition-colors text-xs flex items-center gap-1"
          title="Clear chat history"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-b border-border bg-surface/30 overflow-x-auto flex gap-2">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            disabled={isLoading}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full text-[11px] bg-card hover:bg-gold-muted border border-border hover:border-gold/30 text-text-secondary hover:text-gold transition-colors whitespace-nowrap flex-shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={clsx(
              'flex gap-3 max-w-2xl',
              msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            )}
          >
            <div
              className={clsx(
                'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs',
                msg.sender === 'user'
                  ? 'bg-gold text-base font-bold'
                  : 'bg-surface border border-gold/30 text-gold'
              )}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={clsx(
                'p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 whitespace-pre-wrap',
                msg.sender === 'user'
                  ? 'bg-gold text-base font-medium rounded-tr-none'
                  : 'bg-surface border border-border text-text-primary rounded-tl-none'
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-2xl">
            <div className="w-7 h-7 rounded-lg bg-surface border border-gold/30 text-gold flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-surface border border-border text-xs text-text-muted rounded-tl-none flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" />
              Socrates-SAT is analyzing your mistake history...
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-border bg-surface/50 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Socrates-SAT about your errors, weak areas, or ask for a drill question..."
          className="input-field text-xs flex-1 py-2"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="btn-primary text-xs py-2 px-4 disabled:opacity-40"
        >
          <Send className="w-3.5 h-3.5" />
          Send
        </button>
      </form>
    </div>
  );
}
