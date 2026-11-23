import { useId } from "react";

const FACES = {
  U: ["#facc15", "#facc15", "#facc15", "#facc15", "#facc15", "#facc15", "#facc15", "#facc15", "#facc15"],
  F: ["#22c55e", "#22c55e", "#22c55e", "#22c55e", "#22c55e", "#22c55e", "#22c55e", "#22c55e", "#22c55e"],
  R: ["#f97316", "#f97316", "#f97316", "#f97316", "#f97316", "#f97316", "#f97316", "#f97316", "#f97316"],
};

function Face({ stickers, face, id }) {
  return (
    <div className={`rubiks-loader__face rubiks-loader__face--${face}`} aria-hidden="true">
      {stickers.map((c, i) => (
        <span key={`${id}-${face}-${i}`} className="rubiks-loader__sticker" style={{ background: c }} />
      ))}
    </div>
  );
}

export default function RubiksLoader({ label = "Loading", size = 72, className = "" }) {
  const id = useId();
  return (
    <div
      className={`rubiks-loader ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{ "--rubiks-loader-size": `${size}px` }}
    >
      <div className="rubiks-loader__scene">
        <div className="rubiks-loader__cube">
          <Face face="U" stickers={FACES.U} id={id} />
          <Face face="F" stickers={FACES.F} id={id} />
          <Face face="R" stickers={FACES.R} id={id} />
        </div>
      </div>
      <span className="rubiks-loader__label">{label}</span>
    </div>
  );
}
