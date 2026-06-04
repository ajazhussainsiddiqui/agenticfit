import { HelpTooltip } from '../shared/HelpTooltip';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export function StrainSlider({ value, onChange }: Props) {
  const percent = (value / 21) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <label className="flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Day Strain (0–21)
          <HelpTooltip content="Quantify cumulative physiological load." className="ml-1.5" />
        </label>
        <span className="text-2xl font-mono font-bold text-slate-50">{value.toFixed(1)}</span>
      </div>
      
      <div className="relative pt-1">
        <input
          type="range"
          min="0"
          max="21"
          step="0.1"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none shadow-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime-400 [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(190,242,100,0.4)] [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-lime-400 [&::-moz-range-thumb]:shadow-[0_0_20px_rgba(190,242,100,0.4)]"
          style={{ background: `linear-gradient(to right, #bef264 ${percent}%, #1e293b ${percent}%)` }}
        />
        
        <div className="flex justify-between mt-4 text-[10px] font-mono text-slate-500">
          <span>0</span>
          <span>7</span>
          <span>14</span>
          <span>21</span>
        </div>
      </div>
    </div>
  );
}
