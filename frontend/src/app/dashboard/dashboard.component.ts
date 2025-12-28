import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { SensorService, SensorData } from '../services/sensor.service';
import { Subscription } from 'rxjs';

interface ChartSeries {
  name: string;
  value: number;
}

interface ChartGroup {
  name: string;
  series: ChartSeries[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy{
  chartData: ChartGroup[] = [];

  view: [number, number] = [900, 400];
  
  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  private sensorSub!: Subscription;

  constructor(private sensorService: SensorService) {}

  ngOnInit(): void {
    this.sensorSub = this.sensorService.sensorData$.subscribe((data: SensorData) => {
      this.updateChart(data);
    });
  }

  updateChart(data: SensorData) {
    const time = new Date(data.timestamp).toLocaleTimeString();

    const index = this.chartData.findIndex(s => s.name === data.sensor_id);

    if (index !== -1) {
      const updatedSeries = [...this.chartData[index].series, { name: time, value: data.temperatura }];
      
      if (updatedSeries.length > 20) updatedSeries.shift();

      this.chartData[index] = { ...this.chartData[index], series: updatedSeries };
      this.chartData = [...this.chartData]; 

    } else {
      this.chartData = [
        ...this.chartData,
        {
          name: data.sensor_id,
          series: [{ name: time, value: data.temperatura }]
        }
      ];
    }
  }

  ngOnDestroy(): void {
    if (this.sensorSub) {
      this.sensorSub.unsubscribe();
    }
  }
}

