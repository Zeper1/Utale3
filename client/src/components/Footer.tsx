import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const { toast } = useToast();
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    
    if (email) {
      toast({
        title: "Newsletter subscription successful",
        description: "Thank you for subscribing to our newsletter!",
      });
      form.reset();
    }
  };
  
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="text-primary-400 text-2xl">
                <BookOpen />
              </div>
              <h2 className="text-xl font-bold font-heading text-white">StoryMagic</h2>
            </div>
            <p className="text-gray-400 mb-6">
              Creating personalized stories that capture your child's imagination and create lasting memories.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" aria-label="Pinterest">
                <i className="fab fa-pinterest-p"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">How It Works</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Book Showcase</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Gift Cards</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Testimonials</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">FAQs</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Shipping Policy</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Return Policy</Link></li>
              <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4">Newsletter</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="mb-4" onSubmit={handleSubscribe}>
              <div className="flex">
                <Input 
                  type="email" 
                  name="email"
                  placeholder="Your email address" 
                  className="rounded-l-lg bg-gray-800 border-gray-700 text-white"
                  required
                />
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-r-lg"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
            <p className="text-xs text-gray-500">
              By subscribing you agree to our Privacy Policy and provide consent to receive updates from our company.
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} StoryMagic. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/" className="text-gray-500 hover:text-primary text-sm transition-colors">Privacy Policy</Link>
              <Link href="/" className="text-gray-500 hover:text-primary text-sm transition-colors">Terms of Service</Link>
              <Link href="/" className="text-gray-500 hover:text-primary text-sm transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
