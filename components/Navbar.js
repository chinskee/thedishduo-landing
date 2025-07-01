import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem', 
      backgroundColor: '#f8f9fa', 
      borderBottom: '1px solid #ddd' 
    }}>
      <h1 style={{ margin: 0 }}>DinnerDate</h1>
      <div>
        <Link href="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link href="/swipe">Swipe</Link>
      </div>
    </nav>
  );
}
