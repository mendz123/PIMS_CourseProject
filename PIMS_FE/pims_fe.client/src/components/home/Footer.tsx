import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="py-12 bg-slate-900 border-t border-slate-800">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/20 rounded-lg text-primary-light">
            <span className="material-symbols-outlined block">sync_alt</span>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-white">
            PIMS
          </span>
        </div>
        <div className="flex items-center gap-8 text-sm font-bold text-slate-400">
          <a className="hover:text-primary-light transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-primary-light transition-colors" href="#">
            Terms of Service
          </a>
          <a className="hover:text-primary-light transition-colors" href="#">
            Contact Support
          </a>
        </div>
        <p className="text-xs font-medium text-slate-400">
          © 2024 PIMS. All rights reserved. University of Advanced Studies.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
