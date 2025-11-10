

import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisResponse, UserProfile, ComparisonResponse, RoutineAnalysis, MedicationAnalysisResponse, MealAnalysisResponse } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

export const ai = new GoogleGenAI({ apiKey: API_KEY });

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


const generateSystemInstruction = (allergies: string[], profile: UserProfile) => {
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

    instruction += `
    مبادئ التوجيه:
    1.  **الدقة العلمية أولاً**: كل تقييم يجب أن يستند إلى أدلة علمية موثوقة.
    2.  **الموضوعية والحياد**: تجنب أي تحيز أو رأي شخصي؛ ركز فقط على الحقائق.
    3.  **اقتراحات ذكية**: قدم 2-3 اقتراحات لمنتجات بديلة تكون أكثر أمانًا أو طبيعية.
    4.  **لا نصيحة طبية**: لا تقدم أبدًا أي نصيحة صحية أو طبية. التحليل هو لأغراض معلوماتية فقط.
    5.  **تعريب كامل**: يجب أن تكون جميع المخرجات (الأوصاف، الملخصات، العناوين) باللغة العربية الفصحى.
    6.  **معالجة الغموض**: إذا كانت الصورة غير واضحة، قم بتحليل ما يمكنك رؤيته أو اذكر في الملخص أن بعض المكونات كانت غير واضحة.
    `;
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
        "environmentalImpact": {
            type: Type.OBJECT,
            description: "تقييم الأثر البيئي للمنتج.",
            properties: {
                "score": { type: Type.INTEGER, description: "تقييم رقمي من 0 إلى 100 لمدى صداقة المنتج للبيئة." },
                "rating": { type: Type.STRING, description: "تقييم وصفي (e.g., 'ممتاز', 'متوسط', 'ضعيف')." },
                "summary": { type: Type.STRING, description: "ملخص موجز للأثر البيئي." },
                "positiveAspects": { type: Type.ARRAY, items: { type: Type.STRING }, description: "الجوانب الإيجابية بيئيًا." },
                "negativeAspects": { type: Type.ARRAY, items: { type: Type.STRING }, description: "الجوانب السلبية بيئيًا." }
            },
            required: ["score", "rating", "summary", "positiveAspects", "negativeAspects"]
        },
        "ملاحظات_إضافية": { type: Type.STRING, description: "أي ملاحظات عامة أو توصيات لتحسين المنتج (دون تقديم نصيحة مباشرة للمستخدم)." }
    },
    required: ["اسم_المنتج", "العلامة_التجارية", "الحجم_او_الوزن", "فئة_المنتج", "ملخص_التحليل", "التقييم_العام", "المكونات_الإيجابية", "المكونات_السلبية", "المكونات_المشكوك_فيها", "الممارسات_التسويقية_الخادعة", "environmentalImpact", "ملاحظات_إضافية"]
};


export const analyzeProductImage = async (imageBase64: string, mimeType: string, allergies: string[], profile: UserProfile): Promise<AnalysisResponse> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };

        const systemInstruction = generateSystemInstruction(allergies, profile);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, {text: "Please analyze the product in the image based on my profile."}] },
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: analysisSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AnalysisResponse;

    } catch (error) {
        console.error("Error calling Gemini API for image analysis:", error);
        throw new Error("Failed to get analysis from Gemini API.");
    }
};

export const analyzeProductText = async (text: string, allergies: string[], profile: UserProfile): Promise<AnalysisResponse> => {
    try {
        const systemInstruction = generateSystemInstruction(allergies, profile)
            .replace("فحص صور المنتجات", "فحص قوائم المكونات النصية")
            .replace("المستخلص من الصورة", "المقدم في النص (إذا تم توفيره)");

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: `الرجاء تحليل قائمة المكونات التالية: ${text}` }] },
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: analysisSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AnalysisResponse;

    } catch (error) {
        console.error("Error calling Gemini API for text analysis:", error);
        throw new Error("Failed to get analysis from Gemini API.");
    }
};

const comparisonSchema = {
    type: Type.OBJECT,
    properties: {
        "recommendation": { type: Type.STRING, description: "توصية واضحة وموجزة، مع تحديد المنتج الأفضل للمستخدم بناءً على ملفه الشخصي وشرح السبب الرئيسي." },
        "product1_name": { type: Type.STRING },
        "product2_name": { type: Type.STRING },
        "product1_pros": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالإيجابيات الرئيسية للمنتج الأول." },
        "product1_cons": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالسلبيات الرئيسية للمنتج الأول." },
        "product2_pros": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالإيجابيات الرئيسية للمنتج الثاني." },
        "product2_cons": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالسلبيات الرئيسية للمنتج الثاني." },
        "detailed_comparison": {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    "feature": { type: Type.STRING, description: "الميزة التي تتم مقارنتها (مثل 'السلامة من مسببات الحساسية'، 'الملاءمة لنوع البشرة'، 'مكونات رئيسية')." },
                    "product1_value": { type: Type.STRING, description: "تقييم الميزة للمنتج الأول." },
                    "product2_value": { type: Type.STRING, description: "تقييم الميزة للمنتج الثاني." },
                },
                required: ["feature", "product1_value", "product2_value"]
            }
        }
    },
    required: ["recommendation", "product1_name", "product2_name", "product1_pros", "product1_cons", "product2_pros", "product2_cons", "detailed_comparison"]
};

export const compareProducts = async (analysis1: AnalysisResponse, analysis2: AnalysisResponse, profile: UserProfile, allergies: string[]): Promise<ComparisonResponse> => {
    try {
        const systemInstruction = `أنت خبير في مقارنة المنتجات. مهمتك هي مقارنة بيانات تحليل منتجين (المنتج 1 والمنتج 2) وتقديم توصية مخصصة للمستخدم بناءً على ملفه الشخصي. كن موضوعيًا واستند إلى البيانات المقدمة. الإخراج يجب أن يكون كائن JSON نقي وصالح.`;
        
        const userContext = `
            ملف المستخدم:
            - الحساسية: ${allergies.join(', ') || 'لا يوجد'}
            - نوع البشرة: ${profile.skinType || 'غير محدد'}
            - التفضيلات الغذائية: ${profile.dietaryPreferences.join(', ') || 'لا يوجد'}
            - الأهداف الصحية: ${profile.healthGoals.join(', ') || 'لا يوجد'}
            - الاهتمامات الأخلاقية: ${profile.ethicalConcerns.join(', ') || 'لا يوجد'}
        `;

        const prompt = `
            ${userContext}

            المنتج 1: ${JSON.stringify(analysis1)}

            المنتج 2: ${JSON.stringify(analysis2)}

            بناءً على ما سبق، قم بإجراء مقارنة شاملة وأخرج النتيجة بتنسيق JSON المحدد.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: comparisonSchema,
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ComparisonResponse;

    } catch (error) {
        console.error("Error calling Gemini API for comparison:", error);
        throw new Error("Failed to get comparison from Gemini API.");
    }
};

const routineAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        "overall_score": { type: Type.INTEGER, description: "تقييم شامل للروتين من 0 إلى 100 بناءً على التوافق والفعالية والسلامة." },
        "overall_summary": { type: Type.STRING, description: "ملخص شامل لتحليل الروتين، يسلط الضوء على نقاط القوة والضعف الرئيسية." },
        "conflicts": {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    "product_1": { type: Type.STRING, description: "اسم المنتج الأول في التعارض." },
                    "product_2": { type: Type.STRING, description: "اسم المنتج الثاني في التعارض." },
                    "reason": { type: Type.STRING, description: "شرح علمي لسبب تعارض المكونات بين المنتجين (e.g., Vitamin C and Niacinamide)." }
                },
                required: ["product_1", "product_2", "reason"]
            }
        },
        "suggested_order": {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "قائمة بأسماء المنتجات بالترتيب الأمثل للاستخدام (e.g., Cleanser, Toner, Serum, Moisturizer)."
        },
        "enhancement_suggestions": {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "قائمة بنصائح لتحسين الروتين (e.g., 'إضافة واقي شمسي في الصباح'، 'استخدام الريتينول في المساء فقط')."
        }
    },
    required: ["overall_score", "overall_summary", "conflicts", "suggested_order", "enhancement_suggestions"]
};

export const analyzeRoutine = async (routineName: string, productAnalyses: AnalysisResponse[], profile: UserProfile): Promise<RoutineAnalysis> => {
    try {
        const systemInstruction = `أنت خبير في كيمياء العناية بالبشرة. مهمتك هي تحليل روتين العناية بالبشرة للمستخدم بناءً على قائمة المنتجات التي يستخدمها وملفه الشخصي. قم بتقييم توافق المنتجات، وتحديد أي تعارضات في المكونات، واقتراح الترتيب الأمثل للاستخدام، وتقديم توصيات للتحسين. يجب أن يكون الإخراج كائن JSON نقي وصالح.`;
        
        const userContext = `
            ملف المستخدم:
            - نوع البشرة: ${profile.skinType || 'غير محدد'}
            - الاهتمامات: ${profile.healthGoals.join(', ') || 'لا يوجد'}
        `;

        const productDetails = productAnalyses.map(p => ({
            name: p.اسم_المنتج,
            category: p.فئة_المنتج,
            positive_ingredients: p.المكونات_الإيجابية.map(i => i.الاسم_العلمي_او_الإنجليزي),
            negative_ingredients: p.المكونات_السلبية.map(i => i.الاسم_العلمي_او_الإنجليزي)
        }));

        const prompt = `
            ${userContext}

            الروتين المطلوب تحليله: ${routineName}

            تحليلات المنتجات في هذا الروتين:
            ${JSON.stringify(productDetails)}

            بناءً على ما سبق، قم بإجراء تحليل شامل للروتين وأخرج النتيجة بتنسيق JSON المحدد. ركز على التفاعلات بين المكونات النشطة مثل (Retinoids, Vitamin C, AHAs, BHAs, Niacinamide, Benzoyl Peroxide).
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: routineAnalysisSchema,
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as RoutineAnalysis;

    } catch (error) {
        console.error("Error calling Gemini API for routine analysis:", error);
        throw new Error("Failed to get routine analysis from Gemini API.");
    }
};


// =================================================================================
// Medication Analysis Service (NEW)
// =================================================================================

const medicationAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        "drugName": { type: Type.STRING, description: "الاسم التجاري للدواء كما هو مكتوب على العلبة أو النشرة." },
        "activeIngredients": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بأسماء المكونات النشطة وتركيزها (e.g., 'Paracetamol 500mg')." },
        "summary": { type: Type.STRING, description: "ملخص قصير جداً (جملة أو اثنتين) حول الاستخدام الرئيسي للدواء." },
        "indications": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بدواعي الاستعمال الرئيسية (لماذا يستخدم الدواء)." },
        "dosage": { type: Type.STRING, description: "ملخص لطريقة الاستعمال والجرعة المعتادة للبالغين كما هو مذكور في النشرة." },
        "sideEffects": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بأهم الأعراض الجانبية الشائعة المذكورة." },
        "warnings": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بأهم التحذيرات والاحتياطات (مثل 'لا يستخدم أثناء الحمل')." }
    },
    required: ["drugName", "activeIngredients", "summary", "indications", "dosage", "sideEffects", "warnings"]
};


const generateMedicationSystemInstruction = () => {
    return `أنت مساعد معلوماتي متخصص في قراءة وتلخيص نشرات الأدوية. مهمتك هي استخلاص المعلومات الأساسية من صورة علبة دواء أو نشرة داخلية وتقديمها بتنسيق منظم.
    
    **قواعد صارمة:**
    1.  **ممنوع تقديم أي نصيحة طبية على الإطلاق.** لا تشخص، لا تقترح، لا تفسر الأعراض، ولا تقدم توصيات علاجية.
    2.  **التزم بالنص المصور فقط.** قم باستخلاص وتلخيص المعلومات الموجودة في الصورة حرفياً. لا تضف أي معلومات خارجية غير موجودة في النشرة.
    3.  **ركز على الحقائق.** استخرج اسم الدواء، المكونات، دواعي الاستعمال، الجرعة، الآثار الجانبية، والتحذيرات.
    4.  **اللغة العربية الفصحى.** يجب أن تكون جميع المخرجات باللغة العربية الفصحى والواضحة.
    5.  **الإخراج JSON فقط.** يجب أن يكون الإخراج النهائي عبارة عن كائن JSON نقي وصالح يتبع المخطط المحدد بدقة. لا تقم بتضمين أي نص إضافي، خاصة لا تضف تحذيرات نصية خارج بنية JSON. التحذير سيكون في واجهة المستخدم.
    
    مهمتك هي فقط تحويل النص المعقد في النشرة إلى معلومات منظمة وسهلة القراءة. أنت أداة لتلخيص المعلومات، ولست بديلاً عن الطبيب أو الصيدلي.
    `;
};


export const analyzeMedicationImage = async (imageBase64: string, mimeType: string): Promise<MedicationAnalysisResponse> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };

        const systemInstruction = generateMedicationSystemInstruction();

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, {text: "الرجاء استخلاص المعلومات الأساسية من هذا الدواء أو نشرته الداخلية."}] },
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: medicationAnalysisSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as MedicationAnalysisResponse;

    } catch (error) {
        console.error("Error calling Gemini API for medication analysis:", error);
        throw new Error("Failed to get medication analysis from Gemini API.");
    }
};

// =================================================================================
// Meal Analysis Service (NEW)
// =================================================================================

const mealAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        "mealName": { type: Type.STRING, description: "اسم وصفي للوجبة بناءً على محتوياتها (e.g., 'طبق دجاج مشوي مع أرز وخضروات')." },
        "estimatedCalories": {
            type: Type.OBJECT,
            properties: {
                "value": { type: Type.INTEGER, description: "تقدير عدد السعرات الحرارية في الوجبة." },
                "unit": { type: Type.STRING, description: "وحدة السعرات الحرارية (e.g., 'سعرة حرارية')." }
            },
            required: ["value", "unit"]
        },
        "macronutrients": {
            type: Type.OBJECT,
            properties: {
                "protein": { type: Type.STRING, description: "تقدير كمية البروتين بالجرام (e.g., '30g')." },
                "carbohydrates": { type: Type.STRING, description: "تقدير كمية الكربوهيدرات بالجرام (e.g., '50g')." },
                "fat": { type: Type.STRING, description: "تقدير كمية الدهون بالجرام (e.g., '15g')." }
            },
            required: ["protein", "carbohydrates", "fat"]
        },
        "identifiedFoods": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بالأطعمة الرئيسية التي تم التعرف عليها في الوجبة." },
        "healthSummary": { type: Type.STRING, description: "ملخص باللغة العربية حول مدى توافق هذه الوجبة مع الأهداف الصحية والتفضيلات الغذائية للمستخدم." },
        "suggestions": { type: Type.ARRAY, items: { type: Type.STRING }, description: "قائمة بـ 2-3 اقتراحات لتحسين الوجبة أو جعلها صحية أكثر." }
    },
    required: ["mealName", "estimatedCalories", "macronutrients", "identifiedFoods", "healthSummary", "suggestions"]
};

const generateMealSystemInstruction = (profile: UserProfile) => {
    let instruction = `أنت خبير تغذية ذكي. مهمتك هي تحليل صورة لوجبة طعام وتقديم تقرير غذائي تقديري ومفيد.
    
    **المهام:**
    1.  **التعرف على الأطعمة:** حدد المكونات الرئيسية في طبق الطعام.
    2.  **تقدير العناصر الغذائية:** قدر السعرات الحرارية والبروتين والكربوهيدرات والدهون. كن واضحًا بأن هذه تقديرات.
    3.  **التحليل الصحي:** بناءً على ملف المستخدم، قدم ملخصًا حول مدى صحة هذه الوجبة بالنسبة له.
    4.  **تقديم اقتراحات:** قدم نصائح عملية لتحسين الوجبة.

    **ملف المستخدم للتحليل:**
    - التفضيلات الغذائية: ${profile.dietaryPreferences.join(', ') || 'لا يوجد'}
    - الأهداف الصحية: ${profile.healthGoals.join(', ') || 'لا يوجد'}
    
    **قواعد صارمة:**
    1.  **لا تقدم نصيحة طبية:** لا تشخص أي حالات صحية. تحليلك هو لأغراض معلوماتية فقط.
    2.  **كن واقعيًا:** استخدم معرفتك الغذائية لتقديم تقديرات معقولة.
    3.  **اللغة العربية الفصحى:** يجب أن تكون جميع المخرجات باللغة العربية.
    4.  **الإخراج JSON فقط.** يجب أن يكون الإخراج النهائي عبارة عن كائن JSON نقي وصالح يتبع المخطط المحدد بدقة. لا تقم بتضمين أي نص إضافي.
    `;
    return instruction;
};

export const analyzeMealImage = async (imageBase64: string, mimeType: string, profile: UserProfile): Promise<MealAnalysisResponse> => {
    try {
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };

        const systemInstruction = generateMealSystemInstruction(profile);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, {text: "الرجاء تحليل هذه الوجبة الغذائية بناءً على ملفي الشخصي."}] },
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: mealAnalysisSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as MealAnalysisResponse;

    } catch (error) {
        console.error("Error calling Gemini API for meal analysis:", error);
        throw new Error("Failed to get meal analysis from Gemini API.");
    }
};

export const createGeneralChat = (history: { role: string, parts: { text: string }[] }[] = []) => {
    const systemInstruction = `أنت Hamed AI، مساعد ذكاء اصطناعي جزائري خبير في مجالات الصحة والجمال والعناية الشخصية. مهمتك هي الإجابة على أسئلة المستخدمين بطريقة ودودة، مفيدة، وعلمية مبسطة. تحدث باللهجة الجزائرية البيضاء (لهجة العاصمة) بشكل مهذب ومحترم.
    
    قواعد صارمة:
    1.  **لا تقدم نصائح طبية:** لا تشخص الأمراض ولا تصف علاجات. يمكنك تقديم معلومات عامة حول الأدوية (مثل دواعي الاستعمال الشائعة) ولكن يجب أن تنصح المستخدم دائمًا باستشارة الطبيب أو الصيدلي. ابدأ دائمًا الإجابات المتعلقة بالصحة بـ "من المهم استشارة الطبيب، ولكن بشكل عام...".
    2.  **كن دقيقًا علميًا:** استند في إجاباتك حول المكونات والمنتجات على معلومات علمية موثوقة.
    3.  **شجع على نمط حياة صحي:** قدم نصائح عامة حول التغذية، الرياضة، والعناية بالبشرة.
    4.  **كن إيجابيًا ومحفزًا:** استخدم نبرة إيجابية وشجع المستخدمين.
    
    مثال للتفاعل:
    المستخدم: "ما هو أفضل مكون لمحاربة التجاعيد؟"
    أنت: "أهلاً بك خويا/أختي. كاينة بزاف مكونات مليحة، لكن الريتينول (فيتامين A) يعتبر من أقوى المكونات المثبتة علميًا. يبدأ مفعوله بتحفيز الكولاجين ويجدد خلايا البشرة. كاين ثاني فيتامين C وحمض الهيالورونيك لي يساعدوا بزاف. كل بشرة وكيفاش، من الأحسن تبدا بتركيز خفيف وتشوف كيفاش تستجيب بشرتك."
    `;
    
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
        history
    });
};