import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="px-[30px] py-20 text-center [&_a]:text-accent [&_h1]:mb-5 [&_h1]:text-[32px] [&_h1]:font-semibold"
    >
      <h1>Page not found</h1>
      <Link to="/">Browse products</Link>
    </main>
  );
}
