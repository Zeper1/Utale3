/**
 * Modelo de precios para suscripciones de StoryMagic
 * Precios en euros (€) por semana según número de libros y páginas por libro
 */

export type PriceTier = {
  name: string;
  books: number;
  pages: number;
  pricePerWeek: number;
  discount: number; // Porcentaje de descuento comparado con precio base
  description: string;
  stripePriceId?: string; // Se añadirá cuando se configure Stripe
};

export const BASE_PRICE_PER_BOOK = 2.50; // €2.50 por un libro de 10 páginas
export const ADDITIONAL_PAGE_PRICE = 0.10; // €0.10 por página adicional

// Cálculo de precios con descuentos progresivos
const calculatePrice = (books: number, pages: number): number => {
  const basePrice = BASE_PRICE_PER_BOOK * books;
  const additionalPagesCost = (pages > 10) ? (pages - 10) * ADDITIONAL_PAGE_PRICE * books : 0;
  
  // Descuentos por volumen (libros)
  let volumeDiscount = 0;
  if (books >= 7) volumeDiscount = 0.30;
  else if (books >= 5) volumeDiscount = 0.25;
  else if (books >= 3) volumeDiscount = 0.20;
  else if (books >= 2) volumeDiscount = 0.10;
  
  // Descuento por páginas
  let pagesDiscount = 0;
  if (pages >= 30) pagesDiscount = 0.10;
  else if (pages >= 20) pagesDiscount = 0.05;
  
  // Descuento total
  const totalDiscount = Math.min(volumeDiscount + pagesDiscount, 0.40); // Máximo 40% de descuento
  
  // Precio final
  const finalPrice = (basePrice + additionalPagesCost) * (1 - totalDiscount);
  
  // Redondear a 2 decimales
  return Math.round(finalPrice * 100) / 100;
};

// Calcular el porcentaje de descuento frente al precio base
const calculateDiscount = (books: number, pages: number): number => {
  const priceWithoutDiscount = (BASE_PRICE_PER_BOOK + (pages > 10 ? (pages - 10) * ADDITIONAL_PAGE_PRICE : 0)) * books;
  const priceWithDiscount = calculatePrice(books, pages);
  const discount = 100 * (1 - (priceWithDiscount / priceWithoutDiscount));
  return Math.round(discount);
};

export const generatePriceTiers = (): PriceTier[] => {
  const pageTiers = [10, 20, 30, 40];
  const bookTiers = [1, 2, 3, 4, 5, 6, 7];
  
  const tiers: PriceTier[] = [];
  
  for (const books of bookTiers) {
    for (const pages of pageTiers) {
      const price = calculatePrice(books, pages);
      const discount = calculateDiscount(books, pages);
      
      let name = '';
      if (books === 1) {
        name = 'Básico';
        if (pages >= 30) name = 'Básico Premium';
      } else if (books <= 3) {
        name = 'Estándar';
        if (pages >= 30) name = 'Estándar Premium';
      } else if (books <= 5) {
        name = 'Avanzado';
        if (pages >= 30) name = 'Avanzado Premium';
      } else {
        name = 'Profesional';
        if (pages >= 30) name = 'Profesional Premium';
      }
      
      if (books === 7 && pages === 40) {
        name = 'Todo Incluido';
      }
      
      let description = `${books} libro${books > 1 ? 's' : ''} semanal${books > 1 ? 'es' : ''} de ${pages} páginas.`;
      if (discount > 0) {
        description += ` ¡Ahorra un ${discount}%!`;
      }
      
      tiers.push({
        name,
        books,
        pages,
        pricePerWeek: price,
        discount,
        description
      });
    }
  }
  
  return tiers;
};

export const priceTiers = generatePriceTiers();

// Función para obtener un tier por número de libros y páginas
export const getPriceTier = (books: number, pages: number): PriceTier | undefined => {
  return priceTiers.find(tier => tier.books === books && tier.pages === pages);
};

// Función para obtener tiers recomendados (destacados)
export const getRecommendedTiers = (): PriceTier[] => {
  return [
    getPriceTier(1, 10)!, // Básico
    getPriceTier(3, 20)!, // Estándar
    getPriceTier(5, 30)!, // Avanzado
    getPriceTier(7, 40)!, // Todo Incluido
  ];
};