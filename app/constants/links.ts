export type SectionId = "music" | "about" | "lyrics";
export type MusicProjectId =
  | "melody"
  | "exercises"
  | "silver-cracks"
  | "deep-end"
  | "kings-road";

export type LyricNavigationTarget = Readonly<{
  id: `lyrics-${string}`;
  label: string;
  href: `#lyrics-${string}`;
}>;

export type LyricNavigationRelease = LyricNavigationTarget &
  Readonly<{
    projectId: MusicProjectId;
    songs: readonly LyricNavigationTarget[];
  }>;

export type SectionLink = Readonly<{
  id: SectionId;
  label: string;
  href: `#${SectionId}`;
}>;

export type SocialAsset = Readonly<{
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

export const LYRIC_NAVIGATION = [
  {
    projectId: "kings-road",
    id: "lyrics-kings-road",
    label: "King's Road",
    href: "#lyrics-kings-road",
    songs: []
  },
  {
    projectId: "deep-end",
    id: "lyrics-deep-end",
    label: "Deep End",
    href: "#lyrics-deep-end",
    songs: []
  },
  {
    projectId: "silver-cracks",
    id: "lyrics-silver-cracks",
    label: "Silver Cracks",
    href: "#lyrics-silver-cracks",
    songs: [
      {
        id: "lyrics-silver-cracks-intro",
        label: "Intro",
        href: "#lyrics-silver-cracks-intro"
      },
      {
        id: "lyrics-silver-cracks-us",
        label: "us",
        href: "#lyrics-silver-cracks-us"
      },
      {
        id: "lyrics-silver-cracks-terms-and-conditions",
        label: "Terms & Conditions",
        href: "#lyrics-silver-cracks-terms-and-conditions"
      },
      {
        id: "lyrics-silver-cracks-behind-the-mind",
        label: "Behind the Mind",
        href: "#lyrics-silver-cracks-behind-the-mind"
      },
      {
        id: "lyrics-silver-cracks-oddities",
        label: "Oddities",
        href: "#lyrics-silver-cracks-oddities"
      },
      {
        id: "lyrics-silver-cracks-figure-it-out",
        label: "Figure It Out",
        href: "#lyrics-silver-cracks-figure-it-out"
      },
      {
        id: "lyrics-silver-cracks-tough-skin",
        label: "Tough Skin",
        href: "#lyrics-silver-cracks-tough-skin"
      }
    ]
  },
  {
    projectId: "exercises",
    id: "lyrics-exercises",
    label: "Exercises",
    href: "#lyrics-exercises",
    songs: [
      {
        id: "lyrics-exercises-1",
        label: "Song 1",
        href: "#lyrics-exercises-1"
      },
      {
        id: "lyrics-exercises-2",
        label: "Song 2",
        href: "#lyrics-exercises-2"
      },
      {
        id: "lyrics-exercises-3",
        label: "Song 3",
        href: "#lyrics-exercises-3"
      },
      {
        id: "lyrics-exercises-4",
        label: "Song 4",
        href: "#lyrics-exercises-4"
      },
      {
        id: "lyrics-exercises-5",
        label: "Song 5",
        href: "#lyrics-exercises-5"
      },
      {
        id: "lyrics-exercises-6",
        label: "Song 6",
        href: "#lyrics-exercises-6"
      }
    ]
  },
  {
    projectId: "melody",
    id: "lyrics-melody",
    label: "Melody",
    href: "#lyrics-melody",
    songs: []
  }
] as const satisfies readonly LyricNavigationRelease[];

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
