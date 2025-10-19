import { Component, input, output, SimpleChanges } from '@angular/core';
import { SalesData } from '../../models/dashboard.interface';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-sales-chart',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './sales-chart.component.html',
  styleUrl: './sales-chart.component.scss'
})
export class SalesChartComponent {
  //input del componente padre
  salesData = input.required<SalesData[]>();
  dateRange = input.required<string>()
  isLoading = input<boolean>();


  //outup hacia el componete padre
  dateRangeChange = output<string>();

  //Chart.js configuration
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartConfiguration['data'] = {
    datasets: []
  }

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
        }
      },
      y1: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          callback: function (value) {
            return '$' + (Number(value) / 1000) + 'K'
          }
        }
      },
      y: {
        position: 'right',
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#6b7280',
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#374151',
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20
        }
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
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.yAxisID === 'y1') {
                label += new Intl.NumberFormat('es-CL', {
                  style: 'currency',
                  currency: 'CLP',
                  minimumFractionDigits: 0
                }).format(context.parsed.y);
              } else {
                label += context.parsed.y + ' pedidos';
              }
            }
            return label;
          }
        }
      }
    }
  };


  //detecta cambios en los datos y actualiza el grafico
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['salesData'] && this.salesData()) {
      this.updateChartData();
    }
  }


  //Prepara los datos para Chart.js
  private updateChartData(): void {
    const data = this.salesData();

    if (!data || data.length === 0) {
      this.lineChartData = { datasets: [] };
      return;
    }

    this.lineChartData = {
      labels: data.map(d => d.date),
      datasets: [
        {
          data: data.map(d => d.sales),
          label: 'Ventas',
          yAxisID: 'y1',
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#3b82f6',
          pointHoverBorderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          data: data.map(d => d.orders),
          label: 'Pedidos',
          yAxisID: 'y',
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#10b981',
          pointHoverBorderWidth: 2,
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  //maneja el cambio de rango de fecha
  onDateRangeChange(newRange: string): void {
    this.dateRangeChange.emit(newRange);
  }

  //calcula el total de ventas del periodo
  getTotalSales(): number {
    return this.salesData().reduce((sum, item) => sum + item.sales, 0);
  }

  //Calcula el total de pedidos del perido
  getTotalOrders(): number {
    return this.salesData().reduce((sum, item) => sum + item.orders, 0);
  }


  //Formatea moneda en pesos chilenos
  formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-Cl', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}


