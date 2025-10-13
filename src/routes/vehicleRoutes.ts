import { Router } from 'express';
import {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
  toggleFeatured
} from '@/controllers/vehicleController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateQuery, validateParams } from '@/middleware/validation';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleFiltersSchema,
  mongoIdSchema
} from '@/utils/validationSchemas';

const router = Router();

/**
 * @swagger
 * /vehicles:
 *   get:
 *     summary: Listar veículos com filtros
 *     description: Retorna uma lista paginada de veículos com opções de filtro avançadas
 *     tags: [Vehicles]
 *     parameters:
 *       - in: query
 *         name: brand
 *         schema:
 *           type: string
 *         description: Filtrar por marca
 *         example: Toyota
 *       - in: query
 *         name: vehicleModel
 *         schema:
 *           type: string
 *         description: Filtrar por modelo
 *         example: Corolla
 *       - in: query
 *         name: yearMin
 *         schema:
 *           type: integer
 *         description: Ano mínimo
 *         example: 2020
 *       - in: query
 *         name: yearMax
 *         schema:
 *           type: integer
 *         description: Ano máximo
 *         example: 2024
 *       - in: query
 *         name: priceMin
 *         schema:
 *           type: number
 *         description: Preço mínimo
 *         example: 50000
 *       - in: query
 *         name: priceMax
 *         schema:
 *           type: number
 *         description: Preço máximo
 *         example: 100000
 *       - in: query
 *         name: fuelType
 *         schema:
 *           type: string
 *           enum: [gasoline, ethanol, diesel, electric, hybrid]
 *         description: Tipo de combustível
 *         example: gasoline
 *       - in: query
 *         name: transmission
 *         schema:
 *           type: string
 *           enum: [manual, automatic]
 *         description: Tipo de transmissão
 *         example: automatic
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [car, motorcycle, truck, van]
 *         description: Categoria do veículo
 *         example: car
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [new, used]
 *         description: Condição do veículo
 *         example: used
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Cidade
 *         example: São Paulo
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Estado
 *         example: SP
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, sold, inactive, pending]
 *         description: Status do veículo
 *         example: active
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Apenas veículos em destaque
 *         example: false
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *         example: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Campo para ordenação
 *         example: price
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordem da classificação
 *         example: desc
 *     responses:
 *       200:
 *         description: Lista de veículos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       400:
 *         description: Parâmetros de filtro inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', validateQuery(vehicleFiltersSchema), getVehicles);

/**
 * @swagger
 * /vehicles/stats:
 *   get:
 *     summary: Obter estatísticas de veículos
 *     description: Retorna estatísticas gerais dos veículos (total, vendidos, preço médio, etc.)
 *     tags: [Vehicles]
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalVehicles:
 *                       type: integer
 *                       example: 150
 *                     activeVehicles:
 *                       type: integer
 *                       example: 120
 *                     soldVehicles:
 *                       type: integer
 *                       example: 25
 *                     inactiveVehicles:
 *                       type: integer
 *                       example: 5
 *                     totalViews:
 *                       type: integer
 *                       example: 2500
 *                     averagePrice:
 *                       type: number
 *                       example: 75000
 *                     topBrands:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           brand:
 *                             type: string
 *                             example: Toyota
 *                           count:
 *                             type: integer
 *                             example: 25
 *                     topCities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           city:
 *                             type: string
 *                             example: São Paulo
 *                           count:
 *                             type: integer
 *                             example: 30
 *                 message:
 *                   type: string
 *                   example: Statistics retrieved successfully
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/stats', getVehicleStats);

/**
 * @swagger
 * /vehicles/{id}:
 *   get:
 *     summary: Obter veículo por ID
 *     description: Retorna os detalhes de um veículo específico
 *     tags: [Vehicles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único do veículo
 *         example: 68ed5b50572e134dd39350e4
 *     responses:
 *       200:
 *         description: Veículo encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *                 message:
 *                   type: string
 *                   example: Vehicle retrieved successfully
 *       404:
 *         description: Veículo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', validateParams(mongoIdSchema), getVehicleById);

// Protected routes
router.use(authenticate);

/**
 * @swagger
 * /vehicles:
 *   post:
 *     summary: Criar novo veículo
 *     description: Cria um novo veículo no sistema. Requer autenticação e permissões de admin, manager ou seller.
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateVehicleRequest'
 *           examples:
 *             carro_usado:
 *               summary: Carro usado
 *               value:
 *                 brand: Toyota
 *                 vehicleModel: Corolla
 *                 year: 2023
 *                 mileage: 15000
 *                 price: 85000
 *                 fuelType: gasoline
 *                 transmission: automatic
 *                 color: Branco
 *                 doors: 4
 *                 category: car
 *                 condition: used
 *                 description: Veículo em excelente estado, único dono, revisões em dia.
 *                 images:
 *                   - https://example.com/corolla1.jpg
 *                   - https://example.com/corolla2.jpg
 *                 features:
 *                   - Ar condicionado
 *                   - Direção hidráulica
 *                   - Vidros elétricos
 *                 location:
 *                   city: São Paulo
 *                   state: SP
 *                   zipCode: 01234-567
 *                 seller:
 *                   id: 68ed57a3572e134dd39350ce
 *                   name: Concessionária Toyota
 *                   phone: (11) 99999-9999
 *                   email: vendas@toyota.com
 *                 isFeatured: false
 *             moto_nova:
 *               summary: Moto nova
 *               value:
 *                 brand: Honda
 *                 vehicleModel: CB 600F
 *                 year: 2024
 *                 mileage: 0
 *                 price: 45000
 *                 fuelType: gasoline
 *                 transmission: manual
 *                 color: Vermelha
 *                 doors: 0
 *                 category: motorcycle
 *                 condition: new
 *                 description: Moto nova, 0km, ainda na concessionária.
 *                 images:
 *                   - https://example.com/cb600f1.jpg
 *                 features:
 *                   - ABS
 *                   - Injeção eletrônica
 *                 location:
 *                   city: Rio de Janeiro
 *                   state: RJ
 *                   zipCode: 20000-000
 *                 seller:
 *                   id: 68ed57a3572e134dd39350ce
 *                   name: Concessionária Honda
 *                   phone: (21) 99999-8888
 *                   email: vendas@honda.com.br
 *                 isFeatured: true
 *     responses:
 *       201:
 *         description: Veículo criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *                 message:
 *                   type: string
 *                   example: Vehicle created successfully
 *       400:
 *         description: Dados inválidos ou erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Usuário não tem permissão para criar veículos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', authorize('admin', 'manager', 'seller'), validate(createVehicleSchema), createVehicle);

/**
 * @swagger
 * /vehicles/{id}:
 *   put:
 *     summary: Atualizar veículo
 *     description: Atualiza um veículo existente. Requer autenticação.
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único do veículo
 *         example: 68ed5b50572e134dd39350e4
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateVehicleRequest'
 *           example:
 *             price: 80000
 *             description: Preço atualizado - veículo em excelente estado
 *             status: active
 *     responses:
 *       200:
 *         description: Veículo atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *                 message:
 *                   type: string
 *                   example: Vehicle updated successfully
 *       400:
 *         description: Dados inválidos ou erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Veículo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', validateParams(mongoIdSchema), validate(updateVehicleSchema), updateVehicle);

/**
 * @swagger
 * /vehicles/{id}:
 *   delete:
 *     summary: Excluir veículo
 *     description: Exclui um veículo do sistema. Requer autenticação.
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único do veículo
 *         example: 68ed5b50572e134dd39350e4
 *     responses:
 *       200:
 *         description: Veículo excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Vehicle deleted successfully
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Veículo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', validateParams(mongoIdSchema), deleteVehicle);

/**
 * @swagger
 * /vehicles/{id}/featured:
 *   patch:
 *     summary: Alternar destaque do veículo
 *     description: Alterna o status de destaque de um veículo. Apenas administradores podem executar esta ação.
 *     tags: [Vehicles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID único do veículo
 *         example: 68ed5b50572e134dd39350e4
 *     responses:
 *       200:
 *         description: Status de destaque alterado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Vehicle'
 *                 message:
 *                   type: string
 *                   example: Featured status toggled successfully
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Apenas administradores podem executar esta ação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Veículo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/featured', authorize('admin'), validateParams(mongoIdSchema), toggleFeatured);

export default router;
