// Define Product type from the Wix auto-generated SDK
import { Product } from "@wix/auto_sdk_stores_products";
import { products } from "@wix/stores";

// Fetch all products from the Wix Store
export async function queryProducts(): Promise<Product[]> {
  const { items } = await products.queryProducts().find();
  return items;
}

//Apply a discount to a product by setting a fixed amount discount
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
