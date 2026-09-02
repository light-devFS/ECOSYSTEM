import { mockIndicators } from '@/mock/ministereIndicators'

/**
 * indicatorsService
 * Le filtrage par région est déjà prévu pour un filtrage côté serveur
 * une fois Firestore branché. Ces données sont volontairement
 * agrégées : aucun résultat individuel d'élève n'y figure.
 */
export async function getIndicators(region) {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return {
    regions: mockIndicators.regions,
    etablissements: mockIndicators.parRegion[region] || [],
  }
}