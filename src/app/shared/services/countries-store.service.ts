import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  map,
  Observable,
  Subject,
  takeUntil,
  tap,
} from 'rxjs';
import { Country } from 'src/app/model/countries.model';
import { environment } from 'src/environments/environment';
import { sortByPopulation } from '../utils/country-filter.util';
import { LoadingService } from './loading.service';

@Injectable()
export class CountriesStoreService implements OnDestroy {
  private subject = new BehaviorSubject<Country[]>([]);

  public countres$: Observable<Country[]> = this.subject.asObservable();

  private destroy$ = new Subject();

  constructor(private http: HttpClient, private loading: LoadingService) {
    this.loadAllCountries();
  }

  private loadAllCountries() {
    let countryFields =
      'name,population,region,region,borders,tld,currencies,languages,flags,capital,cca3';
    const loadCountries$ = this.http
      .get<Country[]>(environment.COUNTRIES_API + '/all', {
        params: {
          fields: countryFields,
        },
      })
      .pipe(
        takeUntil(this.destroy$),
        map((countres) => countres.sort(sortByPopulation)),
        tap((countres) => this.subject.next(countres))
      );

    this.loading.showLoaderUntilCompleted(loadCountries$).subscribe();
  }

  filterByRegion(region: string): Observable<Country[]> {
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
