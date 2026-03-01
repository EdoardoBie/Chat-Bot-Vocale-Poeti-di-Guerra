import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Feather, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateTextResponse } from '../services/gemini';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

  const handleSend = async () => {
    if (!inputText.trim() || isProcessing || isSendingRef.current) return;

    isSendingRef.current = true;
    const userMessage = inputText;
    const userMsgId = generateId();

    setInputText('');
    setIsProcessing(true);

    setMessages(prev => [...prev, { id: userMsgId, role: 'user', text: userMessage }]);

    try {
      const botText = await generateTextResponse(userMessage);
      const botMsgId = generateId();

      // Turn off processing BEFORE adding the message to ensure clean transition
      setIsProcessing(false);

      // Small delay to allow state to settle if needed, but usually not necessary with React batching
      // However, to strictly enforce "loading gone -> message appears", we update state.
      setMessages(prev => [...prev, { id: botMsgId, role: 'bot', text: botText }]);
    } catch (error) {
      console.error("Error in chat flow:", error);
      const errorMsgId = generateId();
      setIsProcessing(false);
      setMessages(prev => [...prev, { id: errorMsgId, role: 'bot', text: "The archives are silent. Please try again later." }]);
    } finally {
      setIsProcessing(false); // Double safety
      isSendingRef.current = false;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden relative selection:bg-slate-700 selection:text-white">

      {/* Background Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 pointer-events-none"></div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-6 z-20 bg-gradient-to-b from-slate-950 to-transparent">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <Feather size={20} className="text-slate-400" />
            <h1 className="text-sm font-mono uppercase tracking-[0.2em] text-slate-400">The Literary Archive</h1>
          </div>
          <div className="text-xs font-mono text-slate-600 uppercase tracking-widest hidden md:block">
            Chen Jingrong & Anna Akhmatova
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto pt-24 pb-32 px-6 md:px-12 scroll-smooth scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <div className="max-w-3xl mx-auto space-y-12">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="h-[60vh] flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="w-24 h-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl shadow-black/50">
                <Sparkles size={32} className="text-slate-500 opacity-50" />
              </div>
              <div className="space-y-4 max-w-lg">
                <h2 className="font-serif text-3xl md:text-5xl text-slate-200 leading-tight">
                  Voices from the <span className="italic text-slate-500">Silence</span>
                </h2>
                <p className="font-mono text-xs text-slate-500 uppercase tracking-widest leading-relaxed">
                  Ask about the lives, poetry, and times of Chen Jingrong and Anna Akhmatova.
                </p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-lg w-full flex flex-col items-end group">
                    <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest mb-2 opacity-0 group-hover:opacity-100 transition-opacity">You asked</span>
                    <div className="text-right font-serif text-lg text-slate-400 italic border-r-2 border-slate-800 pr-6 py-1 leading-relaxed">
                      "{msg.text}"
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-3xl mt-4 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-px flex-1 bg-slate-800/50"></div>
                      <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">Response</span>
                      <div className="h-px flex-1 bg-slate-800/50"></div>
                    </div>
                    <div className="prose prose-invert prose-lg max-w-none font-serif text-slate-200 leading-loose">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-6 text-slate-300 font-light" {...props} />,
                          h1: ({ node, ...props }) => <h1 className="text-2xl font-medium text-white mt-8 mb-4 tracking-tight" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-xl font-medium text-white mt-8 mb-4 tracking-tight" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-lg font-medium text-slate-200 mt-6 mb-3" {...props} />,
                          blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-slate-600 pl-6 my-8 italic text-slate-400 font-light text-xl" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-slate-300" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-slate-300" {...props} />,
                          li: ({ node, ...props }) => <li className="pl-2" {...props} />,
                          code: ({ node, ...props }) => <code className="bg-slate-900 px-1.5 py-0.5 rounded text-sm font-mono text-slate-400 border border-slate-800" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                          em: ({ node, ...props }) => <em className="italic text-slate-200" {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

            {isProcessing && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-3xl mt-8 flex justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      animate={{ height: [4, 16, 4] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0 }}
                      className="w-0.5 bg-slate-500"
                    />
                    <motion.div
                      animate={{ height: [4, 24, 4] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      className="w-0.5 bg-slate-400"
                    />
                    <motion.div
                      animate={{ height: [4, 16, 4] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                      className="w-0.5 bg-slate-500"
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest animate-pulse">Consulting Archives...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </AnimatePresence>
        </div>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 z-30 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-24 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="relative flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl p-2 pl-6 rounded-full border border-slate-800/50 shadow-2xl shadow-black/50 ring-1 ring-white/5 transition-all focus-within:ring-slate-700 focus-within:bg-slate-900 group">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Inquire about the poets..."
              className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-600 font-sans text-base tracking-wide"
              disabled={isProcessing}
              autoFocus
            />

            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isProcessing}
              className="p-3 rounded-full bg-slate-100 text-slate-950 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-slate-100/20 active:scale-95 flex-shrink-0 group-focus-within:scale-105"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </div>
          <div className="text-center mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <p className="font-mono text-[10px] text-slate-700 uppercase tracking-[0.2em]">Biestro Edoardo, Dourka Rayan, Forlani Giorgio, Khabir Anouar, Jendoubi Francesco</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
