import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Filters, PaginatedRequestQuery, UrlParams} from './interfaces';
import {Observable} from 'rxjs';
import {Sort} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private readonly http: HttpClient) { }

  private queryToParams(query: PaginatedRequestQuery): UrlParams {
    const pageIndex: number = query.pageIndex + 1;
    const pageSize: number = query.pageSize;
    const sort: Sort = query.sort;
    const filters: Filters = {};
    if (query.filters) {
      Object.keys(query.filters).map(filter => {
        if (query.filters[filter]) {
          filters[filter + '_like'] = query.filters[filter];
        }
      })
    }
    return Object.assign({
      _page: pageIndex.toString(),
      _limit: pageSize.toString(),
      _sort: sort.active,
      _order: sort.direction
    }, filters);
  }

  public getProjects(query: PaginatedRequestQuery): Observable<any> {
    return this.http.get<any>(
      `https://json-server-backend.herokuapp.com/data`,
      {
        observe: 'response',
        params: this.queryToParams(query)
      });
  }

}
