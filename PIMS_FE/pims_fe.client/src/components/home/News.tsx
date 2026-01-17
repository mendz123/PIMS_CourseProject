import React from "react";
import { NEWS_ITEMS } from "../../constants/home";
import { motion } from "framer-motion";

const News: React.FC = () => {
  return (
    <section className="py-24 bg-white border-t border-slate-100" id="news">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div>
            <h2 className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-3">
              Announcements
            </h2>
            <h3 className="text-4xl font-black tracking-tight text-slate-900">
              Recent Updates
            </h3>
          </div>
          <button className="text-primary font-bold flex items-center gap-2 hover:translate-x-1 transition-transform group">
            View all news{" "}
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 gap-8">
          {NEWS_ITEMS.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                x: 10,
                borderColor: "rgba(14, 115, 119, 0.2)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
              }}
              className="group flex flex-col md:flex-row gap-8 p-8 rounded-[2rem] border border-slate-50 bg-white transition-colors cursor-pointer"
            >
              <div className="md:w-56 shrink-0">
                <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold tracking-tight">
                  {item.date}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold mb-3 text-slate-800 group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-slate-500 leading-relaxed mb-6 text-lg">
                  {item.description}
                </p>
                <button className="flex items-center gap-2 text-primary text-sm font-extrabold hover:underline">
                  {item.linkText}
                  <span className="material-symbols-outlined text-[18px]">
                    open_in_new
                  </span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default News;
