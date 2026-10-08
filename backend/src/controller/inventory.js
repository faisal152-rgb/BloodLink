const Inventory = require('../models/Inventory');
const Redis = require('../config/redis');

// Get full inventory
async function Getinventory(req, res) {
  try {
    const cachedInventory = await Redis.get(`inventory:${inventory}`);
    if (cachedInventory) {
      return res.status(200).json(JSON.parse(cachedInventory));
    }

    const inventory = await Inventory.find({});
    // If empty, initialize it for first time
    if (inventory.length === 0) {
      const groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
      const initial = await Inventory.insertMany(groups.map(g => ({ group: g, units: 10 })));
      return res.status(200).json(initial);
    }
    await Redis.set(`inventory:${inventory}`, JSON.stringify(stock));
    return res.status(200).json(stock);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update stock for a specific group
async function Updateinventory(req, res) {
  const { units } = req.body;
  await Redis.del(`inventory:${inventory}`);
  try {
    const stock = await Inventory.findOne({ group: req.params.group });
    if (!stock) return res.status(404).json({ message: 'Blood group not found' });
    stock.units = units;
    await Redis.set(`inventory:${inventory}`, JSON.stringify(stock));
    await stock.save();
    return res.status(200).json(stock);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {Getinventory,Updateinventory};
