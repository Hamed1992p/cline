
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `أنت "خبير تحليل مكونات المنتجات الذكي"، متخصص في فحص صور المنتجات لتقييم مكوناتها وممارساتها التسويقية بناءً على أدلة علمية صارمة. مهمتك هي تزويد المستخدم بتحليل موضوعي ومفصل، مع تسليط الضوء على المكونات المفيدة والضارة والمشكوك فيها، وأي ممارسات تسويقية خادعة. قم أيضًا باستخلاص اسم المنتج، علامته التجارية، حجمه، وفئته. بالإضافة إلى ذلك، قم بتقديم قائمة بمنتجات بديلة أكثر أمانًا أو طبيعية بناءً على التحليل. يجب أن يكون الإخراج النهائي عبارة عن كائن JSON نقي وصالح (pure JSON object) يتبع المخطط المحدد بدقة. لا تقم بتضمين أي نص إضافي قبل أو بعد كائن JSON. لا تستخدم markdown.
مبادئ التوجيه:
1.  **الدقة العلمية أولاً**: كل تقييم يجب أن يستند إلى أدلة علمية موثوقة.
2.  **الموضوعية والحياد**: تجنب أي تحيز أو رأي شخصي؛ ركز فقط على الحقائق.
3.  **اقتراحات ذكية**: قدم 2-3 اقتراحات لمنتجات بديلة تكون أكثر أمانًا أو طبيعية.
4.  **لا نصيحة طبية**: لا تقدم أبدًا أي نصيحة صحية أو طبية. التحليل هو لأغراض معلوماتية فقط.
5.  **تعريب كامل**: يجب أن تكون جميع المخرجات (الأوصاف، الملخصات، العناوين) باللغة العربية الفصحى.
6.  **معالجة الغموض**: إذا كانت الصورة غير واضحة، قم بتحليل ما يمكنك رؤيته أو اذكر في الملخص أن بعض المكونات كانت غير واضحة.
`;

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        "اسم_المنتج": { type: Type.STRING, description: "اسم المنتج المستخلص من الصورة (إذا كان واضحًا). إذا لم يكن واضحًا، اكتب 'غير واضح'." },
        "العلامة_التجارية": { type: Type.STRING, description: "العلامة التجارية للمنتج. إذا لم تكن واضحة، اكتب 'غير واضح'." },
        "الحجم_او_الوزن": { type: Type.STRING, description: "حجم المنتج أو وزنه (e.g., 250ml, 100g). إذا لم يكن واضحًا، اكتب 'غير واضح'." },
        "فئة_المنتج": { type: Type.STRING, description: "فئة المنتج (e.g., عناية بالبشرة, مشروب غازي, وجبة خفيفة). إذا لم تكن واضحة، اكتب 'غير واضح'." },
        "ملخص_التحليل": { type: Type.STRING, description: "ملخص عام وشامل باللغة العربية لتقييم المنتج." },
        "المكونات_الإيجابية": {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    "الاسم_العربي": { type: Type.STRING },
                    "الاسم_العلمي_او_الإنجليزي": { type: Type.STRING },
                    "الوصف_والفوائد": { type: Type.STRING, description: "وصف مفصل باللغة العربية يوضح الفوائد المثبتة علميًا." },
                    "مصادر_علمية": { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["الاسم_العربي", "الاسم_العلمي_او_الإنجليزي", "الوصف_والفوائد", "مصادر_علمية"]
            }
        },
        "المكونات_السلبية": {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    "الاسم_العربي": { type: Type.STRING },
                    "الاسم_العلمي_او_الإنجليزي": { type: Type.STRING },
                    "الوصف_والمخاطر": { type: Type.STRING, description: "وصف مفصل باللغة العربية يوضح المخاطر أو الآثار الجانبية المثبتة علميًا." },
                    "مصادر_علمية": { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["الاسم_العربي", "الاسم_العلمي_او_الإنجليزي", "الوصف_والمخاطر", "مصادر_علمية"]
            }
        },
        "المكونات_المشكوك_فيها": {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    "الاسم_العربي": { type: Type.STRING },
                    "الاسم_العلمي_او_الإنجليزي": { type: Type.STRING },
                    "الوصف_والتساؤلات": { type: Type.STRING, description: "وصف مفصل باللغة العربية يوضح سبب الشك أو عدم وجود أدلة كافية." },
                    "مصادر_علمية": { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["الاسم_العربي", "الاسم_العلمي_او_الإنجليزي", "الوصف_والتساؤلات", "مصادر_علمية"]
            }
        },
        "الممارسات_التسويقية_الخادعة": {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    "الادعاء_التسويقي": { type: Type.STRING },
                    "التحليل_والتكذيب_العلمي": { type: Type.STRING, description: "تحليل باللغة العربية يوضح لماذا هذا الادعاء قد يكون مضللاً." },
                    "مصادر_علمية": { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["الادعاء_التسويقي", "التحليل_والتكذيب_العلمي", "مصادر_علمية"]
            }
        },
        "اقتراحات_بديلة": {
            type: Type.ARRAY,
            description: "قائمة بالمنتجات البديلة المقترحة.",
            items: {
                type: Type.OBJECT,
                properties: {
                    "اسم_المنتج_البديل": { type: Type.STRING, description: "اسم المنتج البديل المقترح." },
                    "السبب": { type: Type.STRING, description: "سبب اقتراح هذا المنتج البديل." }
                },
                required: ["اسم_المنتج_البديل", "السبب"]
            }
        },
        "ملاحظات_إضافية": { type: Type.STRING, description: "أي ملاحظات عامة أو توصيات لتحسين المنتج (دون تقديم نصيحة مباشرة للمستخدم)." }
    },
    required: ["اسم_المنتج", "العلامة_التجارية", "الحجم_او_الوزن", "فئة_المنتج", "ملخص_التحليل", "المكونات_الإيجابية", "المكونات_السلبية", "المكونات_المشكوك_فيها", "الممارسات_التسويقية_الخادعة", "ملاحظات_إضافية"]
};


export const analyzeProductImage = async (imageBase64: string, mimeType: string): Promise<AnalysisResponse> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [imagePart] },
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: analysisSchema,
            }
        });

        const jsonText = response.text.trim();
        // The API should return valid JSON because of responseSchema, so we can parse it directly.
        return JSON.parse(jsonText) as AnalysisResponse;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get analysis from Gemini API.");
    }
};
