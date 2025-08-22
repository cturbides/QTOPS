import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Usuario } from '@modules/curso/graphql/types/usuario.model';

@Resolver(() => Usuario)
export class UsuarioResolver {
    constructor() { }

    @ResolveField(() => String, { name: 'avatar' })
    async avatar(@Parent() usuario: Usuario): Promise<string> {
        return usuario.avatar ?? "No aplica";
    }
}
