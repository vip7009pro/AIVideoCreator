import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const projects = await prisma.project.findMany();
    console.log('Projects count:', projects.length);
    if (projects.length > 0) {
      console.log('Last project ID:', projects[projects.length - 1].id);
    }

    const assets = await prisma.projectAsset.findMany();
    console.log('Assets count:', assets.length);
    console.log('Asset details:', JSON.stringify(assets.map(a => ({ 
      id: a.id, 
      type: a.assetType, 
      projectId: a.projectId 
    })), null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
