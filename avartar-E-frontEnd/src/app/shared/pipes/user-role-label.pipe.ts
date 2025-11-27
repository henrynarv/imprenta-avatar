import { Pipe, PipeTransform } from '@angular/core';
import { UserRole } from '../../features/auth/models/user-role.enum';


@Pipe({
  name: 'userRoleLabel'
})

export class RoleLabelPipe implements PipeTransform {

  private readonly map: Record<UserRole, string> = {
    [UserRole.ROLE_ADMIN]: 'Administrador',
    [UserRole.ROLE_USER]: 'Usuario'
  }

  transform(value: UserRole): string {
    return this.map[value] || 'Desconocido';
  }
}
