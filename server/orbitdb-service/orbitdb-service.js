// orbitdb-service.js
import express from 'express';

import { createHelia } from 'helia'
import { createOrbitDB } from '@orbitdb/core'
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { identify } from "@libp2p/identify";
import { createLibp2p } from 'libp2p'
import { randomUUID } from 'crypto'; // Node.js >= 14.17

const Libp2pOptions = {
    services: {
        pubsub: gossipsub({
            // neccessary to run a single peer
            allowPublishToZeroTopicPeers: true
        }),
        identify: identify()
    }
}

const app = express();
app.use(express.json());
let db;
let libp2p;
let ipfs;
let orbitdb;

async function initOrbitDB() {
    libp2p = await createLibp2p({ ...Libp2pOptions })
    ipfs = await createHelia({ libp2p })
    orbitdb = await createOrbitDB({ ipfs })

    // Create / Open a database. Defaults to db type "events".
    db = await orbitdb.open("bulb-social", { type: "documents" })

    // Listen for updates from peers
    db.events.on("update", async entry => {
        console.log(entry)
        const all = await db.all()
        console.log(all)
    })
}

app.post('/orbitdb/add', async (req, res) => {
    try {
        if (!db) {
            console.error('OrbitDB not initialized');
            return res.status(503).json({ error: 'OrbitDB not initialized' });
        }
        let doc = req.body;
        if (!doc._id) {
            doc._id = randomUUID();
        }
        const entry = await db.put(doc);
        console.log('Added entry:', entry);
        res.json({ hash: entry, db_address: db.address });
    } catch (e) {
        console.log('Error adding entry to OrbitDB:', e);
        res.status(500).json({ error: e.message });
    }
});

const PORT = 3000;
let server = app.listen(PORT, async () => {
    try {
        await initOrbitDB();
        console.log(`OrbitDB service running on port ${PORT}`);
    } catch (e) {
        console.error('Failed to initialize OrbitDB:', e);
        process.exit(1);
    }
});



// Graceful shutdown
async function shutdown() {
    console.log('Shutting down...');
    if (server) server.close();
    if (db && db.close) await db.close();
    if (orbitdb && orbitdb.close) await orbitdb.close();
    if (ipfs && ipfs.stop) await ipfs.stop();
    if (libp2p && libp2p.stop) await libp2p.stop();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);