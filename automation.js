/* ==========================================================================
   OmniCRM - Automation & Workflow Engine
   ========================================================================== */

const AutomationEngine = {
  // Configured workflows active status
  rules: {
    leadAssignment: true,
    projectDelivery: true,
    invoiceAutomation: true
  },

  // Save rules to localStorage
  saveRules() {
    localStorage.setItem('crm_automation_rules', JSON.stringify(this.rules));
  },

  // Load rules from localStorage
  loadRules() {
    const saved = localStorage.getItem('crm_automation_rules');
    if (saved) {
      this.rules = JSON.parse(saved);
    }
  },

  // Log automation event
  logActivity(workflowName, message, type = 'info') {
    const logs = JSON.parse(localStorage.getItem('crm_automation_logs') || '[]');
    const newLog = {
      id: 'LOG-' + Math.floor(Math.random() * 100000),
      timestamp: new Date().toISOString(),
      workflow: workflowName,
      message: message,
      type: type // 'success', 'warning', 'info'
    };
    logs.unshift(newLog);
    // Keep last 100 logs
    localStorage.setItem('crm_automation_logs', JSON.stringify(logs.slice(0, 100)));
    
    // Dispatch custom event to notify main app
    window.dispatchEvent(new CustomEvent('automation-log-added', { detail: newLog }));
  },

  // Trigger handler called by the main application state transitions
  trigger(eventName, data) {
    this.loadRules();
    console.log(`[Automation Trigger] ${eventName}`, data);

    switch (eventName) {
      case 'leadCreated':
        if (this.rules.leadAssignment) {
          this.handleLeadAssignment(data);
        }
        break;
      case 'leadWon':
        if (this.rules.projectDelivery) {
          this.handleProjectDelivery(data);
        }
        break;
      case 'milestoneCompleted':
        if (this.rules.invoiceAutomation) {
          this.handleMilestoneInvoicing(data.project, data.milestoneIndex);
        }
        break;
      default:
        break;
    }
  },

  /* ------------------------------------------------------------------------
     Workflow 1: Lead Assignment Automation
     ------------------------------------------------------------------------ */
  handleLeadAssignment(lead) {
    // 1. Assign Owner based on Region
    let owner = "Unassigned";
    switch (lead.region) {
      case 'North America':
        owner = "Sarah Jenkins";
        break;
      case 'Europe':
        owner = "Hans Schmidt";
        break;
      case 'Asia-Pacific':
        owner = "Mei Ling";
        break;
      case 'Latin America':
        owner = "Carlos Silva";
        break;
      default:
        owner = "Sarah Jenkins";
    }
    lead.owner = owner;

    // 2. Lead Scoring (out of 100)
    let score = 20; // Base score
    if (lead.email && lead.email.trim() !== "") score += 20;
    if (lead.phone && lead.phone.trim() !== "") score += 20;
    
    const value = parseFloat(lead.value) || 0;
    if (value >= 50000) {
      score += 40;
    } else if (value >= 15000) {
      score += 20;
    } else if (value >= 5000) {
      score += 10;
    }
    lead.score = score;

    // 3. Create follow-up tasks/reminders
    const tasks = JSON.parse(localStorage.getItem('crm_tasks') || '[]');
    const newTask = {
      id: 'TSK-' + Math.floor(Math.random() * 10000),
      associatedId: lead.id,
      associatedType: 'Lead',
      title: `Qualify lead: ${lead.name} (${lead.company})`,
      assignedTo: owner,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 24 hours later
      status: 'Open'
    };
    tasks.push(newTask);
    localStorage.setItem('crm_tasks', JSON.stringify(tasks));

    this.logActivity(
      'Lead Assignment', 
      `Lead <strong>${lead.name}</strong> from <strong>${lead.company}</strong> auto-assigned to <strong>${owner}</strong>. Lead score calculated: <strong>${score} pts</strong>. Follow-up task scheduled.`,
      'success'
    );
  },

  /* ------------------------------------------------------------------------
     Workflow 2: Project Delivery Automation
     ------------------------------------------------------------------------ */
  handleProjectDelivery(lead) {
    // 1. Create or Find Account & Contact
    const accounts = JSON.parse(localStorage.getItem('crm_accounts') || '[]');
    let account = accounts.find(a => a.name.toLowerCase() === lead.company.toLowerCase());
    
    if (!account) {
      account = {
        id: 'ACC-' + Math.floor(Math.random() * 10000),
        name: lead.company,
        email: lead.email,
        phone: lead.phone,
        region: lead.region,
        service: lead.service,
        createdDate: new Date().toISOString().split('T')[0],
        timeline: [
          {
            title: "Account Created",
            date: new Date().toISOString().split('T')[0],
            description: `Account auto-created via Won Lead qualification: ${lead.name}`
          }
        ]
      };
      accounts.push(account);
      localStorage.setItem('crm_accounts', JSON.stringify(accounts));
    }

    // 2. Create Project
    const projects = JSON.parse(localStorage.getItem('crm_projects') || '[]');
    // Check if project already exists for this lead
    const projectExists = projects.some(p => p.leadId === lead.id);
    if (projectExists) return;

    let pm = "Sarah Jenkins";
    switch (lead.service) {
      case 'Cloud Migration':
        pm = "Alex Rivera (Cloud PM)";
        break;
      case 'Software Development':
        pm = "Devin Carter (Dev PM)";
        break;
      case 'Cybersecurity Audit':
        pm = "Rachel Stone (Sec PM)";
        break;
      default:
        pm = "Chris Wong (Operations PM)";
    }

    const newProject = {
      id: 'PRJ-' + Math.floor(Math.random() * 10000),
      leadId: lead.id,
      name: `${lead.service} - ${lead.company}`,
      client: lead.company,
      pm: pm,
      budget: lead.value,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 60 days
      milestones: [
        { name: "Kickoff & Requirements", completed: false, completedDate: null },
        { name: "Design & Implementation", completed: false, completedDate: null },
        { name: "Testing & Handover", completed: false, completedDate: null }
      ],
      progress: 0,
      status: 'Active'
    };
    projects.push(newProject);
    localStorage.setItem('crm_projects', JSON.stringify(projects));

    this.logActivity(
      'Project Delivery', 
      `Deal Won! Account <strong>${lead.company}</strong> established. Project <strong>${newProject.name}</strong> automatically created & assigned to PM <strong>${pm}</strong>.`,
      'success'
    );
  },

  /* ------------------------------------------------------------------------
     Workflow 3: Invoice & Payment Automation
     ------------------------------------------------------------------------ */
  handleMilestoneInvoicing(project, milestoneIndex) {
    const milestone = project.milestones[milestoneIndex];
    const milestoneNum = milestoneIndex + 1;
    
    // Calculate invoice amount (roughly 1/3 of the project budget per milestone)
    const totalBudget = parseFloat(project.budget) || 0;
    const invoiceAmount = Math.round((totalBudget / 3) * 100) / 100;

    const invoices = JSON.parse(localStorage.getItem('crm_invoices') || '[]');
    
    const newInvoice = {
      id: 'INV-' + Math.floor(Math.random() * 90000 + 10000),
      projectId: project.id,
      client: project.client,
      project: project.name,
      milestone: milestone.name,
      amount: invoiceAmount,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days terms
      status: 'Pending'
    };
    invoices.push(newInvoice);
    localStorage.setItem('crm_invoices', JSON.stringify(invoices));

    this.logActivity(
      'Invoice Automation', 
      `Milestone <strong>"${milestone.name}"</strong> completed for <strong>${project.name}</strong>. Auto-generated Invoice <strong>${newInvoice.id}</strong> for <strong>$${invoiceAmount.toLocaleString()}</strong>. Sent to accounts billing.`,
      'info'
    );

    // Simulate scheduling a notification / reminder in background logs
    setTimeout(() => {
      this.logActivity(
        'Invoice Automation',
        `Automated billing email sent to client <strong>${project.client}</strong> for invoice <strong>${newInvoice.id}</strong>. Payment link attached.`,
        'success'
      );
    }, 1200);
  }
};
