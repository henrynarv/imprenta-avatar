//Tipos de reportes disponibles en el sistema
export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  ALL = 'ALL'
}


//Mapeo de labels para mostrar en la UI
export const ReportTypeLabels = {
  [ReportType.DAILY]: 'Diario',
  [ReportType.WEEKLY]: 'Semanal',
  [ReportType.MONTHLY]: 'Mensual',
  [ReportType.YEARLY]: 'Anual',
  [ReportType.ALL]: 'Todos'
}
