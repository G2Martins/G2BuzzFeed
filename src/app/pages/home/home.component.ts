import { Component } from '@angular/core';
import { Router } from '@angular/router';
import quizzes from '../../../assets/data/quizz_questions.json';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  quizzes: any[] = quizzes; // Carrega os quizzes do JSON

  constructor(private router: Router) {}

  navigateToQuiz(id: number) {
    this.router.navigate(['/quiz', id]); // Redireciona para o quiz selecionado
  }
}
