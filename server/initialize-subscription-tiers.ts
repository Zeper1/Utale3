import { storage } from "./storage";
import { priceTiers } from "../shared/pricing";
import { createLogger } from "./lib/logger";

// Crear un logger específico para la inicialización de niveles de suscripción
const subscriptionLogger = createLogger('subscription-tiers');

/**
 * Script para inicializar los niveles de suscripción en la base de datos.
 * Los niveles se generan a partir de los precios definidos en shared/pricing.ts
 */
export async function initializeSubscriptionTiers() {
  subscriptionLogger.info("Iniciando la configuración de niveles de suscripción...");

  try {
    // Obtener tiers existentes para evitar duplicados
    const existingTiers = await storage.getSubscriptionTiers();
    
    subscriptionLogger.debug(`Encontrados ${existingTiers.length} niveles de suscripción existentes`);
    
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
          subscriptionLogger.info(`Actualizando tier: ${tier.name} (${tier.books} libros, ${tier.pages} páginas)`, {
            tierId: existingTier.id,
            oldPrice: existingTier.pricePerWeek,
            newPrice: Math.round(tier.pricePerWeek * 100)
          });
          
          await storage.updateSubscriptionTier(existingTier.id, {
            name: tier.name,
            pricePerWeek: Math.round(tier.pricePerWeek * 100), // Convertir a céntimos
            discount: tier.discount,
            description: tier.description,
          });
        } else {
          subscriptionLogger.debug(`Tier existente sin cambios: ${tier.name} (${tier.books} libros, ${tier.pages} páginas)`);
        }
      } else {
        // Crear nuevo tier
        subscriptionLogger.info(`Creando nuevo tier: ${tier.name} (${tier.books} libros, ${tier.pages} páginas)`, {
          books: tier.books,
          pages: tier.pages,
          price: Math.round(tier.pricePerWeek * 100)
        });
        
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
    
    subscriptionLogger.info("Niveles de suscripción inicializados correctamente");
  } catch (error) {
    subscriptionLogger.error("Error al inicializar los niveles de suscripción", {
      error: error instanceof Error ? error.stack : String(error)
    });
  }
}

// Si este script se ejecuta directamente, inicializar los niveles
// Nota: En el contexto de ESM, no hay un equivalente directo de require.main === module
// pero como este script se importa y no se ejecuta directamente, esta parte no se utiliza
/*
if (import.meta.url === process.argv[1]) {
  initializeSubscriptionTiers()
    .then(() => {
      subscriptionLogger.info("Proceso de inicialización de niveles de suscripción completado");
      process.exit(0);
    })
    .catch(error => {
      subscriptionLogger.error("Error en el proceso de inicialización de niveles de suscripción", {
        error: error instanceof Error ? error.stack : String(error)
      });
      process.exit(1);
    });
}
*/