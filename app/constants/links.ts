import { LYRIC_CATALOG, type MusicProjectId } from "./music";

export type { MusicProjectId };
export type SectionId = "music" | "about" | "lyrics";

type LyricNavigationTarget = Readonly<{
  id: `lyrics-${string}`;
  label: string;
  href: `#lyrics-${string}`;
}>;

type LyricNavigationRelease = LyricNavigationTarget &
  Readonly<{
    projectId: MusicProjectId;
    songs: readonly LyricNavigationTarget[];
  }>;

type SectionLink = Readonly<{
  id: SectionId;
  label: string;
  href: `#${SectionId}`;
}>;

type SocialAsset = Readonly<{
  src: string;
  width: number;
  height: number;
}>;

export type SocialLink = Readonly<{
  id: "apple-music" | "spotify" | "youtube" | "instagram";
  label: string;
  href: string | null;
  compactIcon: SocialAsset;
  wordmarkIcon: SocialAsset;
}>;

export const SECTION_LINKS = [
  { id: "music", label: "Music", href: "#music" },
  { id: "about", label: "About", href: "#about" },
  { id: "lyrics", label: "LYRICS", href: "#lyrics" }
] as const satisfies readonly SectionLink[];

/** Slim nav view of the shared lyric catalog — albums expose tracks; singles link directly. */
export const LYRIC_NAVIGATION: readonly LyricNavigationRelease[] =
  LYRIC_CATALOG.map((release) => ({
    projectId: release.projectId,
    id: release.id,
    label: release.title,
    href: release.href,
    songs:
      release.kind === "album"
        ? release.songs.map((song) => ({
            id: song.id,
            label: song.title,
            href: song.href
          }))
        : []
  }));

export const MUSIC_PROJECT_LINKS: Readonly<Record<MusicProjectId, string | null>> = {
  "melody": "https://music.apple.com/us/album/melody/1502707173?i=1502707386",
  "exercises": "https://www.youtube.com/watch?v=63QM52HeDVo",
  "silver-cracks": "https://music.apple.com/us/album/silver-cracks/1845294512",
  "deep-end": "https://music.apple.com/us/album/deep-end/1865243131?i=1865243132",
  "kings-road": "https://music.apple.com/us/album/kings-road/1892278429?i=1892278430"
};

export const SOCIAL_LINKS = [
  {
    id: "apple-music",
    label: "Apple Music",
    href: "https://music.apple.com/mz/artist/ka-lo-han%C3%A9/1834501310",
    compactIcon: { src: "/logos/Apple1.svg", width: 361, height: 361 },
    wordmarkIcon: { src: "/logos/Apple2.webp", width: 500, height: 123 }
  },
  {
    id: "spotify",
    label: "Spotify",
    href: "https://open.spotify.com/artist/2H4CCRqWu55CNW312itg0r",
    compactIcon: { src: "/logos/Spotify1.svg", width: 227, height: 227 },
    wordmarkIcon: { src: "/logos/Spotify2.webp", width: 512, height: 140 }
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@Ka-LoHan%C3%A9",
    compactIcon: { src: "/logos/YouTube1.svg", width: 235, height: 165 },
    wordmarkIcon: { src: "/logos/YouTube2.svg", width: 508, height: 113 }
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/ft.kalo/",
    compactIcon: { src: "/logos/Instagram1.svg", width: 1000, height: 1000 },
    wordmarkIcon: { src: "/logos/Instagram2.svg", width: 924, height: 262 }
  }
] as const satisfies readonly SocialLink[];

export const INSTAGRAM_LINK = SOCIAL_LINKS[3];
