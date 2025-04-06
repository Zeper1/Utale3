import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Dashboard from "@/pages/DashboardNew"; // Cambiamos a la nueva versión
import CreateBook from "@/pages/CreateBook";
import BookPreview from "@/pages/BookPreview";
import Checkout from "@/pages/Checkout";
import Subscribe from "@/pages/Subscribe";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import SubscriptionCancel from "@/pages/SubscriptionCancel";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import Settings from "@/pages/Settings";
import Subscription from "@/pages/Subscription";
import FAQs from "@/pages/FAQs";
import Contacto from "@/pages/Contacto";
import Terminos from "@/pages/Terminos";
import Privacidad from "@/pages/Privacidad";
import Cookies from "@/pages/Cookies";
import ComoFunciona from "@/pages/ComoFunciona";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/hooks/useAuth";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/create-book" component={CreateBook} />
          <Route path="/book-preview/:id" component={BookPreview} />
          <Route path="/checkout/:id" component={Checkout} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/subscription" component={Subscription} />
          <Route path="/subscription/success" component={SubscriptionSuccess} />
          <Route path="/subscription/cancel" component={SubscriptionCancel} />
          <Route path="/profile" component={Profile} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/settings" component={Settings} />
          {/* Páginas del pie de página */}
          <Route path="/faqs" component={FAQs} />
          <Route path="/contacto" component={Contacto} />
          <Route path="/terminos" component={Terminos} />
          <Route path="/privacidad" component={Privacidad} />
          <Route path="/cookies" component={Cookies} />
          <Route path="/como-funciona" component={ComoFunciona} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
