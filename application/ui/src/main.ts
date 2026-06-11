import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { config, server } from './config/config';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

fetch(`${server.LANGUAGE_URL}/language.json`).then(res => res.json()).then((resp) =>{
  config.translation.push(resp);
  platformBrowserDynamic().bootstrapModule(AppModule);
}).catch(err => {
  config.translation = [];
  platformBrowserDynamic().bootstrapModule(AppModule);
  console.error(err)
});