import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guards';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/maps',
        pathMatch: 'full'
    },
    {
        path: 'maps',
        loadChildren: () => import('./pages/maps/maps.module').then(m => m.MapsModule),
        data: { showTimeline: false, diagnosticsSideBar: false },
        canLoad: [AuthGuard], canActivate: [AuthGuard]
    },
    {
        path: 'diagnostics',
        // loadChildren: () => import('./pages/diagnostics/diagnostics.module').then(m => m.DiagnosticsModule),
        loadChildren: () => import('./pages/maps/maps.module').then(m => m.MapsModule),
        data: { showTimeline: false, showSubHeader: false, showSidebar: false },
        canLoad: [AuthGuard], canActivate: [AuthGuard]
    },
    {
        path: 'post-analysis',
        loadChildren: () => import('./pages/post-analysis/post-analysis.module').then(m => m.PostAnalysisModule),
        data: { showSubHeader: false, showSidebar: false, diagnosticsSideBar: false },
        canLoad: [AuthGuard], canActivate: [AuthGuard]
    },
    {
        path: 'configuration/:type',
        loadChildren: () => import('./pages/configuration/configuration.module').then(m => m.ConfigurationModule),
        data: { showSubHeader: false, showSidebar: false, showTimeline: false, diagnosticsSideBar: false },
        canLoad: [AuthGuard], canActivate: [AuthGuard]
    },
    {
        path: 'draw-mask-image',
        loadChildren: () => import('./pages/draw-mask-image/draw-mask-image.module').then(m => m.DrawMaskImageModule),
        data: { showSubHeader: false, showSidebar: false, showTimeline: false, diagnosticsSideBar: false },
        canLoad: [AuthGuard], canActivate: [AuthGuard]
    },
    {
        path: 'system-configuration',
        loadChildren: () => import('./pages/system-configuration/system-configuration.module').then(m => m.SystemConfigurationModule),
        data: { showSubHeader: false, showSidebar: false, showTimeline: false, diagnosticsSideBar: false },
        canLoad: [AuthGuard], canActivate: [AuthGuard]
    },
    {
        path: '**',
        redirectTo: 'maps'
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }