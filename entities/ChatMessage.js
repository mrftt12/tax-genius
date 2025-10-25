// ChatMessage entity
class ChatMessage {
  constructor(data) {
    this.id = data.id;
    this.tax_return_id = data.tax_return_id;
    this.role = data.role; // 'user' or 'assistant'
    this.message = data.message;
    this.context = data.context;
    this.created_at = data.created_at || new Date().toISOString();
  }

  static async create(data) {
    // TODO: Replace with actual API call
    const message = new ChatMessage({
      id: Date.now().toString(),
      ...data,
    });
    return message;
  }

  static async list(taxReturnId) {
    // TODO: Replace with actual API call
    return [];
  }

  static async get(id) {
    // TODO: Replace with actual API call
    return null;
  }
}

export default ChatMessage;
