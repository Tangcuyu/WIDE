import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'zsim-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public language: string;
  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
  }

  // public methods 界面语言切换
  public changeLanguage() {
    this.language = this.translateService.currentLang;
    console.log(this.language);
    if (this.language === 'zh') {
      this.translateService.use('en');
    } else {
      this.translateService.use('zh');
    }
  }

}
