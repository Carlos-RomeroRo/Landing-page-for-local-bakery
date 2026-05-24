export type CategoryKey = 'all' | 'panes' | 'reposteria' | 'comida_rapida' | 'otros';

export type ProductoTipoApi = 'panes' | 'reposteria' | 'comidas_rapidas' | 'otros';

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  all: 'Todas las categorías',
  panes: 'Panes',
  reposteria: 'Repostería',
  comida_rapida: 'Comida rápida',
  otros: 'Otros',
};

const CATEGORY_TO_API: Record<Exclude<CategoryKey, 'all'>, ProductoTipoApi> = {
  panes: 'panes',
  reposteria: 'reposteria',
  comida_rapida: 'comidas_rapidas',
  otros: 'otros',
};

const API_TO_CATEGORY: Record<ProductoTipoApi, Exclude<CategoryKey, 'all'>> = {
  panes: 'panes',
  reposteria: 'reposteria',
  comidas_rapidas: 'comida_rapida',
  otros: 'otros',
};

export function categoryKeyToApiTipo(categoria: CategoryKey): ProductoTipoApi | null {
  if (categoria === 'all') {
    return null;
  }
  return CATEGORY_TO_API[categoria];
}

export function apiTipoToCategoryKey(tipo: string): Exclude<CategoryKey, 'all'> {
  return API_TO_CATEGORY[tipo as ProductoTipoApi] ?? 'otros';
}

export const DEFAULT_CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as CategoryKey[]).map((key) => ({
  key,
  label: CATEGORY_LABELS[key],
}));
