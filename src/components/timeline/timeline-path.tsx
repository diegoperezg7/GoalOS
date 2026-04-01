import { motion, useReducedMotion } from "framer-motion";

export function TimelinePath({
  pathData,
  width,
  height,
}: {
  pathData: string;
  width: number;
  height: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="absolute inset-0 h-full w-full overflow-visible"
    >
      <defs>
        <linearGradient id="timelinePathGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(148,163,184,0.22)" />
          <stop offset="38%" stopColor="rgba(45,212,191,0.72)" />
          <stop offset="72%" stopColor="rgba(251,191,36,0.62)" />
          <stop offset="100%" stopColor="rgba(148,163,184,0.22)" />
        </linearGradient>
        <filter id="timelineSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path d={pathData} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth="34" strokeLinecap="round" />
      <motion.path
        d={pathData}
        fill="none"
        stroke="url(#timelinePathGlow)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#timelineSoftGlow)"
        initial={shouldReduceMotion ? { opacity: 0.85 } : { pathLength: 0, opacity: 0.2 }}
        animate={shouldReduceMotion ? { opacity: 0.85 } : { pathLength: 1, opacity: 1 }}
        transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
      <path
        d={pathData}
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 14"
      />
    </svg>
  );
}
