/* ==========================================================================
   OmniCRM - Application Logic Controller
   ========================================================================== */

// ==========================================================================
// Auth Manager - Login / Signup System
// ==========================================================================
const Auth = {
  usersKey: 'crm_users',
  sessionKey: 'crm_session',

  // Pre-create demo users for each department
  seedUsers() {
    if (localStorage.getItem(this.usersKey)) return;
    const users = [
      { id: 'USR-001', name: 'Sarah Jenkins', email: 'admin@omnicrm.com', password: 'admin123', role: 'management' },
      { id: 'USR-002', name: 'Marcus Vance', email: 'sales@omnicrm.com', password: 'sales123', role: 'sales' },
      { id: 'USR-003', name: 'Devin Carter', email: 'service@omnicrm.com', password: 'service123', role: 'service' },
      { id: 'USR-004', name: 'Helena Rostova', email: 'finance@omnicrm.com', password: 'finance123', role: 'finance' },
      { id: 'USR-005', name: 'Alex Rivera', email: 'support@omnicrm.com', password: 'support123', role: 'support' }
    ];
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  },

  // Register a new user
  register(name, email, password, role) {
    const users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    if (users.find(u => u.email === email)) {
      return { success: false, msg: 'Email already registered!' };
    }
    const newUser = {
      id: 'USR-' + Math.floor(Math.random() * 90000 + 10000),
      name, email, password, role
    };
    users.push(newUser);
    localStorage.setItem(this.usersKey, JSON.stringify(users));
    return { success: true, msg: 'Account created! Please sign in.' };
  },

  // Login
  login(email, password) {
    const users = JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return { success: false, msg: 'Invalid email or password!' };
    }
    const session = { userId: user.id, name: user.name, email: user.email, role: user.role };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    return { success: true, user: session };
  },

  // Logout
  logout() {
    localStorage.removeItem(this.sessionKey);
    location.reload();
  },

  // Check current session
  getSession() {
    const data = localStorage.getItem(this.sessionKey);
    return data ? JSON.parse(data) : null;
  },

  isLoggedIn() {
    return !!this.getSession();
  },

  getRoleName(role) {
    const names = {
      management: 'Management (Admin)',
      sales: 'Sales Team',
      service: 'Service Delivery',
      finance: 'Finance Team',
      support: 'Customer Support'
    };
    return names[role] || role;
  }
};

// 1. Initial Mock Data Setup (Database)
const INITIAL_LEADS = [
  { id: 'LD-8342', name: 'John Peterson', company: 'Apex Global', email: 'j.peterson@apex.com', phone: '+1 (555) 012-9988', value: 45000, region: 'North America', stage: 'Qualified', service: 'Cloud Migration', owner: 'Sarah Jenkins', score: 80, createdDate: '2026-06-18' },
  { id: 'LD-9271', name: 'Sophie Dubois', company: 'Lumiere Fashion', email: 's.dubois@lumiere.fr', phone: '+33 1 42 68 53 11', value: 12000, region: 'Europe', stage: 'Contacted', service: 'Digital Marketing', owner: 'Hans Schmidt', score: 60, createdDate: '2026-06-19' },
  { id: 'LD-3051', name: 'Kenji Sato', company: 'Nippon Logistics', email: 'k.sato@nippon-log.jp', phone: '+81 3 5555 0143', value: 85000, region: 'Asia-Pacific', stage: 'Proposal', service: 'Software Development', owner: 'Mei Ling', score: 90, createdDate: '2026-06-15' },
  { id: 'LD-4412', name: 'Camila Gomez', company: 'Soluciones Agri', email: 'c.gomez@solagri.cl', phone: '+56 2 2580 9100', value: 7500, region: 'Latin America', stage: 'New', service: 'Cybersecurity Audit', owner: 'Carlos Silva', score: 40, createdDate: '2026-06-21' },
  { id: 'LD-5288', name: 'Robert Chen', company: 'Pacific Tech', email: 'r.chen@pactech.com', phone: '+1 (555) 303-4921', value: 62000, region: 'North America', stage: 'Won', service: 'Software Development', owner: 'Sarah Jenkins', score: 100, createdDate: '2026-06-10' }
];

const INITIAL_PROJECTS = [
  {
    id: 'PRJ-1024',
    leadId: 'LD-5288',
    name: 'Software Development - Pacific Tech',
    client: 'Pacific Tech',
    pm: 'Devin Carter (Dev PM)',
    budget: 62000,
    deadline: '2026-08-10',
    milestones: [
      { name: "Kickoff & Requirements", completed: true, completedDate: '2026-06-12' },
      { name: "Design & Implementation", completed: false, completedDate: null },
      { name: "Testing & Handover", completed: false, completedDate: null }
    ],
    progress: 33,
    status: 'Active'
  }
];

const INITIAL_ACCOUNTS = [
  {
    id: 'ACC-3941',
    name: 'Pacific Tech',
    email: 'r.chen@pactech.com',
    phone: '+1 (555) 303-4921',
    region: 'North America',
    service: 'Software Development',
    createdDate: '2026-06-10',
    timeline: [
      { title: "Account Established", date: '2026-06-10', description: "Account created upon deal closing." },
      { title: "Project Initiated", date: '2026-06-11', description: "V1 project schedule created automatically." },
      { title: "Kickoff Milestone Completed", date: '2026-06-12', description: "First milestone checklist marked completed by Devin Carter." }
    ]
  }
];

const INITIAL_TICKETS = [
  { id: 'TCK-201', subject: 'Server connection latency peak', client: 'Apex Global', status: 'Open', priority: 'High', description: 'Web client reports spikes of up to 4s load times on backend database query APIs.', assignee: 'Devin Carter', createdTime: new Date(Date.now() - 4.5 * 60 * 60 * 1000).toISOString() }, // 4.5 hours ago
  { id: 'TCK-202', subject: 'Password reset failure in customer portal', client: 'Lumiere Fashion', status: 'In Progress', priority: 'Medium', description: 'User does not receive SMTP verification email code.', assignee: 'Sarah Jenkins', createdTime: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString() } // 2.5 hours ago
];

const INITIAL_INVOICES = [
  { id: 'INV-40122', projectId: 'PRJ-1024', client: 'Pacific Tech', project: 'Software Development - Pacific Tech', milestone: 'Kickoff & Requirements', amount: 20666.67, issueDate: '2026-06-12', dueDate: '2026-06-26', status: 'Paid' }
];

// 2. State Controller
const CRM = {
  state: {
    leads: [],
    projects: [],
    accounts: [],
    tickets: [],
    invoices: [],
    tasks: [],
    currentRole: 'management',
    currentView: 'dashboard',
    theme: 'dark'
  },

  // Role Access Matrix
  permissions: {
    management: ['dashboard', 'leads', 'accounts', 'projects', 'tickets', 'invoices', 'workflows'],
    sales: ['dashboard', 'leads', 'invoices'],
    service: ['dashboard', 'accounts', 'projects', 'tickets'],
    finance: ['dashboard', 'invoices'],
    support: ['dashboard', 'accounts', 'tickets']
  },

  init() {
    Auth.seedUsers();

    // Check if logged in
    const session = Auth.getSession();
    if (!session) {
      this.showAuthScreen();
      return;
    }

    // Apply session to CRM
    this.state.currentRole = session.role;
    localStorage.setItem('crm_role', session.role);

    this.loadState();
    this.setupListeners();
    this.authListeners();
    this.startTimers();
    this.renderActiveView();
    this.updateUserInterfaceForRole();
    this.updateSystemDate();
    AutomationEngine.startBackgroundScheduler();
  },

  showAuthScreen() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('signup-screen').style.display = 'none';
    this.authListeners();
  },

  authListeners() {
    var self = this;

    // Toggle login/signup
    var showSignup = document.getElementById('show-signup');
    var showLogin = document.getElementById('show-login');
    if (showSignup) {
      showSignup.onclick = function(e) {
        e.preventDefault();
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('signup-screen').style.display = 'flex';
      };
    }
    if (showLogin) {
      showLogin.onclick = function(e) {
        e.preventDefault();
        document.getElementById('signup-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
      };
    }

    // Login button click (not form submit to avoid page refresh)
    var loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.onclick = function() {
        var email = document.getElementById('login-email').value.trim();
        var password = document.getElementById('login-password').value;
        if (!email || !password) {
          alert('Please enter email and password!');
          return;
        }
        var result = Auth.login(email, password);
        if (result.success) {
          window.location.href = '/';
        } else {
          alert('Login failed: ' + result.msg);
        }
      };
    }

    // Signup button click
    var signupBtn = document.getElementById('signup-btn');
    if (signupBtn) {
      signupBtn.onclick = function() {
        var name = document.getElementById('signup-name').value.trim();
        var email = document.getElementById('signup-email').value.trim();
        var password = document.getElementById('signup-password').value;
        var role = document.getElementById('signup-role').value;
        if (!name || !email || !password) {
          alert('Please fill all fields!');
          return;
        }
        var result = Auth.register(name, email, password, role);
        if (result.success) {
          alert(result.msg + ' Please sign in.');
          document.getElementById('signup-screen').style.display = 'none';
          document.getElementById('login-screen').style.display = 'flex';
          document.getElementById('signup-name').value = '';
          document.getElementById('signup-email').value = '';
          document.getElementById('signup-password').value = '';
        } else {
          alert('Signup failed: ' + result.msg);
        }
      };
    }
  },

  // Load state from localStorage or populate defaults
  loadState() {
    if (!localStorage.getItem('crm_leads')) {
      localStorage.setItem('crm_leads', JSON.stringify(INITIAL_LEADS));
      localStorage.setItem('crm_projects', JSON.stringify(INITIAL_PROJECTS));
      localStorage.setItem('crm_accounts', JSON.stringify(INITIAL_ACCOUNTS));
      localStorage.setItem('crm_tickets', JSON.stringify(INITIAL_TICKETS));
      localStorage.setItem('crm_invoices', JSON.stringify(INITIAL_INVOICES));
      localStorage.setItem('crm_tasks', JSON.stringify([]));
      localStorage.setItem('crm_automation_logs', JSON.stringify([
        { id: 'LOG-001', timestamp: new Date().toISOString(), workflow: 'System Init', message: 'OmniCRM system databases populated with mock startup templates.', type: 'info' }
      ]));
    }
    
    this.state.leads = JSON.parse(localStorage.getItem('crm_leads'));
    this.state.projects = JSON.parse(localStorage.getItem('crm_projects'));
    this.state.accounts = JSON.parse(localStorage.getItem('crm_accounts'));
    this.state.tickets = JSON.parse(localStorage.getItem('crm_tickets'));
    this.state.invoices = JSON.parse(localStorage.getItem('crm_invoices'));
    this.state.tasks = JSON.parse(localStorage.getItem('crm_tasks'));
    
    const savedTheme = localStorage.getItem('crm_theme') || 'dark';
    this.state.theme = savedTheme;
    if (savedTheme === 'light') {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }

    const savedRole = localStorage.getItem('crm_role') || 'management';
    this.state.currentRole = savedRole;
    document.getElementById('role-select').value = savedRole;
  },

  saveState(key) {
    localStorage.setItem(`crm_${key}`, JSON.stringify(this.state[key]));
  },

  updateSystemDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('system-date').textContent = new Date().toLocaleDateString('en-US', options);
  },

  /* ==========================================================================
     Role Management
     ========================================================================== */
  updateUserInterfaceForRole() {
    const role = this.state.currentRole;
    const permittedViews = this.permissions[role];

    // 1. Update Profile Card in Sidebar
    const avatar = document.getElementById('current-user-avatar');
    const nameLbl = document.getElementById('current-user-name');
    const roleLbl = document.getElementById('current-user-role-lbl');

    const session = Auth.getSession();
    if (session) {
      avatar.textContent = session.name.charAt(0).toUpperCase();
      nameLbl.textContent = session.name;
      roleLbl.textContent = Auth.getRoleName(session.role);
    } else {
      switch (role) {
        case 'management':
          avatar.textContent = 'M';
          nameLbl.textContent = 'Sarah Jenkins';
          roleLbl.textContent = 'Management';
          break;
        case 'sales':
          avatar.textContent = 'S';
          nameLbl.textContent = 'Marcus Vance';
          roleLbl.textContent = 'Sales Representative';
          break;
        case 'service':
          avatar.textContent = 'D';
          nameLbl.textContent = 'Devin Carter';
          roleLbl.textContent = 'Delivery Director';
          break;
        case 'finance':
          avatar.textContent = 'F';
          nameLbl.textContent = 'Helena Rostova';
          roleLbl.textContent = 'Finance Director';
          break;
        case 'support':
          avatar.textContent = 'H';
          nameLbl.textContent = 'Alex Rivera';
          roleLbl.textContent = 'Support Lead';
          break;
      }
    }

    // 2. Hide unauthorized menu items in sidebar
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    menuItems.forEach(item => {
      const view = item.getAttribute('data-view');
      const perm = item.getAttribute('data-perm');
      
      if (perm && !permittedViews.includes(perm)) {
        item.style.display = 'none';
      } else {
        item.style.display = 'flex';
      }
    });

    // 3. Check if current view is authorized, else redirect to Dashboard
    if (!permittedViews.includes(this.state.currentView)) {
      this.switchView('dashboard');
    }

    // 4. Disable/Hide Quick Actions based on Role permissions
    const quickAddBtn = document.getElementById('quick-add-btn');
    if (role === 'support' || role === 'finance') {
      quickAddBtn.style.display = 'none';
    } else {
      quickAddBtn.style.display = 'inline-flex';
    }
  },

  /* ==========================================================================
     Routing & Switch Views
     ========================================================================== */
  switchView(viewName) {
    // Save to state
    this.state.currentView = viewName;
    
    // Update menu highlight
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    menuItems.forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update title
    let title = 'Dashboard';
    switch (viewName) {
      case 'dashboard': title = 'Dashboard Insights'; break;
      case 'leads': title = 'Lead Pipelines'; break;
      case 'accounts': title = 'Accounts & Contacts'; break;
      case 'projects': title = 'Project Tracking'; break;
      case 'tickets': title = 'Service Desk'; break;
      case 'invoices': title = 'Financial Ledger'; break;
      case 'workflows': title = 'Workflow Automation Engine'; break;
    }
    document.getElementById('page-title').textContent = title;

    // Render the view
    this.renderActiveView();
  },

  renderActiveView() {
    const container = document.getElementById('main-content-view');
    
    switch (this.state.currentView) {
      case 'dashboard':
        this.renderDashboard(container);
        break;
      case 'leads':
        this.renderLeads(container);
        break;
      case 'accounts':
        this.renderAccounts(container);
        break;
      case 'projects':
        this.renderProjects(container);
        break;
      case 'tickets':
        this.renderTickets(container);
        break;
      case 'invoices':
        this.renderInvoices(container);
        break;
      case 'workflows':
        this.renderWorkflows(container);
        break;
    }
  },

  /* ==========================================================================
     View Renderers
     ========================================================================== */

  // 1. DASHBOARD VIEW
  renderDashboard(target) {
    // Calculations
    const wonLeads = this.state.leads.filter(l => l.stage === 'Won');
    const totalWonRevenue = wonLeads.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0);
    const activeProjects = this.state.projects.filter(p => p.status === 'Active').length;
    const openTickets = this.state.tickets.filter(t => t.status !== 'Resolved').length;
    
    const totalDeals = this.state.leads.filter(l => l.stage === 'Won' || l.stage === 'Lost').length;
    const conversionRate = totalDeals > 0 ? Math.round((wonLeads.length / totalDeals) * 100) : 100;

    const logs = JSON.parse(localStorage.getItem('crm_automation_logs') || '[]');

    target.innerHTML = `
      <!-- Metric Cards Row -->
      <div class="metrics-row">
        <div class="card metric-card">
          <div class="metric-icon-wrapper" style="color: var(--color-success);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">Sales Revenue</span>
            <span class="metric-value">$${totalWonRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div class="card metric-card">
          <div class="metric-icon-wrapper" style="color: var(--accent-secondary);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">Active Projects</span>
            <span class="metric-value">${activeProjects}</span>
          </div>
        </div>

        <div class="card metric-card">
          <div class="metric-icon-wrapper" style="color: var(--color-warning);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">Open Tickets</span>
            <span class="metric-value">${openTickets}</span>
          </div>
        </div>

        <div class="card metric-card">
          <div class="metric-icon-wrapper" style="color: var(--accent-primary);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div class="metric-info">
            <span class="metric-label">Deal Win Rate</span>
            <span class="metric-value">${conversionRate}%</span>
          </div>
        </div>
      </div>

      <!-- Main Dashboard Grid -->
      <div class="dashboard-grid">
        <!-- Chart Column -->
        <div class="card">
          <div class="card-title">
            <span>Sales & Qualified Pipelines by Stage</span>
            <button class="btn btn-secondary btn-icon" style="padding: 6px 12px; font-size: 0.75rem;" id="refresh-db-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Refresh</span>
            </button>
          </div>
          <div class="chart-container">
            ${this.getPipelineChartHTML()}
          </div>
        </div>

        <!-- Activity Engine Log Panel -->
        <div class="card">
          <div class="card-title">
            <span>Background Automation Logs</span>
            <span class="badge badge-success">Active</span>
          </div>
          <div class="log-list" id="dashboard-log-list">
            ${logs.length === 0 ? '<p style="color: var(--text-secondary); text-align: center; margin-top: 40px;">No automations executed yet.</p>' : 
              logs.map(log => `
                <div class="log-item">
                  <div class="log-icon" style="background-color: ${log.type === 'success' ? 'var(--color-success)' : log.type === 'warning' ? 'var(--color-warning)' : 'var(--accent-primary)'};"></div>
                  <div class="log-content">
                    <span class="log-text"><strong>[${log.workflow}]</strong> ${log.message}</span>
                    <span class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              `).join('')
            }
          </div>
        </div>
      </div>
      
      <!-- Tickets Table Widget -->
      <div class="card">
        <div class="card-title">
          <span>Active Tickets SLA Monitoring</span>
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="CRM.switchView('tickets')">View All</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Client</th>
                <th>Priority</th>
                <th>Assigned To</th>
                <th>SLA Time Remaining</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${this.state.tickets.filter(t => t.status !== 'Resolved').map(ticket => `
                <tr>
                  <td><strong>${ticket.id}</strong></td>
                  <td>${ticket.subject}</td>
                  <td>${ticket.client}</td>
                  <td><span class="priority-pill priority-${ticket.priority}">${ticket.priority}</span></td>
                  <td>${ticket.assignee}</td>
                  <td><span class="badge badge-danger sla-timer" data-start="${ticket.createdTime}" data-priority="${ticket.priority}">Calculating...</span></td>
                  <td>
                    <button class="btn btn-secondary btn-icon" style="padding: 4px 8px; font-size: 0.75rem;" onclick="CRM.resolveTicket('${ticket.id}')">Resolve</button>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No open tickets requiring support</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;
    
    // Wire up refresh action
    document.getElementById('refresh-db-btn').addEventListener('click', () => {
      this.showToast('Data refreshed successfully', 'success');
      this.renderActiveView();
    });
    
    this.updateSLATimers();
  },

  getPipelineChartHTML() {
    const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won'];
    const counts = stages.map(stage => this.state.leads.filter(l => l.stage === stage).length);
    const maxVal = Math.max(...counts, 1);
    
    return stages.map((stage, idx) => {
      const cnt = counts[idx];
      const pct = (cnt / maxVal) * 100;
      
      let fillGrad = 'linear-gradient(to top, #3b82f6, #8b5cf6)';
      if (stage === 'Won') fillGrad = 'linear-gradient(to top, #10b981, #059669)';
      
      return `
        <div class="chart-bar-col">
          <div class="chart-bar" style="height: ${Math.max(pct, 8)}%; background: ${fillGrad};">
            <span class="chart-bar-tooltip">${cnt} Lead(s) ($${this.state.leads.filter(l => l.stage === stage).reduce((a,b)=>a+(parseFloat(b.value)||0), 0).toLocaleString()})</span>
          </div>
          <span class="chart-label">${stage} (${cnt})</span>
        </div>
      `;
    }).join('');
  },

  // 2. LEADS PIPELINE VIEW
  renderLeads(target) {
    const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
    
    target.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <p style="color: var(--text-secondary); font-size: 0.95rem;">Drag and drop is simulated. Advance lead stages using context arrows on cards.</p>
        <button class="btn btn-primary" onclick="CRM.openLeadModal()">Add New Lead</button>
      </div>

      <div class="kanban-board">
        ${stages.map(stage => {
          const leadsInStage = this.state.leads.filter(l => l.stage === stage);
          return `
            <div class="kanban-column" data-stage="${stage}">
              <div class="column-header">
                <span class="column-title">${stage}</span>
                <span class="column-count">${leadsInStage.length}</span>
              </div>
              <div class="card-list">
                ${leadsInStage.map(lead => `
                  <div class="kanban-card" id="lead-${lead.id}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 4px;">
                      <span class="lead-title">${lead.name}</span>
                      <span class="lead-score">${lead.score} pts</span>
                    </div>
                    <div class="lead-subtitle">${lead.company} &bull; ${lead.service}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px;">Region: ${lead.region}</div>
                    <div style="font-size: 0.75rem; color: var(--text-secondary);">Owner: ${lead.owner || 'Unassigned'}</div>
                    
                    <div class="lead-meta">
                      <span class="lead-value">$${parseFloat(lead.value).toLocaleString()}</span>
                      <div style="display: flex; gap: 4px;">
                        ${stage !== 'New' ? `<button class="btn btn-secondary" style="padding: 2px 6px; font-size: 0.7rem;" onclick="CRM.moveLeadStage('${lead.id}', -1)" title="Move Back">&larr;</button>` : ''}
                        <button class="btn btn-secondary" style="padding: 2px 6px; font-size: 0.7rem;" onclick="CRM.openLeadModal('${lead.id}')" title="Edit">Edit</button>
                        ${stage !== 'Won' && stage !== 'Lost' ? `<button class="btn btn-secondary" style="padding: 2px 6px; font-size: 0.7rem;" onclick="CRM.moveLeadStage('${lead.id}', 1)" title="Advance">&rarr;</button>` : ''}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  // 3. ACCOUNTS & CONTACTS VIEW
  renderAccounts(target) {
    target.innerHTML = `
      <div class="dashboard-grid">
        <!-- Accounts List Column -->
        <div class="card" style="padding: 0; overflow: hidden;">
          <div class="card-title" style="padding: 24px 24px 0 24px;">
            <span>Verified Customer Accounts</span>
          </div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Account / Company</th>
                <th>Main Contact</th>
                <th>Primary Service</th>
                <th>Region</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${this.state.accounts.map(acc => `
                <tr id="acc-row-${acc.id}">
                  <td><strong>${acc.name}</strong></td>
                  <td>${acc.email}</td>
                  <td>${acc.service}</td>
                  <td>${acc.region}</td>
                  <td>
                    <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.8rem;" onclick="CRM.showAccountDetails('${acc.id}')">Details & Timeline</button>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No accounts established yet. Move leads to "Won" to activate customer accounts automatically.</td></tr>'}
            </tbody>
          </table>
        </div>

        <!-- Account Timeline Panel -->
        <div class="card" id="account-timeline-panel">
          <h3 class="card-title">Interaction Timeline</h3>
          <div style="text-align: center; padding: 40px 0; color: var(--text-secondary);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48" style="margin-bottom: 12px; opacity: 0.5;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            <p>Select a customer account to view interaction history and log communication timeline events.</p>
          </div>
        </div>
      </div>
    `;
  },

  showAccountDetails(accountId) {
    const acc = this.state.accounts.find(a => a.id === accountId);
    if (!acc) return;

    // Highlight row
    const rows = document.querySelectorAll('.data-table tbody tr');
    rows.forEach(r => r.style.backgroundColor = '');
    const activeRow = document.getElementById(`acc-row-${accountId}`);
    if (activeRow) activeRow.style.backgroundColor = 'rgba(139, 92, 246, 0.08)';

    const panel = document.getElementById('account-timeline-panel');
    panel.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary);">${acc.name}</h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${acc.phone} &bull; ${acc.region}</span>
        </div>
        <span class="badge badge-success">${acc.service}</span>
      </div>

      <div class="control-group" style="margin-bottom: 20px;">
        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="CRM.logTimelineEvent('${acc.id}', 'Call')">Log Call</button>
        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="CRM.logTimelineEvent('${acc.id}', 'Email')">Log Email</button>
        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="CRM.logTimelineEvent('${acc.id}', 'Meeting')">Log Meeting</button>
      </div>

      <div class="timeline">
        ${acc.timeline.slice().reverse().map(event => `
          <div class="timeline-event">
            <div class="timeline-event-header">
              <span class="timeline-title">${event.title}</span>
              <span class="timeline-date">${event.date}</span>
            </div>
            <div class="timeline-body">${event.description}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  logTimelineEvent(accountId, type) {
    const acc = this.state.accounts.find(a => a.id === accountId);
    if (!acc) return;

    let desc = "";
    switch (type) {
      case 'Call': desc = "Inbound follow-up call. Client expressed satisfaction with recent onboard steps."; break;
      case 'Email': desc = "Outbound project report status report emailed to stakeholder client representatives."; break;
      case 'Meeting': desc = "Sync review meeting completed. Confirmed deliverables roadmap timelines."; break;
    }

    acc.timeline.push({
      title: `${type} Logged`,
      date: new Date().toISOString().split('T')[0],
      description: desc
    });

    this.saveState('accounts');
    this.showAccountDetails(accountId);
    this.showToast(`${type} logged successfully`, 'success');
  },

  // 4. PROJECT TRACKING VIEW
  renderProjects(target) {
    target.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <p style="color: var(--text-secondary); font-size: 0.95rem;">Checking a milestone triggers **Invoice & Payment Automation** automatically.</p>
        <button class="btn btn-primary" onclick="CRM.openProjectModal()">Create New Project</button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px;">
        ${this.state.projects.map(project => `
          <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary);">${project.name}</h3>
                <span style="font-size: 0.8rem; color: var(--text-muted);">Client: ${project.client}</span>
              </div>
              <span class="badge ${project.status === 'Active' ? 'badge-success' : 'badge-neutral'}">${project.status}</span>
            </div>

            <div class="project-progress-container">
              <span class="progress-label">${project.progress}%</span>
              <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${project.progress}%;"></div>
              </div>
            </div>

            <div style="font-size: 0.85rem; display: flex; justify-content: space-between;">
              <span style="color: var(--text-secondary);">PM: <strong>${project.pm}</strong></span>
              <span style="color: var(--text-secondary);">Due: <strong>${project.deadline}</strong></span>
            </div>

            <div style="border-top: 1px solid var(--border-color); padding-top: 14px;">
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; display: block; margin-bottom: 8px;">Milestone Checklist</span>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${project.milestones.map((m, idx) => `
                  <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-primary); cursor: pointer;">
                    <input type="checkbox" ${m.completed ? 'checked disabled' : ''} onchange="CRM.completeMilestone('${project.id}', ${idx})" style="width: 16px; height: 16px;">
                    <span style="${m.completed ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${m.name}</span>
                    ${m.completed ? `<span style="font-size: 0.75rem; color: var(--color-success); margin-left: auto;">${m.completedDate}</span>` : ''}
                  </label>
                `).join('')}
              </div>
            </div>
            
            <div style="font-size: 0.85rem; color: var(--accent-secondary); font-weight: 600; text-align: right;">
              Budget: $${parseFloat(project.budget).toLocaleString()}
            </div>
          </div>
        `).join('') || '<div class="card" style="grid-column: span 3; text-align: center; color: var(--text-muted);">No active projects listed. Won leads spawn projects automatically.</div>'}
      </div>
    `;
  },

  completeMilestone(projectId, milestoneIndex) {
    const project = this.state.projects.find(p => p.id === projectId);
    if (!project) return;

    // Update milestone state
    project.milestones[milestoneIndex].completed = true;
    project.milestones[milestoneIndex].completedDate = new Date().toISOString().split('T')[0];

    // Recalculate progress
    const completedCount = project.milestones.filter(m => m.completed).length;
    project.progress = Math.round((completedCount / project.milestones.length) * 100);

    if (project.progress === 100) {
      project.status = 'Completed';
    }

    this.saveState('projects');
    this.showToast(`Milestone completed successfully`, 'success');

    // Trigger Invoice Automation trigger
    AutomationEngine.trigger('milestoneCompleted', { project, milestoneIndex });
    
    // Refresh view
    this.renderActiveView();
  },

  // 5. SERVICE REQUESTS VIEW
  renderTickets(target) {
    target.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <p style="color: var(--text-secondary); font-size: 0.95rem;">Simulated Service Request Tickets. Open high-priority cases flash active SLA clocks.</p>
        <button class="btn btn-primary" onclick="CRM.openTicketModal()">Open Ticket</button>
      </div>

      <div class="card" style="padding: 0; overflow: hidden;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Client / Customer</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned Operator</th>
              <th>SLA Clock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.tickets.map(ticket => `
              <tr>
                <td><strong>${ticket.id}</strong></td>
                <td>${ticket.client}</td>
                <td>
                  <strong>${ticket.subject}</strong>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; max-width: 320px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">
                    ${ticket.description || 'No description'}
                  </div>
                </td>
                <td><span class="priority-pill priority-${ticket.priority}">${ticket.priority}</span></td>
                <td>
                  <span class="badge ${ticket.status === 'Open' ? 'badge-danger' : ticket.status === 'In Progress' ? 'badge-warning' : 'badge-success'}">
                    ${ticket.status}
                  </span>
                </td>
                <td>${ticket.assignee || 'Unassigned'}</td>
                <td>
                  ${ticket.status === 'Resolved' ? '<span class="badge badge-success">Closed SLA</span>' : 
                    `<span class="badge badge-danger sla-timer" data-start="${ticket.createdTime}" data-priority="${ticket.priority}">Calculating...</span>`
                  }
                </td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    ${ticket.status !== 'Resolved' ? `
                      <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="CRM.resolveTicket('${ticket.id}')">Resolve</button>
                      ${ticket.status === 'Open' ? `<button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="CRM.workTicket('${ticket.id}')">Claim</button>` : ''}
                    ` : '<span style="font-size: 0.8rem; color: var(--text-muted);">No Action</span>'}
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No support tickets opened.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
    this.updateSLATimers();
  },

  resolveTicket(ticketId) {
    const ticket = this.state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    ticket.status = 'Resolved';
    this.saveState('tickets');
    this.showToast(`Ticket ${ticketId} marked resolved`, 'success');
    
    // Log resolution to automation log
    AutomationEngine.logActivity(
      'Service Request', 
      `Ticket <strong>${ticketId}</strong> ("${ticket.subject}") marked as <strong>Resolved</strong>. SLA clock stopped.`,
      'success'
    );

    this.renderActiveView();
  },

  workTicket(ticketId) {
    const ticket = this.state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    ticket.status = 'In Progress';
    // Assign to active role user
    switch (this.state.currentRole) {
      case 'management': ticket.assignee = "Sarah Jenkins"; break;
      case 'sales': ticket.assignee = "Marcus Vance"; break;
      case 'service': ticket.assignee = "Devin Carter"; break;
      case 'finance': ticket.assignee = "Helena Rostova"; break;
      case 'support': ticket.assignee = "Alex Rivera"; break;
    }
    this.saveState('tickets');
    this.showToast(`Ticket ${ticketId} assigned and marked In Progress`, 'success');
    this.renderActiveView();
  },

  updateSLATimers() {
    const timers = document.querySelectorAll('.sla-timer');
    timers.forEach(timer => {
      const startTime = new Date(timer.getAttribute('data-start')).getTime();
      const priority = timer.getAttribute('data-priority');
      
      let durationHours = 24; // Default Low
      if (priority === 'Urgent') durationHours = 2;
      else if (priority === 'High') durationHours = 4;
      else if (priority === 'Medium') durationHours = 8;
      
      const limitTime = startTime + durationHours * 60 * 60 * 1000;
      
      const updateClock = () => {
        if (!document.body.contains(timer)) return; // prevent leak
        
        const now = Date.now();
        const diff = limitTime - now;
        
        if (diff <= 0) {
          timer.textContent = "SLA BREACHED";
          timer.className = "badge badge-danger sla-pulse";
        } else {
          const hrs = Math.floor(diff / (60 * 60 * 1000));
          const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
          const secs = Math.floor((diff % (60 * 1000)) / 1000);
          
          timer.textContent = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
          
          if (diff < 1 * 60 * 60 * 1000) { // < 1 hour left
            timer.className = "badge badge-danger sla-pulse";
          } else if (diff < 4 * 60 * 60 * 1000) { // < 4 hours left
            timer.className = "badge badge-warning";
          } else {
            timer.className = "badge badge-info";
          }
        }
      };
      
      updateClock();
    });
  },

  startTimers() {
    setInterval(() => {
      this.updateSLATimers();
    }, 1000);
  },

  // 6. INVOICES & PAYMENTS VIEW
  renderInvoices(target) {
    target.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <p style="color: var(--text-secondary); font-size: 0.95rem;">Milestone completion automatically auto-generates invoicing objects below.</p>
        <button class="btn btn-primary" onclick="CRM.openInvoiceModal()">Create Manual Invoice</button>
      </div>

      <div class="card" style="padding: 0; overflow: hidden;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Customer</th>
              <th>Project Reference</th>
              <th>Milestone Stage</th>
              <th>Bill Amount</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${this.state.invoices.map(inv => `
              <tr>
                <td><strong>${inv.id}</strong></td>
                <td>${inv.client}</td>
                <td>${inv.project || 'Manual Ledger'}</td>
                <td><span style="font-size: 0.8rem; color: var(--text-secondary);">${inv.milestone || 'N/A'}</span></td>
                <td><strong>$${parseFloat(inv.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
                <td>${inv.issueDate}</td>
                <td>${inv.dueDate}</td>
                <td>
                  <span class="badge ${inv.status === 'Paid' ? 'badge-success' : inv.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}">
                    ${inv.status}
                  </span>
                </td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="CRM.viewInvoiceDetails('${inv.id}')">View Details</button>
                    ${inv.status !== 'Paid' ? `
                      <button class="btn btn-secondary btn-icon" style="padding: 4px 8px; font-size: 0.75rem; color: var(--color-success);" onclick="CRM.recordPayment('${inv.id}')">Record Payment</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">No invoices recorded.</td></tr>'}
          </tbody>
        </table>
      </div>
    `;
  },

  recordPayment(invoiceId) {
    const inv = this.state.invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    inv.status = 'Paid';
    this.saveState('invoices');
    this.showToast(`Payment recorded for Invoice ${invoiceId}`, 'success');
    
    // Log payment
    AutomationEngine.logActivity(
      'Payment Tracking', 
      `Invoice payment of <strong>$${parseFloat(inv.amount).toLocaleString()}</strong> received from <strong>${inv.client}</strong>. Status updated to <strong>Paid</strong>.`,
      'success'
    );

    this.renderActiveView();
  },

  viewInvoiceDetails(invoiceId) {
    const inv = this.state.invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const modal = document.getElementById('invoice-view-modal');
    const printArea = document.getElementById('invoice-print-area');
    
    const badgeClass = inv.status === 'Paid' ? 'badge-success' : inv.status === 'Overdue' ? 'badge-danger' : 'badge-warning';
    
    document.getElementById('modal-invoice-status').textContent = inv.status.toUpperCase();
    document.getElementById('modal-invoice-status').className = `badge ${badgeClass}`;

    printArea.innerHTML = `
      <div class="invoice-header">
        <div>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: #8b5cf6;">OmniCRM Services Corp</h2>
          <span style="font-size: 0.8rem; color: #64748b;">100 Innovation Way, Suite 400 &bull; Boston, MA</span>
        </div>
        <div style="text-align: right;">
          <h3 style="font-size: 1.4rem; font-weight: 700;">INVOICE</h3>
          <span style="font-size: 0.9rem; color: #475569;">ID: <strong>${inv.id}</strong></span><br>
          <span style="font-size: 0.8rem; color: #64748b;">Date: ${inv.issueDate}</span>
        </div>
      </div>

      <div class="invoice-bill-to">
        <div>
          <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Billed To:</span>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-top: 4px;">${inv.client}</h4>
          <span style="font-size: 0.85rem; color: #475569;">Customer Account Billing</span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Payment Details:</span>
          <p style="font-size: 0.85rem; color: #475569; margin-top: 4px;">
            Terms: Net 14 Days<br>
            Due Date: <strong>${inv.dueDate}</strong>
          </p>
        </div>
      </div>

      <table class="invoice-items-table">
        <thead>
          <tr>
            <th>Line Item / Project milestone reference</th>
            <th style="text-align: right;">Total Fee</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${inv.project || 'Professional Services Operations'}</strong><br>
              <span style="font-size: 0.8rem; color: #64748b;">Milestone Release Payment: ${inv.milestone || 'Project Phase Complete'}</span>
            </td>
            <td style="text-align: right; font-weight: 600;">$${parseFloat(inv.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
          </tr>
        </tbody>
      </table>

      <div class="invoice-totals">
        <div style="font-size: 0.9rem; color: #475569;">Subtotal: $${parseFloat(inv.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        <div style="font-size: 0.9rem; color: #475569;">Tax (0%): $0.00</div>
        <div style="font-size: 1.25rem; font-weight: 800; color: #0f172a; border-top: 2px solid #cbd5e1; padding-top: 8px; margin-top: 8px;">
          Total Due: $${parseFloat(inv.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </div>
      </div>
    `;

    modal.classList.add('active');
  },

  // 7. WORKFLOWS CONFIGURATION VIEW
  renderWorkflows(target) {
    const logs = JSON.parse(localStorage.getItem('crm_automation_logs') || '[]');

    target.innerHTML = `
      <div class="dashboard-grid">
        <!-- Automation Rules Panel -->
        <div class="card">
          <h3 class="card-title">Active Automation Workflows</h3>
          
          <div class="workflow-card">
            <div class="workflow-info">
              <span class="workflow-name">1. Lead Assignment & Auto-Scoring</span>
              <span class="workflow-desc">Triggers when new leads are registered. Scores lead completeness and auto-assigns account manager based on region.</span>
            </div>
            <div class="workflow-status">
              <label class="switch">
                <input type="checkbox" id="wf-assign-switch" ${AutomationEngine.rules.leadAssignment ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="workflow-card">
            <div class="workflow-info">
              <span class="workflow-name">2. Project Kickoff Instantiation</span>
              <span class="workflow-desc">Triggers when lead is marked "Won". Builds account, constructs active project, sets PM/budget and constructs task lists.</span>
            </div>
            <div class="workflow-status">
              <label class="switch">
                <input type="checkbox" id="wf-project-switch" ${AutomationEngine.rules.projectDelivery ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="workflow-card">
            <div class="workflow-info">
              <span class="workflow-name">3. Automated Project Invoicing</span>
              <span class="workflow-desc">Triggers when a project milestone checklist box is completed. Auto-creates invoice ledgers, emails billings and sets terms.</span>
            </div>
            <div class="workflow-status">
              <label class="switch">
                <input type="checkbox" id="wf-invoice-switch" ${AutomationEngine.rules.invoiceAutomation ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="workflow-card">
            <div class="workflow-info">
              <span class="workflow-name">4. SLA Escalation Management</span>
              <span class="workflow-desc">Urgent/High priority tickets auto-escalated to senior team. Background SLA monitor alerts on breach.</span>
            </div>
            <div class="workflow-status">
              <label class="switch">
                <input type="checkbox" id="wf-sla-switch" ${AutomationEngine.rules.slaEscalation ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="workflow-card">
            <div class="workflow-info">
              <span class="workflow-name">5. Lost Lead Review & Re-engagement</span>
              <span class="workflow-desc">When a lead is marked Lost, auto-creates a review task for re-engagement strategy planning.</span>
            </div>
            <div class="workflow-status">
              <label class="switch">
                <input type="checkbox" id="wf-followup-switch" ${AutomationEngine.rules.followUpReminder ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Automation Log Stream Panel -->
        <div class="card">
          <h3 class="card-title">Automation History Audit Logs</h3>
          <div class="log-list" id="audit-log-list" style="max-height: 480px;">
            ${logs.map(log => `
              <div class="log-item">
                <div class="log-icon" style="background-color: ${log.type === 'success' ? 'var(--color-success)' : log.type === 'warning' ? 'var(--color-warning)' : 'var(--accent-primary)'};"></div>
                <div class="log-content">
                  <span class="log-text"><strong>[${log.workflow}]</strong> ${log.message}</span>
                  <span class="log-time">${new Date(log.timestamp).toLocaleString()}</span>
                </div>
              </div>
            `).join('') || '<p style="color: var(--text-secondary); text-align: center;">No triggers registered.</p>'}
          </div>
        </div>
      </div>
    `;

    // Listen to changes on switches
    document.getElementById('wf-assign-switch').addEventListener('change', (e) => {
      AutomationEngine.rules.leadAssignment = e.target.checked;
      AutomationEngine.saveRules();
      this.showToast(`Lead assignment workflow ${e.target.checked ? 'activated' : 'deactivated'}`, 'info');
    });

    document.getElementById('wf-project-switch').addEventListener('change', (e) => {
      AutomationEngine.rules.projectDelivery = e.target.checked;
      AutomationEngine.saveRules();
      this.showToast(`Project creation workflow ${e.target.checked ? 'activated' : 'deactivated'}`, 'info');
    });

    document.getElementById('wf-invoice-switch').addEventListener('change', (e) => {
      AutomationEngine.rules.invoiceAutomation = e.target.checked;
      AutomationEngine.saveRules();
      this.showToast(`Invoice automation workflow ${e.target.checked ? 'activated' : 'deactivated'}`, 'info');
    });

    document.getElementById('wf-sla-switch').addEventListener('change', (e) => {
      AutomationEngine.rules.slaEscalation = e.target.checked;
      AutomationEngine.saveRules();
      this.showToast(`SLA escalation workflow ${e.target.checked ? 'activated' : 'deactivated'}`, 'info');
    });

    document.getElementById('wf-followup-switch').addEventListener('change', (e) => {
      AutomationEngine.rules.followUpReminder = e.target.checked;
      AutomationEngine.saveRules();
      this.showToast(`Lost lead review workflow ${e.target.checked ? 'activated' : 'deactivated'}`, 'info');
    });
  },

  /* ==========================================================================
     Actions & Modals Handlers
     ========================================================================== */
  
  // Lead Status Modification
  moveLeadStage(leadId, dir) {
    const lead = this.state.leads.find(l => l.id === leadId);
    if (!lead) return;

    const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'];
    const currIdx = stages.indexOf(lead.stage);
    let newIdx = currIdx + dir;
    
    if (newIdx < 0 || newIdx >= stages.length) return;
    
    const prevStage = lead.stage;
    lead.stage = stages[newIdx];
    this.saveState('leads');
    this.showToast(`Lead status updated to ${lead.stage}`, 'success');

    // If transitioned to Won, run Project trigger
    if (lead.stage === 'Won' && prevStage !== 'Won') {
      AutomationEngine.trigger('leadWon', lead);
      this.loadState(); // reload newly spawned projects/accounts
    }
    if (lead.stage === 'Lost' && prevStage !== 'Lost') {
      AutomationEngine.trigger('leadLost', lead);
    }

    this.renderActiveView();
  },

  // Toast Alerts Notification Center
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type === 'danger' ? 'danger' : type}`;
    
    toast.innerHTML = `
      <span class="toast-msg">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove toast in 4.5 seconds
    setTimeout(() => {
      if (container.contains(toast)) {
        toast.style.animation = 'slide-in 0.3s reverse forwards ease-out';
        setTimeout(() => toast.remove(), 300);
      }
    }, 4500);
  },

  // Modals operations
  openLeadModal(leadId = null) {
    const modal = document.getElementById('lead-modal');
    const form = document.getElementById('lead-form');
    
    if (leadId) {
      // Edit Mode
      const lead = this.state.leads.find(l => l.id === leadId);
      if (!lead) return;
      
      document.getElementById('lead-modal-title').textContent = "Edit Lead Details";
      document.getElementById('lead-id').value = lead.id;
      document.getElementById('lead-name').value = lead.name;
      document.getElementById('lead-company').value = lead.company;
      document.getElementById('lead-email').value = lead.email;
      document.getElementById('lead-phone').value = lead.phone || '';
      document.getElementById('lead-value').value = lead.value;
      document.getElementById('lead-region').value = lead.region;
      document.getElementById('lead-stage').value = lead.stage;
      document.getElementById('lead-service').value = lead.service;
    } else {
      // Create Mode
      document.getElementById('lead-modal-title').textContent = "Add New Lead";
      form.reset();
      document.getElementById('lead-id').value = '';
    }
    
    modal.classList.add('active');
  },

  openProjectModal() {
    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-form');
    form.reset();
    document.getElementById('project-id').value = '';
    
    // Set default deadline 60 days in future
    const dateInput = document.getElementById('project-deadline');
    const futureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    dateInput.value = futureDate;
    
    modal.classList.add('active');
  },

  openTicketModal() {
    const modal = document.getElementById('ticket-modal');
    const form = document.getElementById('ticket-form');
    form.reset();
    document.getElementById('ticket-id').value = '';
    modal.classList.add('active');
  },

  openInvoiceModal() {
    const modal = document.getElementById('invoice-modal');
    const form = document.getElementById('invoice-form');
    form.reset();
    
    // Default due date to 14 days out
    const dueInput = document.getElementById('invoice-due');
    dueInput.value = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    modal.classList.add('active');
  },

  /* ==========================================================================
     Global Listeners Wiring
     ========================================================================== */
  setupListeners() {
    // 1. Sidebar Nav Navigation Links
    const menuLinks = document.querySelectorAll('.sidebar-menu .menu-item');
    menuLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // 2. Role Selector Switcher Event
    document.getElementById('role-select').addEventListener('change', (e) => {
      this.state.currentRole = e.target.value;
      localStorage.setItem('crm_role', e.target.value);
      this.updateUserInterfaceForRole();
      this.showToast(`Role profile switched to: ${e.target.options[e.target.selectedIndex].text}`, 'info');
    });

    // 3. Theme Toggle Trigger
    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
      if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        this.state.theme = 'light';
        localStorage.setItem('crm_theme', 'light');
      } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        this.state.theme = 'dark';
        localStorage.setItem('crm_theme', 'dark');
      }
      this.showToast(`Theme switched to ${this.state.theme} mode`, 'success');
    });

    // 4. Logout Button
    document.getElementById('logout-btn').addEventListener('click', () => {
      Auth.logout();
    });

    // 5. Quick Actions Trigger Open Main Hub Action Modal
    const quickAddBtn = document.getElementById('quick-add-btn');
    const quickModal = document.getElementById('quick-action-modal');
    
    quickAddBtn.addEventListener('click', () => {
      quickModal.classList.add('active');
    });

    // Handle clicks inside Quick Action Hub
    const quickBtns = document.querySelectorAll('.quick-btn');
    quickBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        quickModal.classList.remove('active');
        const action = btn.getAttribute('data-action');
        if (action === 'new-lead') this.openLeadModal();
        if (action === 'new-project') this.openProjectModal();
        if (action === 'new-ticket') this.openTicketModal();
        if (action === 'new-invoice') this.openInvoiceModal();
      });
    });

    // 5. Close Modals Buttons Handler
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    modalOverlays.forEach(overlay => {
      // Click on background
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
      
      // Cancel buttons
      const cancelBtns = overlay.querySelectorAll('.cancel-btn');
      cancelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          overlay.classList.remove('active');
        });
      });

      // Close 'x' button
      const closeBtn = overlay.querySelector('.close-modal-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          overlay.classList.remove('active');
        });
      }
    });

    // 6. Submit Forms Listeners
    // Lead Form
    document.getElementById('lead-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('lead-id').value;
      const leadData = {
        id: id || 'LD-' + Math.floor(Math.random() * 9000 + 1000),
        name: document.getElementById('lead-name').value,
        company: document.getElementById('lead-company').value,
        email: document.getElementById('lead-email').value,
        phone: document.getElementById('lead-phone').value,
        value: parseFloat(document.getElementById('lead-value').value) || 0,
        region: document.getElementById('lead-region').value,
        stage: document.getElementById('lead-stage').value,
        service: document.getElementById('lead-service').value,
        createdDate: new Date().toISOString().split('T')[0]
      };

      const isNew = !id;
      
      if (isNew) {
        this.state.leads.push(leadData);
        this.saveState('leads');
        this.showToast(`Lead created successfully`, 'success');
        // Trigger leadCreated automation hook
        AutomationEngine.trigger('leadCreated', leadData);
      } else {
        const idx = this.state.leads.findIndex(l => l.id === id);
        if (idx !== -1) {
          const oldStage = this.state.leads[idx].stage;
          this.state.leads[idx] = leadData;
          this.saveState('leads');
          this.showToast(`Lead details updated`, 'success');
          
          if (leadData.stage === 'Won' && oldStage !== 'Won') {
            AutomationEngine.trigger('leadWon', leadData);
          }
        }
      }

      this.loadState(); // Refresh local datasets
      document.getElementById('lead-modal').classList.remove('active');
      this.renderActiveView();
    });

    // Project Form
    document.getElementById('project-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const projectData = {
        id: 'PRJ-' + Math.floor(Math.random() * 9000 + 1000),
        name: document.getElementById('project-name').value,
        client: document.getElementById('project-client').value,
        pm: document.getElementById('project-pm').value,
        budget: parseFloat(document.getElementById('project-budget').value) || 0,
        deadline: document.getElementById('project-deadline').value,
        milestones: [
          { name: "Kickoff & Requirements", completed: false, completedDate: null },
          { name: "Design & Implementation", completed: false, completedDate: null },
          { name: "Testing & Handover", completed: false, completedDate: null }
        ],
        progress: 0,
        status: 'Active'
      };

      this.state.projects.push(projectData);
      this.saveState('projects');
      this.showToast(`Project created successfully`, 'success');
      
      document.getElementById('project-modal').classList.remove('active');
      this.renderActiveView();
    });

    // Ticket Form
    document.getElementById('ticket-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const ticketData = {
        id: 'TCK-' + Math.floor(Math.random() * 900 + 100),
        subject: document.getElementById('ticket-subject').value,
        client: document.getElementById('ticket-client').value,
        status: 'Open',
        priority: document.getElementById('ticket-priority').value,
        description: document.getElementById('ticket-description').value,
        assignee: 'Unassigned',
        createdTime: new Date().toISOString()
      };

      this.state.tickets.unshift(ticketData);
      this.saveState('tickets');
      this.showToast(`Ticket opened successfully`, 'success');
      
      AutomationEngine.trigger('ticketCreated', ticketData);
      AutomationEngine.logActivity(
        'Service Request',
        `New support case <strong>${ticketData.id}</strong> ("${ticketData.subject}") filed by <strong>${ticketData.client}</strong>. SLA timer started.`,
        'warning'
      );

      document.getElementById('ticket-modal').classList.remove('active');
      this.renderActiveView();
    });

    // Invoice Form
    document.getElementById('invoice-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const invoiceData = {
        id: 'INV-' + Math.floor(Math.random() * 90000 + 10000),
        projectId: null,
        client: document.getElementById('invoice-client').value,
        project: document.getElementById('invoice-project').value || 'Manual Service Billing',
        milestone: 'Manual ledger entry',
        amount: parseFloat(document.getElementById('invoice-amount').value) || 0,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: document.getElementById('invoice-due').value,
        status: 'Pending'
      };

      this.state.invoices.push(invoiceData);
      this.saveState('invoices');
      this.showToast(`Manual invoice registered`, 'success');
      
      document.getElementById('invoice-modal').classList.remove('active');
      this.renderActiveView();
    });

    // 7. Automation events sync listener
    window.addEventListener('automation-log-added', (e) => {
      // If we are currently viewing the Dashboard or Workflows page, update the HTML log logs stream
      if (this.state.currentView === 'dashboard') {
        const list = document.getElementById('dashboard-log-list');
        if (list) {
          const log = e.detail;
          const logItem = document.createElement('div');
          logItem.className = 'log-item';
          logItem.innerHTML = `
            <div class="log-icon" style="background-color: ${log.type === 'success' ? 'var(--color-success)' : log.type === 'warning' ? 'var(--color-warning)' : 'var(--accent-primary)'};"></div>
            <div class="log-content">
              <span class="log-text"><strong>[${log.workflow}]</strong> ${log.message}</span>
              <span class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          `;
          list.insertBefore(logItem, list.firstChild);
          // Keep last 100
          if (list.children.length > 100) {
            list.lastChild.remove();
          }
        }
      } else if (this.state.currentView === 'workflows') {
        const list = document.getElementById('audit-log-list');
        if (list) {
          const log = e.detail;
          const logItem = document.createElement('div');
          logItem.className = 'log-item';
          logItem.innerHTML = `
            <div class="log-icon" style="background-color: ${log.type === 'success' ? 'var(--color-success)' : log.type === 'warning' ? 'var(--color-warning)' : 'var(--accent-primary)'};"></div>
            <div class="log-content">
              <span class="log-text"><strong>[${log.workflow}]</strong> ${log.message}</span>
              <span class="log-time">${new Date(log.timestamp).toLocaleString()}</span>
            </div>
          `;
          list.insertBefore(logItem, list.firstChild);
        }
      }
    });
  }
};

// Start application
window.addEventListener('DOMContentLoaded', () => {
  CRM.init();
});
