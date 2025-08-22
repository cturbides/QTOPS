import { Usuario } from '@modules/curso/graphql/types/usuario.model';
import { UsuarioService } from '@modules/curso/services/usuario.service';
import { Query, Parent, ResolveField, Resolver, Args } from '@nestjs/graphql';

@Resolver(() => Usuario)
export class UsuarioResolver {
    constructor(private readonly usuarioService: UsuarioService) { }

    @Query(() => [Usuario], { name: 'usuarios' })
    async obtenerUsuarios(): Promise<Usuario[]> {
        return this.usuarioService.obtenerTodos();
    }

    @Query(() => Usuario, { name: 'usuario' })
    async obtenerUsuario(@Args('id', { type: () => String }) id: string): Promise<Usuario> {
        return this.usuarioService.obtenerPorId(id);
    }

    @ResolveField(() => String, { name: 'avatar' })
    async avatar(@Parent() usuario: Usuario): Promise<string> {
        return usuario.avatar ?? "No aplica";
    }
}
