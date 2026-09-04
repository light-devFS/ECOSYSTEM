export const mockNationalDashboard = {
  stats: {
    etablissements: 47,
    etablissementsCaption: 'sur 62 établissements pilotes',
    elevesSuivis: 31400,
    elevesSuivisCaption: '+2 100 ce trimestre',
    tauxMaitrise: '69%',
    tauxMaitriseCaption: '+2% ce trimestre',
    usageHorsLigne: '19%',
    usageHorsLigneCaption: 'des sessions mensuelles',
  },
  repartitionParRegion: [
    { id: 'r1', region: 'Maritime', etablissements: 21, eleves: 14200, maitrise: '72%' },
    { id: 'r2', region: 'Plateaux', etablissements: 12, eleves: 7900, maitrise: '66%' },
    { id: 'r3', region: 'Centrale', etablissements: 7, eleves: 4100, maitrise: '63%' },
    { id: 'r4', region: 'Kara', etablissements: 5, eleves: 3300, maitrise: '68%' },
    { id: 'r5', region: 'Savanes', etablissements: 2, eleves: 1900, maitrise: '61%' },
  ],
}