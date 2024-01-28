import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import {
  EntitiesDataRepositoryModule,
  EntityDetails,
  EntityService,
  EntityUpdateDto
} from '@angular-monorepo/entities/data-repository';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, map, of, switchMap } from 'rxjs';
import { catchError, startWith, tap } from 'rxjs/operators';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'angular-monorepo-entity-details',
  standalone: true,
  imports: [CommonModule, EntitiesDataRepositoryModule, ReactiveFormsModule, ButtonModule, InputTextModule, DropdownModule, CheckboxModule, ProgressBarModule, ToastModule],
  templateUrl: './entity-details.component.html',
  styleUrls: ['./entity-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class EntityDetailsComponent {
  private readonly entityService = inject(EntityService);
  private readonly messageService = inject(MessageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly entity$ = this.route.params.pipe(
    switchMap(({ id }) => this.entityService.getEntityDetails(id)),
    tap(entity => this.entityForm.patchValue(entity)),
    catchError(() => {
      this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Error fetching entity details' });
      return of(null);
    })
  );

  readonly entityTypes$ = this.entityService.getEntityTypes().pipe(startWith([]),
    catchError(() => {
      this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Error fetching entity types' });
      return of(null);
    })
  );
  readonly trackingId = new FormControl({ value: '', disabled: true }, {
    validators: Validators.required,
    nonNullable: true
  });
  readonly name = new FormControl({ value: '', disabled: true }, {
    validators: Validators.required,
    nonNullable: true
  });

  readonly entityType = new FormControl({ value: '', disabled: true }, {
    validators: Validators.required,
    nonNullable: true
  });
  readonly entityForm = new FormGroup({
    trackingId: this.trackingId,
    name: this.name,
    entityType: this.entityType
  });

  onAction(entity: EntityDetails) {
    if (this.entityForm.enabled) {
      this.entityForm.disable();
      this.updateEntity(entity).subscribe((updatedEntity) => {
        if (updatedEntity) {
          this.entityForm.disable();
          this.router.navigateByUrl('/entity/list');
        } else {
          this.entityForm.enable();
        }
      });
    } else {
      this.entityForm.enable();
    }
  }

  private updateEntity(entity: EntityDetails) {
    if (this.entityForm.invalid) {
      return of(null);
    }
    const editedEntity: EntityUpdateDto = {
      name: this.entityForm.value.name ?? '',
      entityType: this.entityForm.value.entityType ?? '',
      trackingId: this.entityForm.value.trackingId ?? ''
    };
    return this.entityService.updateEntity(editedEntity, entity.entityId).pipe(
      catchError(() => {
        this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Error while updating entity' });
        return of(null);
      })
    );
  }
}
