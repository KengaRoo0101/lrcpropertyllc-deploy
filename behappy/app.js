const form = document.querySelector("#behappy-checkin");
const output = document.querySelector("#checkin-output");
const totalCheckins = document.querySelector("#total-checkins");
const currentStreak = document.querySelector("#current-streak");
const lastSaved = document.querySelector("#last-saved");
const historyList = document.querySelector("#history-list");
const resetProgress = document.querySelector("#reset-progress");
const dateInput = form.querySelector('input[name="date"]');
const sobrietyDateInput = document.querySelector("#sobriety-date");
const saveSobrietyDate = document.querySelector("#save-sobriety-date");
const soberDays = document.querySelector("#sober-days");
const soberLabel = document.querySelector("#sober-label");
const heroSoberDays = document.querySelector("#hero-sober-days");
const heroSoberLabel = document.querySelector("#hero-sober-label");
const soberQuote = document.querySelector("#sober-quote");
const plannerForm = document.querySelector("#daily-planner");
const plannerOutput = document.querySelector("#planner-output");
const meetingForm = document.querySelector("#meeting-planner");
const meetingOutput = document.querySelector("#meeting-output");
const weekSummary = document.querySelector("#week-summary");
const feelingsWheel = document.querySelector("[data-feelings-wheel]");
const spinFeelings = document.querySelector("[data-spin-feelings]");
const feelingsResult = document.querySelector("#feelings-wheel-result");
const STORAGE_KEY = "beHappyProgress.v1";
const SOBRIETY_KEY = "beHappySobrietyDate.v1";
const PLANNER_KEY = "beHappyPlanner.v1";

const soberQuotes = [
  "One day at a time. Start where you are.",
  "Keep going. Small steps still count.",
  "Clarity comes from staying with the next right step.",
  "Growth is built quietly, one honest day at a time.",
  "Moving forward is still moving, even when it's slow.",
  "Repair begins with today’s choice.",
  "A brighter future is built one steady day at a time."
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanText(value, fallback = "") {
  return String(value || fallback)
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function boolFromForm(formData, key) {
  return formData.get(key) === "on";
}

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateKey) {
  const date = new Date(`${dateKey}T12:00:00`);
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function routeToSupportReset() {
  const target = document.querySelector("#reset-support");
  if (!target) return;
  window.requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" });
  });
}

function scrollToPageTarget(target) {
  target.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" });
}

function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProgress(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    output.insertAdjacentHTML(
      "beforeend",
      '<p class="result-caution">Progress could not be saved in this browser, but today’s step is still shown above.</p>'
    );
  }
}

function calculateStreak(entries) {
  const savedDays = new Set(entries.map((entry) => entry.date));
  const latest = entries.slice().sort((a, b) => b.date.localeCompare(a.date))[0];
  let cursor = new Date(`${latest ? latest.date : todayKey()}T12:00:00`);
  let streak = 0;

  while (savedDays.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function renderList(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function getStoredJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "null");
    return parsed === null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function setStoredJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function daysSince(dateKey) {
  if (!dateKey) return null;
  const start = new Date(`${dateKey}T00:00:00`);
  const now = new Date();
  if (Number.isNaN(start.getTime()) || start > now) return null;
  const today = new Date(todayKey(now) + "T00:00:00");
  return Math.floor((today - start) / 86400000) + 1;
}

function renderSobrietyTracker() {
  const dateKey = localStorage.getItem(SOBRIETY_KEY) || "";
  if (sobrietyDateInput) sobrietyDateInput.value = dateKey;

  const count = daysSince(dateKey);
  if (count === null) {
    soberDays.textContent = "--";
    soberLabel.textContent = "Set a date to see your sober day count.";
    if (heroSoberDays) heroSoberDays.textContent = "--";
    if (heroSoberLabel) heroSoberLabel.textContent = "Set a sobriety date to keep the count visible.";
    soberQuote.textContent = soberQuotes[0];
    return;
  }

  soberDays.textContent = String(count);
  soberLabel.textContent = count === 1 ? "day sober" : "days sober";
  if (heroSoberDays) heroSoberDays.textContent = String(count);
  if (heroSoberLabel) heroSoberLabel.textContent = count === 1 ? "day sober" : "days sober";
  soberQuote.textContent = soberQuotes[count % soberQuotes.length];
}

function buildStep(payload) {
  const state = cleanText(payload.state, "Not sure yet");
  const feeling = cleanText(payload.feeling);
  const feelingPlan = getFeelingPlan(feeling);
  const focus = cleanText(payload.focus, "the next step") || "the next step";
  const helped = cleanText(payload.helped, "one thing that helped") || "one thing that helped";
  const support = cleanText(payload.support, "Small reset");
  const needsMoreStructure =
    payload.needsMoreStructure || payload.needsRoutine || payload.needsSupport || payload.needsReflection;

  const grounding = [
    "What is happening right now, in plain language?",
    feeling ? `What is "${feeling}" asking for before the day gets louder?` : "Which feeling is closest right now?",
    `What does "${focus}" need from the day?`,
    `Which support option fits this moment: ${support.toLowerCase()}?`
  ];

  const nextSteps = [
    feelingPlan.action,
    "What is one small action that can be finished today?",
    `What made "${helped}" useful enough to remember?`,
    "What would be helpful to notice again later today?"
  ];

  if (payload.needsRoutine) {
    nextSteps.push("Which routine anchor matters most right now: food, water, sleep, movement, or space?");
  }
  if (payload.needsSupport) {
    nextSteps.push("Who or what outside resource would be appropriate to contact if the day escalates?");
  }
  if (payload.needsReflection) {
    nextSteps.push("Complete one sentence: 'The pattern I notice today is...'");
  }

  return {
    packageName: needsMoreStructure ? "Expanded reflection path" : "Daily companion",
    summary: `Today feels ${state.toLowerCase()}. Be Happy. organizes the reflection around ${focus} and one manageable support question.`,
    state,
    feeling,
    feelingQuote: feelingPlan.quote,
    focus,
    helped,
    support,
    grounding,
    nextSteps,
    caution:
      "Be Happy. is informational companion support only. It's not medical advice, treatment, therapy, recovery coaching, crisis care, or emergency support."
  };
}

function renderStep(step) {
  output.innerHTML = `
    <p class="panel-label">Reflection path</p>
    <h3>${escapeHtml(step.packageName)}</h3>
    <p>${escapeHtml(step.summary)}</p>

    <div class="result-block">
      <h4>Feeling cue</h4>
      <p>${escapeHtml(step.feeling ? `Closest feeling: ${step.feeling}. ${step.feelingQuote}` : "Choose a feeling if it helps name the day.")}</p>
    </div>

    <div class="result-block">
      <h4>Grounding questions</h4>
      <ul>${renderList(step.grounding)}</ul>
    </div>

    <div class="result-block">
      <h4>Questions to consider</h4>
      <ul>${renderList(step.nextSteps)}</ul>
    </div>

    <p class="result-caution">${escapeHtml(step.caution)}</p>
  `;
}

function renderProgress() {
  const entries = loadProgress().sort((a, b) => b.date.localeCompare(a.date));
  const latest = entries[0];
  const streak = calculateStreak(entries);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const weekEntries = entries.filter((entry) => entry.date >= todayKey(sevenDaysAgo));

  totalCheckins.textContent = String(entries.length);
  currentStreak.textContent = `${streak} ${streak === 1 ? "day" : "days"}`;
  lastSaved.textContent = latest ? formatDate(latest.date) : "Not yet";

  if (weekSummary) {
    const focusList = weekEntries
      .slice(0, 4)
      .map((entry) => entry.focus)
      .filter(Boolean);
    weekSummary.innerHTML = `
      <p class="panel-label">Week review</p>
      <h3>${weekEntries.length} ${weekEntries.length === 1 ? "check-in" : "check-ins"} this week</h3>
      <p>${
        focusList.length
          ? `Recent themes: ${escapeHtml(focusList.join(", "))}.`
          : "Save check-ins to see a simple seven-day review here."
      }</p>
    `;
  }

  if (!entries.length) {
    historyList.innerHTML = '<p class="empty-state">No saved check-ins yet.</p>';
    return;
  }

  historyList.innerHTML = entries
    .slice(0, 7)
    .map(
      (entry) => `
        <article class="history-item">
          <div>
            <span>${escapeHtml(formatDate(entry.date))}</span>
            <strong>${escapeHtml(entry.state)}</strong>
          </div>
          <p>${escapeHtml(entry.focus)}</p>
          <small>Helped: ${escapeHtml(entry.helped)} • Support: ${escapeHtml(entry.support)}</small>
        </article>
      `
    )
    .join("");
}

function savePlannerEntry(payload) {
  const entries = getStoredJson(PLANNER_KEY, []);
  const dayStart = cleanText(payload.dayStart, "chosen start");
  const startFeeling = cleanText(payload.startFeeling);
  const feelingPlan = getFeelingPlan(startFeeling);
  const startLabels = {
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    overnight: "overnight or rotating schedule"
  };
  const startGuidance = {
    morning: "Use the first quiet morning moment as the anchor.",
    afternoon: "Use the first steady afternoon moment as the anchor.",
    evening: "Use the first steady evening moment as the anchor.",
    overnight: "Use the first reliable wake-up or shift-start moment as the anchor."
  };
  const entry = {
    date: todayKey(),
    dayStart,
    startFeeling,
    gratitude: cleanText(payload.gratitude),
    intention: cleanText(payload.intention),
    soberAction: cleanText(payload.soberAction),
    dayPlan: cleanText(payload.dayPlan, "").slice(0, 360),
    weekPlan: cleanText(payload.weekPlan),
    wentWell: cleanText(payload.wentWell),
    couldImprove: cleanText(payload.couldImprove),
    amends: cleanText(payload.amends),
    gratefulNight: cleanText(payload.gratefulNight),
    updatedAt: new Date().toISOString()
  };
  const remaining = entries.filter((item) => item.date !== entry.date);
  setStoredJson(PLANNER_KEY, [...remaining, entry].sort((a, b) => a.date.localeCompare(b.date)));

  plannerOutput.innerHTML = `
    Saved for today. Start-of-day anchor: ${escapeHtml(startLabels[dayStart] || dayStart)}.
    ${escapeHtml(startGuidance[dayStart] || "Use the first reliable moment you choose as the anchor.")}
    Starting feeling: ${escapeHtml(startFeeling || "not selected")}.
    ${escapeHtml(feelingPlan.action)} ${escapeHtml(feelingPlan.quote)}
    First steady action: ${escapeHtml(entry.soberAction || "one steady action")}.
    Nightly inventory can be updated before the day closes.
  `;
}

function getFeelingPlan(feeling) {
  const plans = {
    calm: {
      action: "What to do: protect the calm with one simple routine before adding more.",
      quote: "Quiet progress is still progress."
    },
    hopeful: {
      action: "What to do: write down the next small promise you can keep today.",
      quote: "Hope grows when it has somewhere practical to go."
    },
    tired: {
      action: "What to do: lower the load and choose food, water, rest, or one light reset.",
      quote: "Rest can be part of staying steady."
    },
    anxious: {
      action: "What to do: slow the pace, name one safe support, and finish one small thing.",
      quote: "You do not have to solve the whole day at once."
    },
    sad: {
      action: "What to do: keep connection close and choose one gentle action that does not require pretending.",
      quote: "A heavy day can still hold one honest step."
    },
    angry: {
      action: "What to do: pause before reacting, move your body if safe, and choose the next clean action.",
      quote: "Power is strongest when it has direction."
    },
    grateful: {
      action: "What to do: let gratitude become one useful action for yourself or someone else.",
      quote: "What you notice can become what you build."
    },
    unsure: {
      action: "What to do: choose the smallest clear anchor: breathe, drink water, text support, or write one line.",
      quote: "Unclear is not stuck; it is a place to begin."
    }
  };
  return plans[feeling] || {
    action: "What to do: choose one grounded action that fits the moment you are actually in.",
    quote: "Start where you are, then take the next honest step."
  };
}

function setFeelingSelection(input) {
  if (!input) return;
  input.checked = true;
  feelingsWheel?.querySelectorAll("label").forEach((label) => {
    label.classList.toggle("is-selected", label.contains(input));
  });
  if (feelingsResult) {
    const plan = getFeelingPlan(input.value);
    feelingsResult.innerHTML = `
      <strong>${escapeHtml(input.value)}</strong>
      <span>${escapeHtml(plan.action)}</span>
      <em>${escapeHtml(plan.quote)}</em>
    `;
  }
}

function spinFeelingsWheel() {
  if (!feelingsWheel) return;
  const inputs = [...feelingsWheel.querySelectorAll('input[name="startFeeling"]')];
  if (!inputs.length) return;
  const index = Math.floor(Math.random() * inputs.length);
  const turns = 3 + Math.floor(Math.random() * 3);
  feelingsWheel.style.transform = `rotate(${turns * 360 + index * 45}deg)`;
  window.setTimeout(() => setFeelingSelection(inputs[index]), 650);
}

function formatCalendarTimestamp(dateKey, timeValue, offsetMinutes = 0) {
  const date = new Date(`${dateKey}T${timeValue || "09:00"}:00`);
  date.setMinutes(date.getMinutes() + offsetMinutes);
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

function downloadMeetingReminder(payload) {
  const name = cleanText(payload.meetingName, "Recovery meeting") || "Recovery meeting";
  const date = cleanText(payload.meetingDate);
  const time = cleanText(payload.meetingTime, "09:00") || "09:00";
  const location = cleanText(payload.meetingLocation, "Meeting reminder");

  if (!date) {
    meetingOutput.textContent = "Choose a meeting date first.";
    return;
  }

  const uid = `behappy-${date}-${Date.now()}@lrcpropertyllc.com`;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LRC Property LLC//Be Happy//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatCalendarTimestamp(todayKey(), "09:00")}`,
    `DTSTART:${formatCalendarTimestamp(date, time)}`,
    `DTEND:${formatCalendarTimestamp(date, time, 60)}`,
    `SUMMARY:${name}`,
    `LOCATION:${location}`,
    "DESCRIPTION:Be Happy. meeting reminder. This is informational support only.",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "meeting"}-${date}.ics`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  meetingOutput.textContent = "Calendar reminder downloaded.";
}

function saveEntry(payload, step) {
  const entries = loadProgress();
  const entry = {
    date: cleanText(payload.date, todayKey()),
    state: step.state,
    sobrietyStatus: cleanText(payload.sobrietyStatus, ""),
    focus: step.focus,
    helped: step.helped,
    support: step.support,
    updatedAt: new Date().toISOString()
  };
  const remaining = entries.filter((item) => item.date !== entry.date);
  saveProgress([...remaining, entry].sort((a, b) => a.date.localeCompare(b.date)));
  renderProgress();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const payload = {
    date: formData.get("date") || todayKey(),
    state: formData.get("state"),
    feeling: formData.get("feeling"),
    sobrietyStatus: formData.get("sobrietyStatus"),
    focus: formData.get("focus"),
    helped: formData.get("helped"),
    support: formData.get("support"),
    needsRoutine: boolFromForm(formData, "needsRoutine"),
    needsSupport: boolFromForm(formData, "needsSupport"),
    needsReflection: boolFromForm(formData, "needsReflection"),
    needsMoreStructure: boolFromForm(formData, "needsMoreStructure")
  };

  const step = buildStep(payload);
  renderStep(step);
  saveEntry(payload, step);
  if (payload.sobrietyStatus === "not-sober") {
    routeToSupportReset();
  }
});

document.addEventListener("click", (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute("href"));
  if (!target) return;
  event.preventDefault();
  history.pushState(null, "", link.getAttribute("href"));
  scrollToPageTarget(target);
});

resetProgress.addEventListener("click", () => {
  const confirmed = window.confirm(
    "Reset the Be Happy. tracker saved in this browser? This only clears local progress on this device."
  );

  if (!confirmed) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
  renderProgress();
});

saveSobrietyDate.addEventListener("click", () => {
  if (!sobrietyDateInput.value) {
    localStorage.removeItem(SOBRIETY_KEY);
  } else {
    localStorage.setItem(SOBRIETY_KEY, sobrietyDateInput.value);
  }
  renderSobrietyTracker();
});

plannerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(plannerForm);
  savePlannerEntry({
    gratitude: formData.get("gratitude"),
    dayStart: formData.get("dayStart"),
    startFeeling: formData.get("startFeeling"),
    intention: formData.get("intention"),
    soberAction: formData.get("soberAction"),
    dayPlan: formData.get("dayPlan"),
    weekPlan: formData.get("weekPlan"),
    wentWell: formData.get("wentWell"),
    couldImprove: formData.get("couldImprove"),
    amends: formData.get("amends"),
    gratefulNight: formData.get("gratefulNight")
  });
});

feelingsWheel?.addEventListener("change", (event) => {
  if (event.target.matches('input[name="startFeeling"]')) {
    setFeelingSelection(event.target);
  }
});

spinFeelings?.addEventListener("click", spinFeelingsWheel);

meetingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(meetingForm);
  downloadMeetingReminder({
    meetingName: formData.get("meetingName"),
    meetingDate: formData.get("meetingDate"),
    meetingTime: formData.get("meetingTime"),
    meetingLocation: formData.get("meetingLocation")
  });
});

dateInput.value = todayKey();
renderSobrietyTracker();
renderProgress();
