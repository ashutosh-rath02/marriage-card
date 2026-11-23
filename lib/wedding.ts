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
  couple: ["mr x", "vishika"] as const,
  initials: "x & v",
  city: "jaipur",
  greeting: "padharo mhare desh",
  blessing: "shree ganeshaya namah",
  hosts: "with the blessings of their families",
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
    `UID:${ev.key}-${WEDDING.couple.join("-")}@unfold`,
    `DTSTART:${stamp(ev.start)}`,
    `DTEND:${stamp(ev.end)}`,
    `SUMMARY:${ev.name} · ${WEDDING.couple.join(" & ")}`,
    `LOCATION:${ev.venue}, ${ev.address}`,
    `DESCRIPTION:dress code: ${ev.dress}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
