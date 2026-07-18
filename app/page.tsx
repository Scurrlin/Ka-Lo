import Intro from "./components/Intro";
import Music from "./components/Music";
import About from "./components/About";
import Lyrics from "./components/Lyrics";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Intro />
      <Music />
      <About />
      <Lyrics />
      <Footer />
    </main>
  );
}
