import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emailMask',
  standalone: true
})
export class EmailMaskPipe implements PipeTransform {
  transform(email: string | null): string {
    if (!email || !email.includes('@')) return '';
  
    const [name, domain] = email.split('@');
    const visibleLength = Math.ceil(name.length / 2);
    const visiblePart = name.slice(0, visibleLength);
    const maskedPart = '*'.repeat(name.length - visibleLength);
    return `${visiblePart}${maskedPart}@${domain}`;
  }
}
