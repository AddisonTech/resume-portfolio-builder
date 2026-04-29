export default function App() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--ff-display)',
            fontSize: '2.25rem',
            margin: 0,
            background: 'var(--gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Resume &amp; Portfolio Builder
        </h1>
        <p style={{ color: 'var(--text-1)', marginTop: '0.75rem' }}>
          Migration in progress — React port coming online.
        </p>
      </div>
    </main>
  );
}
