import { mockExamBank } from '@/mock/examBank'

/**
 * examBankService
 * Le filtrage est fait ici (pas dans la vue) pour que le jour où
 * Firestore sera branché, il suffise de remplacer le corps de cette
 * fonction par une vraie requête filtrée côté serveur.
 */
export async function getExamBank(filters = {}) {
  await new Promise((resolve) => setTimeout(resolve, 400))

  const resultats = mockExamBank.resultats.filter((item) => {
    const matiereOk = !filters.matiere || filters.matiere === 'Toutes' || item.matiere === filters.matiere
    const typeOk = !filters.type || item.type === filters.type
    const niveauOk = !filters.niveau || item.niveau === filters.niveau
    return matiereOk && typeOk && niveauOk
  })

  return {
    filtres: mockExamBank.filtres,
    total: mockExamBank.total,
    resultats,
  }
}