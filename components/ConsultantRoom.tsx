
import React, { useState, useRef, useEffect } from 'react';
import { MbtiResultData } from '../types';
import { GoogleGenAI } from "@google/genai";

interface ConsultantRoomProps {
  resultData: MbtiResultData;
  onClose: () => void;
}

const ConsultantRoom: React.FC<ConsultantRoomProps> = ({ resultData, onClose }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAiConsult = async (customPrompt?: string) => {
    const input = customPrompt || chatInput;
    if (!input.trim() || isAiThinking) return;

    const newMessages = [...chatMessages, { role: 'user' as const, text: input }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsAiThinking(true);

    try {
      // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `
        你是一位來自「Kiwimu Lab」的頂尖人格分析師與人生導師。這裡是一處深夜運作的地下實驗室。
        當前諮詢的使用者 MBTI 類型是：${resultData.id} (${resultData.title})。
        性格特質：${resultData.summary}。
        核心本質：${resultData.coreAnalysis}。
        職涯風格：${resultData.career.style}。
        
        你的任務：
        1. 語氣：極度冷靜、具備哲學高度，且擁有一種能看穿靈魂的透徹感。
        2. 內容：不提供膚淺的安慰，而是針對使用者的迷惘，提供具有「心理學依據」或「戰略價值」的深刻洞見。
        3. 格式：回覆控制在 200 字以內，善用換行與詩意的比喻。
        4. 角色設定：你對使用者的認知功能運作瞭如指掌，你的回答應該像是一份針對靈魂的解密報告。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.9,
        },
      });

      // The text property returns the generated string output directly.
      const aiText = response.text || "訊號中斷，連結已重置。";
      setChatMessages([...newMessages, { role: 'ai' as const, text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatMessages([...newMessages, { role: 'ai' as const, text: "系統過載，請稍候重啟連線。" }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col fade-in font-sans">
      
      {/* Matrix Overlay Effect */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none overflow-hidden z-0">
         <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:100%_4px] animate-pulse"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-12 py-8 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-display font-bold tracking-[0.2em] uppercase">
                Consultant Room <span className="text-gray-600">01</span>
            </h2>
            <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Connection Stable</span>
                </div>
                <div className="h-3 w-[1px] bg-white/10"></div>
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Subject: {resultData.id}</span>
            </div>
        </div>
        <button 
          onClick={onClose}
          className="group flex items-center gap-4 px-6 py-2 border border-white/20 hover:border-white transition-all rounded-full"
        >
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Return to Lab</span>
          <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>

      {/* Main Conversation Area */}
      <div className="flex-1 relative z-10 overflow-y-auto px-6 md:px-12 py-12 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Introductory Prompt */}
            {chatMessages.length === 0 && (
                <div className="text-center py-20 space-y-8 fade-in">
                    <div className="w-20 h-20 mx-auto border border-white/20 rounded-full flex items-center justify-center relative group">
                        <div className="absolute inset-0 border border-white/40 rounded-full animate-ping opacity-20"></div>
                        <img 
                            src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ2NwNHJxaTByM2sxbXc5OXRtc3hnYWk3djZ1NGlscTJhaWp4eTN5byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LTRNEJfeVV17OTUEGF/giphy.gif" 
                            className="w-12 h-12 object-cover grayscale brightness-150"
                            alt="Lab Logo"
                        />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-3xl font-display font-bold tracking-widest italic text-white/90">
                           「歡迎來到深夜實驗室。」
                        </h3>
                        <p className="text-gray-500 font-serif text-lg leading-loose max-w-lg mx-auto">
                            我是你的深度人格分析師。在這裡，我們不談標籤，只談真實。你想探究你性格中哪一個幽暗或閃耀的角落？
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                        {[
                            `解讀我的${resultData.id}核心內耗`, 
                            `我該如何優化我的「${resultData.keywords[0]}」天賦？`, 
                            `與我靈魂最契合的關係模式？`
                        ].map((q, i) => (
                            <button 
                                key={i}
                                onClick={() => handleAiConsult(q)}
                                className="px-6 py-3 border border-white/10 text-[11px] font-mono tracking-widest uppercase hover:bg-white hover:text-black transition-all text-gray-400"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Chat Bubbles */}
            <div className="space-y-12">
                {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                        <div className={`max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            <div className="mb-2">
                                <span className="text-[9px] font-mono tracking-[0.3em] text-gray-500 uppercase">
                                    {msg.role === 'user' ? 'Subject Terminal' : 'Lab Analyst v3.1'}
                                </span>
                            </div>
                            <div className={`p-6 md:p-8 rounded-sm ${
                                msg.role === 'user' 
                                ? 'bg-white/5 border border-white/20 text-gray-200' 
                                : 'bg-gray-900 border-l-4 border-white text-white shadow-2xl'
                            }`}>
                                <p className="font-serif text-lg leading-relaxed whitespace-pre-wrap">
                                    {msg.text}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                {isAiThinking && (
                    <div className="flex justify-start animate-pulse">
                        <div className="bg-gray-900/50 p-6 border-l-4 border-gray-700">
                            <p className="font-mono text-sm text-gray-600 tracking-widest uppercase">Processing Neural Patterns... 認知模型建立中</p>
                        </div>
                    </div>
                )}
            </div>
            
            <div ref={chatEndRef} className="h-24"></div>
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-20 border-t border-white/10 bg-black p-6 md:px-12 md:py-10">
        <div className="max-w-3xl mx-auto flex gap-4">
            <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAiConsult()}
                placeholder="在此輸入你的靈魂叩問..."
                className="flex-1 bg-white/5 border border-white/10 p-5 font-mono text-sm focus:outline-none focus:border-white/40 transition-all text-white"
                disabled={isAiThinking}
            />
            <button
                onClick={() => handleAiConsult()}
                disabled={isAiThinking || !chatInput.trim()}
                className="px-10 py-5 bg-white text-black font-bold text-xs tracking-[0.3em] uppercase hover:bg-gray-200 disabled:opacity-20 transition-all flex items-center gap-3"
            >
                Send
                <span className="text-lg">↵</span>
            </button>
        </div>
        <p className="max-w-3xl mx-auto mt-4 text-[9px] font-mono text-gray-600 tracking-[0.3em] uppercase text-center">
            Your data is strictly processed for introspection purpose in Kiwimu Lab.
        </p>
      </div>
      
      {/* Visual Accents */}
      <div className="absolute bottom-4 left-4 text-[9px] font-mono text-white/10 tracking-[1em] rotate-90 origin-left pointer-events-none select-none">
        DEEP SOUL ANALYSIS PHASE 02
      </div>
    </div>
  );
};

export default ConsultantRoom;
