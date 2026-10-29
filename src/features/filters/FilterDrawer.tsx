import type { ComponentProps } from 'react';
import Modal from '../../shared/components/Modal';
import FilterSidebar from './FilterSidebar';
import styles from './Filters.module.css';

export default function FilterDrawer({
  onClose,
  ...props
}: ComponentProps<typeof FilterSidebar> & { onClose: () => void }) {
  return (
    <Modal title="Filters" onClose={onClose} drawer>
      <FilterSidebar {...props} />
      <div style={{ padding: '0 20px 20px' }}>
        <button className={styles.apply} onClick={onClose}>
          Show results
        </button>
      </div>
    </Modal>
  );
}
