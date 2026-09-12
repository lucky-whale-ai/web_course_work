import belarusian from "./translations-be.js";

export const languages = [
  { code: "ru", name: "Русский", locale: "ru-RU" },
  { code: "be", name: "Беларуская", locale: "be-BY" },
  { code: "en", name: "English", locale: "en-GB" },
];
const normalize = (text) =>
  String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
const dictionary = new Map(
  Object.entries(belarusian).map(([ru, be]) => [normalize(ru), be]),
);
export const hasBelarusian = (text) => dictionary.has(normalize(text));
export const toBelarusian = (text) => dictionary.get(normalize(text)) ?? text;
export const languageInfo = (code) =>
  languages.find((language) => language.code === code) || languages[0];
export const nextLanguage = (code) =>
  languages[
    (languages.findIndex((language) => language.code === code) + 1) %
      languages.length
  ];
export function translate(ru, en, language, be) {
  if (language === "be") return be ?? toBelarusian(ru);
  return language === "en" ? (en ?? ru) : ru;
}
export function localizedText(record, key = "title", language = "ru") {
  if (language === "be")
    return record[`${key}Be`] || toBelarusian(record[key]) || "";
  return record[language === "en" ? `${key}En` : key] || record[key] || "";
}
