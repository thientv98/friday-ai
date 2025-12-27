import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import { Category, ParsedExpense } from "@/types";
import { getRandomGeminiKey } from "@/utils/geminiKeys";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, categories } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    let apiKey: string;
    try {
      apiKey = getRandomGeminiKey();
    } catch (error: any) {
      console.error("API Key error:", error);
      return NextResponse.json(
        { error: error?.message || 'API Key chưa được cấu hình. Vui lòng kiểm tra biến môi trường GEMINI_API_KEY.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepare category list string for the prompt
    const catListInfo = (categories || []).map((c: Category) => `- ID: "${c.id}" (${c.name})`).join('\n');

    // Define the schema for the response
    const responseSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "Mô tả ngắn gọn giao dịch (ví dụ: 'Phở bò', 'Lương tháng 10'). Viết hoa chữ cái đầu.",
          },
          amount: {
            type: Type.NUMBER,
            description: "Số tiền (VNĐ). Chuyển đổi các từ 'k', 'nghìn', 'cành', 'lít', 'củ', 'triệu' thành số nguyên.",
          },
          categoryId: {
            type: Type.STRING,
            description: "ID của danh mục phù hợp nhất.",
          },
          type: {
            type: Type.STRING,
            enum: ["EXPENSE", "INCOME"],
            description: "Loại giao dịch: 'EXPENSE' (Chi tiêu, mua, trả tiền) hoặc 'INCOME' (Thu nhập, lương, bán được, được cho).",
          },
        },
        required: ["title", "amount", "categoryId", "type"],
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `Phân tích câu nói tiếng Việt sau đây thành danh sách các giao dịch tài chính (Thu hoặc Chi).
      Input text: "${text}"
      
      Danh sách Category hiện có:
      ${catListInfo}
      
      Quy tắc phân loại (QUAN TRỌNG):
      1. Xác định TYPE (INCOME/EXPENSE):
         - INCOME (Thu nhập): Các từ khóa như "lương", "thưởng", "được cho", "bán được", "nhặt được", "thu về".
         - EXPENSE (Chi tiêu): Các từ khóa như "mua", "ăn", "uống", "trả", "đổ xăng", "tiêu", "mất".
      
      2. Xác định Category ID:
         - Ưu tiên sử dụng ID có sẵn.
         - Nếu là INCOME nhưng chưa có category phù hợp, ưu tiên dùng ID "INCOME_OTHER" hoặc "SALARY".
         - Nếu là EXPENSE và chưa có category, có thể tạo ID MỚI (Viết hoa, không dấu).
      
      Lưu ý số tiền:
      - 40k = 40000
      - 1 củ / 1 triệu = 1000000
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      return NextResponse.json({ data: [] });
    }

    const parsedData = JSON.parse(jsonText) as ParsedExpense[];
    return NextResponse.json({ data: parsedData });
  } catch (error: any) {
    console.error("Gemini parsing error:", error);
    return NextResponse.json(
      { error: error?.message || "Lỗi không xác định khi phân tích" },
      { status: 500 }
    );
  }
}

