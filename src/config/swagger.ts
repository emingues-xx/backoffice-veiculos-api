import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backoffice Veículos API',
      version: '1.0.0',
      description: `
        API para gestão de anúncios e vendas de veículos do sistema de E-commerce de Veículos.
        
        ## Funcionalidades
        - 🚗 CRUD completo de veículos
        - 👥 Gestão de usuários e autenticação JWT
        - 💰 Gestão de vendas e comissões
        - 📊 Estatísticas e relatórios
        - 🔍 Filtros avançados de busca
        
        ## Autenticação
        Esta API utiliza JWT (JSON Web Tokens) para autenticação. 
        Inclua o token no header: \`Authorization: Bearer <token>\`
        
        ## Roles de Usuário
        - **admin**: Acesso total ao sistema
        - **manager**: Gestão de veículos e vendas
        - **seller**: Criação e gestão de seus próprios veículos
      `,
      contact: {
        name: 'Squad Backoffice',
        email: 'backoffice@ecommerce-veiculos.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.port}${config.apiPrefix}`,
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://backoffice-veiculos-api-production.up.railway.app/api',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtido através do endpoint de login'
        }
      },
      schemas: {
        // Vehicle Schemas
        Vehicle: {
          type: 'object',
          required: [
            'brand', 'vehicleModel', 'year', 'mileage', 'price', 
            'fuelType', 'transmission', 'color', 'doors', 'category', 
            'condition', 'description', 'images', 'location', 'seller'
          ],
          properties: {
            _id: {
              type: 'string',
              description: 'ID único do veículo',
              example: '68ed5b50572e134dd39350e4'
            },
            brand: {
              type: 'string',
              description: 'Marca do veículo',
              minLength: 2,
              maxLength: 50,
              example: 'Toyota'
            },
            vehicleModel: {
              type: 'string',
              description: 'Modelo do veículo',
              minLength: 2,
              maxLength: 50,
              example: 'Corolla'
            },
            year: {
              type: 'integer',
              description: 'Ano de fabricação',
              minimum: 1900,
              maximum: 2025,
              example: 2023
            },
            mileage: {
              type: 'integer',
              description: 'Quilometragem em km',
              minimum: 0,
              example: 15000
            },
            price: {
              type: 'number',
              description: 'Preço em reais (R$)',
              minimum: 0,
              example: 85000
            },
            fuelType: {
              type: 'string',
              description: 'Tipo de combustível',
              enum: ['gasoline', 'ethanol', 'diesel', 'electric', 'hybrid'],
              example: 'gasoline'
            },
            transmission: {
              type: 'string',
              description: 'Tipo de transmissão',
              enum: ['manual', 'automatic'],
              example: 'automatic'
            },
            color: {
              type: 'string',
              description: 'Cor do veículo',
              minLength: 2,
              maxLength: 30,
              example: 'Branco'
            },
            doors: {
              type: 'integer',
              description: 'Número de portas',
              minimum: 2,
              maximum: 6,
              example: 4
            },
            category: {
              type: 'string',
              description: 'Categoria do veículo',
              enum: ['car', 'motorcycle', 'truck', 'van'],
              example: 'car'
            },
            condition: {
              type: 'string',
              description: 'Condição do veículo',
              enum: ['new', 'used'],
              example: 'used'
            },
            description: {
              type: 'string',
              description: 'Descrição detalhada do veículo',
              minLength: 10,
              maxLength: 2000,
              example: 'Veículo em excelente estado, único dono, revisões em dia.'
            },
            images: {
              type: 'array',
              description: 'Array de URLs das imagens',
              items: {
                type: 'string',
                format: 'uri'
              },
              minItems: 1,
              maxItems: 10,
              example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
            },
            features: {
              type: 'array',
              description: 'Array de características especiais',
              items: {
                type: 'string',
                maxLength: 100
              },
              maxItems: 20,
              example: ['Ar condicionado', 'Direção hidráulica', 'Vidros elétricos']
            },
            location: {
              type: 'object',
              description: 'Localização do veículo',
              required: ['city', 'state', 'zipCode'],
              properties: {
                city: {
                  type: 'string',
                  description: 'Cidade',
                  minLength: 2,
                  maxLength: 50,
                  example: 'São Paulo'
                },
                state: {
                  type: 'string',
                  description: 'Estado',
                  minLength: 2,
                  maxLength: 50,
                  example: 'SP'
                },
                zipCode: {
                  type: 'string',
                  description: 'CEP',
                  pattern: '^\\d{5}-?\\d{3}$',
                  example: '01234-567'
                }
              }
            },
            seller: {
              type: 'object',
              description: 'Informações do vendedor',
              required: ['id', 'name', 'phone', 'email'],
              properties: {
                id: {
                  type: 'string',
                  description: 'ID do vendedor',
                  example: '68ed57a3572e134dd39350ce'
                },
                name: {
                  type: 'string',
                  description: 'Nome do vendedor',
                  minLength: 2,
                  maxLength: 50,
                  example: 'Concessionária Toyota'
                },
                phone: {
                  type: 'string',
                  description: 'Telefone do vendedor',
                  pattern: '^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$',
                  example: '(11) 99999-9999'
                },
                email: {
                  type: 'string',
                  description: 'Email do vendedor',
                  format: 'email',
                  example: 'vendas@toyota.com'
                }
              }
            },
            status: {
              type: 'string',
              description: 'Status do veículo',
              enum: ['active', 'sold', 'inactive', 'pending'],
              default: 'active',
              example: 'active'
            },
            isFeatured: {
              type: 'boolean',
              description: 'Se o veículo é destaque',
              default: false,
              example: false
            },
            views: {
              type: 'integer',
              description: 'Número de visualizações',
              default: 0,
              example: 0
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
        },
        CreateVehicleRequest: {
          type: 'object',
          required: [
            'brand', 'vehicleModel', 'year', 'mileage', 'price', 
            'fuelType', 'transmission', 'color', 'doors', 'category', 
            'condition', 'description', 'images', 'location', 'seller'
          ],
          properties: {
            brand: {
              type: 'string',
              description: 'Marca do veículo',
              minLength: 2,
              maxLength: 50,
              example: 'Toyota'
            },
            vehicleModel: {
              type: 'string',
              description: 'Modelo do veículo',
              minLength: 2,
              maxLength: 50,
              example: 'Corolla'
            },
            year: {
              type: 'integer',
              description: 'Ano de fabricação',
              minimum: 1900,
              maximum: 2025,
              example: 2023
            },
            mileage: {
              type: 'integer',
              description: 'Quilometragem em km',
              minimum: 0,
              example: 15000
            },
            price: {
              type: 'number',
              description: 'Preço em reais (R$)',
              minimum: 0,
              example: 85000
            },
            fuelType: {
              type: 'string',
              description: 'Tipo de combustível',
              enum: ['gasoline', 'ethanol', 'diesel', 'electric', 'hybrid'],
              example: 'gasoline'
            },
            transmission: {
              type: 'string',
              description: 'Tipo de transmissão',
              enum: ['manual', 'automatic'],
              example: 'automatic'
            },
            color: {
              type: 'string',
              description: 'Cor do veículo',
              minLength: 2,
              maxLength: 30,
              example: 'Branco'
            },
            doors: {
              type: 'integer',
              description: 'Número de portas',
              minimum: 2,
              maximum: 6,
              example: 4
            },
            category: {
              type: 'string',
              description: 'Categoria do veículo',
              enum: ['car', 'motorcycle', 'truck', 'van'],
              example: 'car'
            },
            condition: {
              type: 'string',
              description: 'Condição do veículo',
              enum: ['new', 'used'],
              example: 'used'
            },
            description: {
              type: 'string',
              description: 'Descrição detalhada do veículo',
              minLength: 10,
              maxLength: 2000,
              example: 'Veículo em excelente estado, único dono, revisões em dia.'
            },
            images: {
              type: 'array',
              description: 'Array de URLs das imagens',
              items: {
                type: 'string',
                format: 'uri'
              },
              minItems: 1,
              maxItems: 10,
              example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
            },
            features: {
              type: 'array',
              description: 'Array de características especiais',
              items: {
                type: 'string',
                maxLength: 100
              },
              maxItems: 20,
              example: ['Ar condicionado', 'Direção hidráulica', 'Vidros elétricos']
            },
            location: {
              type: 'object',
              description: 'Localização do veículo',
              required: ['city', 'state', 'zipCode'],
              properties: {
                city: {
                  type: 'string',
                  description: 'Cidade',
                  minLength: 2,
                  maxLength: 50,
                  example: 'São Paulo'
                },
                state: {
                  type: 'string',
                  description: 'Estado',
                  minLength: 2,
                  maxLength: 50,
                  example: 'SP'
                },
                zipCode: {
                  type: 'string',
                  description: 'CEP',
                  pattern: '^\\d{5}-?\\d{3}$',
                  example: '01234-567'
                }
              }
            },
            seller: {
              type: 'object',
              description: 'Informações do vendedor',
              required: ['id', 'name', 'phone', 'email'],
              properties: {
                id: {
                  type: 'string',
                  description: 'ID do vendedor',
                  example: '68ed57a3572e134dd39350ce'
                },
                name: {
                  type: 'string',
                  description: 'Nome do vendedor',
                  minLength: 2,
                  maxLength: 50,
                  example: 'Concessionária Toyota'
                },
                phone: {
                  type: 'string',
                  description: 'Telefone do vendedor',
                  pattern: '^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$',
                  example: '(11) 99999-9999'
                },
                email: {
                  type: 'string',
                  description: 'Email do vendedor',
                  format: 'email',
                  example: 'vendas@toyota.com'
                }
              }
            },
            isFeatured: {
              type: 'boolean',
              description: 'Se o veículo é destaque',
              default: false,
              example: false
            }
          }
        },
        UpdateVehicleRequest: {
          type: 'object',
          properties: {
            brand: {
              type: 'string',
              description: 'Marca do veículo',
              minLength: 2,
              maxLength: 50,
              example: 'Toyota'
            },
            vehicleModel: {
              type: 'string',
              description: 'Modelo do veículo',
              minLength: 2,
              maxLength: 50,
              example: 'Corolla'
            },
            year: {
              type: 'integer',
              description: 'Ano de fabricação',
              minimum: 1900,
              maximum: 2025,
              example: 2023
            },
            mileage: {
              type: 'integer',
              description: 'Quilometragem em km',
              minimum: 0,
              example: 15000
            },
            price: {
              type: 'number',
              description: 'Preço em reais (R$)',
              minimum: 0,
              example: 85000
            },
            fuelType: {
              type: 'string',
              description: 'Tipo de combustível',
              enum: ['gasoline', 'ethanol', 'diesel', 'electric', 'hybrid'],
              example: 'gasoline'
            },
            transmission: {
              type: 'string',
              description: 'Tipo de transmissão',
              enum: ['manual', 'automatic'],
              example: 'automatic'
            },
            color: {
              type: 'string',
              description: 'Cor do veículo',
              minLength: 2,
              maxLength: 30,
              example: 'Branco'
            },
            doors: {
              type: 'integer',
              description: 'Número de portas',
              minimum: 2,
              maximum: 6,
              example: 4
            },
            category: {
              type: 'string',
              description: 'Categoria do veículo',
              enum: ['car', 'motorcycle', 'truck', 'van'],
              example: 'car'
            },
            condition: {
              type: 'string',
              description: 'Condição do veículo',
              enum: ['new', 'used'],
              example: 'used'
            },
            description: {
              type: 'string',
              description: 'Descrição detalhada do veículo',
              minLength: 10,
              maxLength: 2000,
              example: 'Veículo em excelente estado, único dono, revisões em dia.'
            },
            images: {
              type: 'array',
              description: 'Array de URLs das imagens',
              items: {
                type: 'string',
                format: 'uri'
              },
              minItems: 1,
              maxItems: 10,
              example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg']
            },
            features: {
              type: 'array',
              description: 'Array de características especiais',
              items: {
                type: 'string',
                maxLength: 100
              },
              maxItems: 20,
              example: ['Ar condicionado', 'Direção hidráulica', 'Vidros elétricos']
            },
            location: {
              type: 'object',
              description: 'Localização do veículo',
              properties: {
                city: {
                  type: 'string',
                  description: 'Cidade',
                  minLength: 2,
                  maxLength: 50,
                  example: 'São Paulo'
                },
                state: {
                  type: 'string',
                  description: 'Estado',
                  minLength: 2,
                  maxLength: 50,
                  example: 'SP'
                },
                zipCode: {
                  type: 'string',
                  description: 'CEP',
                  pattern: '^\\d{5}-?\\d{3}$',
                  example: '01234-567'
                }
              }
            },
            seller: {
              type: 'object',
              description: 'Informações do vendedor',
              properties: {
                id: {
                  type: 'string',
                  description: 'ID do vendedor',
                  example: '68ed57a3572e134dd39350ce'
                },
                name: {
                  type: 'string',
                  description: 'Nome do vendedor',
                  minLength: 2,
                  maxLength: 50,
                  example: 'Concessionária Toyota'
                },
                phone: {
                  type: 'string',
                  description: 'Telefone do vendedor',
                  pattern: '^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$',
                  example: '(11) 99999-9999'
                },
                email: {
                  type: 'string',
                  description: 'Email do vendedor',
                  format: 'email',
                  example: 'vendas@toyota.com'
                }
              }
            },
            status: {
              type: 'string',
              description: 'Status do veículo',
              enum: ['active', 'sold', 'inactive', 'pending'],
              example: 'active'
            },
            isFeatured: {
              type: 'boolean',
              description: 'Se o veículo é destaque',
              example: false
            }
          }
        },
        VehicleFilters: {
          type: 'object',
          properties: {
            brand: {
              type: 'string',
              description: 'Filtrar por marca',
              example: 'Toyota'
            },
            vehicleModel: {
              type: 'string',
              description: 'Filtrar por modelo',
              example: 'Corolla'
            },
            yearMin: {
              type: 'integer',
              description: 'Ano mínimo',
              example: 2020
            },
            yearMax: {
              type: 'integer',
              description: 'Ano máximo',
              example: 2024
            },
            priceMin: {
              type: 'number',
              description: 'Preço mínimo',
              example: 50000
            },
            priceMax: {
              type: 'number',
              description: 'Preço máximo',
              example: 100000
            },
            fuelType: {
              type: 'string',
              description: 'Tipo de combustível',
              enum: ['gasoline', 'ethanol', 'diesel', 'electric', 'hybrid'],
              example: 'gasoline'
            },
            transmission: {
              type: 'string',
              description: 'Tipo de transmissão',
              enum: ['manual', 'automatic'],
              example: 'automatic'
            },
            category: {
              type: 'string',
              description: 'Categoria do veículo',
              enum: ['car', 'motorcycle', 'truck', 'van'],
              example: 'car'
            },
            condition: {
              type: 'string',
              description: 'Condição do veículo',
              enum: ['new', 'used'],
              example: 'used'
            },
            city: {
              type: 'string',
              description: 'Cidade',
              example: 'São Paulo'
            },
            state: {
              type: 'string',
              description: 'Estado',
              example: 'SP'
            },
            status: {
              type: 'string',
              description: 'Status do veículo',
              enum: ['active', 'sold', 'inactive', 'pending'],
              example: 'active'
            },
            isFeatured: {
              type: 'boolean',
              description: 'Apenas veículos em destaque',
              example: false
            },
            page: {
              type: 'integer',
              description: 'Número da página',
              minimum: 1,
              default: 1,
              example: 1
            },
            limit: {
              type: 'integer',
              description: 'Itens por página',
              minimum: 1,
              maximum: 100,
              default: 10,
              example: 10
            },
            sortBy: {
              type: 'string',
              description: 'Campo para ordenação',
              default: 'createdAt',
              example: 'price'
            },
            sortOrder: {
              type: 'string',
              description: 'Ordem da classificação',
              enum: ['asc', 'desc'],
              default: 'desc',
              example: 'desc'
            }
          }
        },
        // User Schemas
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'ID único do usuário',
              example: '68ed57a3572e134dd39350ce'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'admin@backoffice.com'
            },
            name: {
              type: 'string',
              description: 'Nome do usuário',
              example: 'Administrador'
            },
            role: {
              type: 'string',
              description: 'Role do usuário',
              enum: ['admin', 'manager', 'seller'],
              example: 'admin'
            },
            isActive: {
              type: 'boolean',
              description: 'Se o usuário está ativo',
              example: true
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de criação',
              example: '2024-01-15T10:30:00.000Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Data de atualização',
              example: '2024-01-15T10:30:00.000Z'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email do usuário',
              example: 'admin@backoffice.com'
            },
            password: {
              type: 'string',
              description: 'Senha do usuário',
              example: 'Admin123!@#'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  description: 'JWT token para autenticação',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                },
                user: {
                  $ref: '#/components/schemas/User'
                }
              }
            },
            message: {
              type: 'string',
              example: 'Login successful'
            }
          }
        },
        // Common Response Schemas
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indica se a operação foi bem-sucedida',
              example: true
            },
            data: {
              type: 'object',
              description: 'Dados da resposta'
            },
            message: {
              type: 'string',
              description: 'Mensagem da resposta',
              example: 'Operation successful'
            },
            error: {
              type: 'string',
              description: 'Mensagem de erro (quando success = false)',
              example: 'Validation error'
            },
            details: {
              type: 'array',
              description: 'Detalhes adicionais (erros de validação, etc.)',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email'
                  },
                  message: {
                    type: 'string',
                    example: 'Email is required'
                  }
                }
              }
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              properties: {
                vehicles: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Vehicle'
                  }
                },
                total: {
                  type: 'integer',
                  description: 'Total de itens',
                  example: 25
                },
                page: {
                  type: 'integer',
                  description: 'Página atual',
                  example: 1
                },
                limit: {
                  type: 'integer',
                  description: 'Itens por página',
                  example: 10
                },
                totalPages: {
                  type: 'integer',
                  description: 'Total de páginas',
                  example: 3
                }
              }
            },
            message: {
              type: 'string',
              example: 'Vehicles retrieved successfully'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Tipo do erro',
              example: 'Validation error'
            },
            message: {
              type: 'string',
              description: 'Mensagem de erro',
              example: 'Validation failed'
            },
            details: {
              type: 'array',
              description: 'Detalhes dos erros de validação',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'brand'
                  },
                  message: {
                    type: 'string',
                    example: 'Brand is required'
                  }
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
