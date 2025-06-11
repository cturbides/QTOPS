// Implementaremos un sistema de validación y transformación type-safe usando utility types avanzados:
// Ejercicio: Extiende este sistema para incluir template literal types para
//  product categories y conditional types para diferentes tipos de productos
//  (físicos vs digitales). Al finalizar, compartir enlace del repositorio de
//  la solución

/*
 * Product categories and type
 */

const categories: Array<string> = [
  "home",
  "food",
  "toys",
  "games",
  "sports",
  "beauty",
  "kitchen",
  "outdoors",
  "clothing",
  "accessories",
  "electronics",
] as const;

const formats: Array<string> = ["digital", "physical"] as const;

type Category = (typeof categories)[number];

type Format = (typeof formats)[number];

// template literal types
type ProductCategory = `${Format}_${Category}`;

// Sistema de validación type-safe con utility types + ProductCategory + Format
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  inStock: boolean;
  tags: string[];
  metadata: {
    weight: number;
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
  };
}

/*
 * Conditional Type
 */

type ExtractCategory<T extends ProductCategory> =
  T extends `${Format}_${infer C}` ? C : never;

type ExtraProductData<T extends ProductCategory> =
  T extends `${infer F}_${string}`
    ? F extends "digital"
      ? {
          downloadUrl: string;
          licenseKey: string;
          metadata?: never;
        }
      : F extends "physical"
        ? {
            shippingWeight: number;
            metadata: Product["metadata"];
            downloadUrl?: never;
            licenseKey?: never;
          }
        : never
    : never;

type FormattedProduct<T extends ProductCategory> = Omit<
  Product,
  "category" | "metadata"
> & {
  category: ExtractCategory<T>;
} & ExtraProductData<T>;
/* */

// Transformaciones declarativas

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepPartial<T[P]>
    : T[P];
};

type CreateProductRequest = Omit<Product, "id">;
type UpdateProductRequest = DeepPartial<Omit<Product, "id">>;
type ProductSummary = Pick<Product, "id" | "name" | "price" | "inStock">;
type ProductSearchResult = Pick<Product, "id" | "name" | "price" | "category">;

// Validation system con conditional types
type ValidationResult<T> = T extends object
  ? { success: true; data: T; errors?: never }
  : { success: false; data?: never; errors: string[] };

// Type guard for ProductCategory
function isValidProductCategory(value: unknown): value is ProductCategory {
  if (typeof value !== "string") {
    return false;
  }

  const [format, category] = value.split("_");

  return formats.includes(format) && categories.includes(category);
}

// Type guards con utility types
function isValidCreateProduct(data: unknown): data is CreateProductRequest {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as any).name === "string" &&
    typeof (data as any).price === "number" &&
    isValidProductCategory((data as any).category) &&
    typeof (data as any).description === "string" &&
    typeof (data as any).inStock === "boolean" &&
    Array.isArray((data as any).tags) &&
    typeof (data as any).metadata === "object"
  );
}

// Service con transformaciones automáticas
class ProductService {
  async createProduct(data: unknown): Promise<ValidationResult<Product>> {
    if (!isValidCreateProduct(data)) {
      return {
        success: false,
        errors: ["Invalid product data format"],
      } as ValidationResult<never>;
    }

    const product: Product = {
      id: `product_${Date.now()}`,
      ...data,
    };

    //await this.repository.save(product);

    return {
      success: true,
      data: product,
    } as ValidationResult<Product>;
  }

  async updateProduct(
    id: string,
    updates: UpdateProductRequest,
  ): Promise<ValidationResult<Product>> {
    //const existingProduct = await this.repository.findById(id);
    const existingProduct: Product = {
      id: "123",
      name: "Online Game",
      price: 49.99,
      category: "games",
      description: "Fun game",
      inStock: true,
      tags: ["multiplayer"],
      metadata: {
        weight: 10,
        dimensions: {
          width: 20,
          height: 30,
          depth: 40,
        },
      },
    };

    if (!existingProduct) {
      return {
        success: false,
        errors: ["Product not found"],
      } as ValidationResult<never>;
    }

    // Deep merge con type safety
    const updatedProduct: Product = {
      ...existingProduct,
      ...updates,
      tags: updates.tags
        ? (updates.tags as string[])
        : (existingProduct.tags as string[]),
      metadata: {
        ...existingProduct.metadata,
        ...updates.metadata,
        dimensions: {
          ...existingProduct.metadata.dimensions,
          ...updates.metadata?.dimensions,
        },
      },
    };

    //await this.repository.save(updatedProduct);

    return {
      success: true,
      data: updatedProduct,
    } as ValidationResult<Product>;
  }

  async searchProducts(query: string): Promise<ProductSearchResult[]> {
    //const products = await this.repository.search(query);
    const products = [] as Product[];

    // Transformación automática a search result format
    return products.map((product: Product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    }));
  }
}

/*
 * Ejemplos type-safe
 */
const physicalProduct: FormattedProduct<"physical_games"> = {
  id: "123",
  name: "Online Game",
  price: 49.99,
  category: "games",
  description: "Fun game",
  inStock: true,
  tags: ["multiplayer"],
  shippingWeight: 20,
  metadata: {
    weight: 10,
    dimensions: {
      width: 20,
      height: 30,
      depth: 40,
    },
  },
};

const digitalProduct: FormattedProduct<"digital_games"> = {
  id: "123",
  name: "Online Game",
  price: 49.99,
  category: "games",
  description: "Fun game",
  inStock: true,
  tags: ["multiplayer"],
  licenseKey: "ABC-123-XYZ",
  downloadUrl: "https://example.com/game",
};

// Ejemplo de ProductService
//
type MatchedProduct = {
  [T in ProductCategory]: Omit<FormattedProduct<T>, "id">;
};

type CreateFormattedProduct<T extends ProductCategory> = MatchedProduct[T];

function isValidCreateProductV2<T extends ProductCategory>(
  data: unknown,
): data is CreateFormattedProduct<ProductCategory>[T] {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const d = data as any;

  if (
    typeof d.name !== "string" ||
    typeof d.price !== "number" ||
    typeof d.description !== "string" ||
    typeof d.inStock !== "boolean" ||
    !Array.isArray(d.tags) ||
    typeof d.category !== "string"
  ) {
    return false;
  }

  const [format, category] = d.category.split("_");

  if (!formats.includes(format) || !categories.includes(category)) {
    return false;
  }

  if (format === "digital") {
    return (
      typeof d.downloadUrl === "string" &&
      typeof d.licenseKey === "string" &&
      d.metadata === undefined
    );
  }

  if (format === "physical") {
    return (
      typeof d.shippingWeight === "number" &&
      typeof d.metadata === "object" &&
      typeof d.metadata.weight === "number" &&
      typeof d.metadata.dimensions === "object" &&
      typeof d.metadata.dimensions.width === "number" &&
      typeof d.metadata.dimensions.height === "number" &&
      typeof d.metadata.dimensions.depth === "number" &&
      d.downloadUrl === undefined &&
      d.licenseKey === undefined
    );
  }

  return false;
}

class ProductServiceV2 {
  async createProduct(
    data: unknown,
  ): Promise<ValidationResult<FormattedProduct<any>>> {
    if (!isValidCreateProduct(data)) {
      return {
        success: false,
        errors: ["Invalid product data format"],
      } as ValidationResult<never>;
    }

    const product = {
      id: `product_${Date.now()}`,
      ...data,
    };

    //await this.repository.save(product as Product);

    return {
      success: true,
      data: product as any,
    } as ValidationResult<FormattedProduct<any>>;
  }
}

const isValidDigitalGameProduct = isValidCreateProductV2({
  id: "123",
  name: "Online Game",
  price: 49.99,
  category: "digital_games",
  description: "Fun game",
  inStock: true,
  tags: ["multiplayer"],
  licenseKey: "ABC-123-XYZ",
  downloadUrl: "https://example.com/game",
});

const isValidPhysicalKitchen = isValidCreateProductV2({
  id: "123",
  name: "Big fridge",
  price: 149.99,
  description: "Smart fridge",
  category: "physical_kitchen",
  inStock: true,
  tags: ["appliance"],
  shippingWeight: 20,
  metadata: {
    weight: 10,
    dimensions: {
      width: 20,
      height: 30,
      depth: 40,
    },
  },
});

console.log({
  isValidPhysicalKitchen: isValidPhysicalKitchen,
  isValidDigitalGameProduct: isValidDigitalGameProduct,
});
