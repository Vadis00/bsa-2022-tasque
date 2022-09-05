import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import {
  faCaretDown,
  faCaretUp,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { UserModel } from 'src/core/models/user/user-model';
import { AuthService } from 'src/core/services/auth.service';
import { GetCurrentUserService } from 'src/core/services/get-current-user.service';
import { MenuDropdownOption } from '../tasque-menu-dropdown/menu-dropdown.component';

@Component({
  selector: 'tasque-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.sass'],
})
export class HeaderComponent implements OnInit {
  public searchIcon = faMagnifyingGlass;
  public currentUser: UserModel = {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@gmail.com',
  };
  public createOptions: MenuDropdownOption[] = [
    { name: 'Create Organization' },
    { name: 'Create Project' },
  ];
  public yourWorkOptions: MenuDropdownOption[] = [
    { name: 'One task' },
    { name: 'Some task' },
  ];
  public projectOptions: MenuDropdownOption[] = [
    { name: 'Last Project' },
    { name: 'Previous Project' },
  ];
  public profileOptions: MenuDropdownOption[] = [
    { name: 'Profile settings' },
    { name: 'Log out' },
  ];

  public upArrowIcon = faCaretUp;
  public downArrowIcon = faCaretDown;

  public createItemControl = new FormControl<MenuDropdownOption | undefined>(
    undefined,
  );
  public profileControl = new FormControl<MenuDropdownOption | undefined>(
    undefined,
  );

  constructor(
    private currentUserService: GetCurrentUserService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.currentUserService.currentUser.subscribe((user) => {
      this.currentUser = user as UserModel;
    });

    this.currentUserService.userAvatarUpdated$.subscribe((avatar) => {
      this.currentUser.avatarURL = avatar;
    });

    this.createItemControl.valueChanges.subscribe((option) =>
      this.createItemOptionChange(option),
    );

    this.profileControl.valueChanges.subscribe((option) =>
      this.profileOptionChange(option),
    );
  }

  public openCreateTaskDialog(): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createItemOptionChange(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    option: MenuDropdownOption | null | undefined,
  ): void {}

  public profileOptionChange(
    option: MenuDropdownOption | null | undefined,
  ): void {
    switch (option?.name) {
      case 'Log out':
        this.authService.logout();
        return;
      case 'Profile settings':
        this.router.navigate(['/user/profile'], { replaceUrl: true });
        return;
    }
  }

  get currentUserAvatar(): string {
    if (!this.currentUser || !this.currentUser.avatarURL) {
      return '\\assets\\avatar.png';
    }

    return this.currentUser.avatarURL;
  }

  public openProjectsPage(): void {
    this.router.navigate(['/projects'], { replaceUrl: true });
    window.scroll(0, 0);
  }
}
