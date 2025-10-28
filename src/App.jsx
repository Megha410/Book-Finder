import { useState } from "react";

export default function App() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1); // optional pagination
  const [hasMore, setHasMore] = useState(false);

  const fetchBooks = async (q = query, p = 1) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(q)}&page=${p}`
      );
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();
      // Use docs array; combine pages for pagination if needed
      const docs = data.docs || [];
      if (p === 1) setBooks(docs.slice(0, 20));
      else setBooks((prev) => [...prev, ...docs.slice(0, 20)]);
      setHasMore(docs.length > 0);
    } catch (err) {
      setError("Failed to fetch books. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchBooks(query, 1);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchBooks(query, next);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">📚 Book Finder</h1>

        <form onSubmit={handleSearch} className="flex gap-0 mb-6">
          <input
            type="text"
            placeholder="Search for books by title (e.g. harry potter)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 p-3 rounded-l-lg border border-gray-300 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-3 rounded-r-lg hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && books.length === 0 && <p className="text-center text-gray-600">No results yet — try a search.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {books.map((book, idx) => (
            <div key={`${book.key}-${idx}`} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
              {book.cover_i ? (
                <img
                  src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                  alt={book.title}
                  className="rounded mb-3 w-full h-60 object-cover"
                />
              ) : (
                <div className="bg-gray-200 h-60 flex items-center justify-center rounded mb-3">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}

              <h2 className="font-semibold text-lg">{book.title}</h2>
              <p className="text-sm text-gray-700">{book.author_name?.join(", ") || "Unknown Author"}</p>
              <p className="text-sm text-gray-500">First Published: {book.first_publish_year || "N/A"}</p>

              <div className="mt-3 text-sm text-gray-600">
                <div>Publisher: {book.publisher?.[0] || "N/A"}</div>
                <div>ISBN: {book.isbn?.[0] || "N/A"}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-6">
          {hasMore && !loading && (
            <button onClick={loadMore} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Load more
            </button>
          )}
        </div>

        <footer className="mt-8 text-center text-xs text-gray-500">
          Powered by Open Library API
        </footer>
      </div>
    </div>
  );
}
