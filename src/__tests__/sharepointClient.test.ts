jest.mock('@microsoft/microsoft-graph-client', () => {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockPatch = jest.fn();
  const mockDelete = jest.fn();
  const api = jest.fn(() => ({ get: mockGet, post: mockPost, patch: mockPatch, delete: mockDelete }));
  return {
    Client: {
      initWithMiddleware: jest.fn(() => ({ api })),
    },
    __esModule: true,
    __mocks__: { mockGet, mockPost, mockPatch, mockDelete, api },
  };
});

const graphClient = require('@microsoft/microsoft-graph-client');
const { mockGet, mockPost, mockPatch, mockDelete, api } = graphClient.__mocks__;

import * as sharepointClient from '../sharepointClient';
import { Client } from '@microsoft/microsoft-graph-client';

const realFields = {
  '@odata.etag': expect.any(String),
  AppAuthorLookupId: expect.any(String),
  AppEditorLookupId: expect.any(String),
  Attachments: expect.any(Boolean),
  AuthorLookupId: expect.any(String),
  ContentType: expect.any(String),
  Created: expect.any(String),
  Edit: expect.any(String),
  EditorLookupId: expect.any(String),
  FolderChildCount: expect.any(String),
  ItemChildCount: expect.any(String),
  LinkTitle: expect.any(String),
  LinkTitleNoMenu: expect.any(String),
  Modified: expect.any(String),
  Name: expect.any(String),
  Title: expect.any(String),
  _ComplianceFlags: expect.any(String),
  _ComplianceTag: expect.any(String),
  _ComplianceTagUserId: expect.any(String),
  _ComplianceTagWrittenTime: expect.any(String),
  _UIVersionString: expect.any(String),
  id: expect.any(String),
};

describe('sharepointClient (unit tests with mocks)', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    mockDelete.mockReset();
    api.mockClear();
  });

  it('should get habits from SharePoint', async () => {
    const fakeItem = {
      id: '1',
      fields: {
        ...realFields,
        id: '1',
        Name: 'Test Habit',
        Title: 'Test Habit',
        LinkTitle: 'Test Habit',
        LinkTitleNoMenu: 'Test Habit',
      },
    };
    mockGet.mockResolvedValueOnce({ value: [fakeItem] });
    const habits = await sharepointClient.getHabits();
    expect(habits[0]).toEqual(expect.objectContaining({
      ...fakeItem.fields,
    }));
    expect(mockGet).toHaveBeenCalled();
  });

  it('should create a habit in SharePoint', async () => {
    const fakeResult = {
      id: '2',
      fields: {
        ...realFields,
        id: '2',
        Name: 'New Habit',
        Title: 'New Habit',
        LinkTitle: 'New Habit',
        LinkTitleNoMenu: 'New Habit',
      },
    };
    mockPost.mockResolvedValueOnce(fakeResult);
    const result = await sharepointClient.createHabit('New Habit');
    expect(result).toEqual(expect.objectContaining({
      fields: expect.objectContaining({
        Name: 'New Habit',
        Title: 'New Habit',
      }),
      id: '2',
    }));
    expect(mockPost).toHaveBeenCalled();
  });

  it('should update a habit in SharePoint', async () => {
    mockGet.mockResolvedValueOnce({ value: [{ name: 'Name' }, { name: 'CompletedDates' }] }); // columns
    mockGet.mockResolvedValueOnce({ fields: { ...realFields, Name: 'Old Habit', id: '4' } }); // existing item
    const fakePatchResult = {
      id: '4',
      fields: {
        ...realFields,
        id: '4',
        Name: 'Updated Habit',
        Title: 'Updated Habit',
        LinkTitle: 'Updated Habit',
        LinkTitleNoMenu: 'Updated Habit',
      },
    };
    mockPatch.mockResolvedValueOnce(fakePatchResult);
    const result = await sharepointClient.updateHabit('4', 'Updated Habit');
    expect(result).toEqual(expect.objectContaining({
      fields: expect.objectContaining({
        Name: 'Updated Habit',
        Title: 'Updated Habit',
        id: '4',
      }),
      id: '4',
    }));
    expect(mockPatch).toHaveBeenCalled();
  });

  it('should delete a habit in SharePoint', async () => {
    mockDelete.mockResolvedValueOnce(undefined);
    const result = await sharepointClient.deleteHabit('4');
    expect(result).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalled();
  });

  it('should handle errors from SharePoint methods', async () => {
    mockGet.mockRejectedValueOnce(new Error('SharePoint error'));
    await expect(sharepointClient.getHabits()).rejects.toThrow('SharePoint error');
  });
});
