import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { SensorService, SensorData } from '../services/sensor.service';
import { Subscription } from 'rxjs';
import * as shape from 'd3-shape';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  chartData: any[] = [];
  
  curve: any = shape.curveMonotoneX; 
  view: [number, number] = [1000, 400];
  
  // Shema boja
  colorScheme: Color = {
    name: 'neon',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#00f260', '#0575E6', '#e100ff', '#ffec00', '#ff5858']
  };

  private sensorSub!: Subscription;

  constructor(private sensorService: SensorService) {}

  ngOnInit(): void {
    this.sensorSub = this.sensorService.sensorData$.subscribe((data: SensorData) => {
      this.updateChart(data);
    });
  }

  dateFormatting(val: any): string {
    if (val instanceof Date) {
      return val.toLocaleTimeString('hr-HR');
    }
    return val;
  }

  updateChart(data: SensorData) {
    const originalDate = new Date(data.timestamp);
    
    const roundedTime = new Date(Math.floor(originalDate.getTime() / 2000) * 2000);

    const index = this.chartData.findIndex(s => s.name === data.sensor_id);

    if (index !== -1) {
      const series = [...this.chartData[index].series];
      
      series.push({ 
        name: roundedTime, 
        value: data.temperatura 
      });

      series.sort((a, b) => a.name.getTime() - b.name.getTime());

      if (series.length > 20) series.shift();

      this.chartData[index] = { ...this.chartData[index], series: series };
      
    } else {
      this.chartData.push({
        name: data.sensor_id,
        series: [{ 
          name: roundedTime, 
          value: data.temperatura 
        }]
      });
    }
    
    this.chartData = [...this.chartData];
  }

  ngOnDestroy(): void {
    if (this.sensorSub) this.sensorSub.unsubscribe();
  }
}