import React from "react";
import { TIMELINE_EVENTS } from "../../constants/home";
import { motion } from "framer-motion";

const Timeline: React.FC = () => {
  return (
    <div className="py-24 bg-white" id="timeline">
      <div className="max-w-[1200px] mx-auto px-6 text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-black mb-4"
        >
          Project Timeline
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#638788]"
        >
          Clear milestones to keep your project on the right track.
        </motion.p>
      </div>

      <div className="max-w-[900px] mx-auto px-6 relative">
        {/* Center Line */}
        <motion.div
          initial={{ height: 0 }}
          whileInView={{ height: "100%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
          className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-slate-200"
        ></motion.div>

        {TIMELINE_EVENTS.map((event, index) => (
          <div
            key={event.id}
            className={`relative mb-16 flex items-center justify-between w-full ${
              event.side === "left" ? "flex-row-reverse" : ""
            }`}
          >
            <div className="order-1 w-5/12"></div>

            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`z-20 flex items-center order-1 ${
                event.isActive
                  ? "bg-primary shadow-lg shadow-primary/20"
                  : "bg-slate-300"
              } w-10 h-10 rounded-full border-4 border-white transition-all`}
            >
              <span className="mx-auto text-white font-bold text-sm">
                {event.step}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: event.side === "left" ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="order-1 bg-white rounded-2xl shadow-sm border border-slate-100 w-5/12 px-6 py-6 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-lg text-slate-900">
                  {event.title}
                </h4>
                {event.status && (
                  <span
                    className={`px-2 py-1 rounded-md ${event.statusColor} text-[10px] font-bold uppercase tracking-wider`}
                  >
                    {event.status}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {event.description}
              </p>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
