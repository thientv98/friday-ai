import { Category, ParsedExpense } from "../types";

/**
 * Client-side service to call the Next.js API route
 * This keeps the API key secure on the server
 */
const parseExpenseText = async (text: string, currentCategories: Category[]): Promise<ParsedExpense[]> => {
  try {
    const response = await fetch('/api/parse-expense', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        categories: currentCategories,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error: any) {
    console.error("API call error:", error);
    throw error;
  }
};

export const GeminiService = {
  parseExpenseText,
};
