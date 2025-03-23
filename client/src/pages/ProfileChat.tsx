import { useState, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { sendChatMessage } from "@/lib/openai";
import { ArrowLeft, Send, Bot, User, CornerDownRight, Loader } from "lucide-react";

interface Message {
  id: number;
  message: string;
  sender: 'user' | 'system';
  createdAt: string;
}

export default function ProfileChat() {
  const [_, params] = useRoute<{ id: string }>('/profile-chat/:id');
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const profileId = params?.id ? parseInt(params.id) : null;

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/");
      toast({
        title: "Authentication required",
        description: "Please log in to access the chat",
        variant: "destructive",
      });
    }
  }, [user, setLocation, toast]);

  // Fetch child profile
  const { 
    data: profile,
    isLoading: profileLoading,
    error: profileError
  } = useQuery({
    queryKey: ['/api/profiles', profileId],
    queryFn: () => apiRequest('GET', `/api/profiles/${profileId}`).then(res => res.json()),
    enabled: !!profileId && !!user?.id,
  });

  // Fetch chat messages
  const { 
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError
  } = useQuery({
    queryKey: ['/api/profiles', profileId, 'chat'],
    queryFn: () => apiRequest('GET', `/api/profiles/${profileId}/chat`).then(res => res.json()),
    enabled: !!profileId && !!user?.id,
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (messageText: string) => {
      setIsSending(true);
      try {
        const response = await sendChatMessage(user!.id, profileId!, messageText);
        return response;
      } finally {
        setIsSending(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles', profileId, 'chat'] });
      queryClient.invalidateQueries({ queryKey: ['/api/profiles', profileId] });
      setMessage('');
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isSending) {
      sendMessage.mutate(message.trim());
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleGoBack = () => {
    setLocation('/dashboard');
  };

  if (!user || !profileId) {
    return null;
  }

  const isLoading = profileLoading || messagesLoading;
  const hasError = profileError || messagesError;

  const getProfileDetails = () => {
    const details = [];
    
    if (profile?.interests?.length > 0) {
      details.push(`Interests: ${profile.interests.join(', ')}`);
    }
    
    if (profile?.friends?.length > 0) {
      details.push(`Friends: ${profile.friends.join(', ')}`);
    }
    
    if (profile?.favorites && Object.keys(profile.favorites).length > 0) {
      const favorites = Object.entries(profile.favorites)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      details.push(`Favorites: ${favorites}`);
    }
    
    if (profile?.traits?.length > 0) {
      details.push(`Traits: ${profile.traits.join(', ')}`);
    }
    
    return details;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSuggestedPrompts = () => {
    if (!profile) return [];
    
    const prompts = [
      `What are ${profile.name}'s favorite activities?`,
      `Who are ${profile.name}'s best friends?`,
      `What makes ${profile.name} happy?`,
      `Does ${profile.name} have any pets?`,
      `What's ${profile.name}'s favorite color?`,
      `What is ${profile.name} afraid of?`,
      `What does ${profile.name} want to be when they grow up?`
    ];
    
    return prompts;
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
        <div className="flex items-center mb-4">
          <Button variant="ghost" onClick={handleGoBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Chat with Our Assistant</h1>
        </div>
        
        {isLoading ? (
          <div className="flex-1 flex justify-center items-center">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hasError ? (
          <Card className="flex-1">
            <CardContent className="pt-6 flex flex-col items-center justify-center h-full">
              <p className="text-red-500 mb-4">Error loading the chat. Please try again later.</p>
              <Button onClick={handleGoBack}>Back to Dashboard</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {/* Profile Information */}
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Avatar className="h-10 w-10 mr-2">
                      <AvatarFallback>{profile?.name?.charAt(0) || 'C'}</AvatarFallback>
                    </Avatar>
                    {profile?.name}'s Profile
                  </CardTitle>
                  <CardDescription>
                    Age: {profile?.age || 'Not specified'} • {profile?.gender || 'Not specified'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Profile Information</h3>
                      {getProfileDetails().length > 0 ? (
                        <ul className="space-y-2 text-sm">
                          {getProfileDetails().map((detail, index) => (
                            <li key={index} className="text-gray-600">
                              <CornerDownRight className="h-3 w-3 inline mr-2 text-gray-400" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Start chatting to build {profile?.name}'s profile. The more information you provide, the more personalized the stories will be.
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Suggested Questions</h3>
                      <div className="space-y-2">
                        {getSuggestedPrompts().map((prompt, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm" 
                            className="text-xs justify-start text-left h-auto py-1.5 w-full"
                            onClick={() => handlePromptClick(prompt)}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Chat Interface */}
            <div className="md:col-span-2 flex flex-col h-full">
              <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle>Chat with StoryMagic Assistant</CardTitle>
                  <CardDescription>
                    Tell us about {profile?.name} to help create more personalized stories
                  </CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-4 pb-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Bot className="h-12 w-12 text-primary mb-4" />
                        <h3 className="text-lg font-medium mb-2">Start Your Conversation</h3>
                        <p className="text-gray-600 max-w-md mb-6">
                          Tell us about {profile?.name}'s interests, friends, and personality to create more personalized stories.
                        </p>
                      </div>
                    ) : (
                      messages.map((msg: Message) => (
                        <div 
                          key={msg.id}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.sender === 'user' ? 'bg-primary text-white ml-2' : 'bg-gray-100 text-gray-500 mr-2'}`}>
                              {msg.sender === 'user' ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <Bot className="h-4 w-4" />
                              )}
                            </div>
                            <div className={`rounded-lg px-4 py-2 ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 text-gray-800'}`}>
                              <div className="text-sm">{msg.message}</div>
                              <div className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-primary-100' : 'text-gray-500'}`}>
                                {formatDate(msg.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
                <CardFooter className="border-t pt-4 pb-4">
                  <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      disabled={isSending}
                      ref={inputRef}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isSending || !message.trim()}>
                      {isSending ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
