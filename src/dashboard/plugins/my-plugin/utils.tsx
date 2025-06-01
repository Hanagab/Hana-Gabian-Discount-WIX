import { Product } from "@wix/auto_sdk_stores_products";
import { products } from "@wix/stores";

export async function queryProducts(): Promise<Product[]> {
  const { items } = await products.queryProducts().find();
  return items;
}

export async function applyDiscountToProduct(
  productId: string,
  discountPercentage: number,
  originalPrice: number
): Promise<void> {
  await products.updateProduct(productId, {
    discount: {
      type: "AMOUNT",
      value: originalPrice * (discountPercentage / 100),
    },
  });
}
