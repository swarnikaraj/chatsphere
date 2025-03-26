// lib/mongodb.ts
import { MongoClient } from 'mongodb';

declare global {
    // Allowing global variable type declaration
    // eslint-disable-next-line no-var
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI!;  // Ensure MONGODB_URI is provided via environment variables
const options = {};

let client: MongoClient;


// Check if we're running in development mode and reuse the client connection to avoid multiple connections
if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
}

// Use the existing promise or create a new one
const clientPromise: Promise<MongoClient> = global._mongoClientPromise!;

export default clientPromise;
