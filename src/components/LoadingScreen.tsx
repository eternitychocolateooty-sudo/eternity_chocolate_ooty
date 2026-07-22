import { useEffect, useState } from "react";
import logoImg from "@/assets/logo.png";
import heroImg from "@/assets/hero-chocolate.jpg";

interface LoadingScreenProps {
  onReveal?: () => void;
  onComplete: () => void;
}

export function LoadingScreen({ onReveal, onComplete }: LoadingScreenProps) {
  const [fadeState, setFadeState] = useState<"hidden" | "fade-in" | "tracing" | "hold" | "fade-out">("hidden");

  useEffect(() => {
    // Prevent scrolling while the loading screen is active
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    // Preload header hero image in background while loading screen is active
    const preloadHero = new Image();
    preloadHero.src = heroImg;

    // Sequence timing (Total duration ~3.1s before fade-out starts):
    // 1. Fade in the logo and text smoothly (0ms -> 600ms)
    const fadeInTimeout = setTimeout(() => {
      setFadeState("fade-in");
    }, 50);

    // 2. Start the elegant circular loop tracing animation (600ms -> 2400ms)
    const traceTimeout = setTimeout(() => {
      setFadeState("tracing");
    }, 650);

    // 3. Complete tracing, return to static, and hold the completed logo (2400ms -> 3000ms)
    const holdTimeout = setTimeout(() => {
      setFadeState("hold");
    }, 2450);

    // 4. Start fading out the loading screen, start fading in the homepage (3000ms -> 3600ms)
    const fadeOutTimeout = setTimeout(() => {
      setFadeState("fade-out");
      if (onReveal) {
        onReveal();
      }
    }, 3100);

    // 5. Unmount loader completely from the DOM (3700ms)
    const completeTimeout = setTimeout(() => {
      // Re-enable scrolling
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      onComplete();
    }, 3700);

    return () => {
      clearTimeout(fadeInTimeout);
      clearTimeout(traceTimeout);
      clearTimeout(holdTimeout);
      clearTimeout(fadeOutTimeout);
      clearTimeout(completeTimeout);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [onReveal, onComplete]);

  const isVisible = fadeState !== "fade-out";
  const logoOpacity = fadeState !== "hidden" ? 1 : 0;
  const isTracing = fadeState === "tracing";

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#150B08] select-none transition-opacity duration-[600ms] ease-in-out ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Self-contained CSS for high-performance GPU-accelerated drawing animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes traceInfinity {
          0% {
            stroke-dashoffset: 500;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
        .animate-trace-infinity {
          animation: traceInfinity 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          will-change: stroke-dashoffset;
        }
      ` }} />

      <div className="flex flex-col items-center justify-center max-w-md w-full text-center px-8">
        
        {/* Centered Logo Container with Golden Tracing Path */}
        <div 
          className="relative w-44 h-22 mb-6 flex items-center justify-center transition-all duration-700 ease-in-out"
          style={{ 
            opacity: logoOpacity,
            transform: fadeState === "hidden" ? "translateY(5px)" : "translateY(0)"
          }}
        >
          {/* SVG Overlay Tracing the Circular Infinity Loops */}
          <svg
            viewBox="0 0 200 100"
            className="absolute inset-0 w-full h-full pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Faint Guide Loop */}
            <path
              d="M 100,50 C 125,20 170,20 170,50 C 170,80 125,80 100,50 C 75,20 30,20 30,50 C 30,80 75,80 100,50 Z"
              fill="none"
              stroke="#C9A76A"
              strokeWidth="2"
              strokeOpacity="0.15"
            />

            {/* Continuous Line-Drawing Gold Infinity Symbol */}
            <path
              d="M 100,50 C 125,20 170,20 170,50 C 170,80 125,80 100,50 C 75,20 30,20 30,50 C 30,80 75,80 100,50 Z"
              fill="none"
              stroke="#C9A76A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="500 500"
              className={isTracing || fadeState === "hold" ? "animate-trace-infinity" : ""}
              style={{
                opacity: fadeState !== "hidden" ? 1 : 0,
                strokeDashoffset: fadeState === "hold" ? 0 : undefined,
                transition: "opacity 0.3s ease",
              }}
            />
          </svg>
        </div>

        {/* Brand Name Styling (Matching site font and luxury aesthetic) */}
        <h2 
          className="font-display text-2xl md:text-3xl tracking-[0.25em] text-[#C9A76A] uppercase font-light transition-all duration-700 delay-100"
          style={{ 
            opacity: logoOpacity,
            transform: fadeState === "hidden" ? "translateY(5px)" : "translateY(0)"
          }}
        >
          ETERNITY
        </h2>

        {/* Tagline in golden color below ETERNITY */}
        <p
          className="font-display italic text-sm md:text-base tracking-widest text-[#C9A76A] mt-3 font-normal transition-all duration-700 delay-200"
          style={{ 
            opacity: logoOpacity,
            transform: fadeState === "hidden" ? "translateY(5px)" : "translateY(0)"
          }}
        >
          Your Chocolate Desires will be Full Fillied
        </p>
      </div>
    </div>
  );
}
