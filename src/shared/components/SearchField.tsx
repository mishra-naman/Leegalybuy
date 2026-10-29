import { useContext } from 'react';
import { SearchContext } from './searchContext';
import { Search } from 'lucide-react';

export default function SearchField() {
  const { term, change, submit } = useContext(SearchContext);
  return (
    <form
      className="flex h-[41px] min-w-0 items-center gap-[9px] rounded-[7px] border border-[#cdd1d7] bg-[#f8f8fa] px-[13px] text-[#7e8796] dark:border-line dark:bg-field max-md:h-[38px] max-md:gap-[7px] max-md:px-[9px] max-md:[&_svg]:w-[18px]"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Search size={21} aria-hidden="true" />
      <input
        className="h-full min-w-0 w-full border-0 bg-transparent p-0 text-[16px] text-ink placeholder:text-[#7e8796] placeholder:opacity-100 focus:outline-none max-md:text-sm"
        aria-label="Search products"
        placeholder="Search products..."
        value={term}
        onChange={(event) => change(event.target.value)}
        type="search"
        maxLength={200}
      />
    </form>
  );
}
