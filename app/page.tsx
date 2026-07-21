import dynamic from "next/dynamic";
import Intro from "./components/Intro";
import Footer from "./components/Footer";
import DeferredMount from "./components/scroll/DeferredMount";

const Music = dynamic(() => import("./components/Music"), {
  loading: () => (
    <section id="music" className="min-h-[70vh] bg-black" aria-hidden="true" />
  )
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
      <DeferredMount
        id="music"
        minHeight="70vh"
        rootMargin="140% 0px"
        idleTimeoutMs={1800}
      >
        <Music />
      </DeferredMount>
      <DeferredMount
        id="about"
        minHeight="100vh"
        rootMargin="100% 0px"
        idleTimeoutMs={3200}
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
