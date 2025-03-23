import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle,
  BookOpen,
  Paintbrush,
  UserCircle,
  MessageSquare,
  Truck,
  Gift,
  Star,
  ArrowRight,
  Info,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Home() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  
  // References for scroll sections
  const howItWorksRef = useRef<HTMLElement>(null);
  const bookShowcaseRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);

  // Scroll to section when hash changes
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  const handleCreateProfile = () => {
    if (user) {
      setLocation("/dashboard");
    } else {
      // Find the right position for the auth modal
      const loginButton = document.querySelector('[data-event="click:handleLogin"]') as HTMLElement;
      if (loginButton) {
        loginButton.click();
      }
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-12 pb-24 bg-gradient-to-b from-white to-primary-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 flex flex-col items-start gap-6">
              <div className="bg-primary-100 text-primary-800 py-2 px-4 rounded-full text-sm font-medium">
                Personalized Stories for Your Little Ones
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-gray-900 leading-tight">
                Create Magical <span className="text-primary">Storybooks</span> Tailored to Your Child
              </h1>
              <p className="text-lg text-gray-600 max-w-lg">
                Craft unique adventures featuring your child as the main character, incorporating their interests, friends, and adventures into beautifully illustrated books they'll cherish forever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button 
                  onClick={handleCreateProfile} 
                  size="lg" 
                  className="px-6 py-3 rounded-full text-lg font-medium"
                >
                  Create Your First Book
                </Button>
                <Button 
                  onClick={() => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  variant="outline" 
                  size="lg" 
                  className="px-6 py-3 rounded-full border border-gray-300 hover:border-primary-400 text-gray-700 hover:text-primary text-lg font-medium"
                >
                  Learn More
                </Button>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-4">
                <div className="flex -space-x-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=40&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY4ODk5ODQwMg&ixlib=rb-4.0.3&q=80&w=40" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=40&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY4ODk5ODQ1OQ&ixlib=rb-4.0.3&q=80&w=40" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=40&ixid=MnwxfDB8MXxyYW5kb218MHx8cGVyc29ufHx8fHx8MTY4ODk5ODQ5MQ&ixlib=rb-4.0.3&q=80&w=40" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                </div>
                <span>Trusted by <strong>2,500+</strong> parents worldwide</span>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-secondary-200 rounded-full opacity-50"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-200 rounded-full opacity-50"></div>
                <img 
                  src="https://images.unsplash.com/photo-1512253020576-ee9f5f3fa330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80" 
                  alt="Child reading a personalized book" 
                  className="rounded-2xl shadow-card relative z-10 w-full max-w-lg mx-auto"
                />
                <div className="absolute -bottom-10 -right-10 bg-white p-4 rounded-xl shadow-soft z-20 max-w-[240px] animate-float hidden lg:block">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium">Another story completed for Emma!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">Why Parents Love StoryMagic</h2>
            <p className="text-lg text-gray-600">
              We combine AI-powered storytelling with your personal touches to create books your children will treasure for years to come.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Personalized Stories</h3>
              <p className="text-gray-600">
                Each book features your child as the main character, with details about their interests, friends, and even their pets.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <Paintbrush className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Beautiful Illustrations</h3>
              <p className="text-gray-600">
                Vibrant, professionally designed illustrations bring the stories to life and capture your child's imagination.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <UserCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Evolving Profiles</h3>
              <p className="text-gray-600">
                Your child's profile grows with them, allowing stories to evolve as they develop new interests and experiences.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Conversational Interface</h3>
              <p className="text-gray-600">
                Our friendly chat system makes creating and updating your child's profile simple and enjoyable.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Multiple Formats</h3>
              <p className="text-gray-600">
                Choose between digital downloads, premium hardcover books, or softcover editions to suit your preferences.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-soft transition-shadow duration-300">
              <div className="bg-primary-100 w-12 h-12 flex items-center justify-center rounded-lg mb-4 text-primary">
                <Gift className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Perfect Gifts</h3>
              <p className="text-gray-600">
                Create meaningful gifts for birthdays, holidays, or special milestones that children will cherish.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" ref={howItWorksRef} className="py-20 bg-primary-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">How StoryMagic Works</h2>
            <p className="text-lg text-gray-600">
              Creating your personalized book is simple and fun with our easy four-step process.
            </p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:block absolute left-0 right-0 top-1/2 h-0.5 bg-primary-200 -translate-y-1/2 z-0"></div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="bg-white rounded-xl p-6 shadow-soft flex flex-col items-center text-center">
                <div className="bg-primary w-12 h-12 flex items-center justify-center rounded-full mb-4 text-white font-bold text-xl">
                  1
                </div>
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Create a Profile</h3>
                <p className="text-gray-600">
                  Build your child's profile through our friendly chat interface, sharing details about their interests, friends, and personality.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-soft flex flex-col items-center text-center">
                <div className="bg-primary w-12 h-12 flex items-center justify-center rounded-full mb-4 text-white font-bold text-xl">
                  2
                </div>
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Choose a Story Theme</h3>
                <p className="text-gray-600">
                  Select from various themes like space adventures, underwater journeys, magical kingdoms, or everyday heroes.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-soft flex flex-col items-center text-center">
                <div className="bg-primary w-12 h-12 flex items-center justify-center rounded-full mb-4 text-white font-bold text-xl">
                  3
                </div>
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Preview & Customize</h3>
                <p className="text-gray-600">
                  Review your generated story, make any desired adjustments, and see how it all comes together before finalizing.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-soft flex flex-col items-center text-center">
                <div className="bg-primary w-12 h-12 flex items-center justify-center rounded-full mb-4 text-white font-bold text-xl">
                  4
                </div>
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Order & Enjoy</h3>
                <p className="text-gray-600">
                  Choose your preferred format (digital, hardcover, softcover), place your order, and enjoy your unique creation.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              onClick={handleCreateProfile} 
              className="px-6 py-3 rounded-full text-lg font-medium"
            >
              Start Creating Your Story
            </Button>
          </div>
        </div>
      </section>

      {/* Book Showcase Section */}
      <section id="book-showcase" ref={bookShowcaseRef} className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">Book Showcase</h2>
            <p className="text-lg text-gray-600">
              Browse through some examples of our magical personalized storybooks.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="rounded-xl overflow-hidden shadow-soft group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1629196915184-d1a7db45c7c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                  alt="Space Adventure Book Cover" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-xl font-bold font-heading">Space Adventure</h3>
                  <p className="text-sm text-white/80">Ages 4-8</p>
                </div>
              </div>
              <div className="p-6 bg-white">
                <p className="text-gray-600 mb-4">
                  Join [Child's Name] on an exciting journey through the cosmos, where they'll discover strange planets and make alien friends.
                </p>
                <Button 
                  onClick={handleCreateProfile}
                  variant="link" 
                  className="text-primary hover:text-primary/90 font-medium flex items-center gap-2 p-0"
                >
                  Preview Book <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-soft group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                  alt="Underwater Kingdom Book Cover" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-xl font-bold font-heading">Underwater Kingdom</h3>
                  <p className="text-sm text-white/80">Ages 3-7</p>
                </div>
              </div>
              <div className="p-6 bg-white">
                <p className="text-gray-600 mb-4">
                  Dive deep with [Child's Name] as they explore an enchanted underwater world filled with friendly sea creatures and hidden treasures.
                </p>
                <Button 
                  onClick={handleCreateProfile}
                  variant="link" 
                  className="text-primary hover:text-primary/90 font-medium flex items-center gap-2 p-0"
                >
                  Preview Book <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden shadow-soft group">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1633613286848-e6f43bbafb8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80" 
                  alt="Magical Forest Book Cover" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <h3 className="text-xl font-bold font-heading">Magical Forest</h3>
                  <p className="text-sm text-white/80">Ages 4-9</p>
                </div>
              </div>
              <div className="p-6 bg-white">
                <p className="text-gray-600 mb-4">
                  Follow [Child's Name] as they discover a magical forest where talking animals and enchanted trees help them on a special quest.
                </p>
                <Button 
                  onClick={handleCreateProfile}
                  variant="link" 
                  className="text-primary hover:text-primary/90 font-medium flex items-center gap-2 p-0"
                >
                  Preview Book <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" ref={pricingRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-gray-600">
              Choose the format that best suits your needs. All options include full personalization.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Digital Option */}
            <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Digital Edition</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold text-gray-900">$14.99</span>
                  <span className="text-sm text-gray-500 mb-1">per book</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Instant download of your personalized story in digital format.
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Instant download (PDF)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Full personalization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Read on any device</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Print at home option</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleCreateProfile}
                  variant="outline" 
                  className="w-full py-3 rounded-full border border-primary text-primary hover:bg-primary-50 font-medium"
                >
                  Choose Digital
                </Button>
              </div>
            </div>
            
            {/* Softcover Option */}
            <div className="bg-white rounded-xl overflow-hidden shadow-card border border-primary-200 relative transform scale-105 z-10">
              <div className="absolute top-0 right-0 bg-primary text-white text-xs py-1 px-3 rounded-bl-lg font-medium">
                Most Popular
              </div>
              <div className="p-6 border-b border-gray-100 bg-primary-50">
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Softcover Book</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold text-gray-900">$24.99</span>
                  <span className="text-sm text-gray-500 mb-1">per book</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Beautiful softcover edition plus digital version included.
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Printed softcover book</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Digital copy included</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Premium color printing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Free shipping</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleCreateProfile}
                  className="w-full py-3 rounded-full font-medium"
                >
                  Choose Softcover
                </Button>
              </div>
            </div>
            
            {/* Hardcover Option */}
            <div className="bg-white rounded-xl overflow-hidden shadow-soft border border-gray-100 transition-transform hover:-translate-y-1 duration-300">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2">Hardcover Book</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-bold text-gray-900">$34.99</span>
                  <span className="text-sm text-gray-500 mb-1">per book</span>
                </div>
                <p className="text-gray-600 text-sm">
                  Premium hardcover edition built to last for years.
                </p>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Durable hardcover book</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Digital copy included</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Highest quality printing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">Gift-ready packaging</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleCreateProfile}
                  variant="outline" 
                  className="w-full py-3 rounded-full border border-primary text-primary hover:bg-primary-50 font-medium"
                >
                  Choose Hardcover
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-12 max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-soft">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="shrink-0 text-primary text-2xl">
                <Info className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Bulk discounts available</h4>
                <p className="text-gray-600 text-sm">
                  Creating books for multiple children or as gifts? Contact us for special pricing on orders of 3 or more books.
                </p>
              </div>
              <div className="shrink-0 ml-auto">
                <Button 
                  variant="secondary" 
                  className="whitespace-nowrap rounded-full text-sm"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">What Parents Say</h2>
            <p className="text-lg text-gray-600">
              See why families love StoryMagic personalized books.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "My daughter's face lit up when she saw herself as the main character in her book. She asks me to read it every night! The personalization is incredibly detailed."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=60&h=60&q=80" 
                  alt="Sarah J." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">Sarah J.</h4>
                  <p className="text-sm text-gray-500">Mother of Emma, 5</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "I've ordered three books now for my son, and each one gets better as his profile becomes more detailed. The quality of the hardcover books is excellent!"
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=60&h=60&q=80" 
                  alt="Michael T." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">Michael T.</h4>
                  <p className="text-sm text-gray-500">Father of Lucas, 7</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">
                "I purchased a book for my niece's birthday and it was the hit of the party. The chat interface made it so easy to create her profile and the customer service was outstanding."
              </p>
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=60&h=60&q=80" 
                  alt="Jennifer R." 
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-gray-900">Jennifer R.</h4>
                  <p className="text-sm text-gray-500">Aunt of Sophia, 6</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Ready to Create a Magical Story?</h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Start building your child's profile today and create a personalized book they'll treasure for years to come.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleCreateProfile}
                variant="secondary" 
                size="lg" 
                className="px-8 py-4 rounded-full bg-white text-primary hover:bg-gray-100 text-lg font-medium"
              >
                Create Your First Book
              </Button>
              <Button 
                onClick={() => bookShowcaseRef.current?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline" 
                size="lg" 
                className="px-8 py-4 rounded-full border border-white bg-transparent hover:bg-primary-900 text-lg font-medium text-white"
              >
                View Sample Books
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">
              Find answers to common questions about StoryMagic books.
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border-b border-gray-200">
                <AccordionTrigger className="text-lg font-medium text-gray-900 py-4">
                  How personalized are the books?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pr-12">
                  Our books are highly personalized based on the information you provide in your child's profile. This includes their name, appearance, interests, friends, pets, and more. As you interact with our chat system and update their profile over time, the stories become even more tailored to their unique personality and experiences.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border-b border-gray-200">
                <AccordionTrigger className="text-lg font-medium text-gray-900 py-4">
                  How long does it take to create and receive a book?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pr-12">
                  Digital books are available for download immediately after creation. For printed books, production takes 2-3 business days, and shipping typically takes 3-7 business days, depending on your location. Expedited shipping options are available at checkout.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border-b border-gray-200">
                <AccordionTrigger className="text-lg font-medium text-gray-900 py-4">
                  Can I update my child's profile over time?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pr-12">
                  Yes! In fact, we encourage it. Your child's profile can be updated at any time through our friendly chat interface. As your child grows and their interests evolve, you can update their profile to ensure future books reflect these changes. Each new book will incorporate the latest information from their profile.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border-b border-gray-200">
                <AccordionTrigger className="text-lg font-medium text-gray-900 py-4">
                  What age range are the books suitable for?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pr-12">
                  Our books are primarily designed for children ages 2-10, with different themes and complexity levels available for different age groups. Each book listing indicates the recommended age range. The language and storylines adapt based on the age you specify in your child's profile.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="border-b border-gray-200">
                <AccordionTrigger className="text-lg font-medium text-gray-900 py-4">
                  Is my child's data secure?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pr-12">
                  Yes, we take data security very seriously. All personal information is stored securely using encryption, and we never share your data with third parties. Our platform complies with relevant data protection regulations, and you can delete your account and associated data at any time through your account settings.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-8 text-center">
              <Button 
                variant="link" 
                className="text-primary hover:text-primary/90 font-medium flex items-center justify-center gap-2 text-base"
              >
                View all FAQs <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
