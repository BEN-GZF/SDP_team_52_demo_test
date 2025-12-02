'use client';

import LightRays from './LightRays';

export default function BackgroundWrapper() {
  return (
    <div className="fixed inset-0 -z-10">
      <LightRays
        raysOrigin="top-center"
        raysColor="#5aa3ff"
        raysSpeed={1.0}
        lightSpread={0.7}
        rayLength={3}
        noiseAmount={0.05}
        distortion={0.03}
        followMouse={true}
        mouseInfluence={0.3}
      />
      {/* Dark glass overlay to improve contrast */}
      <div className="absolute inset-0 bg-[#0b1020]/72 backdrop-blur-[1.5px]" />
    </div>
  );
}
