import React from "react";
import Navbar from "../../components/home/Navbar";
import Hero from "../../components/home/Hero";
import Features from "../../components/home/Features";
import Timeline from "../../components/home/Timeline";
import News from "../../components/home/News";
import FAQ from "../../components/home/FAQ";
import Footer from "../../components/home/Footer";
import { useAuth } from "../../context/AuthContext";

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  console.log("Auth State:", { user, isAuthenticated });

  return (
    <div className="min-h-screen">
      <Navbar />
      {isAuthenticated && (
        <div className="bg-green-100 p-4 text-center text-green-800">
          Welcome back, {user?.fullName || user?.email}!
        </div>
      )}
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
