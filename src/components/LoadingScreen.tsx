import { useEffect, useState, useRef } from "react";
import { Link } from "@tanstack/react-router";

const STATUSES = [
  "Tempering Chocolate...",
  "Wrapping Freshness...",
  "Crafting Happiness...",
  "Preparing Your Experience..."
];

interface LoadingScreenProps {
  onComplete: () => void;
}

interface BurstParticle {
  id: number;
  size: number;
  bx: string;
  by: string;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [statusText, setStatusText] = useState(STATUSES[0]);
  const [textFade, setTextFade] = useState(false);
  const [exitState, setExitState] = useState<"loading" | "shimmer" | "dissolving" | "done">("loading");
  const [burstParticles, setBurstParticles] = useState<BurstParticle[]>([]);

  const progressRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // 1. Progress Bar Animation (Smooth 2.5s duration)
  useEffect(() => {
    const startTime = performance.now();
    const duration = 2400; // 2.4 seconds loading time

    const updateProgress = (now: number) => {
      const elapsed = now - startTime;
      const nextProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(nextProgress);
      progressRef.current = nextProgress;

      if (nextProgress < 100) {
        animationRef.current = requestAnimationFrame(updateProgress);
      } else {
        // Progress complete, start exit sequence
        startExitSequence();
      }
    };

    animationRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // 2. Status text cycle (every 2 seconds)
  useEffect(() => {
    if (exitState !== "loading") return;

    const interval = setInterval(() => {
      setTextFade(true); // Trigger fade-out
      setTimeout(() => {
        setStatusIndex((prev) => {
          const next = (prev + 1) % STATUSES.length;
          setStatusText(STATUSES[next]);
          return next;
        });
        setTextFade(false); // Trigger fade-in
      }, 350);
    }, 2000);

    return () => clearInterval(interval);
  }, [exitState]);

  // 3. Exit Sequence Timings
  const startExitSequence = () => {
    // Stage 1: Golden shimmer sweep triggers across the logo
    setExitState("shimmer");

    // Stage 2: Logo dissolves into particles, background fades away
    setTimeout(() => {
      setExitState("dissolving");
      generateBurstParticles();

      // Stage 3: Fully completed, unmount loader
      setTimeout(() => {
        setExitState("done");
        onComplete();
      }, 900); // Dissolve animation duration
    }, 600); // Shimmer duration
  };

  // 4. Generate burst particles for the logo dissolve effect
  const generateBurstParticles = () => {
    const particles = Array.from({ length: 30 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 120 + 40;
      const bx = Math.cos(angle) * distance + "px";
      const by = Math.sin(angle) * distance + "px";
      const size = Math.random() * 4 + 2; // 2px to 6px
      return { id: i, size, bx, by };
    });
    setBurstParticles(particles);
  };

  // Generate floating cocoa particles
  const floatParticles = useRef(
    Array.from({ length: 20 }).map((_, i) => {
      const size = Math.random() * 3 + 2; // 2px to 5px
      const drift = (Math.random() * 50 - 25) + "px";
      const delay = (Math.random() * 2) + "s";
      const duration = (Math.random() * 3 + 4) + "s";
      const opacity = Math.random() * 0.3 + 0.15;
      const left = Math.random() * 100 + "%";
      return { id: i, size, left, drift, delay, duration, opacity };
    })
  ).current;

  if (exitState === "done") {
    return null;
  }

  // Handle classes based on exit status
  const containerClass = exitState === "dissolving"
    ? "opacity-0 scale-95 pointer-events-none blur-sm"
    : "opacity-100 scale-100";

  const logoClass = exitState === "dissolving"
    ? "scale-90 opacity-0 blur-md transition-all duration-700 ease-in-out"
    : "scale-100 opacity-100 transition-transform duration-700";

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center chocolate-flow-overlay text-white select-none transition-all duration-1000 ease-in-out ${containerClass}`}
    >
      {/* Flowing background texture */}
      <div className="chocolate-texture" />

      {/* Floating particles container */}
      {exitState === "loading" && (
        <div className="absolute inset-x-0 bottom-0 top-1/2 overflow-hidden pointer-events-none max-w-lg mx-auto">
          {floatParticles.map((p) => (
            <div
              key={p.id}
              className="cocoa-particle"
              style={{
                width: p.size,
                height: p.size,
                left: p.left,
                bottom: "0%",
                "--p-op": p.opacity,
                "--p-drift": p.drift,
                "--p-dur": p.duration,
                "--p-delay": p.delay,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Burst particles (only visible when dissolving) */}
      {exitState === "dissolving" && (
        <div className="absolute top-1/2 left-1/2 w-0 h-0 pointer-events-none z-10">
          {burstParticles.map((bp) => (
            <div
              key={bp.id}
              className="burst-particle"
              style={{
                width: bp.size,
                height: bp.size,
                left: "-2px",
                top: "-2px",
                "--b-x": bp.bx,
                "--b-y": bp.by,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center justify-center max-w-sm w-full text-center px-6 z-20">
        
        {/* Medallion Glowing Backlight */}
        <div className="absolute w-72 h-72 rounded-full emblem-glow -z-10 pointer-events-none" />

        {/* Centerpiece Emblem */}
        <div className={`relative w-44 h-44 mb-8 flex items-center justify-center ${logoClass}`}>
          <div className={`w-full h-full shimmer-sweep rounded-full p-2`}>
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
            >
              {/* Outer Thin Gold Ring */}
              <circle
                cx="100"
                cy="100"
                r="88"
                stroke="#C9A76A"
                strokeWidth="1"
                strokeOpacity="0.25"
              />
              {/* Outer Formed Gold Ring */}
              <circle
                cx="100"
                cy="100"
                r="82"
                stroke="#C9A76A"
                strokeWidth="2.5"
                className="animate-emblem-stroke"
                strokeLinecap="round"
              />

              {/* Chocolate Medallion Disc */}
              <circle cx="100" cy="100" r="76" fill="url(#chocolateGrad)" />

              {/* Chocolate Tablet Division Lines */}
              <line x1="100" y1="24" x2="100" y2="176" stroke="#1c0f0b" strokeWidth="2.5" strokeOpacity="0.55" />
              <line x1="24" y1="100" x2="176" y2="100" stroke="#1c0f0b" strokeWidth="2.5" strokeOpacity="0.55" />

              {/* Inner Decorative Dotted Gold Ring */}
              <circle
                cx="100"
                cy="100"
                r="52"
                stroke="#C9A76A"
                strokeWidth="1.5"
                strokeDasharray="8 4"
                strokeOpacity="0.75"
              />

              {/* Embossed Monogram E */}
              <text
                x="100"
                y="117"
                fontFamily="'Cormorant Garamond', serif"
                fontSize="54"
                fontWeight="600"
                fill="url(#goldGrad)"
                textAnchor="middle"
                letterSpacing="1"
                style={{
                  filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.65))"
                }}
              >
                E
              </text>

              <defs>
                <linearGradient id="chocolateGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#43281E" />
                  <stop offset="50%" stopColor="#2E1A12" />
                  <stop offset="100%" stopColor="#1E0E0A" />
                </linearGradient>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#C9A76A" />
                  <stop offset="50%" stopColor="#F9E8C7" />
                  <stop offset="100%" stopColor="#A88243" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Brand Label & cycling status */}
        <div className="space-y-4 w-full">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-display font-medium tracking-[0.18em] text-[#F8F3EC]/90 uppercase">
              Eternity
            </h2>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-[#C9A76A] font-light">
              Handcrafting Sweet Moments...
            </p>
          </div>

          {/* Thin Gold Progress Bar */}
          <div className="relative w-48 h-[2px] bg-[#3B241A] rounded-full mx-auto overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-[#C9A76A] rounded-full shadow-[0_0_8px_#C9A76A] transition-all duration-100 ease-out"
              style={{
                width: `${progress}%`
              }}
            />
          </div>

          {/* Cycling Status Text */}
          <div className="h-4 flex items-center justify-center">
            <p
              className={`text-[10px] md:text-xs tracking-[0.15em] text-[#F8F3EC]/50 uppercase transition-all duration-300 transform ${
                textFade ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
              }`}
            >
              {statusText}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
