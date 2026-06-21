const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getDb, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'omnicrm-dev-secret-key-2026';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Init database
initDb();

// --- Auth Middleware ---
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// --- Auth Routes ---
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password required' });
  }
  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered!' });
  }
  const id = 'USR-' + Math.floor(Math.random() * 90000 + 10000);
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)').run(id, name, email, hash, role || 'management');
  res.json({ success: true, msg: 'Account created! Please sign in.' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid email or password!' });
  }
  const token = jwt.sign({ userId: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { userId: user.id, name: user.name, email: user.email, role: user.role } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// --- Generic CRUD Helper ---
function crudRoutes(table, idPrefix, fields) {
  const router = express.Router();

  // GET all
  router.get('/', authMiddleware, (req, res) => {
    const db = getDb();
    const rows = db.prepare(`SELECT * FROM ${table}`).all();
    res.json(rows);
  });

  // GET one
  router.get('/:id', authMiddleware, (req, res) => {
    const db = getDb();
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  });

  // POST create
  router.post('/', authMiddleware, (req, res) => {
    const db = getDb();
    const keys = Object.keys(fields);
    const id = idPrefix + '-' + Math.floor(Math.random() * 90000 + 10000);
    const values = keys.map(k => req.body[k] !== undefined ? req.body[k] : fields[k]);
    const placeholders = keys.map(() => '?').join(', ');
    db.prepare(`INSERT INTO ${table} (id, ${keys.join(', ')}) VALUES ('${id}', ${placeholders})`).run(...values);
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id);
    res.json(row);
  });

  // PUT update
  router.put('/:id', authMiddleware, (req, res) => {
    const db = getDb();
    const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const keys = Object.keys(fields);
    const sets = keys.map(k => `${k} = ?`).join(', ');
    const values = keys.map(k => req.body[k] !== undefined ? req.body[k] : existing[k]);
    db.prepare(`UPDATE ${table} SET ${sets} WHERE id = ?`).run(...values, req.params.id);
    const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    res.json(row);
  });

  // DELETE
  router.delete('/:id', authMiddleware, (req, res) => {
    const db = getDb();
    const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
    res.json({ success: true });
  });

  return router;
}

app.use('/api/leads', crudRoutes('leads', 'LD', { name: '', company: '', email: '', phone: '', value: 0, region: '', stage: 'New', service: '', owner: '', score: 0, createdDate: '' }));
app.use('/api/projects', crudRoutes('projects', 'PRJ', { name: '', client: '', company: '', status: 'Active', progress: 0, deadline: '', team: '', value: 0, priority: 'Medium', createdDate: '' }));
app.use('/api/accounts', crudRoutes('accounts', 'ACC', { name: '', industry: '', email: '', phone: '', status: 'Active', owner: '', tier: 'Standard', value: 0, createdDate: '' }));
app.use('/api/tickets', crudRoutes('tickets', 'TCK', { subject: '', client: '', priority: 'Medium', status: 'Open', agent: '', category: '', createdDate: '', lastUpdated: '' }));
app.use('/api/invoices', crudRoutes('invoices', 'INV', { projectId: '', client: '', project: '', milestone: '', amount: 0, issueDate: '', dueDate: '', status: 'Pending' }));
app.use('/api/tasks', crudRoutes('tasks', 'TSK', { title: '', project: '', assignee: '', priority: 'Medium', status: 'Pending', deadline: '', createdDate: '' }));

// --- Health Check (for Render) ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// --- Automation Logs ---
app.get('/api/automation-logs', authMiddleware, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM automation_logs ORDER BY timestamp DESC').all();
  res.json(rows);
});

app.post('/api/automation-logs', authMiddleware, (req, res) => {
  const db = getDb();
  const { workflow, message, type } = req.body;
  const id = 'LOG-' + String(Date.now()).slice(-6) + Math.floor(Math.random() * 100);
  db.prepare('INSERT INTO automation_logs (id, timestamp, workflow, message, type) VALUES (?, ?, ?, ?, ?)').run(id, new Date().toISOString(), workflow || '', message || '', type || 'info');
  res.json({ success: true });
});

// Serve index.html for all other routes (SPA support)
app.use((req, res) => {
  if (!req.path.startsWith('/api/'))
    res.sendFile(path.join(__dirname, 'index.html'));
  else
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`OmniCRM backend running at http://localhost:${PORT}/`);
});
