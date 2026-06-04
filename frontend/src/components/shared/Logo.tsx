
export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" className={className}>
      <style>
        {`
          .stride-export-bob { 
            animation: stride-exportBob 0.35s infinite cubic-bezier(0.4, 0.0, 0.6, 1) alternate; 
          }
          .stride-export-thigh { 
            animation: stride-exportThigh 1.4s infinite cubic-bezier(0.4, 0.0, 0.6, 1); 
            transform-origin: 78px 95px; 
          }
          .stride-export-calf { 
            animation: stride-exportCalf 1.4s infinite cubic-bezier(0.4, 0.0, 0.6, 1); 
            transform-origin: 78px 120px; 
          }
          .stride-export-arm { 
            animation: stride-exportArm 1.4s infinite cubic-bezier(0.4, 0.0, 0.6, 1); 
            transform-origin: 83px 60px; 
          }
          .stride-export-delay-half { 
            animation-delay: -0.7s; 
          }

          @keyframes stride-exportBob {
            0% { transform: translateY(-3.5px); }
            100% { transform: translateY(3.5px); }
          }
          
          @keyframes stride-exportThigh {
            0%   { transform: rotate(-35deg); }
            50%  { transform: rotate(35deg); }
            100% { transform: rotate(-35deg); }
          }

          @keyframes stride-exportCalf {
            0%   { transform: rotate(5deg); }
            25%  { transform: rotate(25deg); }
            50%  { transform: rotate(85deg); }
            75%  { transform: rotate(105deg); }
            100% { transform: rotate(5deg); }
          }

          @keyframes stride-exportArm {
            0%   { transform: rotate(35deg); }
            50%  { transform: rotate(-40deg); }
            100% { transform: rotate(35deg); }
          }
        `}
      </style>
      
      <defs>
        <filter id="stride-export-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform="translate(80, 90) scale(1.3) translate(-80, -90)">
        <g className="stride-export-bob">
          {/* Back / Ghosted Limbs */}
          <g opacity="0.35">
            <g className="stride-export-arm stride-export-delay-half">
              <line x1="83" y1="60" x2="83" y2="82" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
              <g style={{ transformOrigin: '83px 82px', transform: 'rotate(-90deg)' }}>
                 <line x1="83" y1="82" x2="83" y2="102" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
              </g>
            </g>
            <g className="stride-export-thigh stride-export-delay-half">
              <line x1="78" y1="95" x2="78" y2="120" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
              <g className="stride-export-calf stride-export-delay-half">
                 <line x1="78" y1="120" x2="78" y2="145" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* Torso & Head */}
          <line x1="83" y1="60" x2="78" y2="95" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
          <circle cx="85" cy="40" r="10.5" fill="currentColor" filter="url(#stride-export-glow)" />

          {/* Front Limbs */}
          <g className="stride-export-thigh">
            <line x1="78" y1="95" x2="78" y2="120" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
            <g className="stride-export-calf">
               <line x1="78" y1="120" x2="78" y2="145" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            </g>
          </g>
          <g className="stride-export-arm">
            <line x1="83" y1="60" x2="83" y2="82" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            <g style={{ transformOrigin: '83px 82px', transform: 'rotate(-90deg)' }}>
               <line x1="83" y1="82" x2="83" y2="102" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
