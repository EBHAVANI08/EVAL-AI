import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB || 'aiexaminerpro';

if (!uri) {
  throw new Error('Please add MONGODB_URI to your .env file');
}

const options = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  family: 4, // Force IPv4 — fixes TLS issues on Windows
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const c = new MongoClient(uri, options);
  return c.connect();
}

// Always reset stale connection in dev (handles SSL errors / broken pools)
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise().catch((err) => {
      global._mongoClientPromise = undefined;
      throw err;
    });
  }
} else {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
}

export async function getDb(): Promise<Db> {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise().catch((err) => {
      global._mongoClientPromise = undefined;
      throw err;
    });
  }
  const c = await global._mongoClientPromise;
  return c.db(dbName);
}

export default global._mongoClientPromise!;
