class User {
  final int? id;
  final String? username;
  final String email;
  final String firstName;
  final String lastName;
  final bool? isActive;
  final String? lastLoginAt;
  final String? createdAt;
  final String? updatedAt;

  User({
    this.id,
    this.username,
    required this.email,
    required this.firstName,
    required this.lastName,
    this.isActive,
    this.lastLoginAt,
    this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      isActive: json['isActive'],
      lastLoginAt: json['lastLoginAt'],
      createdAt: json['createdAt'],
      updatedAt: json['updatedAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'isActive': isActive,
      'lastLoginAt': lastLoginAt,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }

  // Helper getters for backward compatibility and convenience
  String get name => '$firstName $lastName';
  String get displayName => username ?? name;
  String get fullName => '$firstName $lastName';
}
