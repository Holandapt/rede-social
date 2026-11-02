import { isAxiosError } from "axios";


// Essa função recebe um erro e retorna uma lista de mensagens de erro.
// Se o erro for uma resposta de erro do axios, ela extrai as mensagens de erro do corpo da resposta.
// Caso contrário, ela retorna uma mensagem genérica de erro.
export function getErrorMessages(error: unknown): string[] {
  // esse trecho verifica se o erro é uma instância de AxiosError e se possui uma resposta.
  if (isAxiosError(error) && error.response) {
    // esse trecho verifica se o corpo da resposta é um objeto e não é nulo.
    const data = error.response.data;
    // esse trecho retorna uma lista de mensagens de erro extraídas do corpo da resposta.
    if (typeof data === "object" && data !== null) {
      // Object.values(data) retorna um array com os valores das propriedades do objeto data.
      return Object.values(data).flat().map(String);
    }
  }
  // se o erro não for uma resposta de erro do axios, retorna uma mensagem genérica de erro.
  return ["Não foi possível ligar ao servidor."];
}
