import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

BigInt.prototype.toJSON = function () {
    return this.toString();
};

process.on('beforeExit', async () => {
    await prisma.$disconnect()
})

export default prisma