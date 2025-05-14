import { HaciendaAPI } from '../api';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HaciendaAPI', () => {
  const config = {
    apiUrl: 'https://api-sandbox.comprobanteselectronicos.go.cr/recepcion/v1',
    clientId: 'test-client',
    environment: 'desarrollo' as const
  };

  const api = new HaciendaAPI(config);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provided config', () => {
      const config = {
        apiUrl: 'https://api.example.com',
        clientId: 'test-client',
        environment: 'desarrollo' as const
      };
      const api = new HaciendaAPI(config);
      expect(api['config']).toBe(config);
    });
  });

  describe('getToken', () => {
    it('should get token successfully', async () => {
      const mockToken = 'mock-token-123';
      mockedAxios.post.mockResolvedValueOnce({ data: { access_token: mockToken } });

      const token = await api.getToken('test@example.com', 'password123');

      expect(token).toBe(mockToken);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${config.apiUrl}/token`,
        {
          grant_type: 'password',
          client_id: config.clientId,
          username: 'test@example.com',
          password: 'password123'
        }
      );
    });

    it('should throw error on failed token request', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Authentication failed'));

      await expect(api.getToken('test@example.com', 'wrong-password'))
        .rejects.toThrow('Authentication failed');
    });
  });



  describe('sendDocument', () => {
    let api: HaciendaAPI;

    beforeEach(() => {
      api = new HaciendaAPI(config);
    });
    const mockXml = '<FacturaElectronica></FacturaElectronica>';
    const mockToken = 'mock-token-123';
    const mockResponse = {
      clave: '123456789',
      fecha: '2025-05-13T22:00:00-06:00',
      estado: 'aceptado' as const,
      mensaje: 'Documento procesado correctamente'
    };

    it('should send document successfully with provided token', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const response = await api.sendDocument(mockXml, mockToken);

      expect(response).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${config.apiUrl}/recepcion`,
        { xml: mockXml },
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('should throw error if no token is provided or stored', async () => {
      await expect(api.sendDocument(mockXml))
        .rejects.toThrow('Token no proporcionado');
    });

    it('should throw error on failed document submission', async () => {
      const error = new Error('Invalid document');
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(api.sendDocument(mockXml, mockToken))
        .rejects.toThrow(error.message);
    });
  });

  describe('checkStatus', () => {
    let api: HaciendaAPI;

    beforeEach(() => {
      api = new HaciendaAPI(config);
    });
    it('should handle API errors correctly', async () => {
      const errorMessage = 'API Error';
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(api.checkStatus(mockClave, 'test-token'))
        .rejects.toThrow(errorMessage);
    });
    const mockClave = '50601011800310174000100100001010000000011199999999';
    const mockToken = 'mock-token-123';
    const mockResponse = {
      clave: mockClave,
      fecha: '2025-05-13T22:00:00-06:00',
      estado: 'aceptado' as const,
      mensaje: 'Documento procesado correctamente'
    };

    it('should check status successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      const response = await api.checkStatus(mockClave, mockToken);

      expect(response).toEqual(mockResponse);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${config.apiUrl}/recepcion/${mockClave}`,
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    });

    it('should throw error if no token is provided or stored', async () => {
      await expect(api.checkStatus(mockClave))
        .rejects.toThrow('Token no proporcionado');
    });

    it('should throw error on failed status check', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Document not found'));

      await expect(api.checkStatus(mockClave, mockToken))
        .rejects.toThrow('Document not found');
    });
  });
});
