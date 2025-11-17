
import { GoogleGenAI, Type, Chat, Modality } from "@google/genai";
import { AnalysisResponse, UserProfile, ComparisonResponse, RoutineAnalysis, MedicationAnalysisResponse, MealAnalysisResponse } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

export const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Extracts a JSON object from a string, handling markdown code blocks.
 * @param text The string to extract JSON from.
 * @returns A string containing the JSON object.
 */
const extractJson = (text: string): string => {
    const jsonRegex = /```(json)?\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);
    if (match && match[2]) {
        return match[2].trim();
    }

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return text.substring(firstBrace, lastBrace + 1).trim();
    }
    
    // Fallback for array responses
    const firstBracket = text.indexOf('[');
    const lastBracket = text.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
        return text.substring(firstBracket, lastBracket + 1).trim();
    }
    
    return text;
};


export const generateLiveSystemInstruction = (allergies: string[], profile: UserProfile) => {
    let instruction = `أنت "حامد AI"، مساعد جزائري ذكي ومساعد في الوقت الفعلي. مهمتك هي التفاعل مع المستخدم من خلال الصوت أثناء مشاهدة بث مباشر من كاميرته. تحدث باللهجة الجزائرية البسيطة والمهذبة. قم بوصف ما تراه في الكاميرا وأجب عن أسئلة المستخدم حول المنتجات التي يعرضها لك. كن سريعًا ومختصرًا ومفيدًا.`;

    instruction += "\n\n**قم بتخصيص تفاعلاتك للمستخدم التالي:**\n";
    if (allergies.length > 0) {
        instruction += `- **لديه حساسية من**: ${allergies.join(', ')}. كن يقظًا بشكل خاص لهذه المكونات.\n`;
    }
    if (profile.skinType) {
        instruction += `- **نوع بشرته**: ${profile.skinType}. قدم توصيات بناءً على هذا.\n`;
    }
     if (profile.ethicalConcerns.length > 0) {
        instruction += `- **اهتماماته الأخلاقية**: ${profile.ethicalConcerns.join(', ')}. أشر إلى ما إذا كانت المنتجات تتوافق مع هذه المبادئ.\n`;
    }
    instruction += "\n**مثال للتفاعل:**\n";
    instruction += `المستخدم: (يوجه الكاميرا إلى منتج) "يا حامد، شوفلي هذا."\n`;
    instruction += `أنت: "أكيد خويا، راني نشوف في منتج 'اسم المنتج'. واش حبيت تعرف عليه؟"\n`;
    instruction += `المستخدم: "قولي المكونات الخطيرة فيه."\n`;
    instruction += `أنت: "فيه مكون 'X' لي ممكن يسبب حساسية، وفيه 'Y' لي ماشي مليح للبشرة الجافة. الباقي يبان مليح."\n`;

    return instruction;
};


const generateSystemInstruction = (allergies: string[], profile: UserProfile, language: string) => {
    let instruction = `أنت "خبير تحليل مكونات المنتجات الذكي"، متخصص في فحص صور المنتجات لتقييم مكوناتها وممارساتها التسويقية بناءً على أدلة علمية صارمة. مهمتك هي تزويد المستخدم بتحليل موضوعي ومفصل، مع تسليط الضوء على المكونات المفيدة والضارة والمشكوك فيها، وأي ممارسات تسويقية خادعة. قم أيضًا باستخلاص اسم المنتج، علامته التجارية، حجمه، وفئته. بالإضافة إلى ذلك، قم بتقديم قائمة بمنتجات بديلة أكثر أمانًا أو طبيعية بناءً على التحليل. يجب أن يكون الإخراج النهائي عبارة عن كائن JSON نقي وصالح (pure JSON object) يتبع المخطط المحدد بدقة. لا تقم بتضمين أي نص إضافي قبل أو بعد كائن JSON. لا تستخدم markdown.`;

    instruction += "\n\n**قم بتخصيص التحليل للمستخدم التالي:**\n";
    if (allergies.length > 0) {
        instruction += `- **لديه حساسية من**: ${allergies.join(', ')}. قم بالإشارة بوضوح إلى أي من هذه المكونات إذا وجدت.\n`;
    }
    if (profile.skinType) {
        instruction += `- **نوع بشرته**: ${profile.skinType}. قيّم المكونات بناءً على مدى ملاءمتها لهذا النوع من البشرة.\n`;
    }
    if (profile.dietaryPreferences.length > 0) {
        instruction += `- **تفضيلاته الغذائية**: ${profile.dietaryPreferences.join(', ')}. تحقق مما إذا كان المنتج يتوافق مع هذه التفضيلات.\n`;
    }
     if (profile.healthGoals.length > 0) {
        instruction += `- **أهدافه الصحية**: ${profile.healthGoals.join(', ')}. قيّم المنتج بناءً على هذه الأهداف.\n`;
    }
    if (profile.ethicalConcerns.length > 0) {
        instruction += `- **اهتماماته الأخلاقية**: ${profile.ethicalConcerns.join(', ')}. تحقق مما إذا كان المنتج أو علامته التجارية يتماشى مع هذه المبادئ (مثل 'خالٍ من القسوة'، 'نباتي').\n`;
    }

    instruction += "\n**مهمة إضافية**: بناءً على التحليل الشامل، قم بتوفير 'تقييم عام' للمنتج يتضمن تقييمًا حرفيًا (من A+ إلى F)، ونقاطًا من 100، وسببًا موجزًا لهذا التقييم.\n";
    instruction += "\n**مهمة إضافية 2 (بيئية)**: قم بتقييم الأثر البيئي للمنتج. انظر إلى مواد التعبئة والتغليف (بلاستيك، زجاج، ورق معاد تدويره)، والمكونات (مثل زيت النخيل المستدام)، وأي شهادات بيئية ظاهرة. قدم تقييمًا من 100، ملخصًا، وجوانب إيجابية وسلبية.\n";
    instruction += `\n\n**متطلب لغة الإخراج**: هام جداً! يجب أن يكون الرد كائن JSON خالص. كل القيم النصية داخل كائن JSON هذا (مثل الأوصاف، الملخصات، الأسماء، التقييمات) يجب أن تكون مكتوبة بـ **${language}**. ومع ذلك، فإن مفاتيح JSON نفسها (مثل "اسم_المنتج"، "ملخص_التحليل") يجب أن تظل باللغة العربية تماماً كما هو محدد في المخطط المقدم لضمان التحليل الصحيح. لا تضف أي نص قبل أو بعد كائن JSON.`;
    
    return instruction;
};


const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        "اسم_المنتج": { type: Type.STRING, description: "اسم المنتج المستخلص من الصورة (إذا كان واضحًا). إذا لم يكن واضحًا، اكتب 'غير واضح'." },
        "العلامة_التجارية": { type: Type.STRING, description: "العلامة التجارية للمنتج. إذا لم تكن واضحة، اكتب 'غير واضح'." },
        "الحجم_او_الوزن": { type: Type.STRING, description: "حجم المنتج أو وزنه (e.g., 250ml, 100g). إذا لم يكن واضحًا، اكتب 'غير واضح'." },
        "فئة_المنتج": { type: Type.STRING, description: "فئة المنتج (e.g., عناية بالبشرة, مشروب غازي, وجبة خفيفة). إذا لم تكن واضحة، اكتب 'غير واضح'." },
        "ملخص_التحليل": { type: Type.STRING, description: "ملخص عام وشامل باللغة العربية لتقييم المنتج، مع الأخذ في الاعتبار ملف المستخدم الشخصي." },
        "التقييم_العام": {
            type: Type.OBJECT,
            description: "تقييم عام للمنتج بناءً على التحليل الشامل.",
            properties: {
                "التقييم": { type: Type.STRING, description: "تقييم حرفي من A+ (ممتاز) إلى F (سيء)." },
                "النقاط": { type: Type.INTEGER, description: "تقييم رقمي من 0 إلى 100." },
                "السبب": { type: Type.STRING, description: "سبب موجز لهذا التقييم." }
            },
            required: ["التقييم", "النقاط", "السبب"]
        },
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
                    "الوصف_والمخاطر": { type: Type.STRING, description: "وصف مفصل باللغة العربية يوضح المخاطر المثبتة علميًا." },
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
                    "الوصف_والتساؤلات": { type: Type.STRING, description: "وصف مفصل باللغة العربية يوضح سبب الشك أو الجدل حول المكون." },
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
                    "التحليل_والتكذيب_العلمي": { type: Type.STRING },
                    "مصادر_علمية": { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["الادعاء_التسويقي", "التحليل_والتكذيب_العلمي", "مصادر_علمية"]
            }
        },
        "اقتراحات_بديلة": {
             type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    "اسم_المنتج_البديل": { type: Type.STRING },
                    "السبب": { type: Type.STRING }
                },
                 required: ["اسم_المنتج_البديل", "السبب"]
            }
        },
        "environmentalImpact": {
            type: Type.OBJECT,
            properties: {
                "score": { type: Type.INTEGER },
                "rating": { type: Type.STRING },
                "summary": { type: Type.STRING },
                "positiveAspects": { type: Type.ARRAY, items: { type: Type.STRING } },
                "negativeAspects": { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "rating", "summary", "positiveAspects", "negativeAspects"]
        },
        "ملاحظات_إضافية": { type: Type.STRING }
    },
    required: ["اسم_المنتج", "ملخص_التحليل", "المكونات_الإيجابية", "المكونات_السلبية", "المكونات_المشكوك_فيها", "الممارسات_التسويقية_الخادعة", "ملاحظات_إضافية"]
};

export const analyzeProductImage = async (
    base64Data: string,
    mimeType: string,
    allergies: string[],
    profile: UserProfile,
    language: string
): Promise<AnalysisResponse> => {
    const systemInstruction = generateSystemInstruction(allergies, profile, language);
    const imagePart = {
        inlineData: {
            data: base64Data,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: 'قم بتحليل هذا المنتج. استخدم قدراتك المتقدمة في التعرف الضوئي على الحروف (OCR) لاستخراج قائمة المكونات بدقة عالية من الصورة، حتى لو كان النص صغيراً أو بلغات متعددة (مثل العربية والإنجليزية والفرنسية). بعد ذلك، قم بتحليل المكونات بالكامل وقدم الإجابة بتنسيق JSON بناءً على المخطط المقدم.',
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: [imagePart, textPart] }],
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        },
    });

    const jsonText = extractJson(response.text);
    return JSON.parse(jsonText) as AnalysisResponse;
};

export const analyzeProductText = async (
    text: string,
    allergies: string[],
    profile: UserProfile,
    language: string
): Promise<AnalysisResponse> => {
    const systemInstruction = generateSystemInstruction(allergies, profile, language);

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{
            parts: [{
                text: `هذه هي قائمة المكونات: "${text}". قم بتحليل هذا المنتج. قم بتحليل المكونات بالكامل. قدم الإجابة بتنسيق JSON بناءً على المخطط المقدم.`
            }]
        }],
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: analysisSchema,
        },
    });

    const jsonText = extractJson(response.text);
    return JSON.parse(jsonText) as AnalysisResponse;
};

const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
        "recommendation": { type: Type.STRING, description: "توصية نهائية واضحة حول أي منتج أفضل للمستخدم ولماذا، مع الأخذ في الاعتبار ملفه الشخصي وحساسياته." },
        "product1_name": { type: Type.STRING, description: "اسم المنتج الأول." },
        "product2_name": { type: Type.STRING, description: "اسم المنتج الثاني." },
        "product1_pros": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالإيجابيات الرئيسية للمنتج الأول." },
        "product1_cons": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالسلبيات الرئيسية للمنتج الأول." },
        "product2_pros": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالإيجابيات الرئيسية للمنتج الثاني." },
        "product2_cons": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالسلبيات الرئيسية للمنتج الثاني." },
        "detailed_comparison": {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    "feature": { type: Type.STRING, description: "الميزة التي تتم مقارنتها (e.g., السعر, المكونات الرئيسية, الملاءمة لنوع البشرة)." },
                    "product1_value": { type: Type.STRING, description: "قيمة الميزة للمنتج الأول." },
                    "product2_value": { type: Type.STRING, description: "قيمة الميزة للمنتج الثاني." },
                },
                required: ["feature", "product1_value", "product2_value"]
            }
        }
    },
    required: ["recommendation", "product1_name", "product2_name", "product1_pros", "product1_cons", "product2_pros", "product2_cons", "detailed_comparison"]
};

export const compareProducts = async (
    product1Analysis: AnalysisResponse,
    product2Analysis: AnalysisResponse,
    profile: UserProfile,
    allergies: string[],
    language: string
): Promise<ComparisonResponse> => {
    const systemInstruction = `أنت خبير مقارنة منتجات. مهمتك هي مقارنة منتجين بناءً على تحليلاتهما وملف المستخدم الشخصي. قدم مقارنة موضوعية ومفصلة وساعد المستخدم على اتخاذ قرار مستنير. يجب أن يكون الإخراج كائن JSON نقي. هام جداً: يجب أن تكون جميع القيم النصية في JSON الناتج باللغة التالية: ${language}. يجب أن تظل مفاتيح JSON كما هي في المخطط.`;
    
    const prompt = `
        قارن بين المنتجين التاليين لمستخدم لديه هذه المواصفات:
        - الحساسية: ${allergies.join(', ') || 'لا يوجد'}
        - الملف الشخصي: ${JSON.stringify(profile)}

        المنتج الأول: ${JSON.stringify(product1Analysis)}
        المنتج الثاني: ${JSON.stringify(product2Analysis)}

        قدم مقارنة شاملة وأجب بتنسيق JSON بناءً على المخطط.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: comparisonSchema,
        },
    });

    const jsonText = extractJson(response.text);
    return JSON.parse(jsonText) as ComparisonResponse;
};

const routineAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        "overall_score": { type: Type.INTEGER, description: "تقييم رقمي من 0 إلى 100 لفعالية وتوافق الروتين." },
        "overall_summary": { type: Type.STRING, description: "ملخص عام لتقييم الروتين، نقاط القوة والضعف." },
        "conflicts": {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    "product_1": { type: Type.STRING, description: "اسم المنتج الأول في التعارض." },
                    "product_2": { type: Type.STRING, description: "اسم المنتج الثاني في التعارض." },
                    "reason": { type: Type.STRING, description: "شرح علمي لسبب التعارض بين المكونات." },
                },
                required: ["product_1", "product_2", "reason"]
            }
        },
        "suggested_order": { type: Type.ARRAY, items: { type: Type.STRING }, description: "الترتيب المقترح لاستخدام المنتجات في الروتين لتحقيق أقصى استفادة." },
        "enhancement_suggestions": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة اقتراحات لتحسين الروتين، مثل إضافة منتجات (e.g., واقي شمسي) أو إزالة منتجات زائدة عن الحاجة." }
    },
    required: ["overall_score", "overall_summary", "conflicts", "suggested_order", "enhancement_suggestions"]
};

export const analyzeRoutine = async (
    routineType: 'الصباحي' | 'المسائي',
    productAnalyses: AnalysisResponse[],
    profile: UserProfile,
    language: string
): Promise<RoutineAnalysis> => {
    const systemInstruction = `أنت خبير في روتين العناية بالبشرة. مهمتك هي تحليل مجموعة من المنتجات المستخدمة في روتين معين. تحقق من وجود تعارضات بين المكونات، واقترح الترتيب الأمثل للاستخدام، وقدم نصائح لتحسين الروتين بناءً على ملف المستخدم. يجب أن يكون الإخراج كائن JSON نقي. هام جداً: يجب أن تكون جميع القيم النصية في JSON الناتج باللغة التالية: ${language}. يجب أن تظل مفاتيح JSON كما هي في المخطط.`;
    
    const prompt = `
        حلل روتين العناية بالبشرة ${routineType} التالي لمستخدم لديه هذه المواصفات:
        - الملف الشخصي: ${JSON.stringify(profile)}

        المنتجات في الروتين:
        ${productAnalyses.map(p => `- ${p.اسم_المنتج}: ${p.ملخص_التحليل}`).join('\n')}

        التحليلات الكاملة للمنتجات:
        ${JSON.stringify(productAnalyses)}

        قم بتحليل هذا الروتين وأجب بتنسيق JSON بناءً على المخطط.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: routineAnalysisSchema,
        },
    });

    const jsonText = extractJson(response.text);
    return JSON.parse(jsonText) as RoutineAnalysis;
};

const medicationAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        "drugName": { type: Type.STRING, description: "الاسم التجاري للدواء." },
        "activeIngredients": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة المكونات الفعالة." },
        "summary": { type: Type.STRING, description: "ملخص سريع وموجز للدواء." },
        "indications": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بدواعي الاستعمال الرئيسية." },
        "dosage": { type: Type.STRING, description: "الجرعة المعتادة وطريقة الاستخدام." },
        "sideEffects": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالأعراض الجانبية الشائعة." },
        "warnings": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بأهم التحذيرات والاحتياطات." },
    },
    required: ["drugName", "activeIngredients", "summary", "indications", "dosage", "sideEffects", "warnings"]
};

export const analyzeMedicationImage = async (
    base64Data: string,
    mimeType: string,
    language: string
): Promise<MedicationAnalysisResponse> => {
    const systemInstruction = `أنت مساعد صيدلي ذكي. مهمتك هي استخلاص وتلخيص المعلومات الأساسية من صورة نشرة دواء. يجب أن تكون المعلومات دقيقة وموجزة وسهلة الفهم لغير المتخصصين. الإخراج يجب أن يكون كائن JSON نقي. لا تقدم نصيحة طبية، فقط لخص المعلومات الموجودة. هام جداً: يجب أن تكون جميع القيم النصية في JSON الناتج باللغة التالية: ${language}. يجب أن تظل مفاتيح JSON كما هي في المخطط.`;
    
    const imagePart = { inlineData: { data: base64Data, mimeType } };
    const textPart = { text: "استخرج المعلومات الأساسية بدقة عالية من نشرة الدواء هذه، مع الانتباه للنصوص الصغيرة. لخصها بتنسيق JSON حسب المخطط المقدم. ركز على الاسم، المكونات، دواعي الاستعمال، الجرعة، الأعراض الجانبية، والتحذيرات." };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: [imagePart, textPart] }],
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: medicationAnalysisSchema,
        },
    });

    const jsonText = extractJson(response.text);
    return JSON.parse(jsonText) as MedicationAnalysisResponse;
};

const mealAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        "mealName": { type: Type.STRING, description: "اسم وصفي للوجبة، مثل 'طبق كشري مع السلطة'." },
        "estimatedCalories": {
            type: Type.OBJECT,
            properties: {
                "value": { type: Type.INTEGER, description: "العدد التقريبي للسعرات الحرارية." },
                "unit": { type: Type.STRING, description: "الوحدة، عادة 'سعرة حرارية'." },
            },
            required: ["value", "unit"]
        },
        "macronutrients": {
            type: Type.OBJECT,
            properties: {
                "protein": { type: Type.STRING, description: "تقدير للبروتين بالجرام." },
                "carbohydrates": { type: Type.STRING, description: "تقدير للكربوهيدرات بالجرام." },
                "fat": { type: Type.STRING, description: "تقدير للدهون بالجرام." },
            },
            required: ["protein", "carbohydrates", "fat"]
        },
        "identifiedFoods": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالأطعمة والمكونات التي تم التعرف عليها في الصورة." },
        "healthSummary": { type: Type.STRING, description: "ملخص صحي للوجبة، مع الأخذ في الاعتبار أهداف المستخدم الصحية." },
        "suggestions": { type: Type.ARRAY, items: { type: Type.STRING }, description: "اقتراحات لجعل الوجبة صحية أكثر." },
    },
    required: ["mealName", "estimatedCalories", "macronutrients", "identifiedFoods", "healthSummary", "suggestions"]
};

export const analyzeMealImage = async (
    base64Data: string,
    mimeType: string,
    profile: UserProfile,
    language: string
): Promise<MealAnalysisResponse> => {
    const systemInstruction = `أنت خبير تغذية ذكي. مهمتك هي تحليل صورة لوجبة طعام. قم بتقدير السعرات الحرارية والمغذيات الكبرى، وتعرف على مكونات الوجبة، وقدم ملخصًا صحيًا واقتراحات للتحسين بناءً على أهداف المستخدم. الإخراج يجب أن يكون كائن JSON نقي. أكد دائمًا أن هذه تقديرات وليست قياسات دقيقة. هام جداً: يجب أن تكون جميع القيم النصية في JSON الناتج باللغة التالية: ${language}. يجب أن تظل مفاتيح JSON كما هي في المخطط.`;
    
    const imagePart = { inlineData: { data: base64Data, mimeType } };
    const textPart = { text: `حلل هذه الوجبة لمستخدم أهدافه الصحية هي: ${profile.healthGoals.join(', ')}. قدم تحليلاً غذائياً تقديرياً بتنسيق JSON حسب المخطط.` };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [imagePart, textPart] }],
        config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: mealAnalysisSchema,
        },
    });

    const jsonText = extractJson(response.text);
    return JSON.parse(jsonText) as MealAnalysisResponse;
};

export const createGeneralChat = (history: any[]): Chat => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `أنت Hamed AI، مساعد ذكي جزائري. مهمتك هي الإجابة على أسئلة المستخدم العامة المتعلقة بالصحة والجمال والتغذية. تحدث باللهجة الجزائرية البسيطة والمهذبة. كن متعاونًا وإيجابيًا، وقدم اقتراحات مفيدة. لا تقدم نصائح طبية مشخصة، بل قدم معلومات عامة.`,
        },
        history,
    });
};
