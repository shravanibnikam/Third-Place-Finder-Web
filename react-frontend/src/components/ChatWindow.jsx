import { useState, useRef, useEffect } from 'react';

const QUESTIONS = [
  {
    id: 'noise',
    text: "INITIATING SPOT_SCOUT V1.0...\nHOW MUCH NOISE CAN YOU TOLERATE?",
    options: ["SILENCE (LIBRARY)", "BACKGROUND CHATTER", "LIVELY/LOUD"]
  },
  {
    id: 'group_size',
    text: "ACKNOWLEDGED. ARE YOU FLYING SOLO OR BRINGING A CREW?",
    options: ["SOLO", "PAIR", "GROUP OF 3-4", "MASSIVE (5+)"]
  },
  {
    id: 'time',
    text: "INPUT TIME OF OPERATION:",
    options: ["MORNING RUSH", "AFTERNOON CHILL", "EVENING BURN", "LATE NIGHT"]
  }
];

export default function ChatWindow({ onResultsReady }) {
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [chatActive, setChatActive] = useState(false);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef(null);

  const addMessage = (text, sender) => setMessages(prev => [...prev, { text, sender }]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const hasStartedRef = useRef(false);
  useEffect(() => { 
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      setTimeout(() => askQuestion(0), 1000); 
    }
  }, []);

  const askQuestion = (index) => {
    if (index >= QUESTIONS.length) {
      finishOnboarding();
      return;
    }
    setIsTyping(true);
    setOptions([]);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(QUESTIONS[index].text, 'ai');
      setOptions(QUESTIONS[index].options);
    }, 800);
  };

  const handleResponse = (text) => {
    setOptions([]);
    addMessage(text, 'user');
    const newStep = step + 1;
    setStep(newStep);
    askQuestion(newStep);
  };

  const finishOnboarding = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("PREFERENCES LOCKED. BOOTING SECURE GEMINI COMMLINK...", 'ai');
      setChatActive(true);
      sendToGemini("HELLO! MY PREFERENCES ARE SET. PLEASE RECOMMEND A SPOT IN SEATTLE!");
    }, 1000);
  };

  const sendToGemini = async (msgText) => {
    setIsTyping(true);
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msgText })
      });
      const data = await response.json();
      setIsTyping(false);
      addMessage(data.response, 'ai');
      
      // Trigger the map overlay for the cinematic illusion!
      if (onResultsReady) onResultsReady();
      
    } catch (e) {
      setIsTyping(false);
      addMessage("404 COMMLINK SEVERED. BACKEND OFFLINE.", 'ai');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const txt = inputText.trim();
    setInputText("");
    addMessage(txt, 'user');
    sendToGemini(txt);
  };

  return (
    <>
      <header className="pixel-window-header bg-retro-panel p-3 border-b-4 border-retro-border flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">👾</span>
          <h1 className="text-[1.2rem] font-title text-retro-accent tracking-widest mt-1">GEMINI TERMINAL</h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0 relative bg-retro-window border-x-4 border-b-4 border-retro-border pixel-shadow overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth pb-32">
          {messages.map((m, i) => (
            <div key={i} className={`flex w-full mb-4 message-bubble ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 max-w-[85%] inline-block ${m.sender === 'ai' ? 'bubble-ai' : 'bubble-user'}`}>
                <p className="text-xl whitespace-pre-line">{m.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex w-full mb-4 justify-start message-bubble">
              <div className="bubble-ai p-3 px-4 inline-block"><span className="animate-pulse text-xl">_</span></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-retro-panel border-t-4 border-retro-border z-10 flex-shrink-0">
          {!chatActive && (
            <div className="flex flex-wrap gap-2 justify-end mb-2">
              {options.map((opt, idx) => (
                <button key={idx} onClick={() => handleResponse(opt)} className="px-3 py-2 bg-retro-btn border-4 border-retro-border font-bold">
                  {opt}
                </button>
              ))}
            </div>
          )}
          <form className="flex items-center gap-2" onSubmit={handleFormSubmit}>
            <span className="text-retro-accent font-title">{'>_'}</span>
            <input 
              type="text" 
              disabled={!chatActive || isTyping} 
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              className="w-full px-3 py-2 bg-retro-border text-retro-accent border-2 border-retro-bg focus:outline-none focus:border-retro-window transition-all text-xl uppercase disabled:opacity-50" 
            />
            <button type="submit" disabled={!chatActive || isTyping || !inputText.trim()} className="p-2 bg-retro-btn text-retro-border border-4 border-retro-border uppercase font-bold px-4">
              SEND
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
