import { NgModule } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';



const Material = [
  MatBadgeModule,
  MatCardModule,
  MatDialogModule,
  MatDividerModule,
  MatIconModule,
  MatInputModule,
];
@NgModule({
  imports: [
    Material
  ],
  exports: [
    Material
  ]
})
export class MaterialModule { }
