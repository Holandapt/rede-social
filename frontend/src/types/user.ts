// Aqui definimos os tipos de dados relacionados ao usuário que serão utilizados no frontend da aplicação.

// Tipo que representa os dados de um usuário.
export interface User {
  id: number; // Identificador único do usuário.
  username: string;
  email: string;
  name: string;
  avatar: string | null; // URL do avatar do usuário, pode ser nulo se o usuário não tiver um avatar.
  followers_count: number; // quantas pessoas seguem este utilizador
  following_count: number; // quantas pessoas este utilizador segue
}

// Tipo que representa os dados de autenticação do usuário.
export interface TokenPair {
  access: string; // Token de acesso JWT.
  refresh: string; // Token de atualização JWT.
}

// Tipo que representa os dados de registro de um usuário.
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

// Dados enviados para trocar a senha.
export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
}
