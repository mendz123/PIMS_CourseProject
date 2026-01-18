import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface NavigationContextType {
  isNavigating: boolean;
  setNavigating: (value: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Intercept link clicks with delay
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href) {
        const href = link.getAttribute("href");
        // Only intercept if it's an internal link (starts with /)
        if (href && (href.startsWith("/") || href.startsWith(window.location.origin))) {
          // Don't intercept hash links or same page
          if (!href.startsWith("#") && href !== window.location.pathname) {
            e.preventDefault();
            setIsNavigating(true);
            
            // Delay navigation by 1 second
            setTimeout(() => {
              window.location.href = href;
            }, 1000);
          }
        }
      }
    };

    // Listen for popstate (back/forward button)
    const handlePopState = () => {
      setIsNavigating(true);
    };

    document.addEventListener("click", handleLinkClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <NavigationContext.Provider
      value={{ isNavigating, setNavigating: setIsNavigating }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      "useNavigationContext must be used within NavigationProvider"
    );
  }
  return context;
};

