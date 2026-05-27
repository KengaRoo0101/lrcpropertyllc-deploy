(() => {
  const VISUAL = "/assets/lrc-suite-card.svg";
  const PRODUCTS = {
    "/formed/": {
      name: "Formed",
      title: "Turn a business idea into a structured launch plan.",
      who: "New founders and owners who need offer structure, launch checklists, and review-ready next steps.",
      helps: ["Business launch planning", "Offer drafts", "Launch checklists", "Owner approval packets"],
      steps: ["Describe the idea", "Prepare the local launch draft", "Review gaps and assumptions", "Choose preview, contact, or owner-approved checkout"],
      visual: "Business Builder mockup with launch checklist cards.",
      faq: [
        ["Does Formed file paperwork?", "No. It prepares drafts and checklists. Filing or external submission needs owner approval."],
        ["Is this legal or tax advice?", "No. It is business organization support and should be reviewed with qualified professionals when needed."],
      ],
      cta: "Prepare business draft",
      href: "/formed/#build-review",
    },
    "/offshoot/": {
      name: "Off Shoot",
      title: "Shape rough ideas before they become a larger build.",
      who: "Founders, creators, and operators with a concept, prototype, or custom path that needs a clearer lane.",
      helps: ["Idea routing", "Product test framing", "Audience fit", "One next experiment"],
      steps: ["Name the rough concept", "Pick the closest route", "Draft the first test", "Review before any external move"],
      visual: "Product lab card grid showing tests and route paths.",
      faq: [
        ["Does Off Shoot build automatically?", "No. It recommends and drafts local next steps only."],
        ["What data should I enter?", "Use plain project notes. Do not enter secrets, private account data, or sensitive customer records."],
      ],
      cta: "Find the route",
      href: "/offshoot/#route",
    },
    "/jobsai/": {
      name: "JobsAI",
      title: "Organize job searches, roles, resumes, and career next steps.",
      who: "Applicants, founders, and teams that need clearer role briefs, applicant notes, or resume direction.",
      helps: ["Role briefs", "Resume improvement suggestions", "Applicant positioning", "Hiring workflow drafts"],
      steps: ["Choose applicant or founder path", "Enter the role or resume context", "Prepare a local recommendation", "Review before outreach or posting"],
      visual: "Resume and role matching workflow mockup.",
      faq: [
        ["Does JobsAI make hiring decisions?", "No. It provides suggestions and drafts. People remain responsible for hiring decisions."],
        ["Does it guarantee a job?", "No. It can improve organization and preparation, but it cannot guarantee employment or interviews."],
      ],
      cta: "Build role brief",
      href: "/jobsai/#brief",
    },
    "/ninja/": {
      name: "Ninja",
      title: "Turn stuck work into one clear starting plan and next move.",
      who: "Owners and operators who need workflow clarity before opening another tool or taking outside action.",
      helps: ["Task organization", "Blocker summaries", "Workflow drafts", "Approval boundaries"],
      steps: ["Write the stuck point", "Prepare the local workflow draft", "Review owner, blocker, and next move", "Approve before any external action"],
      visual: "Workflow automation diagram from manual work to reviewed next step.",
      faq: [
        ["Does Ninja execute outside the browser?", "No. Public Ninja prepares drafts and stops before payments, publishing, messaging, filing, uploads, deletion, or account access."],
        ["Can Ninja help decide the next workspace?", "Yes. It can recommend the route and prepare a handoff for review."],
      ],
      cta: "Prepare workflow draft",
      href: "/ninja/",
    },
    "/socialscan/": {
      name: "SocialScan",
      title: "Review public profiles and organize a clearer online presence.",
      who: "Founders, applicants, and owners preparing for outreach, promotion, or trust review.",
      helps: ["Profile audit drafts", "Trust signals", "Public presence cleanup", "Outreach readiness"],
      steps: ["Enter public links or notes", "Prepare a local audit", "Review improvement opportunities", "Approve before outreach or publishing"],
      visual: "Social profile audit scorecard mockup.",
      faq: [
        ["Does SocialScan access private accounts?", "No. It only works from links, screenshots, or notes you choose to provide."],
        ["Does it perform background checks?", "No. It is an informational public-presence review tool."],
      ],
      cta: "Build audit plan",
      href: "/socialscan/#audit",
    },
    "/careers/": {
      name: "Careers",
      title: "Explain roles and applicant proof more clearly.",
      who: "People interested in LRC opportunities and LRC hiring workflows.",
      helps: ["Application notes", "Role clarity", "Hiring timeline context", "Applicant preparation"],
      steps: ["Review the role", "Prepare an application note", "Submit only when ready", "Wait for owner review"],
      visual: "Apply, review, interview, and start timeline.",
      faq: [
        ["Does applying guarantee an interview?", "No. Applications are reviewed, but no interview, offer, or outcome is guaranteed."],
        ["What should applicants avoid sharing?", "Do not include Social Security numbers, banking details, medical information, or other highly sensitive data."],
      ],
      cta: "Prepare application note",
      href: "/careers/#application-prep",
    },
    "/behappy/": {
      name: "Be Happy",
      title: "Track simple reflections, routines, and supportive daily next steps.",
      who: "People who want a lightweight local companion for reflection, positive habits, and support planning.",
      helps: ["Daily check-ins", "Reflection notes", "Habit visibility", "Support resource reminders"],
      steps: ["Start with today's check-in", "Save local routine notes", "Review what helped", "Use real support when needed"],
      visual: "Daily reflection card and habit progress mockup.",
      faq: [
        ["Is Be Happy medical or mental health care?", "No. It is informational companion support, not therapy, counseling, treatment, crisis care, or medical advice."],
        ["Where is tracker data stored?", "Local tracker details are stored in this browser unless a form clearly says otherwise."],
      ],
      cta: "Start a check-in",
      href: "/behappy/#checkin",
    },
    "/product-lab/": {
      name: "Product Lab",
      title: "Explore LRC prototypes and product tests without guessing the next tool.",
      who: "Users who know the category of work but need the right experiment, route, or review path.",
      helps: ["Tool comparison", "Market tests", "Prototype routing", "Safe next-action planning"],
      steps: ["Pick the kind of work", "Compare the available tool routes", "Prepare a local test draft", "Review before launch or outreach"],
      visual: "Grid of experimental product cards.",
      faq: [
        ["Are all lab tools final products?", "No. Some are prototype-mode paths and should be reviewed before external use."],
        ["Does the lab publish tests?", "No. It helps prepare starting plans and recommendations only."],
      ],
      cta: "Explore tools",
      href: "/product-lab/",
    },
  };

  const SUITE_LINKS = [
    ["Home", "/"],
    ["LRC Suite", "/suite/"],
    ["Formed", "/formed/"],
    ["Off Shoot", "/offshoot/"],
    ["JobsAI", "/jobsai/"],
    ["Ninja", "/ninja/"],
    ["SocialScan", "/socialscan/"],
    ["Careers", "/careers/"],
    ["Be Happy", "/behappy/"],
    ["Contact", "/contact/"],
  ];

  function currentProduct() {
    const path = window.location.pathname.replace(/\/index\.html$/, "/");
    return PRODUCTS[path] || null;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function addSuiteNavLinks() {
    const nav = document.querySelector(".header-links, .nav-links, .ninja-links");
    if (!nav || nav.querySelector('a[href="/suite/"], a[href="../suite/"], a[href="./suite/"]')) return;
    const link = document.createElement("a");
    link.href = "/suite/";
    link.textContent = "Suite";
    const first = nav.querySelector("a");
    if (first?.nextSibling) {
      first.insertAdjacentElement("afterend", link);
    } else {
      nav.prepend(link);
    }
  }

  function addFooterLinks() {
    const footer = document.querySelector(".site-footer");
    if (!footer || footer.querySelector("[data-lrc-suite-footer]")) return;
    const nav = document.createElement("nav");
    nav.className = "footer-links lrc-suite-footer-links";
    nav.dataset.lrcSuiteFooter = "true";
    nav.setAttribute("aria-label", "LRC suite links");
    const label = el("p", null, "LRC Suite");
    nav.append(label);
    SUITE_LINKS.slice(0, 9).forEach(([name, href]) => {
      const link = document.createElement("a");
      link.href = href;
      link.textContent = name;
      nav.append(link);
    });
    footer.append(nav);
  }

  function addHoneypots() {
    document.querySelectorAll("form").forEach((form) => {
      if (form.dataset.lrcHoneypot === "true") return;
      form.dataset.lrcHoneypot = "true";
      const label = document.createElement("label");
      label.className = "lrc-honeypot";
      label.textContent = "Leave this field blank";
      const input = document.createElement("input");
      input.name = "website";
      input.type = "text";
      input.tabIndex = -1;
      input.autocomplete = "off";
      label.append(input);
      form.prepend(label);
      form.addEventListener("submit", (event) => {
        if (!input.value) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const status = form.querySelector('[aria-live="polite"], .form-status, .lead-status');
        if (status) status.textContent = "This request was stopped before submission.";
      }, true);
    });
  }

  function renderGuide(product) {
    if (!product || document.querySelector("[data-lrc-product-guide]")) return;
    const guide = document.createElement("section");
    guide.className = "lrc-product-guide";
    guide.dataset.lrcProductGuide = "true";
    guide.setAttribute("aria-labelledby", "lrc-product-guide-title");

    const header = el("div", "section-heading");
    header.append(el("p", "eyebrow", product.name));
    const title = el("h2", null, product.title);
    title.id = "lrc-product-guide-title";
    header.append(title);
    header.append(el("p", null, "A short, review-safe overview of who this tool helps and what it prepares."));

    const grid = el("div", "lrc-guide-grid");
    const who = el("article", "lrc-guide-card");
    who.append(el("span", null, "Who it's for"));
    who.append(el("p", null, product.who));
    const helps = el("article", "lrc-guide-card");
    helps.append(el("span", null, "What it helps with"));
    const helpsList = document.createElement("ul");
    product.helps.forEach((item) => helpsList.append(el("li", null, item)));
    helps.append(helpsList);
    const how = el("article", "lrc-guide-card lrc-guide-card-wide");
    how.append(el("span", null, "How it works"));
    const stepList = document.createElement("ol");
    product.steps.forEach((item) => stepList.append(el("li", null, item)));
    how.append(stepList);
    grid.append(who, helps, how);

    const proof = el("div", "lrc-proof-panel");
    const image = document.createElement("img");
    image.src = VISUAL;
    image.loading = "lazy";
    image.alt = `${product.name} ${product.visual}`;
    const proofCopy = el("div", null);
    proofCopy.append(el("p", "eyebrow", "Visual proof"));
    proofCopy.append(el("h3", null, product.visual));
    proofCopy.append(el("p", null, "This placeholder keeps the layout visual without using third-party brand images or copyrighted assets."));
    proof.append(image, proofCopy);

    const faq = el("div", "lrc-faq-panel");
    faq.append(el("p", "eyebrow", "FAQ"));
    product.faq.forEach(([question, answer]) => {
      const item = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = question;
      item.append(summary, el("p", null, answer));
      faq.append(item);
    });

    const cta = el("div", "lrc-guide-cta");
    cta.append(el("div", null));
    cta.firstChild.append(el("p", "eyebrow", "Next step"));
    cta.firstChild.append(el("h3", null, "Run the local agent job first."));
    const link = document.createElement("a");
    link.className = "primary-button";
    link.href = product.href;
    link.textContent = product.cta;
    cta.append(link);

    guide.append(header, grid, proof, faq, cta);

    const insertionPoint = document.querySelector(".lrc-app") || document.querySelector("main > section");
    insertionPoint?.insertAdjacentElement("afterend", guide);
  }

  document.addEventListener("DOMContentLoaded", () => {
    addSuiteNavLinks();
    addFooterLinks();
    addHoneypots();
    renderGuide(currentProduct());
  });
})();
