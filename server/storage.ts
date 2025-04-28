import { 
  users, type User, type InsertUser,
  dnsLookups, type DnsLookup, type InsertDnsLookup,
  ipInfo, type IpInfo, type InsertIpInfo 
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // DNS lookup methods
  saveDnsLookup(lookup: InsertDnsLookup): Promise<DnsLookup>;
  getDnsLookups(): Promise<DnsLookup[]>;
  
  // IP info methods
  saveIpInfo(info: InsertIpInfo): Promise<IpInfo>;
  getIpInfoByIp(ipAddress: string): Promise<IpInfo | undefined>;
  
  // Port scan history
  savePortScan(ipAddress: string, port: number, isOpen: boolean): Promise<void>;
  
  // Custom DNS resolve history
  saveDnsResolve(domain: string, dnsServer: string | null): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dnsLookups: Map<number, DnsLookup>;
  private ipInfos: Map<number, IpInfo>;
  private portScans: Array<{ipAddress: string, port: number, isOpen: boolean, timestamp: string}>;
  private dnsResolves: Array<{domain: string, dnsServer: string | null, timestamp: string}>;
  currentUserId: number;
  currentDnsLookupId: number;
  currentIpInfoId: number;

  constructor() {
    this.users = new Map();
    this.dnsLookups = new Map();
    this.ipInfos = new Map();
    this.portScans = [];
    this.dnsResolves = [];
    this.currentUserId = 1;
    this.currentDnsLookupId = 1;
    this.currentIpInfoId = 1;
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
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // DNS lookup methods
  async saveDnsLookup(insertLookup: InsertDnsLookup): Promise<DnsLookup> {
    const id = this.currentDnsLookupId++;
    const lookup: DnsLookup = { ...insertLookup, id };
    this.dnsLookups.set(id, lookup);
    return lookup;
  }

  async getDnsLookups(): Promise<DnsLookup[]> {
    return Array.from(this.dnsLookups.values());
  }

  // IP info methods
  async saveIpInfo(insertIpInfo: InsertIpInfo): Promise<IpInfo> {
    const id = this.currentIpInfoId++;
    const info: IpInfo = { ...insertIpInfo, id };
    this.ipInfos.set(id, info);
    return info;
  }

  async getIpInfoByIp(ipAddress: string): Promise<IpInfo | undefined> {
    return Array.from(this.ipInfos.values()).find(
      (info) => info.ipAddress === ipAddress
    );
  }

  // Port scan history
  async savePortScan(ipAddress: string, port: number, isOpen: boolean): Promise<void> {
    this.portScans.push({
      ipAddress,
      port,
      isOpen,
      timestamp: new Date().toISOString()
    });
  }
  
  // Custom DNS resolve history
  async saveDnsResolve(domain: string, dnsServer: string | null): Promise<void> {
    this.dnsResolves.push({
      domain,
      dnsServer,
      timestamp: new Date().toISOString()
    });
  }
}

export const storage = new MemStorage();
