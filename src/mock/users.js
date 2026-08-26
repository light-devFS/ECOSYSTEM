/**
 * Utilisateurs de démonstration.
 * À supprimer lorsque authService.login() appellera Firebase Auth.
 */
export const mockUsers = [
  {
    id: 'u1',
    identifier: 'eleve.demo',
    email: 'eleve@edusphere.test',
    password: 'demo1234',
    name: 'Awa Mensah',
    role: 'eleve',
  },
  {
    id: 'u2',
    identifier: 'parent.demo',
    email: 'parent@edusphere.test',
    password: 'demo1234',
    name: 'Boris Mensah',
    role: 'parent',
  },
  {
    id: 'u3',
    identifier: 'admin.demo',
    email: 'admin@edusphere.test',
    password: 'demo1234',
    name: 'Sarah ADJOWA',
    role: 'admin',
  },
]