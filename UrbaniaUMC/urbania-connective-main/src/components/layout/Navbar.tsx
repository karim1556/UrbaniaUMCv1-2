import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Moon, Sun, User, Settings, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/authContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NavLinks = [
  { name: "Home", path: "/" },
  { name: "Events", path: "/events" },
  {
    name: "Services",
    path: "/services",
    children: [
      { name: "All Services", path: "/services" },
      { name: "Newcomer (Ansar)", path: "/services/newcomer" },
      { name: "Medical Clinic", path: "/services/medical" },
      { name: "Financial Aid", path: "/services/financial" },
      { name: "Social Services", path: "/services/social" },
      { name: "Nikah Services", path: "/services/nikah" },
      { name: "Funeral Support", path: "/services/funeral" },
      { name: "New Muslim Service", path: "/services/new-muslim" },
      { name: "Special Need Services", path: "/services/special-needs" },
      { name: "Matrimony Services", path: "/services/matrimony" },
      { name: "Facilities Services", path: "/services/facilities" },
    ],
  },
  {
    name: "Education",
    path: "/education",
    children: [
      { name: "All Programs", path: "/education" },
      { name: "Islamic Studies", path: "/education/islamic-studies" },
      { name: "Quran Memorization", path: "/education/quran-memorization" },
      { name: "Arabic Language", path: "/education/arabic-language" },
      { name: "Youth Leadership", path: "/education/youth-leadership" },
      { name: "New Muslims Course", path: "/education/new-muslims" },
      { name: "Children's Quran Club", path: "/education/children-quran-club" },
    ],
  },
  { name: "Volunteering", path: "/volunteering" },
  { name: "Donate", path: "/donate" },
  { name: "About Us", path: "/about" },
  { name: "Contact Us", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, getInitials } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    setExpandedMenus([]);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setExpandedMenus([]);
    }
  };

  const toggleExpandedMenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-lg shadow-sm py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary rounded-full w-10 h-10 flex items-center justify-center">
              <span className="arabic text-xl font-bold text-white">ع</span>
            </div>
            <span className="font-display text-xl font-semibold tracking-tight hidden md:inline-block">
              Urbania <span className="text-primary">Momin Community</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {NavLinks.map((link) => (
              <div key={link.name} className="relative group">
                {link.children ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "px-3 py-2 rounded-md text-sm font-medium flex items-center",
                          isActive(link.path)
                            ? "text-primary"
                            : "text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-colors"
                        )}
                      >
                        {link.name}
                        <ChevronDown className="ml-1 h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56 border border-border/30 shadow-lg">
                      {link.children.map((child) => (
                        <DropdownMenuItem key={child.name} asChild>
                          <Link
                            to={child.path}
                            className="w-full cursor-pointer hover:bg-primary/10"
                          >
                            {child.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    to={link.path}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(link.path)
                        ? "text-primary"
                        : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
                    )}
                  >
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* User Profile or Login Button */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                      <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(`${user.firstName} ${user.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center space-x-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(`${user.firstName} ${user.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center cursor-pointer">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" className="lg:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>

                <Link to="/login" className="hidden lg:block">
                  <Button variant="outline" className="font-medium">
                    Login
                  </Button>
                </Link>
              </>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="lg:hidden rounded-full"
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-opacity duration-300",
          isOpen 
            ? "opacity-100 pointer-events-auto" 
            : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      {/* Mobile Navigation Menu */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 lg:hidden bg-background/95 backdrop-blur-lg border-l border-border/20 shadow-2xl transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/20">
            <Link to="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center">
                <span className="arabic text-lg font-bold text-white">ع</span>
              </div>
              <span className="font-display text-lg font-semibold tracking-tight">
                Urbania <span className="text-primary">Momin Community</span>
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile Menu Content */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-1">
              {NavLinks.map((link) => (
                <div key={link.name}>
                  {link.children ? (
                    <div className="space-y-1">
                      <button
                        onClick={() => toggleExpandedMenu(link.name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-3 rounded-lg text-left font-medium transition-colors",
                          isActive(link.path)
                            ? "text-primary bg-primary/10"
                            : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
                        )}
                      >
                        {link.name}
                        <ChevronDown 
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            expandedMenus.includes(link.name) ? "rotate-180" : ""
                          )} 
                        />
                      </button>
                      <div 
                        className={cn(
                          "overflow-hidden transition-all duration-300 ease-in-out",
                          expandedMenus.includes(link.name) ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        )}
                      >
                        <div className="ml-4 border-l-2 border-border/30 pl-3 space-y-1">
                          {link.children.map((child) => (
                            <Link
                              key={child.name}
                              to={child.path}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "block px-3 py-2 rounded-lg text-sm transition-colors",
                                isActive(child.path)
                                  ? "text-primary font-medium bg-primary/10"
                                  : "text-foreground/70 hover:text-foreground hover:bg-accent/50"
                              )}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block px-3 py-3 rounded-lg font-medium transition-colors",
                        isActive(link.path)
                          ? "text-primary bg-primary/10"
                          : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
                      )}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* User Section */}
            {isAuthenticated && user ? (
              <div className="px-4 pt-6 mt-6 border-t border-border/20">
                <div className="flex items-center space-x-3 pb-4">
                  <Avatar className="h-12 w-12 border border-border">
                    <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(`${user.firstName} ${user.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-3 py-3 rounded-lg text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-3" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/profile" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-3 py-3 rounded-lg text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Link>
                  <Link 
                    to="/settings" 
                    onClick={() => setIsOpen(false)}
                    className="flex items-center px-3 py-3 rounded-lg text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }} 
                    className="flex items-center px-3 py-3 rounded-lg text-foreground/80 hover:text-foreground hover:bg-accent/50 transition-colors w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 pt-6 mt-6 border-t border-border/20">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full mb-3">Login</Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
