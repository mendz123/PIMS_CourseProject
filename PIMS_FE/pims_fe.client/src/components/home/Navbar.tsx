import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "News", href: "#news" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100/50 bg-white/70 backdrop-blur-xl">
      <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined block text-2xl">
              sync_alt
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-slate-900">
            PIMS
          </h2>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              className="px-5 py-2 text-sm font-semibold text-slate-500 hover:text-primary hover:bg-white rounded-full transition-all"
              href={link.href}
            >
              {link.name}
            </a>
          ))}
          <div className="ml-8">
            <button
              onClick={() => navigate("/login")}
              className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-2.5 rounded-2xl text-sm font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5"
            >
              Login
            </button>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-900 border border-slate-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="material-symbols-outlined">
            {isMenuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 py-6 overflow-hidden"
          >
            <div className="flex flex-col gap-4 px-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-bold text-slate-800 hover:text-primary py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-slate-50 my-2" />
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate("/login");
                }}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold"
              >
                Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
