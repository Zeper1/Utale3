import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { BookOpen, Menu } from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";

const Header = () => {
  const [_, setLocation] = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<"login" | "signup">("login");
  const { user, signOut } = useAuth();

  const handleLogin = () => {
    setAuthModalView("login");
    setIsAuthModalOpen(true);
  };

  const handleSignup = () => {
    setAuthModalView("signup");
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLoginClick = () => {
    if (user) {
      signOut();
    } else {
      handleLogin();
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="text-primary text-2xl">
            <BookOpen />
          </div>
          <h1 className="text-xl font-bold font-heading text-primary">StoryMagic</h1>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <nav>
            <ul className="flex gap-6 items-center">
              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("book-showcase")}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Examples
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Pricing
                </button>
              </li>
              {user && (
                <li>
                  <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleLoginClick}
              className="text-primary hover:text-primary/90"
            >
              {user ? "Logout" : "Login"}
            </Button>
            {!user && (
              <Button onClick={handleSignup} className="rounded-full">
                Get Started
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className="text-lg font-medium py-2">Home</Link>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="text-left text-lg font-medium py-2"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection("book-showcase")}
                className="text-left text-lg font-medium py-2"
              >
                Examples
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-left text-lg font-medium py-2"
              >
                Pricing
              </button>
              {user && (
                <Link href="/dashboard" className="text-lg font-medium py-2">
                  Dashboard
                </Link>
              )}
              <div className="border-t border-gray-100 mt-2 pt-4">
                {user ? (
                  <Button onClick={signOut} variant="ghost" className="text-lg font-medium w-full justify-start pl-0">
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleLogin} 
                      variant="ghost" 
                      className="text-lg font-medium w-full justify-start pl-0"
                    >
                      Login
                    </Button>
                    <Button 
                      onClick={handleSignup} 
                      className="w-full mt-2 rounded-full"
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
        view={authModalView} 
        setView={setAuthModalView} 
      />
    </header>
  );
};

export default Header;
