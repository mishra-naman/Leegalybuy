import { Link } from 'react-router-dom';
import styles from '../../app/App.module.css';

export default function NotFound() {
  return (
    <main id="main-content" className={styles.notFound}>
      <h1>Page not found</h1>
      <Link to="/">Browse products</Link>
    </main>
  );
}
