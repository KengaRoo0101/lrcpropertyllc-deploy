const timeclockOpenButton = document.querySelector("#open-timeclock");
const timeclockModal = document.querySelector("#timeclock-modal");
const timeclockCloseButtons = document.querySelectorAll("[data-timeclock-close]");
const timeclockLoginForm = document.querySelector("#timeclock-login-form");
const timeclockLoginStatus = document.querySelector("#timeclock-login-status");
const timeclockApp = document.querySelector("#timeclock-app");
const timeclockEmployee = document.querySelector("#timeclock-employee");
const timeclockNow = document.querySelector("#timeclock-now");
const timeclockLogout = document.querySelector("#timeclock-logout");
const timeclockStatusLabel = document.querySelector("#timeclock-status-label");
const timeclockShiftLabel = document.querySelector("#timeclock-shift-label");
const timeclockBreakLabel = document.querySelector("#timeclock-break-label");
const timeclockActionStatus = document.querySelector("#timeclock-action-status");
const clockInButton = document.querySelector("#clock-in-button");
const startBreakButton = document.querySelector("#start-break-button");
const endBreakButton = document.querySelector("#end-break-button");
const clockOutButton = document.querySelector("#clock-out-button");
const timecardList = document.querySelector("#timecard-list");
const correctionForm = document.querySelector("#correction-form");
const correctionTimecard = document.querySelector("#correction-timecard");
const correctionList = document.querySelector("#correction-list");

const TIMECLOCK_STORAGE_KEY = "lrc_timeclock_demo_v1";
const TIMECLOCK_EMPLOYEE_KEY = "lrc_timeclock_employee_v1";
const DEMO_PIN = "1234";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const fullDateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

let lastFocusedElement = null;

function defaultTimeclockState() {
  return {
    timecards: [],
    corrections: [],
  };
}

function loadTimeclockState() {
  try {
    return {
      ...defaultTimeclockState(),
      ...JSON.parse(localStorage.getItem(TIMECLOCK_STORAGE_KEY) || "{}"),
    };
  } catch (error) {
    console.error("Timeclock state could not be loaded", error);
    return defaultTimeclockState();
  }
}

function saveTimeclockState(state) {
  // TODO: Replace this localStorage write with authenticated backend API endpoints
  // such as POST /api/timeclock/events and POST /api/timeclock/corrections.
  localStorage.setItem(TIMECLOCK_STORAGE_KEY, JSON.stringify(state));
}

function loadEmployee() {
  try {
    return JSON.parse(localStorage.getItem(TIMECLOCK_EMPLOYEE_KEY) || "null");
  } catch (error) {
    console.error("Timeclock employee could not be loaded", error);
    return null;
  }
}

function saveEmployee(employee) {
  // TODO: Replace this browser-only employee session with a secure server session
  // returned by a real employee authentication endpoint.
  localStorage.setItem(TIMECLOCK_EMPLOYEE_KEY, JSON.stringify(employee));
}

function clearEmployee() {
  localStorage.removeItem(TIMECLOCK_EMPLOYEE_KEY);
}

function nowIso() {
  return new Date().toISOString();
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function parseDate(value) {
  return value ? new Date(value) : null;
}

function minutesBetween(start, end = nowIso()) {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate) return 0;
  return Math.max(0, Math.round((endDate.getTime() - startDate.getTime()) / 60000));
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function formatDateTime(value) {
  const date = parseDate(value);
  return date ? fullDateTimeFormatter.format(date) : "Not recorded";
}

function formatTime(value) {
  const date = parseDate(value);
  return date ? timeFormatter.format(date) : "Not recorded";
}

function calculateBreakMinutes(timecard) {
  return (timecard.breaks || []).reduce((total, entry) => {
    return total + minutesBetween(entry.start, entry.end || nowIso());
  }, 0);
}

function calculateWorkedMinutes(timecard) {
  const grossMinutes = minutesBetween(timecard.clockIn, timecard.clockOut || nowIso());
  return Math.max(0, grossMinutes - calculateBreakMinutes(timecard));
}

function getCurrentEmployee() {
  return loadEmployee();
}

function getEmployeeTimecards(state, employee) {
  if (!employee) return [];
  return state.timecards
    .filter((timecard) => timecard.employeeName === employee.name)
    .sort((a, b) => String(b.clockIn).localeCompare(String(a.clockIn)));
}

function getActiveTimecard(state, employee) {
  return getEmployeeTimecards(state, employee).find((timecard) => !timecard.clockOut) || null;
}

function getOpenBreak(timecard) {
  return (timecard?.breaks || []).find((entry) => !entry.end) || null;
}

function setActionStatus(message, state = "") {
  if (!timeclockActionStatus) return;
  timeclockActionStatus.textContent = message;
  timeclockActionStatus.dataset.state = state;
}

function setLoginStatus(message, state = "") {
  if (!timeclockLoginStatus) return;
  timeclockLoginStatus.textContent = message;
  timeclockLoginStatus.dataset.state = state;
}

function buildEmptyState(message) {
  const empty = document.createElement("p");
  empty.className = "empty-state";
  empty.textContent = message;
  return empty;
}

function buildTimecardItem(timecard) {
  const item = document.createElement("article");
  item.className = "timecard-item";

  const topRow = document.createElement("div");
  topRow.className = "timecard-row";

  const title = document.createElement("strong");
  title.textContent = dateFormatter.format(parseDate(timecard.clockIn));

  const status = document.createElement("span");
  status.textContent = timecard.clockOut ? "Completed" : getOpenBreak(timecard) ? "On break" : "Active";

  topRow.append(title, status);

  const timeRow = document.createElement("div");
  timeRow.className = "timecard-row";

  const clockRange = document.createElement("span");
  clockRange.textContent = `${formatTime(timecard.clockIn)} - ${
    timecard.clockOut ? formatTime(timecard.clockOut) : "Active"
  }`;

  const worked = document.createElement("span");
  worked.textContent = `${formatDuration(calculateWorkedMinutes(timecard))} worked`;

  timeRow.append(clockRange, worked);

  const meta = document.createElement("div");
  meta.className = "timecard-meta";

  const breakMeta = document.createElement("span");
  breakMeta.textContent = `${formatDuration(calculateBreakMinutes(timecard))} break`;

  const eventMeta = document.createElement("span");
  eventMeta.textContent = `${(timecard.breaks || []).length} break event${
    (timecard.breaks || []).length === 1 ? "" : "s"
  }`;

  meta.append(breakMeta, eventMeta);
  item.append(topRow, timeRow, meta);
  return item;
}

function buildCorrectionItem(correction) {
  const item = document.createElement("article");
  item.className = "correction-item";

  const title = document.createElement("strong");
  title.textContent = "Pending correction";

  const requested = document.createElement("span");
  requested.textContent = `Requested ${formatDateTime(correction.requestedAt)}`;

  const note = document.createElement("p");
  note.textContent = correction.note;

  item.append(title, requested, note);
  return item;
}

function updateCorrectionOptions(timecards) {
  if (!correctionTimecard || !correctionForm) return;
  correctionTimecard.replaceChildren();

  if (!timecards.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No timecards yet";
    correctionTimecard.append(option);
    correctionForm.querySelector("button")?.setAttribute("disabled", "");
    return;
  }

  correctionForm.querySelector("button")?.removeAttribute("disabled");
  timecards.slice(0, 10).forEach((timecard) => {
    const option = document.createElement("option");
    option.value = timecard.id;
    option.textContent = `${dateFormatter.format(parseDate(timecard.clockIn))} - ${formatTime(
      timecard.clockIn
    )}`;
    correctionTimecard.append(option);
  });
}

function renderTimeclock() {
  const state = loadTimeclockState();
  const employee = getCurrentEmployee();
  const activeTimecard = getActiveTimecard(state, employee);
  const openBreak = getOpenBreak(activeTimecard);
  const employeeTimecards = getEmployeeTimecards(state, employee);
  const employeeCorrections = employee
    ? state.corrections
        .filter((correction) => correction.employeeName === employee.name)
        .sort((a, b) => String(b.requestedAt).localeCompare(String(a.requestedAt)))
    : [];

  if (timeclockNow) {
    timeclockNow.textContent = fullDateTimeFormatter.format(new Date());
  }

  if (!employee) {
    if (timeclockLoginForm) timeclockLoginForm.hidden = false;
    if (timeclockApp) timeclockApp.hidden = true;
    return;
  }

  if (timeclockLoginForm) timeclockLoginForm.hidden = true;
  if (timeclockApp) timeclockApp.hidden = false;
  if (timeclockEmployee) timeclockEmployee.textContent = `Signed in as ${employee.name}`;

  if (timeclockStatusLabel) {
    timeclockStatusLabel.textContent = !activeTimecard
      ? "Off clock"
      : openBreak
        ? "On break"
        : "Clocked in";
  }

  if (timeclockShiftLabel) {
    timeclockShiftLabel.textContent = activeTimecard
      ? `${formatDuration(calculateWorkedMinutes(activeTimecard))} worked`
      : "No active shift";
  }

  if (timeclockBreakLabel) {
    timeclockBreakLabel.textContent = activeTimecard
      ? formatDuration(calculateBreakMinutes(activeTimecard))
      : "0m";
  }

  if (clockInButton) clockInButton.disabled = Boolean(activeTimecard);
  if (startBreakButton) startBreakButton.disabled = !activeTimecard || Boolean(openBreak);
  if (endBreakButton) endBreakButton.disabled = !openBreak;
  if (clockOutButton) clockOutButton.disabled = !activeTimecard || Boolean(openBreak);

  if (timecardList) {
    timecardList.replaceChildren();
    if (!employeeTimecards.length) {
      timecardList.append(buildEmptyState("No timecards yet. Clock in to start a shift."));
    } else {
      employeeTimecards.slice(0, 6).forEach((timecard) => {
        timecardList.append(buildTimecardItem(timecard));
      });
    }
  }

  updateCorrectionOptions(employeeTimecards);

  if (correctionList) {
    correctionList.replaceChildren();
    if (!employeeCorrections.length) {
      correctionList.append(buildEmptyState("No correction requests submitted."));
    } else {
      employeeCorrections.slice(0, 4).forEach((correction) => {
        correctionList.append(buildCorrectionItem(correction));
      });
    }
  }
}

function openTimeclockModal() {
  if (!timeclockModal) return;
  lastFocusedElement = document.activeElement;
  timeclockModal.classList.add("is-open");
  timeclockModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  renderTimeclock();

  window.setTimeout(() => {
    const employee = getCurrentEmployee();
    const focusTarget = employee
      ? clockInButton || timeclockLogout
      : timeclockLoginForm?.querySelector("input");
    focusTarget?.focus();
  }, 0);
}

function closeTimeclockModal() {
  if (!timeclockModal) return;
  timeclockModal.classList.remove("is-open");
  timeclockModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lastFocusedElement?.focus?.();
}

function requireActiveEmployee() {
  const employee = getCurrentEmployee();
  if (!employee) {
    setActionStatus("Please sign in first.", "error");
  }
  return employee;
}

function updateActiveTimecard(mutator) {
  const employee = requireActiveEmployee();
  if (!employee) return;

  const state = loadTimeclockState();
  const activeTimecard = getActiveTimecard(state, employee);
  if (!activeTimecard) {
    setActionStatus("No active shift was found.", "error");
    renderTimeclock();
    return;
  }

  mutator(activeTimecard, state, employee);
  saveTimeclockState(state);
  renderTimeclock();
}

timeclockOpenButton?.addEventListener("click", openTimeclockModal);

timeclockCloseButtons.forEach((button) => {
  button.addEventListener("click", closeTimeclockModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && timeclockModal?.classList.contains("is-open")) {
    closeTimeclockModal();
  }
});

timeclockLoginForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(timeclockLoginForm);
  const employeeName = String(formData.get("employeeName") || "").trim();
  const pin = String(formData.get("employeePin") || "").trim();

  // TODO: Replace this demo PIN login with POST /api/timeclock/login and validate
  // the employee through a real backend before returning timeclock data.
  if (pin !== DEMO_PIN) {
    setLoginStatus("PIN not recognized. Use the demo PIN for now.", "error");
    return;
  }

  saveEmployee({
    name: employeeName || "LRC Employee",
    signedInAt: nowIso(),
  });

  timeclockLoginForm.reset();
  setLoginStatus("Demo PIN: 1234");
  setActionStatus("Signed in. Ready to record time.", "success");
  renderTimeclock();
});

timeclockLogout?.addEventListener("click", () => {
  clearEmployee();
  setActionStatus("");
  renderTimeclock();
  timeclockLoginForm?.querySelector("input")?.focus();
});

clockInButton?.addEventListener("click", () => {
  const employee = requireActiveEmployee();
  if (!employee) return;

  const state = loadTimeclockState();
  if (getActiveTimecard(state, employee)) {
    setActionStatus("You already have an active shift.", "error");
    renderTimeclock();
    return;
  }

  state.timecards.unshift({
    id: createId("tc"),
    employeeName: employee.name,
    clockIn: nowIso(),
    clockOut: null,
    breaks: [],
  });

  saveTimeclockState(state);
  setActionStatus("Clocked in.", "success");
  renderTimeclock();
});

startBreakButton?.addEventListener("click", () => {
  updateActiveTimecard((activeTimecard) => {
    if (getOpenBreak(activeTimecard)) {
      setActionStatus("A break is already active.", "error");
      return;
    }

    activeTimecard.breaks.push({
      start: nowIso(),
      end: null,
    });
    setActionStatus("Break started.", "success");
  });
});

endBreakButton?.addEventListener("click", () => {
  updateActiveTimecard((activeTimecard) => {
    const openBreak = getOpenBreak(activeTimecard);
    if (!openBreak) {
      setActionStatus("No active break was found.", "error");
      return;
    }

    openBreak.end = nowIso();
    setActionStatus("Break ended.", "success");
  });
});

clockOutButton?.addEventListener("click", () => {
  updateActiveTimecard((activeTimecard) => {
    if (getOpenBreak(activeTimecard)) {
      setActionStatus("End the active break before clocking out.", "error");
      return;
    }

    activeTimecard.clockOut = nowIso();
    setActionStatus("Clocked out. Timecard saved.", "success");
  });
});

correctionForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const employee = requireActiveEmployee();
  if (!employee) return;

  const formData = new FormData(correctionForm);
  const timecardId = String(formData.get("timecardId") || "");
  const note = String(formData.get("correctionNote") || "").trim();

  if (!timecardId || !note) {
    setActionStatus("Choose a timecard and describe the correction.", "error");
    return;
  }

  const state = loadTimeclockState();
  state.corrections.unshift({
    id: createId("cr"),
    employeeName: employee.name,
    timecardId,
    note,
    status: "pending",
    requestedAt: nowIso(),
  });

  saveTimeclockState(state);
  correctionForm.reset();
  setActionStatus("Correction request submitted.", "success");
  renderTimeclock();
});

window.setInterval(() => {
  if (timeclockModal?.classList.contains("is-open")) {
    renderTimeclock();
  }
}, 30000);
