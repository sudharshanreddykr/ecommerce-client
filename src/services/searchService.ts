import { Product, SearchSuggestion } from '@/types';
import { productService } from '@/services/productService';

const scoreProduct = (product: Product, query: string) => {
  if (!query.trim()) {
    return 1;
  }

  const haystack = [product.name, product.description ?? '', product.sku].join(' ').toLowerCase();
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);

  return tokens.reduce((score, token) => {
    if (product.name.toLowerCase().includes(token)) {
      return score + 5;
    }
    if (product.sku.toLowerCase().includes(token)) {
      return score + 4;
    }
    if (haystack.includes(token)) {
      return score + 2;
    }
    return score;
  }, 0);
};

export const searchService = {
  // This is intentionally shaped like an Elastic-backed search facade so the UI can keep
  // the same contract when the backend adds Elasticsearch later.
  async searchCatalog(query: string) {
    const response = await productService.fetchProducts(1, 60, query);
    const products = response.data ?? [];

    const ranked = [...products].sort(
      (left, right) => scoreProduct(right, query) - scoreProduct(left, query)
    );
    const recommendations = ranked
      .filter((product) => product.quantity > 0)
      .sort((left, right) => right.quantity - left.quantity)
      .slice(0, 6);

    return {
      results: ranked,
      recommendations,
    };
  },

  async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    const response = await productService.fetchProducts(1, 12, query);
    const products = response.data ?? [];

    return products
      .map((product) => {
        const name = product.name.toLowerCase();
        const sku = product.sku.toLowerCase();
        const description = (product.description ?? '').toLowerCase();

        if (name.includes(normalizedQuery)) {
          return {
            label: product.name,
            query: product.name,
            matchType: 'name' as const,
            productId: product.id,
          };
        }

        if (sku.includes(normalizedQuery)) {
          return {
            label: `${product.name} (${product.sku})`,
            query: product.sku,
            matchType: 'sku' as const,
            productId: product.id,
          };
        }

        if (description.includes(normalizedQuery)) {
          return {
            label: `${product.name} - ${product.description}`,
            query: product.name,
            matchType: 'description' as const,
            productId: product.id,
          };
        }

        return null;
      })
      .filter((suggestion): suggestion is SearchSuggestion => Boolean(suggestion))
      .slice(0, 8);
  },
};
