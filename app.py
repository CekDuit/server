from flask import Flask, jsonify, request

app = Flask(__name__)

# Simpan data pengguna sebagai dictionary
users = {}

# Endpoint untuk mengambil semua pengguna
@app.route('/users', methods=['GET'])
def get_users():
    return jsonify({"users": users})

# Endpoint untuk mengambil satu pengguna berdasarkan ID
@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    user = users.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user})

# Endpoint untuk menambahkan pengguna baru
@app.route('/users', methods=['POST'])
def create_user():
    data = request.json
    user_id = data.get('id')
    name = data.get('name')
    email = data.get('email')

    if not user_id or not name or not email:
        return jsonify({"error": "Invalid input"}), 400

    if user_id in users:
        return jsonify({"error": "User ID already exists"}), 409

    users[user_id] = {"name": name, "email": email}
    return jsonify({"message": "User created successfully"}), 201

# Endpoint untuk memperbarui data pengguna
@app.route('/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    if user_id not in users:
        return jsonify({"error": "User not found"}), 404

    data = request.json
    name = data.get('name')
    email = data.get('email')

    if not name or not email:
        return jsonify({"error": "Invalid input"}), 400

    users[user_id] = {"name": name, "email": email}
    return jsonify({"message": "User updated successfully"})

# Endpoint untuk menghapus pengguna
@app.route('/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    if user_id not in users:
        return jsonify({"error": "User not found"}), 404

    del users[user_id]
    return jsonify({"message": "User deleted successfully"})

if __name__ == '__main__':
    app.run(debug=True)
