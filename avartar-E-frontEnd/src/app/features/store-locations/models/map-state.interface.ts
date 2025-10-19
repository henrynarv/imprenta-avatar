export interface MapViewState {
  center: google.maps.LatLngLiteral;  // Centro actual del mapa
  zoom: number;                       // Nivel de zoom actual
  bounds?: google.maps.LatLngBounds;  // Límites visibles (opcional)
  lastUpdated: Date;                  // Cuándo se actualizó por última vez
}
