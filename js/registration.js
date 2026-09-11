import {
  registrationErrors,
  validationMessages,
  generatePassword,
} from "./validation.js";
import { api } from "./api.js";
import { tr, toast } from "./ui.js";
export function setupRegistration(onSuccess, errorText) {
  const form = document.querySelector("#register-form");
  if (!form) return;
  let attempts = 0;
  const nick = form.elements.nickname,
    submit = form.querySelector("[type=submit]");
  const values = () => {
    const data = Object.fromEntries(new FormData(form));
    data.agreement = form.elements.agreement.checked;
    return data;
  };
  const refresh = () => {
    submit.disabled = Object.keys(registrationErrors(values())).length > 0;
  };
  function newNickname() {
    if (attempts >= 5) return;
    attempts++;
    nick.value = `${["builder", "engineer", "partner", "project", "profi"][attempts - 1]}_${crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0, 6)}`;
    document.querySelector("#nickname-attempts").textContent = tr(
      `Попытка ${attempts} из 5${attempts === 5 ? ". Теперь можно ввести свой никнейм." : ""}`,
      `Attempt ${attempts} of 5${attempts === 5 ? ". You can now enter your own nickname." : ""}`,
    );
    if (attempts === 5) {
      nick.readOnly = false;
      form.querySelector("[data-action=nickname]").disabled = true;
    }
    refresh();
  }
  function makePassword() {
    const p = generatePassword();
    form.elements.password.value = p;
    form.elements.confirmPassword.value = p;
    form.elements.password.type = form.elements.confirmPassword.type = "text";
    form.querySelector("[data-action=show-password]").textContent = tr(
      "Скрыть пароль",
      "Hide password",
    );
    for (const name of ["password", "confirmPassword"]) {
      form.querySelector(`[data-error="${name}"]`)?.replaceChildren();
      form.elements[name].removeAttribute("aria-invalid");
    }
    refresh();
  }
  form.addEventListener("input", (e) => {
    const name = e.target.name;
    if (name) {
      form.querySelector(`[data-error="${name}"]`)?.replaceChildren();
      e.target.removeAttribute("aria-invalid");
    }
    form.querySelector(".form-message").textContent = "";
    refresh();
  });
  form.addEventListener("focusout", (e) => {
    const code = registrationErrors(values())[e.target.name];
    const el = form.querySelector(`[data-error="${e.target.name}"]`);
    if (code && el) {
      el.textContent = tr(...validationMessages[code]);
      e.target.setAttribute("aria-invalid", "true");
    }
  });
  form.elements.confirmPassword.addEventListener("paste", (e) => {
    e.preventDefault();
    toast(tr("Повторите пароль вручную.", "Please retype the password."));
  });
  form.addEventListener("change", (e) => {
    if (e.target.name === "passwordMode") {
      const generated = e.target.value === "generated";
      form.querySelector("[data-action=generate-password]").hidden = !generated;
      form.elements.confirmPassword.closest(".field").hidden = generated;
      form.elements.confirmPassword.required = !generated;
      form.elements.password.readOnly = generated;
      if (generated) makePassword();
      else {
        form.elements.password.readOnly = false;
        form.elements.password.type = form.elements.confirmPassword.type =
          "password";
        form.elements.password.value = form.elements.confirmPassword.value = "";
        form.querySelector("[data-action=show-password]").textContent = tr(
          "Показать пароль",
          "Show password",
        );
      }
    }
    refresh();
  });
  form.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.action === "nickname") newNickname();
    if (b.dataset.action === "generate-password") makePassword();
    if (b.dataset.action === "show-password") {
      const show = form.elements.password.type === "password";
      form.elements.password.type = show ? "text" : "password";
      form.elements.confirmPassword.type = show ? "text" : "password";
      b.textContent = show
        ? tr("Скрыть пароль", "Hide password")
        : tr("Показать пароль", "Show password");
    }
  });
  const agreement = form.querySelector(".agreement-box");
  const unlock = () => {
    if (
      agreement.scrollTop + agreement.clientHeight >=
      agreement.scrollHeight - 5
    )
      form.elements.agreement.disabled = false;
  };
  agreement.addEventListener("scroll", unlock);
  requestAnimationFrame(unlock);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = values();
    if (Object.keys(registrationErrors(data)).length) return;
    submit.disabled = true;
    try {
      await api("/register", { method: "POST", body: data });
      await onSuccess();
    } catch (error) {
      form.querySelector(".form-message").textContent = errorText(error);
      refresh();
    }
  });
  newNickname();
  refresh();
}
