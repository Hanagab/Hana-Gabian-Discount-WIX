import { useState, useEffect } from "react";
import { Product } from "@wix/auto_sdk_stores_products";
import { queryProducts } from "./utils";

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    refreshProducts();
  }, []);

  return {
    products,
    isLoading,
    error,
    refreshProducts,
  };
};