import { prisma } from './prisma'

export async function seedChecklistTemplates() {
  try {
    // Check if templates already exist
    const existingTemplates = await prisma.checklistTemplate.count()
    if (existingTemplates > 0) {
      console.log('Checklist templates already exist, skipping seed')
      return
    }

    // Salaried borrower template
    const salariedTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'Salaried Borrower Documents',
        persona: 'salaried',
        items: {
          create: [
            { label: 'Notice of Assessment (NOA) - Last 2 years', required: true, sortOrder: 1 },
            { label: 'Pay stubs - Last 30 days', required: true, sortOrder: 2 },
            { label: 'Employment letter - Current position', required: true, sortOrder: 3 },
            { label: 'Bank statements - Last 3 months', required: true, sortOrder: 4 },
            { label: 'Credit report consent', required: true, sortOrder: 5 },
            { label: 'Identification (Driver\'s License/Passport)', required: true, sortOrder: 6 },
            { label: 'Proof of address (Utility bill)', required: true, sortOrder: 7 },
            { label: 'Divorce decree (if applicable)', required: false, sortOrder: 8 },
          ],
        },
      },
    })

    // Self-employed borrower template
    const selfEmployedTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'Self-Employed Borrower Documents',
        persona: 'self_employed',
        items: {
          create: [
            { label: 'Notice of Assessment (NOA) - Last 3 years', required: true, sortOrder: 1 },
            { label: 'Business tax returns - Last 3 years', required: true, sortOrder: 2 },
            { label: 'Personal tax returns - Last 3 years', required: true, sortOrder: 3 },
            { label: 'Bank statements - Business & Personal (Last 6 months)', required: true, sortOrder: 4 },
            { label: 'Profit & Loss statements - Last 2 years', required: true, sortOrder: 5 },
            { label: 'Balance sheets - Last 2 years', required: true, sortOrder: 6 },
            { label: 'Credit report consent', required: true, sortOrder: 7 },
            { label: 'Identification (Driver\'s License/Passport)', required: true, sortOrder: 8 },
            { label: 'Proof of address (Utility bill)', required: true, sortOrder: 9 },
            { label: 'Business license/registration', required: true, sortOrder: 10 },
          ],
        },
      },
    })

    // Rental property template
    const rentalTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'Rental Property Documents',
        persona: 'rental',
        items: {
          create: [
            { label: 'Property appraisal report', required: true, sortOrder: 1 },
            { label: 'Property tax assessment', required: true, sortOrder: 2 },
            { label: 'Rental agreement/lease', required: true, sortOrder: 3 },
            { label: 'Rent roll - Last 12 months', required: true, sortOrder: 4 },
            { label: 'Property management agreement (if applicable)', required: false, sortOrder: 5 },
            { label: 'Insurance policy', required: true, sortOrder: 6 },
            { label: 'Maintenance records', required: false, sortOrder: 7 },
            { label: 'Tenant references', required: false, sortOrder: 8 },
          ],
        },
      },
    })

    console.log('Seeded checklist templates successfully')
  } catch (error) {
    console.error('Failed to seed checklist templates:', error)
  }
}
