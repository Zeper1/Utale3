import React, { useState } from 'react';
import { Link } from 'wouter';
import { Book } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';
import { Eye, BookOpen, Download, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BookViewer from './BookViewer';
import { useToast } from '@/hooks/use-toast';

interface BookLibraryProps {
  userId: number;
}

const BookLibrary = ({ userId }: BookLibraryProps) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const { toast } = useToast();
  
  const { data: books, isLoading, error } = useQuery({
    queryKey: ['/api/users', userId, 'books'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/books`);
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      return response.json();
    },
    enabled: !!userId,
  });
  
  const handleViewBook = (book: Book) => {
    setSelectedBook(book);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Draft</Badge>;
      case 'generating':
        return <Badge><Clock className="h-3 w-3 mr-1" /> Generating</Badge>;
      case 'completed':
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="w-full aspect-[3/4]">
              <Skeleton className="w-full h-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-2/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Failed to load your library</h3>
        <p className="text-muted-foreground mb-4">
          We encountered an error while trying to load your books.
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }
  
  if (!books || books.length === 0) {
    return (
      <div className="p-8 text-center border rounded-lg">
        <BookOpen className="h-12 w-12 text-primary/60 mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">Your library is empty</h3>
        <p className="text-muted-foreground mb-4">
          You haven't created any books yet. Start by creating a new book!
        </p>
        <Link href="/create-book">
          <Button>Create Your First Book</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book: Book) => (
          <Card key={book.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <div className="w-full aspect-[3/4] relative">
              {book.previewImage ? (
                <img 
                  src={book.previewImage} 
                  alt={book.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <BookOpen className="h-16 w-16 text-primary/40" />
                </div>
              )}
              
              <div className="absolute top-2 right-2">
                {getStatusBadge(book.status)}
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <h3 className="text-lg font-bold font-heading line-clamp-1">{book.title}</h3>
            </CardHeader>
            
            <CardContent className="pb-2">
              <p className="text-sm text-muted-foreground">
                Format: {book.format.charAt(0).toUpperCase() + book.format.slice(1)}
              </p>
              <p className="text-sm text-muted-foreground">
                Created: {new Date(book.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
            
            <CardFooter className="pt-0">
              <div className="w-full flex gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleViewBook(book)}
                  disabled={book.status !== 'completed' && book.status !== 'draft'}
                >
                  <Eye className="h-4 w-4 mr-2" /> View
                </Button>
                
                {book.status === 'completed' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      if (book.orderReference) {
                        window.open(book.orderReference, '_blank');
                      } else {
                        toast({
                          title: "Download not available",
                          description: "This book doesn't have a download link yet.",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" /> PDF
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <Dialog open={!!selectedBook} onOpenChange={(open) => !open && setSelectedBook(null)}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Book Preview</DialogTitle>
          </DialogHeader>
          {selectedBook && <BookViewer book={selectedBook} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BookLibrary;