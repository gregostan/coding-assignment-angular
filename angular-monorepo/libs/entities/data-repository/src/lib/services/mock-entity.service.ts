import { Injectable } from '@angular/core';
import {
  Employee,
  EmployeeVisits,
  EntityDetails,
  EntityListItem,
  EntityType,
  EntityUpdateDto,
  GetEntityListParams,
  LocationStats
} from '../model/model';
import { map, Observable, of } from 'rxjs';
import { EntityService } from './entity.service';
import { delayOperator } from '@angular-monorepo/utils';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class MockEntityService implements EntityService {
  entities: EntityDetails[] = [
    {
      entityId: '1',
      trackingId: 'ab:cd:ef:5d:7a',
      name: 'Entity 1',
      entityType: 'n1t',
      entityStatus: 'On Duty',
      isActive: true,
      attributes: [
        'Department1',
        'Fast Responder',
        'xyakf83kfdasf930-fksdf0239-12303-46340129394',
        'Morning Shift'
      ]
    },
    {
      entityId: '2',
      trackingId: 'ac:cd:ef:4d:7a',
      name: 'Entity 2',
      entityType: 'n1t',
      entityStatus: 'Break',
      isActive: true,
      attributes: [
        'Department1',
        'Fast Responder',
        'xyakf83kfdasf930-fksdf0239-12303-46340129394',
        'Morning Shift'
      ]
    },
    {
      entityId: '3',
      trackingId: 'af:cd:ef:5d:8a',
      name: 'Entity 3',
      entityType: 'n2t',
      entityStatus: 'On Duty',
      isActive: true,
      attributes: [
        'Department1',
        'Fast Responder',
        'xyakf83kfdasf930-fksdf0239-12303-46340129394',
        'Morning Shift'
      ]
    },
    {
      entityId: '4',
      trackingId: 'af:cf:ef:5d:9a',
      name: 'Entity 4',
      entityType: 'n2t',
      entityStatus: 'Break',
      isActive: false,
      attributes: [
        'Department1',
        'Fast Responder',
        'xyakf83kfdasf930-fksdf0239-12303-46340129394',
        'Morning Shift'
      ]
    }
  ];

  entityTypes: EntityType[] = [
    { id: 'n1t', name: 'Nurse' },
    { id: 'n2t', name: 'Security' }
  ];

  lastWeekLocationOccupancy: number[] = [40, 245, 235, 182, 143, 120, 20];

  lastWeekVisitsLog: Employee[] = [
    { id: 'id1', name: 'Jacob Holland' },
    { id: 'id1', name: 'Jacob Holland' },
    { id: 'id2', name: 'Charles Bradley' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id4', name: 'Alice Kelly' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id1', name: 'Jacob Holland' },
    { id: 'id2', name: 'Charles Bradley' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id4', name: 'Alice Kelly' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id1', name: 'Jacob Holland' },
    { id: 'id2', name: 'Charles Bradley' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id4', name: 'Alice Kelly' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id1', name: 'Jacob Holland' },
    { id: 'id2', name: 'Charles Bradley' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id4', name: 'Alice Kelly' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id1', name: 'Jacob Holland' },
    { id: 'id2', name: 'Charles Bradley' },
    { id: 'id1', name: 'Jacob Holland' },
    { id: 'id2', name: 'Charles Bradley' },
    { id: 'id1', name: 'Jacob Holland' },
    { id: 'id2', name: 'Charles Bradley' },
    { id: 'id1', name: 'Jacob Holland' },
    { id: 'id2', name: 'Charles Bradley' },
    { id: 'id1', name: 'Jacob Holland' },
    { id: 'id2', name: 'Charles Bradley' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id4', name: 'Alice Kelly' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id4', name: 'Alice Kelly' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id4', name: 'Alice Kelly' },
    { id: 'id3', name: 'Mason Moore' },
    { id: 'id4', name: 'Alice Kelly' },
    { id: 'id5', name: 'Rachel Gray' },
    { id: 'id6', name: 'Alexis Morales' },
    { id: 'id1', name: 'Jacob Holland' },
    { id: 'id1', name: 'Jacob Holland' }
  ];

  getEntityList(getEntityListParams: GetEntityListParams): Observable<EntityListItem[]> {
    const { search } = getEntityListParams;
    const filteredEntities = search ? [...this.entities].filter(entity =>
        entity.name.toLowerCase().includes(search) ||
        entity.trackingId?.toLowerCase().includes(search)
      )
      : this.entities;
    return of(filteredEntities).pipe(delayOperator());
  }

  getEntityDetails(entityId: string): Observable<EntityDetails> {
    const entity = this.entities.find((e) => e.entityId === entityId);
    if (!entity) {
      return of().pipe(delayOperator(1000, 1));
    }
    return of(entity).pipe(delayOperator());
  }

  updateEntity(
    entityUpdateDto: EntityUpdateDto,
    entityId: string
  ): Observable<EntityDetails> {
    return of({}).pipe(
      delayOperator(),
      map(() => this.updateEntityInMemory(entityUpdateDto, entityId))
    );
  }

  getEntityTypes(): Observable<EntityType[]> {
    return of(this.entityTypes).pipe(delayOperator());
  }

  getLocationStats(): Observable<LocationStats> {
    return of({
      lastWeekLocationOccupancy: this.lastWeekLocationOccupancy,
      lastWeekEmployeesVisits: this.mapLastWeekVisitsLog(
        this.lastWeekVisitsLog
      )
    }).pipe(delayOperator());
  }

  private updateEntityInMemory(
    entityUpdateDto: EntityUpdateDto,
    entityId: string
  ): EntityDetails {
    const entityIdx = this.entities.findIndex((e) => e.entityId === entityId);
    if (entityIdx === -1) {
      throw new HttpErrorResponse({ status: 404 });
    }
    const entity = this.entities[entityIdx];
    const newEntity = {
      ...entity,
      ...entityUpdateDto
    };
    this.entities[entityIdx] = newEntity;
    return newEntity;
  }

  private mapLastWeekVisitsLog(
    lastWeekVisitsLog: Employee[]
  ): EmployeeVisits[] {
    const visitsMap = new Map<string, number>();
    lastWeekVisitsLog.forEach((e) => {
      const visits = visitsMap.get(e.name) || 0;
      visitsMap.set(e.name, visits + 1);
    });
    return Array.from(visitsMap.entries()).map(([name, visits]) => ({
      name,
      visits
    }));
  }
}
