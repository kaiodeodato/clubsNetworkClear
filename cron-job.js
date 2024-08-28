const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function loadJsonData(collectionName, filePath) {
    try {
        console.log(`Loading data from ${filePath}...`);
        const data = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(data);

        if (parsedData.length === 0) {
            console.log(`No data to insert into ${collectionName}`);
            return;
        }

        await prisma[collectionName].createMany({
            data: parsedData,
        });

        console.log(`Data inserted into ${collectionName}`);
    } catch (error) {
        console.error(`Error loading data for ${collectionName}:`, error);
    }
}

async function cleanupAndLoadData() {
    try {
        console.log('Starting database cleanup...');
        await prisma.notification.deleteMany();
        await prisma.comment.deleteMany();
        await prisma.post.deleteMany();
        await prisma.user.deleteMany();
        console.log('Database cleared.');

        console.log('Loading data...');
        await loadJsonData('notification', path.join(__dirname, 'data/notification.json'));
        await loadJsonData('comment', path.join(__dirname, 'data/comments.json'));
        await loadJsonData('post', path.join(__dirname, 'data/posts.json'));
        await loadJsonData('user', path.join(__dirname, 'data/users.json'));
        console.log('Data loaded successfully.');
    } catch (error) {
        console.error('Error during cleanup and data loading:', error);
    } finally {
        await prisma.$disconnect();
        console.log('Disconnected from database.');
    }
}

cleanupAndLoadData();
