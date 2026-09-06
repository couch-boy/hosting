import fs from 'fs';
import path from 'path';
import knex from 'knex';
import bcrypt from 'bcrypt';
import 'dotenv/config';

import knexConfig from './knexfile.js';
import { createApp } from './app.js';

const port = process.env.PORT || 3000;

// Ensure persistent directory exists if DB_PATH is set
if (process.env.DB_PATH) {
    const dir = path.dirname(process.env.DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Determine current environment ('development' by default when running locally)
const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment] || knexConfig.development;
const db = knex(config);

const app = createApp(db);

async function initialiseDatabase() {
    try {
        // Run migrations if they haven't been run yet
        await db.migrate.latest();

        console.log('Database migrations completed successfully.');

        // Check if any users exist in the table
        const users = await db('users').select('username');

        if (users.length === 0) {
            console.log('No users found. Creating default account...');

            const hashedPassword = await bcrypt.hash('admin', 10);
            // Add default user with hashed password
            await db('users').insert([{
                username: 'admin',
                password: hashedPassword,
                role: 'admin',
                keybinds: null,
                settings: null
            }]);

            console.log('Default user created...');
            console.log('Username: "admin"');
            console.log('Password: "admin"');
        }
    } catch (error) {
        console.log('Failed to run database migrations:', error);
        throw error;
    }
}

async function startServer() {
    try {
        await initialiseDatabase();

        const host = '0.0.0.0'; // Render requires listening on 0.0.0.0
        app.listen(port, host, () => {
            console.log(`Server listening on port ${port}`);
        });

    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
}

startServer();