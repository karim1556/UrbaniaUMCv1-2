const mongoose = require('mongoose');

// Function to ensure indexes are properly set up
// This will run after connection is established
const ensureIndexes = async () => {
    try {
        console.log('Ensuring database indexes are properly configured...');
        
        // Get the Volunteer model if it exists
        if (mongoose.modelNames().includes('Volunteer')) {
            const Volunteer = mongoose.model('Volunteer');
            
            // Get existing indexes
            const collection = Volunteer.collection;
            const indexes = await collection.indexes();
            
            console.log('Current indexes:', indexes);
            
            // Drop all existing indexes except the _id index
            for (const index of indexes) {
                if (index.name !== '_id_') {
                    try {
                        console.log(`Dropping index: ${index.name}`);
                        await collection.dropIndex(index.name);
                        console.log(`Index ${index.name} dropped successfully`);
                    } catch (dropError) {
                        console.error(`Error dropping index ${index.name}:`, dropError);
                    }
                }
            }
            
            // Recreate only non-unique indexes (no unique user index)
            try {
                // Only create a non-unique user index (for query performance, not uniqueness)
                console.log('Creating user index (non-unique)...');
                await Volunteer.collection.createIndex(
                    { user: 1 }, 
                    { unique: false, background: true }
                );
                
                // Ensure email is NOT unique
                console.log('Creating email index...');
                await Volunteer.collection.createIndex(
                    { email: 1 }, 
                    { unique: false, background: true }
                );
                
                console.log('Volunteer collection indexes created successfully');
            } catch (createError) {
                console.error('Error creating indexes:', createError);
            }
        }
    } catch (error) {
        console.error('Error managing indexes:', error);
    }
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Ensure indexes are properly set up after connection
        await ensureIndexes();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Handle connection errors after initial connection
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during MongoDB connection closure:', err);
        process.exit(1);
    }
});

module.exports = connectDB; 