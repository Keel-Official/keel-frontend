import { ImageResponse } from 'next/og';

export const alt = 'Keel: Know how much a price can actually support.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * The mark, inlined. Satori renders `img`, not a component tree of SVG paths,
 * so the shared `KeelMark` cannot be reused here — the geometry is duplicated
 * rather than imported. Keep the two path strings in step.
 */
const mark = `data:image/svg+xml;base64,${btoa(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 100">' +
    '<path fill="#102e3c" d="M0 0h13.2v100H0z M39.4 19.9H64L40.2 43.7v-9.2L13.2 61.5V46.1z M18.6 100V65.1l13.3-13.3L64 83.9H46.1L31.5 69.3V100z"/>' +
    '<path fill="#e49f37" d="M41 51.9 59.8 33.1v37.6z"/>' +
    '</svg>',
)}`;

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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 36,
          fontWeight: 700,
        }}
      >
        <img src={mark} alt="" width={35} height={55} />
        <span style={{ marginLeft: 14 }}>keel</span>
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
