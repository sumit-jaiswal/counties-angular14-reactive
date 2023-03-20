import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  map,
  Observable,
  shareReplay,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { Country } from 'src/app/model/countries.model';
import { environment } from 'src/environments/environment';
import { sortByPopulation } from '../utils/country-filter.util';
import { LoadingService } from './loading.service';

@Injectable()
export class CountriesService implements OnDestroy {
  private subject = new BehaviorSubject<Country[]>([]);

  public countres$: Observable<Country[]> = this.subject.asObservable();

  private destroy$ = new Subject();

  constructor(private http: HttpClient, private loading: LoadingService) {
    this.loadAllCourses();
  }

  getCountries(): Observable<Country[]> {
    return this.http
      .get<Country[]>(environment.COUNTRIES_API + '/all', {
        params: {
          fields:
            'name,population,region,region,borders,tld,currencies,languages,flags,capital',
        },
      })
      .pipe(
        map((countres) => countres.sort(sortByPopulation)),
        shareReplay()
      );
  }

  private loadAllCourses() {
    const loadCourses$ = this.http
      .get<Country[]>(environment.COUNTRIES_API + '/all', {
        params: {
          fields:
            'name,population,region,region,borders,tld,currencies,languages,flags,capital',
        },
      })
      .pipe(
        takeUntil(this.destroy$),
        map((countres) => countres.sort(sortByPopulation)),
        tap((countres) => this.subject.next(countres))
      );

    this.loading.showLoaderUntilCompleted(loadCourses$).subscribe();
  }

  filterByRegion(region: string): Observable<Country[]> {
    console.log(region);
    if (region == 'all') {
      return this.countres$;
    }
    return this.countres$.pipe(
      map((courses) =>
        courses
          ?.filter((country) => country.region == region)
          .sort(sortByPopulation)
      )
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
