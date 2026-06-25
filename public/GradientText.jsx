// GradientText — CDN version (React from window global, no Framer Motion)
// Uses requestAnimationFrame instead of useAnimationFrame/useMotionValue
(function () {
  const { useState, useEffect, useRef, useCallback } = React;

  function GradientText({
    children,
    className = '',
    colors = ['#5227FF', '#FF9FFC', '#B497CF'],
    animationSpeed = 8,
    showBorder = false,
    direction = 'horizontal',
    pauseOnHover = false,
    yoyo = true,
  }) {
    const [bgPos, setBgPos] = useState('0% 50%');
    const isPausedRef = useRef(false);
    const elapsedRef = useRef(0);
    const lastTimeRef = useRef(null);
    const rafRef = useRef(null);

    const handleMouseEnter = useCallback(() => { if (pauseOnHover) isPausedRef.current = true; }, [pauseOnHover]);
    const handleMouseLeave = useCallback(() => { if (pauseOnHover) isPausedRef.current = false; }, [pauseOnHover]);

    useEffect(() => {
      elapsedRef.current = 0;
      lastTimeRef.current = null;
      const dur = animationSpeed * 1000;

      function frame(time) {
        if (!isPausedRef.current) {
          if (lastTimeRef.current !== null) elapsedRef.current += time - lastTimeRef.current;
          lastTimeRef.current = time;

          let p;
          if (yoyo) {
            const cycle = elapsedRef.current % (dur * 2);
            p = cycle < dur ? (cycle / dur) * 100 : 100 - ((cycle - dur) / dur) * 100;
          } else {
            p = (elapsedRef.current / dur) * 100;
          }

          const pos = direction === 'vertical' ? `50% ${p}%` : `${p}% 50%`;
          setBgPos(pos);
        } else {
          lastTimeRef.current = null;
        }
        rafRef.current = requestAnimationFrame(frame);
      }

      rafRef.current = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(rafRef.current);
    }, [animationSpeed, direction, yoyo]);

    const angle =
      direction === 'horizontal' ? 'to right' :
      direction === 'vertical'   ? 'to bottom' : 'to bottom right';
    const gradColors = [...colors, colors[0]].join(', ');
    const gradStyle = {
      backgroundImage: `linear-gradient(${angle}, ${gradColors})`,
      backgroundSize: direction === 'vertical' ? '100% 300%' : '300% 100%',
      backgroundRepeat: 'repeat',
      backgroundPosition: bgPos,
    };

    return (
      <div
        className={`animated-gradient-text ${showBorder ? 'with-border' : ''} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {showBorder && <div className="gradient-overlay" style={gradStyle} />}
        <div className="text-content" style={gradStyle}>{children}</div>
      </div>
    );
  }

  // ── Mount: nav logo ──
  const navMount = document.getElementById('rmNavLogo');
  if (navMount) {
    ReactDOM.createRoot(navMount).render(
      <GradientText
        colors={["#5227FF", "#D97706", "#FFE880", "#FF9FFC", "#40ffaa", "#4079ff", "#5227FF"]}
        animationSpeed={5}
        yoyo={true}
      >
        Rescue&nbsp;Match
      </GradientText>
    );
  }

  // hero logo is handled by rm-text-3d.js (Three.js 3D scene)
})();
