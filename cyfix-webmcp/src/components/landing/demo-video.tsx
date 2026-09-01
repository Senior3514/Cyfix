"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Paste the YouTube video id here once the demo is uploaded — the eleven
 * characters after `v=` or after `youtu.be/`. Empty means the section doesn't
 * render at all, so the page is never broken by a missing video.
 */
const YOUTUBE_ID = "";

/**
 * Click-to-load embed.
 *
 * A YouTube iframe on page load would pull half a megabyte from a third party
 * and set cookies before anyone asked to watch anything — a poor look on a
 * privacy-and-security product, and a needless cost for the visitors who never
 * press play. Until then this is our own poster image and a button; the iframe
 * is only created on click, from the no-cookie host.
 */
export function DemoVideo() {
  const [playing, setPlaying] = useState(false);

  if (!YOUTUBE_ID) return null;

  return (
    <section id="demo" className="border-t border-graphite-800/80 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-teal-400">
            Two minutes
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Watch a human and an agent fix a site together
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-graphite-400">
            The full loop: the agent asks, gets refused, asks properly, and only scans once a
            human approves — then explains, fixes, and verifies its own work.
          </p>
        </div>

        <div className="mt-9 overflow-hidden rounded-2xl border border-graphite-700 bg-graphite-900 shadow-2xl">
          {playing ? (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1`}
                title="Cyfix demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          ) : (
            <button
              onClick={() => setPlaying(true)}
              aria-label="Play the Cyfix demo video"
              className="group relative block aspect-video w-full"
            >
              {/* Our own screenshot, so nothing is requested off-origin until play */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/video-poster.jpg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-top opacity-70 transition-opacity duration-300 group-hover:opacity-85"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-graphite-950 via-graphite-950/40 to-transparent" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-teal-500 text-graphite-950 shadow-glow transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20">
                  <span className="absolute inset-0 rounded-full border border-teal-400/50 animate-pulse-ring" />
                  <Play size={26} className="ml-1" fill="currentColor" />
                </span>
              </span>
              <span className="absolute bottom-4 left-0 right-0 text-center font-mono text-[11px] uppercase tracking-widest text-graphite-400">
                Play the demo
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
