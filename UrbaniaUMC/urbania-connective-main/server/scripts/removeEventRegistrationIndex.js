const mongoose = require('mongoose');
require('dotenv').config();

const removeEventRegistrationIndex = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/UrbaniaConnective2');
        console.log('Connected to MongoDB');

        // Get the registrations collection
        const db = mongoose.connection.db;
        const collection = db.collection('registrations');

        // List all indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key, unique: idx.unique })));

        // Find the problematic index
        const problematicIndex = indexes.find(index => 
            index.key && 
            (index.key.eventId === 1 && index.key.userId === 1) ||
            (index.key.event === 1 && index.key.user === 1)
        );

        if (problematicIndex) {
            console.log('Found problematic index:', problematicIndex.name);
            console.log('Removing index:', problematicIndex.name);
            
            // Drop the index
            await collection.dropIndex(problematicIndex.name);
            console.log('Successfully removed problematic index');
        } else {
            console.log('No problematic index found');
        }

        // List indexes again to confirm
        const updatedIndexes = await collection.indexes();
        console.log('Updated indexes:', updatedIndexes.map(idx => ({ name: idx.name, key: idx.key, unique: idx.unique })));

        console.log('Index removal completed successfully');
    } catch (error) {
        console.error('Error removing index:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the script
removeEventRegistrationIndex(); 