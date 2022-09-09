import { Component, OnDestroy, OnInit } from '@angular/core';
import { faMagnifyingGlass, faMessage } from '@fortawesome/free-solid-svg-icons';
import { ProjectInfoModel } from 'src/core/models/project/project-info-model';
import { UserModel } from 'src/core/models/user/user-model';
import { GetCurrentOrganizationService } from 'src/core/services/get-current-organization.service';
import { ProjectService } from 'src/core/services/project.service';
import { GetCurrentUserService } from 'src/core/services/get-current-user.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OpenDialogService } from 'src/core/services/open-dialog.service';
import { GetCurrentProjectService } from 'src/core/services/get-current-project.service';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.sass'],
})
export class ProjectListComponent implements OnInit, OnDestroy {

  public currentUser: UserModel;
  public currentOrganizationId: number;

  public inputSearch = '';
  public warningIcon = faMessage;
  public searchIcon = faMagnifyingGlass;

  public projects: ProjectInfoModel[] = [];

  public itemsShow = this.projects;
  public unsubscribe$ = new Subject<void>();

  constructor(
    public projectService: ProjectService,
    private currentOrganization: GetCurrentOrganizationService,
    private currentUserService: GetCurrentUserService,
    private currentProjectService: GetCurrentProjectService,
    private openDialogService: OpenDialogService) {
  }

  ngOnInit(): void {
    this.subscribeToCurrentUser();
    this.subscribeToCurrentOrganization();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  filterItems(): void {
    if (this.inputSearch) {
      this.itemsShow = this.projects.filter((item) => {
        return item.name.toLowerCase().includes(this.inputSearch.toLowerCase());
      });
    }
    else {
      this.itemsShow = this.projects;
    }
  }

  private subscribeToCurrentOrganization(): void {
    this.currentOrganization.currentOrganizationId$.subscribe(
      (result) => {
        if (result === -1) {
          this.projects = this.itemsShow = [];
          return;
        }

        this.currentOrganizationId = result;

        this.projectService.getAllProjectsOfThisOrganization(this.currentOrganizationId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((data) => {
            if (data.body) {
              this.projects = data.body;
              this.itemsShow = this.projects;
            }
          });
      });
  }

  public subscribeToCurrentUser(): void {
    this.currentUserService.currentUser$.subscribe((user) => {
      if (!user) {
        return;
      }
      this.currentUser = user;
    });
  }

  public openCreateProjectDialog(): void {
    this.openDialogService.openCreateProjectDialog(this.currentOrganizationId)
      .subscribe((result) => {
        if (!result) {
          return;
        }

        this.projects.push(result);
        this.itemsShow = this.projects;
        this.currentProjectService.setCurrentProject(result);
      });
  }

}
