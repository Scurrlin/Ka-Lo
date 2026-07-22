export type MusicProjectId =
  | "melody"
  | "exercises"
  | "silver-cracks"
  | "deep-end"
  | "kings-road";

export type LyricCatalogSong = Readonly<{
  id: `lyrics-${string}`;
  href: `#lyrics-${string}`;
  title: string;
  credits?: string | readonly string[];
}>;

export type LyricCatalogRelease = Readonly<{
  projectId: MusicProjectId;
  id: `lyrics-${string}`;
  href: `#lyrics-${string}`;
  title: string;
  kind: "single" | "album";
  songs: readonly LyricCatalogSong[];
}>;

export const LYRIC_CATALOG = [
  {
    projectId: "kings-road",
    id: "lyrics-kings-road",
    href: "#lyrics-kings-road",
    title: "King's Road",
    kind: "single",
    songs: [
      {
        id: "lyrics-kings-road",
        href: "#lyrics-kings-road",
        title: "King's Road"
      }
    ]
  },
  {
    projectId: "deep-end",
    id: "lyrics-deep-end",
    href: "#lyrics-deep-end",
    title: "Deep End",
    kind: "single",
    songs: [
      {
        id: "lyrics-deep-end",
        href: "#lyrics-deep-end",
        title: "Deep End"
      }
    ]
  },
  {
    projectId: "silver-cracks",
    id: "lyrics-silver-cracks",
    href: "#lyrics-silver-cracks",
    title: "Silver Cracks",
    kind: "album",
    songs: [
      {
        id: "lyrics-silver-cracks-intro",
        href: "#lyrics-silver-cracks-intro",
        title: "Intro",
        credits: "Lyrics: Murphy LeBlanc"
      },
      {
        id: "lyrics-silver-cracks-us",
        href: "#lyrics-silver-cracks-us",
        title: "us"
      },
      {
        id: "lyrics-silver-cracks-terms-and-conditions",
        href: "#lyrics-silver-cracks-terms-and-conditions",
        title: "Terms & Conditions"
      },
      {
        id: "lyrics-silver-cracks-behind-the-mind",
        href: "#lyrics-silver-cracks-behind-the-mind",
        title: "Behind The Mind"
      },
      {
        id: "lyrics-silver-cracks-oddities",
        href: "#lyrics-silver-cracks-oddities",
        title: "Oddities"
      },
      {
        id: "lyrics-silver-cracks-figure-it-out",
        href: "#lyrics-silver-cracks-figure-it-out",
        title: "Figure It Out"
      },
      {
        id: "lyrics-silver-cracks-tough-skin",
        href: "#lyrics-silver-cracks-tough-skin",
        title: "Tough Skin"
      }
    ]
  },
  {
    projectId: "exercises",
    id: "lyrics-exercises",
    href: "#lyrics-exercises",
    title: "Exercises",
    kind: "album",
    songs: [
      {
        id: "lyrics-exercises-1",
        href: "#lyrics-exercises-1",
        title: "Finna do?"
      },
      {
        id: "lyrics-exercises-2",
        href: "#lyrics-exercises-2",
        title: "Bliss"
      },
      {
        id: "lyrics-exercises-3",
        href: "#lyrics-exercises-3",
        title: "Help"
      },
      {
        id: "lyrics-exercises-4",
        href: "#lyrics-exercises-4",
        title: "Somethin' Special"
      },
      {
        id: "lyrics-exercises-5",
        href: "#lyrics-exercises-5",
        title: "Looking Glass"
      },
      {
        id: "lyrics-exercises-6",
        href: "#lyrics-exercises-6",
        title: "Birds Calling Out"
      }
    ]
  },
  {
    projectId: "melody",
    id: "lyrics-melody",
    href: "#lyrics-melody",
    title: "Melody",
    kind: "single",
    songs: [
      {
        id: "lyrics-melody",
        href: "#lyrics-melody",
        title: "Melody"
      }
    ]
  }
] as const satisfies readonly LyricCatalogRelease[];
