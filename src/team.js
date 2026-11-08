import "./nav.js";

var API_USERS = "https://jsonplaceholder.typicode.com/users";
var API_POSTS = "https://jsonplaceholder.typicode.com/posts";

var listEl = document.getElementById("team-list");
var statusEl = document.getElementById("team-status");
var searchEl = document.getElementById("team-search");
var countEl = document.getElementById("team-count");
var postsPanel = document.getElementById("posts-panel");
var postsTitle = document.getElementById("posts-title");
var postsList = document.getElementById("posts-list");
var postsClose = document.getElementById("posts-close");
var postForm = document.getElementById("post-form");
var postTitleInput = document.getElementById("post-title");
var postBodyInput = document.getElementById("post-body");
var postFormStatus = document.getElementById("post-form-status");

var users = [];
var activeUserId = null;

function setStatus(text, isError) {
  if (!statusEl) return;
  statusEl.textContent = text || "";
  statusEl.classList.toggle("text-error", !!isError);
  statusEl.classList.toggle("text-on-surface-variant", !isError);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function userInitials(name) {
  return name
    .split(" ")
    .map(function (p) {
      return p.charAt(0);
    })
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function renderUsers(items) {
  if (!listEl) return;
  if (!items.length) {
    listEl.innerHTML =
      '<p class="col-span-full rounded-xl bg-surface-container-low p-space-lg text-center text-on-surface-variant">თანამშრომელი ვერ მოიძებნა.</p>';
    if (countEl) countEl.textContent = "0";
    return;
  }

  if (countEl) countEl.textContent = String(items.length);

  listEl.innerHTML = items
    .map(function (u) {
      var company = (u.company && u.company.name) || "—";
      var city = (u.address && u.address.city) || "—";
      return (
        '<article class="flex flex-col rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-space-lg shadow-sm transition hover:shadow-md">' +
        '<div class="mb-space-md flex items-start gap-3">' +
        '<div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-fixed font-label-md text-label-md font-semibold text-on-primary-fixed">' +
        escapeHtml(userInitials(u.name)) +
        "</div>" +
        '<div class="min-w-0 flex-1">' +
        '<h3 class="truncate font-headline-sm text-headline-sm font-semibold text-on-surface">' +
        escapeHtml(u.name) +
        "</h3>" +
        '<p class="truncate font-label-sm text-label-sm text-on-surface-variant">@' +
        escapeHtml(u.username) +
        "</p>" +
        "</div>" +
        "</div>" +
        '<ul class="mb-space-md space-y-1.5 font-body-sm text-body-sm text-on-surface-variant">' +
        '<li class="flex items-center gap-2 min-w-0"><span class="material-symbols-outlined shrink-0 text-[16px] text-primary">mail</span><span class="truncate">' +
        escapeHtml(u.email) +
        "</span></li>" +
        '<li class="flex items-center gap-2 min-w-0"><span class="material-symbols-outlined shrink-0 text-[16px] text-primary">apartment</span><span class="truncate">' +
        escapeHtml(company) +
        "</span></li>" +
        '<li class="flex items-center gap-2 min-w-0"><span class="material-symbols-outlined shrink-0 text-[16px] text-primary">location_on</span><span class="truncate">' +
        escapeHtml(city) +
        "</span></li>" +
        '<li class="flex items-center gap-2 min-w-0"><span class="material-symbols-outlined shrink-0 text-[16px] text-primary">call</span><span class="truncate">' +
        escapeHtml(u.phone) +
        "</span></li>" +
        "</ul>" +
        '<button type="button" data-user-id="' +
        u.id +
        '" data-user-name="' +
        escapeHtml(u.name) +
        '" class="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 font-body-sm text-body-sm font-medium text-on-primary transition hover:bg-primary">' +
        '<span class="material-symbols-outlined text-[18px]">article</span>' +
        "პოსტების ნახვა" +
        "</button>" +
        "</article>"
      );
    })
    .join("");

  listEl.querySelectorAll("[data-user-id]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = Number(btn.getAttribute("data-user-id"));
      var name = btn.getAttribute("data-user-name") || "";
      loadPosts(id, name);
    });
  });
}

function filterUsers() {
  var q = (searchEl && searchEl.value ? searchEl.value : "")
    .trim()
    .toLowerCase();
  if (!q) {
    renderUsers(users);
    return;
  }
  var filtered = users.filter(function (u) {
    var hay =
      (u.name || "") +
      " " +
      (u.email || "") +
      " " +
      (u.username || "") +
      " " +
      ((u.company && u.company.name) || "") +
      " " +
      ((u.address && u.address.city) || "");
    return hay.toLowerCase().indexOf(q) !== -1;
  });
  renderUsers(filtered);
}

async function loadUsers() {
  setStatus("იტვირთება თანამშრომლები…");
  if (listEl) {
    listEl.innerHTML =
      '<p class="col-span-full animate-pulse rounded-xl bg-surface-container-low p-space-xl text-center text-on-surface-variant">მონაცემები იტვირთება JSONPlaceholder-დან…</p>';
  }
  try {
    var res = await fetch(API_USERS);
    if (!res.ok) throw new Error("HTTP " + res.status);
    users = await res.json();
    setStatus("წყარო: GET /users — jsonplaceholder.typicode.com");
    filterUsers();
  } catch (err) {
    setStatus("შეცდომა: თანამშრომლების ჩატვირთვა ვერ მოხერხდა.", true);
    if (listEl) {
      listEl.innerHTML =
        '<p class="col-span-full rounded-xl border border-error/30 bg-error-container p-space-lg text-center text-on-error-container">API მოთხოვნა ვერ შესრულდა. შეამოწმეთ ინტერნეტი და სცადეთ თავიდან.</p>';
    }
  }
}

async function loadPosts(userId, userName) {
  activeUserId = userId;
  if (postsPanel) postsPanel.classList.remove("hidden");
  if (postsTitle) {
    postsTitle.textContent = "პოსტები — " + userName;
  }
  if (postsList) {
    postsList.innerHTML =
      '<p class="font-body-sm text-body-sm text-on-surface-variant">იტვირთება…</p>';
  }
  if (postFormStatus) postFormStatus.textContent = "";
  try {
    var res = await fetch(API_POSTS + "?userId=" + encodeURIComponent(userId));
    if (!res.ok) throw new Error("HTTP " + res.status);
    var posts = await res.json();
    if (!posts.length) {
      postsList.innerHTML =
        '<p class="font-body-sm text-body-sm text-on-surface-variant">პოსტები არ მოიძებნა.</p>';
      return;
    }
    postsList.innerHTML = posts
      .slice(0, 8)
      .map(function (p) {
        return (
          '<article class="rounded-lg border border-outline-variant/30 bg-surface-container-low p-space-md">' +
          '<h4 class="mb-1 font-headline-sm text-headline-sm font-semibold text-on-surface">' +
          escapeHtml(p.title) +
          "</h4>" +
          '<p class="font-body-sm text-body-sm text-on-surface-variant">' +
          escapeHtml(p.body) +
          "</p>" +
          "</article>"
        );
      })
      .join("");
  } catch (err) {
    postsList.innerHTML =
      '<p class="font-body-sm text-body-sm text-error">პოსტების ჩატვირთვა ვერ მოხერხდა.</p>';
  }
}

if (searchEl) {
  searchEl.addEventListener("input", filterUsers);
}

if (postsClose) {
  postsClose.addEventListener("click", function () {
    if (postsPanel) postsPanel.classList.add("hidden");
    activeUserId = null;
  });
}

if (postForm) {
  postForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    if (!activeUserId) {
      if (postFormStatus) {
        postFormStatus.textContent = "ჯერ აირჩიეთ თანამშრომელი.";
        postFormStatus.className =
          "font-label-sm text-label-sm text-error mt-2";
      }
      return;
    }
    var title = postTitleInput.value.trim();
    var body = postBodyInput.value.trim();
    if (!title || !body) return;

    if (postFormStatus) {
      postFormStatus.textContent = "იგზავნება POST /posts …";
      postFormStatus.className =
        "font-label-sm text-label-sm text-on-surface-variant mt-2";
    }

    try {
      var res = await fetch(API_POSTS, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({
          title: title,
          body: body,
          userId: activeUserId,
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var created = await res.json();

      if (postsList) {
        var card =
          '<article class="rounded-lg border border-primary/30 bg-primary-fixed/40 p-space-md">' +
          '<span class="mb-1 inline-block rounded bg-primary-container px-2 py-0.5 font-label-sm text-label-sm text-on-primary">ახალი (POST)</span>' +
          '<h4 class="mb-1 font-headline-sm text-headline-sm font-semibold text-on-surface">' +
          escapeHtml(created.title) +
          "</h4>" +
          '<p class="font-body-sm text-body-sm text-on-surface-variant">' +
          escapeHtml(created.body) +
          "</p>" +
          '<p class="mt-2 font-label-sm text-label-sm text-on-surface-variant">id: ' +
          escapeHtml(String(created.id)) +
          "</p>" +
          "</article>";
        postsList.insertAdjacentHTML("afterbegin", card);
      }

      postForm.reset();
      if (postFormStatus) {
        postFormStatus.textContent =
          "წარმატება: პოსტი შეიქმნა (JSONPlaceholder mock POST).";
        postFormStatus.className =
          "font-label-sm text-label-sm text-primary mt-2";
      }
    } catch (err) {
      if (postFormStatus) {
        postFormStatus.textContent = "შეცდომა: POST ვერ შესრულდა.";
        postFormStatus.className =
          "font-label-sm text-label-sm text-error mt-2";
      }
    }
  });
}

loadUsers();
