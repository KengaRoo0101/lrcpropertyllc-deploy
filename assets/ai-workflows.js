(function () {
  const workflows = document.querySelectorAll("[data-ai-workflow]");

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cleanText(value, fallback = "", maxLength = 280) {
    return String(value || fallback)
      .replace(/[<>]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function collectFormData(form) {
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
      data[key] = cleanText(value, "", 520);
    }
    return data;
  }

  function renderList(items) {
    return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  }

  function renderPills(items) {
    return items.map((item) => `<span class="ai-pill">${escapeHtml(item)}</span>`).join("");
  }

  function renderForwardActions({ href, action, leadInterest, leadMessage }) {
    return `
      <div class="ai-forward-block">
        <h4>Keep moving</h4>
        <p>Use the next tool first. If the route needs shaping, send the structured note so LRC can continue from the strongest product path.</p>
        <div class="ai-action-row">
          <a class="secondary-button" href="${escapeHtml(href)}">${escapeHtml(action)}</a>
          <a
            class="primary-button"
            href="#lead"
            data-lead-interest="${escapeHtml(leadInterest)}"
            data-lead-source="lrc-ai-router"
            data-lead-message="${escapeHtml(leadMessage)}"
          >Send for review</a>
        </div>
      </div>
    `;
  }

  function renderAutomationLevels({ idea, audience, need, route }) {
    return `
      <div class="ai-level-stack" aria-label="Levi automation levels">
        <article class="ai-level-card is-complete">
          <span>Level 1</span>
          <h4>Read the need</h4>
          <p>Levi frames ${escapeHtml(idea)} around ${escapeHtml(audience)}.</p>
        </article>
        <article class="ai-level-card is-complete">
          <span>Level 2</span>
          <h4>Choose the route</h4>
          <p>Best working path: ${escapeHtml(route.name)}</p>
        </article>
        <article class="ai-level-card is-complete">
          <span>Level 3</span>
          <h4>Draft the handoff</h4>
          <p>${escapeHtml(need)}</p>
        </article>
        <article class="ai-level-card is-ready">
          <span>Level 4</span>
          <h4>Open the tool</h4>
          <p>The next click opens the matching workflow. Submission stays under team member control.</p>
        </article>
      </div>
    `;
  }

  function updateOutput(output, html) {
    if (!output) return;
    output.innerHTML = html;
    output.classList.remove("is-updated");
    void output.offsetWidth;
    output.classList.add("is-updated");
    output.scrollIntoView({ behavior: "auto", block: "center" });
  }

  const builders = {
    parent(data) {
      const idea = cleanText(data.idea, "a practical tool or service");
      const need = cleanText(data.need, "clarity, structure, and a path to launch");
      const audience = cleanText(data.audience, "who needs it");
      const path = cleanText(data.path, "Not sure yet");
      const draftType = idea.toLowerCase().includes("resume") || need.toLowerCase().includes("resume")
        ? "Resume draft"
        : idea.toLowerCase().includes("articles of organization") || need.toLowerCase().includes("articles of organization") || need.toLowerCase().includes("operating agreement")
          ? "LLC prep draft"
          : idea.toLowerCase().includes("launch") || need.toLowerCase().includes("launch page")
            ? "Launch page draft"
            : idea.toLowerCase().includes("market") || need.toLowerCase().includes("trust")
              ? "Market and trust draft"
              : "Route draft";
      const draftOutput = draftType === "Resume draft"
        ? "Levi can draft a target summary, proof bullets, skills grouping, role-fit notes, and a cover note outline."
        : draftType === "LLC prep draft"
          ? "Levi can draft organizer notes, articles of organization prep, registered agent reminders, operating agreement sections, and a filing review checklist."
          : draftType === "Launch page draft"
            ? "Levi can draft the hero, offer, sections, CTA, intake questions, FAQ, and launch checklist."
            : draftType === "Market and trust draft"
              ? "Levi can draft the audience test, public-trust cleanup notes, first offer signal, and outreach-safe next step."
              : "Levi can draft a short route brief, next-step checklist, and matching tool handoff.";
      const route = path.includes("Hiring")
        ? {
            name: "JobsAI.",
            href: "./jobsai/index.html#brief",
            action: "Open Work Match",
            next: "Build the role brief, applicant path, or profile copy before a wider hiring step."
          }
        : path.includes("Business")
          ? {
              name: "Formed.",
              href: "./formed/index.html#review",
              action: "Open Business Builder",
              next: "Shape the setup, launch page, offer, AI operations, or buildout path."
            }
          : path.includes("Market")
            ? {
                name: "Untapped.",
                href: "#untapped-markets",
                action: "Open Market Finder",
                next: "Test one audience, one gap, and one practical offer before building too much."
              }
            : path.includes("Public trust")
              ? {
                  name: "SocialScan.",
                  href: "./socialscan/index.html#audit",
                  action: "Open Trust Check",
                  next: "Review the public profile, content signal, and first impression before promotion."
                }
              : path.includes("Custom route")
                ? {
                    name: "Off Shoot.",
                    href: "./offshoot/index.html#route",
                    action: "Open Route Guide",
                    next: "Route the rough, stalled, or unusual idea into the closest useful LRC path."
                  }
                : path.includes("Conversation")
                  ? {
                      name: "LRC Conversation Clarity",
                      href: "/#paywall",
                      action: "Open Conversation Clarity",
                      next: "Review timing, gaps, shifts, and chronology without making claims the report cannot verify."
                    }
                  : path.includes("Recovery")
                    ? {
                        name: "Be Happy.",
                        href: "./behappy/index.html#checkin",
                        action: "Open Daily Support",
                        next: "Keep the next support step small, resource-first, and clearly outside medical or crisis care."
                      }
                    : {
                        name: "Off Shoot.",
                        href: "./offshoot/index.html#route",
                        action: "Open Route Guide",
                        next: "When the best path is not obvious yet, route the rough need forward instead of stopping at contact."
                      };

      return `
        <p class="panel-label">Recommended route</p>
        <h3>${escapeHtml(route.name)}</h3>
        <p>LRC would start by framing <strong>${escapeHtml(idea)}</strong> around ${escapeHtml(audience)} and the practical need: ${escapeHtml(need)}.</p>
        ${renderAutomationLevels({ idea, audience, need, route })}
        <div class="ai-output-block">
          <h4>${escapeHtml(draftType)}</h4>
          <p>${escapeHtml(draftOutput)}</p>
        </div>
        <div class="ai-output-block">
          <h4>Process</h4>
          <ol>${renderList([
            "Clarify the customer-facing problem.",
            "Choose the closest LRC tool path.",
            "Turn your idea into a short build or service brief.",
            "Move into the matching tool or route guide with the clearest next action."
          ])}</ol>
        </div>
        <div class="ai-output-block">
          <h4>Suggested next step</h4>
          <p>${escapeHtml(route.next)}</p>
          ${renderForwardActions({
            href: route.href,
            action: route.action,
            leadInterest: route.name,
            leadMessage: `AI router: ${idea}. Audience: ${audience}. Need: ${need}. Recommended route: ${route.name}.`
          })}
        </div>
      `;
    },

    formed(data) {
      const idea = cleanText(data.idea, "your business idea");
      const customer = cleanText(data.customer, "the first customer group");
      const readiness = cleanText(data.readiness, "Early idea");

      return `
        <p class="panel-label">Formed. pathway</p>
        <h3>${escapeHtml(readiness)} → productized business path</h3>
        <p>Formed. would shape <strong>${escapeHtml(idea)}</strong> around ${escapeHtml(customer)} before choosing the right paid pathway.</p>
        <div class="ai-output-block">
          <h4>What to clarify first</h4>
          <ul>${renderList([
            "What the business sells in one plain sentence.",
            "Who your first customer is and why that customer would care.",
            "What records, decisions, and owner expectations need to be captured.",
            "What public launch pieces are needed: domain, website, lead path, trust pages, and promotion.",
            "Where AI can support repeatable work without replacing judgment."
          ])}</ul>
        </div>
        <div class="ai-output-block">
          <h4>Next process</h4>
          <p>Use the review below to turn this into a Formation File, Launch Page, Revenue Motion, AI Operations, or Full Buildout plan.</p>
        </div>
        ${renderForwardActions({
          href: "./formed/index.html#review",
          action: "Open Formed. review",
          leadInterest: "Formed. pathway",
          leadMessage: `Formed workflow: ${idea}. Customer: ${customer}. Readiness: ${readiness}.`
        })}
      `;
    },

    jobsai(data) {
      const role = cleanText(data.role, "the role");
      const audience = cleanText(data.audience, "applicants");
      const buildTarget = cleanText(data.problem, "the role needs a polished applicant path");

      return `
        <p class="panel-label">Hiring workflow</p>
        <h3>${escapeHtml(role)} needs a polished applicant path.</h3>
        <p>JobsAI. would translate the hiring need into practical copy for ${escapeHtml(audience)} and shape ${escapeHtml(buildTarget)} into a review-ready work product.</p>
        <div class="ai-output-block">
          <h4>Build order</h4>
          <ol>${renderList([
            "Define the role in plain language.",
            "Draft candidate-facing listing copy.",
            "Prepare applicant intake questions.",
            "Add resume and profile support when applicants need help presenting experience."
          ])}</ol>
        </div>
        <div class="ai-output-block">
          <h4>Premium layer</h4>
          <div class="ai-pill-row">${renderPills(["Resume builder", "LinkedIn-ready profile copy", "Applicant intake", "Role scorecard"])}</div>
        </div>
        ${renderForwardActions({
          href: "./jobsai/index.html#brief",
          action: "Open JobsAI brief",
          leadInterest: "JobsAI workflow",
          leadMessage: `JobsAI workflow: ${role}. Audience: ${audience}. Build target: ${buildTarget}.`
        })}
      `;
    },

    behappy(data) {
      const moment = cleanText(data.moment, "today");
      const support = cleanText(data.support, "one steady action");
      const pressure = cleanText(data.pressure, "the pressure point");

      return `
        <p class="panel-label">Daily companion flow</p>
        <h3>One day, one move, one review.</h3>
        <p>Be Happy. would organize ${escapeHtml(moment)} around ${escapeHtml(support)} while keeping ${escapeHtml(pressure)} visible without turning it into advice.</p>
        <div class="ai-output-block">
          <h4>Prompt path</h4>
          <ul>${renderList([
            "Morning: gratitude, intention, and one useful action.",
            "Day: check pressure, support, and what is helping.",
            "Night: what went well, what could improve, amends, and gratitude.",
            "Week: review patterns without making medical or recovery claims."
          ])}</ul>
        </div>
        <p class="result-caution">Informational companion support only. Not medical advice, therapy, treatment, recovery coaching, crisis care, or emergency support.</p>
        ${renderForwardActions({
          href: "./behappy/index.html#checkin",
          action: "Open Be Happy check-in",
          leadInterest: "Be Happy workflow",
          leadMessage: `Be Happy workflow: ${moment}. Support: ${support}. Pressure: ${pressure}.`
        })}
      `;
    },

    careers(data) {
      const role = cleanText(data.role, "Executive Assistant");
      const strengths = cleanText(data.strengths, "organization, follow-up, scheduling, and communication");
      const availability = cleanText(data.availability, "available to discuss next steps");

      return `
        <p class="panel-label">Applicant prep</p>
        <h3>${escapeHtml(role)} application summary</h3>
        <p>A strong note should lead with ${escapeHtml(strengths)} and make availability clear: ${escapeHtml(availability)}.</p>
        <div class="ai-output-block">
          <h4>Application note structure</h4>
          <ol>${renderList([
            "One sentence on the support work you do best.",
            "Two concrete examples from past roles or projects.",
            "Your availability, location or remote preference, and best contact method.",
            "A short close that invites the next conversation."
          ])}</ol>
        </div>
        <p class="result-caution">Use this to prepare application copy before sending your own final note.</p>
        ${renderForwardActions({
          href: "./careers/index.html#apply",
          action: "Open application",
          leadInterest: "Careers workflow",
          leadMessage: `Careers workflow: ${role}. Strengths: ${strengths}. Availability: ${availability}.`
        })}
      `;
    }
  };

  function runWorkflowForm(form) {
    const workflow = form.closest("[data-ai-workflow]");
    if (!workflow) return false;

    const type = form.dataset.aiForm;
    const output = workflow.querySelector(`[data-ai-output="${type}"]`);
    const builder = builders[type];
    if (!builder) return false;

    updateOutput(output, builder(collectFormData(form)));
    return true;
  }

  workflows.forEach((workflow) => {
    const buttons = workflow.querySelectorAll("[data-ai-tab]");
    const panels = workflow.querySelectorAll("[data-ai-panel]");

    function activate(tabName) {
      buttons.forEach((button) => {
        const isActive = button.dataset.aiTab === tabName;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-selected", String(isActive));
      });

      panels.forEach((panel) => {
        const isActive = panel.dataset.aiPanel === tabName;
        panel.classList.toggle("is-active", isActive);
        panel.hidden = !isActive;
      });
    }

    buttons.forEach((button) => {
      button.addEventListener("click", () => activate(button.dataset.aiTab));
    });

    const firstTab = workflow.querySelector("[data-ai-tab]");
    if (firstTab) activate(firstTab.dataset.aiTab);

    workflow.querySelectorAll("[data-ai-form]").forEach((form) => {
      const setValue = (name, value) => {
        const field = form.elements[name];
        if (!field || !value) return;
        field.value = value;
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
      };

      form.querySelectorAll("[data-ai-choice]").forEach((button) => {
        button.addEventListener("click", () => {
          const group = button.closest("[data-ai-choice-group]");
          group?.querySelectorAll("[data-ai-choice]").forEach((choice) => {
            choice.classList.toggle("is-selected", choice === button);
          });

          setValue("idea", button.dataset.idea);
          setValue("audience", button.dataset.audience);
          setValue("need", button.dataset.need);
          setValue("path", button.dataset.path);
        });
      });

      form.querySelectorAll("[data-ai-quick-route]").forEach((button) => {
        button.addEventListener("click", () => {
          setValue("idea", button.dataset.idea);
          setValue("audience", button.dataset.audience);
          setValue("need", button.dataset.need);
          setValue("path", button.dataset.path);

          runWorkflowForm(form);
        });
      });

      form.addEventListener("submit", (event) => {
        event.preventDefault();
        runWorkflowForm(form);
      });

      form.querySelectorAll("button[type='submit']").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          runWorkflowForm(form);
        });
      });
    });
  });
})();
