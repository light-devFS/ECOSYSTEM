import { mockComprehension } from '@/mock/comprehension'

/**
 * comprehensionService
 * Le paramètre classe est déjà prévu pour un filtrage côté serveur
 * une fois Firestore branché.
 */
export async function getComprehension(classe) {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockComprehension
}