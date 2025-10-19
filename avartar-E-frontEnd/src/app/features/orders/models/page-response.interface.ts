export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;//pagina actual
  size: number;//cantidad de elementos por pagina
}
