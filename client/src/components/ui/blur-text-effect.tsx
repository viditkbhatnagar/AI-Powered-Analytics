'use client';

import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

interface BlurTextEffectProps {
  children: string;
  className?: string;
}

export const BlurTextEffect: React.FC<BlurTextEffectProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const words = containerRef.current.querySelectorAll('span.word');
    gsap.set(words, { opacity: 0, y: 10, filter: 'blur(8px)' });
    gsap.to(words, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.08,
      clearProps: 'filter',
    });
  }, [children]);

  return (
    <span className={className} ref={containerRef} style={{ display: 'inline' }}>
      {children.split(' ').map((word, i, arr) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className="word" style={{ display: 'inline' }}>{word}</span>
          {i < arr.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </span>
  );
};
