import dynamic from "next/dynamic";
import Intro from "./components/Intro";
import Footer from "./components/Footer";
import DeferredMount from "./components/scroll/DeferredMount";
import MusicShell from "./components/MusicShell";

const Music = dynamic(() => import("./components/Music"), {
  loading: () => <MusicShell />
});

const About = dynamic(() => import("./components/About"), {
  loading: () => (
    <section id="about" className="min-h-screen bg-black" aria-hidden="true" />
  )
});

const Lyrics = dynamic(() => import("./components/Lyrics"), {
  loading: () => (
    <section id="lyrics" className="min-h-[70vh] bg-black" aria-hidden="true" />
  )
});

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Intro />
      <Music />
      <DeferredMount
        id="about"
        minHeight="100vh"
        rootMargin="40% 0px"
        idleTimeoutMs={4000}
      >
        <About />
      </DeferredMount>
      <DeferredMount
        id="lyrics"
        minHeight="70vh"
        rootMargin="80% 0px"
        idleTimeoutMs={4500}
      >
        <Lyrics />
      </DeferredMount>
      <Footer />
    </main>
  );
}
