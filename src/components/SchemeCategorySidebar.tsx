import type { SchemeCategory } from '@/types';

export interface CategoryOption {
  readonly label: 'All' | SchemeCategory;
  readonly count: number;
}

interface SchemeCategorySidebarProps {
  readonly categories: ReadonlyArray<CategoryOption>;
  readonly selectedCategory: CategoryOption['label'];
  readonly onSelectCategory: (category: CategoryOption['label']) => void;
}

export function SchemeCategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: SchemeCategorySidebarProps) {
  return (
    <aside className="lg:sticky lg:top-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-tertiary">
        Categories
      </p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
        {categories.map((category) => {
          const isSelected = category.label === selectedCategory;

          return (
            <button
              key={category.label}
              type="button"
              onClick={() => onSelectCategory(category.label)}
              className={`flex min-w-fit items-center justify-between gap-8 border-b px-0 py-3 text-left font-mono text-xs uppercase tracking-[0.18em] transition lg:w-full ${
                isSelected
                  ? 'border-accent text-text-primary'
                  : 'border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>{category.label}</span>
              <span className={isSelected ? 'text-accent' : 'text-text-tertiary'}>
                {category.count}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}