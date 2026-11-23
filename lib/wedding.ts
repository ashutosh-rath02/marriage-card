// Everything the invite says. Change names, dates and places here; the drawings read from it.

export type WeddingEvent = {
  key: string; // also the room's name in the book
  name: string; // shown on the invite card
  tagline: string;
  start: string; // local date-time, ISO without zone
  end: string;
  venue: string;
  address: string;
  dress: string;
};

export const WEDDING = {
  couple: ["y", "mr x"] as [string, string], // bride first: this card is from the bride's side
  initials: "y & x",
  city: "jaipur",
  greeting: "padharo mhare desh",
  blessing: "shree ganeshaya namah",
  hosts: "", // optional line under the names, e.g. "her family joyfully invites you"
  rsvpBy: "15 jan 2027",
  events: [
    {
      key: "haldi",
      name: "haldi",
      tagline: "come get a little golden",
      start: "2027-02-11T10:00",
      end: "2027-02-11T13:00",
      venue: "the courtyard, rang mahal",
      address: "rang mahal, amer road, jaipur",
      dress: "yellow and marigold, clothes you don't mind ruining",
    },
    {
      key: "sangeet",
      name: "sangeet",
      tagline: "ghoomar, dholak and one more song",
      start: "2027-02-11T19:30",
      end: "2027-02-11T23:59",
      venue: "the moti lawns, rang mahal",
      address: "rang mahal, amer road, jaipur",
      dress: "bright bandhani, lehariya and juttis for dancing",
    },
    {
      key: "wedding",
      name: "the phere",
      tagline: "seven steps, seven vows, one forever",
      start: "2027-02-13T19:00",
      end: "2027-02-13T23:00",
      venue: "the mandap, rang mahal",
      address: "rang mahal, amer road, jaipur",
      dress: "traditional: rajasthani poshak, safa and jewels",
    },
    {
      key: "reception",
      name: "the reception",
      tagline: "a royal evening, fit for a maharaja",
      start: "2027-02-14T20:00",
      end: "2027-02-14T23:59",
      venue: "the durbar hall, rang mahal",
      address: "rang mahal, amer road, jaipur",
      dress: "festive formals: jewel tones, gold and sherwanis",
    },
  ] satisfies WeddingEvent[],
};

// ---------------------------------------------------------------------------
// Editing: the in-app "edit card" panel and shareable links both go through these.

export type EventEdit = Partial<Pick<WeddingEvent, "name" | "tagline" | "start" | "venue" | "address" | "dress">>;
export type Edits = {
  groom?: string;
  bride?: string;
  city?: string;
  hosts?: string;
  greeting?: string;
  rsvpBy?: string;
  guest?: string;
  events?: Record<string, EventEdit>;
};

const ORIGINAL = JSON.parse(JSON.stringify(WEDDING)) as typeof WEDDING;
const pad = (n: number) => String(n).padStart(2, "0");
const localIso = (dt: Date) => `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
const clean = (s: string | undefined, max = 80) => (s ?? "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);

/** The card's current wording, as an editable object. */
export function currentEdits(): Edits {
  return {
    bride: WEDDING.couple[0],
    groom: WEDDING.couple[1],
    city: WEDDING.city,
    hosts: WEDDING.hosts,
    greeting: WEDDING.greeting,
    rsvpBy: WEDDING.rsvpBy,
    guest: getGuest(),
    events: Object.fromEntries(WEDDING.events.map((e) => [e.key, { name: e.name, tagline: e.tagline, start: e.start, venue: e.venue, address: e.address, dress: e.dress }])),
  };
}

/** Change the card's wording (anything missing keeps its current value). */
export function applyEdits(e: Edits) {
  if (clean(e.bride, 24)) WEDDING.couple[0] = clean(e.bride, 24).toLowerCase();
  if (e.groom !== undefined) WEDDING.couple[1] = clean(e.groom, 24).toLowerCase();
  const ini = (n: string) => (n.trim().split(/\s+/).pop() ?? "")[0] ?? "";
  WEDDING.initials = WEDDING.couple.map(ini).filter(Boolean).join(" & ");
  if (clean(e.city, 30)) WEDDING.city = clean(e.city, 30).toLowerCase();
  if (e.hosts !== undefined) WEDDING.hosts = clean(e.hosts, 60).toLowerCase();
  if (clean(e.greeting, 40)) WEDDING.greeting = clean(e.greeting, 40).toLowerCase();
  if (clean(e.rsvpBy, 24)) WEDDING.rsvpBy = clean(e.rsvpBy, 24).toLowerCase();
  if (e.guest !== undefined) setGuest(e.guest);
  for (const ev of WEDDING.events) {
    const o = e.events?.[ev.key];
    if (!o) continue;
    if (clean(o.name, 28)) ev.name = clean(o.name, 28).toLowerCase();
    if (clean(o.tagline, 60)) ev.tagline = clean(o.tagline, 60).toLowerCase();
    if (clean(o.venue, 50)) ev.venue = clean(o.venue, 50).toLowerCase();
    if (clean(o.address, 80)) ev.address = clean(o.address, 80).toLowerCase();
    if (clean(o.dress, 80)) ev.dress = clean(o.dress, 80).toLowerCase();
    if (o.start && !Number.isNaN(new Date(o.start).getTime())) {
      const dur = new Date(ev.end).getTime() - new Date(ev.start).getTime();
      ev.start = o.start.slice(0, 16);
      ev.end = localIso(new Date(new Date(ev.start).getTime() + (dur > 0 ? dur : 3 * 3600 * 1000)));
    }
  }
}

/** Back to the wording the card shipped with. */
export function resetEdits() {
  applyEdits({ bride: ORIGINAL.couple[0], groom: ORIGINAL.couple[1], city: ORIGINAL.city, hosts: ORIGINAL.hosts, greeting: ORIGINAL.greeting, rsvpBy: ORIGINAL.rsvpBy, guest: "" });
  for (const ev of WEDDING.events) {
    const o = ORIGINAL.events.find((x) => x.key === ev.key);
    if (o) Object.assign(ev, o);
  }
}

/** Edits <-> a short link fragment, so an edited card can be shared as a plain URL. */
export const encodeEdits = (e: Edits) => btoa(unescape(encodeURIComponent(JSON.stringify(e)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
export function decodeEdits(s: string): Edits | null {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))))) as Edits;
  } catch {
    return null;
  }
}

/** The names on the card, however many are filled in. */
export const coupleNames = (sep = " & ") => WEDDING.couple.filter(Boolean).join(sep);

export const eventByKey = (key: string) => WEDDING.events.find((e) => e.key === key);

const d = (iso: string) => new Date(iso);
export const fmtDay = (iso: string) => d(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }).toLowerCase().replace(",", "");
export const fmtDate = (iso: string) => d(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toLowerCase().replace(",", "");
export const fmtTime = (iso: string) => d(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();

/** A guest's name from the link (?to=the%20sharma%20family), shown on the cover. */
let guest = "";
export const setGuest = (g: string) => {
  guest = g.trim().toLowerCase().slice(0, 40);
};
export const getGuest = () => guest;

/** An .ics calendar file for one event. */
export function icsFor(ev: WeddingEvent) {
  const stamp = (iso: string) => iso.replace(/[-:]/g, "") + "00";
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//unfold//rajasthani wedding invite//EN",
    "BEGIN:VEVENT",
    `UID:${ev.key}-${coupleNames("-")}@unfold`,
    `DTSTART:${stamp(ev.start)}`,
    `DTEND:${stamp(ev.end)}`,
    `SUMMARY:${ev.name} · ${coupleNames(" & ")}`,
    `LOCATION:${ev.venue}, ${ev.address}`,
    `DESCRIPTION:dress code: ${ev.dress}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
