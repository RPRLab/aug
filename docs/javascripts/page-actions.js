(function () {
  "use strict";

  function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        if (!document.execCommand("copy")) {
          throw new Error("Clipboard copy was rejected");
        }
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        textarea.remove();
      }
    });
  }

  function currentPageUrl() {
    return window.location.href.split("#")[0];
  }

  function fallbackPageText(root) {
    var article = document.querySelector(".md-content__inner");
    if (!article) return document.title + "\n\n" + currentPageUrl();

    var copy = article.cloneNode(true);
    var actions = copy.querySelector("[data-page-actions]");
    if (actions) actions.remove();
    return copy.innerText.trim();
  }

  function announce(root, message) {
    var status = root.querySelector("[data-page-actions-status]");
    if (!status) return;
    status.textContent = "";
    window.setTimeout(function () {
      status.textContent = message;
    }, 10);
  }

  function temporaryLabel(element, selector, message) {
    var label = element.querySelector(selector);
    if (!label) return;
    var original = label.textContent;
    label.textContent = message;
    window.setTimeout(function () {
      label.textContent = original;
    }, 1600);
  }

  function initializePageActions(root) {
    if (root.dataset.pageActionsReady === "true") return;
    root.dataset.pageActionsReady = "true";

    var sourceUrl = root.dataset.sourceUrl;
    var siteIndexUrl = root.dataset.siteIndexUrl;
    var copyPage = root.querySelector("[data-copy-page]");
    var copyLink = root.querySelector("[data-copy-page-link]");
    var toggle = root.querySelector("[data-page-actions-toggle]");
    var menu = root.querySelector("[data-page-actions-menu]");
    var claude = root.querySelector('[data-ai-link="claude"]');
    var chatgpt = root.querySelector('[data-ai-link="chatgpt"]');
    var prompt = [
      "Use this complete documentation index for broader context: " + siteIndexUrl,
      "Then read the current documentation page: " + sourceUrl,
      "Answer questions using the wider documentation context, while prioritizing the current page."
    ].join("\n\n");

    if (claude) {
      claude.href = "https://claude.ai/new?q=" + encodeURIComponent(prompt);
    }
    if (chatgpt) {
      chatgpt.href = "https://chatgpt.com/?q=" + encodeURIComponent(prompt);
    }

    function closeMenu(returnFocus) {
      if (!menu || !toggle || menu.hidden) return;
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      if (returnFocus) toggle.focus();
    }

    function openMenu() {
      if (!menu || !toggle) return;
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
    }

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        if (menu.hidden) openMenu();
        else closeMenu(false);
      });

      toggle.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowDown") return;
        event.preventDefault();
        openMenu();
        var firstItem = menu.querySelector('[role="menuitem"]');
        if (firstItem) firstItem.focus();
      });

      menu.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeMenu(true);
        }
      });

      root.addEventListener("focusout", function (event) {
        if (event.relatedTarget && !root.contains(event.relatedTarget)) {
          closeMenu(false);
        }
      });

      document.addEventListener("click", function (event) {
        if (!root.contains(event.target)) closeMenu(false);
      });
    }

    if (copyLink) {
      copyLink.addEventListener("click", function () {
        writeClipboard(currentPageUrl()).then(function () {
          temporaryLabel(copyLink, "[data-copy-link-label]", "Copied!");
          announce(root, "Page link copied to clipboard");
          closeMenu(false);
        }).catch(function () {
          announce(root, "Could not copy the page link");
        });
      });
    }

    if (copyPage) {
      copyPage.addEventListener("click", function () {
        copyPage.disabled = true;
        fetch(sourceUrl, { headers: { Accept: "text/plain" } })
          .then(function (response) {
            if (!response.ok) throw new Error("Could not load Markdown");
            return response.text();
          })
          .catch(function () {
            return fallbackPageText(root);
          })
          .then(writeClipboard)
          .then(function () {
            temporaryLabel(copyPage, "[data-copy-page-label]", "Copied!");
            announce(root, "Page copied to clipboard");
          })
          .catch(function () {
            announce(root, "Could not copy the page");
          })
          .finally(function () {
            copyPage.disabled = false;
          });
      });
    }
  }

  function initialize() {
    document.querySelectorAll("[data-page-actions]").forEach(initializePageActions);
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(initialize);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }
})();
