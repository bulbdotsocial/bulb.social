declare module '@orbitdb/core' {
  import type { Helia } from 'helia';

  interface OrbitDB {
    id: string;
    stop(): Promise<void>;
  }

  interface CreateOrbitDBOptions {
    ipfs: Helia;
    id?: string;
  }

  export function createOrbitDB(options: CreateOrbitDBOptions): Promise<OrbitDB>;
}
