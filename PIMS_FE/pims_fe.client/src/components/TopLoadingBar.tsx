import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useNavigationContext } from "../context/NavigationContext";
import "./TopLoadingBar.css";

const TopLoadingBar = () => {
  const { isNavigating, setNavigating } = useNavigationContext();
  const location = useLocation();

  useEffect(() => {
    // When route actually changes, stop loading after a short delay
    if (isNavigating && location.pathname) {
      // Wait a bit longer to ensure smooth transition
      const timer = setTimeout(() => {
        setNavigating(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isNavigating, setNavigating]);

  return <div className={`top-loading-bar ${isNavigating ? "active" : ""}`}></div>;
};

export default TopLoadingBar;

