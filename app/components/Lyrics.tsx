import {
  LYRIC_RELEASES,
  type LyricRelease,
  type LyricSong
} from "../constants/lyrics";

function AnchorTitle({
  href,
  children,
  className
}: {
  href: string;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <a
      href={href}
      className={`group inline-block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${className}`}
    >
      {children}
      <span
        aria-hidden="true"
        className="ml-3 align-middle text-[0.42em] text-white/0 transition-colors group-hover:text-white/40 group-focus-visible:text-white/40"
      >
        #
      </span>
    </a>
  );
}

function LyricsCopy({ song }: { song: LyricSong }) {
  const stanzas = song.lyrics.split(/\n\s*\n/);

  return (
    <div className="max-w-[46rem] space-y-7 break-words text-lg font-medium leading-[1.55] text-white/88 sm:text-xl md:text-2xl">
      {stanzas.map((stanza, index) => (
        <p
          key={`${song.id}-stanza-${index}`}
          className="whitespace-pre-line"
        >
          {stanza}
        </p>
      ))}
    </div>
  );
}

function SingleRelease({ release }: { release: LyricRelease }) {
  const song = release.songs[0];

  return (
    <article
      id={release.id}
      className="grid gap-12 border-t border-white/20 py-20 sm:py-28 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
    >
      <h2 className="font-display text-5xl leading-[0.92] tracking-[-0.045em] sm:text-7xl lg:sticky lg:top-28 lg:self-start lg:text-8xl">
        <AnchorTitle href={song.href} className="max-w-[8ch]">
          {release.title}
        </AnchorTitle>
      </h2>

      <LyricsCopy song={song} />
    </article>
  );
}

function AlbumRelease({ release }: { release: LyricRelease }) {
  return (
    <article id={release.id} className="border-t border-white/20 py-20 sm:py-28">
      <h2 className="max-w-[11ch] font-display text-6xl leading-[0.86] tracking-[-0.055em] sm:text-8xl lg:text-9xl">
        <AnchorTitle href={release.href} className="max-w-full">
          {release.title}
        </AnchorTitle>
      </h2>

      <ol className="mt-16 sm:mt-24">
        {release.songs.map((song, index) => (
          <li
            key={song.id}
            id={song.id}
            className="grid gap-10 border-t border-white/15 py-16 sm:py-20 lg:grid-cols-[minmax(16rem,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
          >
            <div className="flex items-start gap-5 lg:sticky lg:top-28 lg:self-start">
              <span
                aria-hidden="true"
                className="pt-1 text-sm font-semibold tabular-nums text-white/45 sm:text-base"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-3xl leading-none tracking-[-0.035em] sm:text-5xl">
                <AnchorTitle href={song.href} className="max-w-[13ch]">
                  {song.title}
                </AnchorTitle>
              </h3>
            </div>

            <LyricsCopy song={song} />
          </li>
        ))}
      </ol>
    </article>
  );
}

export default function Lyrics() {
  return (
    <section id="lyrics" className="relative bg-black text-white">
      <div className="mx-auto w-full max-w-[112rem] px-5 pb-32 pt-24 sm:px-8 sm:pb-40 sm:pt-32 lg:px-12 lg:pb-52">
        <header className="pb-20 sm:pb-28">
          <h1 className="font-display text-[clamp(4.75rem,15vw,12rem)] leading-[0.8] tracking-[-0.06em]">
            Lyrics
          </h1>
        </header>

        {LYRIC_RELEASES.map((release) =>
          release.kind === "album" ? (
            <AlbumRelease key={release.id} release={release} />
          ) : (
            <SingleRelease key={release.id} release={release} />
          )
        )}
      </div>
    </section>
  );
}
