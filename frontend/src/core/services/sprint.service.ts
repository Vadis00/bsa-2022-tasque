import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaskModel } from '../models/task/task-model';
import { UserModel } from '../models/user/user-model';
import { Observable } from 'rxjs';
import { EditSprintModel } from '../models/sprint/edit-sprint-model';
import { SprintModel } from '../models/sprint/sprint-model';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root',
})
export class SprintService {
  public routePrefix = '/api/sprint';

  constructor(public httpService: HttpService) {}

  getProjectSprints(
    projectId: number,
  ): Observable<HttpResponse<SprintModel[]>> {
    return this.httpService.getFullRequest<SprintModel[]>(
      this.routePrefix + `/getSprintsByProjectId/${projectId}`,
    );
  }

  getSprintTasks(sprintId: number): Observable<HttpResponse<TaskModel[]>> {
    return this.httpService.getFullRequest<TaskModel[]>(
      this.routePrefix + `/${sprintId}/tasks`,
    );
  }

  getSprintUsers(sprintId: number): Observable<HttpResponse<UserModel[]>> {
    return this.httpService.getFullRequest<UserModel[]>(
      this.routePrefix + `/${sprintId}/users`,
    );
  }

  editSprint(
    editedSprint: EditSprintModel,
  ): Observable<HttpResponse<SprintModel>> {
    return this.httpService.putFullRequest<SprintModel>(
      this.routePrefix + '/edit',
      editedSprint,
    );
  }
}
