
import React, { useRef, useEffect, useState } from 'react';
import { Eraser, Paintbrush, Move, Check, X, Maximize, RotateCcw } from 'lucide-react';

interface ImageRefinerProps {
  imageSrc: string;
  onConfirm: (finalBase64: string) => void;
  onCancel: () => void;
}

const ImageRefiner: React.FC<ImageRefinerProps> = ({ imageSrc, onConfirm, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'erase' | 'restore'>('erase');
  const [brushSize, setBrushSize] = useState(30);
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      setImgObj(img);
      const canvas = canvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!canvas || !maskCanvas) return;

      // Set dimensions
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

      // Draw original image on main canvas
      ctx.drawImage(img, 0, 0, displayWidth, displayHeight);
      
      // Initialize mask (fully opaque)
      maskCtx.fillStyle = 'white';
      maskCtx.fillRect(0, 0, displayWidth, displayHeight);
    };
  }, [imageSrc]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const maskCtx = maskCanvasRef.current?.getContext('2d');
    if (!maskCtx) return;

    const { x, y } = getCoordinates(e);

    maskCtx.globalCompositeOperation = mode === 'erase' ? 'destination-out' : 'source-over';
    maskCtx.fillStyle = 'white';
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
    
    // Draw original
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(imgObj, 0, 0, canvas.width, canvas.height);
    
    // Apply mask
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(maskCanvas, 0, 0, canvas.width, canvas.height);
  };

  const handleFinish = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onConfirm(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col">
      <div className="p-4 flex justify-between items-center text-white border-b border-white/10 shrink-0">
        <button onClick={onCancel} className="p-2"><X size={24} /></button>
        <h2 className="font-bold">Refine Cutout</h2>
        <button onClick={handleFinish} className="bg-white text-black px-4 py-1 rounded-full font-bold flex items-center gap-2">
          <Check size={18} /> Done
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#111]">
        {/* Checkered background for transparency preview */}
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }} />
        
        <div className="relative cursor-crosshair touch-none">
          <canvas 
            ref={canvasRef} 
            className="shadow-2xl max-w-full h-auto"
          />
          <canvas 
            ref={maskCanvasRef} 
            onMouseDown={() => setIsDrawing(true)}
            onMouseMove={draw}
            onMouseUp={() => setIsDrawing(false)}
            onMouseLeave={() => setIsDrawing(false)}
            onTouchStart={(e) => { e.preventDefault(); setIsDrawing(true); }}
            onTouchMove={(e) => { e.preventDefault(); draw(e); }}
            onTouchEnd={() => setIsDrawing(false)}
            className="absolute inset-0 opacity-0"
          />
        </div>
      </div>

      <div className="p-6 bg-[#1a1a1a] border-t border-white/10 flex flex-col gap-6 shrink-0">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => setMode('erase')}
            className={`flex flex-col items-center gap-1 ${mode === 'erase' ? 'text-indigo-400' : 'text-gray-500'}`}
          >
            <div className={`p-3 rounded-full ${mode === 'erase' ? 'bg-indigo-400/20' : ''}`}>
              <Eraser size={24} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest">Eraser</span>
          </button>
          
          <button 
            onClick={() => setMode('restore')}
            className={`flex flex-col items-center gap-1 ${mode === 'restore' ? 'text-indigo-400' : 'text-gray-500'}`}
          >
            <div className={`p-3 rounded-full ${mode === 'restore' ? 'bg-indigo-400/20' : ''}`}>
              <Paintbrush size={24} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest">Restore</span>
          </button>

          <button 
            onClick={() => {
              const maskCtx = maskCanvasRef.current?.getContext('2d');
              if (maskCtx) {
                maskCtx.fillStyle = 'white';
                maskCtx.fillRect(0, 0, maskCanvasRef.current!.width, maskCanvasRef.current!.height);
                updateDisplay();
              }
            }}
            className="flex flex-col items-center gap-1 text-gray-500"
          >
            <div className="p-3">
              <RotateCcw size={24} />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest">Reset</span>
          </button>
        </div>

        <div className="px-4">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Brush Size</span>
            <span className="text-xs text-white font-bold">{brushSize}px</span>
          </div>
          <input 
            type="range" 
            min="5" 
            max="100" 
            value={brushSize} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-400"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageRefiner;
