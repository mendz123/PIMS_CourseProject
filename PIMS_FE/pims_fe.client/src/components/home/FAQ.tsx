import React, { useState } from "react";
import { FAQ_ITEMS } from "../../constants/home";
import { motion, AnimatePresence } from "framer-motion";

const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-100" id="faq">
      <div className="max-w-[800px] mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-3xl font-black mb-12 text-center text-slate-900"
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => toggleFAQ(item.id)}
              className={`border bg-white rounded-2xl p-6 transition-all cursor-pointer group hover:shadow-sm ${
                openId === item.id
                  ? "border-primary/30 ring-1 ring-primary/10 shadow-md"
                  : "border-slate-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4
                  className={`font-bold transition-colors ${
                    openId === item.id ? "text-primary" : "text-slate-800"
                  }`}
                >
                  {item.question}
                </h4>
                <motion.div
                  animate={{ rotate: openId === item.id ? 180 : 0 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    openId === item.id
                      ? "bg-primary/10 text-primary"
                      : "bg-slate-50 text-slate-400"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    expand_more
                  </span>
                </motion.div>
              </div>

              <AnimatePresence>
                {openId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="text-slate-500 text-sm leading-relaxed pb-2">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
