import { CommonModule } from '@angular/common';
import { Component, input, output, SimpleChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { OrderStatus } from '../../models/dashboard.interface';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-orders-status-chart',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './orders-status-chart.component.html',
  styleUrl: './orders-status-chart.component.scss'
})
export class OrderStatusChartComponent {
  //input desde el componente padre dashboard-page.component.ts
  ordersStatus = input.required<OrderStatus[]>();
  dateRange = input.required<string>();
  isLoading = input<boolean>(false);


  //poutput hacia el componente padre dashboard-page.component.ts
  dateRangeChange = output<string>();


  //cConfiguración del gráfico Chart.js
  public barchartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    datasets: [],
  };


  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function (context) {
            const status = context.label;
            const count = context.parsed.y;
            return `${status}: ${count} pedidos`;
          }
        }
      }
    }
  };


  //detecta cambios en los datos y actualzia el gráfico
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ordersStatus'] && this.ordersStatus()) {
      this.updateChartData();
    }
  }

  // Prepara los datos para Chart.js
  private updateChartData(): void {
    const statusData = this.ordersStatus();

    if (!statusData || statusData.length === 0) {
      this.barChartData = { datasets: [] };
      return;
    }

    this.barChartData = {
      labels: statusData.map(s => this.getStatusLabel(s.status)),
      datasets: [
        {
          data: statusData.map(s => s.count),
          backgroundColor: statusData.map(s => s.color),
          borderColor: statusData.map(s => this.adjustColorBrightness(s.color, -20)),
          borderWidth: 1,
          borderRadius: 6,
          barThickness: 30,
          categoryPercentage: 0.6
        }
      ]
    };
  }

  //Obtiene la etiqueta en español para el estado
  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendientes',
      'production': 'En producción',
      'completed': 'Completados',
      'delivered': 'Entregado',
    };
    return labels[status] || status;

  }

  //Ajusta el brillo de un color hexadecimal
  private adjustColorBrightness(hex: string, percent: number): string {
    // Quitar el símbolo #
    hex = hex.replace('#', '');
    const num = parseInt(hex, 16);

    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
  }


  //majea el cambio de rango de fechas
  onDateRangeChange(newRange: string): void {
    this.dateRangeChange.emit(newRange);
  }




  //Calcula el total de pedidos
  getTotalOrders(): number {
    return this.ordersStatus().reduce((sum, status) => sum + status.count, 0);
  }


  //Obtiene el estado con más pedidos
  getStatusWithMostOrders(): OrderStatus | null {
    if (this.ordersStatus().length === 0) return null;
    return [...this.ordersStatus()].sort((a, b) => b.count - a.count)[0];
  }


  //calcula e porcentaje de productos completados
  getCompletionPercentage(): number {
    const total = this.getTotalOrders();
    const completed = this.ordersStatus().find(s => s.status === 'completed')?.count || 0;
    const delivered = this.ordersStatus().find(s => s.status === 'delivered')?.count || 0;

    return total > 0 ? ((completed + delivered) / total) * 100 : 0;
  }
}
