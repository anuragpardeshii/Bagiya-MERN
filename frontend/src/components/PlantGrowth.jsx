import { memo, useId } from 'react';

const stageNames = [
  'Seed',
  'First stem',
  'New leaves',
  'Young plant',
  'Growing plant',
  'Rooted tree',
];
export function growthStage(progress) {
  return [0.1, 0.23, 0.4, 0.62, 0.84].filter(
    (threshold) => progress >= threshold,
  ).length;
}

function FacetedLeaf({ x, y, angle = 0, size = 1, light = false }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${size})`}>
      <polygon
        points="0,0 -16,-13 -23,-40 0,-72 19,-42 13,-15"
        fill={light ? '#8fae30' : '#3f772f'}
      />
      <polygon points="0,0 -16,-13 -7,-29" fill="#5f892c" />
      <polygon
        points="-16,-13 -23,-40 -7,-29"
        fill={light ? '#b2c83d' : '#719c32'}
      />
      <polygon
        points="-23,-40 0,-72 -7,-29"
        fill={light ? '#cfdd57' : '#91b934'}
      />
      <polygon
        points="0,-72 19,-42 2,-44"
        fill={light ? '#a4c039' : '#548a2d'}
      />
      <polygon points="0,-72 2,-44 -7,-29" fill="#b0cc43" />
      <polygon
        points="-7,-29 2,-44 13,-15 0,0"
        fill={light ? '#729630' : '#285e35'}
      />
      <polygon
        points="2,-44 19,-42 13,-15"
        fill={light ? '#4e7b2e' : '#1d5034'}
      />
    </g>
  );
}

// Shared upright artwork: the nursery supplies its own soil, while the timer uses a circular soil cutaway.
export const TreeGlyph = memo(function TreeGlyph({
  stage = 5,
  withered = false,
  paused = false,
}) {
  const scale = [0, 0.28, 0.5, 0.68, 0.86, 1][stage];
  return (
    <g
      className={`tree-glyph ${paused ? 'paused' : ''} ${withered ? 'withered' : ''}`}
    >
      <g
        className="growth-seed"
        style={{ opacity: stage === 0 && !withered ? 1 : 0 }}
      >
        <path
          d="M72 210Q63 194 77 191Q95 190 89 207Q84 218 72 210"
          fill="#80502e"
        />
        <path d="M78 193L82 211" stroke="#bb9460" strokeWidth="2" />
      </g>
      <g
        className="growth-tree"
        style={{ opacity: withered ? 0 : 1, transform: `scale(${scale})` }}
      >
        <g className="growth-sway">
          <polygon
            points="74,212 85,212 83,150 81,99 79,59 76,98 78,153"
            fill="#785131"
          />
          <polygon points="80,212 85,212 83,150 80,113 78,156" fill="#a77946" />
          <path
            d="M79 176L49 148M80 147L113 119M79 116L55 94M79 99L101 77"
            fill="none"
            stroke="#795234"
            strokeWidth="3"
          />
          <g className="growth-leaves" style={{ opacity: stage >= 2 ? 1 : 0 }}>
            <FacetedLeaf x={79} y={171} angle={-66} size={0.79} light />
            <FacetedLeaf x={80} y={148} angle={52} size={0.92} />
            <FacetedLeaf x={79} y={104} size={0.8} light />
          </g>
          <g
            className="growth-canopy"
            style={{
              opacity: stage >= 3 ? 1 : 0,
              transform: `scale(${stage >= 3 ? 1 : 0.55})`,
            }}
          >
            <FacetedLeaf x={79} y={135} angle={-39} size={0.85} />
            <FacetedLeaf x={81} y={115} angle={36} size={0.9} />
            <FacetedLeaf x={80} y={80} angle={-4} size={0.9} light />
          </g>
          <g
            className="growth-canopy"
            style={{
              opacity: stage >= 4 ? 1 : 0,
              transform: `scale(${stage >= 4 ? 1 : 0.55})`,
            }}
          >
            <FacetedLeaf x={79} y={194} angle={-53} size={0.78} />
            <FacetedLeaf x={81} y={181} angle={64} size={0.87} />
            <FacetedLeaf x={78} y={146} angle={-63} size={0.88} light />
          </g>
          <g
            className="growth-canopy"
            style={{
              opacity: stage === 5 ? 1 : 0,
              transform: `scale(${stage === 5 ? 1 : 0.7})`,
            }}
          >
            <FacetedLeaf x={80} y={159} angle={12} size={0.92} />
            <FacetedLeaf x={81} y={120} angle={54} size={0.96} />
            <FacetedLeaf x={79} y={107} angle={-45} size={0.84} />
          </g>
        </g>
      </g>
      <g className="growth-withered" style={{ opacity: withered ? 1 : 0 }}>
        <polygon
          points="73,212 88,212 81,174 86,133 79,100 84,65 77,32 79,70 73,105 79,146"
          fill="#795139"
        />
        <polygon
          points="81,212 88,212 81,174 86,133 79,100 80,151 77,178"
          fill="#ad7c4d"
        />
        <g
          fill="none"
          stroke="#795139"
          strokeLinejoin="miter"
          strokeLinecap="square"
        >
          <path
            d="M78 178L48 153L37 125M80 157L111 130L118 99M78 135L57 110L53 77M78 110L100 84L103 52M78 80L66 58L64 28"
            strokeWidth="5"
          />
          <path
            d="M48 153L29 147L22 128M41 136L44 114M111 130L134 117L139 100M115 113L109 91M58 111L35 96L32 77M54 84L62 65M98 86L121 74L123 54M103 59L97 40M65 54L50 42L47 22M78 40L88 18"
            strokeWidth="2.5"
          />
        </g>
      </g>
    </g>
  );
});

const PlantGrowth = memo(function PlantGrowth({
  stage = 0,
  withered = false,
  paused = false,
  decorative = false,
}) {
  const clip = useId();
  return (
    <svg
      className={`growth-art ${paused ? 'paused' : ''} ${withered ? 'withered' : ''}`}
      data-stage={withered ? 'withered' : stageNames[stage]}
      viewBox="0 0 320 320"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={
        decorative
          ? undefined
          : withered
            ? 'Withered tree — session ended early'
            : stageNames[stage]
      }
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="160" cy="160" r="140" />
        </clipPath>
      </defs>
      <circle cx="160" cy="160" r="140" fill="#fbfcf6" />
      <g clipPath={`url(#${clip})`}>
        <path
          d="M10 221Q30 213 50 222T90 221T130 221T170 221T210 221T250 221T310 221V310H10Z"
          fill="#8f6240"
        />
        <path
          d="M10 241Q48 226 84 243T160 241T240 244T310 241V310H10Z"
          fill="#724c33"
        />
        <path
          d="M10 276Q50 259 105 279T190 278T310 270V310H10Z"
          fill="#5e3e2c"
        />
        <g fill="#513724" opacity=".65">
          {Array.from({ length: 22 }, (_, i) => (
            <ellipse
              key={i}
              cx={30 + ((i * 47) % 264)}
              cy={232 + ((i * 23) % 66)}
              rx={2 + (i % 4)}
              ry={2 + (i % 3)}
            />
          ))}
        </g>
        <path
          d="M20 224Q48 216 74 225T128 223T188 224T248 224T300 223"
          stroke="#bc9369"
          strokeWidth="5"
          fill="none"
        />
      </g>
      <g transform="translate(80 10)">
        <TreeGlyph stage={stage} withered={withered} paused={paused} />
      </g>
    </svg>
  );
});
export default PlantGrowth;
