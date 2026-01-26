
import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
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

  // Submit watchdog: if a form submit disables a button and it remains disabled
  // for too long (e.g., network hiccup or navigation race), re-enable it and
  // notify the user so the UI doesn't appear permanently stuck.
  useEffect(() => {
    let timers: Array<number> = [];

    function submitHandler(e: Event) {
      // schedule a check in 10 seconds
      const t = window.setTimeout(() => {
        try {
          const disabledButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('button:disabled'));
          const stuckButtons = disabledButtons.filter(btn => /submitting|creating|processing|deleting|saving/i.test(btn.innerText));
          if (stuckButtons.length > 0) {
            stuckButtons.forEach(btn => {
              btn.disabled = false;
            });
            console.warn('Submit watchdog re-enabled', stuckButtons.length, 'button(s)');
            toast.error('Action may have completed — buttons re-enabled. Check your dashboard or refresh.');
          }
        } catch (err) {
          // ignore
        }
      }, 10000);
      timers.push(t);
    }

    document.addEventListener('submit', submitHandler, true);

    return () => {
      document.removeEventListener('submit', submitHandler, true);
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

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
