import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Share } from 'lucide-react';
import { Book } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface BookViewerProps {
  book: Book;
  onClose?: () => void;
}

const BookViewer = ({ book, onClose }: BookViewerProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const bookContent = book.content as any;
  
  if (!bookContent || !bookContent.pages || !bookContent.pages.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-xl font-medium mb-2">No preview available</h3>
        <p className="text-muted-foreground">This book doesn't have any content yet.</p>
      </div>
    );
  }
  
  const totalPages = bookContent.pages.length;
  
  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : prev));
  };
  
  const handleNextPage = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : prev));
  };
  
  const currentPageData = bookContent.pages[currentPage];
  
  return (
    <div className="flex flex-col h-full">
      {/* Book title */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold font-heading bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
          {book.title}
        </h2>
      </div>
      
      {/* Book viewer */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Book page controls */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90",
              currentPage === 0 && "opacity-50 cursor-not-allowed"
            )}
            onClick={handlePrevPage}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background/90",
              currentPage === totalPages - 1 && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          
          {/* Page content */}
          <div className="h-full w-full flex flex-col md:flex-row">
            {/* Image */}
            <div className="w-full md:w-1/2 h-48 md:h-full relative">
              {currentPageData.imageUrl ? (
                <img
                  src={currentPageData.imageUrl}
                  alt={`Page ${currentPage + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <Skeleton className="w-full h-full" />
                </div>
              )}
            </div>
            
            {/* Text */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Page {currentPage + 1} of {totalPages}</p>
                <p className="text-lg leading-relaxed">{currentPageData.text}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Book controls */}
      <div className="flex justify-center mt-4 gap-4">
        <Button variant="outline" size="sm" onClick={() => setCurrentPage(0)}>
          First Page
        </Button>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => window.open(`/api/books/${book.id}/download`, '_blank')}
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" size="sm">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </div>
  );
};

export default BookViewer;