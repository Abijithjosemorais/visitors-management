import React from 'react'

interface KelvionLogoProps {
  className?: string
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const KelvionLogo: React.FC<KelvionLogoProps> = ({
  className = '',
  showTagline = true,
  size = 'md'
}) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 44 : 32

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Industrial heat-exchanger chevron motif */}
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white font-black"
        style={{ width: iconSize + 12, height: iconSize + 12 }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 2v20M17 2v20M2 12h20M2 7l5 5-5 5M22 7l-5 5 5 5" />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className="font-heading font-extrabold tracking-tight text-white leading-none text-xl md:text-2xl">
          KELVION
        </span>
        {showTagline && (
          <span className="text-[10px] md:text-xs font-semibold tracking-wider text-cyan-400 uppercase mt-0.5">
            Thermal Solutions • Doha, Qatar
          </span>
        )}
      </div>
    </div>
  )
}
