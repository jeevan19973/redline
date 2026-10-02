// How much a single save of a Draft may send to the server. Next refuses a
// Server Action request body over `serverActions.bodySizeLimit` (1 MB by
// default); next.config.ts raises it to this, and the Add a Draft form refuses
// anything larger before sending, so a long document gets a plain message
// instead of a failed request.
export const DRAFT_REQUEST_LIMIT_BYTES = 2 * 1024 * 1024;

// Room left for the action's own encoding around the title and text.
const ENCODING_ALLOWANCE_BYTES = 16 * 1024;

// Whether a title and text fit in one save. The Server Action encodes its
// arguments as JSON, so this measures that encoding's UTF-8 size.
export function fitsInOneSave(title: string, text: string): boolean {
  const encoded = new TextEncoder().encode(JSON.stringify([title, text])).byteLength;
  return encoded <= DRAFT_REQUEST_LIMIT_BYTES - ENCODING_ALLOWANCE_BYTES;
}
