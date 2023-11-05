import { useState, useEffect, useRef } from "react";
import Rating from "./Rating";
import { useMovies } from "./useMovies";
import { useKey } from "./useKey";
import { useLocalStorageState } from "./useLocalStorageState";

const KEY = "3830a1dd";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App() {
  const [query, setQuery] = useState("");
  const [selectedid, setSelected] = useState(null);
  const [watched, setWatched] = useLocalStorageState([], "watched");
  const { movies, loading, error } = useMovies(query, handleCloseMovie);

  function handleSelectMovie(id) {
    setSelected((selectedid) => (id === selectedid ? null : id));
  }

  function handleCloseMovie() {
    setSelected(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }
  function handleDeleteMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  return (
    <>
      <NavBar>
        <SearchBar query={query} setQuery={setQuery} />
        {movies?.length > 0 && <NumberFoundMovies movies={movies} />}
      </NavBar>
      <Main>
        <MovieBox movies={movies}>
          {error && <ErrorMessage message={error} />}
          {!loading && !error && (
            <ShowFilteredMovie
              movies={movies}
              onhandleSelectMovie={handleSelectMovie}
            />
          )}
          {loading && <Loading />}
        </MovieBox>
        <MovieBox>
          {selectedid ? (
            <MovieDetails
              selectedid={selectedid}
              setSelected={setSelected}
              onHandleAddWatched={handleAddWatched}
              watched={watched}
              onhandleCloseMovie={handleCloseMovie}
            />
          ) : (
            <>
              <MovieWatchedSummary watched={watched} />
              <MovieWatchedList
                watched={watched}
                onhandleDeleteMovie={handleDeleteMovie}
              />
            </>
          )}
        </MovieBox>
      </Main>
    </>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span>🍿</span>
      <h1>UsePopcorn</h1>
    </div>
  );
}

function NavBar({ children }) {
  return (
    <nav className="navbar">
      <Logo />
      {children}
    </nav>
  );
}

function SearchBar({ query, setQuery }) {
  const inputEl = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputEl.current) return;
    inputEl.current.focus();
    setQuery("");
  });

  return (
    <input
      type="text"
      className="input"
      placeholder="Search a movie..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumberFoundMovies({ movies }) {
  return <p className="foundmovie">{movies.length} movies found</p>;
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function MovieBox({ children }) {
  const [loading, isSetLoading] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => isSetLoading((open) => !open)}
      >
        {loading ? "-" : " +"}
      </button>
      {loading && children}
    </div>
  );
}

function ErrorMessage({ message }) {
  return <p className="error">Error!🧨 {message}</p>;
}

function ShowFilteredMovie({ movies, onhandleSelectMovie }) {
  return (
    <ul className="list list-movie">
      {movies?.map((movie) => (
        <MovieItem
          movie={movie}
          key={movie.imdbID}
          onhandleSelectMovie={onhandleSelectMovie}
        />
      ))}
    </ul>
  );
}

function Loading() {
  return <p className="loading">Loading...</p>;
}

function MovieDetails({
  watched,
  selectedid,
  setSelected,
  onHandleAddWatched,
  onhandleCloseMovie,
}) {
  const [movie, setMovie] = useState({});
  const [userRating, setUserRating] = useState("");

  const countRef = useRef(0);

  useEffect(
    function () {
      if (userRating) countRef.current += 1;
    },
    [userRating]
  );

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedid);

  const userRatingWatched = watched.find(
    (movie) => movie.imdbID === selectedid
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAddMovie() {
    const newMoveToAdd = {
      imdbID: selectedid,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countRatingDecisions: countRef.current,
    };

    onHandleAddWatched(newMoveToAdd);
    setSelected(null);
  }

  useKey("Escape", onhandleCloseMovie);

  useEffect(
    function () {
      async function fetcmoviedetails() {
        const response = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedid}`
        );

        const data = await response.json();
        setMovie(data);
      }
      fetcmoviedetails();
    },
    [selectedid]
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      //cleanup function
      return function () {
        document.title = "usePopCorn";
      };
    },
    [title]
  );

  return (
    <div className="moviedetails">
      <header>
        <button className="btn-back" onClick={() => setSelected(null)}>
          &larr;
        </button>
        <img src={poster} alt={`poster of ${movie.title}movie`} />
        <div className="details-overview">
          <h2>{title}</h2>
          <p>
            {released} &bull; {runtime}
          </p>
          <p>{genre}</p>
          <p>
            <span>⭐</span>
            {imdbRating} IMDb rating
          </p>
        </div>
      </header>
      <section>
        <div className="rating">
          {!isWatched ? (
            <>
              <Rating maxRating={10} size={23} onRate={setUserRating} />
              {userRating > 0 && (
                <button className="add-tolist" onClick={handleAddMovie}>
                  Add To List
                </button>
              )}
            </>
          ) : (
            <p>
              You rated {userRatingWatched} <span>⭐</span> for this movie
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function MovieWatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h1>Movies You watched</h1>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} Movies</span>
        </p>
        <p>
          <span>⭐</span>
          <span>{avgImdbRating.toFixed(1)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(1)}</span>
        </p>
        <p>
          <span>⌛</span>
          <span>{avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
}

function MovieWatchedList({ watched, onhandleDeleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedItem movie={movie} onhandleDeleteMovie={onhandleDeleteMovie} />
      ))}
    </ul>
  );
}

function WatchedItem({ movie, onhandleDeleteMovie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⌛</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onhandleDeleteMovie(movie.imdbID)}
        >
          x
        </button>
      </div>
    </li>
  );
}

function MovieItem({ movie, onhandleSelectMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => onhandleSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
