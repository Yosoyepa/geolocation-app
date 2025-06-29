class User {
  final String id;
  final String username;
  final String firstName;
  final String lastName;
  final String email;
  final bool isActive;

  User({
    required this.id,
    required this.username,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.isActive,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      firstName: json['firstName']?.toString() ?? '',
      lastName: json['lastName']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      isActive: json['isActive'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'isActive': isActive,
    };
  }

  // Helper getters for backward compatibility and convenience
  String get name => '$firstName $lastName';
  String get displayName => username;
  String get fullName => '$firstName $lastName';
}
