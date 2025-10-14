import { Router } from 'express';
import {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  getSalesStats,
  getSellerSales
} from '@/controllers/salesController';
import { authenticate, authorize } from '@/middleware/auth';
import { validate, validateQuery, validateParams } from '@/middleware/validation';
import {
  createSaleSchema,
  updateSaleSchema,
  salesFiltersSchema,
  mongoIdParamSchema
} from '@/utils/validationSchemas';

const router = Router();

// All sales routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /sales:
 *   post:
 *     summary: Criar nova venda
 *     description: Cria uma nova venda de veículo. O veículo deve estar ativo e disponível.
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSaleRequest'
 *           example:
 *             vehicleId: "68ed79c17fb1e4518e0098b6"
 *             buyer:
 *               name: "João Silva"
 *               email: "joao@email.com"
 *               phone: "11999999999"
 *               document: "12345678900"
 *             salePrice: 50000
 *             paymentMethod: "cash"
 *             notes: "Cliente interessado em financiamento"
 *     responses:
 *       201:
 *         description: Venda criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *                 message:
 *                   type: string
 *                   example: "Sale created successfully"
 *       400:
 *         description: Erro de validação ou veículo indisponível
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *       404:
 *         description: Veículo não encontrado
 *   get:
 *     summary: Listar vendas
 *     description: Lista todas as vendas com filtros opcionais e paginação
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filtrar por status da venda
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [cash, financing, trade-in]
 *         description: Filtrar por método de pagamento
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Itens por página
 *     responses:
 *       200:
 *         description: Lista de vendas retornada com sucesso
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
 *                     sales:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Sale'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         pages:
 *                           type: integer
 *                           example: 3
 *                 message:
 *                   type: string
 *                   example: "Sales retrieved successfully"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 */
router.post('/', validate(createSaleSchema), createSale);
router.get('/', validateQuery(salesFiltersSchema), getSales);

/**
 * @swagger
 * /sales/stats:
 *   get:
 *     summary: Obter estatísticas de vendas
 *     description: Retorna estatísticas gerais das vendas (total, completadas, pendentes, etc.)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SalesStats'
 *                 message:
 *                   type: string
 *                   example: "Sales statistics retrieved successfully"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 */
router.get('/stats', getSalesStats);

/**
 * @swagger
 * /sales/my-sales:
 *   get:
 *     summary: Listar vendas do vendedor
 *     description: Lista todas as vendas realizadas pelo usuário autenticado
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Vendas do vendedor retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Sale'
 *                 message:
 *                   type: string
 *                   example: "Seller sales retrieved successfully"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 */
router.get('/my-sales', getSellerSales);

/**
 * @swagger
 * /sales/{id}:
 *   get:
 *     summary: Buscar venda por ID
 *     description: Retorna os detalhes de uma venda específica
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID da venda (ObjectId do MongoDB)
 *         example: "68ee4b984740ba79c6d9df9c"
 *     responses:
 *       200:
 *         description: Venda encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *                 message:
 *                   type: string
 *                   example: "Sale retrieved successfully"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *       404:
 *         description: Venda não encontrada
 *   put:
 *     summary: Atualizar venda
 *     description: Atualiza os dados de uma venda existente
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID da venda (ObjectId do MongoDB)
 *         example: "68ee4b984740ba79c6d9df9c"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSaleRequest'
 *           example:
 *             status: "completed"
 *             notes: "Venda finalizada com sucesso"
 *     responses:
 *       200:
 *         description: Venda atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Sale'
 *                 message:
 *                   type: string
 *                   example: "Sale updated successfully"
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *       404:
 *         description: Venda não encontrada
 *   delete:
 *     summary: Deletar venda
 *     description: Remove uma venda do sistema (apenas administradores)
 *     tags: [Sales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: ID da venda (ObjectId do MongoDB)
 *         example: "68ee4b984740ba79c6d9df9c"
 *     responses:
 *       200:
 *         description: Venda deletada com sucesso
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
 *                   example: "Sale deleted successfully"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *       403:
 *         description: Acesso negado (apenas administradores)
 *       404:
 *         description: Venda não encontrada
 */
router.get('/:id', validateParams(mongoIdParamSchema), getSaleById);
router.put('/:id', validateParams(mongoIdParamSchema), validate(updateSaleSchema), updateSale);

// Admin only routes
router.delete('/:id', authorize('admin'), validateParams(mongoIdParamSchema), deleteSale);

export default router;
