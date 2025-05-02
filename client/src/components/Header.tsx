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
              <svg width="32" height="32" viewBox="0 0 496 496" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M337.911560,394.646240 
                  C349.984589,394.480713 360.972290,392.723907 370.635315,385.356537 
                  C378.232819,379.563965 381.349854,372.289001 381.758972,362.930206 
                  C382.489868,346.211578 383.750092,329.489075 385.105499,312.833771 
                  C386.153259,299.958496 385.955048,286.916473 387.929138,274.234039 
                  C390.694366,256.469269 389.134674,238.445679 392.458557,220.775864 
                  C393.619751,214.602905 393.085693,208.159256 393.241608,201.897751 
                  C393.490509,191.902069 394.928009,182.076782 395.725739,172.174744 
                  C396.642700,160.793030 396.030212,149.344574 398.325775,137.990692 
                  C399.790955,130.744110 399.463348,123.035751 399.370850,115.654259 
                  C399.172943,99.860336 406.860107,90.102402 420.151337,83.479179 
                  C432.710144,77.220932 446.049042,74.504799 460.012024,74.676468 
                  C463.042328,74.713722 467.122559,73.870613 468.032623,77.732071 
                  C469.046539,82.034149 469.126862,86.762146 464.494324,89.780937 
                  C457.635376,94.250572 452.740387,100.309631 449.085419,107.672089 
                  C446.322601,113.237396 446.981018,119.308479 445.727295,125.060890 
                  C444.205444,132.043625 444.636444,139.600769 444.551392,146.866364 
                  C444.393768,160.333237 441.447540,173.581909 441.647461,186.955505 
                  C441.807526,197.663544 439.616638,208.048035 439.180847,218.654633 
                  C438.516418,234.825897 436.411163,250.934692 435.595703,267.104218 
                  C435.102478,276.883301 434.310028,286.609955 433.570618,296.359436 
                  C432.794067,306.598389 433.101715,317.062164 431.963867,327.187592 
                  C430.441437,340.735870 430.863159,354.425018 428.884979,367.759918 
                  C427.469238,377.303284 427.826599,387.039001 424.807922,396.583099 
                  C421.016693,408.569641 412.692261,414.788940 402.268372,419.426147 
                  C390.443665,424.686554 377.919678,426.481323 365.036896,426.405487 
                  C348.040527,426.305450 331.000153,425.645844 314.059906,426.627899 
                  C300.818298,427.395538 286.930267,427.551147 275.586639,436.270935 
                  C271.028625,439.774689 266.289886,443.135010 262.815918,447.974152 
                  C258.037598,454.630219 244.285461,454.256409 238.855347,447.796539 
                  C229.431763,436.585968 217.830048,430.048401 202.822388,428.100220 
                  C179.050705,425.014404 155.289520,427.416901 131.560684,426.335114 
                  C116.518654,425.649353 102.189430,422.390778 89.363579,413.803741 
                  C81.281662,408.392853 77.146103,400.384430 75.893990,391.549072 
                  C73.316673,373.362640 73.219627,354.846771 71.178139,336.650513 
                  C69.238693,319.363678 70.648087,301.867279 66.910728,284.735413 
                  C65.436203,277.976318 66.375549,270.824890 66.092476,263.871552 
                  C65.721008,254.747070 64.177826,245.800293 63.606632,236.735397 
                  C62.889439,225.353653 63.501026,213.904648 60.918179,202.604706 
                  C59.524452,196.507141 60.159180,189.985199 60.103851,183.752014 
                  C60.013489,173.571350 57.255165,163.701355 57.662315,153.563828 
                  C58.036728,144.241394 56.995335,134.950195 56.413704,125.699226 
                  C55.507015,111.278275 51.078308,98.082741 37.680199,89.762878 
                  C33.842400,87.379700 32.318031,81.302589 33.877728,77.358574 
                  C34.771072,75.099579 36.973911,74.828033 38.837299,74.763496 
                  C58.784607,74.072586 77.462479,78.230377 93.176170,91.119476 
                  C98.890030,95.806267 102.118172,102.673271 102.318764,110.389191 
                  C102.788406,128.453873 105.663635,146.374695 105.999985,164.395615 
                  C106.208450,175.564362 108.215286,186.482574 108.544594,197.620956 
                  C109.062881,215.151138 111.478554,232.625427 111.991241,250.155533 
                  C112.278618,259.981567 113.749947,269.625153 114.469254,279.366028 
                  C115.284180,290.401794 114.444839,301.532349 117.088539,312.505768 
                  C118.547966,318.563538 117.926506,325.124390 117.952118,331.349030 
                  C117.996109,342.040802 120.683762,352.452789 120.316673,363.081818 
                  C119.781715,378.571228 130.603760,386.460724 141.337357,391.089417 
                  C148.400330,394.135162 156.036743,394.636627 163.667709,394.643097 
                  C176.998672,394.654388 190.336044,394.390472 203.658646,394.724182 
                  C215.292694,395.015625 226.550659,397.396790 237.155624,402.514130 
                  C242.008606,404.855927 245.367828,408.673920 248.340485,412.885651 
                  C250.090546,415.365112 251.605713,415.635956 253.286255,413.155518 
                  C260.470673,402.551422 271.290466,398.948517 283.199097,396.548492 
                  C301.232635,392.914093 319.366669,395.561798 337.911560,394.646240 
                z"/>
                <path d="M205.960739,104.048721 
                  C196.441910,95.328430 185.613144,91.284904 173.005371,90.202202 
                  C153.438721,88.521904 133.621613,87.274368 115.508705,78.354088 
                  C112.376045,76.811295 108.597832,75.544228 108.679558,70.830765 
                  C108.725189,68.199440 109.734947,66.718475 112.481499,66.696854 
                  C113.981178,66.685043 115.480782,66.651466 116.980423,66.651299 
                  C146.145386,66.648117 175.310349,66.644455 204.475311,66.649849 
                  C217.060776,66.652176 228.745956,69.793945 239.347855,76.696442 
                  C242.331573,78.639030 244.421280,81.421974 246.643570,84.127312 
                  C250.053314,88.278206 252.250259,88.464127 255.327530,84.313934 
                  C264.971558,71.307503 279.093445,67.269875 293.841034,66.890388 
                  C324.818695,66.093285 355.831207,66.630974 386.829315,66.690765 
                  C389.142578,66.695221 392.195404,65.690025 393.122528,69.122002 
                  C393.940247,72.148994 392.896515,74.389603 390.088196,76.247452 
                  C382.728210,81.116447 374.481567,83.503990 366.036804,85.288994 
                  C350.464874,88.580505 334.493378,89.099579 318.847717,91.640282 
                  C308.612183,93.302429 299.877289,99.151184 292.974976,107.308929 
                  C283.595673,118.394165 280.505066,131.621964 278.008514,145.561935 
                  C275.986816,156.850479 276.330109,168.349487 273.655701,179.514160 
                  C272.699341,183.506470 272.277863,187.761642 272.441467,191.863754 
                  C273.093292,208.205338 270.442047,224.369827 268.867889,240.472870 
                  C266.931946,260.276794 266.459961,280.156555 264.347534,299.925415 
                  C262.324493,318.858002 259.908234,337.758789 259.226013,356.822632 
                  C259.091400,360.583984 258.229980,364.417297 257.068268,368.012085 
                  C256.184479,370.746857 254.807266,373.484467 250.861664,373.414337 
                  C246.886993,373.343597 245.544128,370.488037 244.917709,367.750732 
                  C242.959702,359.194885 241.698990,350.460510 241.724182,341.679016 
                  C241.762878,328.188721 238.474686,315.065521 237.829803,301.655701 
                  C237.400330,292.725433 235.803757,283.824310 235.780045,274.907349 
                  C235.736267,258.437439 232.300430,242.268967 231.945786,225.894318 
                  C231.739975,216.392105 229.189545,207.211014 229.536972,197.653564 
                  C230.001648,184.870941 226.958450,172.325912 225.829285,159.634125 
                  C224.953384,149.789139 223.357330,140.051895 220.866150,130.395889 
                  C218.245621,120.238441 213.155136,111.840347 205.960739,104.048721 
                z"/>
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
                <svg width="24" height="24" viewBox="0 0 496 496" fill="currentColor" className="text-primary" xmlns="http://www.w3.org/2000/svg">
                  <path d="M337.911560,394.646240 
                    C349.984589,394.480713 360.972290,392.723907 370.635315,385.356537 
                    C378.232819,379.563965 381.349854,372.289001 381.758972,362.930206 
                    C382.489868,346.211578 383.750092,329.489075 385.105499,312.833771 
                    C386.153259,299.958496 385.955048,286.916473 387.929138,274.234039 
                    C390.694366,256.469269 389.134674,238.445679 392.458557,220.775864 
                    C393.619751,214.602905 393.085693,208.159256 393.241608,201.897751 
                    C393.490509,191.902069 394.928009,182.076782 395.725739,172.174744 
                    C396.642700,160.793030 396.030212,149.344574 398.325775,137.990692 
                    C399.790955,130.744110 399.463348,123.035751 399.370850,115.654259 
                    C399.172943,99.860336 406.860107,90.102402 420.151337,83.479179 
                    C432.710144,77.220932 446.049042,74.504799 460.012024,74.676468 
                    C463.042328,74.713722 467.122559,73.870613 468.032623,77.732071 
                    C469.046539,82.034149 469.126862,86.762146 464.494324,89.780937 
                    C457.635376,94.250572 452.740387,100.309631 449.085419,107.672089 
                    C446.322601,113.237396 446.981018,119.308479 445.727295,125.060890 
                    C444.205444,132.043625 444.636444,139.600769 444.551392,146.866364 
                    C444.393768,160.333237 441.447540,173.581909 441.647461,186.955505 
                    C441.807526,197.663544 439.616638,208.048035 439.180847,218.654633 
                    C438.516418,234.825897 436.411163,250.934692 435.595703,267.104218 
                    C435.102478,276.883301 434.310028,286.609955 433.570618,296.359436 
                    C432.794067,306.598389 433.101715,317.062164 431.963867,327.187592 
                    C430.441437,340.735870 430.863159,354.425018 428.884979,367.759918 
                    C427.469238,377.303284 427.826599,387.039001 424.807922,396.583099 
                    C421.016693,408.569641 412.692261,414.788940 402.268372,419.426147 
                    C390.443665,424.686554 377.919678,426.481323 365.036896,426.405487 
                    C348.040527,426.305450 331.000153,425.645844 314.059906,426.627899 
                    C300.818298,427.395538 286.930267,427.551147 275.586639,436.270935 
                    C271.028625,439.774689 266.289886,443.135010 262.815918,447.974152 
                    C258.037598,454.630219 244.285461,454.256409 238.855347,447.796539 
                    C229.431763,436.585968 217.830048,430.048401 202.822388,428.100220 
                    C179.050705,425.014404 155.289520,427.416901 131.560684,426.335114 
                    C116.518654,425.649353 102.189430,422.390778 89.363579,413.803741 
                    C81.281662,408.392853 77.146103,400.384430 75.893990,391.549072 
                    C73.316673,373.362640 73.219627,354.846771 71.178139,336.650513 
                    C69.238693,319.363678 70.648087,301.867279 66.910728,284.735413 
                    C65.436203,277.976318 66.375549,270.824890 66.092476,263.871552 
                    C65.721008,254.747070 64.177826,245.800293 63.606632,236.735397 
                    C62.889439,225.353653 63.501026,213.904648 60.918179,202.604706 
                    C59.524452,196.507141 60.159180,189.985199 60.103851,183.752014 
                    C60.013489,173.571350 57.255165,163.701355 57.662315,153.563828 
                    C58.036728,144.241394 56.995335,134.950195 56.413704,125.699226 
                    C55.507015,111.278275 51.078308,98.082741 37.680199,89.762878 
                    C33.842400,87.379700 32.318031,81.302589 33.877728,77.358574 
                    C34.771072,75.099579 36.973911,74.828033 38.837299,74.763496 
                    C58.784607,74.072586 77.462479,78.230377 93.176170,91.119476 
                    C98.890030,95.806267 102.118172,102.673271 102.318764,110.389191 
                    C102.788406,128.453873 105.663635,146.374695 105.999985,164.395615 
                    C106.208450,175.564362 108.215286,186.482574 108.544594,197.620956 
                    C109.062881,215.151138 111.478554,232.625427 111.991241,250.155533 
                    C112.278618,259.981567 113.749947,269.625153 114.469254,279.366028 
                    C115.284180,290.401794 114.444839,301.532349 117.088539,312.505768 
                    C118.547966,318.563538 117.926506,325.124390 117.952118,331.349030 
                    C117.996109,342.040802 120.683762,352.452789 120.316673,363.081818 
                    C119.781715,378.571228 130.603760,386.460724 141.337357,391.089417 
                    C148.400330,394.135162 156.036743,394.636627 163.667709,394.643097 
                    C176.998672,394.654388 190.336044,394.390472 203.658646,394.724182 
                    C215.292694,395.015625 226.550659,397.396790 237.155624,402.514130 
                    C242.008606,404.855927 245.367828,408.673920 248.340485,412.885651 
                    C250.090546,415.365112 251.605713,415.635956 253.286255,413.155518 
                    C260.470673,402.551422 271.290466,398.948517 283.199097,396.548492 
                    C301.232635,392.914093 319.366669,395.561798 337.911560,394.646240 
                  z"/>
                  <path d="M205.960739,104.048721 
                    C196.441910,95.328430 185.613144,91.284904 173.005371,90.202202 
                    C153.438721,88.521904 133.621613,87.274368 115.508705,78.354088 
                    C112.376045,76.811295 108.597832,75.544228 108.679558,70.830765 
                    C108.725189,68.199440 109.734947,66.718475 112.481499,66.696854 
                    C113.981178,66.685043 115.480782,66.651466 116.980423,66.651299 
                    C146.145386,66.648117 175.310349,66.644455 204.475311,66.649849 
                    C217.060776,66.652176 228.745956,69.793945 239.347855,76.696442 
                    C242.331573,78.639030 244.421280,81.421974 246.643570,84.127312 
                    C250.053314,88.278206 252.250259,88.464127 255.327530,84.313934 
                    C264.971558,71.307503 279.093445,67.269875 293.841034,66.890388 
                    C324.818695,66.093285 355.831207,66.630974 386.829315,66.690765 
                    C389.142578,66.695221 392.195404,65.690025 393.122528,69.122002 
                    C393.940247,72.148994 392.896515,74.389603 390.088196,76.247452 
                    C382.728210,81.116447 374.481567,83.503990 366.036804,85.288994 
                    C350.464874,88.580505 334.493378,89.099579 318.847717,91.640282 
                    C308.612183,93.302429 299.877289,99.151184 292.974976,107.308929 
                    C283.595673,118.394165 280.505066,131.621964 278.008514,145.561935 
                    C275.986816,156.850479 276.330109,168.349487 273.655701,179.514160 
                    C272.699341,183.506470 272.277863,187.761642 272.441467,191.863754 
                    C273.093292,208.205338 270.442047,224.369827 268.867889,240.472870 
                    C266.931946,260.276794 266.459961,280.156555 264.347534,299.925415 
                    C262.324493,318.858002 259.908234,337.758789 259.226013,356.822632 
                    C259.091400,360.583984 258.229980,364.417297 257.068268,368.012085 
                    C256.184479,370.746857 254.807266,373.484467 250.861664,373.414337 
                    C246.886993,373.343597 245.544128,370.488037 244.917709,367.750732 
                    C242.959702,359.194885 241.698990,350.460510 241.724182,341.679016 
                    C241.762878,328.188721 238.474686,315.065521 237.829803,301.655701 
                    C237.400330,292.725433 235.803757,283.824310 235.780045,274.907349 
                    C235.736267,258.437439 232.300430,242.268967 231.945786,225.894318 
                    C231.739975,216.392105 229.189545,207.211014 229.536972,197.653564 
                    C230.001648,184.870941 226.958450,172.325912 225.829285,159.634125 
                    C224.953384,149.789139 223.357330,140.051895 220.866150,130.395889 
                    C218.245621,120.238441 213.155136,111.840347 205.960739,104.048721 
                  z"/>
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