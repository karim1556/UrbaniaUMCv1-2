
import React, { useState, useEffect } from "react";
import { Toaster } from "sonner";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);

    // Intersection Observer for fade-in sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("appear");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".section-fade-in").forEach((section) => {
      observer.observe(section);
    });

    return () => {
      document.querySelectorAll(".section-fade-in").forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  // Submit watchdog removed - it was causing false error toasts when API calls
  // take longer than 10 seconds (e.g., when sending emails). The actual API
  // error handling should be done in individual form components.

  return (
    <div className={`min-h-screen flex flex-col ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default MainLayout;
