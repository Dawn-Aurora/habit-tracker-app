import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Habit Tracker API',
      version: '1.0.0',
      description: 'A comprehensive API for tracking habits, managing completions, and viewing metrics',
      contact: {
        name: 'Habit Tracker Team',
        email: 'contact@habittracker.app'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server'
      }
    ],
    tags: [
      {
        name: 'Habits',
        description: 'Operations related to habit management'
      },
      {
        name: 'Completions',
        description: 'Operations for tracking habit completions'
      },
      {
        name: 'Notes',
        description: 'Operations for adding notes to habits'
      },
      {
        name: 'Metrics',
        description: 'Operations for viewing habit statistics'
      }
    ],
    components: {
      schemas: {
        Habit: {
          type: 'object',
          required: ['name'],
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the habit'
            },
            name: {
              type: 'string',
              description: 'Name of the habit',
              example: 'Morning Exercise'
            },
            completedDates: {
              type: 'array',
              items: {
                type: 'string',
                format: 'date'
              },
              description: 'Array of dates when the habit was completed',
              example: ['2025-06-15', '2025-06-16']
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Tags associated with the habit',
              example: ['health', 'fitness']
            },
            notes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  text: { type: 'string' },
                  date: { type: 'string', format: 'date-time' }
                }
              },
              description: 'Notes associated with the habit'
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Date when the habit was started',
              example: '2025-06-01'
            },
            expectedFrequency: {
              type: 'number',
              description: 'Expected frequency per week',
              example: 7
            }
          }
        },
        HabitInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              description: 'Name of the habit',
              example: 'Morning Exercise'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Tags to associate with the habit',
              example: ['health', 'fitness']
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Date when the habit starts',
              example: '2025-06-01'
            },
            expectedFrequency: {
              type: 'number',
              description: 'Expected frequency per week',
              example: 7
            }
          }
        },
        Note: {
          type: 'object',
          required: ['text'],
          properties: {
            text: {
              type: 'string',
              description: 'The note text',
              example: 'Had a great workout today!'
            },
            date: {
              type: 'string',
              format: 'date-time',
              description: 'When the note was added'
            }
          }
        },
        Metrics: {
          type: 'object',
          properties: {
            totalCompletions: {
              type: 'number',
              description: 'Total number of completions',
              example: 15
            },
            currentStreak: {
              type: 'number',
              description: 'Current consecutive days streak',
              example: 5
            },
            longestStreak: {
              type: 'number',
              description: 'Longest consecutive days streak',
              example: 12
            },
            completionRate: {
              type: 'number',
              description: 'Completion rate as a percentage',
              example: 85.7
            },
            weeklyProgress: {
              type: 'object',
              description: 'Progress for current week'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const specs = swaggerJSDoc(options);

export { specs, swaggerUi };
