const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearAllTemplates() {
  try {
    // Delete all checklist item templates first (due to foreign key constraint)
    await prisma.checklistItemTemplate.deleteMany({})
    // Delete all checklist templates
    await prisma.checklistTemplate.deleteMany({})
    console.log('Cleared all templates')
  } catch (error) {
    console.error('Error clearing templates:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearAllTemplates()
