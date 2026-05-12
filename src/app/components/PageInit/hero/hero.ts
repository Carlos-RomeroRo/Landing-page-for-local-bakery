import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService, ModalType } from '../../../services/modal.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  constructor(private modalService: ModalService) {}

  openModal(type: ModalType) {
    this.modalService.openModal(type);
  }
}

