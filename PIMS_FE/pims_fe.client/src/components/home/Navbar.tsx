import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const roleBasedDashboard = () => {
    if (!isAuthenticated || !user?.role) return null;

    const role = user.role.toLowerCase();
    switch (role) {
      case "admin":
        return { name: "Admin Dashboard", href: "/admin/dashboard" };
      case "teacher":
        return { name: "Teacher Dashboard", href: "/teacher/dashboard" };
      case "student":
        return { name: "Student Dashboard", href: "/student/dashboard" };
      case "subject_head":
        return { name: "Subject Head Dashboard", href: "/subject-head/dashboard" };
      default:
        return { name: "Dashboard", href: "/dashboard" };
    }
  };

  const dashboardLink = roleBasedDashboard();

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "News", href: "#news" },
    { name: "FAQ", href: "#faq" },
    ...(dashboardLink ? [dashboardLink] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl">
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
          <h2 className="text-2xl font-black tracking-tighter text-white">
            PIMS
          </h2>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              className="px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
              href={link.href}
            >
              {link.name}
            </a>
          ))}
          <div className="ml-8">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">
                  Hello, {user?.fullName || user?.email}
                </span>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-2.5 rounded-2xl text-sm font-bold shadow-xl shadow-white/10 transition-all hover:-translate-y-0.5"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white border border-white/10"
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
                  if (isAuthenticated) {
                    logout();
                    navigate("/login");
                  } else {
                    navigate("/login");
                  }
                }}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold"
              >
                {isAuthenticated ? "Logout" : "Login"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
