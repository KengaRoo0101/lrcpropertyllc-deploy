(function () {
  "use strict";

  const STORE_KEY = "lrc_associate_portal_os_v1";
  const SESSION_KEY = "lrc_associate_portal_session_v1";
  const VERSION = 2;

  const ROLE_LABELS = {
    owner_admin: "Owner/Admin",
    manager: "Manager",
    hr_payroll: "HR/Payroll",
    team_member: "Team Member",
    inactive: "Inactive",
  };

  const ROLE_PERMISSIONS = {
    owner_admin: [
      "full_access",
      "manage_employees",
      "manage_messages",
      "manage_schedule",
      "manage_tasks",
      "review_proposals",
      "manage_checklists",
      "manage_hr_payroll",
      "manage_legal_documents",
      "manage_desk_rules",
      "view_audit",
      "send_email_notifications",
    ],
    manager: [
      "post_team_messages",
      "manage_schedule",
      "assign_team_tasks",
      "review_task_completion",
      "view_team_desk",
    ],
    hr_payroll: [
      "manage_checklists",
      "manage_hr_payroll",
      "view_employee_profiles",
      "send_email_notifications",
      "view_hr_payroll_tickets",
    ],
    team_member: [
      "view_dashboard",
      "claim_open_tasks",
      "propose_tasks",
      "submit_desk_tickets",
      "submit_hr_payroll_requests",
    ],
    inactive: [],
  };

  const EMAIL_TEMPLATE_SUBJECTS = {
    task_assigned: "New portal task assigned",
    task_reassigned: "Portal task assignment updated",
    task_due_soon: "Portal task reminder",
    task_completed_review: "Portal task ready for review",
    proposal_approved: "Task proposal update",
    proposal_declined: "Task proposal update",
    proposal_needs_revision: "Task proposal needs revision",
    schedule_updated: "Schedule update available",
    message_board_posted: "New portal message",
    desk_ticket_received: "Desk ticket received",
    desk_ticket_updated: "Desk ticket updated",
    onboarding_started: "Onboarding checklist update",
    onboarding_reminder: "Onboarding checklist update",
    offboarding_started: "Offboarding checklist update",
    payroll_reminder: "Payroll reminder available in portal",
    timecard_correction_received: "Timecard request received",
    legal_document_requested: "Legal document request received",
    legal_document_updated: "Legal document portal update",
  };

  const ROUTING_ROLE_BY_CATEGORY = {
    hr: "hr_payroll",
    payroll: "hr_payroll",
    timecard: "manager",
    it_access: "owner_admin",
    equipment: "manager",
    scheduling: "manager",
    task_help: "manager",
    safety: "owner_admin",
    onboarding: "hr_payroll",
    offboarding: "hr_payroll",
    general: "owner_admin",
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function createId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 9)}`;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function daysFromNow(days, hour = 9) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  }

  function seedEmployees() {
    const createdAt = daysFromNow(-4);
    return [
      {
        id: "emp-owner",
        displayName: "Owner/Admin",
        legalName: "Owner Admin Demo",
        role: "owner_admin",
        team: "Leadership",
        status: "active",
        workEmail: "owner@example.com",
        personalEmail: "owner.personal@example.com",
        phone: "",
        startDate: "2026-05-01",
        managerId: "",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "emp-manager",
        displayName: "Manager",
        legalName: "Manager Demo",
        role: "manager",
        team: "Operations",
        status: "active",
        workEmail: "manager@example.com",
        personalEmail: "",
        phone: "",
        startDate: "2026-05-06",
        managerId: "emp-owner",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "emp-hr",
        displayName: "HR/Payroll Admin",
        legalName: "HR Payroll Demo",
        role: "hr_payroll",
        team: "People",
        status: "active",
        workEmail: "hr@example.com",
        personalEmail: "",
        phone: "",
        startDate: "2026-05-06",
        managerId: "emp-owner",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "emp-alex",
        displayName: "Alex Associate",
        legalName: "Alex Associate Demo",
        role: "team_member",
        team: "Operations",
        status: "onboarding",
        workEmail: "alex.associate@example.com",
        personalEmail: "",
        phone: "",
        startDate: "2026-06-03",
        managerId: "emp-manager",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "emp-jordan",
        displayName: "Jordan Associate",
        legalName: "Jordan Associate Demo",
        role: "team_member",
        team: "Operations",
        status: "active",
        workEmail: "jordan.associate@example.com",
        personalEmail: "",
        phone: "",
        startDate: "2026-05-12",
        managerId: "emp-manager",
        createdAt,
        updatedAt: createdAt,
      },
    ];
  }

  function seedEmployeeEmails(employees) {
    const createdAt = daysFromNow(-4);
    const employeeEmails = employees.map((employee) => ({
      id: `email-${employee.id}`,
      employeeId: employee.id,
      email: employee.workEmail,
      type: "work",
      isPrimary: true,
      isVerified: true,
      receivesNotifications: employee.status !== "inactive",
      createdAt,
      updatedAt: createdAt,
    }));

    return employeeEmails.concat([
      {
        id: "email-group-all",
        employeeId: "group-all",
        email: "all@example.com",
        type: "group",
        isPrimary: false,
        isVerified: false,
        receivesNotifications: true,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "email-group-admin",
        employeeId: "group-admin",
        email: "admin@lrcpropertyllc.com",
        type: "group",
        isPrimary: false,
        isVerified: false,
        receivesNotifications: true,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "email-group-hr",
        employeeId: "group-hr",
        email: "hr@lrcpropertyllc.com",
        type: "group",
        isPrimary: false,
        isVerified: false,
        receivesNotifications: true,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "email-group-payroll",
        employeeId: "group-payroll",
        email: "payroll@lrcpropertyllc.com",
        type: "group",
        isPrimary: false,
        isVerified: false,
        receivesNotifications: true,
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "email-group-desk",
        employeeId: "group-desk",
        email: "desk@lrcpropertyllc.com",
        type: "group",
        isPrimary: false,
        isVerified: false,
        receivesNotifications: true,
        createdAt,
        updatedAt: createdAt,
      },
    ]);
  }

  function seedEmailTunnelRoutes() {
    const createdAt = daysFromNow(-1);
    return [
      {
        id: "route-desk",
        address: "desk@lrcpropertyllc.com",
        purpose: "Automated Desk intake",
        routeType: "cloudflare_email_routing",
        destinationType: "verified_destination",
        destinationLabel: "Cloudflare Email Routing forwards to the verified LRC mailbox",
        status: "active_live",
        cloudflareStatus: "active_verified",
        notes: "Live Cloudflare rule is enabled for associate support intake. Keep sensitive details inside approved secure channels.",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "route-hr",
        address: "hr@lrcpropertyllc.com",
        purpose: "HR request intake",
        routeType: "cloudflare_email_routing",
        destinationType: "verified_destination",
        destinationLabel: "Cloudflare Email Routing forwards to the verified LRC mailbox",
        status: "active_live",
        cloudflareStatus: "active_verified",
        notes: "Live Cloudflare rule is enabled for HR request intake. Keep HR details inside the portal and keep email subjects generic.",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "route-payroll",
        address: "payroll@lrcpropertyllc.com",
        purpose: "Payroll question intake",
        routeType: "cloudflare_email_routing",
        destinationType: "verified_destination",
        destinationLabel: "Cloudflare Email Routing forwards to the verified LRC mailbox",
        status: "active_live",
        cloudflareStatus: "active_verified",
        notes: "Live Cloudflare rule is enabled for payroll questions. Payroll processing stays with the approved provider.",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "route-legal",
        address: "legal@lrcpropertyllc.com",
        purpose: "Legal document routing",
        routeType: "cloudflare_email_routing",
        destinationType: "verified_destination",
        destinationLabel: "Cloudflare Email Routing forwards to the verified LRC mailbox",
        status: "active_live",
        cloudflareStatus: "active_verified",
        notes: "Live Cloudflare rule is enabled for legal document routing. It does not provide legal advice or secure document upload.",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "route-admin",
        address: "admin@lrcpropertyllc.com",
        purpose: "Owner/admin portal notices",
        routeType: "cloudflare_email_routing",
        destinationType: "verified_destination",
        destinationLabel: "Cloudflare Email Routing forwards to the verified LRC mailbox",
        status: "active_live",
        cloudflareStatus: "active_verified",
        notes: "Live Cloudflare rule is enabled for admin notices and account-level follow-up, not sensitive documents.",
        createdAt,
        updatedAt: createdAt,
      },
    ];
  }

  function seedEmailTemplates() {
    const createdAt = daysFromNow(-4);
    const categories = {
      task_assigned: "task",
      task_reassigned: "task",
      task_due_soon: "task",
      task_completed_review: "task",
      proposal_approved: "task",
      proposal_declined: "task",
      proposal_needs_revision: "task",
      schedule_updated: "schedule",
      message_board_posted: "message",
      desk_ticket_received: "desk",
      desk_ticket_updated: "desk",
      onboarding_started: "onboarding",
      onboarding_reminder: "onboarding",
      offboarding_started: "offboarding",
      payroll_reminder: "payroll",
      timecard_correction_received: "desk",
      legal_document_requested: "legal",
      legal_document_updated: "legal",
    };

    return Object.keys(EMAIL_TEMPLATE_SUBJECTS).map((key) => ({
      id: `template-${key}`,
      key,
      name: key
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" "),
      subject: EMAIL_TEMPLATE_SUBJECTS[key],
      body: "A portal update is available. Open LRC Associate Portal for details.",
      category: categories[key],
      enabled: true,
      createdAt,
      updatedAt: createdAt,
    }));
  }

  function seedMessages() {
    const createdAt = daysFromNow(-3);
    return [
      {
        id: "thread-welcome",
        title: "Welcome to the LRC Associate Portal",
        body: "This portal keeps team messages, tasks, schedule notes, requests, and timeclock demo records in one local workspace.",
        category: "announcements",
        visibility: "all",
        team: "",
        employeeIds: [],
        pinned: true,
        sendEmailCopy: true,
        authorId: "emp-owner",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "thread-updates",
        title: "Schedule and task updates now live here",
        body: "Use the dashboard for today, My Tasks for assigned work, and Open Tasks for claimable team work.",
        category: "daily_ops",
        visibility: "all",
        team: "Operations",
        employeeIds: [],
        pinned: true,
        sendEmailCopy: false,
        authorId: "emp-manager",
        createdAt: daysFromNow(-2),
        updatedAt: daysFromNow(-2),
      },
      {
        id: "thread-desk",
        title: "Use Automated Desk for requests",
        body: "Submit timecard corrections, HR questions, payroll questions, access requests, and scheduling issues through Automated Desk so each item has a status.",
        category: "training",
        visibility: "all",
        team: "",
        employeeIds: [],
        pinned: false,
        sendEmailCopy: false,
        authorId: "emp-hr",
        createdAt: daysFromNow(-1),
        updatedAt: daysFromNow(-1),
      },
    ];
  }

  function seedTasks() {
    const createdAt = daysFromNow(-2);
    return [
      {
        id: "task-assigned-demo",
        title: "Review portal launch checklist",
        description: "Confirm the associate portal sections are easy to find and note any missing demo workflow.",
        type: "assigned",
        status: "assigned",
        proposalStatus: "",
        priority: "normal",
        createdBy: "emp-manager",
        assignedTo: "emp-jordan",
        claimedBy: "",
        eligibleRoles: [],
        eligibleTeams: [],
        dueAt: daysFromNow(2, 15),
        relatedScheduleEventId: "",
        relatedDeskTicketId: "",
        relatedChecklistRunId: "",
        decisionBy: "",
        decisionReason: "",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "task-open-demo",
        title: "Prepare training-room notes",
        description: "Draft simple notes for the next LRC team training session.",
        type: "open",
        status: "open",
        proposalStatus: "",
        priority: "low",
        createdBy: "emp-manager",
        assignedTo: "",
        claimedBy: "",
        eligibleRoles: ["team_member"],
        eligibleTeams: ["Operations"],
        dueAt: daysFromNow(4, 12),
        relatedScheduleEventId: "",
        relatedDeskTicketId: "",
        relatedChecklistRunId: "",
        decisionBy: "",
        decisionReason: "",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "task-desk-demo",
        title: "Follow up on access request",
        description: "Desk-generated task for an IT/access request. Demo only.",
        type: "desk",
        status: "assigned",
        proposalStatus: "",
        priority: "high",
        createdBy: "emp-owner",
        assignedTo: "emp-owner",
        claimedBy: "",
        eligibleRoles: [],
        eligibleTeams: [],
        dueAt: daysFromNow(1, 16),
        relatedScheduleEventId: "",
        relatedDeskTicketId: "ticket-it",
        relatedChecklistRunId: "",
        decisionBy: "",
        decisionReason: "",
        createdAt,
        updatedAt: createdAt,
      },
    ];
  }

  function seedTaskProposals() {
    const createdAt = daysFromNow(-1);
    return [
      {
        id: "proposal-demo",
        proposedBy: "emp-alex",
        title: "Create a quick-start guide for new desk tickets",
        description: "A one-page guide would help team members choose the right request category.",
        businessReason: "Fewer misrouted tickets and clearer request status.",
        estimatedTime: "45 minutes",
        requestedDueAt: daysFromNow(5, 17),
        status: "proposed",
        adminDecisionBy: "",
        adminDecisionReason: "",
        convertedTaskId: "",
        createdAt,
        updatedAt: createdAt,
      },
    ];
  }

  function seedSchedule() {
    const createdAt = daysFromNow(-3);
    return [
      {
        id: "event-team-meeting",
        title: "Team meeting",
        type: "meeting",
        startAt: daysFromNow(1, 10),
        endAt: daysFromNow(1, 11),
        employeeIds: ["emp-manager", "emp-alex", "emp-jordan"],
        team: "Operations",
        location: "Portal demo room",
        remoteLink: "",
        relatedTaskId: "",
        relatedChecklistRunId: "",
        notes: "Review priorities and open tasks.",
        status: "scheduled",
        createdBy: "emp-manager",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "event-training",
        title: "Training session",
        type: "training",
        startAt: daysFromNow(2, 13),
        endAt: daysFromNow(2, 14),
        employeeIds: ["emp-alex"],
        team: "Operations",
        location: "Remote",
        remoteLink: "",
        relatedTaskId: "",
        relatedChecklistRunId: "run-alex-onboarding",
        notes: "First-week portal workflow training.",
        status: "scheduled",
        createdBy: "emp-manager",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "event-onboarding",
        title: "Onboarding session",
        type: "onboarding",
        startAt: daysFromNow(3, 9),
        endAt: daysFromNow(3, 10),
        employeeIds: ["emp-alex"],
        team: "Operations",
        location: "LRC Portal",
        remoteLink: "",
        relatedTaskId: "",
        relatedChecklistRunId: "run-alex-onboarding",
        notes: "Demo onboarding checklist review.",
        status: "scheduled",
        createdBy: "emp-hr",
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "event-payroll-deadline",
        title: "Payroll deadline",
        type: "payroll_deadline",
        startAt: daysFromNow(5, 12),
        endAt: daysFromNow(5, 13),
        employeeIds: ["emp-owner", "emp-manager", "emp-hr", "emp-alex", "emp-jordan"],
        team: "",
        location: "Portal reminder",
        remoteLink: "",
        relatedTaskId: "",
        relatedChecklistRunId: "",
        notes: "Reminder only. Payroll processing stays with approved provider.",
        status: "scheduled",
        createdBy: "emp-hr",
        createdAt,
        updatedAt: createdAt,
      },
    ];
  }

  function seedDeskTickets() {
    const createdAt = daysFromNow(-1);
    return [
      {
        id: "ticket-timecard",
        title: "Timecard correction request",
        description: "Need help correcting yesterday's break entry.",
        category: "timecard",
        priority: "normal",
        status: "triaged",
        submittedBy: "emp-jordan",
        assignedTo: "emp-manager",
        team: "Operations",
        relatedEmployeeId: "emp-jordan",
        relatedTaskId: "",
        relatedScheduleEventId: "",
        relatedPayrollItemId: "",
        internalOnly: false,
        createdAt,
        updatedAt: createdAt,
        resolvedAt: "",
      },
      {
        id: "ticket-payroll",
        title: "Payroll question",
        description: "Where should I review paystub access instructions?",
        category: "payroll",
        priority: "normal",
        status: "new",
        submittedBy: "emp-alex",
        assignedTo: "emp-hr",
        team: "Operations",
        relatedEmployeeId: "emp-alex",
        relatedTaskId: "",
        relatedScheduleEventId: "",
        relatedPayrollItemId: "",
        internalOnly: false,
        createdAt,
        updatedAt: createdAt,
        resolvedAt: "",
      },
      {
        id: "ticket-schedule",
        title: "Schedule question",
        description: "Confirm whether the training session is remote.",
        category: "scheduling",
        priority: "low",
        status: "assigned",
        submittedBy: "emp-alex",
        assignedTo: "emp-manager",
        team: "Operations",
        relatedEmployeeId: "emp-alex",
        relatedTaskId: "",
        relatedScheduleEventId: "event-training",
        relatedPayrollItemId: "",
        internalOnly: false,
        createdAt,
        updatedAt: createdAt,
        resolvedAt: "",
      },
      {
        id: "ticket-it",
        title: "IT/access request",
        description: "Need the right access checklist before the next demo.",
        category: "it_access",
        priority: "high",
        status: "assigned",
        submittedBy: "emp-manager",
        assignedTo: "emp-owner",
        team: "Operations",
        relatedEmployeeId: "emp-manager",
        relatedTaskId: "task-desk-demo",
        relatedScheduleEventId: "",
        relatedPayrollItemId: "",
        internalOnly: false,
        createdAt,
        updatedAt: createdAt,
        resolvedAt: "",
      },
    ];
  }

  function seedAutomationRules() {
    const createdAt = daysFromNow(-3);
    return Object.entries(ROUTING_ROLE_BY_CATEGORY).map(([category, role]) => ({
      id: `rule-${category}`,
      name: `${category.replace("_", " ")} routing`,
      enabled: true,
      triggerCategory: category,
      assignToRole: role,
      assignToEmployeeId: "",
      autoReplyTemplateKey: category === "timecard" ? "timecard_correction_received" : "desk_ticket_received",
      createTask: category === "it_access" || category === "safety",
      taskTitleTemplate: "Follow up on {{ticketTitle}}",
      slaHours: category === "safety" ? 4 : 24,
      createdAt,
      updatedAt: createdAt,
    }));
  }

  function seedChecklistTemplates() {
    const createdAt = daysFromNow(-3);
    return [
      {
        id: "template-onboarding",
        name: "New hire checklist",
        type: "onboarding",
        roleScope: "",
        teamScope: "",
        items: [
          "Create associate profile",
          "Confirm work email",
          "Confirm start date",
          "Add to schedule",
          "Send welcome message",
          "Provide handbook/policy links placeholder",
          "Payroll setup instruction",
          "Emergency contact placeholder",
          "Assign first-week training",
          "Schedule first-day orientation",
          "Schedule 30-day check-in",
        ],
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "template-offboarding",
        name: "Offboarding checklist",
        type: "offboarding",
        roleScope: "",
        teamScope: "",
        items: [
          "Confirm final work date",
          "Remove from future schedule",
          "Reassign open tasks",
          "Transfer notes/files placeholder",
          "Final payroll review reminder",
          "Collect company property placeholder",
          "Disable portal access placeholder",
          "Archive associate record",
        ],
        createdAt,
        updatedAt: createdAt,
      },
    ];
  }

  function seedChecklistRuns() {
    const createdAt = daysFromNow(-1);
    return [
      {
        id: "run-alex-onboarding",
        templateId: "template-onboarding",
        employeeId: "emp-alex",
        status: "in_progress",
        startDate: "2026-06-03",
        dueDate: "2026-06-17",
        createdBy: "emp-hr",
        createdAt,
        updatedAt: createdAt,
      },
    ];
  }

  function seedChecklistItems() {
    const createdAt = daysFromNow(-1);
    return [
      "Create associate profile",
      "Confirm work email",
      "Confirm start date",
      "Add to schedule",
      "Send welcome message",
    ].map((title, index) => ({
      id: `item-alex-${index + 1}`,
      checklistRunId: "run-alex-onboarding",
      title,
      description: `${title} for the demo onboarding run.`,
      assignedToRole: index < 2 ? "hr_payroll" : "manager",
      assignedToEmployeeId: index < 2 ? "emp-hr" : "emp-manager",
      status: index === 0 ? "completed" : "open",
      dueAt: daysFromNow(index + 1, 16),
      relatedTaskId: "",
      createdAt,
      updatedAt: createdAt,
    }));
  }

  function seedState() {
    const employees = seedEmployees();
    const emailTemplates = seedEmailTemplates();
    return {
      version: VERSION,
      employees,
      employeeEmails: seedEmployeeEmails(employees),
      emailTunnelRoutes: seedEmailTunnelRoutes(),
      emailTemplates,
      emailNotifications: [
        {
          id: "email-seed-welcome",
          toEmployeeId: "emp-alex",
          toEmail: "alex.associate@example.com",
          templateKey: "onboarding_started",
          subject: EMAIL_TEMPLATE_SUBJECTS.onboarding_started,
          body: "Your onboarding checklist is available in LRC Associate Portal.",
          status: "sent_mock",
          relatedType: "checklist",
          relatedId: "run-alex-onboarding",
          createdAt: daysFromNow(-1),
          sentAt: daysFromNow(-1),
        },
      ],
      messageThreads: seedMessages(),
      messageComments: [
        {
          id: "comment-welcome-1",
          threadId: "thread-welcome",
          body: "Read and understood. I will use the desk for requests.",
          authorId: "emp-jordan",
          createdAt: daysFromNow(-2),
        },
      ],
      scheduleEvents: seedSchedule(),
      tasks: seedTasks(),
      taskProposals: seedTaskProposals(),
      deskTickets: seedDeskTickets(),
      deskAutomationRules: seedAutomationRules(),
      legalDocuments: seedLegalDocuments(),
      legalDocumentRequests: seedLegalDocumentRequests(),
      checklistTemplates: seedChecklistTemplates(),
      checklistRuns: seedChecklistRuns(),
      checklistItems: seedChecklistItems(),
      auditLogs: [
        {
          id: "audit-seed",
          actorId: "emp-owner",
          action: "seed_demo",
          entityType: "portal",
          entityId: "demo",
          summary: "Seeded LRC Associate Portal local demo data.",
          metadata: { mode: "localStorage" },
          createdAt: daysFromNow(-4),
        },
      ],
    };
  }

  function seedLegalDocuments() {
    const createdAt = daysFromNow(-2);
    return [
      {
        id: "legal-doc-handbook",
        title: "Associate handbook placeholder",
        category: "policy",
        status: "placeholder",
        access: "all",
        ownerId: "emp-owner",
        description: "Approved handbook or policy link can be connected later.",
        storageNote: "No document is uploaded in this local demo.",
        requiresAcknowledgment: true,
        acknowledgedBy: ["emp-manager"],
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "legal-doc-nda",
        title: "Confidentiality agreement placeholder",
        category: "agreement",
        status: "draft_placeholder",
        access: "admin",
        ownerId: "emp-owner",
        description: "Track that a document may be needed; do not treat this as legal advice.",
        storageNote: "Future secure document storage and e-signature integration required.",
        requiresAcknowledgment: false,
        acknowledgedBy: [],
        createdAt,
        updatedAt: createdAt,
      },
      {
        id: "legal-doc-vendor",
        title: "Vendor/service agreement checklist",
        category: "vendor",
        status: "review_needed",
        access: "managers",
        ownerId: "emp-owner",
        description: "Checklist placeholder for routing agreements to approved review.",
        storageNote: "Store actual contracts only in an approved secure system.",
        requiresAcknowledgment: false,
        acknowledgedBy: [],
        createdAt,
        updatedAt: createdAt,
      },
    ];
  }

  function seedLegalDocumentRequests() {
    const createdAt = daysFromNow(-1);
    return [
      {
        id: "legal-request-demo",
        title: "Need current policy link for onboarding",
        description: "Please confirm which handbook or policy link should be shared in onboarding.",
        category: "policy",
        priority: "normal",
        status: "new",
        requestedBy: "emp-hr",
        assignedTo: "emp-owner",
        relatedEmployeeId: "emp-alex",
        relatedDocumentId: "legal-doc-handbook",
        decisionNote: "",
        createdAt,
        updatedAt: createdAt,
        closedAt: "",
      },
    ];
  }

  function syncLiveEmailTunnelRoutes(state) {
    const liveRoutes = seedEmailTunnelRoutes();
    const existingById = new Map((state.emailTunnelRoutes || []).map((route) => [route.id, route]));
    state.emailTunnelRoutes = liveRoutes.map((route) => ({
      ...(existingById.get(route.id) || {}),
      ...route,
      createdAt: (existingById.get(route.id) || {}).createdAt || route.createdAt,
    }));
    return state;
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!saved || saved.version !== VERSION) {
        const seeded = seedState();
        saveState(seeded);
        return seeded;
      }
      return syncLiveEmailTunnelRoutes({
        ...seedState(),
        ...saved,
      });
    } catch (error) {
      console.error("Associate portal state could not be loaded", error);
      const seeded = seedState();
      saveState(seeded);
      return seeded;
    }
  }

  function saveState(state) {
    // TODO: Replace this localStorage persistence with authenticated API calls
    // and server-side role enforcement before using the portal for real records.
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    return state;
  }

  function resetState() {
    const seeded = seedState();
    saveState(seeded);
    return seeded;
  }

  function getSessionEmployeeId() {
    return localStorage.getItem(SESSION_KEY) || "";
  }

  function setSessionEmployeeId(employeeId) {
    localStorage.setItem(SESSION_KEY, employeeId);
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function findEmployee(state, employeeId) {
    return state.employees.find((employee) => employee.id === employeeId) || null;
  }

  function getCurrentEmployee(state) {
    return findEmployee(state, getSessionEmployeeId());
  }

  function can(employee, permission) {
    if (!employee || employee.status === "inactive") return false;
    const permissions = ROLE_PERMISSIONS[employee.role] || [];
    return permissions.includes("full_access") || permissions.includes(permission);
  }

  function canAdmin(employee) {
    return Boolean(
      can(employee, "full_access")
        || can(employee, "manage_tasks")
        || can(employee, "assign_team_tasks")
        || can(employee, "manage_hr_payroll")
    );
  }

  function visibleEmployees(state, actor) {
    if (!actor) return [];
    if (can(actor, "manage_employees") || can(actor, "view_employee_profiles")) return state.employees;
    return state.employees.filter((employee) => employee.id === actor.id || employee.managerId === actor.id);
  }

  function getPrimaryEmail(state, employeeId) {
    const employee = findEmployee(state, employeeId);
    const email = state.employeeEmails.find((item) => item.employeeId === employeeId && item.isPrimary);
    return email?.email || employee?.workEmail || "";
  }

  function chooseAssigneeByRole(state, role) {
    return (
      state.employees.find((employee) => employee.role === role && employee.status !== "inactive")
      || state.employees.find((employee) => employee.role === "owner_admin" && employee.status !== "inactive")
      || state.employees[0]
    );
  }

  function recordAudit(state, actorId, action, entityType, entityId, summary, metadata = {}) {
    state.auditLogs.unshift({
      id: createId("audit"),
      actorId,
      action,
      entityType,
      entityId,
      summary,
      metadata,
      createdAt: nowIso(),
    });
  }

  function queueNotification(state, toEmployeeId, templateKey, relatedType, relatedId, bodyOverride = "") {
    const template = state.emailTemplates.find((item) => item.key === templateKey);
    const toEmail = getPrimaryEmail(state, toEmployeeId);
    if (!template || !template.enabled || !toEmail) return null;
    const notification = {
      id: createId("email"),
      toEmployeeId,
      toEmail,
      templateKey,
      subject: template.subject,
      body: bodyOverride || template.body,
      status: "sent_mock",
      relatedType,
      relatedId,
      createdAt: nowIso(),
      sentAt: nowIso(),
    };
    state.emailNotifications.unshift(notification);
    return notification;
  }

  function getVisibleRecipients(state, thread) {
    const activeEmployees = state.employees.filter((employee) => employee.status !== "inactive");
    if (thread.visibility === "all") return activeEmployees;
    if (thread.visibility === "admin") return activeEmployees.filter((employee) => employee.role === "owner_admin");
    if (thread.visibility === "managers") {
      return activeEmployees.filter((employee) => employee.role === "owner_admin" || employee.role === "manager");
    }
    if (thread.visibility === "hr_payroll") {
      return activeEmployees.filter((employee) => employee.role === "owner_admin" || employee.role === "hr_payroll");
    }
    if (thread.visibility === "team") return activeEmployees.filter((employee) => employee.team === thread.team);
    if (thread.visibility === "individual") {
      return activeEmployees.filter((employee) => (thread.employeeIds || []).includes(employee.id));
    }
    return [];
  }

  function isMessageVisible(thread, actor) {
    if (!actor || actor.status === "inactive") return false;
    if (actor.role === "owner_admin") return true;
    if (thread.visibility === "all") return true;
    if (thread.visibility === "admin") return actor.role === "owner_admin";
    if (thread.visibility === "managers") return actor.role === "manager";
    if (thread.visibility === "hr_payroll") return actor.role === "hr_payroll";
    if (thread.visibility === "team") return actor.team && actor.team === thread.team;
    if (thread.visibility === "individual") return (thread.employeeIds || []).includes(actor.id);
    return false;
  }

  function createMessageThread(actorId, input) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    if (!actor || !(can(actor, "manage_messages") || can(actor, "post_team_messages"))) return saveState(state);
    const thread = {
      id: createId("thread"),
      title: input.title,
      body: input.body,
      category: input.category || "announcements",
      visibility: input.visibility || "all",
      team: input.team || "",
      employeeIds: input.employeeIds || [],
      pinned: Boolean(input.pinned),
      sendEmailCopy: Boolean(input.sendEmailCopy),
      authorId: actorId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.messageThreads.unshift(thread);
    if (thread.sendEmailCopy) {
      getVisibleRecipients(state, thread).forEach((employee) => {
        queueNotification(
          state,
          employee.id,
          "message_board_posted",
          "message",
          thread.id,
          "A message board post is available in the portal. Email delivery is mocked until a provider is connected."
        );
      });
    }
    recordAudit(state, actorId, "create_message", "MessageThread", thread.id, `Posted message: ${thread.title}`);
    return saveState(state);
  }

  function addMessageComment(actorId, threadId, body) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const thread = state.messageThreads.find((item) => item.id === threadId);
    if (!actor || !thread || !isMessageVisible(thread, actor)) return saveState(state);
    const comment = {
      id: createId("comment"),
      threadId,
      body,
      authorId: actorId,
      createdAt: nowIso(),
    };
    state.messageComments.push(comment);
    thread.updatedAt = nowIso();
    recordAudit(state, actorId, "comment_message", "MessageThread", threadId, `Commented on: ${thread.title}`);
    return saveState(state);
  }

  function setMessagePinned(actorId, threadId, pinned) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const thread = state.messageThreads.find((item) => item.id === threadId);
    if (!actor || !thread || !can(actor, "manage_messages")) return saveState(state);
    thread.pinned = pinned;
    thread.updatedAt = nowIso();
    recordAudit(state, actorId, pinned ? "pin_message" : "unpin_message", "MessageThread", threadId, thread.title);
    return saveState(state);
  }

  function createScheduleEvent(actorId, input) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    if (!actor || !can(actor, "manage_schedule")) return saveState(state);
    const event = {
      id: createId("event"),
      title: input.title,
      type: input.type || "meeting",
      startAt: input.startAt,
      endAt: input.endAt,
      employeeIds: input.employeeIds || [],
      team: input.team || "",
      location: input.location || "",
      remoteLink: input.remoteLink || "",
      relatedTaskId: input.relatedTaskId || "",
      relatedChecklistRunId: input.relatedChecklistRunId || "",
      notes: input.notes || "",
      status: "scheduled",
      createdBy: actorId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.scheduleEvents.unshift(event);
    event.employeeIds.forEach((employeeId) => queueNotification(state, employeeId, "schedule_updated", "schedule", event.id));
    recordAudit(state, actorId, "create_schedule_event", "ScheduleEvent", event.id, `Created schedule event: ${event.title}`);
    return saveState(state);
  }

  function updateScheduleStatus(actorId, eventId, status) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const event = state.scheduleEvents.find((item) => item.id === eventId);
    if (!actor || !event || !can(actor, "manage_schedule")) return saveState(state);
    event.status = status;
    event.updatedAt = nowIso();
    event.employeeIds.forEach((employeeId) => queueNotification(state, employeeId, "schedule_updated", "schedule", event.id));
    recordAudit(state, actorId, "update_schedule_event", "ScheduleEvent", event.id, `${event.title} marked ${status}`);
    return saveState(state);
  }

  function createTask(actorId, input) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    if (!actor || !(can(actor, "manage_tasks") || can(actor, "assign_team_tasks"))) return saveState(state);
    const task = {
      id: createId("task"),
      title: input.title,
      description: input.description || "",
      type: input.type || "assigned",
      status: input.type === "open" ? "open" : "assigned",
      proposalStatus: "",
      priority: input.priority || "normal",
      createdBy: actorId,
      assignedTo: input.type === "open" ? "" : input.assignedTo || "",
      claimedBy: "",
      eligibleRoles: input.eligibleRoles || [],
      eligibleTeams: input.eligibleTeams || [],
      dueAt: input.dueAt || "",
      relatedScheduleEventId: input.relatedScheduleEventId || "",
      relatedDeskTicketId: input.relatedDeskTicketId || "",
      relatedChecklistRunId: input.relatedChecklistRunId || "",
      decisionBy: "",
      decisionReason: "",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.tasks.unshift(task);
    if (task.assignedTo) queueNotification(state, task.assignedTo, "task_assigned", "task", task.id);
    recordAudit(state, actorId, "create_task", "Task", task.id, `Created task: ${task.title}`);
    return saveState(state);
  }

  function claimTask(actorId, taskId) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const task = state.tasks.find((item) => item.id === taskId);
    if (!actor || !task || task.status !== "open" || !can(actor, "claim_open_tasks")) return saveState(state);
    task.claimedBy = actorId;
    task.assignedTo = actorId;
    task.status = "claimed";
    task.updatedAt = nowIso();
    queueNotification(state, actorId, "task_assigned", "task", task.id);
    recordAudit(state, actorId, "claim_task", "Task", task.id, `Claimed task: ${task.title}`);
    return saveState(state);
  }

  function updateTaskStatus(actorId, taskId, status) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const task = state.tasks.find((item) => item.id === taskId);
    if (!actor || !task) return saveState(state);
    const ownsTask = task.assignedTo === actorId || task.claimedBy === actorId;
    const allowed = ownsTask || can(actor, "manage_tasks") || can(actor, "review_task_completion");
    if (!allowed) return saveState(state);
    task.status = status;
    task.updatedAt = nowIso();
    if (status === "waiting_review") queueNotification(state, task.createdBy, "task_completed_review", "task", task.id);
    recordAudit(state, actorId, "update_task_status", "Task", task.id, `${task.title} marked ${status}`);
    return saveState(state);
  }

  function reassignTask(actorId, taskId, assigneeId, reason = "") {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const task = state.tasks.find((item) => item.id === taskId);
    if (!actor || !task || !(can(actor, "manage_tasks") || can(actor, "assign_team_tasks"))) return saveState(state);
    task.assignedTo = assigneeId;
    task.claimedBy = "";
    task.status = "assigned";
    task.decisionBy = actorId;
    task.decisionReason = reason;
    task.updatedAt = nowIso();
    queueNotification(state, assigneeId, "task_reassigned", "task", task.id);
    recordAudit(state, actorId, "reassign_task", "Task", task.id, `Reassigned task: ${task.title}`, { assigneeId, reason });
    return saveState(state);
  }

  function proposeTask(actorId, input) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    if (!actor || !can(actor, "propose_tasks")) return saveState(state);
    const proposal = {
      id: createId("proposal"),
      proposedBy: actorId,
      title: input.title,
      description: input.description || "",
      businessReason: input.businessReason || "",
      estimatedTime: input.estimatedTime || "",
      requestedDueAt: input.requestedDueAt || "",
      status: "proposed",
      adminDecisionBy: "",
      adminDecisionReason: "",
      convertedTaskId: "",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.taskProposals.unshift(proposal);
    recordAudit(state, actorId, "propose_task", "TaskProposal", proposal.id, `Proposed task: ${proposal.title}`);
    return saveState(state);
  }

  function decideProposal(actorId, proposalId, decision, options = {}) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const proposal = state.taskProposals.find((item) => item.id === proposalId);
    if (!actor || !proposal || !can(actor, "review_proposals")) return saveState(state);
    proposal.status = decision;
    proposal.adminDecisionBy = actorId;
    proposal.adminDecisionReason = options.reason || "";
    proposal.updatedAt = nowIso();

    let createdTask = null;
    if (decision === "approved" || decision === "converted_to_task") {
      createdTask = {
        id: createId("task"),
        title: proposal.title,
        description: proposal.description,
        type: options.postOpen ? "open" : "assigned",
        status: options.postOpen ? "open" : "assigned",
        proposalStatus: "converted_to_task",
        priority: options.priority || "normal",
        createdBy: actorId,
        assignedTo: options.postOpen ? "" : options.assignedTo || proposal.proposedBy,
        claimedBy: "",
        eligibleRoles: options.postOpen ? ["team_member"] : [],
        eligibleTeams: options.postOpen ? ["Operations"] : [],
        dueAt: proposal.requestedDueAt,
        relatedScheduleEventId: "",
        relatedDeskTicketId: "",
        relatedChecklistRunId: "",
        decisionBy: actorId,
        decisionReason: options.reason || "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      state.tasks.unshift(createdTask);
      proposal.convertedTaskId = createdTask.id;
      proposal.status = "converted_to_task";
      if (createdTask.assignedTo) queueNotification(state, createdTask.assignedTo, "task_assigned", "task", createdTask.id);
      queueNotification(state, proposal.proposedBy, "proposal_approved", "TaskProposal", proposal.id);
    }

    if (decision === "declined") queueNotification(state, proposal.proposedBy, "proposal_declined", "TaskProposal", proposal.id);
    if (decision === "needs_revision") {
      queueNotification(state, proposal.proposedBy, "proposal_needs_revision", "TaskProposal", proposal.id);
    }
    if (decision === "reassigned") {
      proposal.status = "reassigned";
      queueNotification(state, options.assignedTo || proposal.proposedBy, "task_reassigned", "TaskProposal", proposal.id);
    }
    recordAudit(
      state,
      actorId,
      "decide_task_proposal",
      "TaskProposal",
      proposal.id,
      `${proposal.title} decision: ${proposal.status}`,
      { decision, createdTaskId: createdTask?.id || "", reason: options.reason || "" }
    );
    return saveState(state);
  }

  function submitDeskTicket(actorId, input) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    if (!actor || !can(actor, "submit_desk_tickets")) return saveState(state);
    const rule = state.deskAutomationRules.find((item) => item.enabled && item.triggerCategory === input.category);
    const assignedEmployee = rule?.assignToEmployeeId
      ? findEmployee(state, rule.assignToEmployeeId)
      : chooseAssigneeByRole(state, rule?.assignToRole || ROUTING_ROLE_BY_CATEGORY[input.category] || "owner_admin");
    const ticket = {
      id: createId("ticket"),
      title: input.title,
      description: input.description || "",
      category: input.category || "general",
      priority: input.priority || "normal",
      status: assignedEmployee ? "assigned" : "new",
      submittedBy: actorId,
      assignedTo: assignedEmployee?.id || "",
      team: actor.team || "",
      relatedEmployeeId: actorId,
      relatedTaskId: "",
      relatedScheduleEventId: "",
      relatedPayrollItemId: "",
      internalOnly: Boolean(input.internalOnly),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      resolvedAt: "",
    };
    state.deskTickets.unshift(ticket);
    queueNotification(state, actorId, rule?.autoReplyTemplateKey || "desk_ticket_received", "DeskTicket", ticket.id);
    if (assignedEmployee) queueNotification(state, assignedEmployee.id, "desk_ticket_updated", "DeskTicket", ticket.id);
    recordAudit(state, actorId, "submit_desk_ticket", "DeskTicket", ticket.id, `Submitted desk ticket: ${ticket.title}`);
    if (rule?.createTask && assignedEmployee) {
      const task = {
        id: createId("task"),
        title: (rule.taskTitleTemplate || "Follow up on {{ticketTitle}}").replace("{{ticketTitle}}", ticket.title),
        description: `Created from Automated Desk ticket: ${ticket.description}`,
        type: "desk",
        status: "assigned",
        proposalStatus: "",
        priority: ticket.priority,
        createdBy: actorId,
        assignedTo: assignedEmployee.id,
        claimedBy: "",
        eligibleRoles: [],
        eligibleTeams: [],
        dueAt: "",
        relatedScheduleEventId: "",
        relatedDeskTicketId: ticket.id,
        relatedChecklistRunId: "",
        decisionBy: "",
        decisionReason: "Created by desk automation rule.",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      state.tasks.unshift(task);
      ticket.relatedTaskId = task.id;
      queueNotification(state, assignedEmployee.id, "task_assigned", "Task", task.id);
      recordAudit(state, actorId, "desk_created_task", "Task", task.id, `Created desk task: ${task.title}`);
    }
    return saveState(state);
  }

  function updateDeskTicket(actorId, ticketId, updates) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const ticket = state.deskTickets.find((item) => item.id === ticketId);
    if (!actor || !ticket || !canAdmin(actor)) return saveState(state);
    Object.assign(ticket, updates, { updatedAt: nowIso() });
    if (ticket.status === "resolved" || ticket.status === "closed") ticket.resolvedAt = nowIso();
    queueNotification(state, ticket.submittedBy, "desk_ticket_updated", "DeskTicket", ticket.id);
    recordAudit(state, actorId, "update_desk_ticket", "DeskTicket", ticket.id, `Updated desk ticket: ${ticket.title}`, updates);
    return saveState(state);
  }

  function convertTicketToTask(actorId, ticketId) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const ticket = state.deskTickets.find((item) => item.id === ticketId);
    if (!actor || !ticket || !canAdmin(actor)) return saveState(state);
    const assignee = ticket.assignedTo || actorId;
    const task = {
      id: createId("task"),
      title: `Desk follow-up: ${ticket.title}`,
      description: ticket.description,
      type: "desk",
      status: "assigned",
      proposalStatus: "",
      priority: ticket.priority,
      createdBy: actorId,
      assignedTo: assignee,
      claimedBy: "",
      eligibleRoles: [],
      eligibleTeams: [],
      dueAt: "",
      relatedScheduleEventId: "",
      relatedDeskTicketId: ticket.id,
      relatedChecklistRunId: "",
      decisionBy: "",
      decisionReason: "Converted from Automated Desk ticket.",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.tasks.unshift(task);
    ticket.relatedTaskId = task.id;
    ticket.updatedAt = nowIso();
    queueNotification(state, assignee, "task_assigned", "Task", task.id);
    recordAudit(state, actorId, "convert_ticket_to_task", "Task", task.id, `Converted ticket to task: ${ticket.title}`);
    return saveState(state);
  }

  function startChecklistRun(actorId, templateId, employeeId) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const template = state.checklistTemplates.find((item) => item.id === templateId);
    const employee = findEmployee(state, employeeId);
    if (!actor || !template || !employee || !can(actor, "manage_checklists")) return saveState(state);
    const run = {
      id: createId("run"),
      templateId,
      employeeId,
      status: "in_progress",
      startDate: employee.startDate || new Date().toISOString().slice(0, 10),
      dueDate: "",
      createdBy: actorId,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.checklistRuns.unshift(run);
    template.items.forEach((title, index) => {
      const item = {
        id: createId("item"),
        checklistRunId: run.id,
        title,
        description: `${title} for ${employee.displayName}. Placeholder only until backend integrations exist.`,
        assignedToRole: template.type === "offboarding" ? "manager" : index < 3 ? "hr_payroll" : "manager",
        assignedToEmployeeId: template.type === "offboarding" ? employee.managerId || actorId : index < 3 ? "emp-hr" : employee.managerId || actorId,
        status: "open",
        dueAt: daysFromNow(index + 1, 15),
        relatedTaskId: "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      state.checklistItems.push(item);
      const task = {
        id: createId("task"),
        title: item.title,
        description: item.description,
        type: "checklist",
        status: "assigned",
        proposalStatus: "",
        priority: "normal",
        createdBy: actorId,
        assignedTo: item.assignedToEmployeeId,
        claimedBy: "",
        eligibleRoles: [],
        eligibleTeams: [],
        dueAt: item.dueAt,
        relatedScheduleEventId: "",
        relatedDeskTicketId: "",
        relatedChecklistRunId: run.id,
        decisionBy: "",
        decisionReason: "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      state.tasks.push(task);
      item.relatedTaskId = task.id;
    });
    queueNotification(state, employeeId, template.type === "offboarding" ? "offboarding_started" : "onboarding_started", "ChecklistRun", run.id);
    recordAudit(state, actorId, "start_checklist_run", "ChecklistRun", run.id, `Started ${template.type} checklist for ${employee.displayName}`);
    return saveState(state);
  }

  function isLegalDocumentVisible(documentRecord, actor) {
    if (!actor || actor.status === "inactive") return false;
    if (actor.role === "owner_admin") return true;
    if (documentRecord.access === "all") return true;
    if (documentRecord.access === "admin") return actor.role === "owner_admin";
    if (documentRecord.access === "managers") return actor.role === "manager" || actor.role === "owner_admin";
    if (documentRecord.access === "hr_payroll") return actor.role === "hr_payroll" || actor.role === "owner_admin";
    return false;
  }

  function createLegalDocument(actorId, input) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    if (!actor || !can(actor, "manage_legal_documents")) return saveState(state);
    const documentRecord = {
      id: createId("legal-doc"),
      title: input.title,
      category: input.category || "policy",
      status: input.status || "placeholder",
      access: input.access || "admin",
      ownerId: actorId,
      description: input.description || "",
      storageNote: input.storageNote || "No document is uploaded in this local demo.",
      requiresAcknowledgment: Boolean(input.requiresAcknowledgment),
      acknowledgedBy: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    state.legalDocuments.unshift(documentRecord);
    recordAudit(state, actorId, "create_legal_document", "LegalDocument", documentRecord.id, `Created legal document placeholder: ${documentRecord.title}`);
    return saveState(state);
  }

  function requestLegalDocument(actorId, input) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    if (!actor || actor.status === "inactive") return saveState(state);
    const owner = chooseAssigneeByRole(state, "owner_admin");
    const request = {
      id: createId("legal-request"),
      title: input.title,
      description: input.description || "",
      category: input.category || "policy",
      priority: input.priority || "normal",
      status: "new",
      requestedBy: actorId,
      assignedTo: owner?.id || "",
      relatedEmployeeId: input.relatedEmployeeId || actorId,
      relatedDocumentId: input.relatedDocumentId || "",
      decisionNote: "",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      closedAt: "",
    };
    state.legalDocumentRequests.unshift(request);
    if (owner) queueNotification(state, owner.id, "legal_document_requested", "LegalDocumentRequest", request.id);
    queueNotification(state, actorId, "legal_document_requested", "LegalDocumentRequest", request.id);
    recordAudit(state, actorId, "request_legal_document", "LegalDocumentRequest", request.id, `Submitted legal document request: ${request.title}`);
    return saveState(state);
  }

  function updateLegalDocumentRequest(actorId, requestId, updates) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const request = state.legalDocumentRequests.find((item) => item.id === requestId);
    if (!actor || !request || !can(actor, "manage_legal_documents")) return saveState(state);
    Object.assign(request, updates, { updatedAt: nowIso() });
    if (request.status === "closed" || request.status === "declined") request.closedAt = nowIso();
    queueNotification(state, request.requestedBy, "legal_document_updated", "LegalDocumentRequest", request.id);
    recordAudit(state, actorId, "update_legal_document_request", "LegalDocumentRequest", request.id, `Updated legal document request: ${request.title}`, updates);
    return saveState(state);
  }

  function acknowledgeLegalDocument(actorId, documentId) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const documentRecord = state.legalDocuments.find((item) => item.id === documentId);
    if (!actor || !documentRecord || !isLegalDocumentVisible(documentRecord, actor)) return saveState(state);
    if (!documentRecord.acknowledgedBy.includes(actorId)) documentRecord.acknowledgedBy.push(actorId);
    documentRecord.updatedAt = nowIso();
    recordAudit(state, actorId, "acknowledge_legal_document", "LegalDocument", documentId, `Acknowledged document placeholder: ${documentRecord.title}`);
    return saveState(state);
  }

  function updateEmailTunnelRoute(actorId, routeId, updates) {
    const state = loadState();
    const actor = findEmployee(state, actorId);
    const route = state.emailTunnelRoutes.find((item) => item.id === routeId);
    if (!actor || !route || !can(actor, "send_email_notifications")) return saveState(state);
    Object.assign(route, updates, { updatedAt: nowIso() });
    recordAudit(state, actorId, "update_email_tunnel_route", "EmailTunnelRoute", route.id, `Updated domain email route: ${route.address}`, updates);
    return saveState(state);
  }

  window.LRCEmployeePortalData = {
    STORE_KEY,
    SESSION_KEY,
    ROLE_LABELS,
    ROLE_PERMISSIONS,
    EMAIL_TEMPLATE_SUBJECTS,
    loadState,
    saveState,
    resetState,
    getSessionEmployeeId,
    setSessionEmployeeId,
    clearSession,
    getCurrentEmployee,
    findEmployee,
    can,
    canAdmin,
    visibleEmployees,
    getPrimaryEmail,
    isMessageVisible,
    getVisibleRecipients,
    createMessageThread,
    addMessageComment,
    setMessagePinned,
    createScheduleEvent,
    updateScheduleStatus,
    createTask,
    claimTask,
    updateTaskStatus,
    reassignTask,
    proposeTask,
    decideProposal,
    submitDeskTicket,
    updateDeskTicket,
    convertTicketToTask,
    startChecklistRun,
    isLegalDocumentVisible,
    createLegalDocument,
    requestLegalDocument,
    updateLegalDocumentRequest,
    acknowledgeLegalDocument,
    updateEmailTunnelRoute,
    queueNotification,
    recordAudit,
  };
})();
