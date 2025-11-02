import React from 'react';

const SurrealLoader: React.FC = () => {
  return (
    <div className="absolute inset-0 flex h-full w-full items-center justify-center filter backdrop-blur-sm">
      <div className="relative h-96 w-96">
        {/* This div creates a subtle, rotating starfield effect in the background */}
        <div className="absolute inset-0 animate-[spin_60s_linear_infinite] bg-[url('https://tailwindcss.com/_next/static/media/docs@tinypng.61f4d333.png')] bg-repeat"></div>
        
        {/* The glowing, morphing blobs */}
        <div className="absolute top-0 -left-16 h-72 w-72 animate-pulse rounded-full bg-fuchsia-500 opacity-50 mix-blend-screen blur-2xl [animation-duration:8s]"></div>
        <div className="absolute top-0 -right-16 h-72 w-72 animate-pulse rounded-full bg-cyan-400 opacity-50 mix-blend-screen blur-2xl [animation-duration:10s] [animation-delay:-2s]"></div>
        <div className="absolute -bottom-16 left-20 h-72 w-72 animate-pulse rounded-full bg-purple-500 opacity-50 mix-blend-screen blur-2xl [animation-duration:12s] [animation-delay:-4s]"></div>

        {/* The central text, providing context */}
        <div className="relative flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="font-sans text-3xl font-thin tracking-[0.3em] text-white/80 animate-pulse [animation-duration:4s]">
              AWAKENING
            </h1>
            <p className="mt-2 font-sans text-xs font-light tracking-widest text-white/60">
              PLEASE WAIT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurrealLoader;
