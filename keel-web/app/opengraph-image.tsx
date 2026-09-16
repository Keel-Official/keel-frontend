import { ImageResponse } from 'next/og';

import { BAND_ORDER, BAND_TOKENS } from '@/lib/design/tokens';

/**
 * The card a shared link shows.
 *
 * It carries no figures. An image is cached by whatever platform renders it, sometimes
 * for days, and a stale depth reading on a social card would be the exact failure this
 * product reports in others. It also costs nothing against the API's sixty-requests-a-
 * minute budget, which a link posted somewhere busy would otherwise spend on previews
 * rather than on readers.
 *
 * What it does carry is the question the site answers and the four bands, which are the
 * product's own vocabulary.
 */
export const alt = 'Keel — is a Stellar asset price backed by executable depth?';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#102e3c',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
          <span style={{ fontSize: 44, fontWeight: 700, color: '#ffffff' }}>Keel</span>
          <span style={{ fontSize: 26, color: '#76c6b3' }}>Stellar liquidity risk</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span
            style={{
              fontSize: 62,
              lineHeight: 1.12,
              fontWeight: 600,
              color: '#ffffff',
              maxWidth: 940,
            }}
          >
            Is this price backed by executable depth?
          </span>
          <span style={{ fontSize: 28, color: '#c3d3d0', maxWidth: 900 }}>
            An oracle says what an asset is worth. Keel says what volume that price can
            actually support, and what it would cost to move it.
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {BAND_ORDER.map((band) => (
            <div key={band} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  backgroundColor: BAND_TOKENS[band].mark,
                }}
              />
              {/* The word travels with the colour here too. */}
              <span style={{ fontSize: 22, color: '#dbe5e3' }}>
                {BAND_TOKENS[band].label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
