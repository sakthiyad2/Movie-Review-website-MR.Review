// ================= PAGE LOAD =================
document.addEventListener("DOMContentLoaded", () => {
  updateUserUI();
  loadTrendingMovies();
  loadHomeReviews();

  if (document.getElementById("reviewList")) {
    displayReviews();
  }
});

// ================= USER DISPLAY =================
function updateUserUI() {
  let currentUser = localStorage.getItem("currentUser");
  let display = document.getElementById("userDisplay");
  let logoutBtn = document.getElementById("logoutBtn");

  if (display) {
    if (currentUser) {
      display.textContent = "👤 " + currentUser;
      if (logoutBtn) logoutBtn.style.display = "inline-block";
    } else {
      display.textContent = "";
      if (logoutBtn) logoutBtn.style.display = "none";
    }
  }
}

// ================= ADD REVIEW =================
function addReview() {
  let name = document.getElementById("movieName").value;
  let rating = document.getElementById("rating").value;
  let review = document.getElementById("review").value;
  let error = document.getElementById("error");

  let user = localStorage.getItem("currentUser");

  if (!user) {
    alert("Please login first!");
    window.location.href = "login.html";
    return;
  }

  if (name === "" || rating === "" || review === "") {
    error.textContent = "All fields required!";
    return;
  }

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

  reviews.push({
  name,
  rating,
  review,
  user,
  likes: 0,
  comments: [],
  likedUsers: []
});

  localStorage.setItem("reviews", JSON.stringify(reviews));
  alert("Review Added!");
}

// ================= DISPLAY REVIEWS =================
function displayReviews() {
  let list = document.getElementById("reviewList");
  if (!list) return;

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  list.innerHTML = "";

  reviews.forEach((r, i) => {
    let div = document.createElement("div");
    div.className = "review-card";

    div.innerHTML = `
      <h3>${r.name}</h3>
      <p>${"⭐".repeat(r.rating)}</p>
      <p>${r.review}</p>
      <small>👤 ${r.user}</small>

      <br>

      <button onclick="likeReview(${i})">❤️ ${r.likes || 0}</button>

      <br><br>

      <input id="commentInput${i}" placeholder="Write comment...">
      <button onclick="addComment(${i})">Post</button>

      <div class="comments">
        ${(r.comments || []).map((c, j) => `
          <div class="comment">
            <strong>${c.user}</strong>: ${c.text}

            <input id="replyInput${i}-${j}" placeholder="Reply...">
            <button onclick="addReply(${i}, ${j})">Reply</button>

            <div class="replies">
              ${(c.replies || []).map(rp => `
                <p>↳ ${rp.user}: ${rp.text}</p>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>

      ${r.user === localStorage.getItem("currentUser") 
        ? `<button onclick="deleteReview(${i})">Delete</button>` 
        : ""}
    `;

    list.appendChild(div);
  });
}

// ================= LIKE =================
function likeReview(index) {
  let user = localStorage.getItem("currentUser");
  if (!user) return alert("Login first");

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

  // ✅ create likedUsers array if not exists
  if (!reviews[index].likedUsers) {
    reviews[index].likedUsers = [];
  }

  // ❌ already liked
  if (reviews[index].likedUsers.includes(user)) {
    alert("You already liked this review");
    return;
  }

  // ✅ add like
  reviews[index].likes++;
  reviews[index].likedUsers.push(user);


  localStorage.setItem("reviews", JSON.stringify(reviews));
  displayReviews();

}

// ================= HOME REVIEWS =================
function loadHomeReviews() {
  let container = document.getElementById("homeReviews");
  if (!container) return;

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  container.innerHTML = "";

  reviews.slice(-4).reverse().forEach(r => {
    let div = document.createElement("div");
    div.className = "movie-card";

    div.innerHTML = `
      <h3>${r.name}</h3>
      <p>${"⭐".repeat(r.rating)}</p>
      <p>${r.review.substring(0, 60)}...</p>
    `;

    container.appendChild(div);
  });
}

// ================= COMMENTS =================
function addComment(index) {
  let input = document.getElementById(`commentInput${index}`);
  let text = input.value.trim();
  let user = localStorage.getItem("currentUser");

  if (!user) return alert("Login first");
  if (!text) return;

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

  // ensure comments array exists
  if (!reviews[index].comments) {
    reviews[index].comments = [];
  }

  reviews[index].comments.push({
    user: user,
    text: text,
    replies: []
  });

  localStorage.setItem("reviews", JSON.stringify(reviews));

  input.value = ""; // clear input
  displayReviews();
}

function addReply(i, j) {
  let input = document.getElementById(`replyInput${i}-${j}`);
  let text = input.value.trim();
  let user = localStorage.getItem("currentUser");

  if (!user || !text) return;

  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];

  // ✅ FIX safety
  if (!reviews[i].comments[j].replies) {
    reviews[i].comments[j].replies = [];
  }

  reviews[i].comments[j].replies.push({
    user: user,
    text: text
  });

  localStorage.setItem("reviews", JSON.stringify(reviews));

  input.value = "";
  displayReviews();
}


// ================= DELETE =================
function deleteReview(i) {
  let reviews = JSON.parse(localStorage.getItem("reviews")) || [];
  reviews.splice(i, 1);
  localStorage.setItem("reviews", JSON.stringify(reviews));
  displayReviews();
}

// ================= LOGIN =================
function login() {
  let u = document.getElementById("username").value;
  let p = document.getElementById("password").value;
  let msg = document.getElementById("loginMsg");

  let users = JSON.parse(localStorage.getItem("users")) || [];

  let valid = users.find(x => x.username === u && x.password === p);

  if (valid) {
    localStorage.setItem("currentUser", u);
    msg.textContent = "Login success!";
    setTimeout(() => window.location.href = "index.html", 1000);
  } else {
    msg.textContent = "Invalid!";
  }
}

// ================= SIGNUP =================
function signup() {
  let u = document.getElementById("newUser").value;
  let p = document.getElementById("newPass").value;

  let users = JSON.parse(localStorage.getItem("users")) || [];
  users.push({ username: u, password: p });

  localStorage.setItem("users", JSON.stringify(users));
  alert("Account created!");
}

// ================= LOGOUT =================
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

// ================= TRENDING =================
const TMDB_KEY = "TMDB_KEY";
const OMDB_KEY = "OMDB_KEY";

function loadTrendingMovies() {
  let slider = document.querySelector(".slider");
  if (!slider) return;

  fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_KEY}`)
    .then(res => res.json())
    .then(data => {
      slider.innerHTML = "";

      data.results.slice(0, 5).forEach((m, i) => {
        let div = document.createElement("div");
        div.className = "slide " + (i === 0 ? "active" : "");

        div.innerHTML = `
          <img src="https://image.tmdb.org/t/p/original${m.backdrop_path}">
          <div class="overlay">
            <h1>${m.title}</h1>
            <p>${m.overview.substring(0, 120)}...</p>
          </div>
        `;

        slider.appendChild(div);
      });

      // ✅ ADD THIS LINE
      startSlider();
    });
}

let sliderInterval;

function startSlider() {
  let slides = document.querySelectorAll(".slide");
  let index = 0;

  if (slides.length === 0) return;

  if (sliderInterval) clearInterval(sliderInterval);

  sliderInterval = setInterval(() => {
    slides.forEach(s => s.classList.remove("active"));

    index = (index + 1) % slides.length;

    slides[index].classList.add("active");
  }, 4000); // change slide every 4 sec
}


// ================= SEARCH (STORY MODE) =================
function searchMovie() {
  let q = document.getElementById("searchMovie").value.trim().toLowerCase();
  let container = document.getElementById("apiResult");

  document.getElementById("suggestions").innerHTML = "";

  if (!q) return;

  container.innerHTML = "<p>Loading...</p>";

  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${q}`)
    .then(res => res.json())
    .then(data => {

      if (!data.results || data.results.length === 0) {
        container.innerHTML = "<p>❌ No movies found</p>";
        return;
      }

      // ✅ SMART SORT (important)
      let movies = data.results.sort((a, b) => {
        let aMatch = a.title.toLowerCase().includes(q) ? 1 : 0;
        let bMatch = b.title.toLowerCase().includes(q) ? 1 : 0;
        return bMatch - aMatch; // exact match first
      });

      container.innerHTML = "";

      movies.slice(0, 8).forEach(m => {

        if (!m.poster_path) return;

        let div = document.createElement("div");
        div.className = "movie-card";

        div.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w300${m.poster_path}">
          <h3>${m.title} (${m.release_date?.split("-")[0] || ""})</h3>
          <p>${m.overview ? m.overview.substring(0,100) + "..." : "No description"}</p>
        `;

        div.onclick = () => openTrailerById(m.id, m.title);
        

        container.appendChild(div);
      });
    });
}
// ================= TRAILER (FIXED) =================
function openTrailerById(movieId, movieTitle = "") {
  let modal = document.getElementById("trailerModal");
  let frame = document.getElementById("trailerFrame");
  let btn = document.getElementById("ytBtn");

  let title = movieTitle && movieTitle.trim() !== "" ? movieTitle : "movie";

  let queryText = title + " official trailer";
  let query = encodeURIComponent(queryText);

  fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${TMDB_KEY}`)
    .then(res => res.json())
    .then(data => {

      let video = data.results.find(v =>
        v.type === "Trailer" && v.site === "YouTube"
      ) || data.results.find(v => v.site === "YouTube");

      if (video) {
        frame.src = `https://www.youtube.com/embed/${video.key}`;
      } else {
        frame.src = `https://www.youtube.com/embed?listType=search&list=${query}`;
      }

      // ✅ BUTTON FIXED
      btn.href = `https://www.youtube.com/results?search_query=${query}`;

      modal.style.display = "flex";
    })
    .catch(() => {
      frame.src = `https://www.youtube.com/embed?listType=search&list=${query}`;
      btn.href = `https://www.youtube.com/results?search_query=${query}`;
      modal.style.display = "flex";
    });
}

function closeTrailer() {
  let modal = document.getElementById("trailerModal");
  let frame = document.getElementById("trailerFrame");

  modal.style.display = "none";
  frame.src = "";
}

window.onclick = function(e) {
  let modal = document.getElementById("trailerModal");
  if (e.target === modal) closeTrailer();
};

// ================= SUGGESTIONS =================
function showSuggestions() {
  let q = document.getElementById("searchMovie").value.trim();
  let box = document.getElementById("suggestions");

  if (!q) {
    box.innerHTML = "";
    return;
  }

  fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${q}`)
    .then(res => res.json())
    .then(data => {

      if (!data.results || data.results.length === 0) {
        box.innerHTML = "";
        return;
      }

      box.innerHTML = "";

      data.results.slice(0, 5).forEach(m => {

        if (!m.poster_path) return;

        let div = document.createElement("div");
        div.className = "suggestion-item";

        div.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w92${m.poster_path}">
          <span>${m.title} (${m.release_date?.split("-")[0] || ""})</span>
        `;

        div.onclick = () => {
          document.getElementById("searchMovie").value = m.title;
          box.innerHTML = ""; // ✅ hide suggestions
          showSelectedMovie(m);
        };

        box.appendChild(div);
      });
    })
    .catch(() => {
      box.innerHTML = "";
    });
}

// ================= CONTACT =================
function sendMessage() {
  let name = document.getElementById("name").value.trim();
  let email = document.getElementById("email").value.trim();
  let message = document.getElementById("message").value.trim();
  let msg = document.getElementById("msg");

  // ❌ EMPTY CHECK (STRONG)
  if (name === "" || email === "" || message === "") {
    msg.textContent = "⚠️ Please fill all fields";
    msg.style.color = "orange";
    return;
  }

  // ❌ EMAIL VALIDATION
  let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    msg.textContent = "⚠️ Enter valid email";
    msg.style.color = "orange";
    return;
  }

  // ✅ SUCCESS
  msg.textContent = "✅ Message sent successfully!";
  msg.style.color = "lightgreen";

  // clear fields
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("message").value = "";
}


function showMovies(actorKey) {

  const actorNames = {
    ajith: "Ajith Kumar",
    vijay: "Thalapathy Vijay",
    suriya: "Suriya",
    tom: "Tom Cruise",
    rajini: "Rajinikanth",
    dhanush: "Dhanush",
    nayanthara: "Nayanthara",
    trisha: "Trisha Krishnan",
    deepika: "Deepika Padukone",
    alia: "Alia Bhatt"
  };

  const actor = actorNames[actorKey];

  let modal = document.getElementById("movieModal");
  let title = document.getElementById("actorTitle");
  let list = document.getElementById("movieList");

  modal.style.display = "flex";
  title.textContent = actor + " Top Movies";
  list.innerHTML = "<p>Loading...</p>";

  // 🔍 Step 1: Get person ID
  fetch(`https://api.themoviedb.org/3/search/person?api_key=${TMDB_KEY}&query=${actor}`)
    .then(res => res.json())
    .then(data => {

      if (!data.results || data.results.length === 0) {
        list.innerHTML = "<p>No data found</p>";
        return;
      }

      let personId = data.results[0].id;

      // 🎬 Step 2: Get movies
      return fetch(`https://api.themoviedb.org/3/person/${personId}/movie_credits?api_key=${TMDB_KEY}`);
    })
    .then(res => res.json())
    .then(data => {

      if (!data || !data.cast) {
        list.innerHTML = "<p>No movies found</p>";
        return;
      }

      list.innerHTML = "";

      // ⭐ Sort by rating
      let movies = data.cast
        .filter(m => m.vote_average > 0)
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 8);

      movies.forEach(m => {
        let div = document.createElement("div");
        div.className = "movie-item";

        div.innerHTML = `
          <img src="https://image.tmdb.org/t/p/w200${m.poster_path}">
          <p>${m.title}</p>
          <small>⭐ ${m.vote_average}</small>
        `;

        // 🎬 click = trailer
        

        list.appendChild(div);
      });

    })
    .catch(() => {
      list.innerHTML = "<p>Error loading data</p>";
    });
}


function closeModal() {
  document.getElementById("movieModal").style.display = "none";
}

document.addEventListener("click", function(e) {
  let box = document.getElementById("suggestions");
  let input = document.getElementById("searchMovie");

  if (!input.contains(e.target)) {
    box.innerHTML = "";
  }
});


function showSelectedMovie(movie) {
  let container = document.getElementById("apiResult");

  container.innerHTML = "";

  let div = document.createElement("div");
  div.className = "movie-card";

  div.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w300${movie.poster_path}">
    <h3>${movie.title} (${movie.release_date?.split("-")[0] || ""})</h3>
    <p>${movie.overview ? movie.overview.substring(0,100) + "..." : "No description"}</p>
  `;

  div.onclick = () => openTrailerById(movie.id);

  container.appendChild(div);
}
