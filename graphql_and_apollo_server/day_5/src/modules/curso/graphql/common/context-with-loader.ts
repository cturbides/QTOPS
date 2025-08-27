import { CursoDataLoader, LeccionDataLoader, ProgresoDataLoader, UsuarioDataLoader } from "@modules/curso/dataloaders/types/curso.dataloader.types";

export interface GraphQLContextWithLoaders {
    req: Request;
    loaders: {
        curso: CursoDataLoader;
        usuario: UsuarioDataLoader;
        leccion: LeccionDataLoader;
        progreso: ProgresoDataLoader;
    };
}