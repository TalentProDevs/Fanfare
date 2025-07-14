"use client";
import SingleChatThread from "@/features/Chat/Components/SingleChatThread";
import { setActiveMenu } from "@/features/Navbar/activeMenuSlice";
import Navbar from "@/features/Navbar/Components/Navbar";
import LeftSidebar from "@/features/Sidebar/Components/LeftSidebar";
import RightSidebar from "@/features/Sidebar/Components/RightSidebar";
import { RootState } from "@/store/store";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("MainLayout",process.env.PUBLIC_KEY);
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isSettingMenuByForce = useSelector((state:RootState)=>state.menu.isSettingMenuByForce)
  //active menu set
  useEffect(() => {
    // Check for saved theme in local storage or default to light mode
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.classList.add(savedTheme);
    }
  }, []);

  // If the pathname is /login, /signup, or /forgot-password,
  // the main layout will not be rendered; only the children will be displayed.
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/account" ||
    pathname.includes("/post") ||
    pathname.includes("/timeline") ||
    pathname === "/menu"||
    pathname === "/search"
    // pathname.includes("/share-video")
  ) {
    if (pathname.includes("/timeline") && !isSettingMenuByForce) dispatch(setActiveMenu("isTimeline"));

    return <>   {children}</>
  }
  if (pathname === "/video") {
    dispatch(setActiveMenu("isVideo"));
    return (
      <div className="bg-[#F8F8F8] dark:bg-[#202124]  min-h-screen w-full ">
        <Navbar />
        <div
          className="laptop:w-[1140px]  tab-lg:w-[796px] justify-between tab-md:w-[556px] tab-sm:w-[500px] w-full
      flex mx-auto  pt-[20px]"
        > 
          <LeftSidebar />
          <main className="flex flex-col w-full tab-md:max-w-[556px] tab-lg:max-w-[556px] laptop:max-w-[900px]">
            {children}
          </main>
        </div>
      </div>
    );
  }

  if (pathname === "/game") {
    dispatch(setActiveMenu("isGame"));
  } else if (pathname === "/") {
    dispatch(setActiveMenu("isFeed"));
  }
  // For all other paths, the main layout with Navbar, LeftSidebar, and RightSidebar will be shared
  return (
    <div className="bg-[#F8F8F8] dark:bg-[#202124]  min-h-screen w-full select-none">
      <Navbar />
      <div
        className="laptop:w-[1140px]  tab-lg:w-[796px] justify-between tab-md:w-[556px] tab-sm:w-[500px] w-full
      flex mx-auto  pt-[20px]"
      >
        
        <LeftSidebar />
        <main className="flex flex-col w-full tab-md:max-w-[556px]">
          {children}
        </main>
        <RightSidebar />
      </div>
    </div>
  );
}
