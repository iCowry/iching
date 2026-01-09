
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODELS = {
  // Upgraded to gemini-3-pro-preview for complex divination reasoning
  TEXT: 'gemini-3-pro-preview',
  // Using gemini-3-flash-preview for multimodal tasks like face/palm reading analysis
  VISION: 'gemini-3-flash-preview',
};

// Helper to construct prompts based on feature
const getSystemInstruction = (feature: string): string => {
  return `你是一位精通中西方神秘学的世界级大师。
  你的语气应当：专业、神秘、平和、客观且带有启发性。
  请根据用户的请求，基于${feature}的理论进行详尽的排盘与分析。
  使用Markdown格式输出，标题清晰，重点突出。
  如果是排盘，请尽量用文本图表形式展示结构。
  如果涉及预测，请给予积极的引导建议。`;
};

export const getGeminiReading = async (
  featureName: string,
  prompt: string,
  contextData: string,
  jsonMode: boolean = false
): Promise<string> => {
  try {
    const fullPrompt = `
    任务：进行${featureName}分析
    用户数据：${contextData}
    具体请求：${prompt}
    
    ${jsonMode ? '请务必严格按照要求的 JSON 格式输出，不要包含 Markdown 代码块标记（如 ```json）。' : `请按照标准的${featureName}格式输出分析报告。包括核心盘面信息和详细的运势/性格/建议解读。`}
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODELS.TEXT,
      contents: fullPrompt,
      config: {
        systemInstruction: getSystemInstruction(featureName),
        temperature: 0.8,
        responseMimeType: jsonMode ? 'application/json' : 'text/plain',
      }
    });

    return response.text || (jsonMode ? "{}" : "大衍之数五十，其用四十有九... 天机暂时混沌，请稍后再试。");
  } catch (error) {
    console.error("Gemini Text Error:", error);
    return jsonMode ? "{}" : "连接宇宙能量场失败，请检查网络连接或API配置。";
  }
};

export const analyzeImage = async (
  featureName: string,
  base64Image: string,
  prompt: string
): Promise<string> => {
  try {
    // Remove header if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODELS.VISION,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `请基于这张图片进行${featureName}分析。${prompt}`
          }
        ]
      },
      config: {
        systemInstruction: "你是一位精通面相学和手相学的大师。请仔细观察图片细节，分析特征，并给出相应的命运解读。保持客观、礼貌、积极。",
      }
    });

    return response.text || "图像迷雾重重，无法看清细节。";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return "无法解析图像灵气，请重试。";
  }
};
