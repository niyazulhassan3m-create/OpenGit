const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'crm.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'management'
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      value REAL DEFAULT 0,
      region TEXT DEFAULT '',
      stage TEXT DEFAULT 'New',
      service TEXT DEFAULT '',
      owner TEXT DEFAULT '',
      score INTEGER DEFAULT 0,
      createdDate TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      client TEXT DEFAULT '',
      company TEXT DEFAULT '',
      status TEXT DEFAULT 'Active',
      progress INTEGER DEFAULT 0,
      deadline TEXT DEFAULT '',
      team TEXT DEFAULT '',
      value REAL DEFAULT 0,
      priority TEXT DEFAULT 'Medium',
      createdDate TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      industry TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      status TEXT DEFAULT 'Active',
      owner TEXT DEFAULT '',
      tier TEXT DEFAULT 'Standard',
      value REAL DEFAULT 0,
      createdDate TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      subject TEXT NOT NULL,
      client TEXT DEFAULT '',
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Open',
      agent TEXT DEFAULT '',
      category TEXT DEFAULT '',
      createdDate TEXT DEFAULT '',
      lastUpdated TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      projectId TEXT DEFAULT '',
      client TEXT DEFAULT '',
      project TEXT DEFAULT '',
      milestone TEXT DEFAULT '',
      amount REAL DEFAULT 0,
      issueDate TEXT DEFAULT '',
      dueDate TEXT DEFAULT '',
      status TEXT DEFAULT 'Pending'
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      project TEXT DEFAULT '',
      assignee TEXT DEFAULT '',
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Pending',
      deadline TEXT DEFAULT '',
      createdDate TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS automation_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT DEFAULT '',
      workflow TEXT DEFAULT '',
      message TEXT DEFAULT '',
      type TEXT DEFAULT 'info'
    );
  `);
}

function seedUsers() {
  const count = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (count.c > 0) return;

  const users = [
    { id: 'USR-001', name: 'Sarah Jenkins', email: 'admin@omnicrm.com', password: 'admin123', role: 'management' },
    { id: 'USR-002', name: 'Marcus Vance', email: 'sales@omnicrm.com', password: 'sales123', role: 'sales' },
    { id: 'USR-003', name: 'Devin Carter', email: 'service@omnicrm.com', password: 'service123', role: 'service' },
    { id: 'USR-004', name: 'Helena Rostova', email: 'finance@omnicrm.com', password: 'finance123', role: 'finance' },
    { id: 'USR-005', name: 'Alex Rivera', email: 'support@omnicrm.com', password: 'support123', role: 'support' }
  ];

  const insert = db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)');
  for (const u of users) {
    const hash = bcrypt.hashSync(u.password, 10);
    insert.run(u.id, u.name, u.email, hash, u.role);
  }
}

function seedData() {
  const count = db.prepare('SELECT COUNT(*) as c FROM leads').get();
  if (count.c > 0) return;

  const leads = [
    { id: 'LD-8342', name: 'John Peterson', company: 'Apex Global', email: 'j.peterson@apex.com', phone: '+1 (555) 012-9988', value: 45000, region: 'North America', stage: 'Qualified', service: 'Cloud Migration', owner: 'Sarah Jenkins', score: 80, createdDate: '2026-06-18' },
    { id: 'LD-9271', name: 'Sophie Dubois', company: 'Lumiere Fashion', email: 's.dubois@lumiere.fr', phone: '+33 1 42 68 53 11', value: 12000, region: 'Europe', stage: 'Contacted', service: 'Digital Marketing', owner: 'Hans Schmidt', score: 60, createdDate: '2026-06-19' },
    { id: 'LD-1034', name: 'Raj Patel', company: 'NovaTech India', email: 'raj@novatech.in', phone: '+91 98765 43210', value: 78000, region: 'Asia Pacific', stage: 'Proposal', service: 'AI Implementation', owner: 'Sarah Jenkins', score: 90, createdDate: '2026-06-19' },
    { id: 'LD-4492', name: 'Maria Silva', company: 'Verde Energy', email: 'maria@verde.com.br', phone: '+55 11 99999-8888', value: 23000, region: 'South America', stage: 'Negotiation', service: 'Consulting', owner: 'Lena Schmidt', score: 75, createdDate: '2026-06-20' },
    { id: 'LD-5583', name: 'Ahmed Al-Rashid', company: 'Desert Technologies', email: 'ahmed@deserttech.ae', phone: '+971 50 123 4567', value: 92000, region: 'Middle East', stage: 'Qualified', service: 'Cloud Migration', owner: 'Marcus Vance', score: 85, createdDate: '2026-06-20' }
  ];
  const insert = db.prepare('INSERT INTO leads (id, name, company, email, phone, value, region, stage, service, owner, score, createdDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const r of leads) insert.run(r.id, r.name, r.company, r.email, r.phone, r.value, r.region, r.stage, r.service, r.owner, r.score, r.createdDate);

  const projects = [
    { id: 'PRJ-1024', name: 'Software Development - Pacific Tech', client: 'Pacific Tech', company: 'Pacific Tech', status: 'Active', progress: 65, deadline: '2026-09-15', team: '5 Developers', value: 124000, priority: 'High', createdDate: '2026-04-10' },
    { id: 'PRJ-2078', name: 'Cloud Migration - Atlas Corp', client: 'Atlas Corporation', company: 'Atlas Corporation', status: 'Active', progress: 40, deadline: '2026-10-01', team: '3 Engineers', value: 95000, priority: 'Critical', createdDate: '2026-05-22' },
    { id: 'PRJ-3091', name: 'AI Chatbot - TechVista', client: 'TechVista Solutions', company: 'TechVista', status: 'Planning', progress: 15, deadline: '2026-11-30', team: '4 AI Specialists', value: 150000, priority: 'Medium', createdDate: '2026-06-01' },
    { id: 'PRJ-4012', name: 'ERP Implementation - GreenLeaf', client: 'GreenLeaf Industries', company: 'GreenLeaf', status: 'Active', progress: 30, deadline: '2026-08-20', team: '6 Consultants', value: 200000, priority: 'High', createdDate: '2026-03-15' }
  ];
  const pi = db.prepare('INSERT INTO projects (id, name, client, company, status, progress, deadline, team, value, priority, createdDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const r of projects) pi.run(r.id, r.name, r.client, r.company, r.status, r.progress, r.deadline, r.team, r.value, r.priority, r.createdDate);

  const accounts = [
    { id: 'ACC-6712', name: 'Pacific Tech', industry: 'Technology', email: 'hello@pacific.tech', phone: '+1 (555) 908-1122', status: 'Active', owner: 'Sarah Jenkins', tier: 'Premium', value: 180000, createdDate: '2026-01-10' },
    { id: 'ACC-8345', name: 'Atlas Corporation', industry: 'Logistics', email: 'info@atlas.io', phone: '+1 (555) 237-8890', status: 'Active', owner: 'Marcus Vance', tier: 'Standard', value: 120000, createdDate: '2026-02-15' },
    { id: 'ACC-9901', name: 'GreenLeaf Industries', industry: 'Manufacturing', email: 'contact@greenleaf.com', phone: '+1 (555) 554-1234', status: 'Active', owner: 'Devin Carter', tier: 'Premium', value: 250000, createdDate: '2025-11-05' },
    { id: 'ACC-1123', name: 'TechVista Solutions', industry: 'Technology', email: 'info@techvista.dev', phone: '+1 (555) 341-9900', status: 'Active', owner: 'Sarah Jenkins', tier: 'Standard', value: 95000, createdDate: '2026-03-20' },
    { id: 'ACC-4456', name: 'NovaTech India', industry: 'Technology', email: 'info@novatech.in', phone: '+91 80 4567 8901', status: 'Active', owner: 'Marcus Vance', tier: 'Standard', value: 78000, createdDate: '2026-04-01' }
  ];
  const ai = db.prepare('INSERT INTO accounts (id, name, industry, email, phone, status, owner, tier, value, createdDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const r of accounts) ai.run(r.id, r.name, r.industry, r.email, r.phone, r.status, r.owner, r.tier, r.value, r.createdDate);

  const tickets = [
    { id: 'TCK-7781', subject: 'Login authentication failing in prod', client: 'Atlas Corporation', priority: 'Critical', status: 'Open', agent: 'Alex Rivera', category: 'Bug', createdDate: '2026-06-09', lastUpdated: '2026-06-10' },
    { id: 'TCK-4493', subject: 'Data export missing invoice amounts', client: 'Pacific Tech', priority: 'High', status: 'In Progress', agent: 'Alex Rivera', category: 'Bug', createdDate: '2026-06-08', lastUpdated: '2026-06-11' },
    { id: 'TCK-2317', subject: 'Need additional user role for auditing', client: 'GreenLeaf Industries', priority: 'Medium', status: 'Open', agent: 'Unassigned', category: 'Feature', createdDate: '2026-06-10', lastUpdated: '2026-06-10' },
    { id: 'TCK-8845', subject: 'Dashboard performance slow for large datasets', client: 'TechVista Solutions', priority: 'Medium', status: 'Open', agent: 'Unassigned', category: 'Performance', createdDate: '2026-06-09', lastUpdated: '2026-06-09' },
    { id: 'TCK-5621', subject: 'API integration returning 503 errors', client: 'NovaTech India', priority: 'Critical', status: 'In Progress', agent: 'Alex Rivera', category: 'Bug', createdDate: '2026-06-11', lastUpdated: '2026-06-11' }
  ];
  const ti = db.prepare('INSERT INTO tickets (id, subject, client, priority, status, agent, category, createdDate, lastUpdated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const r of tickets) ti.run(r.id, r.subject, r.client, r.priority, r.status, r.agent, r.category, r.createdDate, r.lastUpdated);

  const invoices = [
    { id: 'INV-40122', projectId: 'PRJ-1024', client: 'Pacific Tech', project: 'Software Development - Pacific Tech', milestone: 'Kickoff & Requirements', amount: 20666.67, issueDate: '2026-06-12', dueDate: '2026-06-26', status: 'Paid' }
  ];
  const ii = db.prepare('INSERT INTO invoices (id, projectId, client, project, milestone, amount, issueDate, dueDate, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const r of invoices) ii.run(r.id, r.projectId, r.client, r.project, r.milestone, r.amount, r.issueDate, r.dueDate, r.status);

  const al = db.prepare('INSERT INTO automation_logs (id, timestamp, workflow, message, type) VALUES (?, ?, ?, ?, ?)');
  al.run('LOG-001', new Date().toISOString(), 'System Init', 'OmniCRM database populated with mock data.', 'info');
}

function initDb() {
  const d = getDb();
  seedUsers();
  seedData();
  return d;
}

module.exports = { getDb, initDb };
