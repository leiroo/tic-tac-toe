type HomeScreenProps = {
  onStart: () => void;
};

export default function HomeScreen({ onStart }: HomeScreenProps) {
  return (
    <section className="mx-auto w-full max-w-2xl py-8 text-center sm:py-12" aria-labelledby="home-title">
      <p className="eyebrow">A classic, with a little glow</p>
      <h1 id="home-title" tabIndex={-1} className="mt-5 text-6xl font-bold leading-[1.05] tracking-tight sm:text-8xl">
        <span className="text-cyan">Tic.</span>{" "}<span className="text-magenta">Tac.</span>
        <br /><span>Toe.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-md text-base leading-7 text-muted sm:text-lg">
        Challenge the computer, bring a friend, or play both sides.
        Pick your mode and make it your own.
      </p>
      <button type="button" onClick={onStart} className="button-primary mt-8 w-full sm:w-auto sm:min-w-56">
        Start Playing <span aria-hidden="true">→</span>
      </button>
      <p className="mt-5 text-xs text-muted">Choose a mode. Pick your symbols. Find your rhythm.</p>
    </section>
  );
}
