import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, Loader2, Zap, MessageSquare, User, RefreshCw, ChevronDown, Github, Ghost } from 'lucide-react';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'bot', content: string }>>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = chatContainerRef.current;
      const isScrolledToBottom = scrollHeight - scrollTop - clientHeight <= 100;
      
      if (isScrolledToBottom || isLoading) {
        scrollToBottom();
      }
      
      setShowScrollButton(!isScrolledToBottom && scrollHeight > clientHeight);
    }
  }, [chatHistory, isLoading]);

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollHeight, scrollTop, clientHeight } = chatContainerRef.current;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
      }
    };

    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  async function getResponse() {
    if (!question.trim()) return;
    
    setIsLoading(true);
    // Add user message to chat history
    setChatHistory(prev => [...prev, { type: 'user', content: question }]);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const response = await axios({
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        method: 'POST',
        data: {
          contents: [
            {
              parts: [{ text: question }]
            }
          ]
        }
      });
      
      const botResponse = response.data.candidates[0].content.parts[0].text;
      setAnswer(botResponse);
      
      // Add bot response to chat history
      setChatHistory(prev => [...prev, { type: 'bot', content: botResponse }]);
    } catch (error) {
      console.error('Error fetching response:', error);
      setChatHistory(prev => [...prev, { type: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
      setQuestion(''); // Clear input after sending
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      getResponse();
    }
  };

  // Function to format text with markdown-like styling
  const formatText = (text: string) => {
    // Replace code blocks
    let formattedText = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-zinc-900 p-4 rounded-md my-3 overflow-x-auto text-sm font-mono border border-yellow-900/30">$1</pre>');
    
    // Replace inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono border border-yellow-900/30">$1</code>');
    
    // Replace bold text
    formattedText = formattedText.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-yellow-300">$1</strong>');
    
    // Replace italic text
    formattedText = formattedText.replace(/\*([^*]+)\*/g, '<em class="italic text-yellow-100/90">$1</em>');
    
    // Replace headers
    formattedText = formattedText.replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mt-4 mb-2 text-yellow-300">$1</h3>');
    formattedText = formattedText.replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mt-5 mb-3 text-yellow-300">$1</h2>');
    formattedText = formattedText.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-5 mb-3 text-yellow-300">$1</h1>');
    
    // Replace lists
    formattedText = formattedText.replace(/^\s*[\-\*] (.*$)/gm, '<li class="ml-5 list-disc my-1">$1</li>');
    formattedText = formattedText.replace(/^\s*\d+\. (.*$)/gm, '<li class="ml-5 list-decimal my-1">$1</li>');
    
    // Replace paragraphs
    formattedText = formattedText.replace(/\n\n/g, '<br/><br/>');
    
    return formattedText;
  };

  const clearChat = () => {
    setChatHistory([]);
    setAnswer('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100">
      {/* Header */}
      <header className="bg-white py-3 px-4 sm:px-6 shadow-lg border-b border-yellow-700">
        <div className="max-w-5xl mx-auto flex items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-black p-2 rounded-lg">
              <Ghost className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">Doubtbot</h1>
          </div>
          <div className="ml-auto flex items-center">
            <button 
              onClick={() => window.open('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', '_blank')}
              className="mr-3 flex items-center space-x-1 bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-full text-sm font-medium text-black transition-colors"
            >
              <Zap className="h-3.5 w-3.5" />
              <button onClick={() => window.open('https://aistudio.google.com/apikey', '_blank')} >API I Use</button>
            </button>
            <div className="flex items-center space-x-1.5 bg-black/30 px-3 py-1.5 rounded-full">
              <Github className="h-3.5 w-3.5 text-black" />
                <button
                onClick={() => window.open('https://github.com/Omn7', '_blank')}
                className="text-xs font-semibold text-black hover:underline"
                >
                Omn7 GitHub
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto flex flex-col relative">
        {/* Chat Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto py-6 px-4 sm:px-6"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="max-w-3xl mx-auto">
            {chatHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-8 rounded-2xl shadow-xl border border-yellow-500/20 max-w-md">
                  <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Welcome to Doubtbot AI</h3>
                  <p className="text-zinc-400 leading-relaxed mb-6">
                    Ask me anything! I can answer questions, provide information, or assist with various tasks.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-yellow-500/10 hover:border-yellow-500/30 transition-colors">
                      <p className="font-medium text-yellow-300 mb-1">Explain a concept</p>
                      <p className="text-zinc-400 text-xs">Ask about any topic or idea</p>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-yellow-500/10 hover:border-yellow-500/30 transition-colors">
                      <p className="font-medium text-yellow-300 mb-1">Creative writing</p>
                      <p className="text-zinc-400 text-xs">Stories, poems, or scripts</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {chatHistory.map((message, index) => (
                  <div 
                    key={index} 
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div 
                        className={`
                          flex-shrink-0 h-9 w-9 rounded-full flex items-center justify-center
                          ${message.type === 'user' 
                            ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 ml-3' 
                            : 'bg-zinc-800 border border-zinc-700 mr-3'}
                        `}
                      >
                        {message.type === 'user' 
                          ? <User className="h-5 w-5 text-black" /> 
                          : <Bot className="h-5 w-5 text-yellow-400" />}
                      </div>
                      <div 
                        className={`
                          rounded-2xl px-5 py-4 shadow-md
                          ${message.type === 'user' 
                            ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black rounded-tr-none' 
                            : 'bg-zinc-900 text-zinc-100 rounded-tl-none border border-zinc-800'}
                        `}
                      >
                        {message.type === 'user' ? (
                          <p className="whitespace-pre-wrap leading-relaxed font-medium">{message.content}</p>
                        ) : (
                          <div 
                            className="prose prose-invert prose-yellow max-w-none leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: formatText(message.content) }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex">
                      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mr-3">
                        <Bot className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="bg-zinc-900 rounded-2xl rounded-tl-none px-5 py-4 border border-zinc-800">
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div className="h-2 w-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="h-2 w-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="h-2 w-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                          <span className="text-zinc-400 font-medium">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button 
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 bg-yellow-500 text-black p-2 rounded-full shadow-lg hover:bg-yellow-400 transition-colors"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        )}

        {/* Input Area */}
        <div className="p-4 sm:p-6 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            <div className="bg-zinc-900 rounded-xl shadow-xl p-3 flex items-end border border-zinc-800 focus-within:border-yellow-600/50 transition-colors">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className="flex-1 border-0 bg-transparent resize-none focus:ring-0 focus:outline-none max-h-32 min-h-[60px] text-zinc-100 placeholder-zinc-500 text-base py-2 px-2"
              />
              <button
                onClick={getResponse}
                disabled={isLoading || !question.trim()}
                className={`ml-2 p-3 rounded-lg ${
                  isLoading || !question.trim() 
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:from-yellow-500 hover:to-yellow-400 shadow-lg transition-all'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-zinc-500">
             Made by Om Narkhede with ❤️
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;