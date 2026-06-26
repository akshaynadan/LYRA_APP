const STORAGE_KEY = "lyra-professional-app-v1";

const seed = {
  user: null,
  activeView: "dashboard",
  activeCommunity: "Photography",
  otp: null,
  communities: [
    { name: "Photography", members: 1840, category: "Visual Arts", summary: "Portraits, product shoots, street stories, and editing critiques." },
    { name: "Design", members: 1320, category: "Creative Tech", summary: "Interface shots, brand systems, motion ideas, and hiring challenges." },
    { name: "Writing", members: 880, category: "Storytelling", summary: "Short essays, campaign scripts, copywriting, and poetry prompts." },
    { name: "Film", members: 970, category: "Production", summary: "Short films, reels, scene breakdowns, and review circles." },
    { name: "Music", members: 740, category: "Audio", summary: "Original tracks, scores, remix contests, and studio feedback." },
    { name: "Code", members: 1180, category: "Engineering", summary: "Apps, experiments, open problems, and product prototypes." }
  ],
  posts: [
    {
      id: "p1",
      community: "Photography",
      author: "Maya R.",
      title: "Morning market light study",
      body: "A low-angle series focused on contrast, movement, and natural color separation.",
      type: "Image",
      likes: 128,
      comments: 18,
      reports: 0,
      image: "linear-gradient(135deg, rgba(18,124,119,.2), rgba(228,94,86,.15)), url('assets/lyra-onboarding.png')"
    },
    {
      id: "p2",
      community: "Design",
      author: "Arjun S.",
      title: "Hiring board redesign concept",
      body: "A compact layout for comparing competition submissions without losing personality.",
      type: "Design",
      likes: 96,
      comments: 11,
      reports: 0,
      image: "linear-gradient(135deg, #dfeef0, #ffe0cc)"
    },
    {
      id: "p3",
      community: "Code",
      author: "Nila V.",
      title: "Offline judging queue prototype",
      body: "A small PWA experiment that batches competition votes when network quality drops.",
      type: "Prototype",
      likes: 77,
      comments: 9,
      reports: 0,
      image: "linear-gradient(135deg, #d7eee6, #d7def6)"
    }
  ],
  competitions: [
    {
      id: "c1",
      community: "Photography",
      org: "Northstar Studios",
      title: "Urban texture challenge",
      reward: "Rs. 15,000 and internship shortlist",
      deadline: "2026-07-18",
      joined: false,
      submissions: 64
    },
    {
      id: "c2",
      community: "Design",
      org: "PixelForge Labs",
      title: "Portfolio case study sprint",
      reward: "Hiring interview and mentor review",
      deadline: "2026-07-04",
      joined: false,
      submissions: 42
    },
    {
      id: "c3",
      community: "Code",
      org: "CivicStack",
      title: "Community safety feature build",
      reward: "Rs. 25,000 and contract project",
      deadline: "2026-07-28",
      joined: false,
      submissions: 27
    }
  ],
  reports: []
};

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : structuredClone(seed);
  } catch {
    return structuredClone(seed);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function $(selector) {
  return document.querySelector(selector);
}

function toast(message) {
  const el = $("#toast");
  el.textContent = message;
  el.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => el.classList.remove("show"), 2600);
}

function initials(name) {
  return (name || "Lyra")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function render() {
  $("#app").innerHTML = state.user ? appTemplate() : authTemplate();
  bindEvents();
}

function authTemplate() {
  const role = state.pendingRole || "user";
  return `
    <section class="auth-shell">
      <div class="auth-art">
        <div class="brand-lockup"><span class="brand-mark">L</span><span>Lyra</span></div>
        <div class="art-copy">
          <h1>Lyra</h1>
          <p>A focused community platform for creators, professionals, and organizations to discover talent through posts and competitions.</p>
        </div>
      </div>
      <div class="auth-panel">
        <p class="eyebrow">Community talent network</p>
        <h2>Sign in to your creative workspace</h2>
        <p>Choose a role, verify contact details, then enter a platform built around community-specific profiles, reach, reporting, and hiring competitions.</p>
        <div class="segmented" aria-label="Choose account type">
          <button class="${role === "user" ? "active" : ""}" data-role="user">User</button>
          <button class="${role === "org" ? "active" : ""}" data-role="org">Organization</button>
        </div>
        <form id="authForm" class="form-grid">
          <label class="field">
            <span>${role === "org" ? "Organization name" : "Full name"}</span>
            <input name="name" required value="${role === "org" ? "PixelForge Labs" : "Akshay Kumar"}" />
          </label>
          <label class="field">
            <span>Email</span>
            <input name="email" type="email" required value="${role === "org" ? "team@pixelforge.example" : "akshay@example.com"}" />
          </label>
          <label class="field">
            <span>Mobile number</span>
            <input name="phone" inputmode="numeric" minlength="10" maxlength="10" required value="9876543210" />
          </label>
          ${role === "org" ? `<label class="field"><span>Registration proof ID</span><input name="proof" required value="U74899TN2026PTC001234" /></label>` : ""}
          <div class="row">
            <button class="secondary" type="button" id="sendOtp">Send OTP</button>
            <span class="helper">${state.otp ? `Demo OTP: ${state.otp}` : "Email and mobile verification are simulated locally."}</span>
          </div>
          <label class="field">
            <span>OTP</span>
            <input name="otp" inputmode="numeric" minlength="6" maxlength="6" required placeholder="Enter 6 digit code" />
          </label>
          <div class="row">
            <button class="primary" type="submit">Continue</button>
            <button class="ghost" type="button" id="googleMock">Google sign-in</button>
          </div>
        </form>
      </div>
    </section>
  `;
}

function appTemplate() {
  const titles = {
    dashboard: "Community Feed",
    communities: "Communities",
    competitions: "Competitions",
    profile: "Profile",
    moderation: "Security"
  };
  return `
    <section class="app-shell">
      <aside class="sidebar">
        <div class="brand-lockup"><span class="brand-mark">L</span><span>Lyra</span></div>
        <nav class="nav">
          ${["dashboard", "communities", "competitions", "profile", "moderation"].map((view) => `
            <button class="${state.activeView === view ? "active" : ""}" data-view="${view}">
              <span>${titles[view]}</span><span>${navCount(view)}</span>
            </button>
          `).join("")}
        </nav>
        <div class="user-mini">
          <div class="row">
            <span class="avatar">${initials(state.user.name)}</span>
            <div>
              <strong>${state.user.name}</strong>
              <div class="meta">${state.user.role === "org" ? "Verified organization" : "Creator account"}</div>
            </div>
          </div>
          <button class="ghost" id="logout">Sign out</button>
        </div>
      </aside>
      <section class="workspace">
        <header class="topbar">
          <div>
            <h1>${titles[state.activeView]}</h1>
            <p>${topbarCopy()}</p>
          </div>
          <button class="secondary" id="resetDemo">Reset demo data</button>
        </header>
        <div class="content">${viewTemplate()}</div>
      </section>
    </section>
  `;
}

function navCount(view) {
  if (view === "communities") return `${state.user.communities.length}/3`;
  if (view === "competitions") return state.competitions.filter((item) => item.joined).length;
  if (view === "moderation") return state.reports.length;
  return "";
}

function topbarCopy() {
  if (state.activeView === "dashboard") return "Posts are separated by community so every member gets relevant reach.";
  if (state.activeView === "communities") return "Join up to three communities and keep each profile distinct.";
  if (state.activeView === "competitions") return "Organizations can run challenges and users can compete for rewards.";
  if (state.activeView === "profile") return "Your profile adapts to the selected community.";
  return "Report queues help admins review suspected plagiarism and abusive posts.";
}

function viewTemplate() {
  if (state.activeView === "communities") return communitiesTemplate();
  if (state.activeView === "competitions") return competitionsTemplate();
  if (state.activeView === "profile") return profileTemplate();
  if (state.activeView === "moderation") return moderationTemplate();
  return dashboardTemplate();
}

function dashboardTemplate() {
  const joined = state.user.communities;
  if (!joined.includes(state.activeCommunity)) state.activeCommunity = joined[0] || "Photography";
  const posts = state.posts.filter((post) => post.community === state.activeCommunity);
  return `
    <div class="grid dashboard-grid">
      <section class="grid">
        <div class="panel">
          <div class="tabs">
            ${joined.length ? joined.map((name) => `<button class="tab ${state.activeCommunity === name ? "active" : ""}" data-community-tab="${name}">${name}</button>`).join("") : `<span class="helper">Join a community to activate your feed.</span>`}
          </div>
        </div>
        ${composeTemplate()}
        <div class="feed">
          ${posts.length ? posts.map(postTemplate).join("") : `<div class="empty">No posts in this community yet. Create the first one.</div>`}
        </div>
      </section>
      <aside class="grid">
        <div class="panel">
          <h3>Platform snapshot</h3>
          <div class="stat-grid">
            <div class="stat"><strong>${state.communities.length}</strong><span>Communities</span></div>
            <div class="stat"><strong>${state.posts.length}</strong><span>Posts</span></div>
            <div class="stat"><strong>${state.competitions.length}</strong><span>Competitions</span></div>
          </div>
        </div>
        <div class="panel">
          <h3>Top performers</h3>
          <div class="leaderboard">
            <div><span>Maya R.</span><strong>980 pts</strong></div>
            <div><span>Arjun S.</span><strong>860 pts</strong></div>
            <div><span>Nila V.</span><strong>790 pts</strong></div>
          </div>
        </div>
      </aside>
    </div>
  `;
}

function composeTemplate() {
  if (!state.user.communities.length) return "";
  return `
    <form id="postForm" class="panel compose-grid">
      <h2 class="wide">Create post</h2>
      <label class="field">
        <span>Title</span>
        <input name="title" required placeholder="What are you sharing?" />
      </label>
      <label class="field">
        <span>Type</span>
        <select name="type">
          <option>Image</option>
          <option>Video</option>
          <option>Design</option>
          <option>Prototype</option>
          <option>Writing</option>
        </select>
      </label>
      <label class="field wide">
        <span>Description</span>
        <textarea name="body" required placeholder="Describe the work, process, or submission context."></textarea>
      </label>
      <label class="field">
        <span>Community</span>
        <select name="community">${state.user.communities.map((name) => `<option ${name === state.activeCommunity ? "selected" : ""}>${name}</option>`).join("")}</select>
      </label>
      <label class="field">
        <span>Media URL</span>
        <input name="image" placeholder="Optional image URL" />
      </label>
      <div class="row wide">
        <button class="primary" type="submit">Publish</button>
        <span class="helper">Reports and likes work after publishing.</span>
      </div>
    </form>
  `;
}

function postTemplate(post) {
  const image = post.image && post.image.startsWith("http") ? `url('${post.image}')` : (post.image || "linear-gradient(135deg, #e1efe9, #f8d6c5)");
  return `
    <article class="post">
      <div class="post-media" style="--image: ${image}"></div>
      <div class="post-body">
        <div class="post-head">
          <div>
            <h3>${post.title}</h3>
            <div class="meta">${post.author} in ${post.community} - ${post.type}</div>
          </div>
          <span class="tag">${post.likes} likes</span>
        </div>
        <p>${post.body}</p>
        <div class="post-actions">
          <button data-like="${post.id}">Like</button>
          <button data-comment="${post.id}">Comment</button>
          <button data-report="${post.id}">Report</button>
        </div>
      </div>
    </article>
  `;
}

function communitiesTemplate() {
  return `
    <div class="panel">
      <h2>Your communities</h2>
      <div class="community-strip">
        ${state.user.communities.length ? state.user.communities.map((name) => `<span class="chip active">${name}</span>`).join("") : `<span class="helper">No communities joined yet.</span>`}
      </div>
    </div>
    <div class="community-grid" style="margin-top: 18px">
      ${state.communities.map((community) => {
        const joined = state.user.communities.includes(community.name);
        return `
          <article class="community-card">
            <span class="tag">${community.category}</span>
            <h3>${community.name}</h3>
            <p>${community.summary}</p>
            <div class="meta">${community.members.toLocaleString()} members</div>
            <div class="row" style="margin-top: 14px">
              <button class="${joined ? "danger" : "primary"}" data-${joined ? "leave" : "join"}="${community.name}">${joined ? "Leave" : "Join"}</button>
              ${joined ? `<button class="secondary" data-open-community="${community.name}">Open feed</button>` : ""}
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function competitionsTemplate() {
  const create = state.user.role === "org" ? `
    <form id="competitionForm" class="panel compose-grid" style="margin-bottom: 18px">
      <h2 class="wide">Create competition</h2>
      <label class="field"><span>Title</span><input name="title" required /></label>
      <label class="field"><span>Community</span><select name="community">${state.communities.map((item) => `<option>${item.name}</option>`).join("")}</select></label>
      <label class="field"><span>Reward</span><input name="reward" required /></label>
      <label class="field"><span>Deadline</span><input name="deadline" type="date" required /></label>
      <button class="primary wide" type="submit">Publish competition</button>
    </form>
  ` : "";
  return `
    ${create}
    <div class="competition-grid">
      ${state.competitions.map((item) => `
        <article class="competition-card">
          <span class="tag">${item.community}</span>
          <h3>${item.title}</h3>
          <p>${item.reward}</p>
          <div class="meta">${item.org} - closes ${item.deadline}</div>
          <div class="progress" style="margin: 14px 0"><span style="--value: ${Math.min(item.submissions, 100)}%"></span></div>
          <div class="row">
            <button class="${item.joined ? "secondary" : "primary"}" data-competition="${item.id}">${item.joined ? "Joined" : "Join"}</button>
            <span class="helper">${item.submissions} submissions</span>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function profileTemplate() {
  const posts = state.posts.filter((post) => post.author === state.user.name);
  return `
    <section class="profile-band">
      <span class="avatar">${initials(state.user.name)}</span>
      <div>
        <h2>${state.user.name}</h2>
        <p class="meta">${state.user.role === "org" ? state.user.proof : state.user.email}</p>
      </div>
      <span class="tag">${state.user.communities.length} communities</span>
    </section>
    <div class="grid dashboard-grid">
      <div class="panel">
        <h3>Community profiles</h3>
        <div class="leaderboard">
          ${state.user.communities.map((name) => `<div><span>${name}</span><strong>${state.posts.filter((p) => p.author === state.user.name && p.community === name).length} posts</strong></div>`).join("") || `<div class="empty">Join a community to create a profile.</div>`}
        </div>
      </div>
      <div class="panel">
        <h3>Activity</h3>
        <div class="leaderboard">
          <div><span>Total likes earned</span><strong>${posts.reduce((sum, post) => sum + post.likes, 0)}</strong></div>
          <div><span>Competitions joined</span><strong>${state.competitions.filter((item) => item.joined).length}</strong></div>
          <div><span>Reports filed</span><strong>${state.reports.filter((item) => item.by === state.user.name).length}</strong></div>
        </div>
      </div>
    </div>
  `;
}

function moderationTemplate() {
  return `
    <div class="panel">
      <h2>Reported posts</h2>
      ${state.reports.length ? state.reports.map((report) => `
        <div class="report-row">
          <div>
            <strong>${report.title}</strong>
            <div class="meta">Reported by ${report.by} for plagiarism review</div>
          </div>
          <button class="secondary" data-resolve="${report.id}">Mark reviewed</button>
        </div>
      `).join("") : `<div class="empty">No reports are pending review.</div>`}
    </div>
  `;
}

function bindEvents() {
  document.querySelectorAll("[data-role]").forEach((button) => button.addEventListener("click", () => {
    state.pendingRole = button.dataset.role;
    saveState();
    render();
  }));

  $("#sendOtp")?.addEventListener("click", () => {
    state.otp = String(Math.floor(100000 + Math.random() * 900000));
    saveState();
    render();
    toast("OTP sent in demo mode.");
  });

  $("#googleMock")?.addEventListener("click", () => login({ name: "Google Creator", email: "creator@google.example", phone: "9999999999", role: state.pendingRole || "user" }));

  $("#authForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (!state.otp) return toast("Send OTP first.");
    if (data.otp !== state.otp) return toast("OTP does not match.");
    login({ ...data, role: state.pendingRole || "user" });
  });

  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => {
    state.activeView = button.dataset.view;
    saveState();
    render();
  }));

  $("#logout")?.addEventListener("click", () => {
    state.user = null;
    state.otp = null;
    saveState();
    render();
  });

  $("#resetDemo")?.addEventListener("click", () => {
    const user = state.user;
    state = structuredClone(seed);
    state.user = user;
    saveState();
    render();
    toast("Demo data reset.");
  });

  document.querySelectorAll("[data-community-tab]").forEach((button) => button.addEventListener("click", () => {
    state.activeCommunity = button.dataset.communityTab;
    saveState();
    render();
  }));

  $("#postForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    state.posts.unshift({
      id: crypto.randomUUID(),
      author: state.user.name,
      likes: 0,
      comments: 0,
      reports: 0,
      image: data.image || "linear-gradient(135deg, #e7f2ef, #f9d8c8)",
      ...data
    });
    state.activeCommunity = data.community;
    saveState();
    render();
    toast("Post published.");
  });

  $("#competitionForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    state.competitions.unshift({ id: crypto.randomUUID(), org: state.user.name, joined: false, submissions: 0, ...data });
    saveState();
    render();
    toast("Competition published.");
  });

  document.querySelectorAll("[data-join]").forEach((button) => button.addEventListener("click", () => {
    const name = button.dataset.join;
    if (state.user.communities.length >= 3) return toast("You can join a maximum of 3 communities.");
    state.user.communities.push(name);
    state.activeCommunity = name;
    saveState();
    render();
    toast(`Joined ${name}.`);
  }));

  document.querySelectorAll("[data-leave]").forEach((button) => button.addEventListener("click", () => {
    const name = button.dataset.leave;
    state.user.communities = state.user.communities.filter((item) => item !== name);
    if (state.activeCommunity === name) state.activeCommunity = state.user.communities[0] || "Photography";
    saveState();
    render();
    toast(`Left ${name}.`);
  }));

  document.querySelectorAll("[data-open-community]").forEach((button) => button.addEventListener("click", () => {
    state.activeCommunity = button.dataset.openCommunity;
    state.activeView = "dashboard";
    saveState();
    render();
  }));

  document.querySelectorAll("[data-like]").forEach((button) => button.addEventListener("click", () => {
    const post = state.posts.find((item) => item.id === button.dataset.like);
    post.likes += 1;
    saveState();
    render();
  }));

  document.querySelectorAll("[data-comment]").forEach((button) => button.addEventListener("click", () => {
    const post = state.posts.find((item) => item.id === button.dataset.comment);
    post.comments += 1;
    saveState();
    toast("Comment added in demo mode.");
  }));

  document.querySelectorAll("[data-report]").forEach((button) => button.addEventListener("click", () => {
    const post = state.posts.find((item) => item.id === button.dataset.report);
    if (state.reports.some((report) => report.postId === post.id && report.by === state.user.name)) return toast("You already reported this post.");
    post.reports += 1;
    state.reports.push({ id: crypto.randomUUID(), postId: post.id, title: post.title, by: state.user.name });
    saveState();
    render();
    toast("Post sent for admin review.");
  }));

  document.querySelectorAll("[data-competition]").forEach((button) => button.addEventListener("click", () => {
    const item = state.competitions.find((competition) => competition.id === button.dataset.competition);
    if (item.joined) return toast("You are already registered.");
    item.joined = true;
    item.submissions += 1;
    saveState();
    render();
    toast("Competition joined.");
  }));

  document.querySelectorAll("[data-resolve]").forEach((button) => button.addEventListener("click", () => {
    state.reports = state.reports.filter((report) => report.id !== button.dataset.resolve);
    saveState();
    render();
    toast("Report marked reviewed.");
  }));
}

function login(data) {
  const defaultCommunities = data.role === "org" ? ["Design"] : ["Photography", "Design"];
  state.user = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    proof: data.proof || "Verified personal creator",
    role: data.role,
    communities: defaultCommunities
  };
  state.activeCommunity = state.user.communities[0];
  state.activeView = "dashboard";
  state.otp = null;
  saveState();
  render();
  toast("Welcome to Lyra.");
}

render();
