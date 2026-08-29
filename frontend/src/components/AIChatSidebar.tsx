import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, Send, Settings, Trash2, Cpu, Wrench, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { api } from '../api/client';
import { SkillResultCard } from './SkillResultCard';

export type ProviderType = 'gemini' | 'ollama_local' | 'ollama_remote';

interface ToolCall {
  id: string;
  type: string;
  function: {
    name: string;
    arguments: string;
  };
}

interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  toolName?: string;
  toolResult?: any;
  status?: 'executing' | 'completed' | 'failed';
  timestamp: string;
}

const DEFAULT_GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const FALLBACK_GEMINI_MODELS = [
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-3-flash'
];

const FALLBACK_OLLAMA_MODELS = [
  'llama3.2',
  'qwen2.5',
  'llama3.1',
  'mistral',
  'deepseek-r1'
];

const SYSTEM_PROMPT = `You are Sentinel AI, an expert cybersecurity assistant integrated with the Adaptive Vulnerability Prioritization Engine.
You have access to real-time backend security tools to query vulnerabilities, update vulnerability priority/severity ratings (CRITICAL, HIGH, MEDIUM, LOW) or PSSS priority scores, update lifecycle status, recalibrate PSSS scoring formula weights, check pipeline health, retrieve threat actor intelligence, view audit logs, and predict CVSS metrics from raw text.
Always use your available tools when asked for real-time security data or actions.
When presenting multiple items or CVE prioritization lists, ALWAYS format your final response using GitHub-Flavored Markdown tables (e.g. | Rank | CVE ID | Title | PSSS Score | Severity | Status |). Present your findings clearly using Markdown lists, bold highlights, and structured headers.`;

// Helper inline markdown formatter for bold and code
const renderInlineFormatting = (text: string): React.ReactNode[] => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  while (remaining.length > 0) {
    // Check for bold **text**
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    // Check for inline code `code`
    const codeMatch = remaining.match(/`(.*?)`/);

    let firstMatchIndex = -1;
    let matchType: 'bold' | 'code' | null = null;
    let matchedText = '';
    let innerContent = '';

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatchIndex = boldMatch.index;
      matchType = 'bold';
      matchedText = boldMatch[0];
      innerContent = boldMatch[1];
    }

    if (codeMatch && codeMatch.index !== undefined) {
      if (firstMatchIndex === -1 || codeMatch.index < firstMatchIndex) {
        firstMatchIndex = codeMatch.index;
        matchType = 'code';
        matchedText = codeMatch[0];
        innerContent = codeMatch[1];
      }
    }

    if (firstMatchIndex === -1 || !matchType) {
      parts.push(<span key={`text-${keyIdx++}`}>{remaining}</span>);
      break;
    }

    if (firstMatchIndex > 0) {
      parts.push(<span key={`text-${keyIdx++}`}>{remaining.slice(0, firstMatchIndex)}</span>);
    }

    if (matchType === 'bold') {
      parts.push(
        <strong key={`bold-${keyIdx++}`} className="font-bold text-primary-bright">
          {innerContent}
        </strong>
      );
    } else if (matchType === 'code') {
      parts.push(
        <code key={`code-${keyIdx++}`} className="bg-surface-dim text-cyan-300 px-1 py-0.5 rounded font-mono text-[10px] border border-outline-variant/20">
          {innerContent}
        </code>
      );
    }

    remaining = remaining.slice(firstMatchIndex + matchedText.length);
  }

  return parts;
};

// Helper table cell content renderer with badges
const renderTableCellContent = (cell: string): React.ReactNode => {
  const trimmed = cell.trim();
  const upper = trimmed.toUpperCase();

  if (upper === 'CRITICAL') {
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">CRITICAL</span>;
  }
  if (upper === 'HIGH') {
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/40">HIGH</span>;
  }
  if (upper === 'MEDIUM') {
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">MEDIUM</span>;
  }
  if (upper === 'LOW') {
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">LOW</span>;
  }
  if (upper === 'UNASSIGNED') {
    return <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-500/20 text-slate-300 border border-slate-500/40">UNASSIGNED</span>;
  }
  if (trimmed.startsWith('CVE-')) {
    return <code className="text-cyan-300 font-bold bg-surface-dim px-1.5 py-0.5 rounded border border-cyan-500/30">{trimmed}</code>;
  }

  return renderInlineFormatting(trimmed);
};

// Markdown Renderer Component (Tables, Code Blocks, Headers, Lists)
const FormattedMarkdown: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const blocks: Array<
    | { type: 'paragraph'; text: string }
    | { type: 'header'; text: string; level: number }
    | { type: 'list'; items: string[] }
    | { type: 'code'; text: string }
    | { type: 'table'; headers: string[]; rows: string[][] }
  > = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Check for fenced code block
    if (line.trim().startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', text: codeLines.join('\n') });
      i++;
      continue;
    }

    // Check for Markdown Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (r: string) =>
          r
            .split('|')
            .map(c => c.trim())
            .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

        const rawHeaders = parseRow(tableLines[0]);
        // Filter out separator line (containing dashes)
        const dataRows = tableLines.slice(1).filter(l => !l.replace(/\|/g, '').trim().match(/^[:\-\s]+$/));
        const parsedRows = dataRows.map(r => parseRow(r));

        blocks.push({ type: 'table', headers: rawHeaders, rows: parsedRows });
        continue;
      }
    }

    // Check for Headers (#, ##, ###)
    if (line.trim().startsWith('#')) {
      const match = line.trim().match(/^(#+)\s*(.*)/);
      if (match) {
        blocks.push({ type: 'header', level: match[1].length, text: match[2] });
        i++;
        continue;
      }
    }

    // Check for Lists (- or *)
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        listItems.push(lines[i].trim().replace(/^[-*]\s*/, ''));
        i++;
      }
      blocks.push({ type: 'list', items: listItems });
      continue;
    }

    // Paragraph text
    if (line.trim()) {
      blocks.push({ type: 'paragraph', text: line });
    }
    i++;
  }

  return (
    <div className="space-y-2 text-xs font-mono leading-relaxed text-on-surface/90">
      {blocks.map((block, idx) => {
        if (block.type === 'table') {
          return (
            <div key={idx} className="my-3 overflow-x-auto rounded-lg border border-outline-variant/40 shadow-md bg-surface-dim">
              <table className="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr className="bg-surface-container-high border-b border-outline-variant/40 text-primary-bright font-bold">
                    {block.headers.map((h, hIdx) => (
                      <th key={hIdx} className="px-3 py-2 text-[11px] uppercase tracking-wider whitespace-nowrap border-r last:border-r-0 border-outline-variant/20">
                        {renderInlineFormatting(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {block.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-surface-container/50 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-[11px] whitespace-normal font-mono border-r last:border-r-0 border-outline-variant/15">
                          {renderTableCellContent(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === 'code') {
          return (
            <pre key={idx} className="my-2 p-3 bg-surface-dim rounded-lg border border-outline-variant/30 font-mono text-[11px] text-emerald-300 overflow-x-auto">
              <code>{block.text}</code>
            </pre>
          );
        }

        if (block.type === 'header') {
          return (
            <h4 key={idx} className="text-xs font-mono font-bold text-primary-bright mt-3 mb-1 border-b border-outline-variant/20 pb-1 flex items-center gap-1.5">
              {renderInlineFormatting(block.text)}
            </h4>
          );
        }

        if (block.type === 'list') {
          return (
            <ul key={idx} className="list-disc list-inside space-y-1 my-1 pl-1 text-on-surface-variant">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="text-[11px] font-mono">
                  {renderInlineFormatting(item)}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={idx} className="text-xs font-mono">
            {renderInlineFormatting(block.text)}
          </p>
        );
      })}
    </div>
  );
};

export const AIChatSidebar: React.FC = () => {
  // Provider & Model State
  const [provider, setProvider] = useState<ProviderType>('gemini');
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    const saved = localStorage.getItem('gemini_api_key');
    return (saved && saved.trim()) ? saved.trim() : DEFAULT_GEMINI_KEY;
  });
  const [ngrokUrl, setNgrokUrl] = useState<string>(() => localStorage.getItem('ngrok_host_url') || 'https://cyber-sentinel.ngrok-free.app');
  const [availableModels, setAvailableModels] = useState<string[]>(FALLBACK_GEMINI_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash');
  const [isFetchingModels, setIsFetchingModels] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentToolExecuting, setCurrentToolExecuting] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentToolExecuting]);

  // Persist settings across reloads
  useEffect(() => {
    if (geminiApiKey) {
      localStorage.setItem('gemini_api_key', geminiApiKey);
    }
  }, [geminiApiKey]);

  useEffect(() => {
    if (ngrokUrl) {
      localStorage.setItem('ngrok_host_url', ngrokUrl);
    }
  }, [ngrokUrl]);

  // Fetch models dynamically depending on provider
  const fetchModelsForProvider = useCallback(async () => {
    setIsFetchingModels(true);
    const activeKey = geminiApiKey.trim() || DEFAULT_GEMINI_KEY;

    if (provider === 'gemini') {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${activeKey}`);
        if (res.ok) {
          const data = await res.json();
          const validModels: string[] = (data.models || [])
            .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
            .map((m: any) => m.name.replace(/^models\//, ''));
          
          if (validModels.length > 0) {
            setAvailableModels(validModels);
            if (!validModels.includes(selectedModel)) {
              setSelectedModel(validModels[0]);
            }
          } else {
            setAvailableModels(FALLBACK_GEMINI_MODELS);
          }
        } else {
          setAvailableModels(FALLBACK_GEMINI_MODELS);
        }
      } catch (e) {
        console.warn('Failed to fetch Gemini models dynamically, using fallback', e);
        setAvailableModels(FALLBACK_GEMINI_MODELS);
      }
    } else {
      // Ollama Local or Ollama Remote
      let baseUrl = provider === 'ollama_local' ? 'http://localhost:11434' : ngrokUrl.replace(/\/+$/, '');
      if (baseUrl.endsWith('/v1')) {
        baseUrl = baseUrl.substring(0, baseUrl.length - 3);
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (provider === 'ollama_remote') {
        headers['ngrok-skip-browser-warning'] = 'true';
      }

      try {
        const res = await fetch(`${baseUrl}/v1/models`, { method: 'GET', headers });
        if (res.ok) {
          const data = await res.json();
          const models: string[] = (data.data || []).map((m: any) => m.id);
          if (models.length > 0) {
            setAvailableModels(models);
            if (!models.includes(selectedModel)) {
              setSelectedModel(models[0]);
            }
          } else {
            setAvailableModels(FALLBACK_OLLAMA_MODELS);
            if (!FALLBACK_OLLAMA_MODELS.includes(selectedModel)) {
              setSelectedModel(FALLBACK_OLLAMA_MODELS[0]);
            }
          }
        } else {
          setAvailableModels(FALLBACK_OLLAMA_MODELS);
          if (!FALLBACK_OLLAMA_MODELS.includes(selectedModel)) {
            setSelectedModel(FALLBACK_OLLAMA_MODELS[0]);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch Ollama models dynamically, using fallback', e);
        setAvailableModels(FALLBACK_OLLAMA_MODELS);
        if (!FALLBACK_OLLAMA_MODELS.includes(selectedModel)) {
          setSelectedModel(FALLBACK_OLLAMA_MODELS[0]);
        }
      }
    }
    setIsFetchingModels(false);
  }, [provider, geminiApiKey, ngrokUrl, selectedModel]);

  useEffect(() => {
    fetchModelsForProvider();
  }, [fetchModelsForProvider]);

  // Construct standard completion endpoint and headers
  const getProviderConfig = (): { url: string; headers: Record<string, string> } => {
    if (provider === 'gemini') {
      const activeKey = geminiApiKey.trim() || DEFAULT_GEMINI_KEY;
      return {
        url: 'https://generativelanguage.googleapis.com/v1beta/openai/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeKey}`
        }
      };
    } else if (provider === 'ollama_local') {
      return {
        url: 'http://localhost:11434/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json'
        }
      };
    } else {
      let cleanNgrok = ngrokUrl.trim().replace(/\/+$/, '');
      if (!cleanNgrok.endsWith('/v1')) {
        cleanNgrok += '/v1';
      }
      return {
        url: `${cleanNgrok}/chat/completions`,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      };
    }
  };

  // Agentic Function Calling Loop
  const handleSendMessage = async () => {
    if (!inputQuery.trim() || isProcessing) return;

    const userMessageText = inputQuery.trim();
    setInputQuery('');

    const newUserMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, newUserMsg];
    setMessages(updatedHistory);
    setIsProcessing(true);

    try {
      // 1. Fetch available backend tools
      const toolDeclarations = await api.getAgentTools();

      // Format messages payload for OpenAI compatibility
      let conversationPayload: any[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...updatedHistory.map(m => {
          if (m.role === 'user') return { role: 'user', content: m.content };
          if (m.role === 'assistant') {
            const msgObj: any = { role: 'assistant' };
            if (m.content) msgObj.content = m.content;
            if (m.tool_calls) msgObj.tool_calls = m.tool_calls;
            return msgObj;
          }
          if (m.role === 'tool') {
            return {
              role: 'tool',
              tool_call_id: m.tool_call_id,
              name: m.toolName || 'tool_function',
              content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content)
            };
          }
          return { role: m.role, content: m.content };
        })
      ];

      const config = getProviderConfig();
      let loopCount = 0;
      const MAX_LOOPS = 5;
      let finalContent = '';

      while (loopCount < MAX_LOOPS) {
        loopCount++;

        const requestBody: any = {
          model: selectedModel,
          messages: conversationPayload,
          temperature: 0.2
        };

        if (toolDeclarations && toolDeclarations.length > 0) {
          requestBody.tools = toolDeclarations;
        }

        const res = await fetch(config.url, {
          method: 'POST',
          headers: config.headers,
          body: JSON.stringify(requestBody)
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`LLM endpoint returned status ${res.status}: ${errText.slice(0, 200)}`);
        }

        const data = await res.json();
        const choice = data.choices?.[0];
        if (!choice) {
          throw new Error('No choice returned from LLM provider.');
        }

        const assistantMsg = choice.message;

        // Check if tool_calls were returned
        if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
          // Push assistant tool_call message to React state so subsequent turns maintain valid history sequence
          const assistantToolStateMsg: ChatMessage = {
            id: `assistant-tool-${Date.now()}-${Math.random()}`,
            role: 'assistant',
            content: assistantMsg.content || undefined,
            tool_calls: assistantMsg.tool_calls,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, assistantToolStateMsg]);

          // Push assistant tool_call message to payload
          conversationPayload.push(assistantMsg);

          for (const call of assistantMsg.tool_calls) {
            const toolName = call.function.name;
            let args = {};
            try {
              args = JSON.parse(call.function.arguments || '{}');
            } catch {
              console.warn('Failed to parse tool call arguments:', call.function.arguments);
            }

            setCurrentToolExecuting(toolName);

            // Add UI visual indicator badge
            const toolExecutingMsg: ChatMessage = {
              id: `tool-exec-${Date.now()}-${Math.random()}`,
              role: 'tool',
              tool_call_id: call.id,
              toolName: toolName,
              content: `Executing backend tool '${toolName}'...`,
              status: 'executing',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, toolExecutingMsg]);

            // Execute backend tool via API
            const toolResult = await api.executeAgentTool(toolName, args);

            // Update UI message status
            setMessages(prev => prev.map(m => m.id === toolExecutingMsg.id ? {
              ...m,
              status: toolResult.error ? 'failed' : 'completed',
              content: JSON.stringify(toolResult, null, 2),
              toolResult
            } : m));

            // Push tool output to conversation payload with mandatory function name included
            conversationPayload.push({
              role: 'tool',
              tool_call_id: call.id,
              name: toolName,
              content: JSON.stringify(toolResult)
            });
          }
          setCurrentToolExecuting(null);
          // Loop again to give model tool outputs
          continue;
        }

        // If no tool_calls, we got the final natural language response
        finalContent = assistantMsg.content || '';
        const finalAssistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: finalContent,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, finalAssistantMsg]);
        break;
      }

    } catch (err: any) {
      console.error('Error during agent execution loop:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Agent Error**: ${err.message || 'Failed to complete agent execution cycle.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
      setCurrentToolExecuting(null);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest border-r border-outline-variant/30 rounded-xl overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="p-4 bg-surface-container/80 border-b border-outline-variant/30 backdrop-blur-md flex flex-col gap-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center text-primary-bright shadow-glow-cyan">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-on-surface flex items-center gap-2">
                Sentinel AI
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  AGENT LOOPS ACTIVE
                </span>
              </h2>
              <p className="text-[10px] font-mono text-on-surface-variant/70">
                Multi-Provider Function Calling Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg border transition-all ${
                showSettings 
                  ? 'bg-primary/20 text-primary-bright border-primary/50' 
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface border-outline-variant/30'
              }`}
              title="Provider & API Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={clearChat}
              className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:text-error border border-outline-variant/30 transition-all"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Provider & Model Selectors */}
        <div className="grid grid-cols-2 gap-2">
          {/* Provider Select */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-on-surface-variant/70">LLM Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as ProviderType)}
              className="w-full bg-surface-dim text-xs font-mono text-on-surface px-2.5 py-1.5 rounded border border-outline-variant/40 focus:border-primary focus:outline-none"
            >
              <option value="gemini">Google Gemini API</option>
              <option value="ollama_local">Local Ollama</option>
              <option value="ollama_remote">Remote Ollama (Ngrok)</option>
            </select>
          </div>

          {/* Model Select */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-on-surface-variant/70 flex items-center justify-between">
              <span>Model</span>
              {isFetchingModels && <RefreshCw className="w-2.5 h-2.5 animate-spin text-primary-bright" />}
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-surface-dim text-xs font-mono text-on-surface px-2.5 py-1.5 rounded border border-outline-variant/40 focus:border-primary focus:outline-none truncate"
              >
                {availableModels.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Settings Drawer / Panel */}
        {showSettings && (
          <div className="mt-1 p-3 bg-surface-dim rounded-lg border border-primary/30 space-y-3 font-mono text-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-1.5">
              <span className="font-bold text-primary-bright flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Provider Credentials & Endpoints
              </span>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <label className="block text-[10px] text-on-surface-variant mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full bg-surface-container text-on-surface px-2.5 py-1.5 rounded border border-outline-variant/40 focus:border-primary focus:outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] text-on-surface-variant mb-1">
                Ngrok Base Host URL (Remote Ollama)
              </label>
              <input
                type="text"
                placeholder="https://<subdomain>.ngrok-free.app"
                value={ngrokUrl}
                onChange={(e) => setNgrokUrl(e.target.value)}
                className="w-full bg-surface-container text-on-surface px-2.5 py-1.5 rounded border border-outline-variant/40 focus:border-primary focus:outline-none text-xs"
              />
              <p className="text-[9px] text-on-surface-variant/60 mt-1">
                Note: Requests to Ngrok hosts automatically include <code className="text-primary-bright">ngrok-skip-browser-warning: true</code> header.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  fetchModelsForProvider();
                  setShowSettings(false);
                }}
                className="px-3 py-1 bg-primary text-surface font-bold text-[11px] rounded hover:bg-primary-bright transition-all"
              >
                Save & Refresh Models
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-on-surface-variant/60 space-y-3 select-none">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/30">
              <Bot className="w-6 h-6 text-primary-bright" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold text-on-surface">Sentinel Agent Assistant Ready</h3>
              <p className="text-xs font-mono mt-1 max-w-xs text-on-surface-variant/70">
                Ask about vulnerabilities, recalibrate PSSS weights, inspect threat actors, or run ML vector predictions.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap gap-2 justify-center max-w-md">
              <button
                onClick={() => setInputQuery("Use your 'get_random_nvd_cves' tool to fetch 20 random CVEs from the NVD dataset, parse their metrics, calculate their PSSS priority scores, and rank them from highest to lowest risk in a prioritized response table.")}
                className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-primary/20 hover:bg-primary/30 active:bg-primary/40 border border-primary/50 text-primary-bright font-bold transition-all shadow-glow-cyan flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface"
              >
                ⚡ "Load & Prioritize 20 NVD CVEs"
              </button>
              <button
                onClick={() => setInputQuery("What critical vulnerabilities are currently unassigned?")}
                className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-surface-container hover:bg-primary/20 active:bg-primary/30 border border-outline-variant/40 hover:border-primary/50 text-on-surface-variant hover:text-primary-bright font-medium transition-all hover:shadow-glow-cyan cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface"
              >
                "List unassigned critical CVEs"
              </button>
              <button
                onClick={() => setInputQuery("Show intelligence details for threat actor Cozy Bear APT29.")}
                className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-surface-container hover:bg-primary/20 active:bg-primary/30 border border-outline-variant/40 hover:border-primary/50 text-on-surface-variant hover:text-primary-bright font-medium transition-all hover:shadow-glow-cyan cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface"
              >
                "Check Cozy Bear threat actor details"
              </button>
              <button
                onClick={() => setInputQuery("Recalibrate scoring weights: CVSS 0.40, EPSS 0.40, Asset 0.20, Threat Actor Multiplier 1.3")}
                className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-surface-container hover:bg-primary/20 active:bg-primary/30 border border-outline-variant/40 hover:border-primary/50 text-on-surface-variant hover:text-primary-bright font-medium transition-all hover:shadow-glow-cyan cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 focus:ring-offset-surface"
              >
                "Recalibrate PSSS weights"
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[85%] bg-primary/15 border border-primary/30 text-on-surface p-3 rounded-2xl rounded-tr-none text-xs font-mono shadow-sm space-y-1">
                    <div>{msg.content}</div>
                    <div className="text-[9px] text-primary-bright/70 text-right">{msg.timestamp}</div>
                  </div>
                </div>
              );
            }

            if (msg.role === 'tool') {
              return (
                <div key={msg.id} className="flex justify-start">
                  <div className="max-w-[90%] w-full bg-surface-container/60 border border-outline-variant/30 p-2.5 rounded-lg text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-primary-bright font-semibold text-[11px]">
                        <Wrench className="w-3.5 h-3.5" />
                        Executing Tool: <code className="bg-surface-dim px-1.5 py-0.5 rounded text-emerald-300">{msg.toolName}</code>
                      </span>
                      <span className="flex items-center gap-1 text-[10px]">
                        {msg.status === 'executing' && (
                          <span className="text-amber-400 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Running...
                          </span>
                        )}
                        {msg.status === 'completed' && (
                          <span className="text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Executed
                          </span>
                        )}
                        {msg.status === 'failed' && (
                          <span className="text-error flex items-center gap-1 font-bold">
                            <AlertCircle className="w-3 h-3" /> Failed
                          </span>
                        )}
                      </span>
                    </div>

                    {msg.status === 'completed' && msg.toolResult && (
                      <div className="mt-2">
                        <SkillResultCard toolName={msg.toolName || ''} result={msg.toolResult} />
                        <details className="mt-1">
                          <summary className="text-[10px] text-on-surface-variant cursor-pointer hover:text-on-surface select-none">
                            View Raw JSON Payload
                          </summary>
                          <pre className="mt-1 p-2 bg-surface-dim rounded text-[10px] text-emerald-300/90 overflow-x-auto max-h-40 border border-outline-variant/20">
                            {JSON.stringify(msg.toolResult, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            // Assistant message rendered with FormattedMarkdown
            return (
              <div key={msg.id} className="flex justify-start">
                <div className="max-w-[95%] bg-surface-container border border-outline-variant/40 text-on-surface p-3.5 rounded-2xl rounded-tl-none text-xs font-mono shadow-md space-y-2 overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] text-on-surface-variant/60 border-b border-outline-variant/20 pb-1">
                    <span className="flex items-center gap-1 text-primary-bright font-semibold">
                      <Bot className="w-3.5 h-3.5" /> Sentinel AI
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <FormattedMarkdown content={msg.content || ''} />
                </div>
              </div>
            );
          })
        )}

        {isProcessing && !currentToolExecuting && (
          <div className="flex justify-start">
            <div className="bg-surface-container border border-outline-variant/30 text-on-surface-variant p-3 rounded-xl text-xs font-mono flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary-bright" />
              <span>Sentinel AI is thinking & reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-surface-container/80 border-t border-outline-variant/30 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask agent or command tools (e.g. 'List critical CVEs')..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isProcessing}
            className="flex-1 bg-surface-dim text-on-surface text-xs font-mono px-3.5 py-2.5 rounded-lg border border-outline-variant/40 focus:border-primary focus:outline-none placeholder:text-on-surface-variant/50 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputQuery.trim() || isProcessing}
            className="px-4 py-2.5 bg-primary text-surface font-mono font-bold text-xs rounded-lg hover:bg-primary-bright disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-glow-cyan shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
