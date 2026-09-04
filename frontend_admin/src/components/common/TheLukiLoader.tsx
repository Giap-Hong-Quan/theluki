
interface TheLukiLoaderProps {
  fullScreen?: boolean;
  text?: string;
}

export default function TheLukiLoader({ 
  fullScreen = true,
  text
}: TheLukiLoaderProps) {
  const content = (
    <div className="relative select-none flex flex-col items-center justify-center p-6">
      {/* Khối chữ THE LUKI lớn với hiệu ứng quét ánh sáng Liquid Metallic Shimmer */}
      <div className="relative flex items-center justify-center">
        {/* Lớp bóng mờ nền phát sáng nhẹ */}
        <span 
          aria-hidden="true" 
          className="absolute text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[0.25em] sm:tracking-[0.35em] uppercase text-neutral-200 select-none blur-[1px]"
        >
          THE LUKI
        </span>

        {/* Lớp chữ chính với Gradient ánh sáng kim loại chuyển động lướt qua */}
        <h1 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-[0.25em] sm:tracking-[0.35em] uppercase bg-gradient-to-r from-neutral-900 via-neutral-400 to-neutral-900 bg-clip-text text-transparent the-luki-text">
          THE LUKI
        </h1>
      </div>

      {/* Thanh vệt sáng tối giản mở rộng nhịp nhàng phía dưới */}
      <div className="w-24 sm:w-36 h-[3px] bg-neutral-100 rounded-full mt-4 sm:mt-6 overflow-hidden">
        <div className="h-full bg-neutral-900 rounded-full the-luki-bar" />
      </div>

      {/* Dòng chữ phụ (nếu có) */}
      {text && (
        <p className="mt-3 text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400 animate-pulse">
          {text}
        </p>
      )}

      <style>{`
        .the-luki-text {
          background-size: 200% auto;
          animation: shineWave 2s linear infinite, gentleBreathe 3s ease-in-out infinite;
        }

        .the-luki-bar {
          animation: expandBar 1.8s ease-in-out infinite;
        }

        @keyframes shineWave {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        @keyframes gentleBreathe {
          0%, 100% {
            transform: scale(0.98);
            letter-spacing: 0.28em;
          }
          50% {
            transform: scale(1.02);
            letter-spacing: 0.32em;
          }
        }

        @keyframes expandBar {
          0% {
            transform: translateX(-100%) scaleX(0.2);
          }
          50% {
            transform: translateX(0%) scaleX(1);
          }
          100% {
            transform: translateX(100%) scaleX(0.2);
          }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/95 backdrop-blur-md transition-all duration-500">
        {content}
      </div>
    );
  }

  return content;
}
