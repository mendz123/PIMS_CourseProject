import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Hero: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section id="home">
      <div className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 hero-pattern -z-10"></div>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10 text-xs font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-[16px]">
                  school
                </span>
                Academic Semester 2024
              </div>
              <h1 className="text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight text-slate-900">
                Streamline Your <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-slate-950">
                  Course Projects.
                </span>
              </h1>
              <p className="text-xl text-slate-500 max-w-[520px] leading-relaxed">
                A modern Project Information Management System designed for
                seamless collaboration, submission, and expert feedback.
              </p>
              <div className="flex flex-wrap gap-5">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  onClick={() => navigate("/login")}
                  className="bg-primary text-white px-10 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-primary/25 hover:bg-primary-dark"
                >
                  Get Started
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: "#f8fafc" }}
                  className="bg-white border-2 border-slate-100 px-10 py-4 rounded-2xl text-lg font-bold text-slate-700 transition-colors"
                >
                  View Syllabus
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-primary/10 rounded-[3rem] blur-3xl -z-10 opacity-30"></div>
              <div
                className="w-full aspect-[4/3] bg-gradient-to-br from-primary/10 to-transparent rounded-[2.5rem] overflow-hidden border border-white/40 shadow-2xl relative bg-cover bg-center group"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop")',
                }}
              >
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: [0, -10, 0], opacity: 1 }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white/50 flex items-center gap-4"
              >
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <span className="material-symbols-outlined font-bold">
                    check_circle
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">
                    LATEST UPDATE
                  </p>
                  <p className="font-bold text-slate-900">
                    Team Formation Open
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
