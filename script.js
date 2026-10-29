
const $ = (selector) => document.querySelector(selector);

const starterPosts = [
  {
    id: 1, title: "The Art of Slow Living",
    category: "Lifestyle", author: "Mia Rose",
    date: "Oct 20, 2026", likes: 12, likedBy: [],
    image: "https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=900&q=80",
    content: "Sometimes, the most beautiful thing you can do is slow down. Make your favorite tea, open a book, watch the sunlight fall across your room, and give yourself permission to simply be.\n\nLife isn't a race. The little moments we often overlook are the ones that make our lives meaningful.",
    comments: []
  },
  {
    id: 2, title: "Small Steps, Big Dreams",
    category: "Personal", author: "Emma Claire",
    date: "Oct 18, 2026", likes: 24, likedBy: [],
    image: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=900&q=80",
    content: "You don't have to have everything figured out today. Every expert was once a beginner, and every beautiful journey started with one small step.\n\nCelebrate your progress, trust your pace, and keep showing up for the dreams that matter to you.",
    comments: []
  },
  {
    id: 3, title: "Technology Meets Creativity",
    category: "Technology", author: "Alex Morgan",
    date: "Oct 16, 2026", likes: 18, likedBy: [],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80",
    content: "Technology gives us new ways to turn our imagination into reality. From building websites to creating digital art, the possibilities are constantly growing.\n\nThe real magic happens when technical skills meet curiosity and creativity.",
    comments: []
  },
  {
    id: 4, title: "Postcards from Somewhere Beautiful",
    category: "Travel", author: "Sophie Lane",
    date: "Oct 14, 2026", likes: 31, likedBy: [],
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80",
    content: "Travel is about more than reaching a destination. It is about the unexpected conversations, unfamiliar streets, quiet mornings, and memories you carry home.\n\nSometimes getting lost is how you find something wonderful.",
    comments: []
  },
  {
    id: 5, title: "A Little More Kindness",
    category: "Lifestyle", author: "Mia Rose",
    date: "Oct 12, 2026", likes: 16, likedBy: [],
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=900&q=80",
    content: "A thoughtful message, a patient response, or a genuine smile can change someone's day. Kindness doesn't have to be grand to be meaningful.\n\nLet's make room for more understanding, more compassion, and more little acts of goodness.",
    comments: []
  },
  {
    id: 6, title: "Finding Your Own Rhythm",
    category: "Personal", author: "Emma Claire",
    date: "Oct 10, 2026", likes: 20, likedBy: [],
    image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=900&q=80",
    content: "Your path doesn't need to look like anyone else's. Some seasons are for growing, others are for resting, and both are part of the journey.\n\nGive yourself the same patience you would offer a friend.",
    comments: []
  }
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

let posts = readStorage("bloom_posts", starterPosts);
let users = readStorage("bloom_users", []);
let currentUser = readStorage("bloom_current_user", null);
let activeCategory = "All";
let editingId = null;
let readingId = null;
let authMode = "login";
let toastTimer;

function savePosts() {
  localStorage.setItem("bloom_posts", JSON.stringify(posts));
}

function saveUsers() {
  localStorage.setItem("bloom_users", JSON.stringify(users));
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[char]);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function getReadingTime(content) {
  return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200));
}

function renderBlogs() {
  const query = $("#searchInput").value.trim().toLowerCase();

  const filtered = posts.filter(post => {
    const matchesCategory =
      activeCategory === "All" || post.category === activeCategory;

    const searchable =
      `${post.title} ${post.content} ${post.author} ${post.category}`.toLowerCase();

    return matchesCategory && searchable.includes(query);
  });

  $("#postCount").textContent = posts.length;
  $("#emptyState").hidden = filtered.length > 0;

  $("#blogGrid").innerHTML = filtered.map(post => {
    const isLiked = currentUser &&
      (post.likedBy || []).includes(currentUser.email);

    const isBookmarked = currentUser &&
      readStorage("bloom_bookmarks", {})[currentUser.email]?.includes(post.id);

    const isOwner = currentUser && post.authorEmail === currentUser.email;

    const image = post.image
      ? `<img src="${escapeHTML(post.image)}" alt="${escapeHTML(post.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=&quot;card-placeholder&quot;>✿</div>'">`
      : `<div class="card-placeholder">✿</div>`;

    return `
      <article class="blog-card">
        <div class="card-image">${image}</div>
        <div class="card-body">
          <span class="category-tag">${escapeHTML(post.category)}</span>
          <h3>${escapeHTML(post.title)}</h3>
          <p class="card-excerpt">${escapeHTML(post.content.slice(0, 115))}${post.content.length > 115 ? "..." : ""}</p>
          <div class="card-meta">
            <span>♡ ${escapeHTML(post.author)}</span>
            <span>${getReadingTime(post.content)} min read</span>
          </div>
          <div class="card-actions">
            <button class="small-btn" data-action="read" data-id="${post.id}">Read story ↗</button>
            <button class="small-btn ${isLiked ? "liked" : ""}" data-action="like" data-id="${post.id}">♡ ${post.likes || 0}</button>
            <button class="small-btn" data-action="bookmark" data-id="${post.id}">${isBookmarked ? "🔖 Saved" : "♧ Save"}</button>
            ${isOwner ? `<button class="small-btn" data-action="edit" data-id="${post.id}">Edit</button><button class="small-btn" data-action="delete" data-id="${post.id}">Delete</button>` : ""}
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function updateAuthUI() {
  $("#loginBtn").textContent = currentUser
    ? `Hi, ${currentUser.name.split(" ")[0]} · Log out`
    : "Log in";

  $("#writeBtn").textContent = currentUser ? "＋ Write a blog" : "＋ Join to write";
}

function requireLogin() {
  if (currentUser) return true;
  openAuth("login");
  showToast("Please log in to continue ♡");
  return false;
}

function openAuth(mode) {
  authMode = mode;
  $("#authTitle").textContent =
    mode === "register" ? "Join our community ♡" : "Welcome back ♡";

  $("#authSubmit").textContent =
    mode === "register" ? "Create account" : "Log in";

  $("#nameLabel").hidden = mode !== "register";
  $("#authName").required = mode === "register";

  $("#switchAuth").innerHTML = mode === "register"
    ? `Already have an account? <button type="button" id="switchMode">Log in</button>`
    : `New here? <button type="button" id="switchMode">Create an account</button>`;

  $("#authForm").reset();
  $("#authModal").showModal();
}

$("#switchAuth").addEventListener("click", event => {
  if (event.target.id === "switchMode") {
    openAuth(authMode === "login" ? "register" : "login");
  }
});

$("#authForm").addEventListener("submit", event => {
  event.preventDefault();

  const email = $("#authEmail").value.trim().toLowerCase();
  const password = $("#authPassword").value;
  const name = $("#authName").value.trim();

  if (authMode === "register") {
    if (!name) return showToast("Please enter your name.");
    if (users.some(user => user.email === email)) {
      return showToast("This email is already registered.");
    }

    users.push({ name, email, password });
    saveUsers();
    currentUser = { name, email };
  } else {
    const user = users.find(
      item => item.email === email && item.password === password
    );

    if (!user) return showToast("Incorrect email or password.");
    currentUser = { name: user.name, email: user.email };
  }

  localStorage.setItem("bloom_current_user", JSON.stringify(currentUser));
  $("#authModal").close();
  updateAuthUI();
  renderBlogs();
  showToast(`Welcome${currentUser.name ? ", " + currentUser.name : ""}! 🌷`);
});

$("#loginBtn").addEventListener("click", () => {
  if (currentUser) {
    currentUser = null;
    localStorage.removeItem("bloom_current_user");
    updateAuthUI();
    renderBlogs();
    showToast("You have logged out.");
  } else {
    openAuth("login");
  }
});

function openPostEditor(post = null) {
  if (!requireLogin()) return;

  editingId = post ? post.id : null;
  $("#postForm").reset();

  $("#postTitle").value = post?.title || "";
  $("#postCategory").value = post?.category || "Lifestyle";
  $("#postImage").value = post?.image || "";
  $("#postContent").value = post?.content || "";

  $("#postModal").querySelector("h2").textContent =
    post ? "Edit your story ✿" : "Write your story ✿";

  $("#postModal").querySelector('[type="submit"]').textContent =
    post ? "Save changes" : "Publish story ✨";

  $("#postModal").showModal();
}

$("#writeBtn").addEventListener("click", () => openPostEditor());
$("#heroWriteBtn").addEventListener("click", () => openPostEditor());
$("#bannerWriteBtn").addEventListener("click", () => openPostEditor());

$("#postForm").addEventListener("submit", event => {
  event.preventDefault();
  if (!requireLogin()) return;

  const title = $("#postTitle").value.trim();
  const content = $("#postContent").value.trim();
  const image = $("#postImage").value.trim();

  if (!title || !content) return showToast("Please complete your story.");

  if (image) {
    try {
      const url = new URL(image);
      if (!["https:", "http:"].includes(url.protocol)) throw new Error();
    } catch {
      return showToast("Please enter a valid image URL.");
    }
  }

  if (editingId !== null) {
    const post = posts.find(item => item.id === editingId);
    if (!post || post.authorEmail !== currentUser.email) {
      return showToast("You cannot edit this post.");
    }

    Object.assign(post, {
      title, content, image,
      category: $("#postCategory").value
    });

    showToast("Your story has been updated! ✨");
  } else {
    posts.unshift({
      id: Date.now(),
      title, content, image,
      category: $("#postCategory").value,
      author: currentUser.name,
      authorEmail: currentUser.email,
      date: new Date().toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      }),
      likes: 0,
      likedBy: [],
      comments: []
    });

    showToast("Your story is published! 🌸");
  }

  savePosts();
  renderBlogs();
  $("#postModal").close();
});

function openReader(id) {
  const post = posts.find(item => item.id === id);
  if (!post) return;

  readingId = id;

  const comments = post.comments || [];
  const image = post.image
    ? `<img class="read-cover" src="${escapeHTML(post.image)}" alt="${escapeHTML(post.title)}">`
    : "";

  $("#readContent").innerHTML = `
    ${image}
    <p><span class="category-tag">${escapeHTML(post.category)}</span></p>
    <h2>${escapeHTML(post.title)}</h2>
    <p class="card-meta">By ${escapeHTML(post.author)} · ${escapeHTML(post.date || "")} · ${getReadingTime(post.content)} min read</p>
    <div class="read-text">${escapeHTML(post.content)}</div>
    <hr style="border:0;border-top:1px solid var(--border);margin:25px 0">
    <h3>Comments (${comments.length})</h3>
    <div id="commentList">
      ${comments.map((comment, index) => `
        <div class="comment">
          <strong>${escapeHTML(comment.author)}</strong>
          <small> · ${escapeHTML(comment.date || "")}</small>
          <p>${escapeHTML(comment.text)}</p>
          ${currentUser && (comment.authorEmail === currentUser.email || currentUser.email === post.authorEmail)
            ? `<button class="small-btn" data-comment-delete="${index}">Delete</button>` : ""}
        </div>
      `).join("")}
    </div>
    <form id="commentForm">
      <label>Leave a comment
        <textarea id="commentText" rows="3" maxlength="1000" placeholder="Share your thoughts..." required></textarea>
      </label>
      <button class="btn btn-primary" type="submit">Post comment ♡</button>
    </form>
  `;

  $("#readModal").showModal();
}

$("#readContent").addEventListener("submit", event => {
  if (event.target.id !== "commentForm") return;
  event.preventDefault();

  if (!requireLogin()) return;

  const post = posts.find(item => item.id === readingId);
  const text = $("#commentText").value.trim();

  if (!post || !text) return;

  post.comments = post.comments || [];
  post.comments.push({
    author: currentUser.name,
    authorEmail: currentUser.email,
    text,
    date: new Date().toLocaleDateString()
  });

  savePosts();
  openReader(readingId);
  renderBlogs();
  showToast("Comment added! 💜");
});

$("#readContent").addEventListener("click", event => {
  const index = event.target.dataset.commentDelete;
  if (index === undefined) return;

  const post = posts.find(item => item.id === readingId);
  const comment = post?.comments?.[Number(index)];

  if (!comment || !currentUser) return;

  if (comment.authorEmail !== currentUser.email &&
      post.authorEmail !== currentUser.email) return;

  post.comments.splice(Number(index), 1);
  savePosts();
  openReader(readingId);
  renderBlogs();
  showToast("Comment deleted.");
});

$("#blogGrid").addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const post = posts.find(item => item.id === id);
  if (!post) return;

  switch (button.dataset.action) {
    case "read":
      openReader(id);
      break;

    case "like": {
      if (!requireLogin()) return;

      post.likedBy = post.likedBy || [];
      const index = post.likedBy.indexOf(currentUser.email);

      if (index >= 0) {
        post.likedBy.splice(index, 1);
        post.likes = Math.max(0, (post.likes || 0) - 1);
      } else {
        post.likedBy.push(currentUser.email);
        post.likes = (post.likes || 0) + 1;
      }

      savePosts();
      renderBlogs();
      break;
    }

    case "bookmark": {
      if (!requireLogin()) return;

      const bookmarks = readStorage("bloom_bookmarks", {});
      bookmarks[currentUser.email] = bookmarks[currentUser.email] || [];
      const saved = bookmarks[currentUser.email];
      const position = saved.indexOf(id);

      if (position >= 0) {
        saved.splice(position, 1);
        showToast("Removed from your reading list.");
      } else {
        saved.push(id);
        showToast("Story bookmarked! 🔖");
      }

      localStorage.setItem("bloom_bookmarks", JSON.stringify(bookmarks));
      renderBlogs();
      break;
    }

    case "edit":
      if (post.authorEmail !== currentUser?.email) return;
      openPostEditor(post);
      break;

    case "delete":
      if (post.authorEmail !== currentUser?.email) return;

      if (confirm("Are you sure you want to delete this story?")) {
        posts = posts.filter(item => item.id !== id);
        savePosts();
        renderBlogs();
        showToast("Story deleted.");
      }
      break;
  }
});

$("#filters").addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;

  document.querySelectorAll(".filter").forEach(filter => {
    filter.classList.toggle("active", filter === button);
  });

  renderBlogs();
});

$("#searchInput").addEventListener("input", renderBlogs);

$("#themeBtn").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "bloom_theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", () => {
    const dialog = document.getElementById(button.dataset.close);
    if (dialog) dialog.close();
  });
});

document.querySelectorAll("dialog").forEach(dialog => {
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
});

if (localStorage.getItem("bloom_theme") === "dark") {
  document.body.classList.add("dark");
}

updateAuthUI();
renderBlogs();
