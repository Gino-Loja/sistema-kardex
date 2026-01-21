import { categoriasRepository } from "@/lib/dal/repositories/categorias.repository";

export const listCategorias = async (input?: { page?: number; pageSize?: number }) => {
  return categoriasRepository.listar({
    page: input?.page,
    pageSize: input?.pageSize,
  });
};

export const getCategoriaById = async (id: string) => {
  return categoriasRepository.obtenerPorId(id);
};

export const createCategoria = async (
  input: Parameters<typeof categoriasRepository.crear>[0],
) => {
  return categoriasRepository.crear(input);
};

export const updateCategoria = async (
  id: string,
  input: Parameters<typeof categoriasRepository.actualizar>[1],
) => {
  return categoriasRepository.actualizar(id, input);
};

export const deleteCategoria = async (id: string) => {
  return categoriasRepository.eliminar(id);
};

export const deactivateCategoria = async (id: string) => {
  return categoriasRepository.desactivar(id);
};
