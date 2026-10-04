"use client";

import { useSyncExternalStore } from "react";
import { draftDate } from "./draft-date";

// The reader's time zone never changes while the page is open.
const subscribe = () => () => {};
const browserZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
const serverZone = () => "UTC";

// A Draft's date in the reader's time zone. The server renders the UTC date,
// and the browser swaps in its own once the page has hydrated.
export function DraftDate({ dateTime, className }: { dateTime: string; className?: string }) {
  const timeZone = useSyncExternalStore(subscribe, browserZone, serverZone);
  return (
    <time className={className} dateTime={dateTime}>
      {draftDate(dateTime, timeZone)}
    </time>
  );
}
