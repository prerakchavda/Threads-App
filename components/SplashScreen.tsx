
import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-gray-50 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-1000 ease-out">
        {/* Logo Approximation: The Closet Canvas Hanger Logo */}
        <div className="relative w-48 h-48 drop-shadow-lg">
           <svg viewBox="0 0 100 100" className="w-full h-full text-gray-900">
             {/* Triangular Hanger Frame */}
             <path 
               d="M20 35 L50 15 L80 35 Q82 38 78 38 L22 38 Q18 38 20 35 Z" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="4" 
               strokeLinecap="round" 
               strokeLinejoin="round" 
             />
             {/* Hook Connector */}
             <path 
               d="M50 38 L50 44 Q50 50 46 50" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="4" 
               strokeLinecap="round"
             />
             {/* Stylized 'C' shape mimicking the attached logo */}
             <path 
               d="M75 70 A 20 20 0 1 0 75 90" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="10" 
               strokeLinecap="round"
               transform="translate(-10, -10)"
             />
           </svg>
        </div>
        
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Closet Canvas</h1>
          <div className="h-1.5 w-16 bg-indigo-600 mx-auto mt-4 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
