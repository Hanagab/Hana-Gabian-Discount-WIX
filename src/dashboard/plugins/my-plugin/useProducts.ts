// React hook for managing product fetching logic from Wix Stores
import { useState, useEffect } from "react";
import { Product } from "@wix/auto_sdk_stores_products";
import { queryProducts } from "./utils";

// Define the return type of the hook
interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

// Custom hook to fetch and manage store products
export const useProducts = (): UseProductsReturn => {
   // State for the fetched product list
  const [products, setProducts] = useState<Product[]>([]);
   // State to indicate loading status
  const [isLoading, setIsLoading] = useState(false);
  // State to capture any error that occurs while fetching
  const [error, setError] = useState<string | null>(null);

  // Fetch products from the server and update state accordingly
  const refreshProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await queryProducts();
      setProducts(result);
    } catch (error: any) {
      setError(error?.message || "Error fetching products");
    } finally {
      setIsLoading(false);
    }
  };

  // Load products automatically when the page opens
  useEffect(() => {
    refreshProducts();
  }, []);

  // Return the state and refresh function for use in components
  return {
    products,
    isLoading,
    error,
    refreshProducts,
  };
};