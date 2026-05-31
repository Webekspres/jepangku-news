export const dynamic = 'force-static';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>404</h1>
        <p>Halaman tidak ditemukan</p>
      </div>
    </div>
  );
}
