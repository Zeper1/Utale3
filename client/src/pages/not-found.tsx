import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 pb-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900">404 - Página no encontrada</h1>
          </div>

          <p className="mt-4 mb-6 text-sm text-gray-600">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/">Volver al inicio</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard">Mi panel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
