import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Question, ResponseType } from '../interfaces/questionnaire.type';
import { SlTranslateService } from '../services/translate.service';
import { SlQuestionnaireService } from '../services/sl-questionnaire.service';

@Component({
  selector: 'sl-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
})
export class InputComponent {
  @Input() questions: Array<Question>;
  @Input() questionnaireForm: FormGroup;
  selectedIndex: number;
  dimmerIndex;
  isDimmed;
  dimmerCloseText = this.translate['frmelmnts'].btn.close;

  constructor(private translate: SlTranslateService,public qService:SlQuestionnaireService) {}

  public get reponseType(): typeof ResponseType {
    return ResponseType;
  }

  toggleQuestion(parent) {
    const { children } = parent;

    this.questions.map((q, i) => {
      if (children.includes(q._id)) {
        let child = this.questions[i];
        child['canDisplay'] = this.canDisplayChildQ(child, i);
        if (child['canDisplay'] == false) {
          child.value = '';
          this.questionnaireForm.removeControl(child._id);
        }
      }
    });
  }

  canDisplayChildQ(currentQuestion: Question, currentQuestionIndex: number) {
    let display = true;
    if (typeof currentQuestion.visibleIf == 'string' || null || undefined) {
      return false; //if condition not present
    }
    for (const question of this.questions) {
      for (const condition of currentQuestion.visibleIf) {
        if (condition._id === question._id) {
          let expression = [];
          if (condition.operator != '===') {
            if (question.responseType === 'multiselect') {
              for (const parentValue of question.value) {
                for (const value of condition.value) {
                  expression.push(
                    '(',
                    "'" + parentValue + "'",
                    '===',
                    "'" + value + "'",
                    ')',
                    condition.operator
                  );
                }
              }
            } else {
              for (const value of condition.value) {
                expression.push(
                  '(',
                  "'" + question.value + "'",
                  '===',
                  "'" + value + "'",
                  ')',
                  condition.operator
                );
              }
            }
            expression.pop();
          } else {
            if (question.responseType === 'multiselect') {
              for (const value of question.value) {
                expression.push(
                  '(',
                  "'" + condition.value + "'",
                  '===',
                  "'" + value + "'",
                  ')',
                  '||'
                );
              }
              expression.pop();
            } else {
              expression.push(
                '(',
                "'" + question.value + "'",
                condition.operator,
                "'" + condition.value + "'",
                ')'
              );
            }
          }
          if (!eval(expression.join(''))) {
            this.questions[currentQuestionIndex].isCompleted = true;
            return false;
          } else {
            // this.questions[currentQuestionIndex].isCompleted =
            //   this.utils.isQuestionComplete(currentQuestion);
          }
        }
      }
    }
    return display;
  }
}
