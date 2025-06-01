import React, { useMemo, type FC } from "react";
import type { plugins } from "@wix/stores/dashboard";
import { useProducts } from "./useProducts";
import {
  WixDesignSystemProvider,
  Card,
  Box,
  Loader,
  Text,
  Button,
  Image,
} from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import { dashboard } from "@wix/dashboard";

type Props = plugins.Products.ProductsBannerParams;

// Get products from store using custom hook
const Plugin: FC<Props> = () => {
  const { products, isLoading, error } = useProducts();

   // Calculate the most expensive product without a discount
  const [
    mostExpensiveNonDiscountProductName,
    mostExpensiveNonDiscountProductPrice,
    mostExpensiveNonDiscountProductImage,
  ] = useMemo(() => {
    if (products?.length === 0) return [null, null, null];

    // Filter products that don't have a discount
    const nonDiscountProducts = products.filter(
      (product) =>
        !product.discount ||
        product.discount.type === "NONE" ||
        product.discount.type === "UNDEFINED" ||
        !product.discount.value ||
        product.discount.value === 0
    );

    if (nonDiscountProducts.length === 0) return [null, null, null];

    // Find the most expensive product from the filtered list
    const mostExpensiveNonDiscountProduct = nonDiscountProducts.reduce(
      (max, product) =>
        (product.priceData?.price || 0) > (max.priceData?.price || 0)
          ? product
          : max
    );

    // Return relevant fields for display
    return [
      mostExpensiveNonDiscountProduct.name,
      mostExpensiveNonDiscountProduct.priceData?.price || 0,
      mostExpensiveNonDiscountProduct.media?.mainMedia?.image?.url || null,
    ];
  }, [products]);

   // Navigate to the custom Discount Page when the button is clicked
  const navigateToDiscountPage = () => {
    dashboard.navigate({
      pageId: "5abea501-3012-4331-a60c-f94d3914facf",
    });
  };

  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <Card>
        <Card.Content size="medium">
          <Box
            gap="SP2"
            direction="horizontal"
            verticalAlign="middle"
            align={"center"}
          >
            {isLoading && <Loader size={"small"} />}
            {error && (
              <Text skin={"error"} size={"medium"}>
                {error}
              </Text>
            )}
          </Box>
          {mostExpensiveNonDiscountProductName &&
            mostExpensiveNonDiscountProductPrice && (
              <Box gap="SP2" direction="horizontal" verticalAlign="middle">
                {mostExpensiveNonDiscountProductImage && (
                  <Image
                    src={mostExpensiveNonDiscountProductImage}
                    alt={mostExpensiveNonDiscountProductName}
                    width={50}
                    height={50}
                    fit="cover"
                  />
                )}
                <Text weight="bold">Top-priced item on your shelf:</Text>
                <Text>
                  {mostExpensiveNonDiscountProductName}
                  {" - $"}
                  {mostExpensiveNonDiscountProductPrice}
                </Text>
                <Button onClick={navigateToDiscountPage} color={"white"}>
                  Apply Discount Now
                </Button>
              </Box>
            )}
        </Card.Content>
      </Card>
    </WixDesignSystemProvider>
  );
};

export default Plugin;