import { Outlet } from "react-router-dom";
import TopLoadingBar from "./TopLoadingBar";

const RouterWrapper = () => {
  return (
    <>
      <TopLoadingBar />
      <Outlet />
    </>
  );
};

export default RouterWrapper;


