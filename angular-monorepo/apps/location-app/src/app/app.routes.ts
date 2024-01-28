import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'entity'
  },
  {
    path: 'entity',
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'homepage'
      },
      {
        path: 'homepage',
        loadChildren: () =>
          import('@angular-monorepo/entities/feature-homepage').then(
            (m) => m.EntitiesFeatureHomepageModule
          )
      },
      {
        path: 'list',
        loadComponent: () =>
          import('@angular-monorepo/entities/feature-list').then(
            (m) => m.EntityListComponent
          )
      },
      {
        path: 'detail/:id',
        loadComponent: () =>
          import('@angular-monorepo/entities/feature-list').then(
            (m) => m.EntityDetailsComponent
          )
      }
    ]
  },
  {
    path: 'dashboards',
    children: [
      {
        path: 'location',
        loadComponent: () =>
          import('@angular-monorepo/entities/feature-location-dashboard').then(
            (m) => m.LocationDashboardComponent
          )
      }

    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
