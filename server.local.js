const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');

app.use(express.json());
app.use(express.static(__dirname));

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

function projectPath(id) {
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(DATA_DIR, `${safe}.json`);
}

// List all projects (returns array of { id, name })
app.get('/api/projects', (req, res) => {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const list = files.map(f => {
    const id = path.basename(f, '.json');
    try {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
      return { id, name: data.name || id };
    } catch {
      return { id, name: id };
    }
  });
  res.json(list);
});

// Get a single project
app.get('/api/projects/:id', (req, res) => {
  const fp = projectPath(req.params.id);
  if (!fs.existsSync(fp)) return res.status(404).json({ error: 'not found' });
  res.json(JSON.parse(fs.readFileSync(fp, 'utf8')));
});

// Create or update a project
app.post('/api/projects/:id', (req, res) => {
  const fp = projectPath(req.params.id);
  fs.writeFileSync(fp, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

// Delete a project
app.delete('/api/projects/:id', (req, res) => {
  const fp = projectPath(req.params.id);
  if (fs.existsSync(fp)) fs.unlinkSync(fp);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Project Tracker running at http://localhost:${PORT}`);
});
