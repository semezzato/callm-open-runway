import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import SplitType from 'split-type';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  onComplete?: () => void;
}

const SplitText = ({ 
  text, 
  className = "", 
  delay = 0,
  onComplete 
}: SplitTextProps) => {
  const containerRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const split = new SplitType(containerRef.current, { types: 'chars,words' });
    
    gsap.set(split.chars, { opacity: 0, y: 20 });

    gsap.to(split.chars, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.03,
      delay: delay,
      ease: "power4.out",
      onComplete: onComplete
    });

    return () => {
      split.revert();
    };
  }, [text, delay, onComplete]);

  return (
    <p ref={containerRef} className={`inline-block ${className}`}>
      {text}
    </p>
  );
};

export default SplitText;
