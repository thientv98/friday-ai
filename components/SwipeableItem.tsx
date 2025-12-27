import React, { useState, useRef, useEffect, TouchEvent, MouseEvent } from 'react';
import { Icon } from './Icons';

interface SwipeableItemProps {
  children: React.ReactNode;
  onDelete: () => void;
  onEdit: () => void;
  className?: string;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({ children, onDelete, onEdit, className = "" }) => {
  const [offset, setOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startOffset = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Thresholds
  const MAX_SWIPE = -140; // Max distance to swipe left (width of buttons)
  const SNAP_THRESHOLD = -70; // Point where it snaps open

  // Handle click outside to close
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      // Only close if open and click is NOT inside this component
      if (offset !== 0 && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOffset(0);
      }
    };

    if (offset !== 0) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [offset]);

  // Unified Start Handler
  const handleStart = (clientX: number) => {
    setIsSwiping(true);
    startX.current = clientX;
    startOffset.current = offset;
    isDragging.current = false;
  };

  // Unified Move Handler
  const handleMove = (clientX: number) => {
    if (!isSwiping) return;
    
    const diff = clientX - startX.current;
    
    // Detect intent to drag
    if (Math.abs(diff) > 5) {
        isDragging.current = true;
    }

    let newOffset = startOffset.current + diff;
    
    // Constraints
    if (newOffset > 20) newOffset = 20; 
    if (newOffset < MAX_SWIPE - 20) newOffset = MAX_SWIPE - 20;

    setOffset(newOffset);
  };

  // Unified End Handler
  const handleEnd = () => {
    setIsSwiping(false);
    
    if (offset < SNAP_THRESHOLD) {
      setOffset(MAX_SWIPE);
    } else {
      setOffset(0);
    }
    
    // Note: We do NOT reset isDragging.current here immediately because 
    // the subsequent 'click' event needs to read it.
    // We let the click handler reset it, or reset it on next start.
  };

  // Touch Events
  const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX);
  const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
  const onTouchEnd = () => handleEnd();

  // Mouse Events
  const onMouseDown = (e: MouseEvent) => handleStart(e.clientX);
  const onMouseMove = (e: MouseEvent) => {
      if(isSwiping) {
          e.preventDefault();
          handleMove(e.clientX);
      }
  };
  const onMouseUp = () => {
      if(isSwiping) handleEnd();
  };
  const onMouseLeave = () => {
      if(isSwiping) handleEnd();
  };

  // Handle Click
  const handleClick = (e: React.MouseEvent) => {
      // If this click was part of a drag interaction, ignore it
      if (isDragging.current) {
          e.stopPropagation();
          isDragging.current = false; // Reset for next time
          return;
      }
      
      // If it's a pure click (tap)
      if (offset !== 0) {
          // If open, close it (toggle behavior)
          setOffset(0);
      }
  };

  return (
    <div 
        ref={containerRef}
        className={`relative overflow-hidden select-none touch-pan-y rounded-xl ${className}`} 
        onClick={handleClick}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
    >
      {/* Background Actions Layer */}
      <div 
        className="absolute inset-y-0 right-0 flex w-[140px] h-full z-0 rounded-r-xl overflow-hidden"
        style={{
          opacity: offset < 0 ? 1 : 0,
          pointerEvents: offset < 0 ? 'auto' : 'none'
        }}
      >
        <button 
            onClick={(e) => {
                e.stopPropagation(); // Action buttons shouldn't trigger container click
                onEdit();
                setOffset(0);
            }}
            className="flex-1 bg-blue-500 text-white flex flex-col items-center justify-center active:bg-blue-600 transition-colors h-full"
        >
            <Icon name="Edit" size={20} />
            <span className="text-[10px] font-bold mt-1">Sửa</span>
        </button>
        <button 
            onClick={(e) => {
                e.stopPropagation(); // Action buttons shouldn't trigger container click
                onDelete();
                setOffset(0);
            }}
            className="flex-1 bg-red-500 text-white flex flex-col items-center justify-center active:bg-red-600 transition-colors h-full"
        >
            <Icon name="Trash2" size={20} />
            <span className="text-[10px] font-bold mt-1">Xoá</span>
        </button>
      </div>

      {/* Foreground Content Layer */}
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        style={{ 
            transform: `translateX(${offset}px)`,
            transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            minWidth: '100%',
            width: '100%'
        }}
        className="relative bg-white z-10 rounded-xl border border-slate-100/50 overflow-hidden"
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableItem;