import { ImageResponse } from 'next/og';

export const alt = 'Keel: Know how much a price can actually support.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: '#f1f6f5',
        color: '#102e3c',
        padding: 72,
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', fontSize: 36, fontWeight: 700 }}>
        keel{' '}
        <span style={{ marginLeft: 24, fontSize: 20, color: '#40636a' }}>
          Liquidity risk intelligence for Stellar
        </span>
      </div>
      <div
        style={{
          fontSize: 76,
          lineHeight: 1.08,
          fontWeight: 700,
          maxWidth: 960,
        }}
      >
        Know how much a price can actually support.
      </div>
      <div style={{ display: 'flex', fontSize: 25, color: '#28665b' }}>
        Executable depth · Explainable risk · Inspectable evidence
      </div>
    </div>,
    size,
  );
}
