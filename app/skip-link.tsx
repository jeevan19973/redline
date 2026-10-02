// The first thing a keyboard reaches on every app and auth page. The landing
// page has its own, styled by its own stylesheet.
export function SkipLink() {
  return (
    <a className="skip" href="#main">
      Skip to content
    </a>
  );
}
