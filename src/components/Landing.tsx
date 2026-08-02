export function Landing({ onBegin }: { onBegin: () => void }) {
  return (
    <section className="landing">
      <div className="landing__bg" aria-hidden />
      <div className="landing__vignette" aria-hidden />
      <div className="landing__content">
        <img className="brand-mark" src="/asterra.svg" alt="" />
        <h1 className="brand">ASTERRA</h1>
        <p className="landing__sub">Empires of Legend</p>
        <p className="landing__lead">
          The ancient continent has awakened. Build empires, lead elite squads through brutal
          battles, and write the legend of a hero—before the world collapses.
        </p>
        <div className="landing__cta">
          <button className="primary" type="button" onClick={onBegin}>
            Choose Your Faction
          </button>
        </div>
        <div className="landing__meta">
          <span>2–6 Players</span>
          <span>90–240 minutes</span>
          <span>Ages 14+</span>
        </div>
      </div>
    </section>
  )
}
