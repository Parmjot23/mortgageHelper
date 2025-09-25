import { prisma } from './prisma'

export async function seedChecklistTemplates() {
  try {
    // Check if templates already exist
    const existingTemplates = await prisma.checklistTemplate.count()
    if (existingTemplates > 0) {
      console.log('Checklist templates already exist, skipping seed')
      return
    }

    // Purchase Application Template
    const purchaseTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'Purchase Application Documents',
        leadType: 'PURCHASE',
        items: {
          create: [
            { label: 'Notice of Assessment (NOA) - Last 2 years', required: true, sortOrder: 1 },
            { label: 'Pay stubs - Last 30 days', required: true, sortOrder: 2 },
            { label: 'Employment letter - Current position', required: true, sortOrder: 3 },
            { label: 'Bank statements - Last 3 months', required: true, sortOrder: 4 },
            { label: 'Credit report consent', required: true, sortOrder: 5 },
            { label: 'Identification (Driver\'s License/Passport)', required: true, sortOrder: 6 },
            { label: 'Proof of address (Utility bill)', required: true, sortOrder: 7 },
            { label: 'Property purchase agreement', required: true, sortOrder: 8 },
            { label: 'Property appraisal report', required: true, sortOrder: 9 },
            { label: 'Down payment proof/bank draft', required: true, sortOrder: 10 },
            { label: 'Mortgage pre-approval letter', required: true, sortOrder: 11 },
            { label: 'Divorce decree (if applicable)', required: false, sortOrder: 12 },
          ],
        },
      },
    })

    // Refinance Application Template
    const refinanceTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'Refinance Application Documents',
        leadType: 'REFINANCE',
        items: {
          create: [
            { label: 'Notice of Assessment (NOA) - Last 2 years', required: true, sortOrder: 1 },
            { label: 'Pay stubs - Last 30 days', required: true, sortOrder: 2 },
            { label: 'Employment letter - Current position', required: true, sortOrder: 3 },
            { label: 'Bank statements - Last 3 months', required: true, sortOrder: 4 },
            { label: 'Credit report consent', required: true, sortOrder: 5 },
            { label: 'Identification (Driver\'s License/Passport)', required: true, sortOrder: 6 },
            { label: 'Proof of address (Utility bill)', required: true, sortOrder: 7 },
            { label: 'Current mortgage statement', required: true, sortOrder: 8 },
            { label: 'Property tax assessment', required: true, sortOrder: 9 },
            { label: 'Property appraisal report (if required)', required: false, sortOrder: 10 },
            { label: 'Home insurance policy', required: true, sortOrder: 11 },
            { label: 'Property title/deed', required: true, sortOrder: 12 },
            { label: 'Divorce decree (if applicable)', required: false, sortOrder: 13 },
          ],
        },
      },
    })

    // Renewal Application Template
    const renewalTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'Renewal Application Documents',
        leadType: 'RENEWAL',
        items: {
          create: [
            { label: 'Notice of Assessment (NOA) - Last 2 years', required: true, sortOrder: 1 },
            { label: 'Pay stubs - Last 30 days', required: true, sortOrder: 2 },
            { label: 'Employment letter - Current position', required: true, sortOrder: 3 },
            { label: 'Bank statements - Last 3 months', required: true, sortOrder: 4 },
            { label: 'Credit report consent', required: true, sortOrder: 5 },
            { label: 'Identification (Driver\'s License/Passport)', required: true, sortOrder: 6 },
            { label: 'Proof of address (Utility bill)', required: true, sortOrder: 7 },
            { label: 'Current mortgage statement', required: true, sortOrder: 8 },
            { label: 'Property tax assessment', required: true, sortOrder: 9 },
            { label: 'Home insurance policy', required: true, sortOrder: 10 },
            { label: 'Property title/deed', required: false, sortOrder: 11 },
            { label: 'Divorce decree (if applicable)', required: false, sortOrder: 12 },
          ],
        },
      },
    })

    // Equity Line Application Template
    const equityLineTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'Equity Line Application Documents',
        leadType: 'EQUITY_LINE',
        items: {
          create: [
            { label: 'Notice of Assessment (NOA) - Last 2 years', required: true, sortOrder: 1 },
            { label: 'Pay stubs - Last 30 days', required: true, sortOrder: 2 },
            { label: 'Employment letter - Current position', required: true, sortOrder: 3 },
            { label: 'Bank statements - Last 3 months', required: true, sortOrder: 4 },
            { label: 'Credit report consent', required: true, sortOrder: 5 },
            { label: 'Identification (Driver\'s License/Passport)', required: true, sortOrder: 6 },
            { label: 'Proof of address (Utility bill)', required: true, sortOrder: 7 },
            { label: 'Current mortgage statement', required: true, sortOrder: 8 },
            { label: 'Property tax assessment', required: true, sortOrder: 9 },
            { label: 'Property appraisal report', required: true, sortOrder: 10 },
            { label: 'Home insurance policy', required: true, sortOrder: 11 },
            { label: 'Property title/deed', required: true, sortOrder: 12 },
            { label: 'Equity line purpose statement', required: true, sortOrder: 13 },
            { label: 'Divorce decree (if applicable)', required: false, sortOrder: 14 },
          ],
        },
      },
    })

    // Other Application Template (General)
    const otherTemplate = await prisma.checklistTemplate.create({
      data: {
        name: 'General Application Documents',
        leadType: 'OTHER',
        items: {
          create: [
            { label: 'Notice of Assessment (NOA) - Last 2 years', required: true, sortOrder: 1 },
            { label: 'Pay stubs - Last 30 days', required: true, sortOrder: 2 },
            { label: 'Employment letter - Current position', required: true, sortOrder: 3 },
            { label: 'Bank statements - Last 3 months', required: true, sortOrder: 4 },
            { label: 'Credit report consent', required: true, sortOrder: 5 },
            { label: 'Identification (Driver\'s License/Passport)', required: true, sortOrder: 6 },
            { label: 'Proof of address (Utility bill)', required: true, sortOrder: 7 },
            { label: 'Additional documents as required', required: false, sortOrder: 8 },
            { label: 'Divorce decree (if applicable)', required: false, sortOrder: 9 },
          ],
        },
      },
    })

    console.log('Seeded checklist templates successfully')
  } catch (error) {
    console.error('Failed to seed checklist templates:', error)
  }
}
