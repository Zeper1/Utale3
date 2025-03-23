import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Edit, 
  ShoppingCart, 
  Truck, 
  CreditCard,
  Check,
  Loader
} from "lucide-react";

export default function BookPreview() {
  const [_, params] = useRoute<{ id: string }>('/book-preview/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(0);
  const [format, setFormat] = useState("digital");
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  const bookId = params?.id ? parseInt(params.id) : null;

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/");
      toast({
        title: "Authentication required",
        description: "Please log in to view book previews",
        variant: "destructive",
      });
    }
  }, [user, setLocation, toast]);

  // Fetch book data
  const { 
    data: book,
    isLoading: bookLoading,
    error: bookError
  } = useQuery({
    queryKey: ['/api/books', bookId],
    queryFn: () => apiRequest('GET', `/api/books/${bookId}`).then(res => res.json()),
    enabled: !!bookId && !!user?.id,
  });

  // Fetch child profile
  const { 
    data: profile,
    isLoading: profileLoading,
    error: profileError
  } = useQuery({
    queryKey: ['/api/profiles', book?.childProfileId],
    queryFn: () => apiRequest('GET', `/api/profiles/${book?.childProfileId}`).then(res => res.json()),
    enabled: !!book?.childProfileId,
  });

  // Update book mutation
  const updateBook = useMutation({
    mutationFn: (updateData: any) => 
      apiRequest('PUT', `/api/books/${bookId}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books', bookId] });
      toast({
        title: "Book updated",
        description: "Your book has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating book",
        description: "There was an error updating your book. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFormatChange = (value: string) => {
    setFormat(value);
    updateBook.mutate({ format: value });
  };

  const handlePageTurn = (direction: 'next' | 'prev') => {
    if (!book?.content?.pages) return;
    
    if (direction === 'next' && currentPage < book.content.pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleEditBook = () => {
    // In a real implementation, this would open an editor for modifying the book
    toast({
      title: "Edit feature",
      description: "Book editing feature will be available soon.",
    });
  };

  const handleDownloadBook = () => {
    // In a real implementation, this would generate and download a PDF
    toast({
      title: "Download feature",
      description: "Book download feature will be available soon.",
    });
  };

  const handleGoBack = () => {
    setLocation('/dashboard');
  };

  const handleCheckout = () => {
    // Update book status to completed before checkout
    updateBook.mutate({ 
      status: 'completed',
      format
    }, {
      onSuccess: () => {
        setLocation(`/checkout/${bookId}`);
      }
    });
  };

  const getFormatPrice = (formatType: string) => {
    switch(formatType) {
      case 'digital':
        return '$14.99';
      case 'softcover':
        return '$24.99';
      case 'hardcover':
        return '$34.99';
      default:
        return '$14.99';
    }
  };

  if (!user || !bookId) {
    return null;
  }

  const isLoading = bookLoading || profileLoading || updateBook.isPending;
  const hasError = bookError || profileError;

  const formatTitle = format.charAt(0).toUpperCase() + format.slice(1);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="ghost" onClick={handleGoBack} className="mb-2 -ml-2 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">{book?.title || "Book Preview"}</h1>
          <p className="text-gray-600">
            {profile ? `Created for ${profile.name}` : "Loading..."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={handleEditBook}
          >
            <Edit className="h-4 w-4" /> Edit
          </Button>
          {format === 'digital' && (
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleDownloadBook}
            >
              <Download className="h-4 w-4" /> Download
            </Button>
          )}
          <SheetTrigger asChild onClick={() => setIsFormatOpen(true)}>
            <Button className="flex items-center gap-1">
              <ShoppingCart className="h-4 w-4" /> {book?.status === 'completed' ? 'Order Now' : 'Preview Order'}
            </Button>
          </SheetTrigger>
        </div>
      </div>

      {isLoading && !book ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : hasError ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Error loading the book. Please try again later.</p>
            <Button onClick={handleGoBack} className="mt-4">Back to Dashboard</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Book Preview */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <Tabs defaultValue="book" className="w-full">
                <TabsList className="w-full border-b rounded-none">
                  <TabsTrigger value="book" className="flex-1">Book Preview</TabsTrigger>
                  <TabsTrigger value="illustrations" className="flex-1">Illustrations</TabsTrigger>
                </TabsList>
                
                {/* Book View */}
                <TabsContent value="book" className="pb-4">
                  <div className="flex justify-between items-center p-4 border-b">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePageTurn('prev')}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div className="text-center">
                      <span className="text-sm font-medium">
                        Page {currentPage + 1} of {book?.content?.pages?.length || 1}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePageTurn('next')}
                      disabled={!book?.content?.pages || currentPage === book.content.pages.length - 1}
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </div>
                  
                  <div className="p-6 min-h-[500px] flex flex-col justify-between">
                    {book?.content?.pages && book.content.pages.length > 0 ? (
                      <div className="flex flex-col h-full">
                        <div className="flex-1 mb-8">
                          <p className="text-lg md:text-xl font-medium leading-relaxed">
                            {book.content.pages[currentPage].text}
                          </p>
                        </div>
                        <div className="mt-auto border-t pt-4">
                          <p className="text-sm text-gray-500 italic">
                            <strong>Illustration:</strong> {book.content.pages[currentPage].illustration_prompt}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
                        <p className="text-gray-500">No content available for this book.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between px-4 pb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageTurn('prev')}
                      disabled={currentPage === 0}
                      className="flex items-center"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageTurn('next')}
                      disabled={!book?.content?.pages || currentPage === book.content.pages.length - 1}
                      className="flex items-center"
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </TabsContent>
                
                {/* Illustrations View */}
                <TabsContent value="illustrations" className="p-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold">Book Illustrations</h3>
                    <p className="text-gray-600">Preview the illustrations that will be created for your book</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {book?.content?.pages?.map((page: any, index: number) => (
                      <Card key={index} className="overflow-hidden">
                        <div className="bg-gray-100 h-40 flex items-center justify-center">
                          <BookOpen className="h-10 w-10 text-gray-300" />
                        </div>
                        <CardContent className="p-4">
                          <p className="text-sm font-medium mb-1">Page {index + 1}</p>
                          <p className="text-xs text-gray-600 line-clamp-3">
                            {page.illustration_prompt}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Illustrations will be generated based on the story and your child's profile.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold mb-4">Book Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Title</h3>
                    <p className="font-medium">{book?.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created For</h3>
                    <p className="font-medium">{profile?.name || "Loading..."}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Format</h3>
                    <p className="font-medium capitalize">{format} Edition</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Pages</h3>
                    <p className="font-medium">{book?.content?.pages?.length || 0} pages</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        book?.status === 'draft' ? 'bg-gray-400' :
                        book?.status === 'preview' ? 'bg-yellow-400' :
                        book?.status === 'completed' ? 'bg-green-400' :
                        book?.status === 'ordered' ? 'bg-blue-400' : 'bg-gray-400'
                      }`}></div>
                      <p className="font-medium capitalize">{book?.status || "Unknown"}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-b py-4 my-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Price:</span>
                    <span className="font-medium">{getFormatPrice(format)}</span>
                  </div>
                  {format !== 'digital' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Shipping:</span>
                      <span className="text-sm text-gray-600">Free</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 mt-6">
                  <Button 
                    onClick={handleCheckout}
                    className="w-full"
                    disabled={updateBook.isPending}
                  >
                    {updateBook.isPending ? (
                      <>
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Proceed to Checkout</>
                    )}
                  </Button>
                  
                  <div className="text-xs text-gray-500 text-center space-y-2">
                    <p>Your book will be personalized for {profile?.name || "your child"}.</p>
                    <p>
                      {format === 'digital' 
                        ? "Digital format is available immediately after purchase." 
                        : `${formatTitle} copies typically ship within 3-5 business days.`
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Format Selection Sheet */}
      <Sheet open={isFormatOpen} onOpenChange={setIsFormatOpen}>
        <SheetContent className="w-[90vw] sm:max-w-md">
          <SheetHeader className="mb-4">
            <SheetTitle>Select Book Format</SheetTitle>
            <SheetDescription>
              Choose the format you'd like for "{book?.title}".
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="h-[70vh]">
            <div className="pr-3">
              <RadioGroup value={format} onValueChange={handleFormatChange} className="space-y-6">
                {/* Digital Option */}
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="digital" id="format-digital" />
                  <div className="flex-1 border rounded-md p-4">
                    <Label htmlFor="format-digital" className="font-medium text-base">Digital Edition</Label>
                    <p className="text-sm text-gray-600 mt-1 mb-2">
                      Instant digital download you can view on any device or print at home.
                    </p>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Instant delivery</span>
                      <span className="font-medium">$14.99</span>
                    </div>
                  </div>
                </div>
                
                {/* Softcover Option */}
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="softcover" id="format-softcover" />
                  <div className="flex-1 border rounded-md p-4 bg-primary-50 border-primary">
                    <div className="flex justify-between items-start mb-2">
                      <Label htmlFor="format-softcover" className="font-medium text-base">Softcover Book</Label>
                      <span className="bg-primary text-white text-xs px-2 py-0.5 rounded font-medium">Popular</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      High-quality softcover printed book, plus free digital copy included.
                    </p>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Ships in 3-5 days</span>
                      <span className="font-medium">$24.99</span>
                    </div>
                  </div>
                </div>
                
                {/* Hardcover Option */}
                <div className="flex items-start space-x-3 space-y-0">
                  <RadioGroupItem value="hardcover" id="format-hardcover" />
                  <div className="flex-1 border rounded-md p-4">
                    <Label htmlFor="format-hardcover" className="font-medium text-base">Hardcover Book</Label>
                    <p className="text-sm text-gray-600 mt-1 mb-2">
                      Premium hardcover edition that's built to last, plus free digital copy.
                    </p>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Ships in 5-7 days</span>
                      <span className="font-medium">$34.99</span>
                    </div>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="border-t mt-8 pt-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-primary" /> Shipping Information
                  </h3>
                  <p className="text-sm text-gray-600">
                    We offer free standard shipping on all printed books. Your book will be carefully packaged and shipped to your address.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-primary" /> Payment Methods
                  </h3>
                  <p className="text-sm text-gray-600">
                    We accept all major credit cards and PayPal. Your payment is secured with industry-standard encryption.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 space-y-4">
                <Button className="w-full" onClick={handleCheckout}>
                  Continue to Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setIsFormatOpen(false)}>
                  Continue Browsing
                </Button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
