import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'upfile-web';
  public language: string;

  constructor(
    private translateService: TranslateService
  ) {
    // --- set i18n begin --- 翻译组件
    this.translateService.addLangs(['zh', 'en']);
    this.translateService.setDefaultLang('en');
    const browserLang = this.translateService.getBrowserLang();
    this.translateService.use(browserLang.match(/zh|en/) ? browserLang : 'zh');
    // --- set i18n end ---
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
