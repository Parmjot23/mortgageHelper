import { seedChecklistTemplates } from '../src/lib/seed'

async function main() {
  await seedChecklistTemplates()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    process.exit(0)
  })
