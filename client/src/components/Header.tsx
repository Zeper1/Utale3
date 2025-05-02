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
              <svg width="32" height="32" viewBox="0 0 500 500" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M108.5,73.3c-12.9,2.5-31.9,9.7-41.4,15.7c-17.1,10.9-30.3,31.1-37.6,57.5c-2.6,9.5-5.6,26.9-7.1,41.1
                  c-2.3,21.7-2.3,156.1,0,177.8c1.5,14.2,4.4,31.1,7.1,41.3c7.7,28.3,21.7,49.4,40.3,59.9c9.4,5.3,28.3,12.5,40.7,15.4
                  c4.5,1.1,10.2,2.3,12.7,2.7c7.3,1.2,212.3,1.2,219.6,0c2.5-0.4,8.2-1.6,12.7-2.7c12.4-2.9,31.3-10.1,40.7-15.4
                  c18.6-10.5,32.6-31.6,40.3-59.9c2.7-10.2,5.6-27.1,7.1-41.3c2.3-21.7,2.3-156.1,0-177.8c-1.5-14.2-4.5-31.6-7.1-41.1
                  c-7.3-26.4-20.5-46.6-37.6-57.5c-9.5-6-28.5-13.2-41.4-15.7c-8.8-1.7-13.9-1.8-103.5-2C128.4,71.6,115.5,71.8,108.5,73.3z
                  M290.2,120.8c8.7,3,19.6,14.4,26.3,27.3c2.3,4.4,6.4,15.9,9.2,25.4c9.1,31.1,10.3,39.7,10.3,76.5c0,33.8-0.8,41.9-5.6,60
                  c-2.9,10.8-6.7,21.2-12.4,33.5c-10.5,22.8-19.9,35.7-29.9,41.1l-5.3,2.9l-31.6,0.3l-31.7,0.3l-0.3-131l-0.2-131l37.7,0.4
                  C284.2,126.9,285.5,119.3,290.2,120.8z M173.1,126.9l0.1,4.9l0.1,126.7l0.1,126.8l-33.9-0.4l-33.9-0.4l-5-2.8
                  c-10.5-5.7-19.9-18.6-30.6-42.1c-5.4-11.7-8.7-20.8-11.6-31.5c-4.7-17.7-5.5-25.9-5.5-59c0-35.2,1.1-43.8,9.7-74
                  c2.5-8.8,6.7-20.5,9.2-25.7c6.4-13.5,16.7-24.7,25.3-27.6c4.6-1.5,6.3-1.5,40.5-1.3l35.6,0.2L173.1,126.9z"/>
                <path d="M175.5,379.2c-2.5,0.5-5.5,2.1-7.5,3.9c-3.3,3-3.8,4.2-5.8,15.1c-1.2,6.7-3.1,14.9-4.2,18.3c-1.7,5.3-1.8,7.1-0.8,11.5
                  c1.3,5.7,5.5,11.4,9.9,13.4c3.1,1.4,8.9,1.6,54,1.6c48.4,0,50.8-0.1,54.7-2c8.1-4,11.2-9.3,11.2-19.5c0-6-0.5-8.4-3.1-13.7
                  c-1.7-3.6-4-7.8-5.2-9.3c-3.2-4.2-9.5-8.9-14.9-11c-4.5-1.8-8.1-1.9-44-2.1C189.2,378.1,177.8,378.7,175.5,379.2z M267,394.5
                  c0,0.8-8.5,10.7-11.4,13.3c-10,8.7-24.5,13-43.1,12.7c-15.5-0.3-24.5-2.8-34.5-9.6c-6.2-4.1-15-13.4-15-15.7
                  C163,393.6,267,392.9,267,394.5z"/>
                <path d="M222.5,116.3c-0.4,1.6-1.7,20.9-3,42.9c-3.1,52.5-3.2,55.2-1,61.8c4.7,14.4,22.3,26.7,40.5,28.4
                  c3.9,0.4,13.8-0.3,17.3-1.2c1.4-0.4,1.6-1.7,1.4-10.2l-0.2-9.8l-6.5-0.6c-13.8-1.2-23-8.4-23-18.1c0-5.1,1.4-8.9,5.2-13.9
                  c9.2-12.3,14-29.8,18.2-67.1c0.6-5.5,1.5-12.4,2-15.4c0.5-3,0.7-6.2,0.5-7.1c-0.4-1.5-3.4-1.6-25.7-1.6
                  C227.6,114,223.3,114.2,222.5,116.3z"/>
              </svg>
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
                <svg width="24" height="24" viewBox="0 0 500 500" fill="currentColor" className="text-primary" xmlns="http://www.w3.org/2000/svg">
                  <path d="M108.5,73.3c-12.9,2.5-31.9,9.7-41.4,15.7c-17.1,10.9-30.3,31.1-37.6,57.5c-2.6,9.5-5.6,26.9-7.1,41.1
                    c-2.3,21.7-2.3,156.1,0,177.8c1.5,14.2,4.4,31.1,7.1,41.3c7.7,28.3,21.7,49.4,40.3,59.9c9.4,5.3,28.3,12.5,40.7,15.4
                    c4.5,1.1,10.2,2.3,12.7,2.7c7.3,1.2,212.3,1.2,219.6,0c2.5-0.4,8.2-1.6,12.7-2.7c12.4-2.9,31.3-10.1,40.7-15.4
                    c18.6-10.5,32.6-31.6,40.3-59.9c2.7-10.2,5.6-27.1,7.1-41.3c2.3-21.7,2.3-156.1,0-177.8c-1.5-14.2-4.5-31.6-7.1-41.1
                    c-7.3-26.4-20.5-46.6-37.6-57.5c-9.5-6-28.5-13.2-41.4-15.7c-8.8-1.7-13.9-1.8-103.5-2C128.4,71.6,115.5,71.8,108.5,73.3z
                    M290.2,120.8c8.7,3,19.6,14.4,26.3,27.3c2.3,4.4,6.4,15.9,9.2,25.4c9.1,31.1,10.3,39.7,10.3,76.5c0,33.8-0.8,41.9-5.6,60
                    c-2.9,10.8-6.7,21.2-12.4,33.5c-10.5,22.8-19.9,35.7-29.9,41.1l-5.3,2.9l-31.6,0.3l-31.7,0.3l-0.3-131l-0.2-131l37.7,0.4
                    C284.2,126.9,285.5,119.3,290.2,120.8z M173.1,126.9l0.1,4.9l0.1,126.7l0.1,126.8l-33.9-0.4l-33.9-0.4l-5-2.8
                    c-10.5-5.7-19.9-18.6-30.6-42.1c-5.4-11.7-8.7-20.8-11.6-31.5c-4.7-17.7-5.5-25.9-5.5-59c0-35.2,1.1-43.8,9.7-74
                    c2.5-8.8,6.7-20.5,9.2-25.7c6.4-13.5,16.7-24.7,25.3-27.6c4.6-1.5,6.3-1.5,40.5-1.3l35.6,0.2L173.1,126.9z"/>
                  <path d="M175.5,379.2c-2.5,0.5-5.5,2.1-7.5,3.9c-3.3,3-3.8,4.2-5.8,15.1c-1.2,6.7-3.1,14.9-4.2,18.3c-1.7,5.3-1.8,7.1-0.8,11.5
                    c1.3,5.7,5.5,11.4,9.9,13.4c3.1,1.4,8.9,1.6,54,1.6c48.4,0,50.8-0.1,54.7-2c8.1-4,11.2-9.3,11.2-19.5c0-6-0.5-8.4-3.1-13.7
                    c-1.7-3.6-4-7.8-5.2-9.3c-3.2-4.2-9.5-8.9-14.9-11c-4.5-1.8-8.1-1.9-44-2.1C189.2,378.1,177.8,378.7,175.5,379.2z M267,394.5
                    c0,0.8-8.5,10.7-11.4,13.3c-10,8.7-24.5,13-43.1,12.7c-15.5-0.3-24.5-2.8-34.5-9.6c-6.2-4.1-15-13.4-15-15.7
                    C163,393.6,267,392.9,267,394.5z"/>
                  <path d="M222.5,116.3c-0.4,1.6-1.7,20.9-3,42.9c-3.1,52.5-3.2,55.2-1,61.8c4.7,14.4,22.3,26.7,40.5,28.4
                    c3.9,0.4,13.8-0.3,17.3-1.2c1.4-0.4,1.6-1.7,1.4-10.2l-0.2-9.8l-6.5-0.6c-13.8-1.2-23-8.4-23-18.1c0-5.1,1.4-8.9,5.2-13.9
                    c9.2-12.3,14-29.8,18.2-67.1c0.6-5.5,1.5-12.4,2-15.4c0.5-3,0.7-6.2,0.5-7.1c-0.4-1.5-3.4-1.6-25.7-1.6
                    C227.6,114,223.3,114.2,222.5,116.3z"/>
                </svg>
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