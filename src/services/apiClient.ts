import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Using a fallback mock user UUID for development
const USER_ID = '00000000-0000-0000-0000-000000000000';

api.interceptors.request.use(config => {
  config.headers['x-user-id'] = USER_ID;
  return config;
});

export const storyApi = {
  getStories: () => api.get('/stories'),
  createStory: (data: any) => api.post('/stories', data),
  getStory: (id: string) => api.get(`/stories/${id}`),
};

export const panelApi = {
  generatePanel: (storyId: string, prompt: string) => 
    api.post(`/stories/${storyId}/panels/generate`, null, { params: { prompt } }),
  getOptions: (storyId: string, panelId: string) => 
    api.get(`/stories/${storyId}/panels/${panelId}/options`),
  selectOption: (storyId: string, panelId: string, optionId: string) =>
    api.post(`/stories/${storyId}/panels/${panelId}/select/${optionId}`),
  checkTaskStatus: (taskId: string) =>
    api.get(`/stories/task/${taskId}`),
};

export const chatApi = {
  sendMessage: (storyId: string, content: string) =>
    api.post('/chat/', { story_id: storyId, sender: 'user', content }),
  getMessages: (storyId: string) =>
    api.get(`/chat/${storyId}`),
};
