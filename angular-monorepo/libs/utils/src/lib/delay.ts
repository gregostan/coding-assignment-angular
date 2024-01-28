import { delay, map, pipe } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MonoTypeOperatorFunction } from 'rxjs';

export function delayOperator<T>(
  delayInMiliseconds = 1000,
  failRate = 0.1
): MonoTypeOperatorFunction<T> {
  return pipe(
    delay(delayInMiliseconds),
    map((value) => {
      if (Math.random() <= failRate) {
        throw new HttpErrorResponse({ status: 403 });
      }
      return value;
    })
  );
}
