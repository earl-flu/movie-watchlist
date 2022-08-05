const APIKEY = "a54a0817";
const URL = `http://www.omdbapi.com/?apikey=${APIKEY}&type=movie`;
const form = document.querySelector(".search-form");
const searchInput = document.querySelector(".search__input");
const moviesContainer = document.querySelector(".movies");
const loadingText = document.querySelector("#loading");
const key = "a54a0817";
let watchList = JSON.parse(localStorage.getItem("watchList")) || [];

function displayLoading(isLoading) {
  if (isLoading) {
    return (moviesContainer.innerHTML = "<p>Loading...</p>");
  }
}
//created an array of promises and use Promise.all to get result
function fetchMovies(movieIds) {
  const moviesPromises = movieIds.map((id) => fetch(`${URL}&i=${id}`));

  return Promise.all(moviesPromises).then((responses) => {
    const resPromises = responses.map((res) => res.json());
    return Promise.all(resPromises);
  });
}

function renderMovies(moviesData) {
  displayLoading(false);
  watchList = JSON.parse(localStorage.getItem("watchList")) || [];
  
  const movieElement = moviesData
    .map((movie) => {
      const { Title, Plot, Poster, Runtime, Genre, imdbRating, imdbID } = movie;
      const btnClass = watchList.find((id) => id === imdbID)
        ? "remove-btn"
        : "add-btn";

      const poster = Poster === "N/A" ? "./images/default_img.jpg" : Poster;
      return `<div class="movie">
          <div class="movie__img-div">
            <a target="_blank" href="https://www.imdb.com/title/${imdbID}/">
              <img src=${poster} alt=${Title} />
            </a>
          </div>
          <div class="movie__data-container">
            <div class="movie__title-div">
              <h2 class="movie__title"><a target="_blank" href="https://www.imdb.com/title/${imdbID}/">${Title}</a></h2>
              <div class="movie__star"><i class="fa-solid fa-star"></i></div>
              <p class="movie__rating">${imdbRating}</p>
            </div>
            <div class="movie__detail-div">
              <p class="movie__duration">${Runtime}</p>
              <p class="movie__category">${Genre}</p>
              <button class="movie__btn ${btnClass}" data-movieid=${imdbID}>
              <i class="fa-solid fa-circle-plus add-icon"></i>
              <i class="fa-solid fa-circle-minus remove-icon"></i>
                <div class="movie__watchlist-text add-text">Watchlist</div>
                <div class="movie__watchlist-text remove-text">Remove</div>
              </button>
            </div>
            <p class="movie__description">
              ${Plot}
            </p>
          </div>
        </div>`;
    })
    .join("");
  moviesContainer.innerHTML = movieElement;

  return moviesData;
}

function handleSubmit(e) {
  e.preventDefault();
  const title = searchInput.value;

  fetch(`${URL}&s=${title}`)
    .then((res) => {
      displayLoading(true);
      return res.json();
    })
    .then((data) => data.Search.map((movie) => movie.imdbID))
    .then(fetchMovies)
    .then(renderMovies)
    .catch((err) => {
      displayLoading(false);
      console.log(err);
      moviesContainer.innerHTML = `<p class="not-found-movie">
        Unable to find what you’re looking for. Please try another search.
      </p>`;
    });
}

//will show add button or remove button in movie
function toggleButton(btn) {
  //if in watchlist-page
  if (document.querySelector(".watchlist-page")) {
    console.log("rerender watchlist");
    displayWatchList();
  }

  if (btn.classList.contains("add-btn")) {
    btn.classList.remove("add-btn");
    btn.classList.add("remove-btn");
    return;
  }
  btn.classList.remove("remove-btn");
  btn.classList.add("add-btn");
}

moviesContainer.addEventListener("click", (e) => {
  //Reminder: I set pointer-events:none to the children of .movie__btn to unable click event on it
  if (!e.target.matches(".movie__btn")) return;

  const movieId = e.target.dataset.movieid;

  //removes a movieId in watchList(arr) IF already exist
  if (watchList.includes(movieId)) {
    watchList = watchList.filter((item) => item !== movieId);
    localStorage.setItem("watchList", JSON.stringify(watchList));
  } else {
    watchList.unshift(movieId);
    localStorage.setItem("watchList", JSON.stringify(watchList));
  }
  toggleButton(e.target);
});

// will add an event if the form exist
if (form) form.addEventListener("submit", handleSubmit);

function renderNoMoviesEl(dataArr) {
  if (!dataArr.length) {
    moviesContainer.innerHTML = `<div class="watchlist__empty">
  <p>
    Your watchlist is looking a little empty...
  </p>
  <a href="/" class="add-movies">
      <i class="fa-solid fa-circle-plus"></i>
      Let's add some movies!
  </a>
</div>`;
  }
}

function displayWatchList() {
  if (!document.querySelector(".watchlist-page")) return;

  fetchMovies(watchList).then(renderMovies).then(renderNoMoviesEl);
}
displayWatchList();
