'use client';

import { useEffect, useRef } from 'react';

export function PriceLiquidityComparison() {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add('word-revealed');
            observer.unobserve(entry.target);
          }
      },
      { threshold: 1, rootMargin: '0px 0px -10% 0px' },
    );
    heading.current?.querySelectorAll('span').forEach((word, index) => {
      word.style.setProperty('--word-delay', `${index * 70}ms`);
      word.classList.add('word-reveal');
      observer.observe(word);
    });
    return () => observer.disconnect();
  }, []);
  return (
    <section
      className="concept-section"
      id="concept"
      aria-labelledby="concept-title"
    >
      <div className="container concept-layout">
        <div>
          <h2 ref={heading} id="concept-title">
            <span>Price</span> <span>is</span> <span>not</span>
            <br />
            <span>liquidity.</span>
          </h2>
          <p>
            A quote tells you the price.
            <br />
            Depth tells you how much can trade near it.
          </p>
        </div>
        <div className="comparison-bars">
          <div className="comparison-title">
            <strong>Same quoted price. Different capacity.</strong>
            <span>Illustrative comparison · 10 XLM per unit</span>
          </div>
          <div className="comparison-row">
            <div>
              <span>Deep market</span>
              <strong>
                500,000 <small>XLM</small>
              </strong>
            </div>
            <div className="comparison-track">
              <span style={{ width: '100%' }} />
            </div>
          </div>
          <div className="comparison-row">
            <div>
              <span>Thin market</span>
              <strong>
                800 <small>XLM</small>
              </strong>
            </div>
            <div className="comparison-track thin-track">
              <span style={{ width: '0.16%', minWidth: '2px' }} />
            </div>
          </div>
          <p>
            Executable depth within ±5%. Same price does not mean the same
            collateral capacity.
          </p>
        </div>
      </div>
    </section>
  );
}
