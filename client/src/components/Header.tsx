import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  BookOpen, 
  Menu, 
  User, 
  LogOut, 
  Settings, 
  CreditCard, 
  ChevronDown, 
  BellRing, 
  LayoutDashboard, 
  Star,
  Sparkles,
  Heart,
  BookMarked,
  Brush,
  Wand2,
  Crown,
  Baby,
  BookCopy
} from "lucide-react";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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

  // Función para obtener las iniciales del nombre del usuario
  const getUserInitials = () => {
    if (!user || !user.displayName) return "U";
    return user.displayName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-white shadow-xl sticky top-0 z-50 bg-opacity-95 backdrop-blur-sm">
      <div className="border-b-4 border-primary-300">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-primary animate-float bg-white rounded-full p-2 shadow-lg border-4 border-primary-200 group-hover:scale-110 transition-transform">
              <img src="/images/utale-logo.png" alt="Utale Logo" className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Utale
              <span className="inline-block ml-1 rotate-12 text-accent animate-wiggle">
                <Sparkles className="h-5 w-5" />
              </span>
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav>
              <ul className="flex gap-6 items-center">
                <li className="tooltip-wrapper" data-tooltip="Aprende cómo funciona Utale">
                  <button
                    onClick={() => scrollToSection("how-it-works")}
                    className="text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-1"
                  >
                    <Wand2 className="h-4 w-4" />
                    Cómo Funciona
                  </button>
                </li>
                <li className="tooltip-wrapper" data-tooltip="Explora libros de ejemplo">
                  <button
                    onClick={() => scrollToSection("book-showcase")}
                    className="text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-1"
                  >
                    <BookCopy className="h-4 w-4" />
                    Ejemplos
                  </button>
                </li>
                <li className="tooltip-wrapper" data-tooltip="Descubre nuestros planes">
                  <button
                    onClick={() => scrollToSection("pricing")}
                    className="text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-1"
                  >
                    <Crown className="h-4 w-4" />
                    Precios
                  </button>
                </li>
                {user && (
                  <li className="tooltip-wrapper" data-tooltip="Accede a tu panel">
                    <Link 
                      href="/dashboard" 
                      className="text-gray-700 hover:text-primary transition-colors font-medium flex items-center gap-1"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Panel
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
            
            {/* Desktop: User section */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center">
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 p-0 overflow-hidden rounded-full bg-primary-100 hover:bg-primary-200 transition-colors">
                        <Avatar className="h-9 w-9 avatar-glow avatar-glow-border">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 rounded-xl border-2 border-primary-200 shadow-xl p-2 bg-white" align="end" forceMount>
                      <DropdownMenuLabel className="px-3 py-2 rounded-lg bg-primary-50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 avatar-glow avatar-glow-border">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-bold">{user.displayName || user.username || "Usuario"}</p>
                            <p className="text-xs text-gray-500">
                              {user.email || "usuario@ejemplo.com"}
                            </p>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuGroup>
                        <Link href="/profile">
                          <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center p-2 hover:bg-primary-50 transition-colors">
                            <User className="mr-2 h-5 w-5 text-accent" />
                            <span>Mi perfil</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/notifications">
                          <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center p-2 hover:bg-primary-50 transition-colors">
                            <BellRing className="mr-2 h-5 w-5 text-blue-400" />
                            <span>Notificaciones</span>
                            <Badge className="ml-auto bg-primary text-white text-xs py-1">2</Badge>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/subscription">
                          <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center p-2 hover:bg-primary-50 transition-colors">
                            <CreditCard className="mr-2 h-5 w-5 text-indigo-500" />
                            <span>Suscripción</span>
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator className="my-2" />
                      <Link href="/settings">
                        <DropdownMenuItem className="rounded-lg cursor-pointer flex items-center p-2 hover:bg-primary-50 transition-colors">
                          <Settings className="mr-2 h-5 w-5 text-gray-500" />
                          <span>Configuración</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem 
                        onClick={signOut} 
                        className="rounded-lg cursor-pointer flex items-center p-2 hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        <span>Cerrar sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleLogin}
                    className="text-primary hover:text-primary/90 font-bold hover:bg-primary-50 transition-all"
                  >
                    Iniciar Sesión
                  </Button>
                  <Button onClick={handleSignup} className="kids-button bg-gradient-to-r from-primary to-accent text-white shadow-lg">
                    <Heart className="h-4 w-4 mr-2 animate-pulse-soft" /> Comenzar
                  </Button>
                </>
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
              <div className="flex items-center gap-2 mb-6">
                <img src="/images/utale-logo.png" alt="Utale Logo" className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold text-primary">Utale</h2>
              </div>
              
              {user && (
                <div className="bg-accent/10 rounded-lg p-4 mb-4 flex items-center gap-3">
                  <Avatar className="h-10 w-10 avatar-glow-border">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.displayName || user.username || "Usuario"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              )}
              
              <nav className="flex flex-col gap-1">
                <Link href="/" className="text-base font-medium py-2 px-2 rounded-md hover:bg-muted transition-colors">
                  Inicio
                </Link>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="text-left text-base font-medium py-2 px-2 rounded-md hover:bg-muted transition-colors"
                >
                  Cómo Funciona
                </button>
                <button
                  onClick={() => scrollToSection("book-showcase")}
                  className="text-left text-base font-medium py-2 px-2 rounded-md hover:bg-muted transition-colors"
                >
                  Ejemplos
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-left text-base font-medium py-2 px-2 rounded-md hover:bg-muted transition-colors"
                >
                  Precios
                </button>
                
                {user && (
                  <>
                    <div className="h-px bg-gray-100 my-2"></div>
                    
                    <Link 
                      href="/dashboard" 
                      className="text-base font-medium py-2 px-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Panel de control
                    </Link>
                    
                    <Link 
                      href="/dashboard?tab=profiles" 
                      className="text-base font-medium py-2 px-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <User className="h-4 w-4" />
                      Perfiles infantiles
                    </Link>
                    
                    <Link 
                      href="/dashboard?tab=books" 
                      className="text-base font-medium py-2 px-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Mis libros
                    </Link>
                    
                    <Link 
                      href="/subscription" 
                      className="text-base font-medium py-2 px-2 rounded-md hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Mi suscripción
                    </Link>
                  </>
                )}
                
                <div className="h-px bg-gray-100 my-2"></div>
                
                {user ? (
                  <Button 
                    onClick={signOut} 
                    variant="ghost" 
                    className="text-base font-medium justify-start pl-2"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleLogin} 
                      variant="ghost" 
                      className="text-base font-medium justify-start pl-2"
                    >
                      Iniciar Sesión
                    </Button>
                    <Button 
                      onClick={handleSignup} 
                      className="w-full mt-2 kids-button bg-gradient-to-r from-primary to-accent text-white"
                    >
                      Comenzar
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
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