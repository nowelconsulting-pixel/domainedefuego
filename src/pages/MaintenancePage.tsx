export default function MaintenancePage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#111827',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: 'rgba(249,115,22,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          fontSize: '2.5rem',
        }}
      >
        🐾
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: 'clamp(1.75rem, 5vw, 3rem)',
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: '1rem',
          lineHeight: 1.2,
        }}
      >
        Le site arrive bientôt 🐾
      </h1>

      {/* Subtitle */}
      <p
        style={{
          color: '#9ca3af',
          fontSize: '1.125rem',
          maxWidth: 420,
          lineHeight: 1.7,
          marginBottom: '2.5rem',
        }}
      >
        Nous préparons actuellement la plateforme d'adoption.
        <br />
        Merci pour votre patience.
      </p>

      {/* Disabled button */}
      <button
        disabled
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 2rem',
          backgroundColor: 'rgba(249,115,22,0.3)',
          color: '#fdba74',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'not-allowed',
          border: 'none',
          marginBottom: '2rem',
        }}
      >
        ❤️ Voir les animaux
      </button>

      {/* Email */}
      <a
        href="mailto:contact@domainedefuego.fr"
        style={{
          color: '#6b7280',
          fontSize: '0.875rem',
          textDecoration: 'none',
        }}
      >
        contact@domainedefuego.fr
      </a>
    </div>
  );
}
