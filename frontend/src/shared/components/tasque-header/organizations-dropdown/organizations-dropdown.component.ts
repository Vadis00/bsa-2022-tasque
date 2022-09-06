import { Component, Input, OnInit } from '@angular/core';
import { OrganizationService } from 'src/core/services/organization.service';
import { GetCurrentOrganizationService } from 'src/core/services/get-current-organization.service';
import { OrganizationModel } from 'src/core/models/organization/organization-model';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from 'src/core/base/base.component';
import { UserModel } from 'src/core/models/user/user-model';
import { Router } from '@angular/router';

@Component({
  selector: 'tasque-organizations-dropdown',
  templateUrl: './organizations-dropdown.component.html',
  styleUrls: ['./organizations-dropdown.component.sass']
})
export class OrganizationsDropdownComponent extends BaseComponent implements OnInit {

  private user: UserModel;

  @Input()
  set currentUser(user: UserModel) {
    if (!user) {
      return;
    }

    this.user = user;

    this.organizationService.getUserOrganizations(this.currentUser.id)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (result) => {
          this.availableOrganizations = result.body as OrganizationModel[];

          if (this.getCurrentOrganizationService.currentOrganizationId === -1 && this.availableOrganizations.length > 0) {
            this.getCurrentOrganizationService.currentOrganizationId = this.availableOrganizations[0].id;
          }
        }
      );
  }
  get currentUser(): UserModel {
    return this.user;
  }

  public currentOrganization: OrganizationModel = {
    id: -1,
    name: 'My Organizations',
    authorId: -1,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  public availableOrganizations: OrganizationModel[] = [];

  constructor(
    private organizationService: OrganizationService,
    private getCurrentOrganizationService: GetCurrentOrganizationService,
    private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.subscribeToCurrentOrganization();
    this.subscribeToOrganizationsChange();

    if (this.getCurrentOrganizationService.currentOrganizationId === -1) {
      return;
    }

    const searchedOrganization = this.availableOrganizations
      .find((x) => x.id === this.getCurrentOrganizationService.currentOrganizationId);

    if (searchedOrganization) {
      this.currentOrganization = searchedOrganization;
    }
    else {
      this.setOrganization();
    }
  }

  private setOrganization(): void {
    if (this.getCurrentOrganizationService.currentOrganizationId === -1) {
      return;
    }

    this.organizationService.getOrganization(this.getCurrentOrganizationService.currentOrganizationId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (result) => {
          if (result.body) {
            this.currentOrganization = result.body;
            this.availableOrganizations.push(this.currentOrganization);
          }
        }
      );
  }

  private subscribeToCurrentOrganization(): void {
    this.getCurrentOrganizationService.currentOrganizationId$.subscribe(
      (result) => {
        if (result === -1) {
          return;
        }

        if (this.currentOrganization.id === result) {
          return;
        }

        const searchedOrganization = this.availableOrganizations.find((x) => x.id === result);

        if (searchedOrganization) {
          this.currentOrganization = searchedOrganization;
        }
        else {
          this.setOrganization();
        }
      });
  }

  public selectOrganization(organization: OrganizationModel): void {
    if (this.currentOrganization === organization &&
      this.getCurrentOrganizationService.currentOrganizationId === organization.id) {
      return;
    }

    this.currentOrganization = organization;
    this.getCurrentOrganizationService.currentOrganizationId = this.currentOrganization.id;

    this.router.navigate(['/projects'], { replaceUrl: true });
    window.scroll(0, 0);
  }

  private subscribeToOrganizationsChange(): void {
    this.getCurrentOrganizationService.organizationsUpdated$.subscribe(
      (organization) => {
        const index = this.availableOrganizations.findIndex((org) => org.id === organization.id);

        if (index === -1) {
          this.availableOrganizations.push(organization);

          if (this.getCurrentOrganizationService.currentOrganizationId === -1) {
            this.getCurrentOrganizationService.currentOrganizationId = this.availableOrganizations[0].id;
          }

          return;
        }

        this.availableOrganizations[index] = organization;

        if (this.currentOrganization.id === organization.id) {
          this.currentOrganization = organization;
        }
      }
    );
  }

  public openOrganizationsPage(): void {
    this.router.navigate(['/organizations'], {
      replaceUrl: true,
    });
    window.scroll(0, 0);
  }

  public trackByOrganization(index: number, organization: OrganizationModel): number {
    return organization.id;
  }
}
