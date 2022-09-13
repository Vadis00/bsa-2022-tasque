import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { faAngleDown, faFlag, faPlus } from '@fortawesome/free-solid-svg-icons';
import { TaskModel } from 'src/core/models/task/task-model';
import { TaskType } from 'src/core/models/task/task-type';
import { TasqueDropdownOption } from 'src/shared/components/tasque-dropdown/dropdown.component';
import { TaskState } from 'src/core/models/task/task-state';
import { Observable, Subject, Subscription } from 'rxjs';
import { UserModel } from 'src/core/models/user/user-model';
import { SprintModel } from 'src/core/models/sprint/sprint-model';
import { ProjectModel } from 'src/core/models/project/project-model';
import { TaskPriority } from 'src/core/models/task/task-priority';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { BacklogService } from 'src/core/services/backlog.service';
import { takeUntil } from 'rxjs/operators';
import { TaskModelDto } from 'src/core/models/task/task-model-dto';
import { UserRole } from 'src/core/models/user/user-roles';
import { TaskTypeService } from 'src/core/services/task-type.service';
import { TaskStateService } from 'src/core/services/task-state.service';
import { SprintService } from 'src/core/services/sprint.service';
import { NewSprintModel } from 'src/core/models/sprint/new-sprint-model';
import { IssueSort } from '../backlog/models';

@Component({
  selector: 'app-backlog-content',
  templateUrl: './backlog-content.component.html',
  styleUrls: ['./backlog-content.component.sass'],
})
export class BacklogContentComponent implements OnInit, OnChanges {
  iconDown = faAngleDown;
  iconPlus = faPlus;
  flagIcon = faFlag;
  btnClass = 'btn mini voilet full';

  public role: UserRole;
  public isCurrentUserAdmin: boolean;

  public unsubscribe$ = new Subject<void>();
  subscription: Subscription;
  public tasksShow: TaskModelDto[];

  @Input() public currentUser: UserModel;
  @Input() public project: ProjectModel;
  //Get the criteria by which the issue will be sorted
  @Input() public filterIssue: IssueSort;
  //Get the string by which issue will be searched
  @Input() public inputSearch = '';

  // TODO remove when real data is available
  @Input() public taskStates: TaskState[] = [
    {
      id: 1,
      name: 'To Do',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'In Progress',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: 'Done',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: 'Canceled',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // TODO remove when real data is available
  @Input() public taskPriorities: TaskPriority[] = [
    {
      id: 1,
      name: 'Low',
      projectId: 5,
      type: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'Normal',
      projectId: 5,
      type: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: 'High',
      projectId: 5,
      type: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // TODO remove when real data is available
  @Input() public taskTypes: TaskType[] = [
    {
      id: 1,
      name: 'Bug',
      createdAt: new Date(),
      updatedAt: new Date(),
      icon: this.flagIcon,
    },
    {
      id: 2,
      name: 'Feature',
      createdAt: new Date(),
      updatedAt: new Date(),
      icon: this.flagIcon,
    },
    {
      id: 3,
      name: 'Enhancement',
      createdAt: new Date(),
      updatedAt: new Date(),
      icon: this.flagIcon,
    },
  ];

  public sprints$: Observable<SprintModel[]>;

  @Input() public sprints: SprintModel[];

  // TODO remove when real data is available
  @Input() public users: UserModel[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'email',
      organizationRoles: [
        { organizationId: 1, userId: 2, role: UserRole.organizationMember },
        { organizationId: 2, userId: 2, role: UserRole.organizationMember },
      ],
    },
    {
      id: 2,
      name: 'Jane Doe',
      email: 'email',
      organizationRoles: [
        { organizationId: 1, userId: 2, role: UserRole.organizationMember },
        { organizationId: 2, userId: 2, role: UserRole.organizationMember },
      ],
    },
    {
      id: 3,
      name: 'James McGuill',
      email: 'email',
      organizationRoles: [
        { organizationId: 1, userId: 2, role: UserRole.organizationMember },
        { organizationId: 2, userId: 2, role: UserRole.organizationMember },
      ],
    },
  ];

  public tasks$: Observable<TaskModel[]>;

  // TODO remove when real data is available
  @Input() public tasks: TaskModelDto[] = [];
  constructor(
    public backlogService: BacklogService,
    public taskTypeService: TaskTypeService,
    public taskStateService: TaskStateService,
    public sprintService: SprintService,
  ) {
    this.subscription = backlogService.changeBacklog$.subscribe(() => {
      this.getBacklogTasks();
    });
  }

  ngOnChanges(): void {
    this.filterItems();
  }

  ngOnInit(): void {
    if (this.currentUser === undefined) {
      return;
    }
    this.role =
      (this.currentUser?.organizationRoles?.find(
        (m) =>
          m.organizationId === this.project.organizationId &&
          m.userId === this.currentUser.id,
      )?.role as UserRole) || 0;

    if (UserRole.OrganizationAdmin <= this.role) {
      this.isCurrentUserAdmin = true;
    }

    this.getTasksState();
    this.getTasksType();
    this.getBacklogTasks();
  }

  toggleDropdown(): void {
    const dropdown = document.getElementById('backlog-issues');
    dropdown?.classList.toggle('show');

    const icon = document.getElementById('dropdown-arrow-icon');
    icon?.classList.toggle('down');
  }

  generateBtnClasses(): string {
    return 'btn toggle-backlog-dropdown';
  }

  taskStateToDropdownArray(types: TaskState[]): TasqueDropdownOption[] {
    return types.map((type) => {
      return {
        id: type.id,
        title: type.name,
        color: '',
      };
    });
  }

  dropSprint(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.sprints, event.previousIndex, event.currentIndex);
  }

  drop(event: CdkDragDrop<TaskModelDto[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  getBacklogTasks(): void {
    this.backlogService
      .getBacklogTasks(this.project.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result.body) {
          this.tasksShow = this.tasks = result.body;
        }
      });
  }

  public getTasksState(): void {
    this.taskStateService
      .getAll()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result.body) {
          this.taskStates = result.body;
        }
      });
  }

  public getTasksType(): void {
    this.taskTypeService
      .getAll()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result.body) {
          this.taskTypes = result.body;
        }
      });
  }

  //Sort tasks in a sprint (by keyword or IssueSort)
  filterItems(): void {
    if (this.tasksShow) {
      if (this.inputSearch) {
        this.tasks = this.tasksShow.filter((item) => {
          return item.summary
            .toLowerCase()
            .includes(this.inputSearch.toLowerCase());
        });
      } else {
        this.tasks = this.tasksShow;
      }

      if (this.filterIssue == IssueSort.All) {
        this.tasks.sort((a) => a.id);
      } else if (this.filterIssue == IssueSort.OnlyMyIssues) {
        this.tasks = this.tasks.filter((item) => {
          return item.authorId == this.currentUser.id;
        });
      } else if (this.filterIssue == IssueSort.RecentlyUpdated) {
        this.tasks.sort(
          (a, b) =>
            new Date(b.deadline).getTime() - new Date(a.deadline).getTime(),
        );
      }
    }
  }

  // TODO add current user
  createSprint(): void {
    const newSprint: NewSprintModel = {
      projectId: this.project.id,
      name: `${this.project.key} Sprint ${this.sprints.length + 1}`,
      authorId: 1,
    };

    this.sprintService
      .create(newSprint)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result.body) {
          this.sprints.push(result.body);
        }
      });
  }
}
