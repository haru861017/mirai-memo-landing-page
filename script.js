const WAITLIST_API_ENDPOINT = "/api/waitlist";
const WAITLIST_STORAGE_KEY = "mirai-memo-waitlist";
const SUCCESS_MESSAGE = "登録ありがとうございます。未来メモのリリース情報をお届けします。";
const FORMSPREE_ENDPOINT_PATTERN = /^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i;

const submittingForms = new WeakSet();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getStoredWaitlist() {
  try {
    return JSON.parse(localStorage.getItem(WAITLIST_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveWaitlistLocally(entry) {
  const list = getStoredWaitlist();
  const normalizedEmail = entry.email.toLowerCase();
  const nextList = list.filter((item) => item.email.toLowerCase() !== normalizedEmail);
  nextList.push(entry);
  localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(nextList));
}

function isLocalPreview() {
  return ["file:", "http:"].includes(window.location.protocol)
    && ["", "localhost", "127.0.0.1"].includes(window.location.hostname);
}

function getFormspreeEndpoint() {
  return String(window.MIRAI_MEMO_FORMSPREE_ENDPOINT || "").trim();
}

function shouldUseWaitlistApi() {
  return window.MIRAI_MEMO_WAITLIST_USE_API === true;
}

function getWaitlistDestination() {
  const formspreeEndpoint = getFormspreeEndpoint();

  if (FORMSPREE_ENDPOINT_PATTERN.test(formspreeEndpoint)) {
    return { type: "formspree", endpoint: formspreeEndpoint };
  }

  if (shouldUseWaitlistApi()) {
    return { type: "api", endpoint: WAITLIST_API_ENDPOINT };
  }

  return { type: "localStorage" };
}

async function postWaitlistJson(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Waitlist submission returned ${response.status}`);
  }

  return response;
}

async function submitWaitlist(email, source) {
  const payload = {
    email,
    source,
    app: "未来メモ",
    _subject: "未来メモ 先行登録",
    message: "未来メモのリリース情報を希望します。",
    createdAt: new Date().toISOString(),
  };
  const destination = getWaitlistDestination();

  if (destination.type === "localStorage") {
    saveWaitlistLocally(payload);
    return { savedTo: "localStorage" };
  }

  try {
    await postWaitlistJson(destination.endpoint, payload);
    return { savedTo: destination.type };
  } catch {
    saveWaitlistLocally(payload);
    return { savedTo: "localStorage" };
  }
}

function setMessage(form, message, type) {
  const messageNode = form.querySelector(".form-message");
  messageNode.textContent = message;
  messageNode.classList.toggle("is-error", type === "error");
  messageNode.classList.toggle("is-success", type === "success");
}

function setSubmitting(form, isSubmitting) {
  const button = form.querySelector('button[type="submit"]');
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent;
  }

  button.disabled = isSubmitting;
  button.textContent = isSubmitting ? "送信中..." : button.dataset.defaultText;
}

function setupFormspreeActions() {
  const endpoint = getFormspreeEndpoint();
  if (!FORMSPREE_ENDPOINT_PATTERN.test(endpoint)) return;

  document.querySelectorAll(".waitlist-form").forEach((form) => {
    form.action = endpoint;
    form.method = "POST";
  });
}

function setupWaitlistForms() {
  document.querySelectorAll(".waitlist-form").forEach((form) => {
    const input = form.querySelector('input[name="email"]');

    input.addEventListener("input", () => {
      input.classList.remove("is-invalid");
      setMessage(form, "", "");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (submittingForms.has(form)) {
        return;
      }

      const email = input.value.trim();
      const source = form.dataset.source || "unknown";

      if (!email) {
        input.classList.add("is-invalid");
        setMessage(form, "メールアドレスを入力してください。", "error");
        input.focus();
        return;
      }

      if (!isValidEmail(email)) {
        input.classList.add("is-invalid");
        setMessage(form, "正しいメールアドレス形式で入力してください。", "error");
        input.focus();
        return;
      }

      submittingForms.add(form);
      setSubmitting(form, true);
      setMessage(form, "登録処理中です。", "");

      await submitWaitlist(email, source);

      setMessage(form, SUCCESS_MESSAGE, "success");
      setSubmitting(form, false);
      submittingForms.delete(form);
    });
  });
}

function setupFocusButtons() {
  document.querySelectorAll("[data-focus-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(button.dataset.focusTarget);
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => target.focus(), 450);
    });
  });
}

setupFormspreeActions();
setupWaitlistForms();
setupFocusButtons();
