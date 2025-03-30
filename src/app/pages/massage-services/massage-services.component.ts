import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MassageServiceService, MassageService } from '../../services/massage-services.service';
import { Observable } from 'rxjs';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-massage-services',
  standalone: true,
  imports: [CommonModule, PriceFormatPipe, RouterModule],
  templateUrl: './massage-services.component.html',
  styleUrls: ['./massage-services.component.scss']
})
export class MassageServicesComponent implements OnInit {
  massageServices$: Observable<MassageService[]>;

  constructor(private massageService: MassageServiceService) {
    this.massageServices$ = this.massageService.getMassageServices();
  }

  ngOnInit(): void {}
}
