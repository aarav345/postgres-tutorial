import app from './app.js';
import prisma from './database/prisma.client.js';


const PORT = process.env.PORT || 3000;

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await prisma.$disconnect();
    process.exit(0);
});

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}/api/v1`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default server;