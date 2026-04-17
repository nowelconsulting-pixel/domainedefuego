interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = '', size = 44 }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo_transparent.png"
        alt="Domaine de Fuego"
        style={{ height: size, width: 'auto', maxWidth: 'none' }}
      />
    </div>
  );
}
