'use client';

import { useEffect } from 'react';

/** One-time sequences enhance the server-rendered page without hiding content. */
export function LandingMotion() {
  useEffect(() => {
    if (!Element.prototype.animate || !window.IntersectionObserver) return;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches) return;

    const running = new Set<Animation>();
    const play = (
      selector: string,
      frames: Keyframe[],
      delay = 100,
      duration = 640,
    ) => {
      document.querySelectorAll(selector).forEach((element, index) => {
        const animation = element.animate(frames, {
          duration,
          delay: delay + index * 70,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'backwards',
        });
        running.add(animation);
        animation.onfinish = () => running.delete(animation);
      });
    };
    const arrive = [
      { opacity: 1, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ];
    const measure = [
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)' },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (entry.target.id === 'product-preview') {
            play('.hero-product', arrive);
            play('.hero-product .depth-bar', measure, 140, 600);
            play('.hero-product .source-bar', measure, 280, 500);
          } else if (entry.target.id === 'engine') {
            play('.flow-inputs > div', arrive, 0, 420);
            play('.flow-connector', measure, 160, 500);
            play(
              '.engine-core',
              [
                { outline: '2px solid transparent', outlineOffset: '8px' },
                {
                  outline: '2px solid var(--accent)',
                  outlineOffset: '0px',
                  offset: 0.5,
                },
                { outline: '2px solid transparent', outlineOffset: '0px' },
              ],
              200,
              700,
            );
            play('.flow-outputs > span', arrive, 360, 400);
          }
        }
      },
      { threshold: 0.15 },
    );

    play('.hero-copy h1', arrive, 0, 700);
    play('.hero-description, .hero-actions', arrive, 100, 600);
    document
      .querySelectorAll('#product-preview, #engine')
      .forEach((element) => observer.observe(element));

    const finish = () => {
      observer.disconnect();
      running.forEach((animation) => animation.cancel());
      running.clear();
    };
    const onPreference = () => {
      if (preference.matches) finish();
    };
    const onVisibility = () => {
      if (document.hidden) finish();
    };
    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      finish();
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return null;
}
