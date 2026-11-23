"use client";

import { useEffect, useState } from "react";
import { WEDDING, currentEdits, encodeEdits, type Edits, type EventEdit } from "@/lib/wedding";

/**
 * The "edit card" panel: change the names, city, dates and venues, then apply. Nothing is sent
 * anywhere: edits are kept in this browser and can be copied as a link that carries them.
 */
export default function Customize({ onApply, onReset, onClose }: { onApply: (e: Edits) => void; onReset: () => void; onClose: () => void }) {
  const [e, setE] = useState<Edits>(() => currentEdits());
  const [leaving, setLeaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const close = () => {
    setLeaving(true);
    setTimeout(onClose, 240);
  };
  useEffect(() => {
    const onKey = (k: KeyboardEvent) => k.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof Omit<Edits, "events">) => (ev: React.ChangeEvent<HTMLInputElement>) => setE((p) => ({ ...p, [k]: ev.target.value }));
  const setEv = (key: string, k: keyof EventEdit) => (ev: React.ChangeEvent<HTMLInputElement>) =>
    setE((p) => ({ ...p, events: { ...p.events, [key]: { ...p.events?.[key], [k]: ev.target.value } } }));

  const copy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#c=${encodeEdits(e)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("copy this link", url);
    }
  };

  const field = (label: string, value: string | undefined, on: (ev: React.ChangeEvent<HTMLInputElement>) => void, type = "text", ph = "") => (
    <label className="rsvp-field">
      <span>{label}</span>
      <input type={type} value={value ?? ""} placeholder={ph} onChange={on} />
    </label>
  );

  return (
    <div className={`cu ${leaving ? "leaving" : ""}`} onPointerDown={(ev) => ev.target === ev.currentTarget && close()}>
      <button className="cu-x" aria-label="Close" onClick={close}>
        <svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">
          <path d="M10 10 C 18 17, 24 24, 31 30" />
          <path d="M30 9 C 23 17, 17 23, 9 31" />
        </svg>
      </button>
      <article className="ev-card ev-wedding edit-card">
        <div className="ev-inner edit-inner">
          <h2 className="ev-name">edit your card</h2>
          <div className="ev-tagline">change the words, then apply. copy the link to share your version.</div>
          <div className="ev-rule" aria-hidden="true" />
          <div className="edit-grid">
            {field("groom", e.groom, set("groom"))}
            {field("bride", e.bride, set("bride"))}
            {field("city", e.city, set("city"))}
            {field("reply by", e.rsvpBy, set("rsvpBy"))}
          </div>
          {field("cover greeting", e.greeting, set("greeting"))}
          {field("hosted by", e.hosts, set("hosts"))}
          {field("guest name on the cover (optional)", e.guest, set("guest"), "text", "the sharma family")}
          {WEDDING.events.map((w) => (
            <fieldset className="edit-event" key={w.key}>
              <legend>{w.key === "wedding" ? "the phere" : w.key}</legend>
              <div className="edit-grid">
                {field("title", e.events?.[w.key]?.name, setEv(w.key, "name"))}
                {field("date & time", e.events?.[w.key]?.start, setEv(w.key, "start"), "datetime-local")}
              </div>
              {field("tagline", e.events?.[w.key]?.tagline, setEv(w.key, "tagline"))}
              {field("venue", e.events?.[w.key]?.venue, setEv(w.key, "venue"))}
              {field("address", e.events?.[w.key]?.address, setEv(w.key, "address"))}
              {field("what to wear", e.events?.[w.key]?.dress, setEv(w.key, "dress"))}
            </fieldset>
          ))}
          <div className="ev-actions">
            <button className="ev-stamp" onClick={onReset}>
              reset
            </button>
            <button className="ev-stamp" onClick={copy}>
              {copied ? "link copied" : "copy share link"}
            </button>
            <button className="ev-stamp ev-rsvp" onClick={() => onApply(e)}>
              apply
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
