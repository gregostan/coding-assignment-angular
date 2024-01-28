import { Component, OnInit } from '@angular/core';
import { EntitiesDataRepositoryModule, EntityService, LocationStats } from '@angular-monorepo/entities/data-repository';
import { Chart, ChartModule } from 'angular-highcharts';
import { catchError, of, switchMap, take, tap } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'angular-monorepo-location-dashboard',
  templateUrl: './location-dashboard.component.html',
  styleUrls: ['./location-dashboard.component.scss'],
  standalone: true,
  imports: [ChartModule, EntitiesDataRepositoryModule, ToastModule],
  providers: [MessageService]
})
export class LocationDashboardComponent implements OnInit {
  occupationChart = new Chart({
    chart: {
      type: 'line'
    },
    title: {
      text: 'Last Week Location Occupancy'
    },
    credits: {
      enabled: false
    },
    series: []
  });

  lastWeekVisitsChart = new Chart({
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Last Week Employees Visits'
    },
    credits: {
      enabled: false
    },
    series: []
  });

  constructor(private entityService: EntityService, private messageService: MessageService) {
  }

  ngOnInit() {
    this.entityService.getLocationStats().pipe(
      catchError(error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error Message',
          detail: 'Error loading location stats'
        });
        const emptyStats: LocationStats = {
          lastWeekLocationOccupancy: [],
          lastWeekEmployeesVisits: []
        }
        return of(emptyStats)
      }),
      switchMap((stats: LocationStats) => {
        this.updateOccupationChart(stats);
        return this.updateVisitsChart(stats);
      })
    ).subscribe();
  }

  private updateOccupationChart(stats: LocationStats) {
    this.occupationChart.addSeries({
      type: 'line',
      data: stats.lastWeekLocationOccupancy
    }, true, true);
  }

  private updateVisitsChart(stats: LocationStats) {
    const seriesData = stats.lastWeekEmployeesVisits.map(visit => ({
      name: visit.name,
      y: visit.visits
    }));

    this.lastWeekVisitsChart.addSeries({
      type: 'bar',
      name: 'Visits',
      data: seriesData
    }, true, true);

    const categories = stats.lastWeekEmployeesVisits.map(visit => visit.name);

    return this.lastWeekVisitsChart.ref$.pipe(
      tap(chart => chart.xAxis[0].update({ categories })),
      take(1)
    );
  }
}
