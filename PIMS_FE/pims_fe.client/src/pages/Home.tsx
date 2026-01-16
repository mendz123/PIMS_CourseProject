import React from "react";
import Navbar from "../components/home/Navbar";
import Hero from "../components/home/Hero";
import Features from "../components/home/Features";
import Timeline from "../components/home/Timeline";
import News from "../components/home/News";
import FAQ from "../components/home/FAQ";
import Footer from "../components/home/Footer";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Timeline />
        <News />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
