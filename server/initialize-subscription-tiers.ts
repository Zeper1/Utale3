import { storage } from "./storage";
import { priceTiers } from "../shared/pricing";

/**
 * Script para inicializar los niveles de suscripción en la base de datos.
 * Los niveles se generan a partir de los precios definidos en shared/pricing.ts
 */
export async function initializeSubscriptionTiers() {
  console.log("Iniciando la configuración de niveles de suscripción...");

  try {
    // Obtener tiers existentes para evitar duplicados
    const existingTiers = await storage.getSubscriptionTiers();
    
    // Convertir precios de euros a céntimos
    for (const tier of priceTiers) {
      // Buscar si ya existe un tier con estas características
      const existingTier = existingTiers.find(
        et => et.books === tier.books && et.pages === tier.pages
      );
      
      if (existingTier) {
        // Actualizar el tier existente si es necesario
        if (
          existingTier.name !== tier.name ||
          existingTier.pricePerWeek !== Math.round(tier.pricePerWeek * 100) ||
          existingTier.discount !== tier.discount ||
          existingTier.description !== tier.description
        ) {
          console.log(`Actualizando tier: ${tier.name} (${tier.books} libros, ${tier.pages} páginas)`);
          await storage.updateSubscriptionTier(existingTier.id, {
            name: tier.name,
            pricePerWeek: Math.round(tier.pricePerWeek * 100), // Convertir a céntimos
            discount: tier.discount,
            description: tier.description,
          });
        }
      } else {
        // Crear nuevo tier
        console.log(`Creando nuevo tier: ${tier.name} (${tier.books} libros, ${tier.pages} páginas)`);
        await storage.createSubscriptionTier({
          name: tier.name,
          books: tier.books,
          pages: tier.pages,
          pricePerWeek: Math.round(tier.pricePerWeek * 100), // Convertir a céntimos
          discount: tier.discount,
          description: tier.description,
          stripePriceId: tier.stripePriceId,
          active: true,
        });
      }
    }
    
    console.log("Niveles de suscripción inicializados correctamente.");
  } catch (error) {
    console.error("Error al inicializar los niveles de suscripción:", error);
  }
}

// Si este script se ejecuta directamente, inicializar los niveles
if (require.main === module) {
  initializeSubscriptionTiers()
    .then(() => {
      console.log("Proceso completado.");
      process.exit(0);
    })
    .catch(error => {
      console.error("Error en el proceso:", error);
      process.exit(1);
    });
}