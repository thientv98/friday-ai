import React, { useState, useRef, useEffect } from 'react';
import { Icon } from './Icons';

interface WheelScreenProps {
  onBack: () => void;
}

const COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

const WheelScreen: React.FC<WheelScreenProps> = ({ onBack }) => {
  const [inputText, setInputText] = useState("Phở bò\nCơm tấm\nBún riêu\nHủ tiếu\nBánh mì");
  const [items, setItems] = useState<string[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  
  // Calculate items whenever input changes (but only commit on init or manual edit finish if needed, here simplified)
  useEffect(() => {
    const lines = inputText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    setItems(lines);
  }, [inputText]);

  const spinWheel = () => {
    if (isSpinning || items.length < 2) return;

    setIsSpinning(true);
    setResult(null);

    // Random winner index
    const winnerIndex = Math.floor(Math.random() * items.length);
    
    // Each segment angle
    const segmentAngle = 360 / items.length;
    
    // Spin at least 5 full circles (1800 deg)
    // Adjust to land on the winner. 
    // Note: 0 deg is at 3 o'clock in standard SVG arc math usually, or top depending on rotation.
    // Let's assume wheel starts with item[0] at top-ish.
    // Actually, simple CSS rotation: 
    // If we rotate CLOCKWISE, the pointer (fixed at top) will point to segments counter-clockwise relative to wheel start.
    
    // Let's align: Item 0 starts at -90deg (top).
    // To land on Item i, we need to rotate such that Item i is at -90deg.
    // Current pos of Item i is: i * segmentAngle.
    // Target rotation = 360 * 5 + (360 - (i * segmentAngle)).
    // Adding a random offset within the segment for realism.
    const randomOffset = Math.random() * segmentAngle * 0.8 + (segmentAngle * 0.1); // Keep away from edges
    const targetRotation = 1800 + (360 - (winnerIndex * segmentAngle)) - (segmentAngle/2) + randomOffset;
    
    setRotation(prev => prev + targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResult(items[winnerIndex]);
    }, 4000); // Duration matches CSS transition
  };

  // SVG Helper: Polar to Cartesian
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  return (
    <div className="flex flex-col h-full font-sans relative overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 z-20 flex items-center gap-3 absolute top-0 w-full pointer-events-none">
             <button onClick={onBack} className="p-2 -ml-2 bg-white/50 backdrop-blur-md text-slate-600 rounded-full shadow-sm pointer-events-auto hover:bg-white transition-all active:scale-90">
                <Icon name="ArrowLeft" />
             </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-20 pt-16 items-center px-4">
            
            <h1 className="text-2xl font-black text-slate-800 mb-6 text-center">Hôm nay ăn gì?</h1>

            {/* The Wheel */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 mb-8 shrink-0">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20 text-slate-800 drop-shadow-md">
                    <Icon name="MapPin" size={40} className="fill-current" />
                    {/* Fallback shape if MapPin doesn't look like a pointer enough */}
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[20px] border-t-red-500 absolute top-2 left-1/2 -translate-x-1/2"></div>
                </div>

                {/* Rotating Container */}
                <div 
                    className="w-full h-full rounded-full shadow-2xl border-[4px] border-white overflow-hidden relative transition-transform cubic-bezier(0.25, 0.1, 0.25, 1)"
                    style={{ 
                        transform: `rotate(${rotation}deg)`,
                        transitionDuration: isSpinning ? '4s' : '0s'
                    }}
                >
                    {items.length > 0 ? (
                        <svg viewBox="-1 -1 2 2" className="w-full h-full transform -rotate-90">
                            {items.map((item, index) => {
                                const start = index / items.length;
                                const end = (index + 1) / items.length;
                                const [startX, startY] = getCoordinatesForPercent(start);
                                const [endX, endY] = getCoordinatesForPercent(end);
                                const largeArcFlag = (end - start) > 0.5 ? 1 : 0;
                                const pathData = [
                                    `M ${startX} ${startY}`,
                                    `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                                    `L 0 0`,
                                ].join(' ');

                                return (
                                    <path 
                                        key={index} 
                                        d={pathData} 
                                        fill={COLORS[index % COLORS.length]} 
                                        stroke="white" 
                                        strokeWidth="0.01"
                                    />
                                );
                            })}
                        </svg>
                    ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold">
                            Nhập món ăn
                        </div>
                    )}
                    
                    {/* Text Overlay (Tricky with rotation, keeping simple for now) */}
                </div>
                
                {/* Center Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center z-10">
                    <button 
                        onClick={spinWheel} 
                        disabled={isSpinning || items.length < 2}
                        className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform disabled:opacity-50"
                    >
                        <Icon name="RefreshCcw" size={20} className={isSpinning ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Result Display */}
            <div className="h-16 mb-4 flex items-center justify-center">
                {result ? (
                    <div className="animate-pop-in bg-white/80 backdrop-blur-md px-6 py-3 rounded-2xl shadow-glass text-center border border-emerald-100">
                        <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Chốt đơn!</div>
                        <div className="text-2xl font-black text-slate-800">{result}</div>
                    </div>
                ) : isSpinning ? (
                    <div className="text-slate-500 font-medium animate-pulse">Đang chọn ngẫu nhiên...</div>
                ) : (
                    <div className="text-slate-400 font-medium">Bấm nút để quay</div>
                )}
            </div>

            {/* Input Area */}
            <div className="w-full max-w-sm glass-card rounded-[24px] p-5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex justify-between">
                    <span>Danh sách món (Xuống dòng)</span>
                    <span className="text-emerald-600">{items.length} món</span>
                </label>
                <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full h-32 bg-slate-50/50 rounded-xl p-3 text-slate-700 font-medium focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none text-sm leading-relaxed"
                    placeholder="Nhập các món ăn..."
                />
            </div>

        </div>
    </div>
  );
};

export default WheelScreen;