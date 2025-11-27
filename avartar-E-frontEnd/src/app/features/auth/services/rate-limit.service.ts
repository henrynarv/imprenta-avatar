import { computed, effect, inject, Injectable, Injector, runInInjectionContext, signal } from '@angular/core';
import { ForgotPasswordResponse } from '../models/auth-interface';

/**
Servicio especializado en manejar rate limiting con countdown(cuenta atras) persistente
 para el proceso de recuperación de contraseña

 Responsabilidad: Gestionar el cooldown entre solicitudes de password reset
 basado en la respuesta del backend y mantener persistencia entre sesiones
 */

@Injectable({
  providedIn: 'root'
})
export class RateLimitService {

  //clave para persistencia en localStorage
  private readonly RATE_LIMIT_KEY = 'password_reset_cooldown_end';

  private injector = inject(Injector);

  //senal reactiva para el tiempo restante en segundos
  private _countdownSeconds = signal<number>(0);


  //persistencua autmatica y countDown(cuenta atras)
  private countdownEffect = effect(() => {
    const seconds = this._countdownSeconds();

    if (seconds > 0) {
      //programa el proximo decremento
      const timer = setTimeout(() => {
        this._countdownSeconds.update(current => current > 0 ? current - 1 : 0);
      }, 1000)

      // Cleanup function del effect
      return () => clearTimeout(timer);
    } else {
      //countdown completado , lipia persistencia
      localStorage.removeItem(this.RATE_LIMIT_KEY);
      return
    }
  });

  //comouted; estado de rate limiting
  isRateLimited = computed(() => this._countdownSeconds() > 0);

  //computed tiempo formateadi para mostrar
  formattedTimeRemaining = computed(() => this.formatTime(this._countdownSeconds()))


  //computed - tiempo actual en segundos
  currentTime = computed(() => this._countdownSeconds())


  constructor() {
    this.initializeCountdownFromStorage();
  }


  //Inicializa el countdown desde localStorage al cargar la aplicación
  //Esto permite que si el usuario cierra la aplicación y vuelve,
  //el contador continúe desde donde estaba
  private initializeCountdownFromStorage(): void {
    const savedEndTime = localStorage.getItem(this.RATE_LIMIT_KEY);
    if (savedEndTime) {
      const endTime = new Date(savedEndTime).getTime();
      const now = new Date().getTime();
      const remainingTime = Math.max(0, endTime - now);

      if (remainingTime > 0) {
        // Ejecutar en contexto de inyección para el effect
        runInInjectionContext(this.injector, () => {
          this.startCountdown(remainingTime);
        })
      }
    }
  };

  //Maneja la respuesta del backend cuando hay rate limiting
  //Extrae nextAttemptAllowed de la respuesta y configura el countdown

  handleRateLimitResponse(response: ForgotPasswordResponse): void {
    const nextAttemptAllowed = response.nextAttemptAllowed;

    if (nextAttemptAllowed && response.emailSent === false) {
      console.log('🔄 Activando countdown por rate limiting. Tiempo restante:', nextAttemptAllowed);
      this.startCountdownFromEndTime(nextAttemptAllowed);
    } else {
      console.log('✅ Respuesta exitosa - No activar countdown');
      // En una respuesta exitosa, limpiamos cualquier countdown previo
      this.clearCountdown();
    }
  }

  //Inicia el countdown desde una fecha/hora específica en formato ISO
  //Guarda en localStorage para persistencia entre sesiones
  //@param endTimeISO Fecha/hora final en formato ISO string desde el backend
  private startCountdownFromEndTime(endTimeISO: string): void {
    const endTime = new Date(endTimeISO).getTime();
    const now = new Date().getTime();
    const remainingTime = endTime - now;

    if (remainingTime > 0) {
      // Persistir en localStorage para sobrevivir a refresh/cierre de app
      localStorage.setItem(this.RATE_LIMIT_KEY, endTimeISO);
      this.startCountdown(remainingTime);
    }
  }

  //Inicia un nuevo countdown con la duración especificada
  //Usa signals + effect para manejar el decremento automático
  private startCountdown(durationMs: number): void {
    // Convertir milisegundos a segundos y establecer la señal
    const durationSeconds = Math.floor(durationMs / 1000);
    this._countdownSeconds.set(durationSeconds);
  }


  //Limpia completamente el countdown y la persistencia
  //Se llama automáticamente cuando el tiempo expira o manualmente
  clearCountdown(): void {
    this._countdownSeconds.set(0);
    localStorage.removeItem(this.RATE_LIMIT_KEY);
  }


  //Formatea segundos a formato HH:MM:SS para display en la UI
  //Convierte el tiempo en segundos a un formato legible para el usuario
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}
