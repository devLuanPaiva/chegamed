import { Pipe, PipeTransform } from '@angular/core';

import { formatCnpj } from '@shared/utils/cnpj.util';

@Pipe({
    name: 'formatCnpj',
})
export class FormatCnpjPipe implements PipeTransform {
    transform(value: string): string {
        return formatCnpj(value);
    }
}
