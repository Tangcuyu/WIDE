import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BreakpointComponent } from './breakpoint/breakpoint.component';
import { HomeComponent } from './home/home.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'breakpoint',
    component: BreakpointComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
