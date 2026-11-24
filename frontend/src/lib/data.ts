import { createClient } from '@supabase/supabase-js';

// Safe for SSR/Client usage for public data
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

export interface Product {
  id?: string;
  supplier_id?: string;
  image: string;
  title: string;
  price: string;
  category: string;
  slug: string;
  keywords?: string[];
  supplier?: string;
  supplier_details?: {
    id?: string;
    name: string;
    location: string;
    logo_url: string;
    created_at: string;
  };
  description?: string;
  unit?: string;
  score?: number;
  extra_images?: string[];
  youtube_url?: string;
  pdf_url?: string;
  specifications?: {key: string, value: string}[];
}

export interface SupplierData {
  id: string;
  name: string;
  avatar: string;
  country: string;
  countryFlag: string;
  city: string;
  verified: boolean;
  factoryVerified: boolean;
  tradeAssurance: boolean;
  yearsInBusiness: number;
  establishedYear: number;
  responseTime: string;
  responseRate: string;
  inquiryCount: number;
  successfulQuotations: number;
  rating: number;
  reviewCount: number;
  exportCountries: string[];
  mainProducts: string;
  description: string;
  email?: string;
}

// ── Mock Supplier Data ──
const suppliers: SupplierData[] = [
  {
    id: "sup_001",
    name: "KifaruTrade Industrial Solutions Ltd.",
    avatar: "KT",
    country: "Kenya",
    countryFlag: "🇰🇪",
    city: "Nairobi",
    verified: true,
    factoryVerified: true,
    tradeAssurance: true,
    yearsInBusiness: 12,
    establishedYear: 2014,
    responseTime: "≤ 12h",
    responseRate: "96%",
    inquiryCount: 1250,
    successfulQuotations: 840,
    rating: 4.8,
    reviewCount: 156,
    exportCountries: ["Tanzania", "Uganda", "Ethiopia", "Nigeria", "South Africa", "DRC"],
    mainProducts: "Heavy Machinery, Mining Equipment, Construction Tools, Agricultural Implements",
    description:
      "KifaruTrade Industrial Solutions is a leading B2B supplier based in Nairobi, Kenya, specializing in heavy-duty industrial equipment for the African market. With over 12 years of experience, we provide high-quality machinery backed by dedicated after-sales support and competitive pricing. Our products serve mining, construction, and agricultural sectors across East and Southern Africa.",
  },
];

export function getSupplierByName(name: string): SupplierData | undefined {
  return suppliers.find((s) => s.name === name);
}

export function getDefaultSupplier(): SupplierData {
  return suppliers[0];
}

export interface Category {
  icon: string;
  label: string;
}

// We will fetch from Supabase instead

const categories: Category[] = [
  { icon: "/icons/construction.png", label: "Construction Equipment" },
  { icon: "/icons/agriculture.png", label: "Agricultural Machinery" },
  { icon: "/icons/mining.png", label: "Mining Tools" },
  { icon: "/icons/industrial.png", label: "Industrial Parts" },
];

// ── Synchronous accessors (for client-side search) ──
// Note: We now fetch async. This is kept temporarily to avoid breaking components that expect it.
export function getAllProductsSync(): Product[] {
  return []; // Sync fetch is no longer supported, use getProducts()
}

export function getAllCategoriesSync(): Category[] {
  return categories;
}

// ── Async Data Access API functions ──
export async function getProducts(category?: string | null, searchQuery?: string | null): Promise<Product[]> {
  let query = supabase.from('products').select('*, suppliers(company_name, location, logo_url, created_at)').eq('status', 'Active').order('created_at', { ascending: false });
  
  if (category) {
    query = query.eq('category', category);
  }
  
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }
  
  const { data, error } = await query;
  if (error || !data) {
    if (error) console.error("Error fetching products:", error.message || error);
    return [];
  }
  
  return data.map((p: any) => ({
    id: p.id,
    supplier_id: p.supplier_id,
    title: p.title,
    price: p.price ? `$${p.price} ${p.unit ? `/ ${p.unit}` : ''}` : 'Contact for price',
    category: p.category,
    slug: p.slug,
    image: p.image_url || "/products/product1.jpg",
    supplier: p.suppliers?.company_name || 'Verified Supplier',
    supplier_details: p.suppliers ? {
      id: p.supplier_id,
      name: p.suppliers.company_name || 'Verified Supplier',
      location: p.suppliers.location || 'Unknown',
      logo_url: p.suppliers.logo_url || null,
      created_at: p.suppliers.created_at || new Date().toISOString()
    } : undefined,
    description: p.description,
    unit: p.unit,
    score: p.score,
    extra_images: p.extra_images || [],
    youtube_url: p.youtube_url,
    pdf_url: p.pdf_url,
    specifications: p.specifications || []
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const { data, error } = await supabase
    .from('products')
    .select('*, suppliers(company_name, location, logo_url, created_at)')
    .eq('slug', slug)
    .single();
    
  if (error || !data) return undefined;
  
  return {
    id: data.id,
    supplier_id: data.supplier_id,
    title: data.title,
    price: data.price ? `$${data.price} ${data.unit ? `/ ${data.unit}` : ''}` : 'Contact for price',
    category: data.category,
    slug: data.slug,
    image: data.image_url || "/products/product1.jpg",
    supplier: data.suppliers?.company_name || 'Verified Supplier',
    supplier_details: data.suppliers ? {
      id: data.supplier_id,
      name: data.suppliers.company_name || 'Verified Supplier',
      location: data.suppliers.location || 'Unknown',
      logo_url: data.suppliers.logo_url || null,
      created_at: data.suppliers.created_at || new Date().toISOString()
    } : undefined,
    description: data.description,
    unit: data.unit,
    score: data.score,
    extra_images: data.extra_images || [],
    youtube_url: data.youtube_url,
    pdf_url: data.pdf_url,
    specifications: data.specifications || []
  };
}

export async function getCategories(): Promise<Category[]> {
  return categories;
}

export async function getRecommendedProducts(currentProductSlug: string, limit: number = 4): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*, suppliers(company_name)')
    .eq('status', 'Active')
    .neq('slug', currentProductSlug)
    .limit(limit);
    
  if (error || !data) return [];
  
  return data.map((p: any) => ({
    id: p.id,
    title: p.title,
    price: p.price ? `$${p.price} ${p.unit ? `/ ${p.unit}` : ''}` : 'Contact for price',
    category: p.category,
    slug: p.slug,
    image: p.image_url || "/products/product1.jpg",
    supplier: p.suppliers?.company_name || 'Verified Supplier'
  }));
}
