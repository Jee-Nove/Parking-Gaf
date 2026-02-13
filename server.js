const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'parkings.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// GET all parkings
app.get('/api/parkings', (req, res) => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Erreur lecture données' });
  }
});

// SAVE all parkings (full replace)
app.put('/api/parkings', (req, res) => {
  try {
    const parkings = req.body;
    if (!Array.isArray(parkings)) {
      return res.status(400).json({ error: 'Format invalide' });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(parkings, null, 2), 'utf-8');
    res.json({ ok: true, count: parkings.length });
  } catch (err) {
    res.status(500).json({ error: 'Erreur sauvegarde' });
  }
});

// UPDATE single parking
app.patch('/api/parkings/:id', (req, res) => {
  try {
    const parkings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    const idx = parkings.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Parking non trouvé' });
    parkings[idx] = { ...parkings[idx], ...req.body };
    fs.writeFileSync(DATA_FILE, JSON.stringify(parkings, null, 2), 'utf-8');
    res.json(parkings[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur mise à jour' });
  }
});

// ADD parking
app.post('/api/parkings', (req, res) => {
  try {
    const parkings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    parkings.push(req.body);
    fs.writeFileSync(DATA_FILE, JSON.stringify(parkings, null, 2), 'utf-8');
    res.json(req.body);
  } catch (err) {
    res.status(500).json({ error: 'Erreur ajout' });
  }
});

// DELETE parking
app.delete('/api/parkings/:id', (req, res) => {
  try {
    let parkings = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    parkings = parkings.filter(p => p.id !== req.params.id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(parkings, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur suppression' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🅿️  Parking GAF server running on port ${PORT}`);
});
