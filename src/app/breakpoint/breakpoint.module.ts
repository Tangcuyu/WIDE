import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material/material.module';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { BreakpointComponent } from './breakpoint.component';

@NgModule({
  declarations: [BreakpointComponent],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    TranslateModule
  ]
})
export class BreakpointModule { }
