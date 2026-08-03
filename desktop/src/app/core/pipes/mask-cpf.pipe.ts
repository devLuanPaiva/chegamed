import { Pipe, PipeTransform } from '@angular/core';

import { maskCpf } from '@shared/utils/cpf.util';

@Pipe({
    name: 'maskCpf',
})
export class MaskCpfPipe implements PipeTransform {
    transform(value: string): string {
        return maskCpf(value);
    }
}
