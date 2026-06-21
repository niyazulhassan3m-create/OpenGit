const AIAssistant = {
  chatHistory: [],
  isOpen: false,

  init() {
    this.createChatUI();
    this.setupListeners();
  },

  createChatUI() {
    const chatHTML = `
      <div id="chatbot-toggle" class="chatbot-toggle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </div>

      <div id="chatbot-panel" class="chatbot-panel">
        <div class="chatbot-header">
          <div class="chatbot-header-info">
            <div class="chatbot-avatar">AI</div>
            <div>
              <div class="chatbot-title">OmniAI Assistant</div>
              <div class="chatbot-status">Online</div>
            </div>
          </div>
          <button id="chatbot-close" class="chatbot-close-btn">&times;</button>
        </div>
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="chat-message bot">
            <div class="msg-content">Hi! I'm your AI assistant. Unga CRM-oda enna vena ketkalam!<br><br>
              <em>Example questions:</em><br>
              • How many leads irukku?<br>
              • Show me projects<br>
              • Total revenue enna?<br>
              • Open tickets count<br>
              • Who assigned to leads?</div>
          </div>
        </div>
        <div class="chatbot-input-area">
          <input type="text" id="chatbot-input" placeholder="Type a question..." autocomplete="off">
          <button id="chatbot-send" class="chatbot-send-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHTML);
  },

  setupListeners() {
    document.getElementById('chatbot-toggle').addEventListener('click', () => this.toggleChat());
    document.getElementById('chatbot-close').addEventListener('click', () => this.toggleChat());
    document.getElementById('chatbot-send').addEventListener('click', () => this.handleSend());
    document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSend();
    });
  },

  toggleChat() {
    this.isOpen = !this.isOpen;
    document.getElementById('chatbot-panel').classList.toggle('open', this.isOpen);
    document.getElementById('chatbot-toggle').classList.toggle('hidden', this.isOpen);
    if (this.isOpen) {
      setTimeout(() => document.getElementById('chatbot-input').focus(), 300);
    }
  },

  handleSend() {
    const input = document.getElementById('chatbot-input');
    const msg = input.value.trim();
    if (!msg) return;

    this.addMessage(msg, 'user');
    input.value = '';

    setTimeout(() => {
      const reply = this.getReply(msg);
      this.addMessage(reply, 'bot');
    }, 300 + Math.random() * 400);
  },

  addMessage(text, sender) {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;
    div.innerHTML = `<div class="msg-content">${text}</div>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  getReply(input) {
    const q = input.toLowerCase();

    // Greetings
    if (q.match(/^(hi|hello|hey|vanakkam|hai)/)) {
      return 'Vanakkam! 👋 How can I help you with your CRM today?';
    }

    // Lead count
    if (q.match(/how many leads|lead count|total leads|leads irukku/)) {
      const leads = JSON.parse(localStorage.getItem('crm_leads') || '[]');
      const won = leads.filter(l => l.stage === 'Won').length;
      const lost = leads.filter(l => l.stage === 'Lost').length;
      const active = leads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').length;
      return `<strong>Total Leads:</strong> ${leads.length}<br>
              <span style="color:var(--color-success)">● Active:</span> ${active}<br>
              <span style="color:var(--color-success)">● Won:</span> ${won}<br>
              <span style="color:var(--color-danger)">● Lost:</span> ${lost}`;
    }

    // Projects
    if (q.match(/projects|project list|show projects/)) {
      const projects = JSON.parse(localStorage.getItem('crm_projects') || '[]');
      if (projects.length === 0) return 'No projects yet. Won leads-a projects automatically create aagum!';
      return projects.map(p =>
        `<strong>${p.name}</strong> - ${p.status} (${p.progress}%)`
      ).join('<br>');
    }

    // Revenue
    if (q.match(/revenue|total revenue|income|sales revenue/)) {
      const leads = JSON.parse(localStorage.getItem('crm_leads') || '[]');
      const won = leads.filter(l => l.stage === 'Won');
      const total = won.reduce((a, b) => a + (parseFloat(b.value) || 0), 0);
      return `<strong>Total Won Revenue:</strong> $${total.toLocaleString()}<br>
              <strong>Won Deals:</strong> ${won.length}`;
    }

    // Tickets
    if (q.match(/tickets|open tickets|support tickets/)) {
      const tickets = JSON.parse(localStorage.getItem('crm_tickets') || '[]');
      const open = tickets.filter(t => t.status !== 'Resolved').length;
      const total = tickets.length;
      return `<strong>Total Tickets:</strong> ${total}<br>
              <strong>Open:</strong> ${open}<br>
              <strong>Resolved:</strong> ${total - open}`;
    }

    // Invoices
    if (q.match(/invoices|invoice|payment/)) {
      const invoices = JSON.parse(localStorage.getItem('crm_invoices') || '[]');
      const paid = invoices.filter(i => i.status === 'Paid').length;
      const pending = invoices.filter(i => i.status === 'Pending').length;
      const totalAmt = invoices.reduce((a, b) => a + (parseFloat(b.amount) || 0), 0);
      return `<strong>Total Invoices:</strong> ${invoices.length}<br>
              <span style="color:var(--color-success)">● Paid:</span> ${paid}<br>
              <span style="color:var(--color-warning)">● Pending:</span> ${pending}<br>
              <strong>Total Amount:</strong> $${totalAmt.toLocaleString()}`;
    }

    // Accounts
    if (q.match(/accounts|customers|clients/)) {
      const accounts = JSON.parse(localStorage.getItem('crm_accounts') || '[]');
      if (accounts.length === 0) return 'No accounts yet.';
      return accounts.map(a => `<strong>${a.name}</strong> - ${a.service} (${a.region})`).join('<br>');
    }

    // Role / Who am I
    if (q.match(/who am i|my role|current role/)) {
      const role = localStorage.getItem('crm_role') || 'management';
      const roleNames = { management: 'Management (Admin)', sales: 'Sales Team', service: 'Service Delivery', finance: 'Finance Team', support: 'Customer Support' };
      return `You are logged in as: <strong>${roleNames[role] || role}</strong>`;
    }

    // Help
    if (q.match(/help|what can you do|commands/)) {
      return `<strong>I can answer:</strong><br>
              • Lead count & pipeline status<br>
              • Project list & progress<br>
              • Total revenue<br>
              • Ticket & SLA status<br>
              • Invoice & payment info<br>
              • Accounts & clients<br>
              • Your current role`;
    }

    // If nothing matches
    return `Sorry, I didn't understand that. Try asking about:<br>
            • <em>How many leads?</em><br>
            • <em>Show projects</em><br>
            • <em>Total revenue</em><br>
            • <em>Open tickets</em><br>
            • <em>Help</em>`;
  }
};

document.addEventListener('DOMContentLoaded', () => AIAssistant.init());
