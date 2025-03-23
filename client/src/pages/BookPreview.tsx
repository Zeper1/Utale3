import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import BookViewer from "@/components/BookViewer";
import { 
  ArrowLeft, 
  BookOpen, 
  Download, 
  Edit, 
  ShoppingCart, 
  Truck, 
  CreditCard,
  Check,
  Loader2,
  Eye
} from "lucide-react";

export default function BookPreview() {
  const [_, params] = useRoute<{ id: string }>('/book-preview/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [format, setFormat] = useState("digital");
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const [isBookViewerOpen, setIsBookViewerOpen] = useState(false);
  
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

  // Create PDF mutation
  const createPdf = useMutation({
    mutationFn: () => 
      apiRequest('POST', `/api/books/create-pdf`, { bookId }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/books', bookId] });
      toast({
        title: "PDF Created",
        description: "Your book has been exported to PDF successfully.",
      });
      // Open the PDF in a new tab
      if (data.url) {
        window.open(data.url, '_blank');
      }
    },
    onError: (error) => {
      toast({
        title: "Error creating PDF",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFormatChange = (value: string) => {
    setFormat(value);
    updateBook.mutate({ format: value });
  };

  const handleViewBook = () => {
    setIsBookViewerOpen(true);
  };

  const handleEditBook = () => {
    // In a real implementation, this would open an editor for modifying the book
    toast({
      title: "Edit feature",
      description: "Book editing feature will be available soon.",
    });
  };

  const handleDownloadBook = () => {
    createPdf.mutate();
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
            onClick={handleViewBook}
          >
            <Eye className="h-4 w-4" /> View Book
          </Button>
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
              disabled={createPdf.isPending}
            >
              {createPdf.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download
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
          {/* Book Preview Card */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              <div className="p-6">
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 relative mb-4">
                  {book?.previewImage ? (
                    <img
                      src={book.previewImage}
                      alt={`Preview of ${book.title}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <h3 className="text-xl font-bold text-white">{book?.title}</h3>
                  </div>
                  <Button
                    onClick={handleViewBook}
                    className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" /> View Book
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Story Summary</h3>
                    <p className="text-gray-600 mt-2">
                      {book?.content?.summary || 
                        "A personalized adventure featuring your child as the main character, exploring themes of courage, friendship, and creativity."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold">Book Features</h3>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Personalized story featuring {profile?.name}</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>{book?.content?.pages?.length || 10} beautifully illustrated pages</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>AI-generated illustrations based on the story</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                        <span>Available in {formatTitle} format</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
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
                        book?.status === 'generating' ? 'bg-yellow-400' :
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
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          
          <div className="h-[70vh] overflow-auto pr-3">
            <RadioGroup value={format} onValueChange={handleFormatChange} className="space-y-6">
              {/* Digital Option */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="digital" id="format-digital" />
                <div className="flex-1 border rounded-md p-4">
                  <Label htmlFor="format-digital" className="font-medium mb-1 flex items-center">
                    Digital Edition
                    <span className="ml-auto font-bold">$14.99</span>
                  </Label>
                  <p className="text-sm text-gray-600">
                    Instantly downloadable PDF that can be viewed on any device or printed at home.
                  </p>
                  <div className="mt-3 flex items-center text-sm text-green-600">
                    <Check className="h-4 w-4 mr-1" /> Available immediately
                  </div>
                </div>
              </div>
              
              {/* Softcover Option */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="softcover" id="format-softcover" />
                <div className="flex-1 border rounded-md p-4">
                  <Label htmlFor="format-softcover" className="font-medium mb-1 flex items-center">
                    Softcover Edition
                    <span className="ml-auto font-bold">$24.99</span>
                  </Label>
                  <p className="text-sm text-gray-600">
                    High-quality paperback printed in full color with premium paper.
                  </p>
                  <div className="mt-3 flex items-center text-sm text-blue-600">
                    <Truck className="h-4 w-4 mr-1" /> Ships in 3-5 business days
                  </div>
                </div>
              </div>
              
              {/* Hardcover Option */}
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="hardcover" id="format-hardcover" />
                <div className="flex-1 border rounded-md p-4">
                  <Label htmlFor="format-hardcover" className="font-medium mb-1 flex items-center">
                    Hardcover Edition
                    <span className="ml-auto font-bold">$34.99</span>
                  </Label>
                  <p className="text-sm text-gray-600">
                    Premium hardcover with dust jacket, printed in vibrant color on archival paper.
                  </p>
                  <div className="mt-3 flex items-center text-sm text-blue-600">
                    <Truck className="h-4 w-4 mr-1" /> Ships in 3-5 business days
                  </div>
                </div>
              </div>
            </RadioGroup>
            
            <div className="mt-8 border-t pt-6">
              <Button 
                className="w-full"
                onClick={() => {
                  setIsFormatOpen(false);
                  handleCheckout();
                }}
              >
                Continue with {formatTitle} Edition
              </Button>
              
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <CreditCard className="h-4 w-4 mr-2" />
                Secure payment processing
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Book Viewer Dialog */}
      <Dialog open={isBookViewerOpen} onOpenChange={setIsBookViewerOpen}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Book Preview</DialogTitle>
          </DialogHeader>
          {book && <BookViewer book={book} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}