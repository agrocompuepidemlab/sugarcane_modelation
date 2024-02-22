import { Routes } from '@angular/router';
import { MapComponent } from './map/map.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { ErrorComponent } from './error/error.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { FilesUserComponent } from './files-user/files-user.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'map', component: MapComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'user-files-to-uploaad', component: FilesUserComponent},
  { path: '**', pathMatch: 'full', component: ErrorComponent },
];
