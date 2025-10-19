import { CommonModule } from '@angular/common';
import { Component, input, output, SimpleChanges } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { TopProduct } from '../../models/dashboard.interface';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-top-products-chart',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './top-products-chart.component.html',
  styleUrl: './top-products-chart.component.scss'
})
export class TopProductsChartComponent {

  //input desde compponente padre dashboard-page.component
  topProducts = input.required<TopProduct[]>();
  dateRange = input.required<string>();
  isLoading = input<boolean>(false);

  //output hacia el componente padre dashboard-page.component
  dateRangeChange = output<string>();


  // Chart.js Configuration for Horizontal Bar Chart
  public barCharType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    datasets: []
  };

  public barChartOptions: ChartConfiguration['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          callback: function (value) {
            return (Number(value) / 1000) + 'K';
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
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
        callbacks: {
          label: function (context) {
            return `Ventas ${new Intl.NumberFormat('es-CL', {
              style: 'currency',
              currency: 'CLP',
              minimumFractionDigits: 0
            }).format(context.parsed.x)} | ${context.label}`;
          }
        }
      }
    }
  };


  //Dettecta cambios en los datos y actualiza el grafico
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topProducts'] && this.topProducts()) {
      this.updateChartData();
    }
  }

  // Prepara los daors para Chart.js
  private updateChartData(): void {
    const products = this.topProducts();

    if (!products || products.length === 0) {
      this.barChartData = { datasets: [] };
      return;
    }

    //Ordenar por ventas (mayor a menor)
    const sortedProducts = [...products].sort((a, b) => b.sales - a.sales);

    this.barChartData = {
      labels: sortedProducts.map(p => p.name),
      datasets: [
        {
          data: sortedProducts.map(p => p.sales),
          backgroundColor: sortedProducts.map(p => p.color),
          borderColor: sortedProducts.map(p => this.adjustColorBrightness(p.color, -20)),

          borderWidth: 1,
          borderRadius: 4,
          barThickness: 20,
          categoryPercentage: 0.8
        }
      ]
    };
  }

  //ajustar el brillo de un color hexadecimal
  // private adjustColorBrightness(hex: string, percent: number): string {
  //   //implementación simplificada para ajustar color
  //   return hex + 'CC'; //agregar transparencia
  // }

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

  //maneja el camnio de rango de fechas
  onDateRangeChange(newRange: string): void {
    this.dateRangeChange.emit(newRange);
  }

  //Calcula el total de ventas de productos
  getTotalSales(): number {
    return this.topProducts().reduce((sum, product) => sum + product.sales, 0)
  }


  //calcula el total de unidades vendidas
  getTotalQuantity(): number {
    return this.topProducts().reduce((sum, product) => sum + product.quantity, 0);
  }



  //Formatea moneda en pesos chilenos
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  }


  //Obtiene el producto con mayor crecimiento
  getTopGrowingProduct(): TopProduct | null {
    if (this.topProducts().length === 0) return null;
    return [...this.topProducts()].sort((a, b) => b.growth - a.growth)[0];
  }
}
