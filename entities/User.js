// User entity
class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.created_at = data.created_at;
  }

  static async me() {
    // TODO: Replace with actual API call
    return new User({
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      created_at: new Date().toISOString()
    });
  }

  static async get(id) {
    // TODO: Replace with actual API call
    return new User({
      id,
      name: 'John Doe',
      email: 'john@example.com',
      created_at: new Date().toISOString()
    });
  }
}

export default User;
