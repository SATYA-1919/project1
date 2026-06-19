import { MongoClient, type Db } from "mongodb";

/**
 * Single MongoDB connection for the whole app — auth, events and the
 * behavioural analytics stream all live here. The connect promise is cached on
 * `globalThis` so Next.js HMR doesn't open a new pool on every reload.
 */
const globalForMongo = globalThis as unknown as {
  __conveneMongo?: Promise<MongoClient>;
};

function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local or your deployment environment variables.",
    );
  }
  if (!globalForMongo.__conveneMongo) {
    globalForMongo.__conveneMongo = new MongoClient(uri, {
      maxPoolSize: 10,
    }).connect();
  }
  return globalForMongo.__conveneMongo;
}

export function hasMongoConfig(): boolean {
  return Boolean(process.env.MONGODB_URI);
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(process.env.MONGODB_DB || "convene");
}
