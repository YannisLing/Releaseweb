const API_BASE_URL = 'http://localhost:4000/api';

interface EventData {
  practiceId: string;
  exerciseId: string;
  situation: string;
}

interface FeelingData {
  eventId: string;
  name: string;
}

interface UpdateFeelingData {
  released: boolean;
  feelingGood: boolean;
}

interface UpdateEventData {
  situation?: string;
  completed?: boolean;
}

interface PracticeProgressData {
  attemptsMade: number;
  attemptsRequired: number;
  completed: boolean;
}

interface RecordData {
  feelingName?: string;
  emotions?: string[];
  intensity: number;
  note?: string;
}

export const api = {
  async getPracticeProgress(practiceId: string) {
    const response = await fetch(`${API_BASE_URL}/practice-progress/${practiceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch practice progress');
    }
    return response.json();
  },

  async updatePracticeProgress(practiceId: string, data: PracticeProgressData) {
    const response = await fetch(`${API_BASE_URL}/practice-progress/${practiceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update practice progress');
    }
    return response.json();
  },

  async getEvents(practiceId: string) {
    const response = await fetch(`${API_BASE_URL}/events/practice/${practiceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return response.json();
  },

  async createEvent(data: EventData) {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    return response.json();
  },

  async updateEvent(eventId: string, data: UpdateEventData) {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update event');
    }
    return response.json();
  },

  async deleteEvent(eventId: string) {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
    return response.json();
  },

  async getFeelings(eventId: string) {
    const response = await fetch(`${API_BASE_URL}/feelings/event/${eventId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch feelings');
    }
    return response.json();
  },

  async createFeeling(data: FeelingData) {
    const response = await fetch(`${API_BASE_URL}/feelings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create feeling');
    }
    return response.json();
  },

  async updateFeeling(feelingId: string, data: UpdateFeelingData) {
    const response = await fetch(`${API_BASE_URL}/feelings/${feelingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update feeling');
    }
    return response.json();
  },

  async deleteFeeling(feelingId: string) {
    const response = await fetch(`${API_BASE_URL}/feelings/${feelingId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete feeling');
    }
    return response.json();
  },

  async saveRecord(data: RecordData) {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to save record');
    }
    return response.json();
  },

  async getAllRecords() {
    const response = await fetch(`${API_BASE_URL}/records`);
    if (!response.ok) {
      throw new Error('Failed to fetch records');
    }
    return response.json();
  },

  async deleteRecord(id: number) {
    const response = await fetch(`${API_BASE_URL}/records/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete record');
    }
    return response.json();
  },

  async clearAllRecords() {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to clear records');
    }
    return response.json();
  },
};
