import { useEffect, useRef } from 'react';
import LiquidEther from './LiquidEther';

interface BackgroundProps {
  children: React.ReactNode;
}

export function Background({ children }: BackgroundProps) {
  return (
    <div className="relative min-h-screen">
      {/* LiquidEther Fluid Background */}
      <LiquidEther
        mouseForce={20}
        cursorSize={100}
        isViscous={false}
        viscous={30}
        iterationsViscous={32}
        iterationsPoisson={32}
        dt={0.014}
        BFECC={true}
        resolution={0.5}
        isBounce={false}
        colors={['#22c55e', '#16a34a', '#15803d']} // Green theme colors
        autoDemo={true}
        autoSpeed={0.5}
        autoIntensity={2.2}
        takeoverDuration={0.25}
        autoResumeDelay={1000}
        autoRampDuration={0.6}
        className="fixed inset-0 -z-10"
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}