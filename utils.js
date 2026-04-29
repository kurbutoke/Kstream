window.KSTREAM_UTILS = (() => {
  const sanitizeText = (value = "") => {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  const normalizeInput = (value = "", max = 120) => {
    return String(value)
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, max);
  };

  const getParam = (key) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(key);
  };

  const safeNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const setText = (el, value) => {
    if (!el) return;
    el.textContent = value ?? "";
  };

  const setHTML = (el, value) => {
    if (!el) return;
    el.innerHTML = sanitizeText(value);
  };

  const debounce = (fn, wait = 250) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  };

  return {
    sanitizeText,
    normalizeInput,
    getParam,
    safeNumber,
    setText,
    setHTML,
    debounce
  };
})();

