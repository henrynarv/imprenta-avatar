import { Component, computed, inject, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBuildingOffice, heroCheck, heroEnvelope, heroPhone, heroUser, heroXMark } from '@ng-icons/heroicons/outline';
import { User } from '../../../auth/interfaces/auth-interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';

@Component({
  selector: 'app-profile-form',
  imports: [ReactiveFormsModule, NgIcon],
  templateUrl: './profile-form.component.html',
  styleUrl: './profile-form.component.scss',
  providers: [
    provideIcons({
      heroUser,
      heroEnvelope,
      heroPhone,
      heroBuildingOffice,
      heroXMark,
      heroCheck
    })
  ],
})
export class ProfileFormComponent {

  // imputs para recibir los datos del padre
  user = input.required<User>();
  isLoading = input<boolean>(false);

  //Outputs para comunicacion con el componente padre
  save = output<User>();
  cancel = output<void>();

  //inyeciconde servicios
  private fb = inject(FormBuilder);

  //formaulario reactivo
  profileForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    company: ['']
  });

  //signal derivados del formulario

  //emite valores reactidvida con signal
  formValue = toSignal(
    this.profileForm.valueChanges.pipe(
      startWith(this.profileForm.value)),
    { initialValue: this.profileForm.value }
  )

  //emite un valor boleano reactivo si un fomrulario es valido
  isFormValid = toSignal(
    this.profileForm.statusChanges.pipe(
      startWith(this.profileForm.status),
      map(() => this.profileForm.valid)
    ),
    { initialValue: this.profileForm.valid }
  )

  //determina si el formualrio ha cambiado
  hasformChanged = computed(() => {
    const formValue = this.formValue();
    const user = this.user();

    return formValue.name !== user.name ||
      formValue.email !== user.email ||
      formValue.phone !== user.phone ||
      formValue.company !== user.company

  });

  canSave = computed(() => this.isFormValid() && this.hasformChanged() && !this.isLoading());

  ngOnInit(): void {
    this.initializerForm();
  }

  private initializerForm(): void {
    const user = this.user();
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company
    })
  }

  onSubmit(): void {
    if (this.isFormValid() && this.hasformChanged()) {
      const formValue = this.formValue();

      const updatedUser: User = {
        ...this.user(),
        name: formValue.name ?? '',
        email: formValue.email ?? '',
        phone: formValue.phone?.trim() || undefined,
        company: formValue.company?.trim() || undefined
      };

      this.save.emit(updatedUser);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  //Obtiene las clases CSS para los inputs
  getInputClasses(field: any): string {
    const baseClasses = 'w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 transition-all duration-200 ';
    if (field.invalid && field.touched) {
      return baseClasses + 'border-red-500 focus:border-red-500 focus:ring-red-200 bg-red-50';
    } else if (field.valid && field.touched) {
      return baseClasses + 'border-green-500 focus:border-green-500 focus:ring-green-200 bg-green-50';
    }

    return baseClasses + 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white';
  }

  //Obtiene el mensaje de error para un campo
  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field?.touched || !field.errors) return '';

    const errors = field.errors;

    const errorMessages: Record<string, string | (() => string)> = {
      required: 'El campo es requerido',
      email: 'Por favor, ingresa un email valido',
      minlength: () => `Mínimo ${errors?.['minlength']?.requiredLength} caracteres`,
    };

    for (const key in errors) {
      const message = errorMessages[key];
      if (message) {
        return typeof message === 'function' ? message() : message
      }
    }
    return 'Campo inválido';
  }

  /**
    * TrackBy function para optimización
    */
  trackByIndex(index: number): number {
    return index;
  }
}
