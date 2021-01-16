import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'zsim-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  public language: string;

  constructor(private translateService: TranslateService) { }

  ngOnInit(): void {
  }

  // public methods 界面语言切换
  public changeLanguage() {
    this.language = this.translateService.currentLang;
    if (this.language === 'zh') {
      this.translateService.use('en');
    } else {
      this.translateService.use('zh');
    }
  }
}
