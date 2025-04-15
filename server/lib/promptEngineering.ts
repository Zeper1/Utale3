import { Character, BookTheme } from "@shared/schema";
import { z } from "zod";

/**
 * Tipos para los detalles específicos de la historia
 */
export interface StoryDetails {
  pageCount?: number;
  style?: string;
  tone?: string;
  setting?: string;
  message?: string;
  specificElements?: string[];
  characterDetails?: Record<number, CharacterStoryDetails>;
}

/**
 * Detalles específicos de un personaje en el contexto de una historia
 */
export interface CharacterStoryDetails {
  role?: string;
  abilities?: string;
  details?: string;
  relationToMain?: string;
}

/**
 * Tipo extendido de Character con campos específicos para la historia
 */
export interface ExtendedCharacter extends Character {
  specificRole?: string;
  specialAbilities?: string;
  storySpecificDetails?: string;
  relationToMainCharacter?: string;
}

/**
 * Enriquecer personaje con detalles específicos para la historia
 */
export function processCharacterWithStoryDetails(
  character: Character, 
  storySpecificDetails?: CharacterStoryDetails
): ExtendedCharacter {
  if (!storySpecificDetails) return character as ExtendedCharacter;
  
  return {
    ...character,
    specificRole: storySpecificDetails.role,
    specialAbilities: storySpecificDetails.abilities,
    storySpecificDetails: storySpecificDetails.details,
    relationToMainCharacter: storySpecificDetails.relationToMain
  };
}

/**
 * Genera el prompt del sistema para dirigir la generación de la historia
 * @param bookType Tipo de libro a generar (puede incluir estilos o enfoques específicos)
 */
export function generateSystemPrompt(bookType?: string): string {
  let basePrompt = `Eres un autor profesional de literatura infantil con amplia experiencia en narrativa personalizada y desarrollo de personajes.
  
Tu tarea es crear un libro infantil personalizado que sea completamente único, atractivo y adaptado a los personajes proporcionados.
  
REGLAS NARRATIVAS:
- Estructura clara con introducción, nudo y desenlace bien definidos
- Incorpora 2-3 puntos de giro que mantengan el interés de los niños
- El protagonista debe enfrentar un desafío apropiado para su edad y personalidad
- Incluye momentos de descubrimiento, asombro o aprendizaje
- Los personajes secundarios deben tener un propósito claro en la historia
- El conflicto debe resolverse de forma positiva y constructiva
- Incluye diálogos identificables y apropiados para cada personaje
- El lenguaje debe ser accesible para el rango de edad objetivo del libro
- Proporciona un mensaje o valor educativo sutil pero significativo
- La historia debe tener un ritmo equilibrado: momentos de acción, reflexión y emoción
  
REGLAS TÉCNICAS PARA PROMPTS DE IMAGEN:
- Aspect ratio 16:9 para todas las ilustraciones
- Composición siguiendo la regla de los tercios (elementos importantes en los puntos de intersección)
- Profundidad de campo con primer plano, plano medio y fondo claramente definidos
- Coherencia visual entre personajes a lo largo de todo el libro
- Variedad de ángulos y perspectivas que eviten la monotonía
- Iluminación que refuerce el tono emocional de cada escena
- Paleta de colores cohesiva que refleje el tema y tono de la historia
- Equilibrio entre espacios positivos y negativos en la composición
- Expresiones faciales y lenguaje corporal que comuniquen claramente las emociones
- Cada imagen debe ilustrar específicamente el texto de su página correspondiente

FORMATO REQUERIDO:
Debes generar un objeto JSON con la siguiente estructura exacta:
{
  "title": "Título de la historia que incluya referencia a los personajes principales",
  "pages": [
    {
      "pageNumber": 1,
      "text": "Texto narrativo para esta página (2-4 frases apropiadas para la edad objetivo)",
      "imagePrompt": "Prompt detallado para ilustrar esta escena, siguiendo todas las reglas técnicas"
    },
    ...
  ],
  "summary": "Resumen de la historia en 3-5 frases",
  "targetAge": "Rango de edad recomendado",
  "theme": "Tema principal",
  "characters": ["Nombre1", "Nombre2", ...],
  "educationalValue": "Brevemente, qué pueden aprender los niños de esta historia"
}`;

  // Añadir instrucciones específicas según el tipo de libro
  if (bookType === "aventura") {
    basePrompt += `\n\nESTILO ESPECÍFICO:
- Usa un tono dinámico y emocionante con verbos de acción
- Incluye al menos un momento de "casi fracaso" antes del éxito
- Incorpora escenarios variados que cambien a lo largo de la historia
- Utiliza onomatopeyas y expresiones que transmitan emoción y movimiento`;
  } else if (bookType === "fantasía") {
    basePrompt += `\n\nESTILO ESPECÍFICO:
- Incorpora elementos mágicos o fantásticos que se integren naturalmente en el mundo
- Crea reglas claras para los elementos fantásticos (consistencia interna)
- Equilibra lo maravilloso con momentos de conexión emocional
- Incluye descripciones evocadoras que estimulen la imaginación`;
  } else if (bookType === "educativo") {
    basePrompt += `\n\nESTILO ESPECÍFICO:
- Integra contenido educativo de forma entretenida, nunca didáctica o aburrida
- Asegúrate de que el aprendizaje surja naturalmente de la narrativa
- Incluye datos precisos pero presentados de forma accesible
- Despierta curiosidad sobre el tema que pueda extenderse más allá de la lectura`;
  }

  return basePrompt;
}

/**
 * Genera un prompt para el usuario integrando toda la información disponible
 */
export function generateUserPrompt(
  mainCharacter: Character & Partial<CharacterStoryDetails>,
  supportingCharacters: (Character & Partial<CharacterStoryDetails>)[],
  theme: BookTheme,
  pageCount: number,
  storyDetails?: StoryDetails
): string {
  // Formatear detalles del personaje principal con manejo seguro de valores nulos/indefinidos
  const mainCharInfo = formatCharacterInfo(mainCharacter, true);

  // Formatear detalles de personajes secundarios
  const supportingCharsInfo = supportingCharacters.length > 0
    ? `\nPERSONAJES SECUNDARIOS:\n${supportingCharacters.map(char => formatCharacterInfo(char, false)).join('\n\n')}`
    : '';

  // Formatear detalles del tema y la historia
  const themeInfo = `
TEMA Y DETALLES DE LA HISTORIA:
- Tema principal: ${theme.name}
- Rango de edad recomendado: ${theme.ageRange || '5-10 años'}
- Número de páginas: ${pageCount} (más 1 portada)
${storyDetails?.style ? `- Estilo narrativo: ${storyDetails.style}` : ''}
${storyDetails?.tone ? `- Tono: ${storyDetails.tone}` : ''}
${storyDetails?.setting ? `- Escenario principal: ${storyDetails.setting}` : ''}
${storyDetails?.message ? `- Mensaje/Moraleja: ${storyDetails.message}` : ''}
${storyDetails?.specificElements && storyDetails.specificElements.length > 0 
  ? `- Elementos específicos a incluir: ${storyDetails.specificElements.join(', ')}` 
  : ''}`;

  return `Crea una historia personalizada original con ${mainCharacter.name} como protagonista principal${
    supportingCharacters.length > 0
      ? ` y con ${supportingCharacters.map(c => c.name).join(', ')} como personaje(s) secundario(s)`
      : ''
  }.

${mainCharInfo}
${supportingCharsInfo}
${themeInfo}

REQUISITOS ESPECÍFICOS:
- Crea una historia única y encantadora que refleje auténticamente las personalidades y características de todos los personajes.
- La historia debe tener exactamente ${pageCount + 1} páginas: 1 portada + ${pageCount} páginas de contenido.
- Cada página debe tener un texto atractivo y una descripción detallada para su ilustración.
${supportingCharacters.length > 0 ? '- Incluye momentos destacados para cada personaje secundario.' : ''}
- Aprovecha los gustos e intereses de los personajes para crear situaciones relevantes.
- Desarrolla arcos narrativos coherentes con la edad y tipo de los personajes.
- Asegúrate de que las ilustraciones descritas en los prompts sigan las reglas técnicas especificadas y muestren claramente a los personajes relevantes.`;
}

/**
 * Formatea la información de un personaje para incluirla en el prompt
 * Maneja de forma segura los campos que podrían ser nulos o indefinidos
 */
function formatCharacterInfo(
  character: Character & Partial<CharacterStoryDetails>,
  isMainCharacter: boolean
): string {
  const sections: string[] = [];
  
  // Sección principal con información básica
  sections.push(`
${isMainCharacter ? 'PERSONAJE PRINCIPAL:' : ''}
- Nombre: ${character.name}
- Tipo: ${character.type || 'personaje'}
${character.age ? `- Edad: ${character.age}` : ''}`);

  // Características físicas y personalidad
  const characterFeatures: string[] = [];
  if (character.physicalDescription) {
    characterFeatures.push(`- Apariencia: ${character.physicalDescription}`);
  }
  if (character.personality) {
    characterFeatures.push(`- Personalidad: ${character.personality}`);
  }
  
  // Intereses y preferencias
  if (character.interests && character.interests.length > 0) {
    characterFeatures.push(`- Intereses: ${character.interests.join(', ')}`);
  }
  if (character.likes) {
    characterFeatures.push(`- Le gusta: ${character.likes}`);
  }
  if (character.dislikes) {
    characterFeatures.push(`- No le gusta: ${character.dislikes}`);
  }
  
  // Cosas favoritas 
  if (character.favorites && Object.keys(character.favorites).length > 0) {
    try {
      // Manejar tanto objetos como strings (por si viene como JSON serializado)
      const favorites = typeof character.favorites === 'string' 
        ? JSON.parse(character.favorites) 
        : character.favorites;
      
      const favoritesFormatted = Object.entries(favorites)
        .filter(([_, value]) => value) // Filtrar valores vacíos
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      if (favoritesFormatted) {
        characterFeatures.push(`- Cosas favoritas: ${favoritesFormatted}`);
      }
    } catch (e) {
      // Si hay error al parsear, lo omitimos
    }
  }
  
  // Detalles específicos de la historia
  if (character.specificRole) {
    characterFeatures.push(`- Rol en esta historia: ${character.specificRole}`);
  }
  if (character.specialAbilities) {
    characterFeatures.push(`- Habilidades especiales: ${character.specialAbilities}`);
  }
  if (character.storySpecificDetails) {
    characterFeatures.push(`- Detalles específicos: ${character.storySpecificDetails}`);
  }
  if (!isMainCharacter && character.relationToMainCharacter) {
    characterFeatures.push(`- Relación con el protagonista: ${character.relationToMainCharacter}`);
  }
  
  // Unir todas las características
  if (characterFeatures.length > 0) {
    sections.push(characterFeatures.join('\n'));
  }
  
  return sections.join('\n');
}

/**
 * Determina la emoción dominante en una escena basada en el texto
 */
export function determineSceneEmotion(text: string): string {
  const emotions = {
    alegre: [
      'alegría', 'feliz', 'sonrisa', 'risa', 'celebrar', 'diversión', 'jugar', 'contento', 
      'divertido', 'entusiasmo', 'gozo', 'satisfacción', 'alegremente', 'emocionado', 
      'encantado', 'festejo', 'juegos', 'disfruta', 'disfrutando', 'felices'
    ],
    aventura: [
      'aventura', 'explorar', 'descubrir', 'buscar', 'misterio', 'viaje', 'expedición', 
      'travesía', 'misión', 'desafío', 'reto', 'arriesgado', 'valiente', 'valentía', 
      'coraje', 'exploración', 'descubrimiento', 'territorio', 'mapas', 'tesoro'
    ],
    tranquilo: [
      'tranquilo', 'paz', 'calma', 'descanso', 'relajado', 'suave', 'sereno', 'serenidad', 
      'apacible', 'armonía', 'tranquilidad', 'sosiego', 'silencioso', 'quieto', 'quietud', 
      'reposo', 'relajación', 'armonioso', 'pacífico', 'meditación'
    ],
    emocionante: [
      'emocionante', 'emoción', 'sorpresa', 'asombro', 'maravilla', 'impresionante', 
      'fascinante', 'increíble', 'extraordinario', 'impactante', 'inolvidable', 'sensacional', 
      'espectacular', 'grandioso', 'impresiona', 'asombrado', 'maravillado', 'espléndido', 
      'fabuloso', 'fantástico'
    ],
    misterioso: [
      'misterio', 'secreto', 'enigma', 'desconocido', 'extraño', 'intrigante', 'curioso', 
      'peculiar', 'sospechoso', 'escondido', 'oculto', 'misterioso', 'enigmático', 'pistas', 
      'investigar', 'intriga', 'inexplicable', 'raro', 'insólito', 'indescifrable'
    ],
    aprendizaje: [
      'aprender', 'descubrir', 'enseñanza', 'lección', 'sabio', 'sabiduría', 'conocimiento', 
      'inteligencia', 'comprender', 'entender', 'aprendizaje', 'estudiar', 'maestro', 'profesor', 
      'escuela', 'educación', 'pregunta', 'respuesta', 'curiosidad', 'investigación'
    ],
    amistad: [
      'amigos', 'amistad', 'compartir', 'ayudar', 'compañero', 'equipo', 'unidos', 'juntos', 
      'colaborar', 'cooperar', 'apoyo', 'solidaridad', 'confianza', 'lealtad', 'compañía', 
      'camaradería', 'fraternal', 'hermandad', 'fidelidad', 'afecto'
    ],
    tenso: [
      'problema', 'desafío', 'difícil', 'preocupado', 'miedo', 'temor', 'peligro', 'riesgo', 
      'amenaza', 'tensión', 'ansiedad', 'nervios', 'inquietud', 'agitación', 'aprieto', 
      'dilema', 'obstáculo', 'complicación', 'adversidad', 'conflicto'
    ]
  };

  // Normalizar texto para comparación
  const normalizedText = text.toLowerCase();
  
  // Contar coincidencias de cada emoción
  const emotionCounts = Object.entries(emotions).map(([emotion, keywords]) => {
    const count = keywords.filter(word => normalizedText.includes(word)).length;
    return { emotion, count };
  });

  // Obtener la emoción con más coincidencias
  const dominantEmotion = emotionCounts.sort((a, b) => b.count - a.count)[0];
  
  if (dominantEmotion.count === 0) {
    return 'brillante y cálida, favorable para una escena infantil';
  }
  
  const lightingByEmotion = {
    alegre: 'brillante y cálida, con tonos dorados que transmiten alegría y optimismo',
    aventura: 'dinámica con contrastes interesantes que sugieren acción y descubrimiento',
    tranquilo: 'suave y difusa con tonos pastel que evocan calma y serenidad',
    emocionante: 'vibrante y enérgica con colores intensos que resaltan el momento de asombro',
    misterioso: 'interesante con luces focalizadas y sombras suaves que crean atmósfera de descubrimiento',
    aprendizaje: 'clara y nítida que resalta los detalles importantes en un ambiente de curiosidad',
    amistad: 'cálida y acogedora con tonos armoniosos que refuerzan la conexión entre personajes',
    tenso: 'dramática pero apropiada para niños, con contraste moderado pero sin oscuridad excesiva'
  };
  
  return lightingByEmotion[dominantEmotion.emotion as keyof typeof lightingByEmotion];
}

/**
 * Genera un prompt mejorado para la generación de imágenes
 * Incluye detalles específicos de los personajes y la escena
 */
export function generateEnhancedImagePrompt(
  page: { pageNumber: number; text: string; imagePrompt: string },
  bookContent: { title: string; targetAge?: string; theme?: string },
  characters: (Character & Partial<CharacterStoryDetails>)[]
): string {
  if (!characters || characters.length === 0) {
    return defaultImagePrompt(page, bookContent);
  }

  // Identificar qué personajes aparecen en esta página específica
  const mainCharacter = characters[0];
  const pageText = page.text.toLowerCase();
  
  // Determinar qué personajes secundarios aparecen en esta página
  // Usamos una expresión regular para encontrar el nombre completo como palabra
  const supportingCharactersInPage = characters.slice(1).filter(char => {
    if (!char.name) return false;
    const nameRegex = new RegExp(`\\b${char.name.toLowerCase()}\\b`);
    return nameRegex.test(pageText);
  });

  // Construir descripciones de personajes para la imagen
  const characterDescriptions = [
    // Descripción del personaje principal
    formatCharacterImagePrompt(mainCharacter, true)
  ];
  
  // Descripciones de personajes secundarios que aparecen en la página
  if (supportingCharactersInPage.length > 0) {
    characterDescriptions.push(...supportingCharactersInPage.map(char => 
      formatCharacterImagePrompt(char, false)
    ));
  }
  
  // Determinar la emoción dominante para establecer la iluminación adecuada
  const sceneEmotion = determineSceneEmotion(pageText);

  return `Crea una ilustración digital de alta calidad para un libro infantil, representando esta escena específica:

${page.imagePrompt}

PERSONAJES EN ESCENA:
${characterDescriptions.join('\n')}

ASPECTOS TÉCNICOS REQUERIDOS:
- Formato 16:9 panorámico para mejor visualización
- Composición siguiendo la regla de los tercios con personajes principales en puntos de atención
- Profundidad con primer plano, plano medio y fondo claramente definidos
- Iluminación que realce la emoción de la escena: ${sceneEmotion}
- Paleta de colores cohesiva, brillante y amigable para niños
- Expresiones faciales legibles y emociones claras en los personajes
- Detalles precisos del escenario que complementen la narrativa
- Estilo de ilustración infantil digital profesional, coherente con libros publicados

CONTEXTO DE LA PÁGINA:
"${page.text}"

NO INCLUIR:
- Texto o letras dentro de la ilustración
- Elementos aterradores, violentos o inapropiados
- Proporciones anatómicas incorrectas o rostros distorsionados
- Sombreado excesivo o escenas oscuras

Esta ilustración es para niños de ${bookContent.targetAge || '5-10'} años y debe capturar perfectamente el momento descrito en el texto.`;
}

/**
 * Formato estándar para prompt de imagen cuando no hay suficiente información de personajes
 */
function defaultImagePrompt(
  page: { pageNumber: number; text: string; imagePrompt: string },
  bookContent: { title: string; targetAge?: string; theme?: string }
): string {
  return `Crea una ilustración infantil digital de alta calidad para un libro titulado "${bookContent.title}":

${page.imagePrompt}

ASPECTOS TÉCNICOS REQUERIDOS:
- Formato 16:9 panorámico para mejor visualización
- Composición siguiendo la regla de los tercios
- Profundidad con primer plano, plano medio y fondo
- Iluminación brillante y cálida, favorable para una escena infantil
- Paleta de colores cohesiva, brillante y amigable para niños
- Expresiones faciales legibles y emociones claras
- Estilo de ilustración infantil digital profesional

CONTEXTO DE LA PÁGINA:
"${page.text}"

NO INCLUIR:
- Texto o letras dentro de la ilustración
- Elementos aterradores, violentos o inapropiados
- Proporciones anatómicas incorrectas
- Sombreado excesivo o escenas oscuras

Esta ilustración es para niños de ${bookContent.targetAge || '5-10'} años.`;
}

/**
 * Formatea la descripción de un personaje para el prompt de imagen
 */
function formatCharacterImagePrompt(
  character: Character & Partial<CharacterStoryDetails>,
  isMainCharacter: boolean
): string {
  let description = `${character.name} (${isMainCharacter ? 'protagonista' : 'personaje secundario'}): `;
  
  // Descripción física
  if (character.physicalDescription) {
    description += character.physicalDescription;
  } else {
    description += `${character.type || 'personaje'}`;
    if (character.age && ['niño', 'niña', 'adulto', 'adulta'].includes(character.type || '')) {
      description += ` de ${character.age} años`;
    }
  }
  
  // Añadir detalles de vestuario basados en colores favoritos
  if (character.favorites) {
    try {
      const favorites = typeof character.favorites === 'string'
        ? JSON.parse(character.favorites)
        : character.favorites;
      
      if (favorites.color) {
        description += `, con elementos en color ${favorites.color}`;
      }
    } catch (e) {
      // Si hay error al parsear JSON, lo ignoramos
    }
  }
  
  // Añadir detalles de personalidad que afecten a la expresión visual
  if (character.personality) {
    const visualTraits = extractVisualPersonalityTraits(character.personality);
    if (visualTraits) {
      description += `. ${visualTraits}`;
    }
  }
  
  return description;
}

/**
 * Extrae rasgos de personalidad que pueden representarse visualmente
 */
function extractVisualPersonalityTraits(personality: string): string | null {
  const visualTraits = {
    'alegre': 'expresión sonriente y postura animada',
    'tímido': 'postura ligeramente encorvada y expresión tímida',
    'tímida': 'postura ligeramente encorvada y expresión tímida',
    'curioso': 'expresión de curiosidad y postura inclinada hacia adelante',
    'curiosa': 'expresión de curiosidad y postura inclinada hacia adelante',
    'valiente': 'postura erguida y mirada confiada',
    'creativo': 'gestos expresivos y mirada soñadora',
    'creativa': 'gestos expresivos y mirada soñadora',
    'aventurero': 'postura dinámica y expresión de entusiasmo',
    'aventurera': 'postura dinámica y expresión de entusiasmo',
    'inteligente': 'mirada atenta y gesto reflexivo',
    'sensible': 'expresión emotiva y gestos delicados',
    'divertido': 'sonrisa juguetona y postura relajada',
    'divertida': 'sonrisa juguetona y postura relajada',
    'enérgico': 'postura activa y gesto dinámico',
    'enérgica': 'postura activa y gesto dinámico',
    'tranquilo': 'expresión serena y postura relajada',
    'tranquila': 'expresión serena y postura relajada'
  };
  
  const personalityLower = personality.toLowerCase();
  for (const [trait, visual] of Object.entries(visualTraits)) {
    if (personalityLower.includes(trait)) {
      return visual;
    }
  }
  
  return null;
}