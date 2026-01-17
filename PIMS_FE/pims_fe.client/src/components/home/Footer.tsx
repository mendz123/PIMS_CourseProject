import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="py-12 bg-white border-t border-[#dce5e5]">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/20 rounded-lg text-primary">
            <span className="material-symbols-outlined block">sync_alt</span>
          </div>
          <span className="text-lg font-extrabold tracking-tight text-primary dark:text-white">
            PIMS
          </span>
        </div>
        <div className="flex items-center gap-8 text-sm font-medium text-[#638788] dark:text-gray-400">
          <a className="hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Terms of Service
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Contact Support
          </a>
        </div>
        <p className="text-xs text-[#638788] dark:text-gray-500">
          © 2024 PIMS. All rights reserved. University of Advanced Studies.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
