interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo_transparent.png"
        alt="Domaine de Fuego"
        className="h-8 lg:h-[52px] w-auto"
        style={{ maxWidth: 'none' }}
      />
    </div>
  );
}
