import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { createPaymentIntent } from "@/lib/stripe";
import { loadPayPalScript } from "@/lib/paypal";
import { getStripePromise } from "@/lib/stripe";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { 
  ArrowLeft, 
  Check, 
  CreditCard, 
  Loader2, 
  Lock, 
  ShieldCheck, 
  Truck, 
  CheckCircle
} from "lucide-react";

// Form schema for shipping information
const shippingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  saveInfo: z.boolean().optional(),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

// Checkout Form component with Stripe integration
const CheckoutForm = ({ 
  bookData, 
  totalAmount, 
  onSuccess 
}: { 
  bookData: any, 
  totalAmount: number,
  onSuccess: () => void 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/dashboard",
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Your book order has been placed successfully",
        });
        onSuccess();
      }
    } catch (err) {
      console.error("Payment error:", err);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium mb-2">Payment Information</h3>
        <PaymentElement />
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secured with SSL encryption</span>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>Complete Payment</>
        )}
      </Button>
    </form>
  );
};

// PayPal Button implementation
const PayPalButton = ({ 
  bookData, 
  totalAmount, 
  onSuccess 
}: { 
  bookData: any, 
  totalAmount: number,
  onSuccess: () => void 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const paypalButtonRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadAndRenderPayPal = async () => {
      try {
        await loadPayPalScript();
        setIsLoaded(true);

        // Render PayPal buttons when the script is loaded
        if (paypalButtonRef.current && window.paypal) {
          paypalButtonRef.current.innerHTML = "";
          window.paypal.Buttons({
            createOrder: (data: any, actions: any) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: totalAmount.toFixed(2),
                    currency_code: "USD",
                  },
                  description: `StoryMagic Book: ${bookData.title}`,
                }],
              });
            },
            onApprove: async (data: any, actions: any) => {
              try {
                const orderDetails = await actions.order.capture();
                
                // Create order in our system
                await apiRequest("POST", "/api/orders", {
                  userId: bookData.userId,
                  bookId: bookData.id,
                  amount: Math.round(totalAmount * 100), // Store in cents
                  currency: "usd",
                  paymentMethod: "paypal",
                  paymentId: orderDetails.id,
                  status: "completed",
                  shippingAddress: {},
                });
                
                toast({
                  title: "Payment Successful",
                  description: "Your book order has been placed successfully",
                });
                onSuccess();
              } catch (error) {
                console.error("PayPal order error:", error);
                toast({
                  title: "Order Error",
                  description: "There was an error processing your order. Please contact support.",
                  variant: "destructive",
                });
              }
            },
            onError: (err: any) => {
              console.error("PayPal error:", err);
              toast({
                title: "PayPal Error",
                description: "An error occurred during payment processing. Please try again.",
                variant: "destructive",
              });
            }
          }).render(paypalButtonRef.current);
        }
      } catch (error) {
        console.error("PayPal loading error:", error);
        toast({
          title: "PayPal Error",
          description: "Failed to load PayPal. Please try another payment method.",
          variant: "destructive",
        });
      }
    };

    loadAndRenderPayPal();
  }, [totalAmount, bookData, onSuccess, toast]);

  return (
    <div className="space-y-6">
      {!isLoaded && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}
      <div ref={paypalButtonRef} className="paypal-button-container"></div>
    </div>
  );
};

export default function Checkout() {
  const [_, params] = useRoute<{ id: string }>('/checkout/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isShippingNeeded, setIsShippingNeeded] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const bookId = params?.id ? parseInt(params.id) : null;

  // Form for shipping information
  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: '',
      email: user?.email || '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      saveInfo: false,
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/");
      toast({
        title: "Authentication required",
        description: "Please log in to complete checkout",
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

  // Check if shipping is needed based on format
  useEffect(() => {
    if (book) {
      setIsShippingNeeded(book.format !== 'digital');
    }
  }, [book]);

  // Update order status mutation
  const updateOrder = useMutation({
    mutationFn: (updateData: any) => 
      apiRequest('PUT', `/api/books/${bookId}`, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/books', bookId] });
    },
    onError: (error) => {
      toast({
        title: "Error updating order",
        description: "There was an error updating your order. Please contact support.",
        variant: "destructive",
      });
    }
  });

  // Get price based on format
  const getPriceByFormat = (format: string) => {
    switch(format) {
      case 'digital':
        return 14.99;
      case 'softcover':
        return 24.99;
      case 'hardcover':
        return 34.99;
      default:
        return 14.99;
    }
  };

  // Total amount calculation
  const calculateTotal = () => {
    if (!book) return 0;
    return getPriceByFormat(book.format);
  };

  // Create Stripe Payment Intent
  useEffect(() => {
    const initializePayment = async () => {
      if (book && user && !clientSecret) {
        try {
          const amount = calculateTotal();
          const response = await createPaymentIntent(
            amount,
            book.id,
            user.id,
            book.format
          );
          setClientSecret(response.clientSecret);
        } catch (error) {
          console.error("Payment initialization error:", error);
          toast({
            title: "Payment Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        }
      }
    };

    initializePayment();
  }, [book, user, clientSecret, toast]);

  // Handle shipping form submission
  const onShippingSubmit = (data: ShippingFormValues) => {
    // In a real implementation, this would save shipping details
    // For now, we'll just use it to continue to payment
    toast({
      title: "Shipping information saved",
      description: "Proceed to payment to complete your order.",
    });
  };

  // Handle successful payment
  const handlePaymentSuccess = () => {
    updateOrder.mutate({ 
      status: 'ordered',
    });
    setIsComplete(true);
  };

  const handleGoBack = () => {
    setLocation(`/book-preview/${bookId}`);
  };

  const handleGoToDashboard = () => {
    setLocation('/dashboard');
  };

  if (!user || !bookId) {
    return null;
  }

  const isLoading = bookLoading || !clientSecret;
  const hasError = bookError;
  const total = calculateTotal();

  // If payment is complete, show success screen
  if (isComplete) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Complete!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed.
            {book?.format !== 'digital' 
              ? " We'll send you a confirmation email with tracking information once your book has shipped."
              : " You can now access your digital book from your dashboard."}
          </p>
          
          <Card className="mb-8 text-left">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Book:</span>
                  <span className="font-medium">{book?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium capitalize">{book?.format}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium capitalize">{paymentMethod}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button onClick={handleGoToDashboard} size="lg">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleGoBack} className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Book Preview
        </Button>
      </div>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-gray-600 mb-8">Complete your purchase to receive your personalized book</p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : hasError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500">Error loading book information. Please try again later.</p>
              <Button onClick={handleGoBack} className="mt-4">Back to Preview</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checkout Form Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Order</CardTitle>
                  <CardDescription>
                    {book?.format === 'digital' 
                      ? "Provide your information to receive your digital book"
                      : "Provide shipping and payment information to receive your book"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isShippingNeeded && (
                    <div className="mb-8">
                      <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onShippingSubmit)} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="your@email.com" type="email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="123 Main St, Apt 4B" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="New York" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <FormControl>
                                    <Input placeholder="NY" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="zipCode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>ZIP Code</FormLabel>
                                  <FormControl>
                                    <Input placeholder="10001" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="saveInfo"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    Save this information for next time
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />
                        </form>
                      </Form>
                    </div>
                  )}
                  
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                    <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'stripe' | 'paypal')}>
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="stripe" className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Credit Card
                        </TabsTrigger>
                        <TabsTrigger value="paypal" className="flex items-center gap-2">
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.568 6.243-8.148 6.243h-2.19c-1.524 0-2.751 1.096-2.97 2.57l-1.12 7.106c-.018.112-.03.22-.037.324H7.01l-.34.213c-.1.645.354 1.241 1.016 1.241h4.653c.524 0 .968-.382 1.05-.9l.883-5.571c.05-.314.337-.555.656-.555h.786c3.617 0 6.453-1.464 7.285-5.705.386-1.96.158-3.57-.789-4.678" />
                          </svg>
                          PayPal
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="stripe" className="mt-0">
                        {clientSecret && (
                          <Elements 
                            stripe={getStripePromise()} 
                            options={{ clientSecret }}
                          >
                            <CheckoutForm 
                              bookData={book} 
                              totalAmount={total}
                              onSuccess={handlePaymentSuccess}
                            />
                          </Elements>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="paypal" className="mt-0">
                        <PayPalButton 
                          bookData={book} 
                          totalAmount={total}
                          onSuccess={handlePaymentSuccess}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {book?.previewImage ? (
                          <img 
                            src={book.previewImage} 
                            alt={book.title} 
                            className="h-full w-full object-cover rounded"
                          />
                        ) : (
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{book?.title}</h3>
                        <p className="text-sm text-gray-600 capitalize">{book?.format} Edition</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      
                      {book?.format !== 'digital' && (
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Shipping:</span>
                          <span>Free</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between font-medium text-lg pt-2 border-t mt-2">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 border-t pt-6">
                  <div className="w-full space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span>Secure checkout</span>
                    </div>
                    
                    {book?.format !== 'digital' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span>Free shipping on all orders</span>
                      </div>
                    )}
                    
                    {book?.format === 'digital' && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Instant digital delivery</span>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
