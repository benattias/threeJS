// AppComponent.ts

import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  modelColors: string[] = [
    '#b3478c', '#1e62c0', '#ffa764', '#3de68b', '#a11f2a', '#ffbf00', '#ffffff', '#000000', '#8B0000'
  ];
  
  selectedModelColor = this.modelColors[0];

  // Fonction appelée lors de la sélection de la couleur du modèle
  selectModelColor(color: string) {
    this.selectedModelColor = color;
  }
}
