import axios from 'axios';
import { HaciendaConfig, DocumentResponse } from '../types';

export class HaciendaAPI {
  private config: HaciendaConfig;
  private token?: string;

  constructor(config: HaciendaConfig) {
    this.config = config;
  }

  async getToken(username: string, password: string): Promise<string> {
    const response = await axios.post(`${this.config.apiUrl}/token`, {
      grant_type: 'password',
      client_id: this.config.clientId,
      username,
      password,
    });

    this.token = response.data.access_token as string;
    return this.token;
  }

  protected validateToken(token?: string): string {
    const useToken = token || this.token;
    if (!useToken) {
      throw new Error('Token no proporcionado');
    }
    return useToken;
  }

  protected async makeRequest<T>(method: 'get' | 'post', url: string, data?: any, token?: string): Promise<T> {
    const useToken = this.validateToken(token);
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${useToken}`,
          'Content-Type': 'application/json'
        }
      };

      const response = method === 'post'
        ? await axios.post(url, data, config)
        : await axios.get(url, config);

      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Error desconocido');
    }
  }

  async sendDocument(documentXml: string, token?: string): Promise<DocumentResponse> {
    const response = await this.makeRequest<DocumentResponse>(
      'post',
      `${this.config.apiUrl}/recepcion`,
      { xml: documentXml },
      token
    );

    return {
      clave: response.clave,
      fecha: response.fecha,
      estado: response.estado,
      mensaje: response.mensaje
    };
  }

  async checkStatus(clave: string, token?: string): Promise<DocumentResponse> {
    const response = await this.makeRequest<DocumentResponse>(
      'get',
      `${this.config.apiUrl}/recepcion/${clave}`,
      undefined,
      token
    );

    return {
      clave: response.clave,
      fecha: response.fecha,
      estado: response.estado,
      mensaje: response.mensaje
    };
  }
}
