import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationModel } from 'src/core/models/organization/organization-model';
import { NotificationService } from 'src/core/services/notification.service';
import { SideBarService } from 'src/core/services/sidebar.service';
import {
  BoardType,
  IBoard,
  IUserCard,
} from 'src/shared/components/select-users/Models';

@Component({
  selector: 'app-edit-organization',
  templateUrl: './edit-organization.component.html',
  styleUrls: ['./edit-organization.component.sass'],
})
export class EditOrganizationComponent implements OnInit {
  @Input() public organization: OrganizationModel;
  public editOrganization: FormGroup = new FormGroup({});
  public organizationNameControl: FormControl;
  public organizationUsersControl: FormControl;
  public btnText = 'Create project';
  public btnClass = 'mini';
  public sidebarName = 'editOrganization';

  get organizationNameErrorMessage(): string {
    const ctrl = this.organizationNameControl;

    if (ctrl.errors?.['required']) {
      return 'Project is required';
    }
    return '';
  }

  constructor(
    private notification: NotificationService,
    private sideBarService: SideBarService,
  ) {}

  public user: IUserCard[] = [
    {
      email: 'test@email.com',
      username: 'username 1',
      profileURL: 'null',
      avatarURL: 'https://www.w3schools.com/howto/img_avatar.png',
      role: null,
    },
  ];

  public board: IBoard = {
    id: 1,
    type: BoardType.Organization,
    users: this.user,
    hasRoles: true,
  };
  ngOnInit(): void {
    this.sidebarName += this.organization.id;
    console.log(this.sidebarName);

    this.editOrganization = new FormGroup({
      editOrganization: this.editOrganization,
    });

    this.organizationNameControl = new FormControl(this.organization.name, [
      Validators.required,
    ]);
  }

  public submitForm(): void {
    if (!this.editOrganization.valid) {
      this.notification.error('Invalid values');
      return;
    }

    this.organization.name = 'teeeeeeeest';
    console.log(this.board);
  }

  public clearForm(): void {
    this.editOrganization.reset();
    this.sideBarService.toggle('');
  }
}
