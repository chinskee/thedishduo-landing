export default function SwipeButtons({ onLike, onDislike }) {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        pointerEvents: 'auto',
      }}
    >
      <button
        onClick={onDislike}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
        aria-label="No"
      >
        No
      </button>
      <button
        onClick={onLike}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#34d399',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1rem',
          cursor: 'pointer',
        }}
        aria-label="Yes"
      >
        Yes
      </button>
    </div>
  );
}
