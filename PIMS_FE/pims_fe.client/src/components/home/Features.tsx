import React from "react";
import { FEATURES } from "../../constants/home";
import { motion } from "framer-motion";

const Features: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="py-24 bg-white border-t border-slate-100">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col gap-4 mb-20 max-w-[700px]"
        >
          <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-xs">
            System Overview
          </h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            Built to facilitate a seamless academic journey.
          </h3>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
        >
          {FEATURES.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              whileHover={{
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.08)",
                borderColor: "rgba(14, 115, 119, 0.3)", // primary color at 30%
              }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="p-10 rounded-[2.5rem] border border-slate-200/60 bg-white shadow-sm group cursor-default"
            >
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg shadow-slate-200/50 text-primary flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:rotate-6">
                <span className="material-symbols-outlined text-3xl">
                  {feature.icon}
                </span>
              </div>
              <h4 className="text-2xl font-bold mb-4 text-slate-900 group-hover:text-primary transition-colors">
                {feature.title}
              </h4>
              <p className="text-slate-500 leading-relaxed text-lg">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
