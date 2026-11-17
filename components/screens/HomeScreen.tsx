type HomeScreenProps = {
  onStart: () => void;
};

export default function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <section className="mx-auto w-full max-w-2xl py-4 text-center" aria-labelledby="home-title">
      <p className="eyebrow">A classic, with a little glow</p>
      <h1 id="home-title" tabIndex={-1} className="home-title mt-4 font-bold leading-[1.05] tracking-tight">
        <span className="text-cyan">Tic.</span>{" "}<span className="text-magenta">Tac.</span>
        <br /><span>Toe.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-base leading-6 text-muted">
        Challenge the computer, bring a friend, or play both sides.
        Pick your mode and make it your own.
      </p>
      <button type="button" onClick={onStart} className="button-primary mt-6 w-full sm:w-auto sm:min-w-56">
        Start Playing <span aria-hidden="true">→</span>
      </button>
      <p className="mt-4 text-xs text-muted">Choose a mode. Pick your symbols. Find your rhythm.</p>
    </section>
  );
}
