import { Component, input, output } from '@angular/core';
import { UserStats } from '../../models/user-management.interface';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowPath, heroArrowRightOnRectangle, heroChartBar, heroCheck, heroClock, heroEnvelope, heroShieldCheck, heroUser, heroUserMinus, heroUserPlus, heroUsers } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-user-stats-card',
  imports: [NgIcon],
  templateUrl: './user-stats-card.component.html',
  styleUrl: './user-stats-card.component.scss',
  providers: [
    provideIcons({
      heroShieldCheck, heroUsers, heroUserPlus, heroEnvelope,
      heroUserMinus, heroArrowRightOnRectangle, heroCheck, heroUser,
      heroChartBar, heroArrowPath, heroClock
    })
  ]
})
export class UserStatsCardComponent {

  //inputs para recibir datos
  stats = input<UserStats | null>(null);
  loading = input<boolean>(false);

  //outputs para eventos
  // refreshStats = output<void>();

  // //manjea el click en el boton de refrescar
  // onRefreshClick(): void {
  //   this.refreshStats.emit();
  // }

  //Obtiene la clase Css para el icono de la tarjeta
  getCardIconClass(statKey: string) {
    const icons: Record<string, { name: string; class: string }> = {
      totalUsers: { name: 'heroUsers', class: 'text-blue-500' },
      activeUsers: { name: 'heroUser', class: 'text-green-500' },
      adminUsers: { name: 'heroShieldCheck', class: 'text-purple-500' },
      newUsersThisMonth: { name: 'heroUserPlus', class: 'text-orange-500' },
      verifiedUsers: { name: 'heroEnvelope', class: 'text-teal-500' },
      inactiveUsers: { name: 'heroUserMinus', class: 'text-red-500' },
      totalLogins: { name: 'heroArrowRightOnRectangle', class: 'text-indigo-500' },
    };

    return icons[statKey] || { name: 'heroChartBar', class: 'text-gray-500' };
  }

  //Obtiene el color de fondo para la tarjeta
  getCardColorClass(statKey: string): string {
    const colorClasses: { [key: string]: string } = {
      totalUsers: 'bg-blue-50 border-blue-200',
      activeUsers: 'bg-green-50 border-green-200',
      adminUsers: 'bg-purple-50 border-purple-200',
      newUsersThisMonth: 'bg-orange-50 border-orange-200',
      verifiedUsers: 'bg-teal-50 border-teal-200',
      inactiveUsers: 'bg-red-50 border-red-200',
      totalLogins: 'bg-indigo-50 border-indigo-200'
    }
    return colorClasses[statKey] || 'bg-gray-50 border-gray-200';
  }

  //Obtiene el texto descriptivo para cada estadística
  getStatDescription(statKey: string): string {
    const descriptions: { [key: string]: string } = {
      totalUsers: 'Usuarios registrados en el sistema',
      activeUsers: 'Usuarios con cuenta activa',
      adminUsers: 'Usuarios con rol administrador',
      newUsersThisMonth: 'Nuevos registros este mes',
      verifiedUsers: 'Usuarios con email verificado',
      inactiveUsers: 'Usuarios con cuenta inactiva',
      totalLogins: 'Total de inicios de sesión'
    };

    return descriptions[statKey] || 'Estadística del sistema';
  }
}
