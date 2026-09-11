import originalProjects from "./home-projects.js";
export const categories = [
  {
    id: "oil",
    ru: "Нефтегазовый сектор",
    en: "Oil and gas",
    short: "Нефтегаз",
    image: "sector-oil.png",
  },
  {
    id: "power",
    ru: "Электроэнергетическое строительство",
    en: "Power infrastructure",
    short: "Электроэнергетика",
    image: "sector-power.png",
  },
  {
    id: "civil",
    ru: "Гражданское строительство",
    en: "Civil construction",
    short: "Гражданское строительство",
    image: "sector-civil.png",
  },
  {
    id: "industry",
    ru: "Промышленное строительство",
    en: "Industrial construction",
    short: "Промышленное строительство",
    image: "sector-industry.png",
  },
];
export const regions = [
  ["Самарская область", "Samara region"],
  ["Ульяновская область", "Ulyanovsk region"],
  ["Пензенская область", "Penza region"],
  ["Челябинская область", "Chelyabinsk region"],
  ["Саратовская область", "Saratov region"],
  ["Волгоградская область", "Volgograd region"],
  ["Республика Башкортостан", "Republic of Bashkortostan"],
  ["Республика Татарстан", "Republic of Tatarstan"],
  ["Республика Мордовия", "Republic of Mordovia"],
  ["Краснодарский край", "Krasnodar region"],
];
export const licenses = [
  ["Лицензия МЧС", "Emergency services licence"],
  ["Никомакс", "Nikomax"],
  [
    "Свидетельство  АЦСТ-118-01890 - НГДО п. 1",
    "Welding certificate ACST-118-01890",
  ],
  ["Лицензия ФСБ", "Federal security service licence"],
  [
    "Свидетельство АЦСТ-118-01848 - СК п.1",
    "Welding certificate ACST-118-01848, part 1",
  ],
  [
    "Свидетельство АЦСТ-118-01848 - СК п.2",
    "Welding certificate ACST-118-01848, part 2",
  ],
  [
    "Свидетельство АЦСТ-118-01850 - СК п.3",
    "Welding certificate ACST-118-01850, part 3",
  ],
  ["Сертификат СМК ГОСТ", "Quality management certificate"],
  ["СРО", "Self-regulatory organisation membership"],
].map(([ru, en], i) => ({
  id: String(i + 1),
  ru,
  en,
  image: `assets/license-${[12, 13, 14, 11, 15, 15, 16, 17, 18][i]}.webp`,
  thumbnail: `assets/license-${[12, 13, 14, 11, 15, 15, 16, 17, 18][i]}-thumb.webp`,
}));
const enTitles = [
  "Boiler overhaul at the Lyubetskaya pumping station. Samara pipeline division",
  "Overhaul of maintenance facilities No. 423 and production building No. 999. Volgograd pipeline division",
  "Pipeline insulation replacement and technical modernisation",
  "Modernisation of oil metering systems at kilometres 1707 and 1917. Tuymazy division",
  "Restoration of access roads at the Lyubetskaya pumping station",
  "Restoration of checkpoint buildings. Buguruslan pipeline division",
];
const enLocations = [
  "Samara region",
  "Volgograd region",
  "Chelyabinsk region, Bashkortostan, Kurgan region",
  "Republic of Bashkortostan",
  "Samara region",
  "Samara region, Republic of Bashkortostan",
];
export const homeProjects = originalProjects.map((p, i) => ({
  ...p,
  titleEn: enTitles[i],
  locationEn: enLocations[i],
  clientEn: i === 2 || i === 3 ? "Transneft Ural" : "Transneft Volga",
  description:
    "В состав работ вошли обследование объекта, подготовка рабочей зоны, строительно-монтажные работы и контроль качества. Работы выполнялись по согласованному графику с соблюдением требований промышленной безопасности. После завершения проведены испытания и подготовлена исполнительная документация.",
  descriptionEn:
    "The project included a site survey, preparation, construction and quality inspections. Work followed an agreed schedule and industrial safety procedures. Completion included testing and delivery of as-built documentation.",
}));
export const navigation = [
  ["about", "О компании", "About us"],
  ["services", "Сферы деятельности", "Our expertise"],
  ["licenses", "Лицензии", "Licences"],
  ["projects", "Объекты", "Projects"],
  ["safety", "Охрана труда и качество", "Safety and quality"],
  ["contacts", "Контакты", "Contacts"],
];
export const agreementRU = [
  "Этот сайт является учебным проектом. Для регистрации используйте тестовые контактные данные.",
  "После регистрации вы можете сохранять объекты в избранном и направлять обращения. Администратор учебного сайта обрабатывает обращения и изменяет их статусы.",
  "Укажите корректные данные формы. Регистрация доступна пользователям от 16 лет. Не передавайте пароль другим людям.",
  "Данные используются для демонстрации функций курсовой работы. Обращения не направляются реальной строительной компании.",
  "Ознакомьтесь с текстом до конца и подтвердите согласие перед регистрацией.",
];
export const agreementEN = [
  "This website is a coursework project. Please use test contact details when registering.",
  "Registered users can save projects and submit requests. The coursework administrator reviews requests and updates their statuses.",
  "Complete the form accurately. Registration is available to users aged 16 and above. Do not share your password.",
  "Data is used to demonstrate the coursework. Requests are not forwarded to the actual construction company.",
  "Read the agreement to the end and confirm acceptance before registering.",
];
