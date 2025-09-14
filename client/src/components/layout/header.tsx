import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
  onCreateNew?: () => void;
  createButtonText?: string;
  searchPlaceholder?: string;
}

export function Header({
  title,
  subtitle,
  onSearch,
  onCreateNew,
  createButtonText = "Create New",
  searchPlaceholder = "Search...",
}: HeaderProps) {
  return (
    <header className="bg-card border-b border-border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="page-title">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground" data-testid="page-subtitle">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {onSearch && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-muted-foreground w-4 h-4" />
              </div>
              <Input
                type="text"
                placeholder={searchPlaceholder}
                className="pl-10 pr-4 py-2 w-64"
                onChange={(e) => onSearch(e.target.value)}
                data-testid="search-input"
              />
            </div>
          )}
          {onCreateNew && (
            <Button onClick={onCreateNew} data-testid="create-new-button">
              <Plus className="w-4 h-4 mr-2" />
              {createButtonText}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
