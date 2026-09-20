(function () {
  const overlay = document.getElementById("agent-overlay");
  const panel = document.getElementById("agent-panel");
  const launch = document.getElementById("agent-launch");
  const close = document.getElementById("agent-close");
  const conversation = document.getElementById("agent-conversation");
  const starters = document.getElementById("agent-starters");
  const form = document.getElementById("agent-form");
  const input = document.getElementById("agent-input");
  const submit = document.getElementById("agent-submit");
  let history = [];
  let previousFocus = null;

  function openAgent() {
    previousFocus = document.activeElement;
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => input.focus(), 0);
  }

  function closeAgent() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    }
  }

  function keepFocusInside(event) {
    if (event.key !== "Tab" || !overlay.classList.contains("open")) return;
    const focusable = [...panel.querySelectorAll(
      "button:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex='-1'])"
    )].filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function addMessage(role, text, evidence) {
    const article = document.createElement("article");
    article.className = `agent-message ${role}`;

    const label = document.createElement("div");
    label.className = "agent-message-label";
    label.textContent = role === "user" ? "You" : "Resume agent";

    const body = document.createElement("div");
    body.className = "agent-message-body";
    body.textContent = text;

    article.append(label, body);

    if (role === "assistant" && Array.isArray(evidence) && evidence.length) {
      const evidenceWrap = document.createElement("div");
      evidenceWrap.className = "agent-evidence";
      evidenceWrap.setAttribute("aria-label", "Supporting resume evidence");

      evidence.forEach((item) => {
        const projectId = (item.projectIds || []).find((id) =>
          allProjects.some((project) => project.id === id)
        );
        const employerId = (item.employerIds || []).find((id) =>
          allEmployers.some((employer) => employer.id === id)
        );
        const chip = document.createElement(
          projectId || employerId ? "button" : "span"
        );
        chip.className = "agent-evidence-chip";
        chip.textContent =
          item.label ||
          (item.evidenceId
            ? `Evidence ${item.evidenceId}: ${item.title}`
            : `${item.sourceType || "Resume"}: ${item.title}`);

        if (projectId) {
          chip.type = "button";
          chip.title = "Open a related project";
          chip.addEventListener("click", () => {
            const project = allProjects.find((entry) => entry.id === projectId);
            if (!project) return;
            closeAgent();
            openProjectModal(project);
          });
        } else if (employerId) {
          chip.type = "button";
          chip.title = "Open a related employer";
          chip.addEventListener("click", () => {
            const employer = allEmployers.find(
              (entry) => entry.id === employerId
            );
            if (!employer) return;
            closeAgent();
            openEmployerDrawer(employer);
          });
        }

        evidenceWrap.appendChild(chip);
      });
      article.appendChild(evidenceWrap);
    }

    conversation.appendChild(article);
    conversation.scrollTop = conversation.scrollHeight;
    return article;
  }

  async function ask(question) {
    if (question.length < 3 || question.length > 600) return;
    starters.hidden = true;
    addMessage("user", question);

    const thinking = document.createElement("div");
    thinking.className = "agent-thinking";
    thinking.setAttribute("role", "status");
    thinking.textContent = "Reviewing Jason’s resume knowledge base";
    conversation.appendChild(thinking);
    conversation.scrollTop = conversation.scrollHeight;

    input.disabled = true;
    submit.disabled = true;

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to answer right now.");

      thinking.remove();
      addMessage("assistant", data.answer, data.evidence);
      history = [
        ...history,
        { role: "user", content: question },
        { role: "assistant", content: data.answer },
      ].slice(-6);
    } catch (error) {
      thinking.remove();
      addMessage(
        "assistant",
        error.message || "The resume agent could not answer just now."
      );
    } finally {
      input.disabled = false;
      submit.disabled = false;
      input.value = "";
      input.focus();
    }
  }

  launch.addEventListener("click", openAgent);
  close.addEventListener("click", closeAgent);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeAgent();
  });
  panel.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("open")) {
      closeAgent();
      return;
    }
    keepFocusInside(event);
  });

  starters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-question]");
    if (!button) return;
    input.value = button.dataset.question;
    ask(input.value.trim());
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value.trim());
  });
})();
