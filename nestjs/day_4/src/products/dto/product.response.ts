import { Product } from "@products/entities/product.entity";
import { PickType } from "@nestjs/mapped-types/dist/pick-type.helper";

export class ProductResponseDto extends PickType(
    Product,
    ['id', 'name', 'price', 'stock'] as const
) { }
