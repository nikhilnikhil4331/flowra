/**
 * Floral line-art decoration.
 *
 * The reference uses a soft peach-pink botanical line drawing painted behind the
 * content (a large blossom top-right, a layered bloom bottom-left, and a small
 * six-petal sprig on the left). They are reproduced here as SVG line-art so they
 * stay crisp at any size; positions come from the reference screenshots
 * (see design/SPEC.md, measured in css px on a 390-wide board).
 */

type Props = {
  /** which screen the decoration belongs to — the reference varies the arrangement */
  variant?: 'home' | 'plain' | 'detail';
  className?: string;
};

const STROKE = '#f7c8cf';

/** five-petal blossom with a ring of radial detail lines, like the reference */
function Blossom({ x, y, r, rot = 0 }: { x: number; y: number; r: number; rot?: number }) {
  const petals = [0, 1, 2, 3, 4];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {petals.map((i) => {
        const a = (i * 360) / 5 - 90;
        return (
          <g key={i} transform={`rotate(${a})`}>
            <path
              d={`M0 ${-r * 0.14} C ${-r * 0.46} ${-r * 0.42}, ${-r * 0.34} ${-r * 0.95}, 0 ${-r} C ${r * 0.34} ${-r * 0.95}, ${r * 0.46} ${-r * 0.42}, 0 ${-r * 0.14} Z`}
              fill="none"
              strokeWidth={1.1}
            />
            {[0.42, 0.58, 0.74].map((k, j) => (
              <path
                key={j}
                d={`M0 ${-r * 0.2} Q ${(j - 1) * r * 0.09} ${-r * k} 0 ${-r * (k + 0.16)}`}
                fill="none"
                strokeWidth={0.7}
                opacity={0.75}
              />
            ))}
          </g>
        );
      })}
      <circle r={r * 0.11} fill="none" strokeWidth={1} />
      <circle r={r * 0.05} fill="none" strokeWidth={0.8} opacity={0.8} />
    </g>
  );
}

/** flat 5-petal flower outline (the "sprig" motif) */
function Sprig({ x, y, r, rot = 0 }: { x: number; y: number; r: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i * 360) / 5 - 90;
        return (
          <ellipse
            key={i}
            cx={0}
            cy={-r * 0.62}
            rx={r * 0.34}
            ry={r * 0.5}
            fill="none"
            strokeWidth={1}
            transform={`rotate(${a})`}
          />
        );
      })}
      <circle r={r * 0.14} fill="none" strokeWidth={0.9} />
    </g>
  );
}

export default function FloralDecor({ variant = 'home', className }: Props) {
  const cls = ['decor', className].filter(Boolean).join(' ');
  return (
    <div className={cls} aria-hidden="true">
      <svg width="390" height="960" viewBox="0 0 390 960" fill="none">
        <g stroke={STROKE} strokeLinecap="round" strokeLinejoin="round">
          {variant === 'home' && (
            <>
              <g opacity="0.62" transform="translate(330 -8)">
                <Blossom x={0} y={0} r={62} rot={14} />
              </g>
              <g opacity="0.5" transform="translate(283 118)">
                <Blossom x={0} y={0} r={50} rot={-8} />
              </g>
              <g opacity="0.5" transform="translate(26 452)">
                <Blossom x={0} y={0} r={78} rot={22} />
              </g>
              <g opacity="0.55" transform="translate(36 108)">
                <Sprig x={0} y={0} r={17} rot={0} />
              </g>
              <g opacity="0.45" transform="translate(344 430)">
                <Sprig x={0} y={0} r={15} rot={18} />
              </g>
            </>
          )}
          {variant === 'plain' && (
            <>
              <g opacity="0.6" transform="translate(354 -12)">
                <Blossom x={0} y={0} r={66} rot={-12} />
              </g>
              <g opacity="0.5" transform="translate(300 92)">
                <Blossom x={0} y={0} r={44} rot={30} />
              </g>
            </>
          )}
          {variant === 'detail' && (
            <>
              <g opacity="0.55" transform="translate(366 -16)">
                <Blossom x={0} y={0} r={64} rot={10} />
              </g>
              <g opacity="0.45" transform="translate(316 86)">
                <Blossom x={0} y={0} r={40} rot={-24} />
              </g>
              <g opacity="0.4" transform="translate(12 742)">
                <Sprig x={0} y={0} r={19} rot={12} />
              </g>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}
