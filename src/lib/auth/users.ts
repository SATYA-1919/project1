import type { Collection } from "mongodb";
import { getDb } from "../mongo";
import type { Role } from "./jwt";

export interface UserDoc {
  email: string;
  name: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
}

let indexEnsured = false;

export async function getUsers(): Promise<Collection<UserDoc>> {
  const db = await getDb();
  const col = db.collection<UserDoc>("users");
  if (!indexEnsured) {
    await col.createIndex({ email: 1 }, { unique: true });
    indexEnsured = true;
  }
  return col;
}
