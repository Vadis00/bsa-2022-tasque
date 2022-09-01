import {
  Component,
  Input,
  OnInit,
  OnChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SprintModel } from 'src/core/models/sprint/sprint-model';
import { TaskModel } from 'src/core/models/task/task-model';
import { SprintService } from 'src/core/services/sprint.service';
import { IssueSort } from '../models';
import { UserModel } from 'src/core/models/user/user-model';
import { UserCircle } from 'src/shared/components/tasque-team-select/models';

@Component({
  selector: 'app-sprint',
  templateUrl: './sprint.component.html',
  styleUrls: ['./sprint.component.sass'],
})
export class SprintComponent implements OnInit, OnChanges {
  @Input() public sprint: SprintModel;
  public users: UserModel[];

  public tasks: TaskModel[];
  public tasksShow: TaskModel[];

  public unsubscribe$ = new Subject<void>();
  public createIssueSidebarName = 'createIssue';
  @Input() public inputSearch = '';
  @Input() public filterIssue: IssueSort;
  @Input() public currentUser: UserModel;
  @Output() dropSprint = new EventEmitter<number>();

  constructor(public sprintService: SprintService) {}

  faEllipsisV = faEllipsisV;

  ngOnInit(): void {
    this.getSprintTasks();
    this.getSprintUsers();
    this.createIssueSidebarName += this.sprint.id;
  }

  public getSprintTasks(): void {
    this.sprintService
      .getSprintTasks(this.sprint.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result.body) {
          this.tasks = this.tasksShow = result.body;
        }
      });
  }

  public getSprintUsers(): void {
    this.sprintService
      .getSprintUsers(this.sprint.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result.body) {
          this.users = result.body;
          console.log(this.users);
        }
      });
  }

  filterItems(): void {
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
      this.tasks.sort((a) => a.priority?.id);
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

  test(user: UserCircle): void {
    console.log(user);
  }
  //+++++++++++++++++++++++++rewrite after the backend part of sprintі sorting is implemented++++++++++++++++
  ngOnChanges() {
    this.filterItems();
  }

  dropSprintClick(value: number) {
    this.dropSprint.emit(this.sprint.id);
  }
  //++++++++++++++++++++++++++++++++++
}
