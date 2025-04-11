import { users, replicationRequests, type User, type InsertUser, type ReplicationRequest, type InsertReplicationRequest } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createReplicationRequest(request: InsertReplicationRequest): Promise<ReplicationRequest>;
  getReplicationRequests(): Promise<ReplicationRequest[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private replicationRequests: Map<number, ReplicationRequest>;
  userCurrentId: number;
  requestCurrentId: number;

  constructor() {
    this.users = new Map();
    this.replicationRequests = new Map();
    this.userCurrentId = 1;
    this.requestCurrentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createReplicationRequest(insertRequest: InsertReplicationRequest): Promise<ReplicationRequest> {
    const id = this.requestCurrentId++;
    const request: ReplicationRequest = { ...insertRequest, id };
    this.replicationRequests.set(id, request);
    return request;
  }

  async getReplicationRequests(): Promise<ReplicationRequest[]> {
    return Array.from(this.replicationRequests.values());
  }
}

export const storage = new MemStorage();
