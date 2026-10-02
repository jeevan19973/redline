import type { Metadata } from "next";
import { preload } from "react-dom";
import { CloseAction, FootAccount, HeroAccount, TopbarAccount } from "./account-links";
import { copy, type ExampleFlag } from "./copy";
import { CopyWording } from "./copy-wording";
import { Descent } from "./descent";
import "./landing.css";

export const metadata: Metadata = {
  title: { absolute: copy.meta.title },
  description: copy.meta.description,
};

// The public landing page at the site root (ADR 0007), ported from landing/.
// It is fully static: no auth check, no model call, no database call. The
// signed-out links render by default; account-links.tsx swaps in a library
// link in the browser when a Signer is already signed in.
//
// Links out of this page are plain anchors, as are the app's links back to
// it, so moving between the two is a full page load and neither page's
// stylesheet is ever loaded on the other.
export default function LandingPage() {
  for (const font of ["sofia-sans-extra-condensed", "sofia-sans", "azeret-mono"]) {
    preload(`/fonts/${font}.woff2`, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  }

  const ranked = rankedExamples(copy.examples);
  const caution = copy.examples.filter((flag) => flag.severity === "caution");
  const dangerous = copy.examples.filter((flag) => flag.severity === "dangerous");
  // The anatomy sheet takes the example lease's personal guarantee apart.
  const sheet = copy.examples.find((flag) => flag.key === "c142")!;

  return (
    <div className="landing">
      <a className="skip" href="#main">
        {copy.skip}
      </a>

      <header className="topbar">
        <div className="wrap topbar__inner">
          <a className="wordmark" href="/" aria-label={copy.homeLabel}>
            {copy.wordmark}
          </a>
          <nav className="topbar__nav" aria-label={copy.account.navLabel}>
            <TopbarAccount />
          </nav>
        </div>
      </header>

      <main id="main">
        <div className="dive" data-dive>
          <section className="surface" aria-labelledby="hero-title">
            <div className="wrap grid">
              <h1 id="hero-title" className="display surface__title">
                {copy.hero.title}
              </h1>
              <div className="surface__copy">
                <p className="lede">{copy.hero.lede}</p>
                <div className="surface__act">
                  <HeroAccount />
                </div>
              </div>

              <figure className="lease" aria-labelledby="lease-caption">
                <figcaption id="lease-caption" className="lease__caption">
                  {copy.lease.caption}
                </figcaption>
                <p className="lease__title">{copy.lease.title}</p>
                <div className="lease__body">
                  {copy.examples.map((flag) => (
                    <p className="clause" key={flag.key}>
                      <span className="clause__no">{flag.clause}</span>
                      <span className="clause__text">
                        {flag.before && <>{flag.before} </>}
                        <span className="cite" data-key={flag.key} id={`s-${flag.key}`}>
                          {flag.sentence}
                        </span>
                      </span>
                    </p>
                  ))}
                </div>
              </figure>
            </div>
          </section>

          <section className="water water--reach" aria-label={copy.reach.label}>
            <canvas className="snow" aria-hidden="true"></canvas>
            <div className="rail" aria-hidden="true">
              <span className="rail__label rail__label--up mono">{copy.reach.railUp}</span>
              <span className="rail__label rail__label--down mono">{copy.reach.railDown}</span>
            </div>

            <div className="band band--shallow">
              <div className="wrap grid">
                <div className="band-note">
                  <h2 id="above-title" className="band-note__title">
                    {copy.reach.above.title}
                  </h2>
                  <p>{copy.reach.above.body}</p>
                </div>

                <div className="slates slates--caution">
                  {caution.map((flag) => (
                    <Slate flag={flag} key={flag.key} />
                  ))}
                </div>
              </div>
            </div>

            <div className="thermocline" role="presentation">
              <div className="wrap thermocline__inner">
                <span className="thermocline__above mono">{copy.reach.thermocline.above}</span>
                <span className="thermocline__label mono">{copy.reach.thermocline.label}</span>
                <span className="thermocline__below mono">{copy.reach.thermocline.below}</span>
              </div>
            </div>

            <div className="band band--deep">
              <div className="wrap grid">
                <div className="readout">
                  <h2 id="reach-title" className="readout__title">
                    {copy.reach.ranked.title}
                  </h2>
                  <p className="readout__note">{copy.reach.ranked.note}</p>
                  <ol className="readout__list">
                    {ranked.map((flag, i) => (
                      <li key={flag.key}>
                        <a className="readout__row" href={`#flag-${flag.key}`} data-key={flag.key}>
                          <span className="mono readout__no">{i + 1}</span>
                          <Severity severity={flag.severity} />
                          <span className="readout__name">{flag.rankedName}</span>
                          <span className="mono readout__cite">{`§ ${flag.clause}`}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="slates slates--dangerous">
                  {dangerous.map((flag) => (
                    <Slate flag={flag} key={flag.key} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <svg className="plumb" aria-hidden="true" focusable="false"></svg>
        </div>

        <section className="water water--anatomy" aria-labelledby="anatomy-title">
          <div className="wrap grid">
            <div className="col-copy">
              <h2 id="anatomy-title" className="h2">
                {copy.anatomy.title}
              </h2>
              {copy.anatomy.body.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>

            <div className="col-figure">
              <article className="slate slate--sheet" aria-labelledby="sheet-t">
                <h3 id="sheet-t" className="visually-hidden">
                  {copy.anatomy.sheet.title}
                </h3>
                <dl className="sheet">
                  <div className="sheet__row">
                    <dt className="mono">{copy.anatomy.sheet.severity}</dt>
                    <dd>
                      <Severity severity={sheet.severity} />
                    </dd>
                  </div>
                  <div className="sheet__row">
                    <dt className="mono">{copy.anatomy.sheet.clause}</dt>
                    <dd>
                      <span className="mono">{`§ ${sheet.clause}`}</span> {sheet.name}
                    </dd>
                  </div>
                  <div className="sheet__row">
                    <dt className="mono">{copy.anatomy.sheet.sentence}</dt>
                    <dd>
                      <blockquote className="slate__quote">
                        <p>{sheet.sentence}</p>
                      </blockquote>
                    </dd>
                  </div>
                  <div className="sheet__row">
                    <dt className="mono">{copy.anatomy.sheet.reading}</dt>
                    <dd>{sheet.reading}</dd>
                  </div>
                  <div className="sheet__row">
                    <dt className="mono">{copy.anatomy.sheet.counterOffer}</dt>
                    <dd>
                      <p className="counter" id="counter-text">
                        {copy.anatomy.sheet.counterOfferText}
                      </p>
                      <CopyWording
                        text={copy.anatomy.sheet.counterOfferText}
                        label={copy.anatomy.sheet.copy}
                        doneLabel={copy.anatomy.sheet.copied}
                      />
                    </dd>
                  </div>
                </dl>
              </article>

              <article className="slate slate--fixed" aria-labelledby="fixed-t">
                <header className="slate__head">
                  <Severity severity="caution" />
                  <h3 id="fixed-t" className="slate__name">
                    {copy.anatomy.fixed.name}
                  </h3>
                  <span className="tag-fixed mono">{copy.anatomy.fixed.tag}</span>
                </header>
                <blockquote className="slate__quote">
                  <p>{copy.anatomy.fixed.sentence}</p>
                </blockquote>
                <p className="slate__reading">{copy.anatomy.fixed.reading}</p>
              </article>
              <p className="figure-note mono">{copy.anatomy.note}</p>
            </div>
          </div>
        </section>

        <section className="water water--floor" aria-labelledby="line-title">
          <div className="wrap grid">
            <div className="col-copy">
              <h2 id="line-title" className="h2">
                {copy.floor.title}
              </h2>
              {copy.floor.body.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>

            <div className="col-figure">
              <div className="chart" role="group" aria-label={copy.floor.chartLabel}>
                <h3 className="chart__head mono">{copy.floor.business.head}</h3>
                <ul className="chart__list">
                  {copy.floor.business.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="chart__line" aria-hidden="true">
                  <span className="mono">{copy.floor.line}</span>
                </div>
                <h3 className="chart__head mono">{copy.floor.personal.head}</h3>
                <ul className="chart__list chart__list--deep">
                  {copy.floor.personal.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="water water--clean" aria-labelledby="clean-title">
          <div className="wrap grid grid--mirror">
            <div className="col-copy">
              <h2 id="clean-title" className="h2">
                {copy.clean.title}
              </h2>
              {copy.clean.body.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>

            <div className="col-figure">
              <article className="verdict" aria-labelledby="verdict-t">
                <header className="verdict__head">
                  <h3 id="verdict-t" className="verdict__title">
                    {copy.clean.verdict.title}
                  </h3>
                  <span className="mono verdict__tag">{copy.clean.verdict.tag}</span>
                </header>
                <p className="verdict__text">{copy.clean.verdict.text}</p>
                <p className="mono verdict__label">{copy.clean.verdict.checkedFor}</p>
                <ul className="verdict__list">
                  {copy.clean.verdict.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="verdict__stamp">{copy.clean.verdict.stamp}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="water water--reads" aria-labelledby="reads-title">
          <div className="wrap grid">
            <h2 id="reads-title" className="h2 reads__title">
              {copy.reads.title}
            </h2>
            <div className="reads__col">
              <h3 className="reads__head">{copy.reads.does.head}</h3>
              <ul className="reads__list">
                {copy.reads.does.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="reads__formats">{copy.reads.does.formats}</p>
            </div>
            <div className="reads__col">
              <h3 className="reads__head">{copy.reads.doesNot.head}</h3>
              <ul className="reads__list reads__list--not">
                {copy.reads.doesNot.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="water water--data" aria-labelledby="data-title">
          <div className="wrap grid">
            <div className="col-copy">
              <h2 id="data-title" className="h2">
                {copy.data.title}
              </h2>
              {copy.data.body.map((text) => (
                <p key={text}>{text}</p>
              ))}
            </div>
            <ol className="route" aria-label={copy.data.routeLabel}>
              {copy.data.route.map((stop) => (
                <li className="route__stop" key={stop.where}>
                  <span className="mono route__where">{stop.where}</span>
                  <span className="route__what">{stop.what}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="close" aria-labelledby="close-title">
          <div className="wrap grid close__grid">
            <div className="close__inner">
              <h2 id="close-title" className="display display--close">
                {copy.close.title}
              </h2>
              <p className="close__text">{copy.close.body}</p>
              <CloseAction />
              <p className="close__legal">{copy.close.legal}</p>
            </div>
            <div className="blank" aria-hidden="true">
              <p className="blank__caption mono">{copy.close.blankCaption}</p>
              <div className="blank__rules"></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap foot__inner">
          <span className="wordmark wordmark--small">{copy.wordmark}</span>
          <FootAccount />
        </div>
      </footer>

      <Descent />
    </div>
  );
}

// Dangerous first, then in the order the clauses appear, as a report ranks them.
function rankedExamples(flags: readonly ExampleFlag[]): ExampleFlag[] {
  const rank = (flag: ExampleFlag) => (flag.severity === "dangerous" ? 0 : 1);
  return flags
    .map((flag, order) => ({ flag, order }))
    .sort((a, b) => rank(a.flag) - rank(b.flag) || a.order - b.order)
    .map(({ flag }) => flag);
}

// The severity label carries its meaning in its text; color only supports it.
function Severity({ severity }: { severity: ExampleFlag["severity"] }) {
  return <span className={`sev sev--${severity}`}>{copy.severity[severity]}</span>;
}

// An example Risk flag as a report shows it: severity label, name, clause,
// the underlined Source sentence, and the Reading.
function Slate({ flag }: { flag: ExampleFlag }) {
  return (
    <article className="slate" id={`flag-${flag.key}`} data-key={flag.key} aria-labelledby={`flag-${flag.key}-t`}>
      <header className="slate__head">
        <Severity severity={flag.severity} />
        <h3 id={`flag-${flag.key}-t`} className="slate__name">
          {flag.name}
        </h3>
        <a className="mono slate__cite" href={`#s-${flag.key}`} aria-label={flag.findLabel}>
          {`§ ${flag.clause}`}
        </a>
      </header>
      <blockquote className="slate__quote">
        <p>{flag.sentence}</p>
      </blockquote>
      <p className="slate__reading">{flag.reading}</p>
    </article>
  );
}
