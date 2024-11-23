import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { QuizzComponent } from './components/quizz/quizz.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Rota para a página inicial
  { path: 'quiz/:id', component: QuizzComponent }, // Rota dinâmica para o quiz
  { path: '**', redirectTo: '' } // Redireciona rotas não encontradas para a home
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
