// Note: This is a client-side helper for OpenAI APIs
// The actual API calls will be proxied through our backend to protect API keys

export interface GeneratedBookContent {
  title: string;
  pages: {
    text: string;
    illustration_prompt: string;
  }[];
}

/**
 * Generate a book based on the child profile and selected theme
 */
export async function generateBook(profileId: number, themeId: number): Promise<GeneratedBookContent> {
  try {
    const response = await fetch('/api/generate-book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ profileId, themeId }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating book:', error);
    throw error;
  }
}

/**
 * Send a chat message and get AI response
 */
export async function sendChatMessage(userId: number, childProfileId: number, message: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        childProfileId,
        message,
        sender: 'user'
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}
