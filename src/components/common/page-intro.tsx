type PageIntroProps = { kicker?: string; title: string; description: string };

export function PageIntro({ kicker, title, description }: PageIntroProps) {
  return (
    <header className="page-intro">
      {kicker ? <p className="kicker">{kicker}</p> : null}
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}
