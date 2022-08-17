import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/core/services/auth.service';
import { LocalStorageKeys } from 'src/entity-models/local-storage-keys';
import { UserLoginModel } from 'src/entity-models/user-login-model';
import { ValidationConstants } from 'src/entity-models/const-resources/validation-constraints';
import { ToastrService } from 'ngx-toastr';
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { InputComponent } from 'src/shared/components/tasque-input/input.component';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.sass'],
})
export class LoginPageComponent implements OnInit, OnDestroy {
  faGithub = faGithub;
  faGoogle = faGoogle;
  faHide = faEye;
  faShow = faEyeSlash;

  public userLogin: UserLoginModel = {};
  public hidePass = true;
  public loginForm: FormGroup = new FormGroup({});
  public firstName: FormControl;
  public emailControl: FormControl;
  public passwordControl: FormControl;
  public unsubscribe$ = new Subject<void>();
  public localStorage = window.localStorage;
  public localStorageKeys = LocalStorageKeys;
  private validationConstants = ValidationConstants;

  @ViewChild('passwordInput') passwordInput: InputComponent;

  get emailErrorMessage(): string {
    const ctrl = this.emailControl;
    if (ctrl.errors?.['required'] && (ctrl.dirty || ctrl.touched)) {
      return 'Email is required';
    }
    if (ctrl.errors?.['pattern']) {
      return 'Incorrect email format';
    }

    return '';
  }

  get passwordErrorMessage(): string {
    const ctrl = this.passwordControl;
    if (ctrl.errors?.['required'] && (ctrl.dirty || ctrl.touched)) {
      return 'Password is required';
    }
    if (ctrl.errors?.['minlength']) {
      return 'Password must be at least 8 characters';
    }

    return '';
  }
  test: true;
  constructor(
    private router: Router,
    private route: ActivatedRoute,

    private authService: AuthService,
    private toastrService: ToastrService,
  ) {
    this.emailControl = new FormControl(this.userLogin.email, [
      Validators.email,
      Validators.required,
      Validators.pattern(this.validationConstants.emailRegex),
    ]);
    this.passwordControl = new FormControl(this.userLogin.password, [
      Validators.required,
      Validators.minLength(this.validationConstants.minLengthPassword),
    ]);
  }

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      emailControl: this.emailControl,
      passwordControl: this.passwordControl,
    });

    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((params) => {
        if (Object.keys(params).length == 0) return;
        if (params['registered']) {
          // place pop-up notifications here
        }
        this.router.navigate(['../login'], {
          replaceUrl: true,
          relativeTo: this.route,
        });
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public submitForm(): void {
    if (!this.loginForm.valid || !this.loginForm.dirty) {
      this.toastrService.error('Invalid values');
      return;
    }

    this.userLogin = {
      email: this.loginForm.get('emailControl')?.value,
      password: this.loginForm.get('passwordControl')?.value,
    };

    this.authService
      .loginUser(this.userLogin)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((resp) => {
        if (resp.body) {
          this.authService.setAuthToken(resp.body);
        }
      });
  }

  flipPasswordVisible(): void {
    this.hidePass = !this.hidePass;
    this.passwordInput.type = this.hidePass ? 'password' : 'text';
    this.passwordInput.icon = this.hidePass ? this.faHide : this.faShow;
  }
}
