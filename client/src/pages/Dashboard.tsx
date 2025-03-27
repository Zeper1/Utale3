import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import BookLibrary from "@/components/BookLibrary";
import { 
  BookOpen, 
  User, 
  Package, 
  Plus, 
  MessageSquare, 
  Pencil, 
  MoreHorizontal, 
  ChevronRight, 
  Check,
  Eye,
  Loader2,
  Upload,
  Camera
} from "lucide-react";

// Form schema for character creation
const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type: z.string().default('child'),
  age: z.string()
    .transform(val => {
      if (!val) return null;
      const num = parseInt(val, 10);
      return isNaN(num) ? null : num;
    })
    .nullable()
    .optional(),
  gender: z.string().optional(),
  physicalDescription: z.string().optional(),
  personality: z.string().optional(),
  likes: z.string().optional(),
  dislikes: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Dashboard() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isNewProfileOpen, setIsNewProfileOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [characterType, setCharacterType] = useState<string>("child");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/");
      toast({
        title: "Authentication required",
        description: "Please log in to access your dashboard",
        variant: "destructive",
      });
    }
  }, [user, setLocation, toast]);

  // Fetch character profiles
  const { 
    data: childProfiles = [],
    isLoading: profilesLoading,
    error: profilesError
  } = useQuery({
    queryKey: ['/api/users', user?.id, 'characters'],
    queryFn: () => apiRequest('GET', `/api/users/${user?.id}/characters`).then(res => res.json()),
    enabled: !!user?.id,
  });

  // Fetch books
  const {
    data: books = [],
    isLoading: booksLoading,
    error: booksError
  } = useQuery({
    queryKey: ['/api/users', user?.id, 'books'],
    queryFn: () => apiRequest('GET', `/api/users/${user?.id}/books`).then(res => res.json()),
    enabled: !!user?.id,
  });

  // Fetch orders
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError
  } = useQuery({
    queryKey: ['/api/users', user?.id, 'orders'],
    queryFn: () => apiRequest('GET', `/api/users/${user?.id}/orders`).then(res => res.json()),
    enabled: !!user?.id,
  });

  // Create character profile mutation
  const createProfile = useMutation({
    mutationFn: (profile: any) => 
      apiRequest('POST', '/api/profiles', { ...profile, userId: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'characters'] });
      setIsNewProfileOpen(false);
      toast({
        title: "Perfil creado",
        description: "El perfil ha sido creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating profile",
        description: "There was an error creating the profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Upload avatar for a profile
  const uploadAvatar = async (profileId: number) => {
    if (!avatarFile) return null;
    
    setUploadingAvatar(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      
      const response = await fetch(`/api/profiles/${profileId}/avatar`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      const data = await response.json();
      setUploadingAvatar(false);
      return data.avatarUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error al subir imagen",
        description: "No se pudo subir la imagen de perfil. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
      setUploadingAvatar(false);
      return null;
    }
  };

  // Configure profile form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      age: "",
      gender: "",
      physicalDescription: "",
      personality: "",
      likes: "",
      dislikes: "",
      additionalInfo: ""
    },
  });

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // First create the profile
      const profileResponse = await apiRequest('POST', '/api/profiles', { 
        name: values.name,
        type: values.type || 'child',
        age: values.age ? parseInt(values.age.toString(), 10) : null,
        gender: values.gender,
        userId: user?.id,
        interests: [],
        favorites: {},
        relationships: { friends: [] },
        traits: [],
        physicalDescription: values.physicalDescription || null,
        personality: values.personality || null,
        likes: values.likes || null,
        dislikes: values.dislikes || null,
        additionalInfo: values.additionalInfo || null,
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to create profile');
      }
      
      const profile = await profileResponse.json();
      
      // If we have an avatar file, upload it
      if (avatarFile) {
        await uploadAvatar(profile.id);
      }
      
      // Refresh the profiles list
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'characters'] });
      
      // Close the dialog and reset form
      setIsNewProfileOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      form.reset();
      
      toast({
        title: "Perfil creado",
        description: "El perfil del niño ha sido creado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error al crear perfil",
        description: "Hubo un error al crear el perfil. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Navigate to profile chat
  const goToProfileChat = (profileId: number) => {
    setLocation(`/profile-chat/${profileId}`);
  };

  // Navigate to create book
  const goToCreateBook = () => {
    if (childProfiles.length === 0) {
      toast({
        title: "No profiles yet",
        description: "Please create a child profile first before creating a book.",
      });
      setIsNewProfileOpen(true);
      return;
    }
    setLocation('/create-book');
  };

  if (!user) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mi panel</h1>
          <p className="text-gray-600">Gestiona perfiles, libros y pedidos en un solo lugar</p>
        </div>
        <div className="flex gap-4">
          <Button onClick={goToCreateBook} className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Crear nuevo libro
          </Button>
          <Button onClick={() => setIsNewProfileOpen(true)} variant="outline" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Añadir personaje
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profiles" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Mis Personajes
          </TabsTrigger>
          <TabsTrigger value="books" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Mis Libros
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Pedidos
          </TabsTrigger>
        </TabsList>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-6">
          {profilesLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : profilesError ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-500">Error al cargar los personajes. Por favor, inténtalo de nuevo más tarde.</p>
              </CardContent>
            </Card>
          ) : childProfiles.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center py-12">
                <div className="bg-primary-50 p-4 rounded-full mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Aún no hay personajes</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Comienza creando un personaje para tus historias. Esta información se usará para personalizar los libros.
                </p>
                <Button onClick={() => setIsNewProfileOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Crear primer personaje
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {childProfiles.map((profile: any) => (
                <Card key={profile.id} className="overflow-hidden">
                  <CardHeader className="bg-primary-50 pb-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {profile.avatarUrl ? (
                          <img 
                            src={profile.avatarUrl} 
                            alt={`Avatar de ${profile.name}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <CardTitle>{profile.name}</CardTitle>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          {profile.age} años • {profile.gender === 'boy' ? 'Niño' : 
                                        profile.gender === 'girl' ? 'Niña' : 
                                        profile.gender === 'non-binary' ? 'No binario' : 
                                        "No especificado"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {profile.physicalDescription && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Descripción física</h4>
                          <p className="text-sm text-gray-600">{profile.physicalDescription}</p>
                        </div>
                      )}
                      
                      {profile.personality && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Personalidad</h4>
                          <p className="text-sm text-gray-600">{profile.personality}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        {profile.likes && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Le gusta</h4>
                            <p className="text-sm text-gray-600">{profile.likes}</p>
                          </div>
                        )}
                        
                        {profile.dislikes && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1">No le gusta</h4>
                            <p className="text-sm text-gray-600">{profile.dislikes}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Mantener los campos originales si están presentes */}
                      {profile.interests && profile.interests.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Intereses</h4>
                          <div className="flex flex-wrap gap-1">
                            {profile.interests.map((interest: string, idx: number) => (
                              <span key={idx} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {profile.friends && profile.friends.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Amigos</h4>
                          <p className="text-sm text-gray-600">
                            {profile.friends.slice(0, 3).join(", ")}
                            {profile.friends.length > 3 && ` y ${profile.friends.length - 3} más`}
                          </p>
                        </div>
                      )}
                      
                      {profile.traits && profile.traits.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Rasgos</h4>
                          <div className="flex flex-wrap gap-1">
                            {profile.traits.slice(0, 3).map((trait: string, idx: number) => (
                              <span key={idx} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                {trait}
                              </span>
                            ))}
                            {profile.traits.length > 3 && (
                              <span className="text-xs text-gray-500">+{profile.traits.length - 3} más</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 border-t pt-4">
                    <Button onClick={() => goToProfileChat(profile.id)} variant="outline" className="flex-1 gap-1">
                      <MessageSquare className="h-4 w-4" /> Chat
                    </Button>
                    <Button onClick={goToCreateBook} className="flex-1 gap-1">
                      <BookOpen className="h-4 w-4" /> Crear libro
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              <Card className="border-dashed border-2 flex flex-col justify-center items-center p-6 h-full">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Añadir otro personaje</h3>
                <p className="text-gray-500 text-sm mb-4 text-center">
                  Crea personajes para tus libros y personalízalos a tu gusto
                </p>
                <Button onClick={() => setIsNewProfileOpen(true)} variant="outline">
                  Añadir personaje
                </Button>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Books Tab */}
        <TabsContent value="books" className="space-y-6">
          {booksLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : booksError ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-500">Error al cargar los libros. Por favor, inténtalo de nuevo más tarde.</p>
              </CardContent>
            </Card>
          ) : books.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center py-12">
                <div className="bg-primary-50 p-4 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Aún no hay libros creados</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Crea tu primer libro personalizado. Selecciona un personaje y un tema para empezar.
                </p>
                <Button onClick={goToCreateBook}>
                  <Plus className="h-4 w-4 mr-2" /> Crear primer libro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Tu biblioteca de libros</h2>
                <Button onClick={goToCreateBook} variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Crear nuevo libro
                </Button>
              </div>
              
              {user && user.id && (
                <BookLibrary userId={user.id} />
              )}
            </>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : ordersError ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-500">Error al cargar los pedidos. Por favor, inténtalo de nuevo más tarde.</p>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center text-center py-12">
                <div className="bg-primary-50 p-4 rounded-full mb-4">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Aún no hay pedidos</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Después de crear tu libro personalizado, puedes hacer un pedido para obtener una copia impresa o descarga digital.
                </p>
                <Button onClick={goToCreateBook}>
                  <Plus className="h-4 w-4 mr-2" /> Crea un libro primero
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order: any) => {
                const book = books.find((b: any) => b.id === order.bookId);
                return (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex gap-4">
                          <div className="h-20 w-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                            {book?.previewImage ? (
                              <img 
                                src={book.previewImage} 
                                alt={book?.title || "Portada del libro"} 
                                className="h-full w-full object-cover rounded"
                              />
                            ) : (
                              <BookOpen className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{book?.title || "Libro personalizado"}</h3>
                            <p className="text-sm text-gray-600">
                              {book?.format || "Formato desconocido"} • Pedido #{order.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              Pedido el {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${(order.amount / 100).toFixed(2)}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status === 'completed' ? 'Completado' : 
                              order.status === 'pending' ? 'Pendiente' : 
                              order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button variant="outline" size="sm">
                              Seguir pedido
                            </Button>
                            <Button variant="ghost" size="sm">
                              Detalles
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Profile Dialog */}
      <Dialog open={isNewProfileOpen} onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setAvatarFile(null);
          setAvatarPreview(null);
        }
        setIsNewProfileOpen(open);
      }}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Crear personaje</DialogTitle>
            <DialogDescription>
              Crea un personaje para tu historia. Puede ser un niño, mascota, juguete o cualquier otro protagonista.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Avatar upload */}
              <div className="flex flex-col items-center space-y-4 mb-6">
                <div 
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={handleUploadClick}
                >
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Vista previa del avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={handleUploadClick}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Subir foto
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Opcional: Sube una foto del personaje para personalizar su avatar en los libros
                </p>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre del personaje" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de personaje</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setCharacterType(value);
                        
                        // Resetear los campos específicos de otros tipos de personajes
                        if (value !== 'child') {
                          form.setValue('gender', '');
                        }
                      }}
                      defaultValue={field.value || "child"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="child">Niño/a</SelectItem>
                        <SelectItem value="toy">Juguete/Peluche</SelectItem>
                        <SelectItem value="pet">Mascota</SelectItem>
                        <SelectItem value="fantasy">Personaje fantástico</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      El tipo de protagonista para la historia
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {characterType === 'child' && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field: { value, onChange, ...rest } }) => (
                      <FormItem>
                        <FormLabel>Edad (Opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            max="18" 
                            placeholder="Edad" 
                            value={value === null ? '' : value}
                            onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
                            {...rest} 
                          />
                        </FormControl>
                        <FormDescription>
                          Edad del niño/a
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Género (Opcional)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona género" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="boy">Niño</SelectItem>
                            <SelectItem value="girl">Niña</SelectItem>
                            <SelectItem value="non-binary">No binario</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefiero no decirlo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {characterType === 'pet' && (
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field: { value, onChange, ...rest } }) => (
                    <FormItem>
                      <FormLabel>Edad (Opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="30" 
                          placeholder="Edad" 
                          value={value === null ? '' : value}
                          onChange={e => onChange(e.target.value === '' ? null : Number(e.target.value))}
                          {...rest} 
                        />
                      </FormControl>
                      <FormDescription>
                        Edad aproximada de la mascota
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Additional description fields */}
              <FormField
                control={form.control}
                name="physicalDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción física (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={
                          characterType === 'child' ? "Describe su apariencia: cabello, ojos, altura, etc." : 
                          characterType === 'toy' ? "Describe cómo es el juguete/peluche: color, material, forma, etc." : 
                          characterType === 'pet' ? "Describe cómo es la mascota: especie, raza, color, tamaño, etc." : 
                          characterType === 'fantasy' ? "Describe cómo es este personaje fantástico: apariencia, rasgos especiales, etc." :
                          "Describe la apariencia física del personaje"
                        }
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personalidad (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={
                          characterType === 'child' ? "Describe su personalidad: tímido, aventurero, curioso, etc." : 
                          characterType === 'toy' ? "Describe cómo se comporta el juguete/peluche: amigable, protector, divertido, etc." : 
                          characterType === 'pet' ? "Describe el comportamiento de la mascota: juguetón, tranquilo, cariñoso, etc." : 
                          characterType === 'fantasy' ? "Describe cómo es su actitud: valiente, misterioso, sabio, etc." :
                          "Describe la personalidad del personaje"
                        }
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="likes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Le gusta (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            characterType === 'child' ? "¿Qué le gusta? Juegos, comidas, actividades..." : 
                            characterType === 'toy' ? "¿Qué le gusta a este juguete/peluche? Momentos, lugares, situaciones..." : 
                            characterType === 'pet' ? "¿Qué le gusta a esta mascota? Juguetes, actividades, comidas..." : 
                            characterType === 'fantasy' ? "¿Qué le gusta a este personaje fantástico? Magia, aventuras, objetos..." :
                            "¿Qué le gusta al personaje? Actividades, objetos, lugares..."
                          }
                          className="resize-none h-24" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dislikes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No le gusta (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            characterType === 'child' ? "¿Qué no le gusta? Miedos, situaciones, comidas..." : 
                            characterType === 'toy' ? "¿Qué no le gusta a este juguete/peluche? Situaciones, lugares..." : 
                            characterType === 'pet' ? "¿Qué no le gusta a esta mascota? Sonidos, objetos, situaciones..." : 
                            characterType === 'fantasy' ? "¿Qué no le gusta a este personaje fantástico? Enemigos, situaciones, lugares..." :
                            "¿Qué no le gusta al personaje? Situaciones, eventos, objetos..."
                          }
                          className="resize-none h-24" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Información adicional (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={
                          characterType === 'child' ? "Cualquier otra información sobre el niño/a que quieras incluir en sus historias..." : 
                          characterType === 'toy' ? "Historia del juguete/peluche, quién es su dueño, cómo llegó a la familia..." : 
                          characterType === 'pet' ? "Historial de la mascota, anécdotas especiales, relación con la familia..." : 
                          characterType === 'fantasy' ? "Poderes, habilidades especiales, origen, historia, mundo del que proviene..." :
                          "Cualquier otra información relevante que quieras compartir para personalizar mejor los libros"
                        }
                        className="resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => {
                  setIsNewProfileOpen(false);
                  form.reset();
                  setAvatarFile(null);
                  setAvatarPreview(null);
                }}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProfile.isPending || uploadingAvatar}
                >
                  {createProfile.isPending || uploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : 'Crear personaje'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}