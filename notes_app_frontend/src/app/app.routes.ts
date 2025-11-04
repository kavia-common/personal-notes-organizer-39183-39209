import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'note/:noteId', component: HomeComponent },

  { path: 'notebook/:id', component: HomeComponent },
  { path: 'notebook/:id/note/:noteId', component: HomeComponent },

  { path: 'tag/:name', component: HomeComponent },
  { path: 'tag/:name/note/:noteId', component: HomeComponent },

  { path: '**', redirectTo: '' },
];
