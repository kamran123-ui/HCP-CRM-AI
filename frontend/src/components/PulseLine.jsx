import React from "react";

/**
 * The "pulse line" is this product's signature element: a heartbeat trace
 * that stands in for the agent listening/thinking. Used small and static
 * as a brand mark next to the logo, and animated (via `active`) whenever
 * the AI is processing something.
 */
export default function PulseLine({ active = false, width = 64, height = 24, color = "var(--accent)" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 120 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 20 H30 L38 6 L48 34 L56 20 L64 26 L70 20 H120"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          active
            ? {
                strokeDasharray: 220,
                strokeDashoffset: 220,
                animation: "pulse-travel 1.4s ease-in-out infinite",
              }
            : undefined
        }
      />
      <style>{`
        @keyframes pulse-travel {
          0% { stroke-dashoffset: 220; opacity: 0.3; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: -220; opacity: 0.3; }
        }
      `}</style>
    </svg>
  );
}
