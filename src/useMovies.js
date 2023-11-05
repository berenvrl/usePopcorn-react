import { useState, useEffect } from "react";

const KEY = "3830a1dd";

export function useMovies(query, callback) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    function () {
      callback?.();
      //creating abortconroller obj for cleaning unnecessary fetch requests
      const controller = new AbortController();
      const signal = controller.signal;

      async function filtermovie() {
        try {
          setLoading(true);
          setError("");

          const res = await fetch(
            `https://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal }
          );

          if (!res.ok) throw new Error("Fetching failed");

          const data = await res.json();

          if (data.Response === "False") throw new Error("Movie not found");

          setMovies(data.Search);
          setError("");
        } catch (err) {
          if (err.name !== "AbortError") {
            setError(err.message);
          }
        } finally {
          setLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError("");
        return;
      }

      //handleCloseMovie();
      filtermovie();

      //cleaning fetch requests
      return function () {
        controller.abort();
      };
    },
    [query, callback]
  );
  return { movies, loading, error };
}
