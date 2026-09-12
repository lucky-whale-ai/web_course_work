import { languageInfo, nextLanguage } from "./i18n.js";
import * as pages from "./pages.js";
import { categories, homeProjects, licenses } from "./content.js";
import {
  tr,
  preferences,
  setPreferences,
  resetPreferences,
  applyPreferences,
  textOf,
  escapeHTML as esc,
  image,
  asset,
  field,
  projectCard,
  toast,
  openModal,
  closeModal,
  mobileMenu,
  loading,
  empty,
  header,
  footer,
} from "./ui.js";
import { api } from "./api.js";
import { setupRegistration } from "./registration.js";
let user = null,
  renderVersion = 0,
  slide = 0,
  catalogTimer,
  catalogRequest = 0,
  adminRequest = 0;
const statusLabel = (s) =>
  ({
    new: tr("Новое", "New"),
    processing: tr("В работе", "In progress"),
    done: tr("Завершено", "Completed"),
  })[s] || s;
const errorText = (e) =>
  e?.data?.messageRu
    ? tr(e.data.messageRu, e.data.messageEn)
    : tr(
        "Не удалось выполнить запрос. Проверьте соединение и попробуйте ещё раз.",
        "The request failed. Check your connection and try again.",
      );
function current() {
  let hash = location.hash.replace(/^#\/?/, "");
  const [path, query = ""] = hash.split("?");
  return { path, params: new URLSearchParams(query) };
}
async function loadUser() {
  try {
    user = (await api("/me")).user;
  } catch {
    user = null;
  }
  return user;
}
async function render({ keepScroll = false } = {}) {
  const version = ++renderVersion;
  const { path, params } = current();
  document.querySelector("#mobile-menu")?.remove();
  document.body.classList.remove("menu-open");
  let html;
  const staticPages = {
    "": pages.home,
    about: pages.about,
    services: pages.services,
    licenses: pages.licensesPage,
    safety: pages.safety,
    contacts: pages.contacts,
    agreement: pages.agreement,
    login: pages.login,
    register: pages.registration,
    settings: pages.settings,
  };
  if (path === "") slide = 0;
  if (staticPages[path]) html = staticPages[path]();
  else if (path === "projects") html = pages.projectsPage(params);
  else if (path.startsWith("project/"))
    html = `${header()}<main id="main">${loading()}</main>${footer()}`;
  else if (path === "account" || path === "admin") {
    await loadUser();
    if (version !== renderVersion) return;
    if (!user) {
      location.hash = `/login?next=${encodeURIComponent(path)}`;
      return;
    }
    html =
      path === "admin"
        ? user.role === "admin"
          ? pages.adminShell()
          : `${header()}<main id="main" class="empty-state"><h1>${tr("Доступ ограничен", "Access restricted")}</h1><p>${tr("Этот раздел доступен администратору.", "This area is reserved for administrators.")}</p></main>${footer()}`
        : pages.accountShell(user);
  } else html = pages.notFound();
  document.querySelector("#app").innerHTML =
    `<div class="site-width">${html}</div>`;
  document.title = `${{ about: tr("О компании", "About us"), services: tr("Сферы деятельности", "Expertise"), licenses: tr("Лицензии", "Licences"), projects: tr("Объекты", "Projects"), contacts: tr("Контакты", "Contacts"), register: tr("Регистрация", "Register"), login: tr("Вход", "Sign in"), settings: tr("Настройки", "Settings"), account: tr("Личный кабинет", "My account"), admin: tr("Обращения", "Requests"), safety: tr("Охрана труда", "Safety"), agreement: tr("Соглашение", "Agreement") }[path] || tr("Строительство и инженерные решения", "Construction and engineering")} — ${tr("Руф Профи", "Roof Profi")}`;
  const main = document.querySelector("#main");
  if (main) main.tabIndex = -1;
  document.querySelector(".skip-link").textContent = tr(
    "Перейти к содержимому",
    "Skip to content",
  );
  if (path === "" && preferences.a11y) {
    const overview = document.createElement("p");
    overview.className = "a11y-overview";
    overview.textContent = tr(
      "11 лет работы, 290 сотрудников, 54 реализованных объекта. Выберите раздел ниже, чтобы прочитать подробности.",
      "11 years of experience, 290 employees and 54 completed projects. Expand a section below to read more.",
    );
    main.prepend(overview);
    for (const section of main.querySelectorAll("section")) {
      const heading = section.querySelector("h2");
      if (!heading) continue;
      const details = document.createElement("details");
      details.className = "a11y-details";
      const summary = document.createElement("summary");
      summary.append(heading);
      details.append(summary);
      const content = document.createElement("div");
      content.className = "a11y-details-content";
      while (section.firstChild) content.append(section.firstChild);
      details.append(content);
      section.replaceWith(details);
    }
  }
  if (!keepScroll) window.scrollTo(0, 0);
  document.querySelectorAll(".desktop-nav a").forEach((a) => {
    if (a.getAttribute("href") === `#/${path}`)
      a.setAttribute("aria-current", "page");
  });
  if (path === "register")
    setupRegistration(async () => {
      await loadUser();
      location.hash = "/account";
    }, errorText);
  if (path === "projects") loadCatalog(params, version);
  if (path.startsWith("project/")) {
    try {
      const p = await api(`/projects/${encodeURIComponent(path.slice(8))}`);
      if (version !== renderVersion) return;
      document.querySelector("#app").innerHTML =
        `<div class="site-width">${pages.projectPage(p)}</div>`;
      document.title = `${textOf(p)} — ${tr("Руф Профи", "Roof Profi")}`;
      syncFavorites();
    } catch (e) {
      if (version === renderVersion && e.status === 404)
        document.querySelector("#app").innerHTML =
          `<div class="site-width">${pages.notFound()}</div>`;
      else if (version === renderVersion)
        document.querySelector("#main").innerHTML =
          `<div class="empty-state"><p>${errorText(e)}</p><button class="button" data-action="retry">${tr("Повторить", "Retry")}</button></div>`;
    }
  }
  if (path === "account") loadAccount(version);
  if (path === "admin" && user?.role === "admin") loadAdmin();
}
async function loadCatalog(params, version = renderVersion) {
  const requestId = ++catalogRequest;
  const target = document.querySelector("#catalog-results");
  if (!target) return;
  target.innerHTML = loading();
  try {
    const query = new URLSearchParams(params);
    query.set("lang", preferences.language);
    const result = await api(`/projects?${query}`);
    if (
      requestId !== catalogRequest ||
      version !== renderVersion ||
      !target.isConnected
    )
      return;
    target.innerHTML = `<p class="results-meta">${tr("Найдено объектов:", "Projects found:")} ${result.total}</p>${result.items.length ? `<div class="project-grid">${result.items.map((p) => projectCard(p)).join("")}</div>` : empty("Объекты не найдены", "No matching projects")}<nav class="pagination" aria-label="${tr("Страницы каталога", "Catalogue pages")}">${Array.from({ length: result.pages }, (_, i) => `<button data-page="${i + 1}" ${result.page === i + 1 ? 'aria-current="page"' : ""}>${i + 1}</button>`).join("")}</nav>`;
    syncFavorites();
  } catch (e) {
    if (requestId === catalogRequest && target.isConnected)
      target.innerHTML = `<div class="empty-state"><p>${errorText(e)}</p><button class="button" data-action="retry">${tr("Повторить", "Retry")}</button></div>`;
  }
}
function catalogChanged() {
  const f = document.querySelector("#catalog-filters");
  if (!f) return;
  clearTimeout(catalogTimer);
  catalogTimer = setTimeout(() => {
    const q = new URLSearchParams(new FormData(f));
    q.set("page", "1");
    history.replaceState(null, "", `#/projects?${q}`);
    loadCatalog(q);
  }, 250);
}
async function syncFavorites() {
  if (!user) return;
  try {
    const data = await api("/favorites");
    const ids = new Set(data.map((f) => String(f.projectId)));
    document.querySelectorAll("[data-favorite]").forEach((b) => {
      const saved = ids.has(b.dataset.favorite);
      b.setAttribute("aria-pressed", String(saved));
      b.textContent = saved
        ? tr("В избранном", "Saved")
        : tr("В избранное", "Save project");
    });
  } catch {}
}
function requestCard(r, admin = false) {
  return `<article class="request-card"><div class="request-meta"><span>${tr(r.type === "partner" ? "Партнёрство" : "Вопрос", r.type === "partner" ? "Partnership" : "Question")} · ${new Date(r.createdAt).toLocaleDateString(languageInfo(preferences.language).locale)}</span><span class="status">${statusLabel(r.status)}</span></div><h3>${esc(r.name)}</h3>${admin ? `<p>${esc(r.email)} · ${esc(r.phone || "")}</p>` : ""}<p>${esc(r.message)}</p>${r.company ? `<p>${tr("Компания:", "Company:")} ${esc(r.company)}</p>` : ""}${admin ? `<label class="field"><span>${tr("Изменить статус", "Update status")}</span><select data-request-status="${r.id}">${["new", "processing", "done"].map((s) => `<option value="${s}" ${s === r.status ? "selected" : ""}>${statusLabel(s)}</option>`).join("")}</select></label>` : ""}</article>`;
}
async function loadAccount(version) {
  try {
    const [saved, requests] = await Promise.all([
      api("/favorites?expand=projects"),
      api("/requests"),
    ]);
    if (version !== renderVersion) return;
    document.querySelector("#account-favorites").innerHTML = saved.length
      ? `<div class="project-grid">${saved.map((f) => projectCard(f.project)).join("")}</div>`
      : `<p>${tr("Пока нет избранных объектов. Добавьте их из каталога.", "No saved projects yet. Add some from the catalogue.")}</p>`;
    document.querySelector("#account-requests").innerHTML = requests.length
      ? requests.map((r) => requestCard(r)).join("")
      : `<p>${tr("Вы ещё не отправляли обращения.", "You have not submitted any requests yet.")}</p>`;
    syncFavorites();
  } catch (e) {
    if (version === renderVersion) toast(errorText(e));
  }
}
async function loadAdmin() {
  const requestId = ++adminRequest;
  const target = document.querySelector("#admin-requests");
  if (!target) return;
  const status = document.querySelector("#admin-status").value;
  target.innerHTML = loading();
  try {
    const rows = await api(`/requests${status ? `?status=${status}` : ""}`);
    if (requestId === adminRequest && target.isConnected)
      target.innerHTML = rows.length
        ? rows.map((r) => requestCard(r, true)).join("")
        : `<p>${tr("Обращений с этим статусом нет.", "There are no requests with this status.")}</p>`;
  } catch (e) {
    if (requestId === adminRequest && target.isConnected)
      target.innerHTML = `<p>${errorText(e)}</p>`;
  }
}
function closeMenu() {
  document.querySelector("#mobile-menu")?.remove();
  document.body.classList.remove("menu-open");
  const button = document.querySelector("[data-action=menu]");
  button?.setAttribute("aria-expanded", "false");
  button?.focus();
}
function requestModal(type) {
  openModal(
    `<h2>${tr(type === "partner" ? "Предложить партнёрство" : "Задать вопрос", type === "partner" ? "Propose a partnership" : "Ask a question")}</h2><form id="request-form" class="form-stack"><input type="hidden" name="type" value="${type}">${field("name", "Имя", "Name", { autocomplete: "name", value: user ? `${user.firstName} ${user.lastName}` : "" })}${field("email", "Электронная почта", "Email", { type: "email", autocomplete: "email", value: user?.email || "" })}${field("phone", "Телефон", "Phone", { type: "tel", autocomplete: "tel", required: false, value: user?.phone || "" })}${type === "partner" ? `${field("company", "Компания", "Company")}<label class="field"><span>${tr("Направление", "Sector")}</span><select name="category">${categories.map((c) => `<option value="${c.id}">${tr(c.ru, c.en)}</option>`).join("")}</select></label>` : ""}<label class="field"><span>${tr("Сообщение", "Message")} *</span><textarea name="message" required minlength="10" maxlength="2000"></textarea><span class="field-error" data-error="message"></span></label><label class="check-field"><input type="checkbox" name="consent" required><span>${tr("Согласен(на) с обработкой данных по", "I agree to data processing under the")} <a class="text-link" href="#/agreement" data-action="close">${tr("пользовательскому соглашению", "user agreement")}</a></span></label><div class="form-message" role="alert"></div><button type="submit" class="button">${tr("Отправить", "Send")}</button></form>`,
  );
}
document.addEventListener("click", async (e) => {
  const b = e.target.closest("button,a");
  if (!b) return;
  if (b.classList.contains("skip-link")) {
    e.preventDefault();
    const main = document.querySelector("#main");
    main?.focus();
    main?.scrollIntoView({ block: "start" });
    return;
  }
  if (b.dataset.request) {
    e.preventDefault();
    if (document.querySelector("#mobile-menu")) closeMenu();
    requestModal(b.dataset.request);
    return;
  }
  if (b.dataset.license) {
    e.preventDefault();
    const l = licenses.find((x) => x.id === b.dataset.license);
    openModal(
      `<h2>${tr(l.ru, l.en)}</h2>${image(l.image, tr(l.ru, l.en), "document-preview")}`,
    );
    return;
  }
  if (b.dataset.setting) {
    const raw = b.dataset.value;
    setPreferences({
      [b.dataset.setting]:
        raw === "true"
          ? true
          : raw === "false"
            ? false
            : b.dataset.setting === "fontScale"
              ? Number(raw)
              : raw,
    });
    render({ keepScroll: true });
    return;
  }
  if (b.dataset.slide) {
    slide = (slide + Number(b.dataset.slide) + 6) % 6;
    const imgs = [
      "hero.png",
      ...homeProjects.slice(1).map((p) => p.image.slice(7)),
    ];
    document.querySelector(".hero-image").src = asset(imgs[slide]);
    document
      .querySelectorAll(".hero-picture source")
      .forEach(
        (source, i) =>
          (source.srcset = asset(
            slide === 0
              ? ["hero-320.png", "hero-768.png", "hero-1920.png"][i]
              : imgs[slide],
          )),
      );
    document.querySelector(".hero-number").textContent = String(
      slide + 1,
    ).padStart(2, "0");
    document.querySelector(".hero h1").textContent =
      slide === 0
        ? tr("Нефтегазового комплекса", "For the oil and gas industry")
        : tr(
            [
              "",
              "Промышленного строительства",
              "Технологических трубопроводов",
              "Инженерной инфраструктуры",
              "Транспортной инфраструктуры",
              "Производственных комплексов",
            ][slide],
            [
              "",
              "For industrial construction",
              "For process pipelines",
              "For engineering infrastructure",
              "For transport infrastructure",
              "For production facilities",
            ][slide],
          );
    return;
  }
  if (b.dataset.gallery) {
    const img = document.querySelector(".gallery-main");
    img.src = "/" + b.dataset.gallery;
    document
      .querySelectorAll("[data-gallery]")
      .forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    return;
  }
  if (b.dataset.page) {
    const { params } = current();
    params.set("page", b.dataset.page);
    history.replaceState(null, "", `#/projects?${params}`);
    loadCatalog(params);
    document
      .querySelector("#catalog-filters")
      .scrollIntoView({ block: "start" });
    return;
  }
  if (b.dataset.favorite) {
    if (!user) {
      toast(
        tr("Войдите, чтобы сохранять объекты.", "Sign in to save projects."),
      );
      location.hash = "/login?next=account";
      return;
    }
    b.disabled = true;
    try {
      const remove = b.getAttribute("aria-pressed") === "true";
      await api(`/favorites/${encodeURIComponent(b.dataset.favorite)}`, {
        method: remove ? "DELETE" : "PUT",
      });
      toast(
        tr(
          remove
            ? "Объект удалён из избранного."
            : "Объект добавлен в избранное.",
          remove ? "Project removed." : "Project saved.",
        ),
      );
      if (current().path === "account") loadAccount(renderVersion);
      else await syncFavorites();
    } catch (err) {
      toast(errorText(err));
    } finally {
      b.disabled = false;
    }
    return;
  }
  switch (b.dataset.action) {
    case "menu": {
      if (document.querySelector("#mobile-menu")) closeMenu();
      else {
        document
          .querySelector(".site-width")
          .insertAdjacentHTML("beforeend", mobileMenu());
        document.body.classList.add("menu-open");
        b.setAttribute("aria-expanded", "true");
        document.querySelector(".menu-close").focus();
      }
      break;
    }
    case "close-menu":
      closeMenu();
      break;
    case "close":
      closeModal();
      break;
    case "language":
      setPreferences({ language: nextLanguage(preferences.language).code });
      render({ keepScroll: true });
      break;
    case "reset-settings":
      resetPreferences();
      render({ keepScroll: true });
      toast(tr("Настройки сброшены.", "Settings reset."));
      break;
    case "logout":
      await api("/logout", { method: "POST" });
      user = null;
      location.hash = "/login";
      break;
    case "retry":
      render({ keepScroll: true });
      break;
  }
});
document.addEventListener("input", (e) => {
  if (e.target.closest("#catalog-filters")) catalogChanged();
});
document.addEventListener("change", async (e) => {
  if (e.target.closest("#catalog-filters")) catalogChanged();
  if (e.target.id === "admin-status") loadAdmin();
  if (e.target.dataset.requestStatus) {
    e.target.disabled = true;
    try {
      await api(`/requests/${e.target.dataset.requestStatus}`, {
        method: "PATCH",
        body: { status: e.target.value },
      });
      toast(tr("Статус обновлён.", "Status updated."));
      loadAdmin();
    } catch (err) {
      toast(errorText(err));
      e.target.disabled = false;
    }
  }
});
document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id === "catalog-filters") {
    e.preventDefault();
    catalogChanged();
    return;
  }
  if (!["login-form", "request-form"].includes(f.id)) return;
  e.preventDefault();
  if (!f.reportValidity()) return;
  const button = f.querySelector("[type=submit]");
  button.disabled = true;
  const data = Object.fromEntries(new FormData(f));
  try {
    if (f.id === "login-form") {
      await api("/login", { method: "POST", body: data });
      await loadUser();
      const next = current().params.get("next");
      location.hash = next === "admin" ? "/admin" : "/account";
    } else {
      await api("/requests", { method: "POST", body: data });
      openModal(
        `<div class="success-mark" aria-hidden="true">✓</div><h2>${tr("Спасибо, ваше сообщение успешно отправлено", "Thank you, your message has been sent")}</h2><p>${tr("Мы ответим вам в ближайшее время", "We will get back to you soon")}</p><button class="button" style="margin-top:32px" data-action="close">${tr("Хорошо", "Done")}</button>`,
      );
      if (current().path === "account") loadAccount(renderVersion);
    }
  } catch (err) {
    f.querySelector(".form-message").textContent = errorText(err);
  } finally {
    button.disabled = false;
  }
});
document.addEventListener("keydown", (e) => {
  const menu = document.querySelector("#mobile-menu");
  if (!menu) return;
  if (e.key === "Escape") {
    e.preventDefault();
    closeMenu();
  }
  if (e.key === "Tab") {
    const links = menu.querySelectorAll("a,button");
    const first = links[0],
      last = links[links.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
window.addEventListener("hashchange", () => {
  if (document.querySelector("#modal").open) closeModal();
  render();
});
applyPreferences();
render();
loadUser();
if (new URLSearchParams(location.search).has("qa")) {
  document.documentElement.style.scrollbarWidth = "none";
  document
    .querySelectorAll('img[loading="lazy"]')
    .forEach((img) => (img.loading = "eager"));
}
