(function () {
  "use strict";

  const portalData = window.LRCEmployeePortalData;
  if (!portalData) return;

  const openButton = document.querySelector("#open-timeclock");
  const modal = document.querySelector("#timeclock-modal");
  const closeButtons = document.querySelectorAll("[data-timeclock-close]");
  const loginForm = document.querySelector("#timeclock-login-form");
  const employeeSelect = document.querySelector("#portal-employee-select");
  const loginStatus = document.querySelector("#timeclock-login-status");
  const portalApp = document.querySelector("#employee-portal-app");
  const portalNav = document.querySelector("#employee-portal-nav");
  const portalContent = document.querySelector("#employee-portal-content");
  const portalUser = document.querySelector("#employee-portal-user");
  const portalMode = document.querySelector("#employee-portal-mode");
  const portalLogout = document.querySelector("#employee-portal-logout");

  const DEMO_PIN = "1234";
  const TIMECLOCK_STORAGE_KEY = "lrc_associate_timeclock_demo_v1";
  let activeView = "dashboard";
  let lastFocusedElement = null;

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard" },
    { id: "timeclock", label: "Timeclock" },
    { id: "messages", label: "Messages" },
    { id: "schedule", label: "Schedule" },
    { id: "my-tasks", label: "My Tasks" },
    { id: "open-tasks", label: "Open Tasks" },
    { id: "propose-task", label: "Propose Task" },
    { id: "desk", label: "Automated Desk" },
    { id: "hr", label: "HR" },
    { id: "payroll", label: "Payroll" },
    { id: "legal-docs", label: "Legal Docs" },
    { id: "onboarding", label: "Onboarding" },
    { id: "admin", label: "Admin", adminOnly: true },
    { id: "settings", label: "Settings" },
  ];

  const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function asDate(value) {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
  }

  function formatDateTime(value) {
    const date = asDate(value);
    return date ? dateTimeFormatter.format(date) : "Not scheduled";
  }

  function formatDate(value) {
    const date = asDate(value);
    return date ? dateFormatter.format(date) : "Not set";
  }

  function readable(value) {
    return String(value || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .replace(/\bEmployees\b/g, "Associates")
      .replace(/\bEmployee\b/g, "Associate");
  }

  function loadTimeclockState() {
    try {
      return {
        timecards: [],
        corrections: [],
        ...JSON.parse(localStorage.getItem(TIMECLOCK_STORAGE_KEY) || "{}"),
      };
    } catch (error) {
      console.error("Timeclock state could not be loaded", error);
      return { timecards: [], corrections: [] };
    }
  }

  function saveTimeclockState(state) {
    // TODO: Replace this localStorage write with authenticated backend timeclock endpoints.
    localStorage.setItem(TIMECLOCK_STORAGE_KEY, JSON.stringify(state));
  }

  function createLocalId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  }

  function minutesBetween(start, end = new Date().toISOString()) {
    const startDate = asDate(start);
    const endDate = asDate(end);
    if (!startDate || !endDate) return 0;
    return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
  }

  function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }

  function getEmployeeName(state, employeeId) {
    return portalData.findEmployee(state, employeeId)?.displayName || "Unassigned";
  }

  function getActor(state) {
    return portalData.getCurrentEmployee(state);
  }

  function isAdmin(actor) {
    return portalData.canAdmin(actor);
  }

  function activeEmployees(state) {
    return state.employees.filter((employee) => employee.status !== "inactive");
  }

  function employeeOptions(state, selectedId = "") {
    return activeEmployees(state)
      .map((employee) => {
        const selected = employee.id === selectedId ? " selected" : "";
        return `<option value="${employee.id}"${selected}>${escapeHtml(employee.displayName)} - ${escapeHtml(
          portalData.ROLE_LABELS[employee.role]
        )}</option>`;
      })
      .join("");
  }

  function statusPill(status) {
    return `<span class="portal-pill" data-status="${escapeHtml(status)}">${escapeHtml(readable(status))}</span>`;
  }

  function priorityPill(priority) {
    return `<span class="portal-pill portal-pill-priority" data-priority="${escapeHtml(priority)}">${escapeHtml(
      readable(priority)
    )}</span>`;
  }

  function card(title, body, meta = "") {
    return `<article class="portal-card"><div>${meta}</div><h3>${escapeHtml(title)}</h3><p>${body}</p></article>`;
  }

  function trustNote(kind = "portal") {
    const notes = {
      portal:
        "LRC Associate Portal is an internal operations and planning tool. It does not provide legal, tax, payroll, accounting, HR compliance, or workplace-law advice.",
      desk:
        "Do not submit passwords, bank credentials, private keys, medical records, or sensitive documents unless the company has provided an approved secure process.",
      payroll:
        "Payroll processing remains with the approved payroll provider. This portal only organizes links, reminders, requests, and internal checklists.",
      legal:
        "Legal Documents is a tracking and routing portal only. It does not provide legal advice, draft legal opinions, or replace approved legal review.",
      email:
        "Email delivery is mocked until a provider is connected. No real email is sent from this browser-only demo.",
    };
    return `<p class="portal-trust-note">${notes[kind]}</p>`;
  }

  function sectionHeader(eyebrow, title, body = "") {
    return `
      <div class="portal-section-header">
        <p class="eyebrow">${escapeHtml(eyebrow)}</p>
        <h3>${escapeHtml(title)}</h3>
        ${body ? `<p>${escapeHtml(body)}</p>` : ""}
      </div>
    `;
  }

  function populateLoginOptions() {
    const state = portalData.loadState();
    if (employeeSelect) employeeSelect.innerHTML = employeeOptions(state, portalData.getSessionEmployeeId());
  }

  function openPortal() {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    populateLoginOptions();
    renderShell();
    if (portalData.getSessionEmployeeId()) {
      portalContent?.focus();
    } else {
      employeeSelect?.focus();
    }
  }

  function closePortal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    lastFocusedElement?.focus?.();
  }

  function renderShell() {
    const state = portalData.loadState();
    const actor = getActor(state);
    if (!actor || actor.status === "inactive") {
      if (portalApp) portalApp.hidden = true;
      if (loginForm) loginForm.hidden = false;
      if (portalUser) portalUser.textContent = "Demo access";
      if (portalMode) portalMode.textContent = "Local portal data stays in this browser.";
      if (loginStatus) {
        loginStatus.textContent =
          actor?.status === "inactive" ? "Inactive associates do not have demo portal access." : "Demo PIN: 1234";
        loginStatus.dataset.state = actor?.status === "inactive" ? "error" : "";
      }
      return;
    }

    if (loginForm) loginForm.hidden = true;
    if (portalApp) portalApp.hidden = false;
    if (portalUser) portalUser.textContent = `${actor.displayName} - ${portalData.ROLE_LABELS[actor.role]}`;
    if (portalMode) portalMode.textContent = "Local demo until backend, auth, database, and email provider are connected.";
    renderNav(state, actor);
    renderActiveView();
  }

  function renderNav(state, actor) {
    if (!portalNav) return;
    portalNav.innerHTML = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin(actor))
      .map((item) => {
        const active = item.id === activeView ? " aria-current=\"page\"" : "";
        return `<button class="portal-nav-button" type="button" data-view="${item.id}"${active}>${escapeHtml(
          item.label
        )}</button>`;
      })
      .join("");
  }

  function renderActiveView() {
    const state = portalData.loadState();
    const actor = getActor(state);
    if (!portalContent || !actor) return;
    const views = {
      dashboard: renderDashboard,
      timeclock: renderTimeclock,
      messages: renderMessages,
      schedule: renderSchedule,
      "my-tasks": renderMyTasks,
      "open-tasks": renderOpenTasks,
      "propose-task": renderProposeTask,
      desk: renderDesk,
      hr: renderHr,
      payroll: renderPayroll,
      "legal-docs": renderLegalDocs,
      onboarding: renderOnboarding,
      admin: renderAdmin,
      settings: renderSettings,
    };
    portalContent.innerHTML = (views[activeView] || renderDashboard)(state, actor);
  }

  function renderDashboard(state, actor) {
    const admin = isAdmin(actor);
    const visibleMessages = state.messageThreads
      .filter((thread) => portalData.isMessageVisible(thread, actor))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.updatedAt).localeCompare(String(a.updatedAt)));
    const mySchedule = state.scheduleEvents.filter((event) => {
      return event.employeeIds.includes(actor.id) || (event.team && event.team === actor.team) || admin;
    });
    const myTasks = state.tasks.filter((task) => task.assignedTo === actor.id || task.claimedBy === actor.id);
    const openTasks = state.tasks.filter((task) => task.status === "open");
    const myTickets = state.deskTickets.filter((ticket) => ticket.submittedBy === actor.id);
    const myProposals = state.taskProposals.filter((proposal) => proposal.proposedBy === actor.id);
    const pendingProposals = state.taskProposals.filter((proposal) =>
      ["proposed", "under_review", "needs_revision"].includes(proposal.status)
    );
    const deskNeedsTriage = state.deskTickets.filter((ticket) => ["new", "triaged"].includes(ticket.status));
    const legalRequests = state.legalDocumentRequests.filter((request) => ["new", "reviewing"].includes(request.status));
    const overdueTasks = state.tasks.filter((task) => {
      const due = asDate(task.dueAt);
      return due && due.getTime() < Date.now() && !["completed", "cancelled"].includes(task.status);
    });
    const checklistRuns = state.checklistRuns.filter((run) => run.employeeId === actor.id || admin);

    const adminCards = `
      ${card("Pending proposed tasks", String(pendingProposals.length), statusPill("review"))}
      ${card("Unassigned/open tasks", String(openTasks.length), statusPill("open"))}
      ${card("Overdue tasks", String(overdueTasks.length), statusPill(overdueTasks.length ? "attention" : "clear"))}
      ${card("Desk tickets needing triage", String(deskNeedsTriage.length), statusPill("desk"))}
      ${card("Legal document requests", String(legalRequests.length), statusPill("legal"))}
      ${card("Upcoming onboarding/offboarding", String(checklistRuns.length), statusPill("checklist"))}
      ${card("Schedule conflicts placeholder", "Backend scheduling rules can be connected later.", statusPill("mock"))}
    `;

    const memberCards = `
      ${card("Today's schedule", mySchedule.slice(0, 3).map((event) => escapeHtml(event.title)).join("<br>") || "No events assigned.")}
      ${card("My assigned tasks", String(myTasks.length), statusPill("tasks"))}
      ${card("Open tasks available", String(openTasks.length), statusPill("claimable"))}
      ${card("My proposed tasks", myProposals.map((proposal) => `${escapeHtml(proposal.title)} - ${escapeHtml(readable(proposal.status))}`).join("<br>") || "No proposals yet.")}
      ${card("Recent messages", visibleMessages.slice(0, 3).map((thread) => escapeHtml(thread.title)).join("<br>") || "No messages.")}
      ${card("Desk tickets I submitted", myTickets.map((ticket) => `${escapeHtml(ticket.title)} - ${escapeHtml(readable(ticket.status))}`).join("<br>") || "No tickets submitted.")}
      ${card("HR/payroll reminders", "Use HR and Payroll hubs for requests and safe provider links.")}
      ${card("Legal document portal", "View approved placeholders and route document requests for review.")}
      ${card("Onboarding/offboarding", checklistRuns.map((run) => `${escapeHtml(getChecklistTemplateName(state, run.templateId))} - ${escapeHtml(readable(run.status))}`).join("<br>") || "No active checklist.")}
    `;

    return `
      ${sectionHeader("LRC Associate Portal", admin ? "Admin operating dashboard" : "Associate dashboard", "Messages, schedule, tasks, requests, email notifications, and timeclock demo records stay organized here.")}
      ${trustNote("portal")}
      <div class="portal-quick-actions">
        <button type="button" class="primary-button" data-jump-view="messages">Post or read message</button>
        <button type="button" class="secondary-button" data-jump-view="my-tasks">Open tasks</button>
        <button type="button" class="secondary-button" data-jump-view="desk">Open desk queue</button>
        <button type="button" class="secondary-button" data-jump-view="legal-docs">Legal docs</button>
        <button type="button" class="secondary-button" data-jump-view="onboarding">Start checklist</button>
      </div>
      <div class="portal-card-grid">${admin ? adminCards : memberCards}</div>
      ${
        admin
          ? `<section class="portal-panel">${sectionHeader("Latest activity", "Recent audit trail")}
              ${renderAuditList(state, 6)}
            </section>`
          : ""
      }
    `;
  }

  function renderMessages(state, actor) {
    const canPost = portalData.can(actor, "manage_messages") || portalData.can(actor, "post_team_messages");
    const threads = state.messageThreads
      .filter((thread) => portalData.isMessageVisible(thread, actor))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || String(b.updatedAt).localeCompare(String(a.updatedAt)));
    return `
      ${sectionHeader("Message board", "Announcements and team discussions", "Create calm team announcements, scoped updates, and comment threads.")}
      ${trustNote("email")}
      ${
        canPost
          ? `<form class="portal-form" data-form="message">
              <label>Title <input name="title" required placeholder="Portal update" /></label>
              <label>Body <textarea name="body" rows="3" required placeholder="Write the message for the team."></textarea></label>
              <label>Category
                <select name="category">
                  ${["announcements", "daily_ops", "schedule", "hr", "payroll", "training", "safety", "team_questions", "admin_only"].map(optionHtml).join("")}
                </select>
              </label>
              <label>Visibility
                <select name="visibility">
                  ${["all", "admin", "managers", "hr_payroll", "team", "individual"].map(optionHtml).join("")}
                </select>
              </label>
              <label>Team <input name="team" placeholder="Operations" /></label>
              <label class="portal-check"><input name="pinned" type="checkbox" /> Pin thread</label>
              <label class="portal-check"><input name="sendEmailCopy" type="checkbox" /> Create mock email copy for visible recipients</label>
              <button class="primary-button" type="submit">Create thread</button>
            </form>`
          : ""
      }
      <div class="portal-list">
        ${threads
          .map((thread) => {
            const comments = state.messageComments.filter((comment) => comment.threadId === thread.id);
            return `
              <article class="portal-item">
                <div class="portal-item-head">
                  <div>
                    <p class="portal-item-meta">${thread.pinned ? "Pinned | " : ""}${escapeHtml(readable(thread.category))} | ${escapeHtml(readable(thread.visibility))}</p>
                    <h4>${escapeHtml(thread.title)}</h4>
                  </div>
                  ${portalData.can(actor, "manage_messages") ? `<button type="button" class="secondary-button" data-action="toggle-pin" data-id="${thread.id}">${thread.pinned ? "Unpin" : "Pin"}</button>` : ""}
                </div>
                <p>${escapeHtml(thread.body)}</p>
                <div class="portal-comments">
                  ${comments.map((comment) => `<p><strong>${escapeHtml(getEmployeeName(state, comment.authorId))}:</strong> ${escapeHtml(comment.body)}</p>`).join("")}
                  <form class="portal-inline-form" data-form="comment" data-thread-id="${thread.id}">
                    <input name="body" placeholder="Add a comment" required />
                    <button type="submit" class="secondary-button">Comment</button>
                  </form>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderSchedule(state, actor) {
    const canManage = portalData.can(actor, "manage_schedule");
    const events = state.scheduleEvents
      .filter((event) => isAdmin(actor) || event.employeeIds.includes(actor.id) || event.team === actor.team)
      .sort((a, b) => String(a.startAt).localeCompare(String(b.startAt)));
    return `
      ${sectionHeader("Schedule", "Agenda and week view", "Create shifts, meetings, onboarding sessions, offboarding events, payroll deadlines, and task deadlines.")}
      ${
        canManage
          ? `<form class="portal-form" data-form="schedule">
              <label>Title <input name="title" required placeholder="Team meeting" /></label>
              <label>Type
                <select name="type">
                  ${["shift", "meeting", "training", "onboarding", "offboarding", "payroll_deadline", "hr_deadline", "task_deadline", "admin_review", "company_event"].map(optionHtml).join("")}
                </select>
              </label>
              <label>Start <input name="startAt" type="datetime-local" required /></label>
              <label>End <input name="endAt" type="datetime-local" required /></label>
              <label>Associate <select name="employeeId"><option value="">Team-wide</option>${employeeOptions(state)}</select></label>
              <label>Team <input name="team" placeholder="Operations" /></label>
              <label>Location <input name="location" placeholder="Remote or office" /></label>
              <label>Notes <textarea name="notes" rows="2" placeholder="Internal schedule notes"></textarea></label>
              <button class="primary-button" type="submit">Create event</button>
            </form>`
          : ""
      }
      <div class="portal-week-strip">${events
        .slice(0, 7)
        .map((event) => `<span>${escapeHtml(formatDateTime(event.startAt))}<strong>${escapeHtml(event.title)}</strong></span>`)
        .join("")}</div>
      <div class="portal-list">
        ${events
          .map(
            (event) => `
            <article class="portal-item">
              <div class="portal-item-head">
                <div>
                  <p class="portal-item-meta">${escapeHtml(readable(event.type))} | ${formatDateTime(event.startAt)} - ${formatDateTime(event.endAt)}</p>
                  <h4>${escapeHtml(event.title)}</h4>
                </div>
                ${statusPill(event.status)}
              </div>
              <p>${escapeHtml(event.notes || "No notes.")}</p>
              <p class="portal-item-meta">Assigned: ${event.employeeIds.map((id) => escapeHtml(getEmployeeName(state, id))).join(", ") || escapeHtml(event.team || "Team-wide")}</p>
              ${
                canManage
                  ? `<div class="portal-actions">
                      <button class="secondary-button" type="button" data-action="schedule-status" data-id="${event.id}" data-status="completed">Complete</button>
                      <button class="secondary-button danger-button" type="button" data-action="schedule-status" data-id="${event.id}" data-status="cancelled">Cancel</button>
                    </div>`
                  : ""
              }
            </article>`
          )
          .join("")}
      </div>
    `;
  }

  function renderMyTasks(state, actor) {
    const tasks = state.tasks.filter((task) => isAdmin(actor) || task.assignedTo === actor.id || task.claimedBy === actor.id);
    const canCreate = portalData.can(actor, "manage_tasks") || portalData.can(actor, "assign_team_tasks");
    return `
      ${sectionHeader("Task system", "Assigned work and review flow", "Assigned, open, proposed, checklist, and desk-generated tasks all share one local task model.")}
      ${
        canCreate
          ? `<form class="portal-form" data-form="task">
              <label>Title <input name="title" required placeholder="Assign a task" /></label>
              <label>Description <textarea name="description" rows="2"></textarea></label>
              <label>Task type
                <select name="type">
                  <option value="assigned">Assigned task</option>
                  <option value="open">Open task</option>
                </select>
              </label>
              <label>Assign to <select name="assignedTo"><option value="">Open task only</option>${employeeOptions(state)}</select></label>
              <label>Priority
                <select name="priority">${["low", "normal", "high", "urgent"].map(optionHtml).join("")}</select>
              </label>
              <label>Due <input name="dueAt" type="datetime-local" /></label>
              <button class="primary-button" type="submit">Create task</button>
            </form>`
          : ""
      }
      ${renderTaskList(state, actor, tasks, true)}
    `;
  }

  function renderOpenTasks(state, actor) {
    const openTasks = state.tasks.filter((task) => task.status === "open");
    return `
      ${sectionHeader("Open tasks", "Claimable team work", "Open tasks can be claimed by team members, then started and completed from My Tasks.")}
      ${renderTaskList(state, actor, openTasks, false)}
    `;
  }

  function renderTaskList(state, actor, tasks, includeReassign) {
    if (!tasks.length) return `<p class="portal-empty">No tasks to show.</p>`;
    return `<div class="portal-list">${tasks
      .map((task) => {
        const canUpdate = task.assignedTo === actor.id || task.claimedBy === actor.id || isAdmin(actor);
        const canReassign = includeReassign && isAdmin(actor);
        return `
          <article class="portal-item">
            <div class="portal-item-head">
              <div>
                <p class="portal-item-meta">${escapeHtml(readable(task.type))} | Due ${escapeHtml(formatDateTime(task.dueAt))}</p>
                <h4>${escapeHtml(task.title)}</h4>
              </div>
              <div>${priorityPill(task.priority)} ${statusPill(task.status)}</div>
            </div>
            <p>${escapeHtml(task.description || "No description.")}</p>
            <p class="portal-item-meta">Owner: ${escapeHtml(getEmployeeName(state, task.assignedTo || task.claimedBy))}</p>
            <div class="portal-actions">
              ${task.status === "open" && portalData.can(actor, "claim_open_tasks") ? `<button class="primary-button" type="button" data-action="claim-task" data-id="${task.id}">Claim task</button>` : ""}
              ${canUpdate && ["assigned", "claimed", "reopened"].includes(task.status) ? `<button class="secondary-button" type="button" data-action="task-status" data-id="${task.id}" data-status="in_progress">Start</button>` : ""}
              ${canUpdate && ["in_progress", "assigned", "claimed"].includes(task.status) ? `<button class="secondary-button" type="button" data-action="task-status" data-id="${task.id}" data-status="waiting_review">Submit for review</button>` : ""}
              ${isAdmin(actor) && task.status === "waiting_review" ? `<button class="secondary-button" type="button" data-action="task-status" data-id="${task.id}" data-status="completed">Mark complete</button>` : ""}
            </div>
            ${
              canReassign
                ? `<form class="portal-inline-form" data-form="reassign-task" data-task-id="${task.id}">
                    <select name="assignedTo">${employeeOptions(state, task.assignedTo)}</select>
                    <input name="reason" placeholder="Reason or note" />
                    <button type="submit" class="secondary-button">Reassign</button>
                  </form>`
                : ""
            }
          </article>
        `;
      })
      .join("")}</div>`;
  }

  function renderProposeTask(state, actor) {
    const proposals = isAdmin(actor)
      ? state.taskProposals
      : state.taskProposals.filter((proposal) => proposal.proposedBy === actor.id);
    return `
      ${sectionHeader("Propose task", "Associate ideas with admin approval", "Team members can propose useful work. Admins can accept, decline, reassign, or request revision.")}
      ${
        portalData.can(actor, "propose_tasks")
          ? `<form class="portal-form" data-form="proposal">
              <label>Title <input name="title" required placeholder="Task idea" /></label>
              <label>Description <textarea name="description" rows="2" required></textarea></label>
              <label>Business reason <textarea name="businessReason" rows="2" required></textarea></label>
              <label>Estimated time <input name="estimatedTime" placeholder="45 minutes" /></label>
              <label>Requested due date <input name="requestedDueAt" type="datetime-local" /></label>
              <button class="primary-button" type="submit">Submit proposal</button>
            </form>`
          : ""
      }
      <div class="portal-list">
        ${proposals
          .map(
            (proposal) => `
            <article class="portal-item">
              <div class="portal-item-head">
                <div>
                  <p class="portal-item-meta">Proposed by ${escapeHtml(getEmployeeName(state, proposal.proposedBy))} | ${escapeHtml(formatDateTime(proposal.requestedDueAt))}</p>
                  <h4>${escapeHtml(proposal.title)}</h4>
                </div>
                ${statusPill(proposal.status)}
              </div>
              <p>${escapeHtml(proposal.description)}</p>
              <p class="portal-item-meta">Reason: ${escapeHtml(proposal.businessReason || "Not provided.")}</p>
              ${proposal.adminDecisionReason ? `<p class="portal-item-meta">Decision note: ${escapeHtml(proposal.adminDecisionReason)}</p>` : ""}
              ${
                portalData.can(actor, "review_proposals")
                  ? `<form class="portal-inline-form" data-form="proposal-decision" data-proposal-id="${proposal.id}">
                      <select name="assignedTo">${employeeOptions(state, proposal.proposedBy)}</select>
                      <input name="reason" placeholder="Decision reason" />
                      <button class="secondary-button" name="decision" value="approve_assign" type="submit">Accept and assign</button>
                      <button class="secondary-button" name="decision" value="approve_open" type="submit">Accept as open</button>
                      <button class="secondary-button" name="decision" value="needs_revision" type="submit">Request revision</button>
                      <button class="secondary-button" name="decision" value="reassigned" type="submit">Reassign</button>
                      <button class="secondary-button danger-button" name="decision" value="declined" type="submit">Decline</button>
                    </form>`
                  : ""
              }
            </article>`
          )
          .join("")}
      </div>
    `;
  }

  function renderDesk(state, actor) {
    const admin = isAdmin(actor);
    const tickets = state.deskTickets.filter((ticket) => {
      if (admin) return true;
      if (portalData.can(actor, "view_hr_payroll_tickets")) return ["hr", "payroll", "onboarding", "offboarding"].includes(ticket.category);
      return ticket.submittedBy === actor.id || ticket.assignedTo === actor.id;
    });
    return `
      ${sectionHeader("Automated Desk", "Route associate requests, questions, corrections, and support needs into one trackable queue.")}
      ${trustNote("desk")}
      <form class="portal-form" data-form="desk-ticket">
        <label>Title <input name="title" required placeholder="What do you need help with?" /></label>
        <label>Category
          <select name="category">
            ${[
              "hr",
              "payroll",
              "timecard",
              "it_access",
              "equipment",
              "scheduling",
              "task_help",
              "safety",
              "onboarding",
              "offboarding",
              "general",
            ].map(optionHtml).join("")}
          </select>
        </label>
        <label>Priority <select name="priority">${["low", "normal", "high", "urgent"].map(optionHtml).join("")}</select></label>
        <label>Description <textarea name="description" rows="3" required></textarea></label>
        <button class="primary-button" type="submit">Submit desk ticket</button>
      </form>
      <div class="portal-list">
        ${tickets
          .map(
            (ticket) => `
            <article class="portal-item">
              <div class="portal-item-head">
                <div>
                  <p class="portal-item-meta">${escapeHtml(readable(ticket.category))} | Submitted by ${escapeHtml(getEmployeeName(state, ticket.submittedBy))}</p>
                  <h4>${escapeHtml(ticket.title)}</h4>
                </div>
                <div>${priorityPill(ticket.priority)} ${statusPill(ticket.status)}</div>
              </div>
              <p>${escapeHtml(ticket.description)}</p>
              <p class="portal-item-meta">Assigned to ${escapeHtml(getEmployeeName(state, ticket.assignedTo))}${ticket.relatedTaskId ? ` | Linked task ${escapeHtml(ticket.relatedTaskId)}` : ""}</p>
              ${
                admin
                  ? `<form class="portal-inline-form" data-form="ticket-update" data-ticket-id="${ticket.id}">
                      <select name="assignedTo">${employeeOptions(state, ticket.assignedTo)}</select>
                      <select name="priority">${["low", "normal", "high", "urgent"].map((item) => optionHtml(item, ticket.priority)).join("")}</select>
                      <select name="status">${["new", "triaged", "assigned", "waiting_on_employee", "waiting_on_admin", "resolved", "closed", "declined"].map((item) => optionHtml(item, ticket.status)).join("")}</select>
                      <button class="secondary-button" type="submit">Update ticket</button>
                      <button class="secondary-button" type="button" data-action="ticket-to-task" data-id="${ticket.id}">Convert to task</button>
                    </form>`
                  : ""
              }
            </article>`
          )
          .join("")}
      </div>
    `;
  }

  function renderHr(state, actor) {
    const profile = `
      <dl class="portal-profile">
        <div><dt>Name</dt><dd>${escapeHtml(actor.displayName)}</dd></div>
        <div><dt>Team</dt><dd>${escapeHtml(actor.team)}</dd></div>
        <div><dt>Status</dt><dd>${escapeHtml(readable(actor.status))}</dd></div>
        <div><dt>Work email</dt><dd>${escapeHtml(actor.workEmail)}</dd></div>
        <div><dt>Manager</dt><dd>${escapeHtml(getEmployeeName(state, actor.managerId))}</dd></div>
      </dl>
    `;
    const tickets = state.deskTickets.filter((ticket) => ticket.submittedBy === actor.id && ["hr", "onboarding", "offboarding"].includes(ticket.category));
    return `
      ${sectionHeader("HR", "Request center and profile summary", "Use this hub for internal HR requests, profile review, policy links, emergency contact placeholders, and ticket history.")}
      ${trustNote("portal")}
      <div class="portal-card-grid">
        ${card("Policy/doc links placeholder", "Add approved handbook, policy, and training links after backend access rules exist.")}
        ${card("Emergency contact placeholder", "Do not store sensitive emergency records in this browser demo.")}
        ${portalData.can(actor, "manage_hr_payroll") ? card("Admin/HR restricted notes", "Restricted notes are placeholder only until secure storage and server access controls exist.") : ""}
      </div>
      <section class="portal-panel">${sectionHeader("Associate profile", "Current demo profile")}${profile}</section>
      <form class="portal-form" data-form="hr-ticket">
        <label>Request title <input name="title" required placeholder="HR request" /></label>
        <label>Details <textarea name="description" rows="3" required></textarea></label>
        <button class="primary-button" type="submit">Submit HR request</button>
      </form>
      <section class="portal-panel">${sectionHeader("HR ticket history", "Your HR requests")}${renderTicketMiniList(state, tickets)}</section>
    `;
  }

  function renderPayroll(state, actor) {
    const tickets = state.deskTickets.filter((ticket) => ticket.submittedBy === actor.id && ["payroll", "timecard"].includes(ticket.category));
    return `
      ${sectionHeader("Payroll", "Payroll information hub", "Organize provider links, pay schedule reminders, questions, and timecard correction requests.")}
      ${trustNote("payroll")}
      <div class="portal-card-grid">
        ${card("Payroll provider link placeholder", "Connect only to an approved provider when ready.")}
        ${card("Pay schedule placeholder", "Add approved company pay schedule details through HR/payroll.")}
        ${card("Paystub access instructions", "Instructions can link to the approved provider. No credentials are stored here.")}
        ${card("Tax form instructions", "Use approved provider or professional support. No tax IDs are collected here.")}
        ${card("Direct deposit setup", "Do not collect bank details in this portal demo.")}
        ${card("Final pay checklist", "Offboarding includes a final payroll review reminder only.")}
      </div>
      <form class="portal-form" data-form="payroll-ticket">
        <label>Question title <input name="title" required placeholder="Payroll question" /></label>
        <label>Type
          <select name="category">
            <option value="payroll">Payroll question</option>
            <option value="timecard">Timecard correction</option>
          </select>
        </label>
        <label>Details <textarea name="description" rows="3" required></textarea></label>
        <button class="primary-button" type="submit">Submit payroll request</button>
      </form>
      <section class="portal-panel">${sectionHeader("Payroll request history", "Your payroll and timecard requests")}${renderTicketMiniList(state, tickets)}</section>
    `;
  }

  function renderLegalDocs(state, actor) {
    const admin = portalData.can(actor, "manage_legal_documents");
    const documents = state.legalDocuments.filter((documentRecord) =>
      portalData.isLegalDocumentVisible(documentRecord, actor)
    );
    const requests = state.legalDocumentRequests.filter((request) => {
      return admin || request.requestedBy === actor.id || request.relatedEmployeeId === actor.id || request.assignedTo === actor.id;
    });
    return `
      ${sectionHeader("Legal Documents", "Document library and review routing", "Track policy placeholders, agreement requests, acknowledgments, and review status without storing sensitive files in the browser.")}
      ${trustNote("legal")}
      <p class="portal-trust-note">Do not upload or paste contracts, private legal records, signatures, IDs, passwords, medical records, bank details, or confidential documents here. Use an approved secure process when LRC provides one.</p>
      <div class="portal-card-grid">
        ${card("Document placeholders", String(documents.length), statusPill("library"))}
        ${card("Open document requests", String(requests.filter((request) => !["closed", "declined"].includes(request.status)).length), statusPill("requests"))}
        ${card("Acknowledgments", String(state.legalDocuments.reduce((total, item) => total + (item.acknowledgedBy || []).length, 0)), statusPill("mock"))}
      </div>
      <form class="portal-form" data-form="legal-request">
        <label>Request title <input name="title" required placeholder="Need document or approved link" /></label>
        <label>Category
          <select name="category">
            ${["policy", "agreement", "vendor", "corporate", "employment", "training", "other"].map(optionHtml).join("")}
          </select>
        </label>
        <label>Priority <select name="priority">${["low", "normal", "high", "urgent"].map(optionHtml).join("")}</select></label>
        <label>Related associate <select name="relatedEmployeeId"><option value="">Me / not specific</option>${employeeOptions(state, actor.id)}</select></label>
        <label>Related document <select name="relatedDocumentId"><option value="">None yet</option>${documents.map((item) => `<option value="${item.id}">${escapeHtml(item.title)}</option>`).join("")}</select></label>
        <label>Request details <textarea name="description" rows="3" required placeholder="Describe the document or routing need. Do not paste sensitive document contents."></textarea></label>
        <button class="primary-button" type="submit">Submit legal document request</button>
      </form>
      ${
        admin
          ? `<form class="portal-form" data-form="legal-document">
              <label>Document title <input name="title" required placeholder="Policy or agreement placeholder" /></label>
              <label>Category
                <select name="category">
                  ${["policy", "agreement", "vendor", "corporate", "employment", "training", "other"].map(optionHtml).join("")}
                </select>
              </label>
              <label>Status
                <select name="status">
                  ${["placeholder", "draft_placeholder", "review_needed", "approved_link", "archived"].map(optionHtml).join("")}
                </select>
              </label>
              <label>Access
                <select name="access">
                  ${["all", "admin", "managers", "hr_payroll"].map(optionHtml).join("")}
                </select>
              </label>
              <label>Description <textarea name="description" rows="2" placeholder="Safe summary only, no confidential text."></textarea></label>
              <label>Storage note <input name="storageNote" placeholder="Future secure storage or approved provider link required." /></label>
              <label class="portal-check"><input name="requiresAcknowledgment" type="checkbox" /> Requires mock acknowledgment</label>
              <button class="secondary-button" type="submit">Add document placeholder</button>
            </form>`
          : ""
      }
      <section class="portal-panel">
        ${sectionHeader("Document library", "Safe placeholders and approved links")}
        <div class="portal-list">
          ${documents
            .map((documentRecord) => {
              const acknowledged = (documentRecord.acknowledgedBy || []).includes(actor.id);
              return `
                <article class="portal-item">
                  <div class="portal-item-head">
                    <div>
                      <p class="portal-item-meta">${escapeHtml(readable(documentRecord.category))} | ${escapeHtml(readable(documentRecord.access))}</p>
                      <h4>${escapeHtml(documentRecord.title)}</h4>
                    </div>
                    <div>${statusPill(documentRecord.status)}</div>
                  </div>
                  <p>${escapeHtml(documentRecord.description)}</p>
                  <p class="portal-item-meta">${escapeHtml(documentRecord.storageNote)}</p>
                  ${
                    documentRecord.requiresAcknowledgment
                      ? `<button class="secondary-button" type="button" data-action="ack-legal-doc" data-id="${documentRecord.id}" ${acknowledged ? "disabled" : ""}>${acknowledged ? "Acknowledged" : "Acknowledge placeholder"}</button>`
                      : ""
                  }
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
      <section class="portal-panel">
        ${sectionHeader("Request queue", admin ? "All legal document requests" : "My legal document requests")}
        <div class="portal-list">
          ${requests
            .map(
              (request) => `
                <article class="portal-item">
                  <div class="portal-item-head">
                    <div>
                      <p class="portal-item-meta">${escapeHtml(readable(request.category))} | Requested by ${escapeHtml(getEmployeeName(state, request.requestedBy))}</p>
                      <h4>${escapeHtml(request.title)}</h4>
                    </div>
                    <div>${priorityPill(request.priority)} ${statusPill(request.status)}</div>
                  </div>
                  <p>${escapeHtml(request.description)}</p>
                  <p class="portal-item-meta">Assigned to ${escapeHtml(getEmployeeName(state, request.assignedTo))}${request.decisionNote ? ` | Note: ${escapeHtml(request.decisionNote)}` : ""}</p>
                  ${
                    admin
                      ? `<form class="portal-inline-form" data-form="legal-request-update" data-request-id="${request.id}">
                          <select name="assignedTo">${employeeOptions(state, request.assignedTo)}</select>
                          <select name="priority">${["low", "normal", "high", "urgent"].map((item) => optionHtml(item, request.priority)).join("")}</select>
                          <select name="status">${["new", "reviewing", "approved_placeholder", "waiting_on_employee", "closed", "declined"].map((item) => optionHtml(item, request.status)).join("")}</select>
                          <input name="decisionNote" placeholder="Safe status note" />
                          <button class="secondary-button" type="submit">Update request</button>
                        </form>`
                      : ""
                  }
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderOnboarding(state, actor) {
    const admin = portalData.can(actor, "manage_checklists");
    const runs = state.checklistRuns.filter((run) => admin || run.employeeId === actor.id);
    return `
      ${sectionHeader("Onboarding and offboarding", "Checklist templates and associate runs", "Checklist tasks are local mock records until backend/auth integration exists.")}
      ${
        admin
          ? `<div class="portal-card-grid">
              <form class="portal-card portal-stack-form" data-form="start-checklist" data-template-id="template-onboarding">
                <h3>Start onboarding</h3>
                <label>Associate <select name="employeeId">${employeeOptions(state)}</select></label>
                <button class="primary-button" type="submit">Start onboarding run</button>
              </form>
              <form class="portal-card portal-stack-form" data-form="start-checklist" data-template-id="template-offboarding">
                <h3>Start offboarding</h3>
                <label>Associate <select name="employeeId">${employeeOptions(state)}</select></label>
                <p class="portal-item-meta">Access disabling is a placeholder until backend/auth integration exists.</p>
                <button class="secondary-button" type="submit">Start offboarding run</button>
              </form>
            </div>`
          : ""
      }
      <div class="portal-list">
        ${runs
          .map((run) => {
            const items = state.checklistItems.filter((item) => item.checklistRunId === run.id);
            return `
              <article class="portal-item">
                <div class="portal-item-head">
                  <div>
                    <p class="portal-item-meta">${escapeHtml(getEmployeeName(state, run.employeeId))}</p>
                    <h4>${escapeHtml(getChecklistTemplateName(state, run.templateId))}</h4>
                  </div>
                  ${statusPill(run.status)}
                </div>
                <ul class="portal-checklist">
                  ${items.map((item) => `<li>${statusPill(item.status)} <span>${escapeHtml(item.title)}</span></li>`).join("")}
                </ul>
              </article>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function renderAdmin(state, actor) {
    if (!isAdmin(actor)) return `<p class="portal-empty">Admin access is not available for this role.</p>`;
    return `
      ${sectionHeader("Admin", "Associate operations center", "Manage associates, tasks, email notifications, desk rules, and audit visibility in local demo mode.")}
      ${trustNote("email")}
      <div class="portal-card-grid">
        ${card("Associates", String(state.employees.length), statusPill("directory"))}
        ${card("Email outbox", String(state.emailNotifications.length), statusPill("sent_mock"))}
        ${card("Desk routing rules", String(state.deskAutomationRules.length), statusPill("automation"))}
        ${card("Audit events", String(state.auditLogs.length), statusPill("audit"))}
      </div>
      <section class="portal-panel">
        ${sectionHeader("Associate email center", "Directory, templates, and mock outbox")}
        <div class="portal-directory">
          ${state.employeeEmails
            .map((email) => `<p><strong>${escapeHtml(email.email)}</strong><span>${escapeHtml(readable(email.type))} | notifications ${email.receivesNotifications ? "on" : "off"}</span></p>`)
            .join("")}
        </div>
        <form class="portal-inline-form" data-form="manual-email">
          <select name="employeeId">${employeeOptions(state)}</select>
          <select name="templateKey">${state.emailTemplates.map((template) => optionHtml(template.key)).join("")}</select>
          <input name="body" placeholder="Optional safe portal note" />
          <button class="secondary-button" type="submit">Create mock notification</button>
        </form>
        <div class="portal-split">
          <div>
            <h4>Email templates</h4>
            ${state.emailTemplates.map((template) => `<p class="portal-item-meta">${escapeHtml(template.key)} | ${escapeHtml(template.subject)} | ${escapeHtml(readable(template.category))}</p>`).join("")}
          </div>
          <div>
            <h4>Outbox</h4>
            ${state.emailNotifications.slice(0, 10).map((item) => `<p class="portal-item-meta">${escapeHtml(item.subject)} to ${escapeHtml(item.toEmail)} | ${escapeHtml(readable(item.status))}</p>`).join("")}
          </div>
        </div>
      </section>
      <section class="portal-panel">
        ${sectionHeader("Cloudflare email tunnel", "Domain aliases routed through Cloudflare Email Routing", "These inbound routes are live in Cloudflare for lrcpropertyllc.com. The portal tracks route status locally; email notifications inside this demo remain mock-only.")}
        <p class="portal-trust-note">Cloudflare Email Routing forwards inbound domain mail to a verified LRC destination. This browser demo does not send real associate notifications, collect secrets, or create Cloudflare routes from the UI.</p>
        <div class="portal-list">
          ${(state.emailTunnelRoutes || [])
            .map(
              (route) => `
                <article class="portal-item">
                  <div class="portal-item-head">
                    <div>
                      <p class="portal-item-meta">${escapeHtml(route.purpose)} | ${escapeHtml(readable(route.destinationType))}</p>
                      <h4>${escapeHtml(route.address)}</h4>
                    </div>
                    <div>${statusPill(route.status)} ${statusPill(route.cloudflareStatus)}</div>
                  </div>
                  <p>${escapeHtml(route.destinationLabel)}</p>
                  <p class="portal-item-meta">${escapeHtml(route.notes)}</p>
                  <form class="portal-inline-form" data-form="email-route-update" data-route-id="${route.id}">
                    <select name="status">${["planned", "needs_destination", "ready_for_cloudflare", "active_mock", "active_live", "paused"].map((item) => optionHtml(item, route.status)).join("")}</select>
                    <select name="cloudflareStatus">${["not_connected", "dns_needed", "destination_verification_needed", "rule_needed", "worker_route_needed", "active_verified"].map((item) => optionHtml(item, route.cloudflareStatus)).join("")}</select>
                    <input name="notes" placeholder="Safe routing note" />
                    <button class="secondary-button" type="submit">Update route status</button>
                  </form>
                </article>
              `
            )
            .join("")}
        </div>
        <div class="portal-card-grid">
          ${card("DNS", "Cloudflare MX, SPF, and DKIM records are configured for lrcpropertyllc.com.")}
          ${card("Destination", "Inbound aliases forward to a verified LRC destination mailbox.")}
          ${card("Routes", "desk, hr, payroll, legal, and admin aliases are active Cloudflare rules.")}
        </div>
      </section>
      <section class="portal-panel">
        ${sectionHeader("Automation rules", "Automated Desk routing")}
        ${state.deskAutomationRules
          .map((rule) => `<p class="portal-item-meta">${escapeHtml(rule.name)} -> ${escapeHtml(readable(rule.assignToRole || rule.assignToEmployeeId))} | SLA ${rule.slaHours}h | ${rule.createTask ? "creates task" : "no task"}</p>`)
          .join("")}
      </section>
      <section class="portal-panel">${sectionHeader("Audit trail", "Latest activity")}${renderAuditList(state, 16)}</section>
    `;
  }

  function renderSettings(state, actor) {
    return `
      ${sectionHeader("Settings", "Local demo controls", "Switch demo associates, reset seeded data, and review future integration boundaries.")}
      ${trustNote("portal")}
      <div class="portal-card-grid">
        ${card("Current role", `${escapeHtml(actor.displayName)}<br>${escapeHtml(portalData.ROLE_LABELS[actor.role])}`)}
        ${card("Storage mode", "Browser localStorage only.")}
        ${card("Email mode", "Mock notification outbox only.")}
        ${card("Backend readiness", "Interfaces are grouped for future auth, database, email, payroll links, and secure document storage.")}
      </div>
      <div class="portal-actions">
        <button class="secondary-button" type="button" data-action="switch-user">Switch associate</button>
        <button class="secondary-button danger-button" type="button" data-action="reset-demo">Reset demo data</button>
      </div>
    `;
  }

  function renderTimeclock(state, actor) {
    const clock = loadTimeclockState();
    const employeeName = actor.displayName;
    const timecards = clock.timecards
      .filter((timecard) => timecard.employeeName === employeeName)
      .sort((a, b) => String(b.clockIn).localeCompare(String(a.clockIn)));
    const active = timecards.find((timecard) => !timecard.clockOut);
    const openBreak = active?.breaks?.find((entry) => !entry.end);
    const breakMinutes = active ? active.breaks.reduce((total, entry) => total + minutesBetween(entry.start, entry.end), 0) : 0;
    return `
      ${sectionHeader("Timeclock", "Local shift and break demo", "The original timeclock remains available. Current demo data is saved only in this browser until the backend is connected.")}
      <div class="timeclock-summary" aria-label="Current timeclock status">
        <div><span>Status</span><strong id="timeclock-status-label">${active ? (openBreak ? "On break" : "Clocked in") : "Off clock"}</strong></div>
        <div><span>Current shift</span><strong id="timeclock-shift-label">${active ? formatDateTime(active.clockIn) : "No active shift"}</strong></div>
        <div><span>Break time</span><strong id="timeclock-break-label">${formatDuration(breakMinutes)}</strong></div>
      </div>
      <div class="timeclock-actions" aria-label="Timeclock actions">
        <button class="primary-button" id="clock-in-button" type="button" data-action="clock-in" ${active ? "disabled" : ""}>Clock in</button>
        <button class="secondary-button" id="start-break-button" type="button" data-action="start-break" ${!active || openBreak ? "disabled" : ""}>Start break</button>
        <button class="secondary-button" id="end-break-button" type="button" data-action="end-break" ${!openBreak ? "disabled" : ""}>End break</button>
        <button class="secondary-button danger-button" id="clock-out-button" type="button" data-action="clock-out" ${!active || openBreak ? "disabled" : ""}>Clock out</button>
      </div>
      <p class="timeclock-status" id="timeclock-action-status" aria-live="polite"></p>
      <div class="timeclock-workspace">
        <section class="timeclock-list-section">
          <div class="timeclock-section-head"><p class="eyebrow">Recent timecards</p><h3>Latest activity</h3></div>
          <div class="timecard-list">${renderTimecards(timecards)}</div>
        </section>
        <section class="timeclock-list-section">
          <div class="timeclock-section-head"><p class="eyebrow">Correction requests</p><h3>Request a timecard fix</h3></div>
          <form class="correction-form" data-form="timeclock-correction">
            <label>Timecard
              <select name="timecardId" required>${timecards.map((timecard) => `<option value="${timecard.id}">${escapeHtml(formatDateTime(timecard.clockIn))}</option>`).join("")}</select>
            </label>
            <label>Correction needed
              <textarea name="correctionNote" rows="4" placeholder="Example: Forgot to end break at 12:30 PM." required></textarea>
            </label>
            <button class="primary-button" type="submit" ${timecards.length ? "" : "disabled"}>Submit correction request</button>
          </form>
          <div class="correction-list">${renderCorrections(clock.corrections.filter((item) => item.employeeName === employeeName))}</div>
        </section>
      </div>
    `;
  }

  function renderTimecards(timecards) {
    if (!timecards.length) return `<p class="empty-state">No timecards yet.</p>`;
    return timecards
      .slice(0, 6)
      .map((timecard) => {
        const breaks = timecard.breaks || [];
        const worked = Math.max(
          0,
          minutesBetween(timecard.clockIn, timecard.clockOut)
            - breaks.reduce((total, entry) => total + minutesBetween(entry.start, entry.end), 0)
        );
        return `
          <article class="timecard-item">
            <div class="timecard-row"><strong>${escapeHtml(formatDate(timecard.clockIn))}</strong><span>${timecard.clockOut ? "Completed" : "Active"}</span></div>
            <div class="timecard-row"><span>${escapeHtml(formatDateTime(timecard.clockIn))} - ${escapeHtml(timecard.clockOut ? formatDateTime(timecard.clockOut) : "Active")}</span><span>${formatDuration(worked)} worked</span></div>
            <div class="timecard-meta"><span>${breaks.length} break event${breaks.length === 1 ? "" : "s"}</span></div>
          </article>
        `;
      })
      .join("");
  }

  function renderCorrections(corrections) {
    if (!corrections.length) return `<p class="empty-state">No correction requests submitted.</p>`;
    return corrections
      .slice(0, 6)
      .map((correction) => `<article class="correction-item"><strong>Pending correction</strong><p>${escapeHtml(correction.note)}</p><span>${escapeHtml(formatDateTime(correction.requestedAt))}</span></article>`)
      .join("");
  }

  function renderTicketMiniList(state, tickets) {
    if (!tickets.length) return `<p class="portal-empty">No requests yet.</p>`;
    return tickets
      .map((ticket) => `<p class="portal-item-meta">${escapeHtml(ticket.title)} | ${escapeHtml(readable(ticket.category))} | ${escapeHtml(readable(ticket.status))}</p>`)
      .join("");
  }

  function renderAuditList(state, limit) {
    if (!state.auditLogs.length) return `<p class="portal-empty">No audit activity yet.</p>`;
    return `<div class="portal-audit-list">${state.auditLogs
      .slice(0, limit)
      .map((entry) => `<p><strong>${escapeHtml(readable(entry.action))}</strong><span>${escapeHtml(entry.summary)} | ${escapeHtml(formatDateTime(entry.createdAt))}</span></p>`)
      .join("")}</div>`;
  }

  function getChecklistTemplateName(state, templateId) {
    return state.checklistTemplates.find((template) => template.id === templateId)?.name || "Checklist";
  }

  function optionHtml(value, selectedValue = "") {
    const selected = value === selectedValue ? " selected" : "";
    return `<option value="${escapeHtml(value)}"${selected}>${escapeHtml(readable(value))}</option>`;
  }

  function formData(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function dateTimeLocalToIso(value) {
    return value ? new Date(value).toISOString() : "";
  }

  function refreshAfterAction(view = activeView) {
    activeView = view;
    renderShell();
  }

  function handleFormSubmit(event) {
    const form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();
    const state = portalData.loadState();
    const actor = getActor(state);
    if (!actor) return;
    const values = formData(form);
    const kind = form.dataset.form;

    if (kind === "message") {
      portalData.createMessageThread(actor.id, {
        ...values,
        pinned: Boolean(form.elements.pinned?.checked),
        sendEmailCopy: Boolean(form.elements.sendEmailCopy?.checked),
      });
    }
    if (kind === "comment") portalData.addMessageComment(actor.id, form.dataset.threadId, values.body);
    if (kind === "schedule") {
      portalData.createScheduleEvent(actor.id, {
        ...values,
        startAt: dateTimeLocalToIso(values.startAt),
        endAt: dateTimeLocalToIso(values.endAt),
        employeeIds: values.employeeId ? [values.employeeId] : [],
      });
    }
    if (kind === "task") {
      portalData.createTask(actor.id, {
        ...values,
        dueAt: dateTimeLocalToIso(values.dueAt),
      });
    }
    if (kind === "reassign-task") portalData.reassignTask(actor.id, form.dataset.taskId, values.assignedTo, values.reason);
    if (kind === "proposal") {
      portalData.proposeTask(actor.id, {
        ...values,
        requestedDueAt: dateTimeLocalToIso(values.requestedDueAt),
      });
    }
    if (kind === "proposal-decision") {
      const submitter = event.submitter?.value || "approve_assign";
      const proposalId = form.dataset.proposalId;
      if (submitter === "approve_assign") {
        portalData.decideProposal(actor.id, proposalId, "approved", {
          assignedTo: values.assignedTo,
          reason: values.reason,
          postOpen: false,
        });
      }
      if (submitter === "approve_open") {
        portalData.decideProposal(actor.id, proposalId, "approved", {
          reason: values.reason,
          postOpen: true,
        });
      }
      if (submitter === "declined") portalData.decideProposal(actor.id, proposalId, "declined", { reason: values.reason });
      if (submitter === "needs_revision") portalData.decideProposal(actor.id, proposalId, "needs_revision", { reason: values.reason });
      if (submitter === "reassigned") {
        portalData.decideProposal(actor.id, proposalId, "reassigned", {
          assignedTo: values.assignedTo,
          reason: values.reason,
        });
      }
    }
    if (kind === "desk-ticket") portalData.submitDeskTicket(actor.id, values);
    if (kind === "ticket-update") {
      portalData.updateDeskTicket(actor.id, form.dataset.ticketId, {
        assignedTo: values.assignedTo,
        priority: values.priority,
        status: values.status,
      });
    }
    if (kind === "hr-ticket") {
      portalData.submitDeskTicket(actor.id, {
        title: values.title,
        description: values.description,
        category: "hr",
        priority: "normal",
      });
    }
    if (kind === "payroll-ticket") {
      portalData.submitDeskTicket(actor.id, {
        title: values.title,
        description: values.description,
        category: values.category,
        priority: "normal",
      });
    }
    if (kind === "legal-request") {
      portalData.requestLegalDocument(actor.id, values);
    }
    if (kind === "legal-document") {
      portalData.createLegalDocument(actor.id, {
        ...values,
        requiresAcknowledgment: Boolean(form.elements.requiresAcknowledgment?.checked),
      });
    }
    if (kind === "legal-request-update") {
      portalData.updateLegalDocumentRequest(actor.id, form.dataset.requestId, {
        assignedTo: values.assignedTo,
        priority: values.priority,
        status: values.status,
        decisionNote: values.decisionNote,
      });
    }
    if (kind === "start-checklist") portalData.startChecklistRun(actor.id, form.dataset.templateId, values.employeeId);
    if (kind === "manual-email") {
      const editableState = portalData.loadState();
      portalData.queueNotification(
        editableState,
        values.employeeId,
        values.templateKey,
        "manual",
        "admin",
        values.body || "A portal update is available. Open LRC Associate Portal for details."
      );
      portalData.recordAudit(editableState, actor.id, "create_mock_email", "EmailNotification", values.employeeId, "Created mock associate email notification.");
      portalData.saveState(editableState);
    }
    if (kind === "email-route-update") {
      portalData.updateEmailTunnelRoute(actor.id, form.dataset.routeId, {
        status: values.status,
        cloudflareStatus: values.cloudflareStatus,
        notes: values.notes || undefined,
      });
    }
    if (kind === "timeclock-correction") submitTimeclockCorrection(actor, values);

    form.reset();
    refreshAfterAction();
  }

  function handlePortalClick(event) {
    const jump = event.target.closest("[data-jump-view]");
    if (jump) {
      activeView = jump.dataset.jumpView;
      renderShell();
      return;
    }

    const navButton = event.target.closest("[data-view]");
    if (navButton) {
      activeView = navButton.dataset.view;
      renderShell();
      return;
    }

    const action = event.target.closest("[data-action]");
    if (!action) return;
    const state = portalData.loadState();
    const actor = getActor(state);
    if (!actor) return;
    const actionName = action.dataset.action;

    if (actionName === "toggle-pin") {
      const thread = state.messageThreads.find((item) => item.id === action.dataset.id);
      portalData.setMessagePinned(actor.id, action.dataset.id, !thread?.pinned);
    }
    if (actionName === "schedule-status") portalData.updateScheduleStatus(actor.id, action.dataset.id, action.dataset.status);
    if (actionName === "claim-task") portalData.claimTask(actor.id, action.dataset.id);
    if (actionName === "task-status") portalData.updateTaskStatus(actor.id, action.dataset.id, action.dataset.status);
    if (actionName === "ticket-to-task") portalData.convertTicketToTask(actor.id, action.dataset.id);
    if (actionName === "ack-legal-doc") portalData.acknowledgeLegalDocument(actor.id, action.dataset.id);
    if (actionName === "switch-user") {
      portalData.clearSession();
      if (loginForm) loginForm.hidden = false;
      if (portalApp) portalApp.hidden = true;
      populateLoginOptions();
      return;
    }
    if (actionName === "reset-demo") {
      portalData.resetState();
      saveTimeclockState({ timecards: [], corrections: [] });
    }
    if (actionName === "clock-in") clockIn(actor);
    if (actionName === "start-break") startBreak(actor);
    if (actionName === "end-break") endBreak(actor);
    if (actionName === "clock-out") clockOut(actor);

    refreshAfterAction();
  }

  function clockIn(actor) {
    const state = loadTimeclockState();
    const existing = state.timecards.find((timecard) => timecard.employeeName === actor.displayName && !timecard.clockOut);
    if (existing) return;
    state.timecards.unshift({
      id: createLocalId("timecard"),
      employeeName: actor.displayName,
      clockIn: new Date().toISOString(),
      clockOut: "",
      breaks: [],
    });
    saveTimeclockState(state);
  }

  function startBreak(actor) {
    const state = loadTimeclockState();
    const active = state.timecards.find((timecard) => timecard.employeeName === actor.displayName && !timecard.clockOut);
    if (!active || active.breaks.find((entry) => !entry.end)) return;
    active.breaks.push({ id: createLocalId("break"), start: new Date().toISOString(), end: "" });
    saveTimeclockState(state);
  }

  function endBreak(actor) {
    const state = loadTimeclockState();
    const active = state.timecards.find((timecard) => timecard.employeeName === actor.displayName && !timecard.clockOut);
    const openBreak = active?.breaks?.find((entry) => !entry.end);
    if (!openBreak) return;
    openBreak.end = new Date().toISOString();
    saveTimeclockState(state);
  }

  function clockOut(actor) {
    const state = loadTimeclockState();
    const active = state.timecards.find((timecard) => timecard.employeeName === actor.displayName && !timecard.clockOut);
    if (!active || active.breaks.find((entry) => !entry.end)) return;
    active.clockOut = new Date().toISOString();
    saveTimeclockState(state);
  }

  function submitTimeclockCorrection(actor, values) {
    const state = loadTimeclockState();
    state.corrections.unshift({
      id: createLocalId("correction"),
      timecardId: values.timecardId,
      employeeName: actor.displayName,
      note: values.correctionNote,
      status: "pending",
      requestedAt: new Date().toISOString(),
    });
    saveTimeclockState(state);

    portalData.submitDeskTicket(actor.id, {
      title: "Timecard correction request",
      description: values.correctionNote,
      category: "timecard",
      priority: "normal",
    });
    const portalState = portalData.loadState();
    portalData.recordAudit(portalState, actor.id, "request_timecard_correction", "Timecard", values.timecardId, "Submitted timeclock correction request.");
    portalData.saveState(portalState);
  }

  openButton?.addEventListener("click", openPortal);
  closeButtons.forEach((button) => button.addEventListener("click", closePortal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("is-open")) closePortal();
  });

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = formData(loginForm);
    const state = portalData.loadState();
    const employee = portalData.findEmployee(state, values.employeeId);
    if (!employee || employee.status === "inactive") {
      if (loginStatus) {
        loginStatus.textContent = "This demo associate does not have portal access.";
        loginStatus.dataset.state = "error";
      }
      return;
    }
    if (values.employeePin !== DEMO_PIN) {
      if (loginStatus) {
        loginStatus.textContent = "Use demo PIN 1234.";
        loginStatus.dataset.state = "error";
      }
      return;
    }
    portalData.setSessionEmployeeId(employee.id);
    if (loginStatus) {
      loginStatus.textContent = "Signed in to local demo portal.";
      loginStatus.dataset.state = "success";
    }
    renderShell();
  });

  portalLogout?.addEventListener("click", () => {
    portalData.clearSession();
    renderShell();
  });

  portalNav?.addEventListener("click", handlePortalClick);
  portalContent?.addEventListener("click", handlePortalClick);
  portalContent?.addEventListener("submit", handleFormSubmit);

  populateLoginOptions();
})();
