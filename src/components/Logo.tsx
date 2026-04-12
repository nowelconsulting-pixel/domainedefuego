interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = '', size = 40 }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Paw print SVG */}
        <circle cx="20" cy="22" r="10" fill="#E8452C" />
        <circle cx="11" cy="14" r="4" fill="#E8452C" />
        <circle cx="29" cy="14" r="4" fill="#E8452C" />
        <circle cx="15" cy="10" r="3" fill="#E8452C" />
        <circle cx="25" cy="10" r="3" fill="#E8452C" />
        {/* Paw pads */}
        <ellipse cx="16" cy="23" rx="2.5" ry="3" fill="white" />
        <ellipse cx="24" cy="23" rx="2.5" ry="3" fill="white" />
        <ellipse cx="20" cy="27" rx="2" ry="2.5" fill="white" />
        <ellipse cx="20" cy="19" rx="3" ry="3.5" fill="white" />
      </svg>
      <span className="font-bold text-xl text-gray-900 leading-tight">
        Domaine<br />
        <span className="text-coral-500">de Fuego</span>
      </span>
    </div>
  );
}
