// Mock axios for testing
const mockAxiosInstance = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  interceptors: {
    request: { 
      use: jest.fn((successCallback, errorCallback) => {
        mockAxiosInstance._requestSuccessCallback = successCallback;
        mockAxiosInstance._requestErrorCallback = errorCallback;
      })
    },
    response: { 
      use: jest.fn((successCallback, errorCallback) => {
        mockAxiosInstance._responseSuccessCallback = successCallback;
        mockAxiosInstance._responseErrorCallback = errorCallback;
      })
    }
  },
  _requestSuccessCallback: null,
  _requestErrorCallback: null,
  _responseSuccessCallback: null,
  _responseErrorCallback: null
};

const axiosMock = {
  create: jest.fn(() => mockAxiosInstance),
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  mockAxiosInstance: mockAxiosInstance
};

module.exports = axiosMock;
