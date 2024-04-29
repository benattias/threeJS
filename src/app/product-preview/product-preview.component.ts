import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgtSobaOrbitControls } from '@angular-three/soba/controls';
import { NgtGLTFLoaderService } from '@angular-three/soba/loaders';
import * as THREE from 'three';
import { MeshStandardMaterial, Object3D, Mesh, PerspectiveCamera } from 'three';

@Component({
  selector: 'app-product-preview',
  templateUrl: './product-preview.component.html',
  styleUrls: ['./product-preview.component.scss']
})
export class ProductPreviewComponent implements OnInit {
  @Input() 
  set color(value: string) {
    this.applyColorToModel(value);
  }

  @ViewChild('textContainer') textContainerRef!: ElementRef;

  #color = '';
  customText: string = '';
  textSize: number = 20;
  cupMaterial: MeshStandardMaterial | undefined;
  isDragging: boolean = false;
  startX: number = 0;
  startY: number = 0;

  constructor(private gltfLoaderService: NgtGLTFLoaderService) {}

  cup$ = this.gltfLoaderService.load('assets/hoodie_with_hood_up.glb');

  cupLoaded(object: Object3D) {
    object.traverse((child) => {
      if (child instanceof Mesh) {
        console.log(child);
      }
    });
    this.cupMaterial = <MeshStandardMaterial>(<Mesh>object.getObjectByName('Object_2')).material;
    this.applyCustomText();
  }

  ngOnInit() {}

  controlsReady(controls: NgtSobaOrbitControls) {
    const orbitControls = controls.controls;
    orbitControls.enableZoom = false;
    orbitControls.autoRotate = false;
    orbitControls.autoRotateSpeed = 10;
    const camera = orbitControls.object as PerspectiveCamera;
    camera.zoom = 5;
    camera.position.setY(4.5);
  }

  applyCustomText() {
    if (!this.customText || !this.cupMaterial) return;

    const textTexture = this.generateTextTexture(this.customText);

    this.cupMaterial.map = textTexture;
    this.cupMaterial.needsUpdate = true;

    this.updateTextContainerPosition();
  }

  clearText() {
    this.customText = '';
    this.removeCustomText();
  }

  removeCustomText() {
    if (!this.cupMaterial) return;

    this.cupMaterial.map = null;
    this.cupMaterial.needsUpdate = true;

    this.updateTextContainerPosition();
  }

  applyColorToModel(color: string) {
    if (this.cupMaterial) {
      this.cupMaterial.color.setHex(parseInt(color.substring(1), 16));
    }
  }

  applyTextSize() {
    this.applyCustomText();
  }

  generateTextTexture(text: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error("Impossible d'obtenir le contexte de rendu 2D.");
    }
    const fontSize = this.textSize;
    const padding = 10;
    const textWidth = context.measureText(text).width + padding * 2;
    const textHeight = fontSize + padding * 2;
    canvas.width = textWidth;
    canvas.height = textHeight;
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'red';
    context.font = `${fontSize}px Arial`;
    context.fillText(text, padding, textHeight - padding);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  updateTextContainerPosition() {
    const textContainer = this.textContainerRef.nativeElement as HTMLElement;
    const container3D = textContainer.parentElement;
  
    if (container3D) {
      const boundingBox = container3D.getBoundingClientRect();
      const centerX = boundingBox.width / 2;
      const centerY = boundingBox.height / 2;
  
      textContainer.style.left = `${centerX}px`;
      textContainer.style.top = `${centerY}px`;
    }
  }
  
  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX - this.textContainerRef.nativeElement.offsetLeft;
    this.startY = event.clientY - this.textContainerRef.nativeElement.offsetTop;
  }

  endDrag() {
    this.isDragging = false;
  }

  onDrag(event: MouseEvent) {
    if (this.isDragging) {
      const offsetX = event.clientX - this.startX;
      const offsetY = event.clientY - this.startY;
      this.textContainerRef.nativeElement.style.left = offsetX + 'px';
      this.textContainerRef.nativeElement.style.top = offsetY + 'px';
    }
  }

  onDelete() {
    this.clearText();
  }
  
  onResize(event: MouseEvent) {
    // Obtenez la taille de la fenêtre pour calculer le rapport de l'échelle du texte
    const windowWidth = window.innerWidth;
    const textContainer = this.textContainerRef.nativeElement as HTMLElement;
    const textWidth = textContainer.offsetWidth;
    
    // Calculer le ratio d'échelle en fonction de la largeur de la fenêtre
    const scaleRatio = windowWidth / textWidth;
  
    // Appliquer le ratio d'échelle au texte
    textContainer.style.transform = `scale(${scaleRatio})`;
  }
  
  onRotate(event: MouseEvent) {
    // Récupérer le conteneur de texte
    const textContainer = this.textContainerRef.nativeElement as HTMLElement;
  
    // Récupérer les dimensions du conteneur de texte
    const containerWidth = textContainer.offsetWidth;
    const containerHeight = textContainer.offsetHeight;
  
    // Récupérer les coordonnées du centre du conteneur de texte par rapport à la page
    const centerX = textContainer.getBoundingClientRect().left + containerWidth / 2;
    const centerY = textContainer.getBoundingClientRect().top + containerHeight / 2;
  
    // Récupérer les coordonnées de la souris par rapport à la page
    const mouseX = event.clientX;
    const mouseY = event.clientY;
  
    // Calculer les coordonnées du vecteur reliant le centre du texte à la position actuelle de la souris
    const vectorX = mouseX - centerX;
    const vectorY = mouseY - centerY;
  
    // Calculer l'angle de rotation en radians en utilisant atan2
    const angle = Math.atan2(vectorY, vectorX);
  
    // Convertir l'angle en degrés et appliquer la rotation au texte
    const rotation = angle * (180 / Math.PI);
    textContainer.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
  }
  
  startRotate(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  
    const textContainer = this.textContainerRef.nativeElement as HTMLElement;
    const rect = textContainer.getBoundingClientRect();
  
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
  
    const startAngle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
  
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
      const rotateAngle = currentAngle - startAngle;
      textContainer.style.transform = `translate(-50%, -50%) rotate(${rotateAngle * (180 / Math.PI)}deg)`;
    };
  
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }
  

}
