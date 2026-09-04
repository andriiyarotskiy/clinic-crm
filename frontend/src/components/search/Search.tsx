import { useEffect, useState } from "react";
import { Input } from "@/components";
import { Loader } from "../loader/Loader";
import type { User } from "@/types/user";
import type { Patient } from "@/types/patient";
import { useDebounce } from "@/hooks/useDebounce";

type Props<T> = {
  items: T[];
  loading: boolean;
  placeholder?: string;
  searchLabel: string;
  onSearch: (value: string) => void;
  onSelect: (item: T) => void;
  selectedUser: User | null | Patient;
  getKey: (item: T) => React.Key;
  renderItem: (item: T) => React.ReactNode;
  getValue: (item: T) => string;
};

export function Search<T>({
  
  searchLabel,
  items,
  loading,
  placeholder = "Search...",
  onSearch,
  onSelect,
  selectedUser,
  getKey,
  renderItem,
  getValue,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const open = query.trim().length >= 1;
 
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      return;
    }

    onSearch(debouncedQuery);
  }, [debouncedQuery]);
  
  return (
    <div className="relative">
      <Input
        label={searchLabel}
        inputClassName="h-[44px]"
        className=" rounded-[8px] mb-[32px]"
        name="search"
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {open && (
        <div className="absolute left-0 p-[8px]
        right-0 top-full mt-1 max-h-60 overflow-y-auto
        rounded-[8px] border border-[#E5E7EB] bg-[#FFFFFF] z-30">
          {loading && (
            <div className="p-3 text-center " >
              <Loader/>
            </div>
          )}

          {!loading && items.length>0 && open &&
            items.map((item) => (
              <button
                key={getKey(item)}
                type="button"
                className="block w-full rounded-[8px]  p-3 text-left hover:bg-[#F3F4F6]"
                onClick={() => {
                  onSelect(item);
                  setQuery(getValue(item));
               
                }}
              >
                {renderItem(item)}
              </button>
            ))}

          {!loading && items.length === 0 && !selectedUser&& (
            <div className="p-3 text-center text-gray-500">
              Nothing found
            </div>
          )}
        </div>
      )}
    </div>
  );
}