const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop legacy/orphaned indexes that cause duplicate key errors
    try {
      const usersCollection = conn.connection.collection('users');
      const indexes = await usersCollection.indexes();
      const hasUsernameIndex = indexes.some(idx => idx.name === 'username_1');
      if (hasUsernameIndex) {
        await usersCollection.dropIndex('username_1');
        console.log('✅ Dropped orphaned username_1 index from users collection');
      }
    } catch (idxError) {
      // Ignore if index doesn't exist
    }

    const notificationsCollection = conn.connection.collection('notifications');
    try {
      const indexes = await notificationsCollection.indexes();
      const expiryIndex = indexes.find(
        (index) => index.name === 'expiresAt_1' && index.expireAfterSeconds !== undefined
      );
      if (expiryIndex) {
        await notificationsCollection.dropIndex(expiryIndex.name);
        console.info('Dropped legacy notification expiry index');
      }

      await notificationsCollection.updateMany(
        { expiresAt: { $exists: true } },
        { $unset: { expiresAt: '' } }
      );
    } catch (error) {
      if (error.code !== 26 && error.codeName !== 'NamespaceNotFound') {
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
