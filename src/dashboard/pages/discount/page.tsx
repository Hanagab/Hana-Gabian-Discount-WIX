import React, { useEffect, useMemo, useState, type FC } from "react";
import {
  Page,
  WixDesignSystemProvider,
  Card,
  Box,
  Loader,
  Text,
  Button,
  Input,
} from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import { applyDiscountToProduct } from "../../plugins/my-plugin/utils";
import { useProducts } from "../../plugins/my-plugin/useProducts";
import { dashboard } from "@wix/dashboard";

const DashboardPage: FC = () => {
  // Custom hook that fetches products from the store
  const { products, isLoading, error } = useProducts();
  // Discount percentage entered by the admin
  const [discountPercentage, setDiscountPercentage] = useState<string>("");
  // Indicates whether a discount operation is in progress
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  // Index of the current product being shown from the non-discounted list
  const [productIndex, setProductIndex] = useState(0);
  // Flag to indicate when there are no more eligible products
  const [noProductsLeft, setNoProductsLeft] = useState(false);


  // Show error toast if there's an error from the hook
  useEffect(() => {
    if (error) {
      dashboard.showToast({
        message: error,
        type: "error",
        timeout: "normal",
      });
    }
  }, [error]);

  // Filter out products that already have a discount and sort by price descending
 const nonDiscountProducts = useMemo(() => {
  if (!products || products.length === 0) return [];
  return products
    .filter(
      (product) =>
        !product.discount ||
        product.discount.type === "NONE" ||
        product.discount.type === "UNDEFINED" ||
        !product.discount.value ||
        product.discount.value === 0
    )
    .sort(
      (a, b) =>
        (b.priceData?.price || 0) - (a.priceData?.price || 0)
    );
}, [products]);

// Select the current most expensive product without a discount
const mostExpensiveNonDiscountProduct = nonDiscountProducts[productIndex];


// Apply the entered discount to the current product
  const applyDiscount = async () => {
    if (!mostExpensiveNonDiscountProduct) return;
    if (isApplyingDiscount) return;
    // Validate discount percentage (must be between 1 and 100)
    const percentage = parseFloat(discountPercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      dashboard.showToast({
        message: "Please enter a valid discount percentage between 1 and 100",
        type: "error",
        timeout: "normal",
      });
      return;
    }

    // Make sure the product has a valid ID before updating
   const product = mostExpensiveNonDiscountProduct;

    if (!product || !product._id) {
      dashboard.showToast({
        message: "Product not found or missing ID",
        type: "error",
        timeout: "normal",
      });
      return;
    }

    setIsApplyingDiscount(true);
    try {
      // Apply discount using utility function
      await applyDiscountToProduct(
  product._id,
  percentage,
  product.priceData?.price || 0
);

// Show success message
dashboard.showToast({
  message: `Successfully applied ${percentage}% discount to ${product.name}`,
  type: "success",
  timeout: "normal",
});

setDiscountPercentage("");

// Move to next product, or show a message if none left
if (productIndex + 1 < nonDiscountProducts.length) {
  setProductIndex(productIndex + 1);
} else {
  setNoProductsLeft(true);
}

    } finally {
      setIsApplyingDiscount(false);
    }
  };

  return (
    <WixDesignSystemProvider features={{ newColorsBranding: true }}>
      <Page>
        <Page.Header
          title="Discount Product"
          subtitle="Create exclusive product deals in just one click"
        />
        <Page.Content>
          <Card>
            <Card.Content size="medium">
              <Box
                gap="SP2"
                direction="horizontal"
                verticalAlign="middle"
                align={"center"}
              >
                {isLoading && <Loader />}
              </Box>
              {mostExpensiveNonDiscountProduct && (
                  <Box gap="SP4" direction="horizontal">
                    {/* Left Side - Product Image */}
                    <Box
                      direction="vertical"
                      align="center"
                      verticalAlign="middle"
                      style={{ flex: "1", minWidth: "300px" }}
                    >
                      {(() => {
                       const product = mostExpensiveNonDiscountProduct;
                        if (!product) {
                          return <Loader size="medium" />;
                        }

                        // Check if product has media/images
                        if (
                          product.media &&
                          product.media.items &&
                          product.media.items.length > 0
                        ) {
                          const imageUrl = product.media.items[0].image?.url;
                          if (imageUrl) {
                            return (
                              <img
                                src={imageUrl}
                                alt={product.name || "Product image"}
                                style={{
                                  maxWidth: "100%",
                                  maxHeight: "400px",
                                  objectFit: "contain",
                                  borderRadius: "8px",
                                }}
                              />
                            );
                          }
                        }

                        // Fallback if no image available
                        return (
                          <Box
                            align="center"
                            verticalAlign="middle"
                            style={{
                              width: "250px",
                              height: "250px",
                              backgroundColor: "#f5f5f5",
                              borderRadius: "8px",
                              border: "2px dashed #ddd",
                            }}
                          >
                            <Text size="small" secondary>
                              No Image Available
                            </Text>
                          </Box>
                        );
                      })()}
                    </Box>

                    {/* Right Side - Product Details, Input, and Button */}
                    <Box
                      gap="SP4"
                      direction="vertical"
                      style={{ flex: "1", minWidth: "400px" }}
                    >
                      <Box
                        gap="SP2"
                        direction="horizontal"
                        verticalAlign="middle"
                      >
                        <Text weight="bold" size="medium">
                          Let’s Make Your Priciest Product Pop!
                        </Text>
                      </Box>

                      <Box gap="SP3" direction="vertical">
                        <Box
                          gap="SP2"
                          direction="horizontal"
                          verticalAlign="middle"
                        >
                          <Text weight="bold">Name:</Text>
                          <Text size="medium">
                            {mostExpensiveNonDiscountProduct.name}
                          </Text>
                        </Box>

                        <Box
                          gap="SP2"
                          direction="horizontal"
                          verticalAlign="middle"
                        >
                          <Text weight="bold">Price:</Text>
                          <Text size="medium" weight="bold" skin="success">
                            ${mostExpensiveNonDiscountProduct.priceData?.price}
                          </Text>
                        </Box>

                        {(() => {
                          const product = mostExpensiveNonDiscountProduct;
                          if (!product) return null;

                          return (
                            <>
                            // Show additional product details if available
                              {product.description && (
                                <Box gap="SP2" direction="vertical">
                                  <Text weight="bold">Description:</Text>
                                  <Text size="small" secondary>
                                    {product.description}
                                  </Text>
                                </Box>
                              )}

                              {product.stock && (
                                 // Show stock status
                                <Box
                                  gap="SP2"
                                  direction="horizontal"
                                  verticalAlign="middle"
                                >
                                  <Text weight="bold">Stock:</Text>
                                  <Text
                                    size="small"
                                    skin={
                                      product.stock.inStock
                                        ? "success"
                                        : "error"
                                    }
                                  >
                                    {product.stock.inStock
                                      ? `In Stock (${
                                          product.stock.quantity || "Available"
                                        })`
                                      : "Out of Stock"}
                                  </Text>
                                </Box>
                              )}

                              {product.ribbon && (
                                 // Show product ribbon label
                                <Box
                                  gap="SP2"
                                  direction="horizontal"
                                  verticalAlign="middle"
                                >
                                  <Text weight="bold">Ribbon:</Text>
                                  <Text size="small">{product.ribbon}</Text>
                                </Box>
                              )}

                              {product.brand && (
                                // Show product brand name
                                <Box
                                  gap="SP2"
                                  direction="horizontal"
                                  verticalAlign="middle"
                                >
                                  <Text weight="bold">Brand:</Text>
                                  <Text size="small">{product.brand}</Text>
                                </Box>
                              )}
                            </>
                          );
                        })()}

                        <Box
                          gap="SP3"
                          direction="vertical"
                          style={{
                            width: "400px",
                          }}
                        >
                          <Text weight="bold" size="medium">
                            Set a discount:
                          </Text>
                          // Discount input field and Apply Discount button
                          <Input
                            placeholder="Enter discount percentage"
                            value={discountPercentage}
                            onChange={(e) =>
                              setDiscountPercentage(e.target.value)
                            }
                            type="number"
                            size={"medium"}
                          />

                          <Box
                            gap="SP2"
                            direction="horizontal"
                            verticalAlign="middle"
                          >
                            <Button
                              onClick={applyDiscount}
                              color={"white"}
                              disabled={
                                !discountPercentage ||
                                parseFloat(discountPercentage) <= 0 ||
                                parseFloat(discountPercentage) > 100
                              }
                            >
                              {isApplyingDiscount ? (
                                <Loader size="tiny" color={"blue"} />
                              ) : (
                                <>
                                  Apply Discount
                                </>
                              )}
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
            </Card.Content>
          </Card>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
};

export default DashboardPage;