import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home').then((m) => m.Home) },
  { path: 'quizzes', loadComponent: () => import('./pages/all').then((m) => m.AllQuizzes) },
  { path: 'quiz/:slug', loadComponent: () => import('./pages/quiz').then((m) => m.QuizPage) },
  { path: 'categoria/:slug', loadComponent: () => import('./pages/category').then((m) => m.CategoryPage) },
  { path: 'meus-resultados', loadComponent: () => import('./pages/results').then((m) => m.MyResults) },
  { path: '**', loadComponent: () => import('./pages/not-found').then((m) => m.NotFound) },
];
