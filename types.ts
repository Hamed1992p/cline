
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
  المكونات_الإيجابية: Ingredient[];
  المكونات_السلبية: Ingredient[];
  المكونات_المشكوك_فيها: Ingredient[];
  الممارسات_التسويقية_الخادعة: MarketingClaim[];
  اقتراحات_بديلة?: Suggestion[];
  ملاحظات_إضافية: string;
}
