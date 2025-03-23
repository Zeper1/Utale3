import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, BookOpen, Check, Loader2 } from "lucide-react";

// Form schema for book creation
const bookFormSchema = z.object({
  childProfileId: z.string().min(1, "Please select a child profile"),
  themeId: z.string().min(1, "Please select a book theme"),
});

type BookFormValues = z.infer<typeof bookFormSchema>;

export default function CreateBook() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [bookId, setBookId] = useState<number | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/");
      toast({
        title: "Authentication required",
        description: "Please log in to create a book",
        variant: "destructive",
      });
    }
  }, [user, setLocation, toast]);

  // Fetch child profiles
  const { 
    data: childProfiles = [],
    isLoading: profilesLoading,
    error: profilesError
  } = useQuery({
    queryKey: ['/api/users', user?.id, 'profiles'],
    queryFn: () => apiRequest('GET', `/api/users/${user?.id}/profiles`).then(res => res.json()),
    enabled: !!user?.id,
  });

  // Fetch book themes
  const {
    data: bookThemes = [],
    isLoading: themesLoading,
    error: themesError
  } = useQuery({
    queryKey: ['/api/book-themes'],
    queryFn: () => apiRequest('GET', '/api/book-themes').then(res => res.json()),
  });

  // Book generation and creation mutation
  const generateBook = useMutation({
    mutationFn: async (values: { profileId: number, themeId: number }) => {
      // First, generate book content with OpenAI
      const generateResponse = await apiRequest('POST', '/api/generate-book', values);
      const bookContent = await generateResponse.json();
      
      // Then, create a book entry in the database
      const { title, pages } = bookContent;
      
      const createResponse = await apiRequest('POST', '/api/books', {
        userId: user?.id,
        childProfileId: values.profileId,
        themeId: values.themeId,
        title,
        content: { pages },
        format: 'digital',
        status: 'preview'
      });
      
      return createResponse.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'books'] });
      setBookId(data.id);
      setGenerationComplete(true);
    },
    onError: (error) => {
      setIsCreatingBook(false);
      toast({
        title: "Error creating book",
        description: "There was an error generating your book. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Configure book creation form
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      childProfileId: "",
      themeId: "",
    },
  });

  // Handle form submission
  const onSubmit = (values: BookFormValues) => {
    setIsCreatingBook(true);
    generateBook.mutate({
      profileId: parseInt(values.childProfileId),
      themeId: parseInt(values.themeId)
    });
  };

  // Navigate to profile chat
  const goToProfileChat = (profileId: string) => {
    setLocation(`/profile-chat/${profileId}`);
  };

  // Navigate to book preview
  const goToBookPreview = () => {
    if (bookId) {
      setLocation(`/book-preview/${bookId}`);
    }
  };

  // Go back to dashboard
  const goToDashboard = () => {
    setLocation('/dashboard');
  };

  if (!user) {
    return null; // Will redirect due to useEffect
  }

  const isLoading = profilesLoading || themesLoading;
  const hasError = profilesError || themesError;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create a Personalized Book</h1>
          <p className="text-gray-600">Select a child profile and book theme to create a personalized storybook</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : hasError ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500">Error loading data. Please try again later.</p>
              <Button onClick={goToDashboard} className="mt-4">Back to Dashboard</Button>
            </CardContent>
          </Card>
        ) : childProfiles.length === 0 ? (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center py-12">
              <div className="bg-primary-50 p-4 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Child Profiles Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Before creating a book, you need to create a profile for your child to personalize their story.
              </p>
              <Button onClick={goToDashboard}>
                Create a Profile First
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Select Child Profile */}
              <Card>
                <CardHeader>
                  <CardTitle>Step 1: Select Child Profile</CardTitle>
                  <CardDescription>
                    Choose which child you're creating this book for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="childProfileId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            {childProfiles.map((profile: any) => (
                              <div key={profile.id} className="relative">
                                <RadioGroupItem
                                  value={profile.id.toString()}
                                  id={`profile-${profile.id}`}
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor={`profile-${profile.id}`}
                                  className="flex items-start p-4 border rounded-lg cursor-pointer hover:border-primary peer-checked:border-primary peer-checked:bg-primary-50"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium">{profile.name}</div>
                                    <div className="text-sm text-gray-500">{profile.age} years old</div>
                                    {profile.interests && profile.interests.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {profile.interests.slice(0, 3).map((interest: string, idx: number) => (
                                          <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                                            {interest}
                                          </span>
                                        ))}
                                        {profile.interests.length > 3 && (
                                          <span className="text-xs text-gray-500">+{profile.interests.length - 3} more</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <Check className="invisible peer-checked:visible h-5 w-5 text-primary" />
                                </label>
                                {(!profile.interests || profile.interests.length === 0) && (
                                  <div className="mt-1 ml-4">
                                    <Button
                                      type="button"
                                      variant="link"
                                      size="sm"
                                      className="text-primary p-0 h-auto"
                                      onClick={() => goToProfileChat(profile.id.toString())}
                                    >
                                      Add more details through chat
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Select Book Theme */}
              <Card>
                <CardHeader>
                  <CardTitle>Step 2: Choose a Book Theme</CardTitle>
                  <CardDescription>
                    Select a theme for your personalized storybook
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="themeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            {bookThemes.map((theme: any) => (
                              <div key={theme.id} className="relative">
                                <RadioGroupItem
                                  value={theme.id.toString()}
                                  id={`theme-${theme.id}`}
                                  className="peer sr-only"
                                />
                                <label
                                  htmlFor={`theme-${theme.id}`}
                                  className="flex flex-col h-full border rounded-lg overflow-hidden cursor-pointer hover:border-primary peer-checked:border-primary"
                                >
                                  <div className="h-32 bg-primary-50 flex items-center justify-center">
                                    {theme.coverImage ? (
                                      <img
                                        src={theme.coverImage}
                                        alt={theme.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <BookOpen className="h-12 w-12 text-primary/30" />
                                    )}
                                  </div>
                                  <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="font-medium">{theme.name}</div>
                                        <div className="text-xs text-gray-500">Ages {theme.ageRange}</div>
                                      </div>
                                      <Check className="invisible peer-checked:visible h-5 w-5 text-primary" />
                                    </div>
                                    <p className="mt-2 text-sm text-gray-600">{theme.description}</p>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button type="button" variant="outline" onClick={goToDashboard}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={generateBook.isPending}>
                    {generateBook.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>Create Book</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        )}
      </div>

      {/* Book Creation Dialog */}
      <Dialog open={isCreatingBook} onOpenChange={(open) => {
        if (!open && generationComplete) {
          goToBookPreview();
        }
        setIsCreatingBook(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {generationComplete ? "Book Created Successfully!" : "Creating Your Book"}
            </DialogTitle>
            <DialogDescription>
              {generationComplete 
                ? "Your personalized book has been created and is ready to preview." 
                : "Please wait while we generate your personalized book..."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center">
            {generationComplete ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-lg font-medium mb-2">Book Generation Complete</p>
                <p className="text-gray-600 mb-6">
                  Your personalized book is ready to preview. You can now customize it further or proceed to checkout.
                </p>
                <Button onClick={goToBookPreview} className="mt-4">
                  Preview Book <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
                <p className="text-lg font-medium mb-2">Generating Your Book</p>
                <p className="text-gray-600">
                  We're creating a personalized story based on the child's profile and your selected theme. This may take a minute...
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {generationComplete && (
              <Button variant="outline" onClick={goToDashboard}>
                Back to Dashboard
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
