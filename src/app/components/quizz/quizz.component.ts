import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import quizzes from '../../../assets/data/quizz_questions.json';

@Component({
  selector: 'app-quizz',
  templateUrl: './quizz.component.html',
  styleUrls: ['./quizz.component.css']
})
export class QuizzComponent implements OnInit {
  title: string = '';
  questions: any[] = [];
  questionSelected: any;
  answers: string[] = [];
  answerSelected: string = '';
  questionIndex: number = 0;
  questionMaxIndex: number = 0;
  finished: boolean = false;

  private currentQuiz: any;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const quizId = Number(this.route.snapshot.paramMap.get('id')); // Obtém o ID do quiz da rota
    this.currentQuiz = quizzes.find((q: any) => q.id === quizId);

    if (this.currentQuiz) {
      this.title = this.currentQuiz.title;
      this.questions = this.currentQuiz.questions;
      this.questionSelected = this.questions[this.questionIndex];
      this.questionMaxIndex = this.questions.length;
    } else {
      this.router.navigate(['/']); // Redireciona para o home se o quiz não existir
    }
  }

  playerChoose(value: string) {
    this.answers.push(value);
    this.nextStep();
  }

  nextStep() {
    this.questionIndex++;
    if (this.questionIndex < this.questionMaxIndex) {
      this.questionSelected = this.questions[this.questionIndex];
    } else {
      const finalAnswer = this.checkResult(this.answers);
      this.finished = true;
      this.answerSelected = this.getResult(finalAnswer);
    }
  }

  checkResult(answers: string[]): string {
    return answers.reduce((prev, curr) =>
      answers.filter(a => a === prev).length > answers.filter(a => a === curr).length ? prev : curr
    );
  }

  getResult(alias: string): string {
    // Usa o quiz atual carregado na memória
    return this.currentQuiz.results[alias] || 'Resultado não encontrado';
  }

  goBackToHome() {
    this.router.navigate(['/']);
  }
}
