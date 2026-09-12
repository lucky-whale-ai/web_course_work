import { languages } from "./i18n.js";
import {
  categories,
  homeProjects,
  licenses,
  agreementRU,
  agreementEN,
} from "./content.js";
import {
  tr,
  preferences,
  textOf,
  escapeHTML as esc,
  asset,
  image,
  icon,
  routeLink,
  header,
  footer,
  innerHero,
  projectCard,
  statistics,
  licenseList,
  field,
  loading,
} from "./ui.js";
const sectorPicture = (c) =>
  `<picture><source media="(max-width:599px)" srcset="${asset(`sector-${c.id}-320.png`)}"><source media="(max-width:1023px)" srcset="${asset(`sector-${c.id}-768.png`)}"><source media="(min-width:1700px)" srcset="${asset(`sector-${c.id}-1920.png`)}"><img src="${asset(c.image)}" alt=""></picture>`;
export function home() {
  return `<div class="hero">${header(true)}<picture class="hero-picture"><source media="(max-width:599px)" srcset="${asset("hero-320.png")}"><source media="(max-width:1023px)" srcset="${asset("hero-768.png")}"><source media="(min-width:1700px)" srcset="${asset("hero-1920.png")}"><img src="${asset("hero.png")}" alt="${tr("Объект нефтегазового комплекса", "Oil and gas facility")}" class="hero-image" fetchpriority="high"></picture><span class="image-description">${tr("Объект нефтегазового комплекса", "Oil and gas facility")}</span><p class="hero-number" aria-live="off">01</p><div class="hero-copy"><p class="hero-eyebrow">${tr("Реализуем объекты", "We deliver projects")}</p><h1>${tr("Нефтегазового комплекса", "For the oil and gas industry")}</h1></div><div class="hero-controls"><button data-slide="-1" aria-label="${tr("Предыдущий слайд", "Previous slide")}">${icon("imgVuesaxLinearArrowDown.svg", "arrow-left")}</button><button data-slide="1" aria-label="${tr("Следующий слайд", "Next slide")}">${icon("imgVuesaxLinearArrowDown.svg", "arrow-right")}</button></div></div><main id="main"><section class="section container home-activities"><h2 class="section-title">${tr("Сферы деятельности", "Our expertise")}</h2><div class="activity-grid">${categories.map((c) => `<a class="activity ${c.id}" href="#/projects?category=${c.id}">${sectorPicture(c)}<h3>${tr(c.ru, c.en)}</h3></a>`).join("")}</div></section><section class="section container home-statistics"><h2 class="section-title">${tr("Руф Профи это", "Roof Profi in numbers")}</h2>${statistics()}</section><section class="section container home-projects"><h2 class="section-title">${tr("Реализованные объекты", "Completed projects")}</h2><div class="project-grid" role="region" aria-label="${tr("Объекты: прокрутите список", "Projects: scroll to browse")}" tabindex="0">${homeProjects.map((p) => projectCard(p, true)).join("")}</div><div class="all-projects">${routeLink("projects", "Все объекты", "All projects", "button")}</div></section><section class="section container home-licenses"><h2 class="section-title">${tr("Лицензии и сертификаты", "Licences and certificates")}</h2>${licenseList()}</section></main>${footer(true)}`;
}
export function about() {
  return `${innerHero("О компании", "About us", "44-1004-imgInnerHeadDesktop.png")}<main id="main" class="content-page"><p class="lead">${tr("Руф Профи — строительная компания, реализующая проекты нефтегазового и электроэнергетического комплекса, промышленного и гражданского строительства.", "Roof Profi delivers projects in oil and gas, power infrastructure, industrial and civil construction.")}</p><section class="section"><h2 class="section-title">${tr("Руф Профи это", "Roof Profi in numbers")}</h2>${statistics()}</section><section class="editorial-row"><h2>${tr("Обращение директора", "A message from the director")}</h2><div class="prose"><p>${tr("Сегодня наша задача — стать лидером и надёжным партнёром по реализации строительных проектов. Доверие заказчиков достигается слаженной работой коллектива — профессионалов, имеющих многолетний опыт.", "Our aim is to be a trusted partner in construction. Client confidence comes from an experienced team working together.")}</p><p>${tr("Компания располагает современным парком строительной техники, развивает квалификацию сотрудников и уделяет особое внимание промышленной безопасности. Мы дорожим своим именем и отвечаем за качество выполненных работ.", "The company maintains a modern equipment fleet, invests in its employees and pays particular attention to industrial safety. We stand behind the quality of our work.")}</p><p><strong>${tr("В. В. Бобров, директор ООО «Руф Профи»", "V. V. Bobrov, Director of Roof Profi LLC")}</strong></p></div></section><section class="editorial-row"><h2>${tr("История компании", "Our history")}</h2><div class="prose"><h3>2011</h3><p>${tr("27 июля — официальное начало работы компании.", "The company officially began operations on 27 July.")}</p><h3>2021</h3><p>${tr("По итогам года выручка выросла более чем в 2,5 раза. Компенсационный фонд СРО увеличен до 3 млрд рублей.", "Annual revenue grew more than 2.5 times. The SRO compensation fund was increased to 3 billion roubles.")}</p></div></section><section class="section"><h2 class="section-title">${tr("Наша команда", "Our team")}</h2><p class="lead">${tr("Инженеры, проектировщики, специалисты по строительству и контролю качества работают над общим результатом.", "Engineers, designers, construction specialists and quality inspectors work towards a shared result.")}</p><div class="photo-grid">${[147, 148, 149, 150, 151, 152].map((n) => image(`44-1004-imgRectangle${n}.png`, tr("Сотрудник компании", "Team member"), "", 'loading="lazy"')).join("")}</div></section><section class="editorial-row"><h2>${tr("Техника и производственная база", "Equipment and production facilities")}</h2><p>${tr("Собственная техника и подготовленная производственная база помогают выполнять работы по согласованному графику. Перед началом проекта формируются состав бригады, план снабжения и программа контроля.", "Our equipment and production facilities support dependable project schedules. Each project begins with a staffing plan, supply programme and inspection schedule.")}</p></section><div class="photo-grid">${[155, 156, 157].map((n) => image(`44-1004-imgRectangle${n}.png`, tr("Производственные ресурсы компании", "Company production facilities"), "", 'loading="lazy"')).join("")}</div></main>${footer()}`;
}
const serviceCopy = [
  [
    "Монтаж и ремонт технологического оборудования, трубопроводов и сооружений нефтегазового комплекса. Организация работ на действующих объектах с соблюдением требований промышленной безопасности.",
    "Installation and repair of equipment, pipelines and structures for the oil and gas industry, including work at operational sites.",
  ],
  [
    "Строительство и модернизация объектов электроснабжения, монтаж инженерных систем и пусконаладочные работы.",
    "Construction and modernisation of power infrastructure, installation of engineering systems and commissioning.",
  ],
  [
    "Строительство и монтаж офисных зданий и сооружений, одно из наиболее перспективных направлений компании.",
    "Construction of office buildings and civil infrastructure is one of the company’s key areas of development.",
  ],
  [
    "Строительство и реконструкция производственных зданий, ремонт промышленных площадок и устройство технологических коммуникаций.",
    "Construction and reconstruction of production facilities, industrial site repairs and installation of process utilities.",
  ],
];
export function services() {
  return `${innerHero("Сферы деятельности", "Our expertise")}<main id="main" class="content-page">${categories.map((c, i) => `<section class="service-row"><h2>${tr(c.ru, c.en)}</h2><div><p>${tr(...serviceCopy[i])}</p><p style="margin-top:24px">${routeLink(`projects?category=${c.id}`, "Смотреть объекты", "View projects", "text-link")}</p></div>${image(c.image, tr(c.ru, c.en), "", 'loading="lazy"')}</section>`).join("")}</main>${footer()}`;
}
export function licensesPage() {
  return `${innerHero("Лицензии и сертификаты", "Licences and certificates", "45-4048-imgInnerHeadDesktop.png")}<main id="main" class="content-page"><div class="certificate-grid">${licenses.map((l) => `<a href="#/licenses" data-license="${l.id}">${image(l.thumbnail, tr(l.ru, l.en), "", 'loading="lazy"')}<h2>${tr(l.ru, l.en)}</h2></a>`).join("")}</div></main>${footer()}`;
}
export function safety() {
  return `${innerHero("Охрана труда и качество", "Safety and quality", "44-1004-imgInnerHeadDesktop.png")}<main id="main" class="content-page"><p class="lead">${tr("Безопасность людей, качество работ и бережное отношение к окружающей среде — основа организации каждого проекта.", "The safety of people, the quality of work and care for the environment guide every project.")}</p>${[
    [
      "Качество",
      "Quality",
      "Система менеджмента качества определяет порядок подготовки, выполнения и проверки работ. Контроль начинается с приёмки материалов и продолжается до передачи исполнительной документации заказчику.",
      "Our quality management system covers preparation, delivery and inspection. Checks begin with incoming materials and continue through handover.",
    ],
    [
      "Охрана труда",
      "Occupational safety",
      "До начала работ сотрудники проходят инструктаж. На объекте используются средства индивидуальной защиты, проверяется состояние оборудования и контролируется соблюдение технологических карт.",
      "Employees receive safety briefings before work begins. Personal protective equipment, equipment inspections and approved work procedures are mandatory.",
    ],
    [
      "Промышленная безопасность",
      "Industrial safety",
      "Работы на действующих объектах выполняются по согласованным нарядам-допускам. Ответственные специалисты контролируют подготовку рабочих мест и взаимодействие бригад.",
      "Work at operational sites follows approved permits. Responsible specialists supervise work area preparation and coordination between teams.",
    ],
    [
      "Охрана окружающей среды",
      "Environmental protection",
      "Отходы разделяются и передаются на обработку. Производственные операции планируются с учётом предотвращения загрязнений и восстановления территории после окончания строительства.",
      "Waste is separated and transferred for treatment. Operations are planned to prevent pollution and restore the site after construction.",
    ],
  ]
    .map(
      ([r, e, pr, pe]) =>
        `<section class="editorial-row"><h2>${tr(r, e)}</h2><div class="prose"><p>${tr(pr, pe)}</p><p>${routeLink("licenses", "Документы и сертификаты", "Documents and certificates", "text-link")}</p></div></section>`,
    )
    .join(
      "",
    )}${image("44-1004-imgRectangle155.png", tr("Организация работ на объекте", "Work organisation at a project site"), "wide-image", 'loading="lazy"')}</main>${footer()}`;
}
export function contacts() {
  return `${innerHero("Контакты", "Contacts")}<main id="main" class="content-page"><div class="contact-layout"><div><dl class="contact-data"><div><dt>${tr("Телефон", "Phone")}</dt><dd><a href="tel:+78462541373">+7 (846) 254-13-73</a></dd></div><div><dt>${tr("Электронная почта", "Email")}</dt><dd><a href="mailto:info@roof-prof.ru">info@roof-prof.ru</a></dd></div><div><dt>${tr("Адрес", "Address")}</dt><dd>${tr("443111, Россия, г. Самара, ул. Урицкого 19, офис 502", "19 Uritskogo Street, office 502, Samara, Russia, 443111")}</dd></div></dl><div class="form-stack" style="margin-top:32px"><button class="button" data-request="question">${tr("Задать вопрос", "Ask a question")}</button><button class="button outline" data-request="partner">${tr("Предложить партнёрство", "Propose a partnership")}</button></div></div><iframe title="${tr("Карта расположения офиса", "Office location map")}" class="map-embed" src="https://maps.google.com/maps?q=Самара%20Урицкого%2019&output=embed" loading="lazy" referrerpolicy="no-referrer"></iframe></div></main>${footer()}`;
}
export function projectsPage(params) {
  return `${innerHero("Объекты", "Projects")}<main id="main" class="content-page"><form id="catalog-filters" class="filters"><label class="field"><span>${tr("Поиск по названию или региону", "Search by name or region")}</span><input name="q" type="search" value="${esc(params.get("q") || "")}" placeholder="${tr("Найти объект…", "Find a project…")}"></label><label class="field"><span>${tr("Направление", "Sector")}</span><select name="category"><option value="">${tr("Все направления", "All sectors")}</option>${categories.map((c) => `<option value="${c.id}" ${params.get("category") === c.id ? "selected" : ""}>${tr(c.ru, c.en)}</option>`).join("")}</select></label><label class="field"><span>${tr("Сортировка", "Sort by")}</span><select name="sort">${[
    ["newest", "Сначала новые", "Newest first"],
    ["oldest", "Сначала старые", "Oldest first"],
    ["title", "По названию", "Project name"],
  ]
    .map(
      ([v, r, e]) =>
        `<option value="${v}" ${params.get("sort") === v ? "selected" : ""}>${tr(r, e)}</option>`,
    )
    .join(
      "",
    )}</select></label></form><div id="catalog-results" aria-live="polite">${loading()}</div></main>${footer()}`;
}
export function projectPage(p) {
  return `${header()}<main id="main"><nav class="breadcrumbs">${routeLink("", "Главная", "Home")}<span>/</span>${routeLink("projects", "Объекты", "Projects")}</nav><div class="gallery">${image(p.image, textOf(p), "gallery-main")}<div class="gallery-controls">${(p.gallery || [p.image]).map((src, i) => `<button data-gallery="${esc(src)}" aria-label="${tr("Фотография", "Photo")} ${i + 1}" aria-pressed="${i === 0}">${image(src, "")}</button>`).join("")}</div></div><div class="container project-detail"><div><h1>${esc(textOf(p))}</h1><div class="prose"><p>${esc(textOf(p, "description"))}</p></div><div class="inline-actions" style="margin-top:32px"><button class="button" data-favorite="${p.id}" aria-pressed="false">${tr("В избранное", "Save project")}</button><button class="button outline" data-request="question">${tr("Обсудить проект", "Discuss a project")}</button></div></div><div class="project-facts">${factsForDetail(p)}</div></div><section class="section container"><h2 class="section-title">${tr("Другие объекты", "Other projects")}</h2><div class="project-grid">${homeProjects
    .filter((x) => x.id !== p.id)
    .slice(0, 3)
    .map((x) => projectCard(x))
    .join("")}</div></section></main>${footer()}`;
}
function factsForDetail(p) {
  const c = categories.find((c) => c.id === p.category);
  return `<dl>${[
    [tr("Направление", "Sector"), tr(c?.short || "", c?.en || "")],
    [tr("Срок реализации", "Project period"), `${p.dateFrom} — ${p.dateTo}`],
    [tr("Заказчик", "Client"), textOf(p, "client")],
    [tr("Местоположение", "Location"), textOf(p, "location")],
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
    .join("")}</dl>`;
}
export function agreement() {
  return `${header()}<main id="main" class="form-page agreement-page"><h1>${tr("Пользовательское соглашение", "User agreement")}</h1><div class="prose">${agreementRU
    .map((text, i) => tr(text, agreementEN[i]))
    .map((p) => `<p>${p}</p>`)
    .join(
      "",
    )}</div><p style="margin-top:32px">${routeLink("register", "Перейти к регистрации", "Continue to registration", "button")}</p></main>${footer()}`;
}
export function login() {
  return `${header()}<main id="main" class="form-page"><h1>${tr("Войти в аккаунт", "Sign in")}</h1><form id="login-form" class="form-stack">${field("email", "Электронная почта", "Email", { type: "email", autocomplete: "username" })}${field("password", "Пароль", "Password", { type: "password", autocomplete: "current-password" })}<div class="form-message" role="alert"></div><button class="button" type="submit">${tr("Войти", "Sign in")}</button></form><div class="form-switch"><p>${tr("Ещё нет аккаунта?", "Do not have an account?")}</p>${routeLink("register", "Зарегистрироваться", "Register", "text-link")}</div></main>${footer()}`;
}
export function registration() {
  return `${header()}<main id="main" class="form-page"><h1>${tr("Регистрация", "Create an account")}</h1><form id="register-form" class="form-grid" novalidate>${field("lastName", "Фамилия", "Last name", { autocomplete: "family-name" })}${field("firstName", "Имя", "First name", { autocomplete: "given-name" })}${field("patronymic", "Отчество", "Patronymic", { required: false, autocomplete: "additional-name" })}${field("birthDate", "Дата рождения", "Date of birth", { type: "date", autocomplete: "bday" })}${field("phone", "Телефон РБ", "Belarus phone number", { type: "tel", autocomplete: "tel", extra: 'placeholder="+375 29 123-45-67"' })}${field("email", "Электронная почта", "Email", { type: "email", autocomplete: "email" })}<div class="full form-stack">${field("nickname", "Никнейм", "Nickname", { extra: 'readonly minlength="3" maxlength="24"' })}<div class="inline-actions"><button type="button" class="button secondary" data-action="nickname">${tr("Сгенерировать другой", "Generate another")}</button><span id="nickname-attempts" class="form-help"></span></div></div><label class="field full"><span>${tr("Способ задания пароля", "Password method")}</span><select name="passwordMode"><option value="manual">${tr("Ввести самостоятельно", "Enter manually")}</option><option value="generated">${tr("Сгенерировать автоматически", "Generate automatically")}</option></select></label>${field("password", "Пароль", "Password", { type: "password", autocomplete: "new-password", extra: 'minlength="8" maxlength="20"' })}${field("confirmPassword", "Повторите пароль", "Confirm password", { type: "password", autocomplete: "new-password", extra: 'minlength="8" maxlength="20"' })}<p class="form-help full">${tr("8–20 символов: заглавная и строчная буквы, цифра, специальный символ. Вставка в поле повторного ввода отключена по требованиям задания.", "Use 8–20 characters, including uppercase and lowercase letters, a number and a special character. Pasting into confirmation is disabled by the coursework requirements.")}</p><div class="full inline-actions"><button class="button secondary" type="button" data-action="show-password">${tr("Показать пароль", "Show password")}</button><button class="button secondary" type="button" data-action="generate-password" hidden>${tr("Другой пароль", "Generate again")}</button></div><div class="full form-stack"><h2>${tr("Пользовательское соглашение", "User agreement")}</h2><div class="agreement-box" tabindex="0" aria-label="${tr("Прочитайте соглашение до конца", "Read the agreement to the end")}">${agreementRU
    .map((text, i) => tr(text, agreementEN[i]))
    .map((p) => `<p>${p}</p>`)
    .join(
      "",
    )}</div><label class="check-field"><input type="checkbox" name="agreement" disabled><span>${tr("Я прочитал(а) и принимаю пользовательское соглашение", "I have read and accept the user agreement")}</span></label><p class="form-help">${tr("Прокрутите соглашение до конца, чтобы подтвердить ознакомление.", "Scroll to the end to confirm that you have read the agreement.")}</p></div><div class="form-message full" role="alert"></div><button class="button full" type="submit" disabled>${tr("Зарегистрироваться", "Create account")}</button></form><div class="form-switch"><p>${tr("Уже зарегистрированы?", "Already registered?")}</p>${routeLink("login", "Войти", "Sign in", "text-link")}</div></main>${footer()}`;
}
export function settings() {
  const group = (title, en, key, choices) =>
    `<section class="settings-group"><h3>${tr(title, en)}</h3><div class="choice-buttons">${choices.map(([v, r, e]) => `<button data-setting="${key}" data-value="${v}" aria-pressed="${String(preferences[key]) === String(v)}">${tr(r, e)}</button>`).join("")}</div></section>`;
  return `${header()}<main id="main" class="form-page"><h1>${tr("Настройки сайта", "Site settings")}</h1>${group(
    "Язык",
    "Language",
    "language",
    languages.map(({ code, name }) => [code, name, name]),
  )}${group("Оформление", "Theme", "theme", [
    ["light", "Светлое", "Light"],
    ["dark", "Тёмное", "Dark"],
  ])}${group("Версия для слабовидящих", "Accessibility mode", "a11y", [
    [true, "Включена", "On"],
    [false, "Выключена", "Off"],
  ])}${group("Размер шрифта", "Text size", "fontScale", [
    [1, "Обычный", "Default"],
    [1.5, "Увеличенный", "Large"],
    [2, "Крупный", "Extra large"],
  ])}${group(
    "Цветовая схема доступной версии",
    "Accessibility colour scheme",
    "palette",
    [
      ["light", "Чёрный на белом", "Black on white"],
      ["dark", "Белый на чёрном", "White on black"],
      ["blue", "Тёмный на голубом", "Dark on blue"],
    ],
  )}${group("Изображения", "Images", "hideImages", [
    [false, "Показать", "Show"],
    [true, "Скрыть", "Hide"],
  ])}<button class="button outline" data-action="reset-settings">${tr("Сбросить настройки", "Reset settings")}</button></main>${footer()}`;
}
export function accountShell(user) {
  return `${header()}<main id="main" class="content-page"><div class="account-header"><div><h1>${tr("Личный кабинет", "My account")}</h1><p class="lead">${esc(user.firstName)} ${esc(user.lastName)}</p></div><div class="inline-actions">${user.role === "admin" ? routeLink("admin", "Обработка обращений", "Manage requests", "button") : ""}<button class="button outline" data-action="logout">${tr("Выйти", "Sign out")}</button></div></div><div class="account-sections"><section><h2>${tr("Избранные объекты", "Saved projects")}</h2><div id="account-favorites">${loading()}</div></section><section><h2>${tr("Мои обращения", "My requests")}</h2><button class="button" data-request="question">${tr("Новое обращение", "New request")}</button><div id="account-requests" class="request-list" style="margin-top:24px">${loading()}</div></section></div></main>${footer()}`;
}
export function adminShell() {
  return `${header()}<main id="main" class="content-page"><div class="account-header"><h1>${tr("Обработка обращений", "Manage requests")}</h1>${routeLink("account", "В личный кабинет", "My account", "button outline")}</div><div class="filters"><label class="field"><span>${tr("Статус", "Status")}</span><select id="admin-status"><option value="">${tr("Все обращения", "All requests")}</option><option value="new">${tr("Новое", "New")}</option><option value="processing">${tr("В работе", "In progress")}</option><option value="done">${tr("Завершено", "Completed")}</option></select></label></div><div id="admin-requests" class="request-list">${loading()}</div></main>${footer()}`;
}
export function notFound() {
  return `${header()}<main id="main" class="error-page"><strong>404</strong><h1>${tr("Страница не найдена", "Page not found")}</h1><p>${tr("Возможно, ссылка изменилась. Вернитесь на главную.", "The link may have changed. Return to the home page.")}</p>${routeLink("", "На главную", "Home", "button")}</main>${footer()}`;
}
