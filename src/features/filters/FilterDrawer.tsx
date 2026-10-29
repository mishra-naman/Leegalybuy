import type { ComponentProps } from 'react';
import Modal from '../../shared/components/Modal';
import FilterSidebar from './FilterSidebar';

export default function FilterDrawer({
  onClose,
  ...props
}: ComponentProps<typeof FilterSidebar> & { onClose: () => void }) {
  return (
    <Modal title="Filters" onClose={onClose} drawer>
      <FilterSidebar {...props} />
      <div className="px-5 pb-5">
        <button
          className="mt-[11px] h-[37px] w-full border-primary bg-primary text-white hover:brightness-95"
          onClick={onClose}
        >
          Show results
        </button>
      </div>
    </Modal>
  );
}
