import React from 'react';

interface DualGaugeRingProps {
  riskScore: number;
  confidenceScore: number;
  size?: 'sm' | 'md' | 'lg';
  showCenterText?: boolean;
  className?: string;
}

export const DualGaugeRing: React.FC<DualGaugeRingProps> = ({
  riskScore,
  confidenceScore,
  size = 'md',
  showCenterText = true,
  className = '',
}) => {
  // Clamp values
  const clampedRisk = Math.min(100, Math.max(0, riskScore));
  const clampedConf = Math.min(100, Math.max(0, confidenceScore));

  // Risk Color logic
  const riskColor =
    clampedRisk >= 70 ? '#E11D48' : clampedRisk >= 40 ? '#D97706' : '#059669';

  // Confidence Color logic
  const confidenceColor =
    clampedConf >= 75 ? '#0284C7' : clampedConf >= 50 ? '#0EA5E9' : '#64748B';

  // Dimension presets
  const config = {
    sm: {
      viewBox: 64,
      outerR: 26,
      outerStroke: 5,
      innerR: 18,
      innerStroke: 4,
      fontSize: 'text-[11px]',
      subFontSize: 'text-[8px]',
      wh: 'w-14 h-14',
    },
    md: {
      viewBox: 96,
      outerR: 40,
      outerStroke: 7,
      innerR: 28,
      innerStroke: 5.5,
      fontSize: 'text-sm font-extrabold',
      subFontSize: 'text-[9px] font-bold',
      wh: 'w-20 h-20',
    },
    lg: {
      viewBox: 160,
      outerR: 66,
      outerStroke: 11,
      innerR: 48,
      innerStroke: 9,
      fontSize: 'text-2xl font-black',
      subFontSize: 'text-xs font-bold',
      wh: 'w-36 h-36',
    },
  }[size];

  const center = config.viewBox / 2;

  const outerCircumference = 2 * Math.PI * config.outerR;
  const outerOffset = outerCircumference - (clampedRisk / 100) * outerCircumference;

  const innerCircumference = 2 * Math.PI * config.innerR;
  const innerOffset = innerCircumference - (clampedConf / 100) * innerCircumference;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${config.wh} ${className}`}>
      <svg
        className="w-full h-full -rotate-90 transform"
        viewBox={`0 0 ${config.viewBox} ${config.viewBox}`}
      >
        {/* Outer Ring Background (Risk Track) */}
        <circle
          cx={center}
          cy={center}
          r={config.outerR}
          stroke="#E2E8F0"
          strokeWidth={config.outerStroke}
          fill="transparent"
        />
        {/* Outer Ring Progress (Risk) */}
        <circle
          cx={center}
          cy={center}
          r={config.outerR}
          stroke={riskColor}
          strokeWidth={config.outerStroke}
          strokeDasharray={outerCircumference}
          strokeDashoffset={outerOffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />

        {/* Inner Ring Background (Confidence Track) */}
        <circle
          cx={center}
          cy={center}
          r={config.innerR}
          stroke="#EEF2F6"
          strokeWidth={config.innerStroke}
          fill="transparent"
        />
        {/* Inner Ring Progress (Confidence) */}
        <circle
          cx={center}
          cy={center}
          r={config.innerR}
          stroke={confidenceColor}
          strokeWidth={config.innerStroke}
          strokeDasharray={innerCircumference}
          strokeDashoffset={innerOffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {/* Center Text displaying the main risk score */}
      {showCenterText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className={`${config.fontSize} text-slate-800 leading-none`}>
            {clampedRisk}
          </span>
          {size !== 'sm' && (
            <span className={`${config.subFontSize} text-slate-400 leading-tight mt-0.5`}>
              índice /100
            </span>
          )}
        </div>
      )}
    </div>
  );
};
