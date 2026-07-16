import Header from "./components/Header";
import Hero from "./components/Hero";
import Music from "./components/Music";
import About from "./components/About";
import Next from "./components/Next";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <Hero />
      <Music />
      <About />
      <Next />
      <Footer />
    </main>
  );
}
