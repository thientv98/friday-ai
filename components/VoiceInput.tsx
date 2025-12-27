import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { IWindow } from '../types';
import { SAMPLE_PROMPTS } from '../constants';

interface VoiceInputProps {
  onTranscriptComplete: (text: string) => void;
  isProcessing: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscriptComplete, isProcessing }) => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualText, setManualText] = useState('');
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
        setInterimText('');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
            onTranscriptComplete(transcript);
          } else {
            setInterimText(event.results[i][0].transcript);
          }
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
           setErrorMsg("Vui lòng cấp quyền micro.");
        } else if (event.error !== 'no-speech') {
           setErrorMsg("Lỗi nhận diện. Thử lại nhé.");
        }
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setErrorMsg("Trình duyệt không hỗ trợ.");
      setShowManualInput(true);
    }
  }, [onTranscriptComplete]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if(recognitionRef.current) {
         try {
            recognitionRef.current.start();
         } catch(e) {
            console.error(e);
         }
      } else {
         setShowManualInput(true);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(manualText.trim()) {
          onTranscriptComplete(manualText);
          setManualText('');
      }
  };

  return (
    <div className="flex flex-col items-center justify-between h-full relative p-6 pb-24 font-sans">
      
      {/* 1. Status & Feedback Text */}
      <div className="w-full flex flex-col items-center mt-6 min-h-[140px] z-20">
        {isProcessing ? (
           <div className="flex flex-col items-center animate-fade-in">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="w-16 h-16 glass rounded-full flex items-center justify-center relative z-10">
                    <Icon name="Loader2" className="animate-spin text-emerald-500" size={32} />
                </div>
              </div>
              <span className="text-xl font-bold text-slate-800">Đang phân tích...</span>
              <span className="text-sm text-slate-500 mt-1 font-medium">AI đang bóc tách thông tin</span>
           </div>
        ) : errorMsg ? (
            <div className="bg-red-50/80 backdrop-blur-md text-red-500 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-glass-sm border border-red-100 animate-pop-in">
                <Icon name="X" size={20} />
                <span className="font-semibold text-sm">{errorMsg}</span>
            </div>
        ) : isListening ? (
             <div className="text-center animate-slide-up w-full max-w-md">
                 <div className="text-3xl font-extrabold text-slate-800 leading-snug drop-shadow-sm">
                   "{interimText || "..."}"
                 </div>
                 <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-red-500 font-bold text-xs uppercase tracking-widest">Đang nghe</span>
                 </div>
             </div>
        ) : (
            <div className="text-center space-y-3 animate-fade-in">
                {!showManualInput && (
                    <>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Thu hay Chi?</h2>
                        <p className="text-slate-500 font-medium text-base">Nói tự nhiên, ví dụ: <br/> "Ăn sáng 30k, cà phê 25k"</p>
                    </>
                )}
            </div>
        )}
      </div>

      {/* 2. Main Interaction Area (The Orb) */}
      <div className="flex-1 flex items-center justify-center w-full relative z-10">
          
        {/* Ambient Glows */}
        {!showManualInput && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-[300px] h-[300px] bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-[60px] transition-all duration-700 ${isListening ? 'scale-125 opacity-60' : 'scale-100 opacity-30 animate-float'}`}></div>
                <div className={`w-[250px] h-[250px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[60px] transition-all duration-700 delay-100 ${isListening ? 'scale-110 opacity-60' : 'scale-90 opacity-30 animate-float'} absolute top-10 right-10`}></div>
            </div>
        )}

        {!showManualInput ? (
            <button
                onClick={toggleListening}
                disabled={isProcessing}
                className="relative group transition-transform duration-300 active:scale-90"
            >
                {/* Ripple Effect Layers */}
                {isListening && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-emerald-400/30 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                        <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite_0.4s]"></span>
                    </>
                )}

                {/* Main Orb */}
                <div className={`
                    w-28 h-28 rounded-full flex items-center justify-center shadow-glow-xl relative z-10 backdrop-blur-sm border-2
                    transition-all duration-500 ease-out
                    ${isListening 
                        ? 'bg-gradient-to-br from-red-500 to-rose-600 border-red-400/50 scale-110' 
                        : 'bg-gradient-to-br from-emerald-400 to-teal-600 border-white/30 hover:scale-105 animate-breathing'}
                `}>
                    {/* Inner Shine */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none"></div>
                    
                    <Icon 
                        name={isListening ? "Mic" : "Mic"} 
                        size={48} 
                        className="text-white drop-shadow-md" 
                    />
                </div>
            </button>
        ) : (
            <form onSubmit={handleManualSubmit} className="w-full max-w-sm z-20 animate-pop-in">
                <div className="glass-card p-6 rounded-[32px]">
                    <div className="flex justify-between items-center mb-4 pl-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhập thủ công</label>
                        <button type="button" onClick={() => setShowManualInput(false)} className="bg-slate-100/50 p-2 rounded-full hover:bg-slate-100 transition-colors">
                            <Icon name="X" size={18} className="text-slate-500" />
                        </button>
                    </div>
                    <textarea 
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        placeholder="VD: Lương 15 triệu, đi chợ 200k..."
                        autoFocus
                        className="w-full h-36 p-4 rounded-2xl glass-input text-slate-800 text-xl font-medium placeholder:text-slate-400/70 resize-none outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all leading-relaxed"
                    />
                    <div className="mt-5 flex justify-end">
                        <button 
                            type="submit"
                            disabled={!manualText.trim() || isProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                        >
                            <span>Phân tích</span>
                            <Icon name="ArrowLeft" className="rotate-180" size={20} />
                        </button>
                    </div>
                </div>
            </form>
        )}
      </div>

      {/* 3. Footer Suggestions */}
      {!isListening && !isProcessing && !showManualInput && (
          <div className="w-full max-w-sm flex flex-col items-center gap-5 z-10 animate-slide-up-slow">
             <div className="flex flex-wrap justify-center gap-2.5">
                 {SAMPLE_PROMPTS.slice(0, 3).map((prompt, idx) => (
                     <button 
                        key={idx} 
                        onClick={() => {
                            setManualText(prompt);
                            setShowManualInput(true);
                        }}
                        className="glass bg-white/40 border-white/60 hover:bg-white/70 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 shadow-sm transition-all active:scale-95"
                     >
                         {prompt}
                     </button>
                 ))}
             </div>
             
             <button 
                onClick={() => setShowManualInput(true)} 
                className="flex items-center gap-2 text-slate-500 text-sm font-semibold hover:text-emerald-600 transition-colors bg-white/30 px-5 py-2 rounded-full backdrop-blur-sm border border-white/20"
             >
                <Icon name="Edit" size={14} />
                Nhập bằng bàn phím
             </button>
          </div>
      )}
    </div>
  );
};

export default VoiceInput;