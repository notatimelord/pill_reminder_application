const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const MONGO_URI =
  "mongodb://ami-fullstack-admin:i7iPL2ABWzC0J3euvEaKATnU8D9DKZCg@database:27000/ami-fullstack?authSource=admin";

router.post('/login', async (req, res) => {
  const { surname, password } = req.body;

  if (!surname || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }

  let client;
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();

    const db = client.db('ami-fullstack');

    const user = await db.collection('users').findOne({
      surname: surname,
      password: password
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ❗ ΜΗΝ στέλνεις password πίσω
    delete user.password;

    res.json({
      success: true,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    if (client) await client.close();
  }
});

module.exports = router;
