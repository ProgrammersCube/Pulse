import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Pulse API Documentation',
    version: '1.0.0',
    description: 'API documentation for Pulse Crypto Micro Prediction Game - A blockchain-based micro prediction platform',
    contact: {
      name: 'API Support',
      email: 'support@thepulse.bet'
    },
    license: {
      name: 'ISC',
      url: 'https://thepulse.bet'
    }
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://api.thepulse.bet' 
        : `http://localhost:${process.env.PORT || 5000}`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from login endpoints'
      }
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message description'
          }
        }
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Success message'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          walletAddress: {
            type: 'string',
            example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
          },
          referralCode: {
            type: 'string',
            example: 'ABC123'
          },
          referredBy: {
            type: 'string',
            nullable: true,
            example: 'DEF456'
          },
          tokens: {
            type: 'object',
            properties: {
              BeTyche: { type: 'number', example: 100.5 },
              SOL: { type: 'number', example: 5.2 },
              ETH: { type: 'number', example: 0.1 },
              RADBRO: { type: 'number', example: 50.0 }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Bet: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          userId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          direction: {
            type: 'string',
            enum: ['UP', 'DOWN'],
            example: 'UP'
          },
          amount: {
            type: 'number',
            example: 10.5
          },
          token: {
            type: 'string',
            enum: ['BeTyche', 'SOL', 'ETH', 'RADBRO'],
            example: 'SOL'
          },
          predictionToken: {
            type: 'string',
            enum: ['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK', 'XRP', 'MATIC', 'TON', 'BNB'],
            example: 'BTC'
          },
          duration: {
            type: 'number',
            minimum: 10,
            maximum: 60,
            example: 30
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'MATCHED', 'ACTIVE', 'COMPLETED', 'CANCELLED'],
            example: 'PENDING'
          },
          lockedPrice: {
            type: 'number',
            nullable: true,
            example: 45000.50
          },
          finalPrice: {
            type: 'number',
            nullable: true,
            example: 45100.25
          },
          result: {
            type: 'string',
            enum: ['WIN', 'LOSE', 'PENDING'],
            nullable: true,
            example: 'WIN'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Game: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          player1Bet: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          player2Bet: {
            type: 'string',
            example: '507f1f77bcf86cd799439012'
          },
          predictionToken: {
            type: 'string',
            example: 'BTC'
          },
          lockedPrice: {
            type: 'number',
            example: 45000.50
          },
          finalPrice: {
            type: 'number',
            nullable: true,
            example: 45100.25
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'ACTIVE', 'COMPLETED'],
            example: 'ACTIVE'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Price: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            example: 'BTC'
          },
          price: {
            type: 'number',
            example: 45000.50
          },
          timestamp: {
            type: 'string',
            format: 'date-time'
          },
          source: {
            type: 'string',
            enum: ['PYTH', 'BINANCE'],
            example: 'PYTH'
          }
        }
      },
      Settings: {
        type: 'object',
        properties: {
          minBetAmount: {
            type: 'number',
            example: 0.001
          },
          maxBetAmount: {
            type: 'number',
            example: 1000
          },
          houseFee: {
            type: 'number',
            example: 0.05
          },
          predictionTokens: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: { type: 'string', example: 'BTC' },
                name: { type: 'string', example: 'Bitcoin' },
                pythFeedId: { type: 'string', example: '0x123...' },
                active: { type: 'boolean', example: true },
                isDefault: { type: 'boolean', example: true }
              }
            }
          }
        }
      },
      DashboardStats: {
        type: 'object',
        properties: {
          totalBets: {
            type: 'number',
            example: 150
          },
          totalWins: {
            type: 'number',
            example: 75
          },
          totalLosses: {
            type: 'number',
            example: 75
          },
          winRate: {
            type: 'number',
            example: 50.0
          },
          totalWagered: {
            type: 'number',
            example: 5000.5
          },
          totalWon: {
            type: 'number',
            example: 2500.25
          },
          netProfit: {
            type: 'number',
            example: -2500.25
          }
        }
      },
      AdminDashboardStats: {
        type: 'object',
        properties: {
          totalUsers: {
            type: 'number',
            example: 1000
          },
          totalGames: {
            type: 'number',
            example: 5000
          },
          totalVolume: {
            type: 'number',
            example: 100000
          },
          totalRevenue: {
            type: 'number',
            example: 5000
          },
          activeBets: {
            type: 'number',
            example: 50
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
            example: 'admin@example.com'
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'password123'
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
          token: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          user: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              email: { type: 'string' },
              isAdmin: { type: 'boolean' }
            }
          }
        }
      },
      CreateBetRequest: {
        type: 'object',
        required: ['userId', 'direction', 'amount', 'token', 'duration'],
        properties: {
          userId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          direction: {
            type: 'string',
            enum: ['UP', 'DOWN'],
            example: 'UP'
          },
          amount: {
            type: 'number',
            minimum: 0.001,
            example: 10.5
          },
          token: {
            type: 'string',
            enum: ['BeTyche', 'SOL', 'ETH', 'RADBRO'],
            example: 'SOL'
          },
          predictionToken: {
            type: 'string',
            enum: ['BTC', 'ETH', 'SOL', 'DOGE', 'AVAX', 'LINK', 'XRP', 'MATIC', 'TON', 'BNB'],
            example: 'BTC',
            description: 'Token to predict price movement for'
          },
          duration: {
            type: 'number',
            minimum: 10,
            maximum: 60,
            example: 30
          },
          transactionSignature: {
            type: 'string',
            example: '5j7s8K9...',
            description: 'Solana transaction signature'
          }
        }
      },
      CreatePulseAccountRequest: {
        type: 'object',
        required: ['email', 'password', 'walletAddress'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'password123'
          },
          walletAddress: {
            type: 'string',
            example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
          }
        }
      },
      ResetPasswordOTPRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          }
        }
      },
      VerifyResetOTPRequest: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          otp: {
            type: 'string',
            example: '123456'
          }
        }
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email', 'otp', 'newPassword'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          otp: {
            type: 'string',
            example: '123456'
          },
          newPassword: {
            type: 'string',
            minLength: 6,
            example: 'newpassword123'
          }
        }
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['currentPassword', 'newPassword'],
        properties: {
          currentPassword: {
            type: 'string',
            example: 'oldpassword123'
          },
          newPassword: {
            type: 'string',
            minLength: 6,
            example: 'newpassword123'
          }
        }
      },
      ApplyReferralCodeRequest: {
        type: 'object',
        required: ['referralCode'],
        properties: {
          referralCode: {
            type: 'string',
            example: 'ABC123'
          }
        }
      },
      AddWalletRequest: {
        type: 'object',
        required: ['walletAddress'],
        properties: {
          walletAddress: {
            type: 'string',
            example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
          }
        }
      },
      UpdateTokenBalancesRequest: {
        type: 'object',
        properties: {
          BeTyche: { type: 'number', example: 100.5 },
          SOL: { type: 'number', example: 5.2 },
          ETH: { type: 'number', example: 0.1 },
          RADBRO: { type: 'number', example: 50.0 }
        }
      },
      LockPriceRequest: {
        type: 'object',
        required: ['betId', 'price', 'token'],
        properties: {
          betId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          price: {
            type: 'number',
            example: 45000.50
          },
          token: {
            type: 'string',
            example: 'BTC'
          }
        }
      },
      VerifyPythTokenRequest: {
        type: 'object',
        required: ['feedId'],
        properties: {
          feedId: {
            type: 'string',
            example: '0x1234567890abcdef...'
          },
          symbol: {
            type: 'string',
            example: 'BTC'
          },
          name: {
            type: 'string',
            example: 'Bitcoin'
          }
        }
      },
      UpdateSettingsRequest: {
        type: 'object',
        properties: {
          minBetAmount: { type: 'number', example: 0.001 },
          maxBetAmount: { type: 'number', example: 1000 },
          houseFee: { type: 'number', example: 0.05 },
          predictionTokens: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                symbol: { type: 'string' },
                name: { type: 'string' },
                pythFeedId: { type: 'string' },
                active: { type: 'boolean' },
                isDefault: { type: 'boolean' }
              }
            }
          }
        }
      },
      CreateAmbassadorRequest: {
        type: 'object',
        required: ['email', 'password', 'name', 'walletAddress'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'ambassador@example.com'
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'password123'
          },
          name: {
            type: 'string',
            example: 'John Doe'
          },
          walletAddress: {
            type: 'string',
            example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
          },
          commissionRate: {
            type: 'number',
            example: 0.1
          }
        }
      },
      Ambassador: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          userId: {
            type: 'string',
            example: 'user123'
          },
          username: {
            type: 'string',
            example: 'ambassador1'
          },
          walletAddress: {
            type: 'string',
            example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
          },
          ambassadorCode: {
            type: 'string',
            example: 'AMB123'
          },
          commissionPercentage: {
            type: 'number',
            example: 10
          },
          payoutWalletAddress: {
            type: 'string',
            nullable: true,
            example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
          },
          totalReferrals: {
            type: 'number',
            example: 50
          },
          totalEarnings: {
            type: 'number',
            example: 1000.5
          },
          isActive: {
            type: 'boolean',
            example: true
          },
          bonusTokens: {
            type: 'object',
            properties: {
              BeTyche: { type: 'number', example: 100.5 },
              SOL: { type: 'number', example: 5.2 },
              ETH: { type: 'number', example: 0.1 },
              RADBRO: { type: 'number', example: 50.0 }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      PayoutRequest: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          requestId: {
            type: 'string',
            example: 'REQ123456'
          },
          ambassadorId: {
            type: 'string',
            example: '507f1f77bcf86cd799439011'
          },
          amount: {
            type: 'number',
            example: 500.0
          },
          payoutWalletAddress: {
            type: 'string',
            example: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
          },
          status: {
            type: 'string',
            enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'],
            example: 'pending'
          },
          requestedAt: {
            type: 'string',
            format: 'date-time'
          },
          processedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true
          },
          processedBy: {
            type: 'string',
            nullable: true,
            example: 'admin@example.com'
          },
          adminNotes: {
            type: 'string',
            nullable: true
          },
          transactionHash: {
            type: 'string',
            nullable: true,
            example: '5j7s8K9...'
          },
          rejectionReason: {
            type: 'string',
            nullable: true
          }
        }
      },
      ReferralHistory: {
        type: 'object',
        properties: {
          referralCode: {
            type: 'string',
            example: 'ABC123'
          },
          referredUsers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                walletAddress: { type: 'string' },
                joinedAt: { type: 'string', format: 'date-time' },
                totalBets: { type: 'number' },
                totalWagered: { type: 'number' }
              }
            }
          },
          totalReferrals: {
            type: 'number',
            example: 10
          },
          totalEarnings: {
            type: 'number',
            example: 100.5
          }
        }
      },
      WalletRotation: {
        type: 'object',
        properties: {
          wallets: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                walletId: { type: 'string' },
                publicKey: { type: 'string' },
                isActive: { type: 'boolean' },
                balances: {
                  type: 'object',
                  additionalProperties: { type: 'number' }
                }
              }
            }
          },
          fallbackEnabled: {
            type: 'boolean',
            example: true
          },
          currentActiveWallet: {
            type: 'string',
            nullable: true
          }
        }
      },
      SystemStatus: {
        type: 'object',
        properties: {
          canBet: {
            type: 'boolean',
            example: true
          },
          balances: {
            type: 'object',
            additionalProperties: {
              type: 'number'
            },
            example: {
              BeTyche: 10000,
              SOL: 500,
              ETH: 10,
              RADBRO: 5000
            }
          },
          activeWallet: {
            type: 'string',
            nullable: true
          }
        }
      },
      QueueStatus: {
        type: 'object',
        properties: {
          queueLength: {
            type: 'number',
            example: 5
          },
          activeMatches: {
            type: 'number',
            example: 3
          },
          waitingBets: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Bet'
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Health',
      description: 'Health check endpoints'
    },
    {
      name: 'Wallet',
      description: 'Wallet and user management endpoints'
    },
    {
      name: 'Game',
      description: 'Game and betting endpoints'
    },
    {
      name: 'Price',
      description: 'Price data and oracle endpoints'
    },
    {
      name: 'Admin',
      description: 'Admin management endpoints'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/index.ts']
};

export const swaggerSpec = swaggerJsdoc(options);

