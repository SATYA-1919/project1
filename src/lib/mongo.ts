import { MongoClient, type Db } from "mongodb";

// One shared MongoDB connection for the whole app (auth, events and analytics
// all use it). We stash the connect promise on globalThis so that hot-reloads
// in development reuse the same pool instead of opening a new one each time.
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
      // Fail fast if the database can't be reached (e.g. Atlas isn't allowing
      // the deployment's IP) instead of hanging until the serverless function
      // times out. Surfaces a clear error in the logs.
      serverSelectionTimeoutMS: 8000,
    })
      .connect()
      .catch((err) => {
        // Don't cache a failed connection — otherwise one bad first attempt
        // (Atlas waking up, a network blip) would wedge every later request.
        // Clear it so the next call retries from scratch.
        globalForMongo.__conveneMongo = undefined;
        throw err;
      });
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
