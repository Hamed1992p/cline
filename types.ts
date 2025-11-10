export interface UserProfile {
  skinType: string;
  dietaryPreferences: string[];
  healthGoals: string[];
  ethicalConcerns: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  isLoading?: boolean;
}

export interface Ingredient {
  الاسم_العربي: string;
  الاسم_العلمي_او_الإنجليزي: string;
  الوصف_والفوائد?: string;
  الوصف_والمخاطر?: string;
  الوصف_والتساؤلات?: string;
  مصادر_علمية: string[];
}

export interface MarketingClaim {
  الادعاء_التسويقي: string;
  التحليل_والتكذيب_العلمي: string;
  مصادر_علمية: string[];
}

export interface Suggestion {
  اسم_المنتج_البديل: string;
  السبب: string;
}

export interface AnalysisResponse {
  اسم_المنتج: string;
  العلامة_التجارية?: string;
  الحجم_او_الوزن?: string;
  فئة_المنتج?: string;
  ملخص_التحليل: string;
  التقييم_العام?: {
    التقييم: string; // e.g., "A+", "B-", "C"
    النقاط: number; // e.g., 95, 82, 70
    السبب: string;
  };
  المكونات_الإيجابية: Ingredient[];
  المكونات_السلبية: Ingredient[];
  المكونات_المشكوك_فيها: Ingredient[];
  الممارسات_التسويقية_الخادعة: MarketingClaim[];
  اقتراحات_بديلة?: Suggestion[];
  ملاحظات_إضافية: string;
}

export interface ScanHistoryItem {
  id: string;
  date: string;
  image: string;
  analysis: AnalysisResponse;
}

export interface ComparisonPoint {
  feature: string;
  product1_value: string;
  product2_value: string;
}

export interface ComparisonResponse {
  recommendation: string;
  product1_name: string;
  product2_name: string;
  product1_pros: string[];
  product1_cons: string[];
  product2_pros: string[];
  product2_cons: string[];
  detailed_comparison: ComparisonPoint[];
}

// New types for Skincare Routine feature
export interface RoutineProduct {
  id: string;
  name: string;
  image: string;
}

export interface Routine {
  morning: RoutineProduct[];
  evening: RoutineProduct[];
}

export interface RoutineConflict {
    product_1: string;
    product_2: string;
    reason: string;
}

export interface RoutineAnalysis {
    overall_score: number;
    overall_summary: string;
    conflicts: RoutineConflict[];
    suggested_order: string[];
    enhancement_suggestions: string[];
}

// New type for Medication Analysis feature
export interface MedicationAnalysisResponse {
    drugName: string;
    activeIngredients: string[];
    summary: string;
    indications: string[];
    dosage: string;
    sideEffects: string[];
    warnings: string[];
}

// New type for Meal Analysis feature
export interface MealAnalysisResponse {
    mealName: string;
    estimatedCalories: {
        value: number;
        unit: string;
    };
    macronutrients: {
        protein: string;
        carbohydrates: string;
        fat: string;
    };
    identifiedFoods: string[];
    healthSummary: string;
    suggestions: string[];
}