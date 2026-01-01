
import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Paintbrush, Move, Check, X, Maximize, RotateCcw, Undo2, Search } from 'lucide-react';

interface ImageRefinerProps {
  imageSrc: string;
  onConfirm: (finalBase64: string) => void;
  onCancel: () => void;
}

const ImageRefiner: React.FC<ImageRefinerProps> = ({ imageSrc, onConfirm, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'erase' | 'restore' | 'move'>('erase');
  const [brushSize, setBrushSize] = useState(30);
  const [brushHardness, setBrushHardness] = useState(1); // 0 (soft) to 1 (hard)
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);
  
  // Viewport states for Zoom & Pan
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  
  // Undo history
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImgObj(img);
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!canvas || !maskCanvas) return;

      const aspect = img.height / img.width;
      const displayWidth = Math.min(window.innerWidth - 40, 500);
      const displayHeight = displayWidth * aspect;

      canvas.width = displayWidth;
      canvas.height = displayHeight;
      maskCanvas.width = displayWidth;
      maskCanvas.height = displayHeight;

      const ctx = canvas.getContext('2d');
      const maskCtx = maskCanvas.getContext('2d');
      if (!ctx || !maskCtx) return;

      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      maskCtx.fillStyle = 'white';
      maskCtx.fillRect(0, 0, displayWidth, displayHeight);
      
      saveToHistory();
    };
  }, [imageSrc]);

  const saveToHistory = () => {
    const mask = maskCanvasRef.current;
    if (mask) {
      setHistory(prev => [...prev.slice(-19), mask.toDataURL()]);
    }
  };

  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    newHistory.pop(); // remove current state
    const prevState = newHistory[newHistory.length - 1];
    
    const maskImg = new Image();
    maskImg.onload = () => {
      const maskCtx = maskCanvasRef.current?.getContext('2d');
      if (maskCtx) {
        maskCtx.clearRect(0, 0, maskCanvasRef.current!.width, maskCanvasRef.current!.height);
        maskCtx.drawImage(maskImg, 0, 0);
        updateDisplay();
      }
    };
    maskImg.src = prevState;
    setHistory(newHistory);
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Adjust for current scale and offset
    return {
      x: (clientX - rect.left) / scale,
      y: (clientY - rect.top) / scale
    };
  };

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setLastMousePos({ x: clientX, y: clientY });
    setIsDrawing(true);
    
    if (mode !== 'move') {
      draw(e);
    }
  };

  const handleInteractionMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (mode === 'move') {
      const dx = clientX - lastMousePos.x;
      const dy = clientY - lastMousePos.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setLastMousePos({ x: clientX, y: clientY });
    } else {
      draw(e);
    }
  };

  const handleInteractionEnd = () => {
    if (isDrawing && mode !== 'move') {
      saveToHistory();
    }
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx) return;

    const { x, y } = getCoordinates(e);

    maskCtx.globalCompositeOperation = mode === 'erase' ? 'destination-out' : 'source-over';
    
    if (brushHardness < 1) {
      // Soft brush
      const grad = maskCtx.createRadialGradient(x, y, 0, x, y, brushSize / 2);
      grad.addColorStop(0, 'white');
      grad.addColorStop(1 - (1 - brushHardness), 'rgba(255, 255, 255, 0.5)');
      grad.addColorStop(1, 'transparent');
      maskCtx.fillStyle = grad;
    } else {
      // Hard brush
      maskCtx.fillStyle = 'white';
    }

    maskCtx.beginPath();
    maskCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    maskCtx.fill();
    
    updateDisplay();
  };

  const updateDisplay = () => {
    const canvas = canvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !maskCanvas || !imgObj) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
  };

  const handleFinish = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onConfirm(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col font-sans select-none">
      <div className="p-4 flex justify-between items-center text-white border-b border-white/10 shrink-0">
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
        <div className="flex flex-col items-center">
          <h2 className="font-bold text-sm tracking-tight">Precision Refiner</h2>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Granular Control</span>
        </div>
        <button onClick={handleFinish} className="bg-white text-black px-5 py-1.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg active:scale-95">
          <Check size={18} /> Done
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#0d0d0d]">
        {/* Transparency Checkerboard */}
        <div className="absolute inset-0 opacity-15" style={{ 
          backgroundImage: 'linear-gradient(45deg, #444 25%, transparent 25%), linear-gradient(-45deg, #444 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #444 75%), linear-gradient(-45deg, transparent 75%, #444 75%)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px'
        }} />
        
        {/* Zoom Level Indicator */}
        <div className="absolute top-4 left-4 z-[101] bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-white flex items-center gap-2">
           <Search size={12} className="text-indigo-400" />
           {Math.round(scale * 100)}%
        </div>

        <div 
          className={`relative transform-gpu transition-transform ease-out duration-75 ${mode === 'move' ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'}`}
          style={{ 
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            touchAction: 'none'
          }}
        >
          <canvas 
            ref={canvasRef} 
            className="shadow-2xl max-w-none"
          />
          <canvas 
            ref={maskCanvasRef} 
            onMouseDown={handleInteractionStart}
            onMouseMove={handleInteractionMove}
            onMouseUp={handleInteractionEnd}
            onMouseLeave={handleInteractionEnd}
            onTouchStart={(e) => { e.preventDefault(); handleInteractionStart(e); }}
            onTouchMove={(e) => { e.preventDefault(); handleInteractionMove(e); }}
            onTouchEnd={handleInteractionEnd}
            className="absolute inset-0 opacity-0"
          />
        </div>
      </div>

      <div className="p-6 bg-[#161616] border-t border-white/10 flex flex-col gap-5 shrink-0">
        <div className="flex justify-around items-end gap-2">
          <button 
            onClick={() => setMode('erase')}
            className={`flex flex-col items-center gap-1 transition-all ${mode === 'erase' ? 'text-indigo-400 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <div className={`p-3 rounded-2xl ${mode === 'erase' ? 'bg-indigo-400/20 ring-1 ring-indigo-400/50' : 'bg-white/5'}`}>
              <Eraser size={24} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Erase</span>
          </button>
          
          <button 
            onClick={() => setMode('restore')}
            className={`flex flex-col items-center gap-1 transition-all ${mode === 'restore' ? 'text-indigo-400 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <div className={`p-3 rounded-2xl ${mode === 'restore' ? 'bg-indigo-400/20 ring-1 ring-indigo-400/50' : 'bg-white/5'}`}>
              <Paintbrush size={24} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Restore</span>
          </button>

          <button 
            onClick={() => setMode('move')}
            className={`flex flex-col items-center gap-1 transition-all ${mode === 'move' ? 'text-indigo-400 scale-110' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <div className={`p-3 rounded-2xl ${mode === 'move' ? 'bg-indigo-400/20 ring-1 ring-indigo-400/50' : 'bg-white/5'}`}>
              <Move size={24} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Pan</span>
          </button>

          <div className="w-px h-10 bg-white/10 mx-2 mb-2" />

          <button 
            onClick={undo}
            disabled={history.length <= 1}
            className={`flex flex-col items-center gap-1 transition-all ${history.length > 1 ? 'text-orange-400 hover:text-orange-300' : 'text-gray-700 opacity-50'}`}
          >
            <div className={`p-3 rounded-2xl ${history.length > 1 ? 'bg-orange-400/10' : 'bg-white/5'}`}>
              <Undo2 size={24} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest mt-1">Undo</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 px-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Brush Size</span>
              <span className="text-[10px] text-white font-mono">{brushSize}px</span>
            </div>
            <input 
              type="range" min="5" max="100" value={brushSize} 
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Hardness</span>
              <span className="text-[10px] text-white font-mono">{Math.round(brushHardness * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.1" value={brushHardness} 
              onChange={(e) => setBrushHardness(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl">
           <Search size={16} className="text-gray-500" />
           <input 
             type="range" min="0.5" max="5" step="0.1" value={scale} 
             onChange={(e) => setScale(parseFloat(e.target.value))}
             className="flex-1 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
           />
           <button 
             onClick={() => { setScale(1); setOffset({x:0, y:0}); }}
             className="text-[10px] font-bold text-indigo-400 uppercase bg-indigo-400/10 px-3 py-1 rounded-lg"
           >
             Reset View
           </button>
        </div>
      </div>
    </div>
  );
};

export default ImageRefiner;
