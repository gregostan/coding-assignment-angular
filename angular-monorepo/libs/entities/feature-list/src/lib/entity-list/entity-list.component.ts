import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError, debounceTime, distinctUntilChanged, finalize, startWith, switchMap, tap } from 'rxjs/operators';
import {
  EntitiesDataRepositoryModule,
  EntityListItem,
  EntityService
} from '@angular-monorepo/entities/data-repository';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, of } from 'rxjs';
import { ProgressBarModule } from 'primeng/progressbar';
import { RouterModule } from '@angular/router';

type EntityColumn = { value: keyof EntityListItem, label: string };

const SELECTED_COLUMNS_KEY = 'ENTITY_LIST_SELECTED_COLUMNS';

@Component({
  selector: 'angular-monorepo-entity-list',
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, MultiSelectModule, FormsModule, ReactiveFormsModule, EntitiesDataRepositoryModule, InputTextModule, ToastModule, ProgressBarModule],
  providers: [MessageService]
})
export class EntityListComponent {
  private readonly entityService = inject(EntityService);
  private readonly messageService = inject(MessageService);

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly loading$ = new BehaviorSubject(false);
  readonly entities$ = this.getEntities();
  readonly columns: EntityColumn[] = [
    { value: 'trackingId', label: 'Tracking ID' },
    { value: 'name', label: 'Name' },
    { value: 'entityType', label: 'Entity Type' },
    { value: 'entityStatus', label: 'Entity Status' },
    { value: 'isActive', label: 'Is Active' }
  ];
  readonly selectedColumnsControl = new FormControl(this.getColumns(), { nonNullable: true });

  constructor() {
    this.selectedColumnsControl.valueChanges.pipe(takeUntilDestroyed()).subscribe(selectedColumns => this.saveColumns(selectedColumns));
  }

  private getEntities() {
    return this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.loading$.next(true)),
      switchMap(searchTerm => this.entityService.getEntityList({ search: searchTerm }).pipe(
        finalize(() => this.loading$.next(false)),
        catchError(() => {
          this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Error fetching entities' });
          return of([]);
        })
      ))
    )
  }

  private getColumns() {
    const columnsStr = localStorage.getItem(SELECTED_COLUMNS_KEY);
    if (columnsStr) {
      return JSON.parse(columnsStr) as EntityColumn[];
    }
    return this.columns;
  }

  private saveColumns(selectedColumns: EntityColumn[]) {
    localStorage.setItem(SELECTED_COLUMNS_KEY, JSON.stringify(selectedColumns))
  }
}
