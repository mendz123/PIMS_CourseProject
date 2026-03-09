import { useNavigate as useRouterNavigate } from "react-router-dom";
import { useNavigationContext } from "../context/NavigationContext";

export const useNavigateWithLoading = () => {
  const navigate = useRouterNavigate();
  const { setNavigating } = useNavigationContext();

  return (to: string | number, options?: any) => {
    // Show loading bar first
    setNavigating(true);
    
    // Delay navigation by 1 second
    setTimeout(() => {
      navigate(to as any, options);
    }, 1000);
  };
};

